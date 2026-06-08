; ── Object definitions (prefixed with + or $) ──────────────────────
(object_definition
  prefix: "+"
  name: (identifier) @name) @definition.class

(object_definition
  prefix: "$"
  name: (identifier) @name) @definition.interface

; ── Signal shorthand entries ───────────────────────────────────────
(signal_shorthand
  signal: (identifier) @name) @definition.field

; ── Top-level fields (configuration values) ────────────────────────
(source_file
  (definition
    (field
      name: (identifier) @name))) @definition.property

; ── Variable declarations ──────────────────────────────────────────
(var_declaration
  name: (identifier) @name) @definition.variable

; ── Constants ──────────────────────────────────────────────────────
(let_declaration
  name: (identifier) @name) @definition.constant

; ── Template definitions ───────────────────────────────────────────
(template_definition
  name: (identifier) @name) @definition.function

; ── Template instantiations ────────────────────────────────────────
(template_use
  instance: (identifier) @name) @definition.variable

; ── Package declaration ────────────────────────────────────────────
(package_declaration
  uri: (package_uri) @name) @definition.module

; ── Docstrings attach to next definition ───────────────────────────
(docstring) @documentation
