#!/usr/bin/env python3
"""Convert Obsidian vault markdown files to MkDocs-compatible format.

Usage:
    python convert_vault.py <vault_dir> <docs_dir>

Example:
    python convert_vault.py ../../dyna-vault/projects/mer/user-education ./docs
"""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

# Mapping from vault filename (without .md) to docs-relative path
FILE_MAP: dict[str, str] = {
    "what-is-designer": "getting-started/what-is-designer.md",
    "what-is-nurture": "getting-started/what-is-nurture.md",
    "prerequisites": "getting-started/prerequisites.md",
    "login-and-setup": "getting-started/login-and-setup.md",
    "what-is-a-workspace": "core-concepts/what-is-a-workspace.md",
    "what-is-an-lld": "core-concepts/what-is-an-lld.md",
    "what-is-an-agent": "core-concepts/what-is-an-agent.md",
    "setting-context": "workspaces/setting-context.md",
    "creating-a-workspace": "workspaces/creating-a-workspace.md",
    "viewing-editing-context": "workspaces/viewing-editing-context.md",
    "workspace-behind-the-scenes": "workspaces/workspace-behind-the-scenes.md",
    "lld-structure-overview": "building-an-lld/lld-structure-overview.md",
    "lld-background": "building-an-lld/lld-background.md",
    "lld-data-models": "building-an-lld/lld-data-models.md",
    "lld-services": "building-an-lld/lld-services.md",
    "lld-flows": "building-an-lld/lld-flows.md",
    "lld-logical-processing-units": "building-an-lld/lld-logical-processing-units.md",
    "lld-test-data": "building-an-lld/lld-test-data.md",
    "lld-test-scenarios": "building-an-lld/lld-test-scenarios.md",
    "lld-sub-agents-overview": "reference/lld-sub-agents-overview.md",
    "lld-template": "reference/lld-template.md",
    "fbp-data-types": "reference/fbp-data-types.md",
    "sample-lld": "reference/sample-lld.md",
    "nurture-overview": "nurture/nurture-overview.md",
    "faq": "faq.md",
}

# Files to skip (Excalidraw diagrams, TOC, rough drafts superseded by polished versions)
SKIP_FILES: set[str] = {
    "designer-flow-diagram",
    "lld-structure-diagram",
    "toc",
    "low-level-design",
    "designer-flow",
}


def strip_frontmatter(content: str) -> str:
    """Remove YAML frontmatter delimited by --- markers."""
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            return content[end + 3 :].lstrip("\n")
    return content


def humanize_title(slug: str) -> str:
    """Convert a slug like 'what-is-an-lld' to 'What is an LLD'."""
    words = slug.replace("-", " ").split()
    acronyms = {"lld", "lpu", "lpus", "faq", "fbp", "oas", "dto", "api"}
    result = []
    for i, word in enumerate(words):
        if word.lower() in acronyms:
            result.append(word.upper())
        elif i == 0:
            result.append(word.capitalize())
        else:
            result.append(word.lower())
    return " ".join(result)


def resolve_link(target_slug: str, source_docs_path: str) -> str | None:
    """Resolve an Obsidian wikilink target to a relative path from the source file's directory."""
    if target_slug not in FILE_MAP:
        return None
    target_path = FILE_MAP[target_slug]
    source_dir = str(Path(source_docs_path).parent)
    if source_dir == ".":
        return target_path
    # Compute relative path from source directory to target
    source_parts = source_dir.split("/")
    target_parts = target_path.split("/")
    # Go up from source dir, then down to target
    ups = len(source_parts)
    return "/".join([".."] * ups + target_parts)


def convert_wikilinks(content: str, source_docs_path: str) -> str:
    """Convert [[target|alias]] and [[target]] to standard markdown links."""

    def replace_wikilink(match: re.Match) -> str:
        inner = match.group(1)

        # Handle section anchors: [[page#Section]]
        anchor = ""
        if "#" in inner:
            inner, section = inner.split("#", 1)
            # MkDocs anchor format: lowercase, spaces to hyphens
            anchor = "#" + section.lower().replace(" ", "-")

        # Handle alias: [[page|display text]]
        if "|" in inner:
            target_slug, display = inner.split("|", 1)
        else:
            target_slug = inner
            display = humanize_title(inner)

        target_slug = target_slug.strip()
        display = display.strip()

        rel_path = resolve_link(target_slug, source_docs_path)
        if rel_path is None:
            # Unknown target — leave as plain text
            return display
        return f"[{display}]({rel_path}{anchor})"

    return re.sub(r"\[\[([^\]]+)\]\]", replace_wikilink, content)


