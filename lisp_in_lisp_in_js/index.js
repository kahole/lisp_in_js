const { run } = require("../lisp.js");
const fs = require('fs');

const interpreter_path = __dirname + '/lisp2.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const LEVELS = 1;

  const interpreter_src = data.toString();

  const repl_instance = interpreter_src + ` (repl "h2> ")`;

  // TODO: generate levels
  // and implement lift and whatever, to move between repls.. every lisp-lisp interpreter should have a repl at least

  run(interpreter_src
      + ` (run-program (concat (file "${interpreter_path}") "(repl \\\"h3> \\\")"))`)
  // run(repl_instance)
    .then(() => {})
    .catch(console.log)
});