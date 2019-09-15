Lisp interpreter in Lisp in Javascript
---

### Interpreter tower

With `tower.js` the interpreter written in lisp can be nested (interpret itself) to a configurable amount of levels.

Functions for using the tower:

| Function |   |
|----------|---|
| `em`      | `(em QUOTATION)` Meta-execution. Executes quoted code on the interpreter level above. |
| `old-cont`      | `(old-cont QUOTATION)` Executes quoted code on the interpreter level below. And continues execution at that level. |