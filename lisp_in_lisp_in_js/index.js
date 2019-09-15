const { run } = require("../lisp.js");
const fs = require('fs');

const interpreter_path = __dirname + '/lisp2.lisp';

const example_path = __dirname + '/../example.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const LEVELS = 2;

  const interpreter_src = data.toString();

  const repl_instance = interpreter_src + ` (repl "lisp-1> ")`;

  // TODO: generate levels
  // and implement lift and whatever, to move between repls.. every lisp-lisp interpreter should have a repl at least
  //        (lift '(set store ))
  // MEST MULIG I LISP

  run(interpreter_src
      + ` (run-program (concat (file "${interpreter_path}") "(tower-repl \\\"lisp-2> \\\")"))` + ` (tower-repl "lisp-1> ")`)
  // run(repl_instance)
    .then(() => {})
    .catch(console.log)
});