; ── Keywords / Directives ──────────────────────────────────────────────
"package" @keyword
"var" @keyword
"let" @keyword
"if" @keyword.conditional
"elseif" @keyword.conditional
"else" @keyword.conditional
"end" @keyword
"foreach" @keyword.repeat
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

; ── Build-time assertions ───────────────────────────────────────────────
(assert_statement "assert" @keyword)
(assert_statement
  message: (expression) @string.special)

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

; ── Signal syntax ───────────────────────────────────────────────────────
(signal_shorthand
  datasource: (identifier) @namespace
  signal: (identifier) @variable.member
  alias: (identifier) @variable)
(signal_definition
  name: (identifier) @variable.member)
"::" @punctuation.special

; ── Copy groups ─────────────────────────────────────────────────────────
(copy_group
  name: (identifier) @type)
(copy_endpoint
  datasource: (identifier) @namespace)
"->" @operator
(copy_options
  name: (identifier) @property)

; ── Pipeline macros ─────────────────────────────────────────────────────
(gam_definition
  name: (identifier) @type)
(gam_port
  direction: (["in" "out"]) @keyword.modifier
  name: (identifier) @property)

; ── Struct types ────────────────────────────────────────────────────────
(struct_type
  name: (identifier) @property)
(type_declaration
  name: (identifier) @type)

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
(foreach_block "in" @keyword)
(list_comprehension
  "for" @keyword.repeat
  "in" @keyword
  "if" @keyword.conditional)
"=~" @operator

; ── Punctuation ─────────────────────────────────────────────────────────
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"," @punctuation.delimiter
