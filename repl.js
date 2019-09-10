const {tokenize, parse, interpret} = require("./lisp.js");

function REPL() {
  const readline = require("readline");
  const rl = readline.createInterface(process.stdin, process.stdout);
  rl.setPrompt("h> ");
  rl.prompt();
  rl.on("line", async line => {
    if (line.length > 0) {
      try {
        console.log((await interpret(parse(tokenize(line)), {}))[0]);
      } catch (e) {
        console.log(e.message);
      }
    }
    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });
}

if (require.main === module) {
  REPL();
}