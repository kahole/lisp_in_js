const { run, repl } = require("../lisp.js");
const fs = require('fs');

const interpreter_path = __dirname + '/lisp2.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const max_levels = (process.argv[2]-1) || 2;
  
  const interpreter_src = data.toString();
  const repl_instance = interpreter_src + ` (repl "lisp-1> ")`;

  run(interpreter_src)
    .then(() => run(`(init-tower 1 ${max_levels})`))
    .then((res) => {
      console.log(res[0]);
      repl("lisp-0> ");
    })
    .catch(console.log)

});