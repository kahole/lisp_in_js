const { run, repl } = require("../lisp.js");
const fs = require('fs');

const interpreter_path = __dirname + '/lisp.lisp';

fs.readFile(interpreter_path, function (err, data) {
  if (err) {
    throw err; 
  }

  const max_level = process.argv[2] ? process.argv[2]-1 : 2;
  
  const interpreter_src = data.toString();
  const level = max_level;

  if (level > 0) {
    run(interpreter_src)
      .then(() => run(`(init-tower ${level-1})`))
      .then((res) => {
        console.log(res[0]);
        repl("lisp-base> ");
      })
      .catch(console.log)
  } else {
    repl(`lisp-base> `);
  }
});
