Lisp interpreter in Javascript
---
##### Table of Contents
1. [REPL](#repl)
2. [Library](#lib)
3. [Built-ins list](#builtins)
4. [Lisp-in-lisp-in-js](#lisp2)
5. [Roadmap](#roadmap)

#### REPL <a name="repl"></a>
Running lisp.js gives you a lisp prompt:

```lisp
$ node repl

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

#### Library <a name="lib"></a>
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
    
### Built-ins <a name="builtins"></a>

| ......Name...... | Explanation  |
|----------|---|
| `+`      | `(+ &rest NUMBERS)` Returns sum of given args. |
| `-`      | `(- NUMBER &rest NUMBERS)` Subtract numbers from the first number. If only one number given, it is negated. |
| `*`      | `(* &rest NUMBERS)` Returns product of given args. |
| `/`      | `(/ NUMBER &rest NUMBERS)` Returns division of first and the rest of the given args. |
| `eq?`    | `(eq? OBJECT OBJECT)` Checks for equality between two args. Returns true/false  |
| `<`     |   |
| `>`     |   |
| `if`     |   |
| `not`    |   |
| `cons`   |   |
| `list`   |   |
| `car`    |   |
| `cdr`    |   |
| `length`    |   |
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
| `read`   |   |
| `file`   |   |
| `match`   |   |
| `slice`   |   |
| `append`   |   |
| `nth`   |   |
| `flat-length`   |   |
| `nil`   | `nil` Empty list  |
| `infer-type`   |   |
| `type`   | `(type OBJECT)` Returns the type of the given arg. |
| `is-list`   | `(is-list OBJECT)` Returns true if arg is a list, otherwise false. |
| `concat`   |   |
| `substring`   |   |
| `replace`   |   |
| `sanitize`   |   |

### Lisp-in-lisp-in-js <a name="lisp2"></a>

Can manipulate the interpreter while its running. Going up a level the language will have changed.

Interesting case with `map`. Not a builtin in any store, Lives in store of level-1 interpreter, meaning it's a variable in level.


### Roadmap <a name="roadmap"></a>

- Optimization
  - Using current assoc list implementation for store and env is terrible for performance
  - Tail-call optimization
- Quoted lists (?)
  - proper assoc lists
- Macros
- Datastructure around types (?)
- Concurrency, forking interpreter
- Docs for all functions
