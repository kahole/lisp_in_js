const { tokenize, parse, interpret, readNext } = require("../lisp");

let baseStores = [];

let addInterpreter = async () => {

  let capturedLevel = baseStores.length;
  
  baseStores.push({
    level: capturedLevel,
    "old-cont": args => args[0],
    "transform": args => args[0],
    "em-cont": async (args) => repl(capturedLevel + 1),
    "em": async (args) => {
      let metaStore = baseStores[capturedLevel + 2];
      return await eval(args[0], metaStore, capturedLevel + 1);
    }
  });
};

async function repl(level) {

  const line = await readNext(`lisp-${level}> `);

  if (line) {

    let storeAbove = baseStores[level + 1];
    let res = await eval(line, storeAbove, level);

    if (line.slice(0, 9) === "(old-cont") {
      return res;
    }
    console.log(res);
  }
  return repl(level);
}

async function eval(line, metaStore, level) {

  if (level + 2 >= baseStores.length) {
    await addInterpreter();
  }

  let ast = parse(tokenize(line));

  let output = await interpret(await metaStore.transform([ast]), {}, baseStores[level]);

  return output[0];
}

(async () => {

  await addInterpreter();
  await addInterpreter();

  if (require.main === module) {
    repl(0);
  }
})();