# Concept Note — Flow data → graph DB with a custom ontology

**Status:** Exploration / feasibility only. No spec, no implementation committed.
**Date:** 2026-06-27
**Pick up:** tomorrow.
**Target graph model (decided):** Labeled Property Graph (Neo4j / Memgraph / Kuzu family), Cypher.

---

## 1. Why this note exists

We were analysing the `Flow/data/` files and the conversation moved toward a longer-term
goal: **move the flow information into a graph database under a custom ontology.** This note
captures everything discussed so we can resume cold tomorrow.

Sequence of the discussion:
1. Derived a complete schema for the `data/` files (3 file types — see §2).
2. Wrote JSON Schemas for the two YAML file types.
3. Asked "can the `.mmd` be generated from the YAML?" → no, with caveats (§3).
4. Pivoted to the graph-DB goal; did a **feasibility/mapping** pass for an LPG (§4–§6).
5. Built an HTML preview of the `:DataItem` model against `fbp_idp_product` (§7).

---

## 2. The current data model (recap)

One parser is the single source of truth: `backend/flow_store.py`. The browser never parses
raw data. Three file types per flow `<id>`:

| File | Role | Authority |
|------|------|-----------|
| `data/<id>.flow.mmd` | Mermaid topology — nodes (`id["Label"]:::class`) + edges | **node existence, type, title, all edges** |
| `data/<id>.cards.yaml` | Per-node content (`owner/team/sla/desc/inputs/outputs/steps/documents/links/pos/subflow`) | everything *about* a node |
| `data/index.yaml` | Registry — navigator order, `group:`, nested `children:` | flow registry / hierarchy |

Node classes → `(type, term)`: `system|manual|decision` → type with `term=None`;
`start|end|declined` → `type="terminal"` with `term` set. Edges: `-->` (normal), `-->|Label|`
(labelled), `--x` / `-- Label --x` (reject → drops to the declined terminal).

**Artifacts produced this session (already in repo):**
- `data/cards.schema.json` — JSON Schema (Draft 2020-12) for `*.cards.yaml`. Lenient on
  unknown keys; still enforces: `pos` needs both `col`+`lane`, documents need a name, links
  need a url, ids match `^[A-Za-z0-9_]+$`. Validated green against all 6 cards files.
- `data/index.schema.json` — JSON Schema for `index.yaml`. Validated green.
- `docs/fbp_idp_dataitem-preview.html` — the visual preview from §7 (persisted from scratchpad).

---

## 3. Can `.mmd` be generated from the YAML? — No (as-is)

The cards YAML holds **no topology** and is missing two node attributes. Missing for `.mmd`
generation: node **title/label**, node **type/class**, and **all edges**. `inputs`/`outputs`
are free-text, not references to node ids, so they can't be resolved into a graph.

To invert (YAML as source, emit `.mmd`) you'd extend each card with `title`, `type`, and a
`next:` edge list — a deliberate architecture change making `.mmd` a build artifact. **Not chosen**;
parked. (Connects to the graph goal: a graph-native source could generate both `.mmd` and the load.)

---

## 4. Feasibility verdict (LPG)

- **Topology maps ~1:1.** A flowchart *is* an LPG (nodes + typed/labelled edges).
- **Cards add properties + a few natural satellite entities** (Team, Document, Reference).
- **The valuable + hard part:** turning `inputs`/`outputs` into a real data-flow graph
  (`:DataItem` nodes). Currently free text → needs normalization / a controlled vocabulary.
- **One blocking gotcha:** node ids are unique only *within* a flow (`nurture`, `declined`,
  `manual_review`, `d_*` are reused). A global graph needs a composite key
  `uid = "<flow_id>:<node_id>"`.

Net: highly feasible; the effort/value is concentrated in the data-flow layer, not the parts
that map trivially.

---

## 5. Proposed LPG ontology (starting point)

**Node labels**

| Label | Source | Key properties |
|-------|--------|----------------|
| `:Flow` | each `<id>` | `id`, `name`, `subtitle` |
| `:Step` (+ `:System`/`:Manual`/`:Decision`/`:Terminal`) | `.mmd` nodes | `uid`, `title`, `type`, `term`, `sla`, `desc`, `col`, `lane`, `pinned` |
| `:Team` | card `team` | `name` |
| `:Actor` | card `owner` | `name` (system vs human-role vs agent — needs classification) |
| `:Document` | `documents[]` | `name`, `format`, `status`, `link` |
| `:Reference` | `links[]` | `label`, `url` |
| `:DataItem` *(optional, high-value)* | `inputs[]`/`outputs[]` | `name` |

