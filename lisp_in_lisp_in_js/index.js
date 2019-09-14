const { run } = require("../lisp.js");
const fs = require('fs');

const interpreter_path = __dirname + '/lisp2.lisp';

const example_path = __dirname + '/../example.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const LEVELS = 1;

  const interpreter_src = data.toString();

  const repl_instance = interpreter_src + ` (repl "h2> ")`;

  // TODO: generate levels
  // and implement lift and whatever, to move between repls.. every lisp-lisp interpreter should have a repl at least
  // MEST MULIG I LISP

  run(interpreter_src
      + ` (run-program (concat (file "${interpreter_path}") "(repl \\\"h3> \\\")"))` + ` (repl "h2> ")`)
  // run(repl_instance)
    .then(() => {})
    .catch(console.log)
});