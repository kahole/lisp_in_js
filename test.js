const {run} = require("./app.js");

const program = `
(set 'x 71)
(set 'x 'hallo)

(eval '(+ 111 111))

(set 'reverse_div (lambda (x y) (/ y x)))

(reverse_div 2 10)

(call (lambda (x y) (* y x)) 2 44)

(if (not (eq? (+ (/ 10 2) 20) 45)) x 'eple)
(if (eq? (+ (/ 10 2) 20) 45) x 'eple)

(let (k 3) (+ k 6))

(let (k 3) (let (m 7) (+ k m)))

(set 'pot (lambda (x) (* x x)))
(pot 6)
(pot 666)

(eval '(eq? '111 '111))
`;

const results = run(program);
const expected = [null, null, 222, null, 5, 88, "'hallo", "'eple", 9, 10, null, 36, 443556, true];
let passed = true;
let fails = [];
for (let i = 0; i < expected.length; ++i) {
    if (expected[i] !== results[i]) {
        passed = false;
        fails.push(i);
    }
}

if (passed) {
    console.log("All tests passed!");
} else {
    fails.forEach( f => console.log("Failed test #" + f));
}