**Relationship types**

| Rel | From → To | Props | Source |
|-----|-----------|-------|--------|
| `:HAS_STEP` | Flow → Step | | membership |
| `:NEXT` | Step → Step | `label`, `reject:bool` | `.mmd` edges |
| `:OWNED_BY` | Step → Actor | | `owner` |
| `:BY_TEAM` | Step → Team | | `team` |
| `:PRODUCES` | Step → Document | | `documents[]` |
| `:REFERENCES` | Step → Reference | | `links[]` |
| `:EXPANDS_TO` | Step → Flow | | `subflow` / index `children` |
| `:EMITS` / `:CONSUMES` | Step ↔ DataItem | | `outputs[]` / `inputs[]` |

`steps[]` (sub-actions) → string-list property unless cross-step querying is wanted (then `:Action`).

---

## 6. Gaps / decisions to resolve

**Gaps (data not graph-ready):**
1. **Composite node identity** — must adopt `<flow_id>:<node_id>` before any load. (blocker)
2. **`inputs`/`outputs` are free text** — `:DataItem` dedup relies on string equality; e.g.
   output `"Candidate components"` vs document `"Candidate Component List"` will NOT merge.
   Needs a controlled vocabulary / alias map.
3. **`owner` conflates kinds** — system / human-role / AI-agent not distinguished in data.
4. **Sub-flow handoff is implicit** — child terminals (`kyc_start`/`kyc_pass`) ↔ parent step
   (`kyc`) only described in prose; needs explicit weld (`:EXPANDS_TO` + `:RETURNS_TO`?).
5. **`sla` unnormalized** (`"< 2 min"`, `"2 business days"`, `"—"`) — label only, not queryable.

**Open design decisions:**
- DataItem as **nodes** (lineage graph, needs vocab curation) vs **properties** (lossless, flat).
- Decisions as **edge labels** vs **reified `:Decision` nodes** (to attach rules later).
- Actor taxonomy: flat `:Actor` vs `:System`/`:HumanRole`/`:Agent`.
- **Source of truth:** graph as a *derived projection* of `data/` (exporter; files stay
  authoritative) vs graph *becomes* the source (would also generate `.mmd` — see §3).

---

## 7. The `:DataItem` preview (built)

`docs/fbp_idp_dataitem-preview.html` — open in a browser (needs internet; uses Cytoscape +
dagre from CDN). Derives `:DataItem` nodes from `fbp_idp_product.cards.yaml` `inputs`/`outputs`
(dedup by name, as an exporter would) and renders `Step —EMITS→ DataItem —CONSUMES→ Step`.
Toggle between **current (steps only)** and **proposed (with DataItems)**.

What it demonstrated:
- **Fan-out made visible:** `Knowledge graph API` → 3 consumers (AMA, Dexter, Component Docs).
- **External inputs** (no producer) and **terminal outputs** (no consumer) auto-classified.
- **⚑ Data-quality find:** `Candidate components` is produced mid-pipeline by `solution_mapper`
  but never consumed — a likely authoring gap the graph model surfaces automatically.
- Confirmed the string-matching caveat is real (the `Candidate components` vs
  `Candidate Component List` mismatch).

---

## 8. Pick up tomorrow — candidate next steps

Nothing below is committed; choose direction first.

- [ ] **Data-quality pass across ALL flows** — run the §7 derivation over every flow to list
      every external input, terminal output, fan-out, and dangling/unmatched data item.
- [ ] **Decide the open questions in §6** (esp. DataItem nodes-vs-properties, and source-of-truth).
- [ ] **Draft the controlled vocabulary** for DataItems (+ alias map) if going the node route.
- [ ] If green-lit to build: move from feasibility → **design spec** (brainstorming →
      writing-plans), covering the exporter (`flow_store` → Cypher/`LOAD CSV`) and the `uid` scheme.

**Mode reminder:** we are in *feasibility/mapping only*. Do not jump to a spec or code without
an explicit go-ahead.
