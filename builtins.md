# Builtins

| &nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp; | Explanation  |
|----------|---|
| `+`      | `(+ &rest NUMBERS)` Returns sum of given args. |
| `-`      | `(- NUMBER &rest NUMBERS)` Subtract numbers from the first number. If only one number given, it is negated. |
| `*`      | `(* &rest NUMBERS)` Returns product of given args. |
| `/`      | `(/ NUMBER &rest NUMBERS)` Returns division of first and the rest of the given args. |
| `eq?`    | `(eq? OBJECT OBJECT)` Checks for equality between two args. Returns true/false  |
| `<   | `(< NUMBER NUMBER)` Less-than. Return true if $1 less than $2 |
| `>`   | `(> NUMBER NUMBER)` Greater-than. Return true if $1 greater than $2 |
| `if`   | `(if OBJECT->BOOLEAN OBJECT OBJECT)` If-statement. If condition is true interpret $2, if not interpret $3. Returns value returned by chosen execution path. |
| `not`   | `(not BOOLEAN)` Negate boolean. |
| `cons`   | `(const OBJECT CONS-CELL-LIST-OR-NIL)` Create a cons cell with $1 as car, and $2 as cdr. |
| `list`   | `(list &rest OBJECT)` Create a list of n elements. |
| `car`   | `(car CONS-CELL-OR-LIST)` Returns the head element of a cons-cell or list. |
| `cdr`   | `(cdr CONS-CELL-OR-LIST)` Returns the tail of a cons-cell or list. |
| `length`   | `(length LIST)` Returns the length a list. |
| `assoc`  |   |
| `set`   | `(set QUOTED-SYMBOL OBJECT)` Set a global variable named by a qutoed symbol, given the value of $2. |
| `defun`   | `(defun STRING LIST BODY)` Set a named function given a name, list of args, and a function body. |
| `let`   | `(let (SYMBOL OBJECT) BODY)` Create variable in the environment of the provided body. |
| `lambda`   | `(lambda LIST BODY)` Create function given a list of args, and a function body. |
| `call`   | `(call FUNC)` Call function. |
| `eval`   | `(eval QUOTATION)` Eval quoted code. |
| `progn`   | `(progn OBJECT &rest OBJECT)` Multi-expression statement. Executes all expressions in its body, and returns the return value of the last one. |
| `print`   | `(print OBJECT)` stdout, prints anything. |
| `req`   | `(req STRING)` HTTP request. Returns the content at URL provided. |
| `json`   | `(json STRING)` Returns a assoc list constructed by parsing the provided JSON-string. |
| `read`   | `(read STRING)` Read from stdin using arg as a prompt. |
| `file`   | `(file STRING)` Returns the text content of file at path $1. |
| `match`   |   |
| `slice`   | `(slice NUMBER NUMBER LIST)` Returns list slice containing the elements from index $1 to $2. |
| `append`   | `(append LIST LIST)` Returns a list containing all the elements of the arg lists. |
| `nth`   | `(nth NUMBER LIST)` Returns the nth element in the list. |
| `flat-length`   | `(flat-length LIST)` Returns the count of elements in a list plus any sublists. |
| `nil`   | `nil` Empty list  |
| `infer-type`   | `(infer-type OBJECT)` Makes any symbol its expected type. E.g checks if its a number or a bool, and makes the object use that type in the underlying JS. |
| `type`   | `(type OBJECT)` Returns the type of the given arg. |
| `is-list`   | `(is-list OBJECT)` Returns true if arg is a list, otherwise false. |
| `concat`   | `(concat STRING STRING)` |
| `substring`   | `(substring NUMBER NUMBER STRING)` |
| `replace`   | `(replace STRING STRING STRING)` Replace instances of $1 with $2, in target string $3. |
| `sanitize`   | `(sanitize STRING)` Returns the string stripped of newlines. |
| `dict`   | `(dict LIST-OF-LIST-OF-KEY-VALUE)` Returns a dictionary from a list of lists containing key-value pairs. |
| `put-dict`   | `(put-dict LIST-OF-KEY-VALUE DICT)` Adds a record to given dict, and returns the new dict. Does not modify original dict. |
| `get-dict`   | `(get-dict KEY-NUMBER-OR-STRING DICT)` Get record from dict based on key. |
| `merge-dict`   | `(merge-dict DICT1 DICT2)` Merge dictionaries. |
| `throw`   | `(throw OBJECT)` Throws exception. |
| `fork`   | `(fork ANY)` Forks process, returns a reference to the process. |
| `join`   | `(join PROCESS-REF)` Wait for process to return. |