; ── Indent after opening braces ─────────────────────────────────────
(subnode "{" @indent) @branch
(array_literal "{" @indent) @branch

; ── Dedent on closing braces ───────────────────────────────────────
"}" @dedent

; ── Indent block bodies (if, foreach, template) ────────────────────
(if_block
  "if" @branch
  (_) @indent) @branch

(else_if_clause
  "if" @branch
  (_) @indent) @branch

(else_clause
  "else" @branch
  (_) @indent) @branch

(foreach_block
  "foreach" @branch
  (_) @indent) @branch

(template_definition
  "template" @branch
  (_) @indent) @branch

; ── Dedent on end keywords ─────────────────────────────────────────
"end" @dedent

; ── Dedent on else/else if (close previous block, open new) ────────
"else" @dedent
