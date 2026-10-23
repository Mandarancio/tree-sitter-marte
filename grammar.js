/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// ─────────────────────────────────────────────────────────────────────────────
// MARTe Extended Configuration Language — full tree-sitter grammar.
//
// Covers everything the reference parser (internal/parser in mdt) accepts:
//   • core definitions: fields, +/$ objects, dynamic (@expr) object names
//   • signal shorthands `DS::Signal : Type[Dim] as Alias = { … }`
//   • signal definition sugar `Name: Type[Dim] [= { … }` in Signals blocks
//   • `from GAM.Signal [as Alias] [: Type[Dim]]` wiring values
//   • directives: package / var / let / if–else if–elseif–else–end /
//     foreach (1 var, "k v" and "k, v" forms, optional `do`) / template / use
//   • `with json|csv("path") as name [begin|{] … end` structured imports
//   • pipeline macros `gam Name { in p: T  out q: T  from a -> b  … }`
//   • copy groups `copy [Name] { (a, b) -> (c, d) [at n] [: T] … }`
//     with per-endpoint aliases, `{ option = value }` blocks and index ranges
//   • `fuse A with B`
//   • `type Name { field: Type [= default], … }` declarations and inline
//     struct types `var v: { f: int = 0 }`
//   • type expressions with unions (`|`), open lists (`[T]`), regex bounds
//     (`=~ "re"`), width-suffixed builtins
//   • expressions: || && comparisons `..` + - * / % unary - ! bitwise & | ^
//   • member access and method calls: @list.append(4).length()
//   • conditional elements inside array literals
//   • comments //, docstrings //#, pragmas //!
// ─────────────────────────────────────────────────────────────────────────────

