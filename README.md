Lisp interpreter in Javascript
---
##### Table of Contents
1. [REPL](#repl)
2. [Library](#lib)
3. [Built-ins list](#builtins)
4. [Roadmap](#roadmap)

#### REPL <a name="repl"></a>
Running repl.js gives you a lisp prompt:

```lisp
$ node repl

h> (+ 2 3)
5
h> (set 'var 'apple)
apple
h> (if (not (eq? (+ (* 10 2) 20) 400)) var 'orange)
apple
h> (set 'pow2 (lambda (x) (* x x)))
[Function]
h> (pow2 5)
25
h> (let (k 3) (+ k 6))
9
h> (call (lambda (x y) (* y x)) 2 44)
88
h> (set 'x (list (list 'a 5)))
[ [ 'a', 5 ] ]
h> (cdr (assoc 'a x))
5
h>
h> (print (cdr (assoc 'title (json (req 'https://jsonplaceholder.typicode.com/todos/1)))))
delectus aut aute
h>
h> (set 'recursive (lambda (x y) (if (eq? x 0) y (recursive (- x 1) (+ y x))))
[Function]
h> (recursive 5 0)
15
h>
```

#### Library <a name="lib"></a>
lisp.js exports functions: `tokenize`, `parse`, `interpret`, `run`

Using `run` function to execute a program:

```javascript
const {run} = require("./lisp.js");

const program = `

(print (cdr (assoc 'title (json (req 'https://jsonplaceholder.typicode.com/todos/1)))))

(set 'reverse_div (lambda (x y) (/ y x)))

(reverse_div 2 10)

(call (lambda (x y) (* y x))
    2 44)

(if (not (eq? (+ (/ 10 2) 20) 45))
    (reverse_div 20 100)
    (let (k 3) (+ k 6)))

(let (k 3)
    (let (m (- 10 5))
        (+ k m)))

(set 'pot (lambda (x) (* x x)))
(pot 6)
(pot 66)

(eval '(eq? 111 111))
`;

console.log(run(program));
```
    
### Built-ins <a name="builtins"></a>

| Function |   |
|----------|---|
| `+`      | `(+ &rest NUMBERS)` Returns sum of given args. |
| `-`      | `(- first &rest NUMBERS)` Subtract numbers from the first number. If only one number given, it is negated. |
| `*`      | `(+ &rest NUMBERS)` Returns product of given args. |
| `/`      | `(+ first &rest NUMBERS)` Returns division of first and the rest of the given args. |
| `eq?`    | `(eq? a b)` Checks for equality between a and b. Returns true/false  |
| `if`     |   |
| `not`    |   |
| `cons`   |   |
| `car`    |   |
| `cdr`    |   |
| `list`   |   |
| `assoc`  |   |
| `set`    |   |
| `defun`  |   |
| `let`    |   |
| `lambda` |   |
| `call`   |   |
| `eval`   |   |
| `print`  |   |
| `req`    |   |
| `json`   |   |

### Roadmap <a name="roadmap"></a>

- Quoted lists?
  - Assoc lists?
- proper cons-cells (?)
- Datastructure around types ?
- Macros
- Tail-call optimization
- Concurrency, forking interpreter
- Docs for all functions
