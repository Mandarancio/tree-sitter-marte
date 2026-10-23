# tree-sitter-marte

[MARTe2](https://vcis.f4e.europa.eu/marte2-docs/master/html/) configuration file grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter)

## Usage
The parser can be used as a syntax highlighter by any editor using tree-sitter, like [neovim](https://neovim.io/), or in VScode with the [tree-siter-vscode](https://marketplace.visualstudio.com/items?itemName=AlecGhost.tree-sitter-vscode) extension.

The release provides the repository source code and a zip file containing the *.wasm* and *.scm* files needed by the editors to implement the syntax highlighting.

## Syntax
The [grammar.js](./grammar.js) file (generated into [src/grammar.json](./src/grammar.json)) contains the grammar rules of the MARTe extended configuration language. It covers the full language accepted by the `mdt` reference parser:

- Core definitions: fields, `+`/`$` objects, dynamic `@expr = { … }` names
- Signal shorthands `DS::Signal : Type[Dim] as Alias = { … }` and the
  `Name: Type[Dim]` sugar inside `Signals` blocks, plus `from` wiring values
- Directives: `package`, `var`, `let`, `if` / `else if` / `elseif` / `else` / `end`,
  `foreach` (one variable, `k v` and `k, v` forms, optional `do`),
  `template` / `use`, `with json|csv("path") as name begin … end`
- Pipeline macros (`gam Name { in p: T  out q: T … }`), copy groups
  (`copy [Name] { a -> b [at n] [: T] … }` with aliases, per-endpoint option
  blocks and index ranges) and `fuse A with B`
- `type Name { field: Type [= default] }` declarations and inline struct types
- Type expressions: unions (`|`), open lists (`[T]`), regex bounds (`=~ "re"`),
  width-suffixed builtins
- Expressions: `|| && == != < > <= >= .. + - * / %` unary `- !` bitwise `& | ^`,
  member access and method calls (`@list.append(4).length()`), conditional
  splices inside array literals
- Comments, `//#` docstrings and `//!` pragmas

## Example
![MARTe2 configuration file highligthing example](./images/example.svg)

## ToDo
Add specific highlitghting rules for [MARTe2-components](https://github.com/aneto0/MARTe2-components).

## References
- [tree-sitter](https://tree-sitter.github.io)
- [MARTe2](https://github.com/aneto0/MARTe2)
- [MARTe2-components](https://github.com/aneto0/MARTe2-components)
- [MARTe2 documentation](https://vcis.f4e.europa.eu/marte2-docs/master/html/)
