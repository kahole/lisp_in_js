const { run } = require("../lisp.js");
const fs = require('fs');

fs.readFile( __dirname + '/lisp2.lisp', function (err, data) {
  if (err) {
    throw err; 
  }

  run(data.toString())
    .then(() => {})
    .catch(console.log)
});