def convert_image_embeds(content: str, source_docs_path: str) -> str:
    """Convert ![[image.png]] to ![image](../images/image.png)."""
    source_dir = str(Path(source_docs_path).parent)
    ups = len(source_dir.split("/")) if source_dir != "." else 0
    images_prefix = "/".join([".."] * ups + ["images"]) if ups > 0 else "images"

    def replace_image(match: re.Match) -> str:
        filename = match.group(1)
        # Replace spaces with hyphens in filenames
        safe_filename = filename.replace(" ", "-")
        alt = Path(filename).stem
        return f"![{alt}]({images_prefix}/{safe_filename})"

    return re.sub(r"!\[\[([^\]]+\.(?:png|jpg|jpeg|svg|gif))\]\]", replace_image, content)


def convert_callouts(content: str) -> str:
    """Convert Obsidian callouts to MkDocs admonitions.

    > [!type] Title       -->  !!! type "Title"
    > [!type]- Title      -->  ??? type "Title"
    > content line        -->      content line
    """
    lines = content.split("\n")
    result: list[str] = []
    in_callout = False

    for line in lines:
        # Check for callout start
        callout_match = re.match(r"^>\s*\[!(\w+)\](-?)\s*(.*)", line)
        if callout_match:
            callout_type = callout_match.group(1).lower()
            collapsible = callout_match.group(2) == "-"
            title = callout_match.group(3).strip()
            prefix = "???" if collapsible else "!!!"
            if title:
                result.append(f'{prefix} {callout_type} "{title}"')
            else:
                result.append(f"{prefix} {callout_type}")
            in_callout = True
            continue

        # Check for callout continuation
        if in_callout:
            if line.startswith("> "):
                # Indent content by 4 spaces for admonition
                result.append(f"    {line[2:]}")
                continue
            if line.strip() == ">" or line.strip() == "":
                # Empty callout line or blank line ends the callout
                if line.strip() == ">":
                    result.append("    ")
                    continue
                in_callout = False
                result.append("")
                continue
            # Non-continuation line — callout ended
            in_callout = False

        result.append(line)

    return "\n".join(result)


def is_excalidraw(content: str) -> bool:
    """Check if file is an Excalidraw drawing."""
    return "excalidraw-plugin: parsed" in content[:500]


def convert_file(vault_path: Path, docs_dir: Path, source_docs_path: str) -> None:
    """Convert a single vault file and write to docs directory."""
    content = vault_path.read_text(encoding="utf-8")

    if is_excalidraw(content):
        return

    content = strip_frontmatter(content)
    content = convert_wikilinks(content, source_docs_path)
    content = convert_image_embeds(content, source_docs_path)
    content = convert_callouts(content)

    output_path = docs_dir / source_docs_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    print(f"  Converted: {vault_path.name} -> {source_docs_path}")


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    vault_dir = Path(sys.argv[1]).resolve()
    docs_dir = Path(sys.argv[2]).resolve()

    if not vault_dir.is_dir():
        print(f"Error: vault directory not found: {vault_dir}")
        sys.exit(1)

    print(f"Source vault: {vault_dir}")
    print(f"Target docs:  {docs_dir}")
    print()

    # Convert markdown files
    converted = 0
    skipped = 0
    for vault_file in sorted(vault_dir.glob("*.md")):
        slug = vault_file.stem
        if slug in SKIP_FILES:
            print(f"  Skipped:   {vault_file.name} (in skip list)")
            skipped += 1
            continue
        if slug not in FILE_MAP:
            print(f"  Skipped:   {vault_file.name} (not in file map)")
            skipped += 1
            continue

        docs_path = FILE_MAP[slug]
        convert_file(vault_file, docs_dir, docs_path)
        converted += 1

    # Copy images (rename spaces to hyphens)
    images_src = vault_dir / "images"
    images_dst = docs_dir / "images"
    if images_src.is_dir():
        images_dst.mkdir(parents=True, exist_ok=True)
        for img in sorted(images_src.iterdir()):
            if img.is_file() and not img.name.startswith("."):
                safe_name = img.name.replace(" ", "-")
                shutil.copy2(img, images_dst / safe_name)
        print(f"\n  Copied images/ ({len(list(images_src.iterdir()))} files)")

    # Copy files directory
    files_src = vault_dir / "files"
    files_dst = docs_dir / "files"
    if files_src.is_dir():
        files_dst.mkdir(parents=True, exist_ok=True)
        for f in sorted(files_src.iterdir()):
            if f.is_file() and not f.name.startswith("."):
                shutil.copy2(f, files_dst / f.name)
        print(f"  Copied files/ ({len(list(files_src.iterdir()))} files)")

    print(f"\nDone: {converted} converted, {skipped} skipped")


if __name__ == "__main__":
    main()
