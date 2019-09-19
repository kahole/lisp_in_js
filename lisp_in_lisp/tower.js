const { run, repl } = require("../lisp.js");
const fs = require('fs');

const interpreter_path = __dirname + '/lisp2.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const max_level = process.argv[2] ? process.argv[2]-1 : 2;
  
  const interpreter_src = data.toString();
  const level = 0;

  if (level < max_level) {
    run(interpreter_src)
      .then(() => run(`(init-tower ${level+1} ${max_level})`))
      .then((res) => {
        console.log(res[0]);
        repl("lisp-base> ");
      })
      .catch(console.log)
  } else {
    repl(`lisp-base> `);
  }
});
