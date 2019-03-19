Lisp interpreter in Javascript
---

All the code resides in app.js

Running app.js gives you a lisp prompt:

```lisp
$ node app

h> (+ 2 3)
5
h> (set 'my_var 'apple)
null
h> (if (not (eq? (+ (* 10 2) 20) 400)) my_var 'orange)
'apple
h> (set 'pow2 (lambda (x) (* x x)))
null
h> (pow2 5)
25
h> (let (k 3) (+ k 6))
9
h> (let (k (- 10 5)) (+ k 5))
10
h> (eval '(+ 111 111))
222
h> (call (lambda (x y) (* y x)) 2 44)
88
h> 
```

app.js also exports a `run` function for executing programs:

```javascript
const {run} = require("./app.js");

const program = `
(set 'x 'hallo)

(set 'reverse_div (lambda (x y) (/ y x)))

(reverse_div 2 10)

(call (lambda (x y) (* y x))
    2 44)

(if (not (eq? (+ (/ 10 2) 20) 45))
    (reverse_div 20 100)
    (let (k 3) (+ k 6)))

(let (k 3)
    (let (m 7)
        (+ k m)))

(set 'pot (lambda (x) (* x x)))
(pot 6)
(pot 66)

(eval '(eq? '111 '111))
`;

console.log(run(program));
```
