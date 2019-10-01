# Reflective Tower

`tower/lisp.lisp` is port of the interpreter written in the interpreted hlisp itself.

Because it can also interpret itself, mutliple instances of the interpreter can be nested, making a tower of interpreters.
It is possible to manipulate interpreters while they are running. Going down a level in the tower the language will have changed.
Any part of the interpreters execution can be inspected from any level making the tower "Reflective".

<!-- Interesting case with `map`. Not a builtin in any store, Lives in emulated store of level-1 interpreter, meaning it's a variable in level. -->

## Lightweight vs Full port

The two ports are self-interpreters and are [meta-circular](https://en.wikipedia.org/wiki/Meta-circular_evaluator).

`full_port_lisp.lisp` contains a complete port of the js-lisp interpreter, this interpreter is slow when nesting 4-5 of instances.

`lisp.lisp` is a lightweight implementation of the interpreter relying on a universal store of "builtins" defined in the host interpreter for parsing and interpreting.
It provides the host-intepret function with its interpreter specific store, called a "level store".
Each interpreter is still interpreted by the level above, but if an interpreter doesn't contain an explicit definition of a function the universal store is used to run the function.
This is similar to the approach used by S.Barnes [[2]](#references).

## Tower functions

Functions for using the tower:

| &nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp; | Explanation  |
|----------|---|
| `em`      | `(em QUOTATION)` Execute-meta. Executes quoted code on the interpreter level above. |
| `em-cont`      | `(em-cont)` Execute-meta-continue. Continues the repl for the interpreter level above. |
| `old-cont`      | `(old-cont OBJECT)` Executes code on the current interpreter level, and passes the return value to the intepreter running below. And continues execution at that level. |

## Tower usage

The interpreter written in lisp can be nested (interpret itself) to a configurable amount of levels.

Example usage:
```lisp
node lisp
h>
h> (load "tower/lisp.lisp")
h> (init-tower 5)
lisp-0> (em-cont)
lisp-1>
lisp-1> (old-cont nil)
Moving down
[]
lisp-0> (em '(set 'y 77))
77
lisp-0> (em 'y)
77
lisp-0> y
Variable not bound: y
Moving up
lisp-1> y
77
lisp-1> (old-cont y)
Moving down
77
lisp-0> (em '(em '(set 'x 14)))
14
lisp-0> x
Variable not bound: x
Moving up
lisp-1> x
Variable not bound: x
Moving up
lisp-2> x
14
lisp-2> (old-cont x)
Moving down
14
lisp-1> (old-cont x)
Variable not bound: x
Moving up
lisp-2> (old-cont x)
Moving down
Moving down
14
lisp-0>
lisp-0> (plus 2 4)
Variable not bound: plus
Moving up
lisp-1> (old-cont +)
Moving down
6
lisp-0>
```

## Transform

In the `lisp.lisp` an extra function `transform` is used between the `parse` and `interpret` function calls.
By default it's an identity function returning an unmodified AST.
It makes it easy to change the language without messing with the parse function.

Changing interpreter and language while running by using the transform hook:
```lisp
lisp-0> (em-cont)
lisp-1> (defun make-negative (ast) (if (eq? (length ast) 0) nil (cons (if (eq? (car ast) "+") "-" (car ast)) (make-negative (cdr ast)))))
[Function]
lisp-1> (defun transform (ast) (list (make-negative (car ast))))
[Function]
lisp-1> (old-cont)
Moving down
undefined
lisp-0> (+ 5 4)
1
lisp-0>
```

## Roadmap

- Infinite tower

## References

1. [An Interpreted Scheme Dialect with a Reflective Tower](http://cs242.stanford.edu/f17/assets/projects/2017/stbarnes.pdf)
2. [Collapsing Towers of Interpreters](http://lampwww.epfl.ch/~amin/pub/collapsing-towers.pdf)