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
(type_bound) @type

; ── Strings ─────────────────────────────────────────────────────────────
(string_literal) @string

; ── Numbers ─────────────────────────────────────────────────────────────
(number) @number

; ── Default identifier capture (overridden by specific rules below) ─────
(identifier) @variable

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

; ── Objects ─────────────────────────────────────────────────────────────
(object_definition
  name: (identifier) @constructor)
(object_definition
  prefix: "$" @constructor)
(object_definition
  prefix: "+" @constructor)

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

(dynamic_object) @constructor
