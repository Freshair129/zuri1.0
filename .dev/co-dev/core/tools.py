import os
import json
from pathlib import Path
from typing import Optional, List, Dict
from .retriever import ContextRetriever
from .indexer import Indexer

class ProjectTools:
    """Read-only discovery tools for Co-Dev agents."""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        db_path = str(self.project_root / ".dev/co-dev/data/vector.db")
        self.retriever = ContextRetriever(db_path)
        self._indexer = None  # Lazy-loaded

    @property
    def indexer(self):
        if self._indexer is None:
            self._indexer = Indexer(str(self.project_root))
        return self._indexer

    def search_schema(self, query: str) -> str:
        """
        Search for database schema definitions (Prisma models).
        Returns a summary of relevant schema chunks.
        """
        emb = self.indexer.embed(query)
        hits = self.retriever.retrieve(query, emb, top_k=5, domain_filter=None)
        # Prioritize Schema chunks
        schema_hits = [h for h in hits if h["tag"] == "SCHEMA"]
        if not schema_hits:
            schema_hits = hits[:3]  # fallback
            
        res = []
        for h in schema_hits:
            res.append(f"Source: {h['file_path']} (Domain: {h.get('domain','')})\n{h['content']}\n---\n")
        return "\n".join(res) if res else "No relevant schema found."

    def search_docs(self, query: str) -> str:
        """
        Search across documentation, specs, and gotchas.
        Returns relevant sections related to the query.
        """
        emb = self.indexer.embed(query)
        hits = self.retriever.retrieve(query, emb, top_k=5, domain_filter=None)
        doc_hits = [h for h in hits if h["tag"] != "SCHEMA"]
        
        res = []
        for h in doc_hits:
            res.append(f"Source: {h['file_path']} ({h['tag']})\n{h['content']}\n---\n")
        return "\n".join(res) if res else "No relevant documentation found."

    def read_file(self, path: str) -> str:
        """
        Read the content of a specific project file.
        Use for checking repository implementation, route files, or config.
        """
        full_path = (self.project_root / path).resolve()
        # Security: prevent reading outside root
        if not str(full_path).startswith(str(self.project_root.resolve())):
            return "[ERROR] Access Denied: Path outside project root."
        
        if not full_path.exists():
            # Try to see if it's already a relative path inside src
            if not path.startswith("src/"):
                alt_path = (self.project_root / "src" / path).resolve()
                if alt_path.exists():
                    full_path = alt_path
                else:
                    return f"[ERROR] File not found: {path}"
            else:
                return f"[ERROR] File not found: {path}"
        
        try:
            content = full_path.read_text(encoding="utf-8")
            if len(content) > 15000:
                return content[:15000] + "\n... (truncated)"
            return content
        except Exception as e:
            return f"[ERROR] Failed to read {path}: {e}"

    def list_files(self, directory: str = ".") -> str:
        """List files in a specific directory to discover project structure."""
        dir_path = (self.project_root / directory).resolve()
        if not str(dir_path).startswith(str(self.project_root.resolve())):
            return "[ERROR] Access Denied."
        
        if not dir_path.exists():
             return f"[ERROR] Directory not found: {directory}"
        
        try:
            files = [str(f.relative_to(self.project_root)) for f in dir_path.glob("*")]
            return "\n".join(files)
        except Exception as e:
            return f"[ERROR] {e}"

    def get_adr(self, adr_number: int) -> str:
        """Retrieve an Architecture Decision Record (ADR) by its number (e.g., 57, 68)."""
        adr_dir = self.project_root / "docs/decisions/adrs"
        if not adr_dir.exists():
            return "[ERROR] ADR directory not found at docs/decisions/adrs/"

        pattern = f"ADR-{adr_number:03d}-*.md"
        matches = list(adr_dir.glob(pattern))
        if not matches:
            matches = list(adr_dir.glob(f"ADR-{adr_number}-*.md"))

        if matches:
            return self.read_file(str(matches[0].relative_to(self.project_root)))
        return f"[ERROR] ADR {adr_number} not found. Available: {[f.name for f in adr_dir.glob('ADR-*.md')]}"

    def search_entire_schema(self, query: str) -> str:
        """
        Search the entire schema across ALL domains — escape hatch when domain-scoped search misses.
        Use when you suspect a model lives in an unexpected domain, or when cross-domain FK resolution fails.
        Returns top schema chunks regardless of domain.
        """
        emb = self.indexer.embed(query)
        # No domain_filter = search all domains
        hits = self.retriever.retrieve(query, emb, top_k=8, domain_filter=None)
        schema_hits = [h for h in hits if h["tag"] in ("SCHEMA", "SCHEMA_STUB")]

        if not schema_hits:
            schema_hits = hits[:5]

        res = []
        for h in schema_hits:
            res.append(
                f"Source: {h['file_path']} (Domain: {h.get('domain','?')}, via={h.get('source','?')})\n"
                f"{h['content']}\n---\n"
            )
        return "\n".join(res) if res else "No schema chunks found across entire project."

# --- SDK Mapping Definitions ---

def get_tool_definitions():
    """Return function schema for SDKs."""
    return [
        {
            "name": "search_schema",
            "description": "Search for database schema definitions (Prisma models). Returns a summary of relevant schema chunks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Keyword or description to search for (e.g. 'Customer model', 'pos transactions')"}
                },
                "required": ["query"]
            }
        },
        {
            "name": "search_docs",
            "description": "Search across documentation, specs, and gotchas. Returns relevant sections related to the query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Subject to search for (e.g. 'tenantId isolation', 'background job timeout')"}
                },
                "required": ["query"]
            }
        },
        {
            "name": "read_file",
            "description": "Read the content of a specific project file. Use for checking implementation details.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Path to file relative to project root (e.g. 'src/lib/repositories/customerRepo.js')"}
                },
                "required": ["path"]
            }
        },
        {
            "name": "list_files",
            "description": "List files in a specific directory to discover project structure.",
            "parameters": {
                "type": "object",
                "properties": {
                    "directory": {"type": "string", "description": "Relative directory path (default is project root '.')"}
                }
            }
        },
        {
            "name": "get_adr",
            "description": "Retrieve an Architecture Decision Record (ADR) by its number (e.g. 57, 60, 68).",
            "parameters": {
                "type": "object",
                "properties": {
                    "adr_number": {"type": "integer", "description": "The ADR sequence number (e.g. 57 for ADR-057)"}
                },
                "required": ["adr_number"]
            }
        },
        {
            "name": "search_entire_schema",
            "description": (
                "Escape hatch: search schema across ALL domains with no domain filter. "
                "Use when domain-scoped search returns wrong results, or when you need a model "
                "that may live in an unexpected domain (e.g. Customer is in crm, not inbox)."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Model name or description to search for (e.g. 'StockMovement', 'customer loyalty tier')"}
                },
                "required": ["query"]
            }
        }
    ]

class ToolExecutor:
    """Bridges LLM tool calls to ProjectTools methods."""
    def __init__(self, project_root: str):
        self.tools = ProjectTools(project_root)
        self.mapping = {
            "search_schema": self.tools.search_schema,
            "search_docs": self.tools.search_docs,
            "read_file": self.tools.read_file,
            "list_files": self.tools.list_files,
            "get_adr": self.tools.get_adr,
            "search_entire_schema": self.tools.search_entire_schema,
        }

    def execute(self, name: str, args: dict) -> str:
        func = self.mapping.get(name)
        if not func:
            return f"[ERROR] Tool {name} not found."
        try:
            # Handle optional args manually or via **args
            return str(func(**args))
        except Exception as e:
            return f"[ERROR] Execution of {name} failed: {e}"
