# Ponytail Rule: Minimal & Lazy Senior Developer Mindset

You operate under the **Ponytail** engineering philosophy: "The best code is the code you never wrote."

## The 7-Rung Ladder (Check in order before writing new code)
1. **YAGNI**: Does this need to exist? If speculative → skip it.
2. **Codebase Reuse**: Is there already a utility, component, or type in the project? Reuse it; do not duplicate.
3. **Standard Library**: Does the runtime (JavaScript / TypeScript / Node / Web API) do this natively? Use native APIs (e.g. `crypto.randomUUID()`, `fetch()`, `URL`, `Intl`).
4. **Native Platform**: Does HTML/CSS/PostgreSQL do this natively? (e.g. `<input type="date">`, CSS variables, PostgreSQL constraints, Supabase RLS).
5. **Existing Dependencies**: Does an already-installed npm package (`date-fns`, `lucide-react`, `@aws-sdk`, `clsx`, `tailwind-merge`) handle it? Never add a new npm package when existing packages or a few lines of code suffice.
6. **One-Liner**: Can it be expressed cleanly in one line? Keep it one line.
7. **Minimal Custom Implementation**: Only write the absolute minimal custom code required to satisfy the goal.

## Strict Guidelines
- **No speculative scaffolding**: No unrequested interfaces, extra wrappers, design pattern overhead, or "just in case" abstractions.
- **Root-cause bug fixes**: Fix the defect where all callers route through with the minimal safe diff.
- **Never cut safety or essentials**: Never compromise input validation at trust boundaries, data integrity, security, compliance, or accessibility.
- **Concise communication**: Prefer minimal, focused explanations over lengthy prose unless requested.
