Lisp interpreter in Lisp in Javascript
---

### Interpreter tower

With `tower.js` the interpreter written in lisp can be nested (interpret itself) to a configurable amount of levels.

Example usage:
```lisp
lisp-base> 
lisp-base> (em-cont)
lisp-1> (old-cont '0)
Moving down
0
lisp-base> (em '(em-cont))
lisp-2> (set 'q 55)
55
lisp-2> (old-cont '5)
Moving down
5
lisp-base> (em '(em 'q))
55
lisp-base> 
lisp-base> (em '(emm 'q))
Variable not bound: emm
Moving up a meta level
lisp-2> (old-cont 'em)
Moving down
55
lisp-base> 
```

Functions for using the tower:

| Function |   |
|----------|---|
| `em`      | `(em QUOTATION)` Execute-meta. Executes quoted code on the interpreter level above. |
| `em-cont`      | `(em-cont)` Execute-meta-continue. Runs the repl for the interpreter level above. |
| `old-cont`      | `(old-cont QUOTATION)` Executes quoted code on the interpreter level below. And continues execution at that level. |