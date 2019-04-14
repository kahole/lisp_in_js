const {run} = require("./app.js");

const program = `
(set 'x 71)
(set 'x 'hallo)

(eval '(+ 112 (eval '(+ 55 55))))

(set 'reverse_div (lambda (x y) (/ y x)))

(reverse_div 2 10)

(call (lambda (x y) (* y x))
    2 44)

(if (not (eq? (+ (/ 10 2) 20) 45))
    x
    'eple)

(if (eq? (+ (/ 10 2) 20) 45)
    x
    'eple)

(let (k 3) (+ k 6))

(let (k 3)
    (let (m 7)
        (+ k m)))

(set 'pot (lambda (x) (* x x)))
(pot 6)
(pot 66)

(eval '(eq? '111 '111))

(cdr (assoc 'a (list (list 'b 9) (list 'a 5))))

(set 'rec (lambda (x y) (if (eq? x 0) (+ y 0) (rec (- x 1) (+ y x)))))

(rec 5 0)
`;

const results = run(program);
const expected = [71, "hallo", 222, "function", 5, 88, "hallo", "eple", 9, 10, "function", 36, 4356, true, 5, "function", 15];

let passed = true;
let fails = [];
for (let i = 0; i < expected.length; ++i) {
  if (expected[i] === "function")
    continue;
  if (expected[i] !== results[i]) {
    passed = false;
    fails.push(i);
  }
}

if (passed) {
  console.log("All tests passed!");
} else {
  fails.forEach( f => console.log("Failed test #" + (f+1)));
}
