const { match, op } = require("egna");
const fetch = require('node-fetch');
const readline = require('readline');

function tokenize(input) {
  input = input.replace(/(\r\n|\n|\r)/gm, " "); // make all whitespace space characters

  const lexemes = [];
  let lex_builder = "";
  let quote_level = 0;
  let is_string_literal = false;

  const pop_lex_builder = () => {
    let b = lex_builder;
    lex_builder = "";
    return b;
  };

  for (let c of input) {

    if (quote_level >= 1) {
      if (c === " " && quote_level <= 1) { //stop quoting if hit space char and below level 1 quoting
        quote_level = 0;
      } else if (c === "(") {
        quote_level++;
      } else if (c === ")") {
        quote_level--;
      }
      if (quote_level >= 1) {
        lex_builder += c;
        continue;
      }
    }

    if (is_string_literal) {
      if (c === "\"") {
        is_string_literal = false;
      }
      lex_builder += c;
      continue;
    }

    match(
      "(", c => lexemes.push(c),
      " ", c => (lex_builder.length === 0 ? null : lexemes.push(pop_lex_builder())),
      ")", c => [lex_builder.length === 0 ? null : lexemes.push(pop_lex_builder()), lexemes.push(c)],
      "'", c => {
        quote_level = 1;
        lex_builder += c;
      },
      "\"", c => {
        is_string_literal = true;
        lex_builder += c;
      },
      c => { lex_builder += c; }
    )(c);
  }
  return lexemes;
}

const contains = c => (m) => m.includes(c);

function parse_symbol(s) {
  if (isNaN(s)) {
    return match(
      "true", s => true,
      "false", s => false,
      s => s
    )(s);
  } else {
    return +s;
  }
}

function parse(lexemes) {
  const ast = [];

  let popout = false;
  while (lexemes.length > 0 && !popout) {
    match(
      "(", l => ast.push(parse(lexemes)),
      ")", l => { popout = true; },
      l => ast.push(parse_symbol(l))
    )(lexemes.shift());
  }
  return ast;
}

function lookup(env, store, key) {
  if (env.hasOwnProperty(key)) {
    return env[key];
  } else {
    if (store[key] === undefined) throw Error("Variable not bound: " + key);
    return store[key];
  }
}

async function interpret_exp(ast, env) {
  if (Array.isArray(ast)) {
    const operator = ast[0];
    const proc = lookup(env, store, operator);
    // Special cases for operators that shouldn't have their arguments intepreted immediately.
    return match(
      op(["if", "match"]), async _ => proc([await interpret_exp(ast[1], env), ...ast.slice(2)], env),
      op(["let", "lambda", "defun"]), async _ => proc(ast.slice(1), env),
      async _ => {
        const args = ast.slice(1);
        const results = []; 
        for (let i = 0; i < args.length; i++) {
          results.push(await interpret_exp(args[i], env));
        }
        return await proc(results, env);
      }
    )(operator);
    // TODO: tail call optimization
  } else {
    if (typeof ast === "string") {
      if (ast[0] === "'") {
        return parse([ast.slice(1)])[0];
      } else if (ast[0] === "\"") {
        return ast.replace(/"/g, "");
      } else {
        return lookup(env, store, ast);
      }
    } else {
      return ast;
    }
  }
}

async function interpret(ast, env) {

  const results = [];
  for (let i = 0; i < ast.length; i++) {
    let exp = ast[i];
    results.push(await interpret_exp(exp, env));
  }

  return results;
}

const store = {
  "+": args => args.reduce((sum, arg) => arg+sum, 0),
  "-": args => args.length > 1 ? args.slice(1).reduce((sum, arg) => sum-arg, args[0]) : (-args[0]),
  "*": args => args.reduce((sum, arg) => sum*arg, 1),
  "/": args => args.splice(1).reduce((sum, arg) => sum/arg, args[0]),
  "eq?": args => args[0] === args[1],
  "if": (args, env) => args[0] ? interpret_exp(args[1], env) : interpret_exp(args[2], env),
  "not": args => !args[0],
  "cons": args => (args[1] ? [args[0], ...args[1]] : [args[0]]),
  "list": args => args,
  "car": args => args[0][0],
  "cdr": args => args[0].slice(1),
  "length": args => args[0].length,
  "assoc": args => {
    const pair = args[1].find(e => e[0] === args[0]);
    return pair ? pair : [];
  },
  "set": args => {
    store[args[0]] = args[1];
    return args[1];
  },
  "defun": (args, env) => { // can be made as a macro expanding to set and lambda combined
    store[args[0]] = store["lambda"](args.slice(1), env);
    return store[args[0]];
  },
  "let": (args, env) => {
    const [key, value] = args[0];
    env = { ...env, [key]: interpret_exp(value, env) };
    return interpret_exp(args[1], env);
  },
  "lambda": (args, env) => {
    const [params, body_ast] = args;
    return lam_args => {
      for (let i = 0; i < params.length; ++i) {
        env = {...env, [params[i]]: lam_args[i]}; // bind args in env
      }
      return interpret_exp(body_ast, env);
    };
  },
  "call": args => args[0](args.splice(1)),
  "eval": (args, env) => interpret_exp(parse(tokenize(args[0]))[0], env),
  "proc": args => args[args.length-1],
  "print": args => console.log(JSON.stringify(args[0])),
  "req": args => {
    return fetch(args[0])
      .then(res => res.text());
  },
  "json": args => {
    const obj = JSON.parse(args[0]);
    return Object.keys(obj).map(k => [k, obj[k]]);
  },
  "read": (prompt) => {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(prompt, (answer) => {
        resolve(answer);
        rl.close();
      });
    });
  },
  "match": async (args, env) => {
    const val = args[0];
    for (let i = 1; i < args.length-2; i+=2) {
      if (val === await interpret_exp(args[i], env)) {
        return interpret_exp(args[i+1], env);
      }
    }
    return interpret_exp(args[args.length-1], env);
  },
  "slice": args => args[2].slice(args[0], args[1]),
  "append": args => [...args[0], ...args[1]],
  "nth": args => args[1][args[0]],
  "flat-length": args => args[0].flat().length,
  "nil": [],
  "infer-type": args => parse_symbol(args[0]),
  "type": args => typeof args[0],
  "is-list": args => Array.isArray(args[0]),
  // String functions
  "concat": args => args.reduce((str, arg) => str+arg, ""),
  "substring": args => args[2].substring(args[0], args[1]),
  // "includes": args => args[0].includes(args[1]),
  "replace": args => args[2].replace(args[0], args[1]),
  
};

module.exports = {
  tokenize,
  parse,
  interpret,
  run: src => interpret(parse(tokenize(src)), {})
};
