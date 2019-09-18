Lisp interpreter in Javascript
---
##### Table of Contents
1. [REPL](#repl)
2. [Library](#lib)
3. [Built-ins list](#builtins)
4. [Concurrency](#concurrency)
5. [Lisp-in-lisp and Interpreter tower](#lisp2)
6. [Roadmap](#roadmap)

#### REPL <a name="repl"></a>
Running lisp.js gives you a lisp prompt:

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
| `<   | `(< NUMBER NUMBER)` Less-than. Return true if $1 less than $2 |
| `>`   | `(> NUMBER NUMBER)` Greater-than. Return true if $1 greater than $2 |
| `if`   | `(if OBJECT->BOOLEAN OBJECT OBJECT)` If-statement. If condition is true interpret $2, if not interpret $3. Returns value returned by chosen execution path. |
| `not`   | `(not BOOLEAN)` Negate boolean. |
| `cons`   | `(const OBJECT CONS-CELL-LIST-OR-NIL)` Create a cons cell with $1 as car, and $2 as cdr. |
| `list`   | `(list &rest OBJECT)` Create a list of n elements. |
| `car`   | `(car CONS-CELL-OR-LIST)` Returns the head element of a cons-cell or list. |
| `cdr`   | `(cdr CONS-CELL-OR-LIST)` Returns the tail of a cons-cell or list. |
| `length`   | `(length LIST)` Returns the length a list. |
| `assoc`  |   |
| `set`   | `(set QUOTED-SYMBOL OBJECT)` Set a global variable named by a qutoed symbol, given the value of $2. |
| `defun`   | `(defun STRING LIST BODY)` Set a named function given a name, list of args, and a function body. |
| `let`   | `(let (SYMBOL OBJECT) BODY)` Create variable in the environment of the provided body. |
| `lambda`   | `(lambda LIST BODY)` Create function given a list of args, and a function body. |
| `call`   | `(call FUNC)` Call function. |
| `eval`   | `(eval QUOTATION)` Eval quoted code. |
| `progn`   | `(progn OBJECT &rest OBJECT)` Multi-expression statement. Executes all expressions in its body, and returns the return value of the last one. |
| `print`   | `(print OBJECT)` stdout, prints anything. |
| `req`   | `(req STRING)` HTTP request. Returns the content at URL provided. |
| `json`   | `(json STRING)` Returns a assoc list constructed by parsing the provided JSON-string. |
| `read`   | `(read STRING)` Read from stdin using arg as a prompt. |
| `file`   | `(file STRING)` Returns the text content of file at path $1. |
| `match`   |   |
| `slice`   | `(slice NUMBER NUMBER LIST)` Returns list slice containing the elements from index $1 to $2. |
| `append`   | `(append LIST LIST)` Returns a list containing all the elements of the arg lists. |
| `nth`   | `(nth NUMBER LIST)` Returns the nth element in the list. |
| `flat-length`   | `(flat-length LIST)` Returns the count of elements in a list plus any sublists. |
| `nil`   | `nil` Empty list  |
| `infer-type`   | `(infer-type OBJECT)` Makes any symbol its expected type. E.g checks if its a number or a bool, and makes the object use that type in the underlying JS. |
| `type`   | `(type OBJECT)` Returns the type of the given arg. |
| `is-list`   | `(is-list OBJECT)` Returns true if arg is a list, otherwise false. |
| `concat`   | `(concat STRING STRING)` |
| `substring`   | `(substring NUMBER NUMBER STRING)` |
| `replace`   | `(replace STRING STRING STRING)` Replace instances of $1 with $2, in target string $3. |
| `sanitize`   | `(sanitize STRING)` Returns the string stripped of newlines. |
| `dict`   | `(dict LIST-OF-LIST-OF-KEY-VALUE)` Returns a dictionary from a list of lists containing key-value pairs. |
| `put-dict`   | `(put-dict LIST-OF-KEY-VALUE DICT)` Adds a record to given dict, and returns the new dict. Does not modify original dict. |
| `get-dict`   | `(get-dict KEY-NUMBER-OR-STRING DICT)` Get record from dict based on key. |
| `merge-dict`   | `(merge-dict DICT1 DICT2)` Merge dictionaries. |
| `throw`   | `(throw OBJECT)` Throws exception. |
| `fork`   | `(fork ANY)` Forks process, returns a reference to the process. |
| `join`   | `(join PROCESS-REF)` Wait for process to return. |

### Concurrency <a name="concurrency"></a>

Interpreter uses promises internally. Thus `fork` just returns a promise that can be waited on by `join`.

```
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

### Lisp-in-lisp and Interpreter tower <a name="lisp2"></a>

Full readme about the `lisp_in_lisp` port of the interpreter written in the interpreted lisp here:
[Lisp in lisp](lisp_in_lisp/README.md)

Because it can interpret itself, you can nest mutliple instances of the interpreter.
This makes it possible to manipulate the interpreter while its running. Going up a level in the tower the language will have changed.

Interesting case with `map`. Not a builtin in any store, Lives in emulated store of level-1 interpreter, meaning it's a variable in level.


### Roadmap <a name="roadmap"></a>

- Macros
- Optimization
  - Tail-call optimization
- Quoted lists (?)
