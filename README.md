# Lisp and Reflective Tower in JS

`lisp.js` is an interpreter capable of running a dialect of elisp called hlisp.

The folder `tower` contains a port of the hlisp-interpreter written in hlisp and a program for starting the [Reflective Tower](#reflective-tower).

### Contents
- [Lisp.js](#lispjs)
  - [REPL](#repl)
  - [Library](#library)
  - [Concurrency](#concurrency)
  - [Built-ins](#builtins)
  - [Roadmap](#roadmap)
- [Reflective Tower](#reflective-tower)
  - [lisp.lisp vs lisp_full_port.lisp](#lisplisp-vs-lisp_full_portlisp)
  - [Interpreter tower](#interpreter-tower)
  - [Transform](#transform)
  - [Tower functions](#tower-functions)
  - [References](#references)

# Lisp.js

## REPL
Running lisp.js starts a REPL:

```lisp
$ node lisp
h> (if (not (eq? (+ (* 10 2) 20) 400)) 'apple 'orange)
apple
h> (let (k 3) (+ k 6))
9
h> (call (lambda (x y) (* y x)) 2 44)
88
h> (print (cdr (assoc 'title (json (req 'https://jsonplaceholder.typicode.com/todos/1)))))
delectus aut aute
h>
h> (set 'recursive (lambda (x y) (if (eq? x 0) y (recursive (- x 1) (+ y x))))
[Function]
h> (recursive 5 0)
15
```

## Library
lisp.js exports functions: `tokenize`, `parse`, `interpret`, `run`

Using `run` function to execute a program:

```javascript
const { run } = require("./lisp.js");

const program = `
(defun do-request (url)
    (print (cdr (assoc 'title (json (req url))))))

(do-request 'https://jsonplaceholder.typicode.com/todos/1)`;

console.log(run(program));
```

## Concurrency

The interpreter uses promises internally. The function `fork` just returns a promise that can be waited on by `join`.

```lisp
(defun hello ()
  (progn
    (print "concurrent hello")
    (print "concurrent hello")
    (+ 5 5)))

(let (k (fork (hello)))
  (progn
    (print "hello")
    (join k)))

;; Results in:

h> (let (k (fork (hello))) (progn (print "hello") (join k)))
concurrent hello
hello
concurrent hello
10

```

## Builtins

[Full list of builtins: builtins.md](builtins.md)

## Roadmap

- Macros
- Optimization
  - Tail-call optimization
- Quoted lists (?)

# Reflective Tower

`tower/lisp.lisp` is port of the interpreter written in the interpreted hlisp itself.

Because it can also interpret itself, mutliple instances of the interpreter can be nested, making a tower of interpreters.
It is possible to manipulate interpreters while they are running. Going down a level in the tower the language will have changed.
And any part of the interpreters execution can be inspected from any level making the tower "Reflective".

<!-- Interesting case with `map`. Not a builtin in any store, Lives in emulated store of level-1 interpreter, meaning it's a variable in level. -->

## lisp.lisp vs lisp_full_port.lisp

self-interpreter

[meta-circular interpreter](https://en.wikipedia.org/wiki/Meta-circular_evaluator)

Lightweight interpreter:
Universal store "builtins" contains default definitions defined in the host interpreter.
Interpreter specific stores: "level store"

Each interpreter is still interpreted by the level above, but if an interpreter hasn't explicitly defined a function....

like in footnote paper 1

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

## References

- [An Interpreted Scheme Dialect with a Reflective Tower](http://cs242.stanford.edu/f17/assets/projects/2017/stbarnes.pdf)
- [Collapsing Towers of Interpreters](http://lampwww.epfl.ch/~amin/pub/collapsing-towers.pdf)