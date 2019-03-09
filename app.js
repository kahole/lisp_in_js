const { match } = require('egna');


function tokenize(input) {

    input = input.replace(/(\r\n|\n|\r)/gm, " ");
    // console.log(input)

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
    return lexemes.reverse();
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
        (lexemes.pop());
    }
    return ast.reverse();
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
    // console.log(ast);
    if (Array.isArray(ast)) {
        const operator = ast.pop();
        return lookup(env, store, operator)(ast.reverse().map(a => interpret_exp(a, env)), env);
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
    return ast.reverse().map(exp => interpret_exp(exp, env));
}

const run = (src, env) => interpret(parse(tokenize(src)), env);


const builtins = {
    "+": (args) => args[0] + args[1],
    "-": (args) => args[0] - args[1],
    "*": (args) => args[0] * args[1],
    "/": (args) => args[0] / args[1],
    "eq?": (args) => args[0] === args[1],
    "if": (args) => args[0] ? args[1] : args[2],
    "not": (args) => !args[0],
    "set": (args) => {store[args[0].replace("'", "")] = args[1]; return null;},
    "let": (args, env) => {
        const label = args[0].replace("'", "");
        env = {...env, [label]: args[1]};
        return run(args[2].replace("'", ""), env)[0];
    },
    "eval": (args, env) => run(args[0].replace("'", ""), env)[0],
    "lambda": (args, env) => {
        const params = args[0].replace("'", "").replace(/(\(|\))/gm, "").split(" ");
        const ast = parse(tokenize(args[1].replace("'", "")));
        return (lam_args) => {
            // bind args in env
            for (let i = 0; i < params.length; ++i) {
                env = {...env, [params[i]]: lam_args[i]};
            }
            return interpret_exp(ast[0], env);
        }
    },
    "call": (args) => args[0](args.splice(1)),
};

const store = {};



//------------------------------------------------------------
const program = `
(set 'x 'bananpose)
(set 'x 'hallo)

(eval '(+ 111 111))

(set 'reverse_div (lambda '(x y) '(/ y x)))

(reverse_div 2 10)

(call (lambda '(x y) '(* y x)) 2 44)

(if (not (eq? (+ (/ 10 2) 20) 45)) x 'eple)

(let 'k 3 '(+ k 6))

(let 'k 3 '(let 'm 7 '(+ k m)))

(set 'pot (lambda '(x) '(+ x 5)))
(pot 6)
(pot 6)
`;

console.log(run(program, builtins));

// REPL

// var readline = require('readline');
// var rl = readline.createInterface(process.stdin, process.stdout);
// rl.setPrompt('h> ');
// rl.prompt();
// rl.on('line', function(line) {
//     console.log(run(line, builtins)[0]);
//     rl.prompt();
// }).on('close',function(){
//     process.exit(0);
// });
