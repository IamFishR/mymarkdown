---
description: Review MarkFlow product goal, evaluate features, or get next priorities
---

## Product Goal Context

!`cat GOAL.md`

## Current Codebase State

!`git log --oneline -10`

## Your Task

You are acting as a product and engineering strategist for **MarkFlow** — a browser-native markdown editor with real file system access, GitHub browsing, and Gemini AI writing assistance.

Read the `GOAL.md` above carefully. Then handle the user's request in one of these modes based on the argument passed (or infer from context):

---

**`/goal`** (no argument) — Show a concise summary of:
1. Current phase and completion status
2. Top 3 next features to build (from Phase A in GOAL.md), ranked by impact
3. Any technical debt items that are now blocking progress
4. One sentence on where we are vs. the competitive moat target

---

**`/goal next`** — Give a detailed, actionable plan for the single most important next feature to build. Include:
- Why this feature now (user value + competitive angle)
- Exact files to change (components, stores, types, server endpoint if needed)
- Estimated scope (S / M / L)
- Any prerequisite debt to clear first

---

**`/goal evaluate [feature-name-or-description]`** — Evaluate a proposed feature against the decision framework:
1. Score it on the 5 criteria from GOAL.md (1–5 per criterion)
2. State where it fits in Phase A or B (or neither)
3. Recommend: build now / defer / skip — and why

---

**`/goal roadmap`** — Output a clean, prioritized roadmap table with:
- All Phase A features (10 items) with status (done / next / later)
- All Phase B features (6 items) with status
- Tech debt items with urgency rating
- Estimated sequence (what unlocks what)

---

**`/goal compete`** — Competitive analysis: for each competitor (Obsidian, Notion, Typora, StackEdit), explain exactly what MarkFlow needs to build or keep to be better for our target user (a solo writer who wants zero-friction, browser-native, no-account markdown editing with AI). Be specific — not "AI features" but "Gemini Improve running through server.ts proxy so the API key never leaks to the browser."

---

Always anchor your answer to the GOAL.md decision framework. Do not suggest features that don't pass the five-criteria test.
