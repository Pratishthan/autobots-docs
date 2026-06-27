"""
app.py — Chainlit entrypoint for the Flow Assistant.

The Flow web app connects as a `@chainlit/react-client` *webapp* client (see
chat-agent.jsx). It is flow-aware: on connect it passes the active flow as
session env { FLOW_ID, FLOW_NAME }. Every reply we send carries the node ids it
references in `metadata.refs` so the frontend can light up jump-to-canvas chips.

Run:  chainlit run app.py -h --port 8000
"""

from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()

import chainlit as cl
from chainlit.server import app as fastapi_app  # the FastAPI instance Chainlit runs
from fastapi import HTTPException, Query

from flow_store import load_flow, list_flows, load_bundle, flow_to_dict, reload_data
import agent as A

USE_LLM = bool(os.environ.get("OPENAI_API_KEY"))


# ───────────────────────── data API (single source of truth) ─────────────────
# flow_store.py is the ONLY parser of the data/ folder. The canvas (flow-loader.js)
# fetches these endpoints instead of re-parsing the raw files in the browser, so
# the agent and the frontend can no longer drift. CORS is whatever Chainlit is
# configured for via CHAINLIT_ALLOW_ORIGINS (same FastAPI app).
@fastapi_app.get("/api/flows")
def api_flows(fresh: bool = Query(False, description="bust the parse cache (dev)")):
    print(f"Fetched all flows with {fresh}")
    if fresh:
        reload_data()
    return load_bundle()


@fastapi_app.get("/api/flows/{flow_id}")
def api_flow(flow_id: str, fresh: bool = Query(False)):
    print("Fetched flow data")
    if fresh:
        reload_data()
    flow = load_flow(flow_id)
    if flow is None:
        raise HTTPException(
            status_code=404, detail=f"unknown flow '{flow_id}'; have: {list_flows()}"
        )
    return flow_to_dict(flow)


# Chainlit's server.py already ran `app.include_router(router)` at import time, and
# that router ends in a `/{full_path:path}` SPA catch-all. Starlette matches routes
# in registration order, so the routes we just appended land *after* the catch-all
# and never run — every /api/flows request gets served index.html instead. Move our
# routes to the front of the table so they win.
_our_routes = [
    r for r in fastapi_app.routes if getattr(r, "path", "").startswith("/api/flows")
]
for r in _our_routes:
    fastapi_app.routes.remove(r)
for r in reversed(_our_routes):
    fastapi_app.routes.insert(0, r)


@cl.on_chat_start
async def on_chat_start():
    # The frontend sends the active flow as session env on connect. This is a
    # backup channel only — every message also carries its own flow_id (see
    # on_message), so a stale/empty env here can't pin the whole session to the
    # wrong flow. Make the fallback LOUD so a misconfig is visible in the log
    # instead of silently answering from the first flow.
    env = cl.user_session.get("env") or {}
    flow_id = env.get("FLOW_ID")
    if not flow_id:
        flow_id = (list_flows() or ["loan"])[0]
        print(f"[on_chat_start] no FLOW_ID in env={env!r} — defaulting to '{flow_id}'")
    flow = load_flow(flow_id)

    cl.user_session.set("flow_id", flow_id)
    cl.user_session.set("history", [])

    if flow is None:
        # Unknown flow id — tell the user, don't crash the socket.
        await cl.Message(
            content=f"I couldn't find data for flow “{flow_id}”. "
            f"Available: {', '.join(list_flows()) or '(none)'}.",
        ).send()
        return

    # NOTE: the frontend already shows its own greeting before the first reply,
    # so we DON'T send one here — it would duplicate. We just warm the session.


@cl.on_message
async def on_message(msg: cl.Message):
    # Trust the flow id carried ON THIS MESSAGE first (the frontend stamps every
    # send with metadata.flow_id), then fall back to the session. This binds the
    # answer to the flow the UI is actually showing, turn by turn — no drift.
    md = msg.metadata or {}
    flow_id = md.get("flow_id") or cl.user_session.get("flow_id")
    active_node_id = md.get("active_node_id")  # the node the user has OPEN on the canvas
    flow = load_flow(flow_id) if flow_id else None

    if flow is None:
        await cl.Message(
            content=f"⚠️ Couldn't resolve a flow (flow_id={flow_id!r}). "
            f"Known flows: {', '.join(list_flows()) or '(none)'}."
        ).send()
        return

    # If this turn switched flows, the prior Q&A history is about a different
    # flow and would mislead follow-ups like "what does this do?" — drop it.
    prev = cl.user_session.get("flow_id")
    if prev and prev != flow_id:
        cl.user_session.set("history", [])
    cl.user_session.set("flow_id", flow_id)

    history = cl.user_session.get("history") or []

    answer = cl.Message(content="")
    await answer.send()  # opens the streaming bubble

    refs: list[str] = []
    try:
        if USE_LLM:
            refs = A.compute_refs(flow, msg.content, active_id=active_node_id)  # resolve chips up front
            async for tok in A.astream_agent(flow, msg.content, history=history, active_id=active_node_id):
                await answer.stream_token(tok)
        else:
            text, refs = A.answer_rule_based(flow, msg.content, active_id=active_node_id)
            for tok in _chunk(text):
                await answer.stream_token(tok)
    except Exception as e:
        await answer.stream_token(f"\n\n_(agent error: {e}; using fallback)_\n\n")
        text, refs = A.answer_rule_based(flow, msg.content, active_id=active_node_id)
        await answer.stream_token(text)

    # THE key line: hand the frontend the node ids to render as chips.
    answer.metadata = {"refs": refs}
    await answer.update()

    history.append({"q": msg.content, "a": answer.content})
    cl.user_session.set("history", history[-8:])  # keep last few turns


def _chunk(text: str, n: int = 3):
    """Yield small word-groups so the rule-based path also 'streams'."""
    words = text.split(" ")
    for i in range(0, len(words), n):
        yield " ".join(words[i : i + n]) + (" " if i + n < len(words) else "")
