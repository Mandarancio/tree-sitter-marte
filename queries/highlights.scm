; ── Keywords / Directives ──────────────────────────────────────────────
"package" @keyword
"var" @keyword
"let" @keyword
"if" @keyword.conditional
"else" @keyword.conditional
"end" @keyword
"foreach" @keyword.repeat
"in" @keyword
"template" @keyword
"use" @keyword
"as" @keyword

; ── Boolean ─────────────────────────────────────────────────────────────
"true" @boolean
"false" @boolean

; ── Types ───────────────────────────────────────────────────────────────
(builtin_type) @type.builtin

; ── Objects ─────────────────────────────────────────────────────────────
(object_definition
  prefix: "$" @constructor)
(object_definition
  prefix: "+" @constructor)

; ── Strings ─────────────────────────────────────────────────────────────
(string_literal) @string

; ── Numbers ─────────────────────────────────────────────────────────────
(number) @number

; ── Variables ───────────────────────────────────────────────────────────
(variable_reference) @variable

; ── Comments ────────────────────────────────────────────────────────────
(comment) @comment
(docstring) @comment.documentation
(pragma) @comment.note

; ── Operators ───────────────────────────────────────────────────────────
"=" @operator
"+" @operator
"-" @operator
"*" @operator
"/" @operator
"%" @operator
"^" @operator
"&" @operator
"|" @operator
"||" @operator
"&&" @operator
".." @operator
"==" @operator
"!=" @operator
"<" @operator
">" @operator
"<=" @operator
">=" @operator
"!" @operator

; ── Punctuation ─────────────────────────────────────────────────────────
":" @punctuation.delimiter
"::" @punctuation.delimiter
"," @punctuation.delimiter
"." @punctuation.delimiter
"{" @punctuation.bracket
"}" @punctuation.bracket
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket

; ── Templates ───────────────────────────────────────────────────────────
(template_definition
  name: (identifier) @function)
(template_use
  template: (identifier) @function)
(template_use
  instance: (identifier) @variable)

; ── Signal Shorthand ────────────────────────────────────────────────────
(signal_shorthand
  datasource: (identifier) @namespace)
(signal_shorthand
  signal: (identifier) @variable)

; ── Variables / Constants ───────────────────────────────────────────────
(var_declaration
  name: (identifier) @variable)
(let_declaration
  name: (identifier) @constant)

; ── Package ─────────────────────────────────────────────────────────────
(package_declaration
  uri: (package_uri) @namespace)

; ── Fields ──────────────────────────────────────────────────────────────
(field
  name: (identifier) @property)

; ── Parameters / Arguments ──────────────────────────────────────────────
(parameter
  name: (identifier) @variable.parameter)
(argument
  name: (identifier) @variable.parameter)

; ── Type Expressions ────────────────────────────────────────────────────
(type_expression
  (identifier) @type)

; ── Signal names (common in MARTe) ──────────────────────────────────────
(identifier) @variable

(dynamic_object) @constructor
