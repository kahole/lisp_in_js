const { match, op } = require("egna");
const https = require("https");

function tokenize(input) {
  input = input.replace(/(\r\n|\n|\r)/gm, " "); // make all whitespace space characters

  const lexemes = [];
  let lex_builder = "";
  let quote_level = 0;

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
    
    match(
      "(", c => lexemes.push(c),
      " ", c => (lex_builder.length === 0 ? null : lexemes.push(pop_lex_builder())),
      ")", c => [lex_builder.length === 0 ? null : lexemes.push(pop_lex_builder()), lexemes.push(c)],
      "'", c => {
        quote_level = 1;
        lex_builder += c;
      },
      c => { lex_builder += c; }
    )(c);
  }
  return lexemes;
}

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
    if (store[key] === undefined) throw Error("variable not bound: " + key);
    return store[key];
  }
}

function interpret_exp(ast, env) {
  if (Array.isArray(ast)) {
    const operator = ast[0];
    const proc = lookup(env, store, operator);
    // Special cases for operators that shouldn't have their arguments intepreted immediately
    return match(
      "if", _ => proc([interpret_exp(ast[1], env), ...ast.slice(2)], env),
      op(["let", "lambda", "defun"]), _ => proc(ast.slice(1), env),
      _ => proc(ast.slice(1).map(a => interpret_exp(a, env)), env)
    )(operator);
  } else {
    if (typeof ast === "string") {
      if (ast.includes("'")) {
        return parse([ast.slice(1)])[0];
      } else {
        return lookup(env, store, ast);
      }
    } else {
      return ast;
    }
  }
}

function interpret(ast, env) {
  return ast.map(exp => interpret_exp(exp, env));
}

const store = {
  "+": args => args[0] + args[1],
  "-": args => args[0] - args[1],
  "*": args => args[0] * args[1],
  "/": args => args[0] / args[1],
  "eq?": args => args[0] === args[1],
  "if": (args, env) => args[0] ? interpret_exp(args[1], env) : interpret_exp(args[2], env),
  "not": args => !args[0],
  "cons": args => (args[1] ? [args[0], ...args[1]] : [args[0]]),
  "list": args => args,
  "car": args => args[0][0],
  "cdr": args => args[0][1],
  "assoc": args => args[1].find(e => e[0] === args[0]),
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
  "print": args => console.log(args[0]),
  "req": args => {https.get(args[0], res => {
    let body = "";
    res.on("data", data => {
      body += data;
    }).on("end", () => args[1]([body]));
  })},
  "json": args => {
    const obj = JSON.parse(args[0]);
    return Object.keys(obj).map(k => [k, obj[k]]);
  }
};

module.exports = {
  tokenize,
  parse,
  interpret,
  run: src => interpret(parse(tokenize(src)), {})
};
