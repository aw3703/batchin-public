#!/usr/bin/env python3
"""
BatchIn Public Compliance & Zero-GPU Scan
Ensures that public repository code and documentation strictly comply with
US Export Control regulations, OFAC sanctions, and company policy prohibiting
physical GPU hardware reselling or chip-specific references.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Root directory of the public repository
REPO_ROOT = Path(__file__).resolve().parent.parent

# Terms that must NEVER appear in public code, docs, or configs
PROHIBITED_TERMS = [
    r"\bgpu\b",
    r"\bgpus\b",
    r"\bgpu-hour\b",
    r"\bgpu-leasing\b",
    r"\bh100\b",
    r"\ba100\b",
    r"\bh800\b",
    r"\ba800\b",
    r"\bb200\b",
    r"\bh20\b",
    r"\bl40\b",
    r"\brtx\b",
    r"\bnvidia\b",
    r"\bgeforce\b",
    r"\bcuda\b",
    r"\btensorrt\b",
    r"\bnvlink\b",
    r"\bsanctions\s+evasion\b",
    r"\bchip\s+smuggling\b",
    r"\bentity\s+list\s+evasion\b",
]

# Paths/files to ignore (like git directory, build output, lockfiles, or this script itself)
EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".pytest_cache",
    ".tmp",
    "__pycache__",
    ".venv",
}
EXCLUDE_FILES = {
    "scan_compliance.py",
    "package-lock.json",
    "pnpm-lock.yaml",
}


def scan_file(file_path: Path) -> list[tuple[int, str, str]]:
    violations = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return violations

    lines = content.splitlines()
    for line_idx, line in enumerate(lines, start=1):
        for pattern in PROHIBITED_TERMS:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                violations.append((line_idx, match.group(0), line.strip()))
    return violations


def main() -> int:
    total_violations = 0
    scanned_files = 0

    for path in REPO_ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        if path.name in EXCLUDE_FILES:
            continue

        scanned_files += 1
        violations = scan_file(path)
        if violations:
            rel_path = path.relative_to(REPO_ROOT)
            print(f"\033[91m[COMPLIANCE VIOLATION]\033[0m {rel_path}:")
            for line_no, term, line in violations:
                print(f"  Line {line_no}: Matched '{term}' -> \"{line}\"")
                total_violations += 1

    if total_violations > 0:
        print(f"\n\033[91mScan failed:\033[0m Found {total_violations} compliance/zero-GPU violation(s) across {scanned_files} files.")
        return 1

    print(f"\033[92m[COMPLIANCE PASS]\033[0m {scanned_files} files scanned. 0 GPU or export-controlled terms detected.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
