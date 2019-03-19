const { match, op } = require('egna');

function tokenize(input) {

    input = input.replace(/(\r\n|\n|\r)/gm, " ");

    const lexemes = [];

    let builder = "";
    const pop_builder = () => { let b = builder; builder = ""; return b};
    let quoting = false;
    let quote_level = 0;
    let quoting_parenths = false;
    
    for (var i = 0; i < input.length; i++) {
        if (quoting) {
            const c = input.charAt(i);
            if (c === ' ' && !quoting_parenths) {
                quoting = false;
            } else if (c == '(') {
                quote_level++;
            } else if (c == ')') {
                if (quoting_parenths) {
                    quote_level--;
                    if (quote_level === 0) {
                        builder += c;
                        quoting = false;
                        continue;
                    }
                } else {
                    quoting = false;
                }
            }
            if (quoting) {
                builder += c;
                continue;
            }
        }
        match(
            '(', c => lexemes.push(c),
            ' ', c => builder.length === 0 ? null : lexemes.push(pop_builder()),
            ')', c => [lexemes.push(pop_builder()), lexemes.push(c)],
            "'", c => {quoting = true; quoting_parenths=(input.charAt(i+1) === '('); builder += c},
            c => {builder += c}
        )
        (input.charAt(i));
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
            '(', l => ast.push(parse(lexemes)),
            ')', l => {popout = true},
            l => ast.push(parse_symbol(l))
        )
        (lexemes.shift());
    }
    return ast;
}

function lookup(env, store, key) {
    if (env.hasOwnProperty(key)) {
        return env[key];
    } else {
        if (store[key] === undefined)
            throw Error("variable not bound: " + key);
        return store[key];
    }
}

function interpret_exp(ast, env) {
    if (Array.isArray(ast)) {
        const operator = ast[0];
        // Special cases for operators that shouldn't have their arguments intepreted immediately
        return match(
            "if", _ => lookup(env, store, operator)([interpret_exp(ast[1], env), ...ast.slice(2)], env),
            op(["let", "lambda"]), _ => lookup(env, store, operator)(ast.slice(1), env),
            _ => lookup(env, store, operator)(ast.slice(1).map(a => interpret_exp(a, env)), env)
        )(operator);

    } else {
        if (typeof ast === "string") {
            if (ast.includes("'")) {
                return ast;
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

const builtins = {
    "+": (args) => args[0] + args[1],
    "-": (args) => args[0] - args[1],
    "*": (args) => args[0] * args[1],
    "/": (args) => args[0] / args[1],
    "eq?": (args) => args[0] === args[1],
    "if": (args, env) => args[0] ? interpret_exp(args[1], env) : interpret_exp(args[2], env),
    "not": (args) => !args[0],
    "set": (args) => {store[args[0].replace("'", "")] = args[1]; return null;},
    "let": (args, env) => {
        const [key, value] = args[0];
        env = {...env, [key]: value};
        return interpret_exp(args[1], env);
    },
    "eval": (args, env) => interpret_exp(parse(tokenize(args[0].replace("'", "")))[0], env),
    "lambda": (args, env) => {
        const [params, body_ast] = args;
        return (lam_args) => {
            for (let i = 0; i < params.length; ++i) {
                env = {...env, [params[i]]: lam_args[i]}; // bind args in env
            }
            return interpret_exp(body_ast, env);
        }
    },
    "call": (args) => args[0](args.splice(1)),
};

const store = {};


function REPL() {
    var readline = require('readline');
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('h> ');
    rl.prompt();
    rl.on('line', (line) => {
        if (line.length > 0)
            console.log(interpret(parse(tokenize(line)), builtins)[0]);
        rl.prompt();
    }).on('close', () => {
        process.exit(0);
    });
}


//------------------------------------------------------------
// TESTS:

const program = `
(set 'x 71)
(set 'x 'hallo)

(eval '(+ 111 111))

(set 'reverse_div (lambda (x y) (/ y x)))

(reverse_div 2 10)

(call (lambda (x y) (* y x)) 2 44)

(if (not (eq? (+ (/ 10 2) 20) 45)) x 'eple)
(if (eq? (+ (/ 10 2) 20) 45) x 'eple)

(let (k 3) (+ k 6))

(let (k 3) (let (m 7) (+ k m)))

(set 'pot (lambda (x) (* x x)))
(pot 6)
(pot 666)

(eval '(eq? '111 '111))
`;

const results = interpret(parse(tokenize(program)), builtins);
const expected = [null, null, 222, null, 5, 88, "'hallo", "'eple", 9, 10, null, 36, 443556, true];
let passed = true;
let fails = [];
for (let i = 0; i < expected.length; ++i) {
    if (expected[i] !== results[i]) {
        passed = false;
        fails.push(i);
    }
}

if (passed) {
    console.log("All tests passed!");
} else {
    fails.forEach( f => console.log("Failed test #" + f));
}

//------------------------------------------------------------

// REPL();
