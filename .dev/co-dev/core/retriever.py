"""
retriever.py — Hybrid context retrieval: Vector (sqlite-vec) + Keyword (FTS5/BM25)
Feedback applied: Hybrid Search + domain_filter + RRF merge
"""
import sqlite3
import sqlite_vec
import json
import os
from pathlib import Path


class ContextRetriever:
    """
    Hybrid retrieval using SQLite + sqlite-vec + FTS5.

    retrieve(query_text, query_embedding, top_k, domain_filter)
      → BM25(query_text) + VectorKNN(query_embedding)
      → RRF merge
      → domain_filter
      → top_k chunks
    """

    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

        self.conn = sqlite3.connect(self.db_path)
        self.conn.enable_load_extension(True)
        sqlite_vec.load(self.conn)
        self.conn.enable_load_extension(False)

        self._init_db()

    def _init_db(self):
        """Initialize content table + FTS5 table + vec0 table."""
        # Main content store
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS chunks (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT,
                tag      TEXT,
                content  TEXT,
                domain   TEXT DEFAULT '',
                metadata TEXT DEFAULT '{}'
            )
        """)

        # FTS5 full-text index for BM25 keyword search
        self.conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts
            USING fts5(content, tag, domain, content='chunks', content_rowid='id')
        """)

        # Vector index (1024 dims — bge-m3 via Ollama)
        self.conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS vec_chunks
            USING vec0(chunk_id INTEGER PRIMARY KEY, embedding FLOAT[1024])
        """)

        self.conn.commit()

    # ── Write ───────────────────────────────────────────────────

    def clear_index(self):
        """Wipe all data (full re-index)."""
        self.conn.execute("DELETE FROM vec_chunks")
        self.conn.execute("DELETE FROM chunks_fts")
        self.conn.execute("DELETE FROM chunks")
        self.conn.commit()

    def insert_chunk(self, file_path: str, tag: str, content: str,
                     embedding: list, metadata: dict = None, domain: str = ""):
        """Insert one chunk with embedding + FTS index."""
        cur = self.conn.cursor()

        # Insert content row
        cur.execute(
            "INSERT INTO chunks (file_path, tag, content, domain, metadata) VALUES (?,?,?,?,?)",
            (file_path, tag, content, domain, json.dumps(metadata or {}))
        )
        chunk_id = cur.lastrowid

        # Insert into FTS5
        cur.execute(
            "INSERT INTO chunks_fts (rowid, content, tag, domain) VALUES (?,?,?,?)",
            (chunk_id, content, tag, domain)
        )

        # Insert vector
        cur.execute(
            "INSERT INTO vec_chunks (chunk_id, embedding) VALUES (?,?)",
            (chunk_id, sqlite_vec.serialize_float32(embedding))
        )

        self.conn.commit()

    # ── Search ──────────────────────────────────────────────────

    def retrieve(self, query_text: str, query_embedding: list,
                 top_k: int = 8, domain_filter: list = None) -> list[dict]:
        """
        Hybrid search: BM25 + Vector → RRF merge → domain filter.

        Args:
            query_text:       raw text for BM25 keyword search
            query_embedding:  embedded vector for KNN search
            top_k:            number of results to return
            domain_filter:    list of domains to restrict results (e.g. ["crm","pos"])
                              None = no filter
        """
        k = top_k * 3  # fetch more before RRF trim

        bm25_hits  = self._bm25_search(query_text, k)
        vec_hits   = self._vector_search(query_embedding, k)
        merged     = self._rrf_merge(bm25_hits, vec_hits)

        if domain_filter:
            merged = [h for h in merged if h.get("domain", "") in domain_filter
                      or h.get("domain", "") == "shared"]

        return merged[:top_k]

    def _bm25_search(self, query_text: str, top_k: int) -> list[dict]:
        """FTS5 BM25 keyword search — exact model names, code tokens."""
        # Sanitize query for FTS5 (escape special chars)
        safe_query = query_text.replace('"', '""').replace("'", "''")
        try:
            rows = self.conn.execute("""
                SELECT c.id, c.file_path, c.tag, c.content, c.domain, c.metadata,
                       bm25(chunks_fts) AS score
                FROM chunks_fts
                JOIN chunks c ON c.id = chunks_fts.rowid
                WHERE chunks_fts MATCH ?
                ORDER BY score
                LIMIT ?
            """, (safe_query, top_k)).fetchall()
            return [self._row_to_dict(r, score=r[6], source="bm25") for r in rows]
        except Exception:
            # FTS5 MATCH fails on some query syntax — return empty gracefully
            return []

    def _vector_search(self, query_embedding: list, top_k: int) -> list[dict]:
        """KNN vector similarity search."""
        try:
            rows = self.conn.execute("""
                SELECT c.id, c.file_path, c.tag, c.content, c.domain, c.metadata,
                       v.distance
                FROM vec_chunks v
                JOIN chunks c ON c.id = v.chunk_id
                WHERE embedding MATCH ?
                AND k = ?
                ORDER BY distance
            """, (sqlite_vec.serialize_float32(query_embedding), top_k)).fetchall()
            return [self._row_to_dict(r, score=r[6], source="vec") for r in rows]
        except Exception as e:
            print(f"[RETR] Vector search error: {e}")
            return []

    def _rrf_merge(self, bm25_hits: list, vec_hits: list, k: int = 60) -> list[dict]:
        """
        Reciprocal Rank Fusion — combine two ranked lists.
        RRF score = Σ 1/(k + rank_i)
        Higher score = better.
        """
        scores: dict[int, float] = {}
        combined: dict[int, dict] = {}

        for rank, hit in enumerate(bm25_hits):
            cid = hit["id"]
            scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)
            combined[cid] = hit

        for rank, hit in enumerate(vec_hits):
            cid = hit["id"]
            scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)
            combined[cid] = hit

        ranked = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)
        return [combined[cid] for cid in ranked]

    def _row_to_dict(self, row, score=None, source="") -> dict:
        return {
            "id":        row[0],
            "file_path": row[1],
            "tag":       row[2],
            "content":   row[3],
            "domain":    row[4],
            "metadata":  json.loads(row[5]),
            "score":     score,
            "source":    source,
        }

    # ── Legacy ─────────────────────────────────────────────────

    def search(self, query_embedding: list, top_k: int = 5) -> list[dict]:
        """Vector-only search — kept for backwards compatibility.
        Note: embedding must be 1024 dims (bge-m3 via Ollama).
        """
        return self._vector_search(query_embedding, top_k)

    def close(self):
        if self.conn:
            self.conn.close()
