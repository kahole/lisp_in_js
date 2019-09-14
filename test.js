import test from 'ava';
const fs = require('fs');
const {run, interpret, parse, tokenize} = require("./lisp.js");

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

test("Set global variable x", async t => {
  const expected = 1;
  const value = interpret_string("(set 'x 1)");
  t.is(await value, expected);
});

test("Nested eval of quoted expressions", async t => {
  const expected = 222;
  const value = interpret_string("(eval '(+ 112 (eval '(+ 55 55))))");
  t.is(await value, expected);
});

test("Set lambda to variable and call in progn expressions", async t => {
  const expected = 5;
  const value = interpret_string("(progn (set 'reverse_div (lambda (x y) (/ y x))) (reverse_div 2 10))");
  t.is(await value, expected);
});

test("Lambda with double use of variable x", async t => {
  const expected = 25;
  const value = interpret_string("(progn (set 'pot (lambda (x) (* x x))) (pot 5))");
  t.is(await value, expected);
});

test("Recursive lambda", async t => {
  const expected = 15;
  const value = interpret_string("(progn (set 'rec (lambda (x y) (if (eq? x 0) (+ y 0) (rec (- x 1) (+ y x))))) (rec 5 0))");
  t.is(await value, expected);
});

test("Directly call lambda expression using call function", async t => {
  const expected = 88;
  const value = interpret_string("(call (lambda (x y) (* y x)) 2 44)");
  t.is(await value, expected);
});

test("If expression with not", async t => {
  const expected = "eple";
  const value = interpret_string("(if (not (eq? (+ (/ 10 2) 20) 45)) 'eple x)");
  t.is(await value, expected);
});

test("Let expression with addition", async t => {
  const expected = 9;
  const value = interpret_string("(let (k 3) (+ k 6))");
  t.is(await value, expected);
});

test("Nested let expression with addition", async t => {
  const expected = 10;
  const value = interpret_string("(let (k 3) (let (m 7) (+ k m)))");
  t.is(await value, expected);
});

test("Defun and call function with strings", async t => {
  const expected = "testhello";
  const value = interpret_string(`(progn (defun add-hello (str) (concat str "hello")) (add-hello "test"))`);
  t.is(await value, expected);
});

// Full program

test("Running mutli-line program", async t => {
  const expected = "testhello";
  const value = (await run(program))[5];
  t.is(value, expected);
});


// LISP IN LISP IN JS INTERPRETER TESTS


let lisp2_interpret_string;

test.before(async t => {

  return new Promise((resolve) => {
    
    const interpreter_path = __dirname + '/lisp_in_lisp_in_js/lisp2.lisp';
    fs.readFile(interpreter_path, function (err, data) {
      if (err) {
        throw err; 
      }

      const interpreter_src = data.toString();

      lisp2_interpret_string = async str => {
        const results = await run(interpreter_src + ` (run-program ` + `"` + str + `"` + `)`);
        return results[results.length - 1][0];
      };
      resolve();
    });
  });
});


test("LISP2: Set global variable x", async t => {
  const expected = 1;
  const value = lisp2_interpret_string("(set 'x 1)");
  t.is(await value, expected);
});

// TODO: finn smartere måte å kjøre de samme testene 