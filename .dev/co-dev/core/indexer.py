"""
indexer.py — Crawl project docs + schema slices → embed via Ollama → store in sqlite-vec

Requirements: Ollama running locally with bge-m3 pulled
  ollama pull bge-m3

Usage:
  python .dev/co-dev/cli.py index
"""
import os
import re
from pathlib import Path

import ollama

from .retriever import ContextRetriever

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.getenv("CODEV_EMBED_MODEL", "bge-m3")
EMBED_DIMS  = 1024   # bge-m3 output dimensions


class Indexer:
    """
    Crawl docs/schema-slices, gotchas, specs, CLAUDE.md
    → chunk → embed via Ollama → store in vector.db
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        db_path = str(self.project_root / ".dev/co-dev/data/vector.db")
        self.retriever = ContextRetriever(db_path)

    # ── Embedding ───────────────────────────────────────────────

    def _client(self) -> ollama.Client:
        """Ollama client — respects OLLAMA_HOST env var."""
        return ollama.Client(host=OLLAMA_HOST)

    def embed(self, text: str) -> list:
        """Embed text via Ollama SDK — local GPU, no API key."""
        try:
            resp = self._client().embeddings(model=EMBED_MODEL, prompt=text)
            return resp["embedding"]
        except ollama.ResponseError as e:
            print(f"[INDEX] Ollama error: {e.error}")
            return [0.0] * EMBED_DIMS
        except Exception as e:
            print(f"[INDEX] Embed failed: {e} — is Ollama running?")
            return [0.0] * EMBED_DIMS

    def check_ollama(self) -> bool:
        """Verify Ollama is reachable and EMBED_MODEL is available."""
        try:
            models = [m["model"] for m in self._client().list()["models"]]
            has_model = any(EMBED_MODEL in m for m in models)
            if not has_model:
                print(f"[INDEX] Model '{EMBED_MODEL}' not found.")
                print(f"[INDEX] Run: ollama pull {EMBED_MODEL}")
            return has_model
        except Exception:
            print(f"[INDEX] Cannot reach Ollama at {OLLAMA_HOST}")
            print(f"[INDEX] Run: ollama serve")
            return False

    # ── Indexing ────────────────────────────────────────────────

    def index_all(self):
        """Full re-index of the knowledge base."""
        if not self.check_ollama():
            print("[INDEX] Aborted — Ollama not ready.")
            return

        print(f"[INDEX] Starting full re-index (model: {EMBED_MODEL}, dims: {EMBED_DIMS})")
        self.retriever.clear_index()

        total = 0
        total += self._index_schema_slices()
        total += self._index_gotchas()
        total += self._index_specs()
        total += self._index_claude_md()

        print(f"[INDEX] Done — {total} chunks indexed")

    def _index_schema_slices(self) -> int:
        slices_dir = self.project_root / "docs/schema-slices"
        if not slices_dir.exists():
            return 0

        count = 0
        for f in sorted(slices_dir.glob("*.md")):
            domain = f.stem  # e.g. "inbox", "crm", "pos"
            content = f.read_text(encoding="utf-8")

            # 1 Prisma model block = 1 chunk
            blocks = re.findall(
                r'```prisma\n(model\s+\w+\s+\{[^`]*?\})\n```',
                content, re.DOTALL
            )
            for block in blocks:
                m = re.search(r'model\s+(\w+)', block)
                model_name = m.group(1) if m else "Unknown"
                text = f"Prisma Model {model_name} in domain {domain}:\n{block}"
                emb = self.embed(text)
                self.retriever.insert_chunk(
                    file_path=str(f.relative_to(self.project_root)),
                    tag="SCHEMA",
                    content=block,
                    embedding=emb,
                    domain=domain,
                    metadata={"model": model_name, "domain": domain},
                )
                count += 1

            # Also index Reference Stubs as separate chunks
            stubs = re.findall(
                r'```prisma\n(// \w+ \(.*?\) — stub[^`]*?)\n```',
                content, re.DOTALL
            )
            for stub in stubs:
                emb = self.embed(stub)
                self.retriever.insert_chunk(
                    file_path=str(f.relative_to(self.project_root)),
                    tag="SCHEMA_STUB",
                    content=stub,
                    embedding=emb,
                    domain=domain,
                    metadata={"domain": domain, "type": "stub"},
                )
                count += 1

        print(f"[INDEX]   schema-slices: {count} chunks")
        return count

    def _index_gotchas(self) -> int:
        gotchas_dir = self.project_root / "docs/gotchas"
        if not gotchas_dir.exists():
            return 0

        count = 0
        for f in sorted(gotchas_dir.glob("*.md")):
            if f.name == "README.md":
                continue
            content = f.read_text(encoding="utf-8")
            sections = re.split(r'\n(?=##+ )', content)
            for section in sections:
                if len(section.strip()) < 50:
                    continue
                emb = self.embed(section)
                self.retriever.insert_chunk(
                    file_path=str(f.relative_to(self.project_root)),
                    tag="GOTCHA",
                    content=section,
                    embedding=emb,
                    domain="shared",  # gotchas apply cross-domain
                    metadata={"file": f.stem},
                )
                count += 1

        print(f"[INDEX]   gotchas: {count} chunks")
        return count

    def _index_specs(self) -> int:
        specs_dir = self.project_root / "docs/product/specs"
        if not specs_dir.exists():
            return 0

        count = 0
        for f in sorted(specs_dir.glob("*.md")):
            content = f.read_text(encoding="utf-8")
            sections = re.split(r'\n(?=##+ )', content)
            for section in sections:
                if len(section.strip()) < 100:
                    continue
                emb = self.embed(section)
                self.retriever.insert_chunk(
                    file_path=str(f.relative_to(self.project_root)),
                    tag="SPEC",
                    content=section,
                    embedding=emb,
                    domain="shared",
                    metadata={"file": f.stem},
                )
                count += 1

        print(f"[INDEX]   specs: {count} chunks")
        return count

    def _index_claude_md(self) -> int:
        claude_md = self.project_root / "CLAUDE.md"
        if not claude_md.exists():
            return 0

        count = 0
        content = claude_md.read_text(encoding="utf-8")
        sections = re.split(r'\n(?=## )', content)
        for section in sections:
            if len(section.strip()) < 50:
                continue
            emb = self.embed(section)
            self.retriever.insert_chunk(
                file_path="CLAUDE.md",
                tag="GUIDE",
                content=section,
                embedding=emb,
                domain="shared",
                metadata={"file": "CLAUDE.md"},
            )
            count += 1

        print(f"[INDEX]   CLAUDE.md: {count} chunks")
        return count