module.exports = grammar({
  name: 'marte',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    // Conflicts below look redundant in isolation but keep the GLR stack
    // shapes for `#if`/`else` clauses, array splices and copy groups
    // distinct; tree-sitter reports them as unnecessary only because they
    // are resolved in combination.
    [$.type_expression, $.primary],
    [$._type_atom, $.primary],
            [$.struct_type, $.array_literal],
        [$.signal_definition, $.struct_type],
    // A `{` after a with-binding opens the with body; GLR distinguishes
    // the body's block items from a nested subnode.
    [$.subnode, $._block_item],
    [$.foreach_block],
    // `copy …` / `fuse …` start both a statement (subnode body) and an
    // array element; GLR decides from the enclosing context.
    [$.directive, $.array_literal],
    // `else` may open a plain else body or continue with the two-word
    // `else if` clause. The reference parser always reads `else if` as the
    // clause, and GLR resolves it the same way from what follows.
    [$.else_if_clause, $.else_clause],
    // `#if … end` inside braces is a conditional splice in an array
    // literal or a directive in a subnode body; GLR decides from context.
    // The else/else-if clause shapes are shared by both forms.
    [$.if_block, $.array_conditional, $.else_if_clause, $.else_clause],
    [$.if_block, $.array_conditional],
    [$.else_clause, $.array_conditional],
        [$.primary, $.copy_endpoint],
    [$.copy_endpoint, $.identifier],
    [$.identifier, $.copy_endpoint, $.primary],
  ],

  rules: {
    // ── TOP LEVEL ──────────────────────────────────────────────────────
    source_file: $ => repeat(choice(
      $.package_declaration,
      $.definition,
      $.directive,
      $.comment,
      $.docstring,
      $.pragma,
    )),

    // ── DEFINITIONS ────────────────────────────────────────────────────
    definition: $ => choice(
      $.field,
      $.object_definition,
      $.dynamic_object,
      $.signal_shorthand,
      $.signal_definition,
      $.from_field,
      $.type_declaration,
      $.assert_statement,
    ),

    // Build-time assertion: assert(condition, "message").
    assert_statement: $ => seq(
      'assert',
      '(',
      field('condition', $.expression),
      optional(seq(',', field('message', $.expression))),
      ')',
    ),

    field: $ => prec(2, seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    )),

    object_definition: $ => prec(2, seq(
      field('prefix', choice('+', '$')),
      field('name', $.identifier),
      '=',
      field('body', $.subnode),
    )),

    // Dynamic node name via expression: "@signal.name = { ... }" or
    // "prefix_" .. @var = { ... }
    dynamic_object: $ => prec(1, seq(
      field('name', $.expression),
      '=',
      field('body', $.subnode),
    )),

    subnode: $ => prec(1, seq(
      '{',
      repeat(choice(
        $.definition,
        $.directive,
        $.comment,
        $.docstring,
        $.pragma,
      )),
      '}',
    )),

    // ── SIGNAL SHORTHAND ───────────────────────────────────────────────
    // DS::Signal [: Type[Dim]] [as Alias] [= { … }]
    signal_shorthand: $ => seq(
      field('datasource', $.identifier),
      '::',
      field('signal', $.identifier),
      optional(seq(
        ':',
        field('type', $.type_expression),
        optional($.array_dimension),
      )),
      optional(seq(
        'as',
        field('alias', $.identifier),
      )),
      optional(seq(
        '=',
        field('extra', $.subnode),
      )),
    ),

    // Signal definition sugar inside a Signals block:
    // Name : Type[Dim] [= { … }]
    signal_definition: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
      optional($.array_dimension),
      optional(seq(
        '=',
        field('body', $.subnode),
      )),
    ),

    // X from GAM.Signal [as Alias] [: Type[Dim]]
    from_field: $ => prec(1, seq(
      field('name', $.identifier),
      'from',
      field('source', $.copy_endpoint),
      optional(seq('as', field('alias', $.identifier))),
      optional(seq(
        ':',
        field('type', $.type_expression),
        optional($.array_dimension),
      )),
    )),

    array_dimension: $ => seq('[', $.expression, ']'),

    // ── DIRECTIVES ─────────────────────────────────────────────────────
    directive: $ => choice(
      $.var_declaration,
      $.let_declaration,
      $.if_block,
      $.foreach_block,
      $.template_definition,
      $.template_use,
      $.with_block,
      $.gam_definition,
      $.copy_group,
      $.fuse_statement,
    ),

    package_declaration: $ => seq(
      optional('#'),
      'package',
      field('uri', $.package_uri),
    ),

    package_uri: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier)),
    ),

    var_declaration: $ => seq(
      optional('#'),
      'var',
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
      optional(seq('=', field('value', $.expression))),
    ),

    let_declaration: $ => seq(
      optional('#'),
      'let',
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
      '=',
      field('value', $.expression),
    ),

    // ── IF / ELSE IF / ELSEIF / ELSE / END ─────────────────────────────
    if_block: $ => seq(
      optional('#'),
      'if',
      field('condition', $.expression),
      repeat($._block_item),
      repeat($.else_if_clause),
      optional($.else_clause),
      optional('#'),
      'end',
    ),

    // `else if cond` (two words) and `elseif cond` (one word) are both
    // accepted; each may carry its own leading '#'.
    // Two forms: two-word `else [ #]if cond` and one-word `[#]elseif cond`.
    else_if_clause: $ => prec.right(1, choice(
      seq(
        'else',
        optional('#'),
        'if',
        field('condition', $.expression),
        repeat($._block_item),
      ),
      seq(
        optional('#'),
        'elseif',
        field('condition', $.expression),
        repeat($._block_item),
      ),
    )),

    else_clause: $ => prec.right(1, seq(
      optional('#'),
      'else',
      repeat($._block_item),
    )),

    // ── FOREACH ────────────────────────────────────────────────────────
    // One identifier binds the element; two bind index and element, either
    // as "k v" or "k, v". `do` may open the body.
    foreach_block: $ => seq(
      optional('#'),
      'foreach',
      choice(
        seq(field('key', $.identifier), ',', field('value', $.identifier)),
        seq(field('key', $.identifier), field('value', $.identifier)),
        field('value', $.identifier),
      ),
      'in',
      field('iterable', $.expression),
      optional('do'),
      repeat($._block_item),
      optional('#'),
      'end',
    ),

    // ── TEMPLATE DEFINITION / USE ──────────────────────────────────────
    template_definition: $ => seq(
      optional('#'),
      'template',
      field('name', $.identifier),
      '(',
      optional($.parameter_list),
      ')',
      repeat($._block_item),
      optional('#'),
      'end',
    ),

    _block_item: $ => choice(
      $.definition,
      $.directive,
      $.comment,
      $.docstring,
      $.pragma,
    ),

    parameter_list: $ => seq(
      $.parameter,
      repeat(seq(',', $.parameter)),
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type_expression),
      optional(seq('=', field('default', $.expression))),
    ),

    template_use: $ => seq(
      optional('#'),
      'use',
      field('template', $.identifier),
      field('instance', $.identifier),
      '(',
      optional($.argument_list),
      ')',
    ),

    argument_list: $ => seq(
      $.argument,
      repeat(seq(',', $.argument)),
    ),

    argument: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    ),

    // ── WITH: STRUCTURED IMPORTS ───────────────────────────────────────
    // with json("path") as name begin … end
    // The body may also be opened with '{'.
    with_block: $ => seq(
      optional('#'),
      'with',
      field('format', $.identifier),
      '(',
      field('path', $.expression),
      ')',
      'as',
      field('binding', $.identifier),
      optional(choice('begin', '{')),
      // The reference parser skips stray '}' inside directive bodies, so a
      // brace-opened body may close its brace before the final `end`.
      repeat(choice($._block_item, '}')),
      'end',
    ),

    // ── PIPELINE MACRO ─────────────────────────────────────────────────
    // gam Name { in p: T  out q: T  from a -> b  <definitions> }
    gam_definition: $ => seq(
      'gam',
      field('name', $.identifier),
      '{',
      repeat(choice(
        $.gam_port,
        $.from_wiring,
        $.definition,
        $.comment,
        $.docstring,
        $.pragma,
      )),
      '}',
    ),

    gam_port: $ => seq(
      field('direction', choice('in', 'out')),
      field('name', $.identifier),
      optional(seq(
        ':',
        field('type', $.type_expression),
        optional($.array_dimension),
      )),
    ),

    from_wiring: $ => prec(1, seq(
      'from',
      field('wiring', alias($.copy_item, $.copy_item)),
    )),

    // ── COPY GROUPS ────────────────────────────────────────────────────
    // copy [Name] { item, item, … }
    copy_group: $ => seq(
      'copy',
      optional(field('name', $.identifier)),
      '{',
      repeat(choice(
        $.copy_item,
        $.pragma,
        $.comment,
        $.docstring,
        ',',
      )),
      '}',
    ),

    // src [as alias] [{opts}] -> dst [as alias] [{opts}] [at n] [: T[Dim]]
    copy_item: $ => prec.right(1, seq(
      choice($.copy_endpoint, $.copy_group_members),
      optional(seq('as', field('src_alias', $.identifier))),
      optional($.copy_options),
      '->',
      choice($.copy_endpoint, $.copy_group_members),
      optional(seq('as', field('dst_alias', $.identifier))),
      optional($.copy_options),
      optional(seq('at', field('index', $.number))),
      optional(seq(
        ':',
        field('type', $.type_expression),
        optional($.array_dimension),
      )),
    )),

    copy_group_members: $ => seq(
      '(',
      $.copy_member,
      repeat(seq(',', $.copy_member)),
      ')',
    ),

    copy_member: $ => seq(
      field('endpoint', $.copy_endpoint),
      optional(seq('as', field('alias', $.identifier))),
      optional($.copy_options),
    ),

    copy_options: $ => seq(
      '{',
      repeat(seq(
        field('name', $.identifier),
        '=',
        field('value', $.expression),
        optional(','),
      )),
      '}',
    ),

    // GAM.Sig, GAM, DS::Sig, GAM[3], GAM[1..4]
    copy_endpoint: $ => prec(1, choice(
      seq(
        field('datasource', $.identifier),
        '::',
        field('signal', $.identifier),
      ),
      seq(
        field('object', $.identifier),
        optional(seq(
          '[',
          field('index', $.number),
          optional(seq('..', field('index_end', $.number))),
          ']',
        )),
      ),
    )),

    // ── FUSION ─────────────────────────────────────────────────────────
    fuse_statement: $ => seq(
      'fuse',
      field('left', $.identifier),
      'with',
      field('right', $.identifier),
    ),

    // ── TYPE DECLARATIONS ──────────────────────────────────────────────
    // type Name { field: Type [= default], … }
    type_declaration: $ => prec(1, seq(
      'type',
      field('name', $.identifier),
      '{',
      repeat(choice(
        seq(
          field('name', $.identifier),
          ':',
          field('type', $.type_expression),
          optional(seq('=', field('default', $.expression))),
          optional(','),
        ),
        $.comment,
      )),
      '}',
    )),

    // ── TYPE EXPRESSIONS ───────────────────────────────────────────────
    // Union (`|`), intersection (`&`), open lists (`[T]`), inline structs,
    // regex bounds (`=~ "re"`).
    type_expression: $ => seq(
      $._type_atom,
      repeat(seq(choice('|', '&'), $._type_atom)),
      optional(seq('=~', field('pattern', $.string_literal))),
    ),

    _type_atom: $ => choice(
      $.identifier,
      $.builtin_type,
      $.string_literal,
      $.number,
      $.type_bound,
      $.open_list_type,
      $.struct_type,
    ),

    open_list_type: $ => seq('[', $.type_expression, ']'),

    // { field: Type [= default], … }
    struct_type: $ => seq(
      '{',
      repeat(seq(
        field('name', $.identifier),
        ':',
        field('type', $.type_expression),
        optional(seq('=', field('default', $.expression))),
        optional(','),
      )),
      '}',
    ),

    type_bound: $ => prec(1, seq(
      choice('<', '>', '<=', '>='),
      $.number,
    )),

    builtin_type: $ => token(choice(
      'uint8',
      'uint16',
      'uint32',
      'uint64',
      'int8',
      'int16',
      'int32',
      'int64',
      'float16',
      'float32',
      'float64',
      'char8',
      'string',
      'int',
      'uint',
      'float',
      'bool',
      'array',
    )),

    // ── EXPRESSIONS ────────────────────────────────────────────────────
    expression: $ => $.logical_or,

    logical_or: $ => prec.left(1, seq(
      $.logical_and,
      repeat(seq('||', $.logical_and)),
    )),

    logical_and: $ => prec.left(2, seq(
      $.comparison,
      repeat(seq('&&', $.comparison)),
    )),

    comparison: $ => prec.left(3, seq(
      $.concat,
      repeat(seq(
        choice('<', '>', '<=', '>=', '==', '!=', 'in'),
        $.concat,
      )),
    )),

    concat: $ => prec.left(4, seq(
      $.addition,
      repeat(seq('..', $.addition)),
    )),

    addition: $ => prec.left(5, seq(
      $.multiplication,
      repeat(seq(choice('+', '-'), $.multiplication)),
    )),

    multiplication: $ => prec.left(6, seq(
      $.unary,
      repeat(seq(choice('*', '/', '%'), $.unary)),
    )),

    unary: $ => choice(
      seq(choice('-', '!'), $.unary),
      $.bitwise,
    ),

    bitwise: $ => prec.left(7, seq(
      $.primary,
      repeat(seq(choice('&', '|', '^'), $.primary)),
    )),

    primary: $ => prec(1, choice(
      $.number,
      $.string_literal,
      $.boolean_literal,
      $.variable_reference,
      $.function_call,
      $.member_expression,
      $.array_literal,
      $.subnode,
      $.grouped_expression,
      $.identifier,
    )),

    // Builtin iterator functions: enumerate(@list), zip(@a, @b), range(0, 8).
    // The '@' form (@enumerate(@x)) is accepted by the reference parser too;
    // both spellings produce the same call.
    function_call: $ => prec(2, seq(
      field('function', choice($.identifier, $.variable_reference)),
      '(',
      optional(seq(
        $.expression,
        repeat(seq(',', $.expression)),
      )),
      ')',
    )),

    // @var.name, GAM.Sig.replace("a", "b"), @list.append(4).length()
    member_expression: $ => prec.left(12, seq(
      field('base', choice($.variable_reference, $.identifier)),
      repeat1(seq(
        '.',
        choice(
          field('member', $.identifier),
          $.method_call,
        ),
      )),
    )),

    method_call: $ => prec(1, seq(
      field('method', $.identifier),
      '(',
      optional(seq(
        $.expression,
        repeat(seq(',', $.expression)),
      )),
      ')',
    )),

    grouped_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    // Commas are optional separators; #if/#else blocks splice conditionally.
    array_literal: $ => seq(
      '{',
      repeat(choice(
        $.expression,
        $.array_conditional,
        $.copy_group,
        $.fuse_statement,
        ',',
      )),
      '}',
    ),

    // #if cond <elements> [#else if cond <elements>] [#else <elements>] #end
    // inside an array literal: the active branch's elements are spliced in.
    array_conditional: $ => prec(1, seq(
      optional('#'),
      'if',
      field('condition', $.expression),
      repeat(choice($.expression, ',')),
      repeat(choice(
        seq(
          'else',
          optional('#'),
          choice('if', 'elseif'),
          field('condition', $.expression),
          repeat(choice($.expression, ',')),
        ),
        seq(
          optional('#'),
          'elseif',
          field('condition', $.expression),
          repeat(choice($.expression, ',')),
        ),
      )),
      optional(seq(
        optional('#'),
        'else',
        repeat(choice($.expression, ',')),
      )),
      optional('#'),
      'end',
    )),

    // The reference lexer's variable references stop at letters, digits
    // and underscores: dots after a @name are member accesses.
    variable_reference: $ => seq('@', field('name', $._var_name)),

    // ── LITERALS ───────────────────────────────────────────────────────
    number: $ => token(choice(
      /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
      /0[xX][0-9a-fA-F]+/,
      /0[bB][01]+/,
    )),

    string_literal: $ => token(seq(
      '"',
      repeat(choice(
        /[^\\"\n]+/,
        seq('\\', choice(
          /[^xuU]/,
          /\d{2,3}/,
          /x[0-9a-fA-F]{2,}/,
          /u[0-9a-fA-F]{4}/,
          /U[0-9a-fA-F]{8}/,
        )),
      )),
      '"',
    )),

    boolean_literal: $ => choice('true', 'false'),

    // ── COMMENTS, DOCSTRINGS, PRAGMAS ──────────────────────────────────
    comment: $ => token(choice(
      seq('//', /[^#!].*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),

    docstring: $ => token(seq('//#', /.*/)),

    pragma: $ => token(seq('//!', /.*/)),

    // ── IDENTIFIER ─────────────────────────────────────────────────────
    // Dotted identifiers are one token: field names (Rate.Hz), GAM signal
    // references (Producer.Out) and package URIs (jada_gyro.App) all lex
    // as a single identifier, matching the reference lexer.
    identifier: $ => token(/[a-zA-Z_][a-zA-Z0-9_\-.]*/),

    _var_name: $ => token(/[a-zA-Z_][a-zA-Z0-9_]*/),
  },
});
