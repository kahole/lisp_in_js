Lisp interpreter in Javascript
---

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
h> (req 'https://jsonplaceholder.typicode.com/todos/1 (lambda (msg) (print (cdr (assoc 'title (json msg)))))
undefined
delectus aut aute
h>
h> (set 'recursive (lambda (x y) (if (eq? x 0) y (recursive (- x 1) (+ y x))))
[Function]
h> (recursive 5 0)
15
h>
```

lisp.js exports a `run` function for executing programs:

```javascript
const {run} = require("./lisp.js");

const program = `

(req 'https://jsonplaceholder.typicode.com/todos/1
    (lambda (msg)
            (print (assoc 'title (json msg))))

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

### builtins

| Function |   |
|----------|---|
| `+`      |   |
| `-`      |   |
| `*`      |   |
| `/`      |   |
| `eq?`    |   |
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
