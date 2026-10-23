; ── Keywords / Directives ──────────────────────────────────────────────
"package" @keyword
"var" @keyword
"let" @keyword
"if" @keyword.conditional
"elseif" @keyword.conditional
"else" @keyword.conditional
"end" @keyword
"foreach" @keyword.repeat
"for" @keyword.repeat
"do" @keyword.repeat
"template" @keyword
"use" @keyword
"as" @keyword
"with" @keyword
"begin" @keyword
"type" @keyword
"from" @keyword
"at" @keyword
"fuse" @keyword
"gam" @keyword
"copy" @keyword
"out" @keyword

; ── Boolean ─────────────────────────────────────────────────────────────
"true" @boolean
"false" @boolean
(boolean_literal) @boolean

; ── Types ───────────────────────────────────────────────────────────────
(builtin_type) @type.builtin
(type_bound) @type
(open_list_type "[" @type.builtin)
(open_list_type "]" @type.builtin)
"=~" @operator

; ── Strings ─────────────────────────────────────────────────────────────
(string_literal) @string

; ── Numbers ─────────────────────────────────────────────────────────────
(number) @number

; ── Default identifier capture (overridden by specific rules below) ─────
(identifier) @variable

; ── Variables ───────────────────────────────────────────────────────────
(variable_reference) @variable

; ── Fields / properties ─────────────────────────────────────────────────
; Every `Name = value` definition, plus the fields of struct literals and
; struct types. Signal and object names get their own captures below.
(field
  name: (identifier) @property)
(struct_literal
  name: (identifier) @property)
(struct_type
  name: (identifier) @property)
(argument
  name: (identifier) @property)
(copy_options
  name: (identifier) @property)
(from_field
  name: (identifier) @property)
(copy_member
  alias: (identifier) @variable)
(gam_port
  name: (identifier) @property)

; ── Object definitions and dynamic names ────────────────────────────────
(object_definition
  name: (identifier) @type)

; ── Signal syntax ───────────────────────────────────────────────────────
(signal_shorthand
  datasource: (identifier) @namespace
  signal: (identifier) @variable.member)
(signal_shorthand
  alias: (identifier) @variable)
(signal_definition
  name: (identifier) @variable.member)
(copy_endpoint
  signal: (identifier) @variable.member)
"::" @punctuation.special

; ── Copy groups ─────────────────────────────────────────────────────────
(copy_group
  name: (identifier) @type)
(copy_endpoint
  datasource: (identifier) @namespace)
"->" @operator

; ── Pipeline macros ─────────────────────────────────────────────────────
(gam_definition
  name: (identifier) @type)
(gam_port
  direction: (["in" "out"]) @keyword.modifier)
(fuse_statement
  left: (identifier) @type
  right: (identifier) @type)

; ── Templates, loops, imports ───────────────────────────────────────────
(template_definition
  name: (identifier) @type)
(template_use
  template: (identifier) @type
  instance: (identifier) @variable)
(package_uri
  (identifier) @namespace)
(parameter
  name: (identifier) @variable.parameter)
(foreach_block
  key: (identifier) @variable.parameter
  value: (identifier) @variable.parameter)
(list_comprehension
  key: (identifier) @variable.parameter
  value_var: (identifier) @variable.parameter)
(with_block
  format: (identifier) @function.builtin)
(with_block
  binding: (identifier) @variable.parameter)
(type_declaration
  name: (identifier) @property)
(type_declaration
  (identifier) @type . "{")

; ── Build-time assertions ───────────────────────────────────────────────
(assert_statement
  "assert" @keyword)

; ── Builtin functions / calls ───────────────────────────────────────────
(function_call
  function: (identifier) @function.call)
(function_call
  function: (variable_reference) @function.call)
((function_call
   function: (identifier) @function.builtin)
 (#any-of? @function.builtin
   "enumerate" "zip" "range" "keys" "values" "len" "reversed" "concat"))
((function_call
   function: (variable_reference) @function.builtin)
 (#any-of? @function.builtin
   "@enumerate" "@zip" "@range" "@keys" "@values" "@len" "@reversed" "@concat"))

; ── Member access / method calls ────────────────────────────────────────
(member_expression
  member: (identifier) @property)
(method_call
  method: (identifier) @method.call)

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
"<" @operator
">" @operator
"<=" @operator
">=" @operator
"==" @operator
"!=" @operator
"!" @operator
"in" @operator

; ── Scoped keyword overrides for `in` (must follow the operator rule) ───
(foreach_block "in" @keyword)
(list_comprehension "in" @keyword)

; ── Punctuation ─────────────────────────────────────────────────────────
; The object prefix (+/$) is punctuation, not arithmetic: keep the capture
; after the operator block so it wins over the generic "+" capture.
(object_definition
  prefix: (["+" "$"]) @punctuation.special)
"#" @punctuation.special
"@" @punctuation.special
":" @punctuation.delimiter
"." @punctuation.delimiter
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"," @punctuation.delimiter
