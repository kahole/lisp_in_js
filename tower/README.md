# Reflective (Interpreter) Tower

A port of the interpreter written in the interpreted hlisp itself.

Because it can interpret itself, mutliple instances of the interpreter can be nested.
This makes it possible to manipulate interpreters while they are running. Going up down a level in the tower the language will have changed.

Interesting case with `map`. Not a builtin in any store, Lives in emulated store of level-1 interpreter, meaning it's a variable in level.

## lisp.lisp vs lisp_full_port.lisp

self-interpreter

[meta-circular interpreter](https://en.wikipedia.org/wiki/Meta-circular_evaluator)

## Interpreter tower

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

### Transform

Easy to change the language by running `(defun transform (ast) (do-something-to-ast)))` in level below.
Changing interpreter and language while running by using the transform hook:
```lisp
lisp-1> (defun make-negative (ast) (if (eq? (length ast) 0) nil (cons (if (eq? (car ast) "+") "-" (car ast)) (make-negative (cdr ast)))))
[Function]
lisp-1> (defun transform (ast) (list (make-negative (car ast))))
[Function]
lisp-1> (em-cont)
lisp-2> (+ 5 4)
1
lisp-2> 
```

### Tower functions

Functions for using the tower:

| Function |   |
|----------|---|
| `em`      | `(em QUOTATION)` Execute-meta. Executes quoted code on the interpreter level above. |
| `em-cont`      | `(em-cont)` Execute-meta-continue. Continues the repl for the interpreter level above. |
| `old-cont`      | `(old-cont QUOTATION)` Executes quoted code on the interpreter level below. And continues execution at that level. |


### References

[An Interpreted Scheme Dialect with a Reflective Tower](http://cs242.stanford.edu/f17/assets/projects/2017/stbarnes.pdf)
[Collapsing Towers of Interpreters](http://lampwww.epfl.ch/~amin/pub/collapsing-towers.pdf)