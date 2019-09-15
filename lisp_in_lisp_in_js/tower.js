const { run } = require("../lisp.js");
const fs = require('fs');

const MAX_LEVELS = 3;
const interpreter_path = __dirname + '/lisp2.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const interpreter_src = data.toString();
  const repl_instance = interpreter_src + ` (repl "lisp-1> ")`;

  run(interpreter_src + ` (init-tower 1 ${MAX_LEVELS})`)
    .then(() => {})
    .catch(console.log)
});