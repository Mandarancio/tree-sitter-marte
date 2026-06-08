; ── Variable declarations: define the name as a local ──────────────
(var_declaration
  name: (identifier) @local.definition)

; ── Constant declarations ──────────────────────────────────────────
(let_declaration
  name: (identifier) @local.definition)

; ── Foreach loop variable ──────────────────────────────────────────
(foreach_block
  value: (identifier) @local.definition)

; ── Foreach key variable (when present) ────────────────────────────
(foreach_block
  key: (identifier) @local.definition)

; ── Template parameters ────────────────────────────────────────────
(parameter
  name: (identifier) @local.definition)

; ── Variable references: point back to definitions ─────────────────
(variable_reference
  (identifier) @local.reference)

; ── Scope blocks for locals ────────────────────────────────────────
; (file-level variables are global; foreach/template create scopes)
(foreach_block) @local.scope
(template_definition) @local.scope
