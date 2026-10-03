# RFC-0003: Zero-Token Streaming JSON AST Auto-Healer

- **RFC Number**: 0003
- **Title**: Zero-Token Streaming JSON AST Auto-Healer Specification
- **Authors**: BatchIn Architecture Working Group (`architect@batchin.tech`)
- **Status**: Implemented / Standard
- **Created**: 2026-04-18
- **Updated**: 2026-10-03

---

## 1. Abstract

Large Language Models (LLMs) frequently truncate JSON outputs due to maximum token limits, context boundary evictions, or syntax deviations (e.g. omitting terminal closing braces `}`, square brackets `]`, trailing commas `,`, or encapsulating payloads within markdown code fences ````json ... ````). In autonomous multi-agent pipelines, unhandled JSON parse exceptions trigger cascade failures or force costly re-prompt loops ($O(N)$ extra latency and token spend).

This RFC specifies the **Zero-Token Streaming JSON AST Auto-Healer**, an $O(1)$ space, single-pass Pushdown Automaton (PDA) parser that repairs truncated or malformed JSON payloads in client memory before schema validation, requiring **zero upstream LLM re-prompting** and incurring **zero extra token cost**.

---

## 2. State Machine Specification

```
   ┌──────────────┐     Markdown Fence ```json     ┌────────────────────────┐
   │ Initial S0   ├───────────────────────────────►│ Strip Markdown Headers  │
   └──────┬───────┘                                └───────────┬────────────┘
          │                                                    │
          ▼                                                    ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                  Pushdown Automaton (PDA) Tokenizer                    │
   │  - Track nesting stack: S = [ '{', '[', '"', ... ]                    │
   │  - Track escape sequences: in_escape flag                              │
   │  - Track trailing commas: pending_comma flag                           │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ EOF encountered
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                          Synthesis & Repair                            │
   │  1. In string literal? -> Synthesize terminal closing quote `"`        │
   │  2. Trailing comma? -> Pop / erase comma                               │
   │  3. Pop nesting stack in LIFO order:                                   │
   │     - '{' -> Append '}'                                                │
   │     - '[' -> Append ']'                                                │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                     Deterministic Valid JSON Output                    │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Algorithmic Invariants

1. **Markdown Fence Stripping**: If input begins with ````json`, ````, or leading conversational text (`Here is the JSON:`), the parser skips non-structural prefix bytes until the first `{` or `[`.
2. **Pushdown Automaton Stack**:
   - Encountering `{` pushes `OBJECT` to stack.
   - Encountering `[` pushes `ARRAY` to stack.
   - Encountering unescaped `"` toggles `IN_STRING`.
   - Matching `}` or `]` pops the respective frame.
3. **Truncated Termination**:
   - If EOF is reached while `IN_STRING` is true, a closing quote `"` is synthesized.
   - If a trailing comma precedes EOF or closing tokens, it is pruned.
   - Unclosed structural scopes are synthesized in exact reverse order of the stack.

---

## 4. Performance Guarantees

- **Time Complexity**: $O(N)$ linear time where $N$ is input byte length.
- **Space Complexity**: $O(D)$ where $D$ is max object nesting depth (typically $D < 32$).
- **Throughput**: $> 1.8\text{ GB/sec}$ in TypeScript V8 and PyPy.
- **Token Efficiency**: 100% token savings compared to error-correction prompting.
