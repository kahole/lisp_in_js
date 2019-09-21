import test from 'ava';
const fs = require('fs');
const {run, interpret, parse, tokenize} = require("../lisp.js");

const program = `
(call (lambda (x y) (* y x))
    2 44)

(if (not (eq? (+ (/ 10 2) 20) 45))
    x
    'eple)

(let (k 3)
    (let (m 7)
        (+ k m)))

(car (cdr (assoc 'a (list (list 'b 9) (list 'a 5)))))

(defun add-hello (str) (concat str "hello"))

(add-hello "test")
`;

const interpret_string = async str => (await interpret(parse(tokenize(str)), {}))[0];

// Load lisp-in-lisp-in-js interpreter

const interpreter_path = __dirname + '/../tower/lisp_full_port.lisp';
const interpreter_src = fs.readFileSync(interpreter_path).toString();

const lisp2_interpret_string = async str => {
  const results = await run(interpreter_src + ` (run-program ` + `"` + str + `"` + `)`);
  return results[results.length - 1][0];
};

const lisp2_run = async str => {
  const results = await run(interpreter_src + ` (run-program ` + `"` + str + `"` + `)`);
  return results[results.length - 1];
};


async function macro(t, interpret_func, input, expected) {
  const value = interpret_func(input);
  t.is(await value, expected);
}

macro.title = (providedTitle = '') => `${providedTitle}`.trim();



[{ interpret_func: interpret_string, qualifier: "Lisp-0> "},
 { interpret_func: lisp2_interpret_string, qualifier: "Lisp-1> "}]
  .forEach(({interpret_func, qualifier}) => {
   
   // Tests

   test(qualifier + "Set global variable x", macro, interpret_func, "(set 'x 1)", 1);

   test(qualifier + "Nested eval of quoted expressions", macro, interpret_func, "(eval '(+ 112 (eval '(+ 55 55))))", 222);

   test(qualifier + "Set lambda to variable and call in progn expressions", macro, interpret_string, "(progn (set 'reverse_div (lambda (x y) (/ y x))) (reverse_div 2 10))", 5);

   test(qualifier + "Lambda with double use of variable x", macro, interpret_func, "(progn (set 'pot (lambda (x) (* x x))) (pot 5))", 25);

   test(qualifier + "Recursive lambda", macro, interpret_func, "(progn (set 'rec (lambda (x y) (if (eq? x 0) (+ y 0) (rec (- x 1) (+ y x))))) (rec 5 0))", 15);

   test(qualifier + "Directly call lambda expression using call function", macro, interpret_func, "(call (lambda (x y) (* y x)) 2 44)", 88);

   test(qualifier + "If expression with not", macro, interpret_func, "(if (not (eq? (+ (/ 10 2) 20) 45)) 'eple x)", "eple");

   test(qualifier + "Let expression with addition", macro, interpret_func, "(let (k 3) (+ k 6))", 9);

   test(qualifier + "Nested let expression with addition", macro, interpret_func, "(let (k 3) (let (m 7) (+ k m)))", 10);

   test(qualifier + "Defun and call function with strings", macro, interpret_func, `(progn (defun add-greeting (str) (concat str "hello")) (add-greeting "test"))`, "testhello");

    test(qualifier + "String double-quote", macro, interpret_string, `(concat "\\\"" "\\\"")`, `""`);

 });


// const strs = '\\"\\\\\\"\\" \\"\\\\\\"\\"';

// test("Lisp-1> " + "String double-quote", macro, lisp2_interpret_string, `(concat ${strs})`, `""`);

// test(qualifier + "Heavy string escape slash and double-quote", macro, interpret_func, `(concat "\"\\\"" "\\\"\\")`, "\"\\\"\\\"\\");

// Lisp1 - Full program

test("Lisp-0> Running mutli-line program", async t => {
  const expected = "testhello";
  const value = (await run(program))[5];
  t.is(value, expected);
});

// Lisp2 - Full program
test("Lisp-1> Running mutli-line program", async t => {
  const expected = "testhello";
  const value = (await lisp2_run(program))[5];
  t.is(value, expected);
});
