/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'marte',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  conflicts: $ => [
    [$.type_expression, $.primary],
    [$._type_atom, $.primary],
    [$.array_literal, $.subnode],
  ],

  word: $ => $.identifier,

  rules: {
    // ── TOP LEVEL ──────────────────────────────────────────────────────
    source_file: $ => repeat1(seq(
      optional(choice(
        $.comment,
        $.docstring,
        $.pragma,
      )),
      choice(
        $.package_declaration,
        $.definition,
        $.directive,
        $.comment,
        $.docstring,
        $.pragma,
      ),
    )),

    // ── DEFINITIONS ────────────────────────────────────────────────────
    definition: $ => choice(
      $.field,
      $.object_definition,
      $.dynamic_object,
      $.signal_shorthand,
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

    // Dynamic node name via expression: "prefix_" .. @var = { ... }
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

    array_dimension: $ => seq('[', $.expression, ']'),

    // ── DIRECTIVES ─────────────────────────────────────────────────────
    directive: $ => choice(
      $.var_declaration,
      $.let_declaration,
      $.if_block,
      $.foreach_block,
      $.template_definition,
      $.template_use,
    ),

    // Optional '#' prefix for backward compatibility — inline per rule

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

    // ── IF / ELSE IF / ELSE / END ──────────────────────────────────────
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

    else_if_clause: $ => seq(
      'else',
      'if',
      field('condition', $.expression),
      repeat($._block_item),
    ),

    else_clause: $ => seq(
      'else',
      repeat($._block_item),
    ),

    // ── FOREACH ────────────────────────────────────────────────────────
    foreach_block: $ => seq(
      optional('#'),
      'foreach',
      optional(seq(field('key', $.identifier), ',')),
      field('value', $.identifier),
      'in',
      field('iterable', $.expression),
      repeat($._block_item),
      optional('#'),
      'end',
    ),

    // ── TEMPLATE DEFINITION ────────────────────────────────────────────
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

    // ── TEMPLATE USE ───────────────────────────────────────────────────
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

    // ── TYPE EXPRESSION ────────────────────────────────────────────────
    type_expression: $ => seq(
      $._type_atom,
      repeat(seq(choice('|', '&'), $._type_atom)),
    ),

    _type_atom: $ => choice(
      $.identifier,
      $.builtin_type,
      $.string_literal,
      $.number,
      $.type_bound,
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
        choice('<', '>', '<=', '>=', '==', '!='),
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

    primary: $ => choice(
      $.number,
      $.string_literal,
      $.boolean_literal,
      $.variable_reference,
      $.cast_expression,
      $.array_literal,
      $.subnode,
      $.grouped_expression,
      $.identifier,
    ),

    cast_expression: $ => seq(
      '(',
      field('type', $.type_expression),
      ')',
      field('value', $.expression),
    ),

    grouped_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    array_literal: $ => seq(
      '{',
      optional(seq(
        choice($.expression, ','),
        repeat(choice($.expression, ',')),
      )),
      '}',
    ),

    variable_reference: $ => seq('@', $.identifier),

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
    identifier: $ => {
      // Keywords that can also be identifiers
      const keywords = [
        'package', 'var', 'let',
        'if', 'else', 'end',
        'foreach', 'in',
        'template', 'use',
        'as',
        'true', 'false',
      ];

      // Known MARTe property names
      const marteProps = [
        'Class', 'Type', 'DataSource', 'Alias',
        'NumberOfElements', 'NumberOfDimensions',
        'InputSignals', 'OutputSignals',
        'Functions', 'Data', 'States', 'Scheduler',
        'DefaultDataSource', 'TimingDataSource',
      ];

      return token(choice(
        ...marteProps.map(p => p),
        /[a-zA-Z_][a-zA-Z0-9_\-.]*/,
      ));
    },
  },
});
