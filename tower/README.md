# Reflective Tower

`tower/full_port_lisp.lisp` is a port of the interpreter, written in the interpreted hlisp itself.

Because this interpreter can also interpret itself, mutliple instances of the interpreter can be nested, making a tower of interpreters.
It is possible to manipulate interpreters while they are running. Doing so, then going down a level in the tower, the language will have changed.
Any part of the interpreters' execution can be inspected from any level, making the tower "Reflective".

This is illustrated by the `map` function. It's not a builtin in any store, but part of the ported interpreter source code.
It lives in the store-variable of the level `l + 1` interpreter, meaning it's a variable in level `l`.

The numbering of the levels start at 0. Level 0 is the most deeply nested interpreter and thus actually the top of the tower.
The level 0 interpreter is interpreted by the level 1 interpreter, and so on.
It's enumerated with this direction because one of the tower implementations has infinite levels.
```
level 0
level 1
level 2
...
level 99
...
infinity
```

So, when moving, for example, from level 0 to level 1, instead of saying we're moving to the interpreter running below, we say we're going up a "meta" level.

From here on, in this paper, levels and movements between them will be reffered to in this nomenclature.

## Recursive Interpreter Tower

The tower folder contains two hlisp interpreter ports capable of interpreting themselves recursively, building interpreter towers.

They are self-interpreters and are [meta-circular](https://en.wikipedia.org/wiki/Meta-circular_evaluator).

`full_port_lisp.lisp` contains a complete port of the js-lisp interpreter, this interpreter is slow when nesting 4-5 instances.

`lisp.lisp` is a lightweight implementation of the interpreter relying on a universal store of "builtins" defined in the host interpreter for parsing and interpreting.
It provides the universal interpret function with the AST and a interpreter specific store, called a "level store".
Each interpreter is still interpreted by the level above, but if an interpreter doesn't contain an explicit definition of a function the universal store is used to run the function.
This is similar to the approach used by S.Barnes [[2]](#references).

### Starting the recursive tower

5 levels of nested interpreters:
```lisp
node lisp
h>
h> (load "tower/lisp.lisp")
h> (init-tower 5)
lisp-0> 
```

## Infinite Tower

`infinite_lisp.js`

The recursive nature of `lisp.lisp`, which thightly nests and implicitely links the levels, made it hard to have an infinite tower. 
Therefore, the infinite-tower implementation is made with a tower controller that manages execution from outside the tower.
The controller lives in `infinite_lisp.js`, and injects appropriate stores and keeps track of which interpreter should run what code.

This tower uses the same principle as `lisp.lisp`, with universal store short-circuiting the execution.

### Starting the infinite tower

```bash
node infinite_lisp.js
lisp-0> 
```

## Tower functions

Functions for navigating and executing code in the tower.

| &nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp; | Explanation  |
|----------|---|
| `em`      | `(em QUOTATION)` Execute-meta. Executes quoted code on the interpreter level above. |
| `em-cont`      | `(em-cont)` Execute-meta-continue. Continues the repl at the interpreter level above. |
| `old-cont`      | `(old-cont OBJECT)` Executes code on the current interpreter level, and passes the return value to the intepreter running below. And continues execution at that level. |

## Tower usage

Once you have started your tower of choice, here is how to use it:

```lisp
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
lisp-0> (em '(em '(set 'z 66)))
66
lisp-0> (+ 5 z)
Variable not bound: z
Moving up
lisp-1> (old-cont z)
Variable not bound: z
Moving up
lisp-2> (old-cont z)
71
lisp-0> 
lisp-0> (em 'level)
1
```

## Transform hook

In the tower interpreters an extra function, `transform`, is used between the `parse` and `interpret` function calls.
By default it's the identity function returning an unmodified AST.
Changing this function allows you to easily change the language without messing with the parse function.

Using the transform hook to change the language of a running interpreter:
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

## References

1. [An Interpreted Scheme Dialect with a Reflective Tower](http://cs242.stanford.edu/f17/assets/projects/2017/stbarnes.pdf)
2. [Collapsing Towers of Interpreters](http://lampwww.epfl.ch/~amin/pub/collapsing-towers.pdf)
