(defun token (chars)
  (let (char (car chars))
    (match char
           "(" char
           " " ""
           ")" char
           (match (nth 1 chars)
                  ")" char
                  " " char
                  (concat char (token (cdr chars)))
                  ))))

(defun tokenize (input)
  
  (if (eq? (length input) 0)
      nil
    (let (tok (token input))
      (if (eq? (length tok) 0)
          (tokenize (substring 1 (length input) input))
        (cons tok (tokenize (substring (length tok) (length input) input)))
        ))))

(defun end-lex-exp-length (lexemes depth count)

  (if (eq? depth 0)
      count
    (end-lex-exp-length (cdr lexemes)
                        (match (car lexemes)
                               "(" (+ depth 1)
                               ")" (- depth 1)
                               depth)
                        (+ count 1))))

(defun parse (lexemes)

  (if (eq? (length lexemes) 0)
      nil
    (match (car lexemes)
           "(" (let (exp (parse (cdr lexemes)))
                 (cons exp
                       (parse (slice (+ (end-lex-exp-length (cdr lexemes) 1 0) 1) (length lexemes) lexemes))))
           ")" nil
           (cons (infer-type (car lexemes)) (parse (cdr lexemes))))))


(defun map (arr fun)
  (if (eq? (length arr) 0)
      nil
    (cons (call fun (car arr)) (map (cdr arr) fun))))

(defun lookup (env key)

  (let (env-pair (assoc key env))
    (if (eq? (length env-pair) 0)
        (let (store-pair (assoc key store))
          (if (eq? (length store-pair) 0)
              (print (concat "Variable not bound: " key))
            (nth 1 (assoc key store))
            )
          )
      (nth 1 (assoc key env)))))

(defun interpret-exp (ast env)

  (if (eq? (length ast) 0)
      nil

    (if (is-list ast)
        (match (car ast)
               "if" (call (lookup env (car ast)) (cons (interpret-exp (nth 1 ast) env) (cdr (cdr ast))))
               "match" (call (lookup env (car ast)) (cons (interpret-exp (nth 1 ast) env) (cdr (cdr ast))))
               "let" (call (lookup env (car ast)) (cdr ast))
               "lambda" (call (lookup env (car ast)) (cdr ast))
               "defun" (call (lookup env (car ast)) (cdr ast))
               (call (lookup env (car ast))
                     (map (cdr ast) (lambda (x) (interpret-exp x env)))
                     env))

      (if (eq? (type ast) "string")
          (match true
                 (eq? (substring 0 1 ast) "'") (replace "'" "" ast)
                 (lookup env ast))
        ast
        )
      )
    ))

(defun interpret (ast env)
  (cons (interpret-exp (car ast) env)
        (if (eq? (length (cdr ast)) 0)
            nil
          (interpret (cdr ast) env))))

(set 'store
     (list
      (list '+ (lambda (args) (+ (car args) (nth 1 args))))
      (list '- (lambda (args) (- (car args) (nth 1 args))))
      (list '* (lambda (args) (* (car args) (nth 1 args))))
      (list '/ (lambda (args) (/ (car args) (nth 1 args))))
      (list 'eq? (lambda (args) (eq? (car args) (nth 1 args))))
      (list 'if (lambda (args env) (if (car args)
                                       (interpret-exp (nth 1 args) env)
                                     (interpret-exp (nth 1 (cdr args)) env))))
      (list 'not (lambda (args) (not (car args))))
      (list 'cons (lambda (args) (cons (car args) (nth 1 args))))
      (list 'list (lambda (args) args))
      (list 'car (lambda (args) (car (car args))))
      (list 'cdr (lambda (args) (cdr (car args))))
      (list 'length (lambda (args) (length (car args))))
      (list 'assoc)
      (list 'set (lambda (args)
                   (proc
                    (set 'store (cons (list (car args) (nth 1 args)) store))
                    (nth 1 args))))
      (list 'defun)

      (list 'let (lambda (args env)
                   (let (key (car (car args)))
                     (let (val (nth 1 (car args)))
                       (interpret-exp (nth 1 args) (cons (list key val) env))
                       ))
                   ))

      (list "lambda" "call" "eval" "proc")

      (list 'print (lambda (args) (print (car args))))

      (list 'req (lambda (args) (req (car args))))
      (list 'json (lambda (args) (json (car args))))
      (list 'read (lambda (args) (read (car args))))

      (list 'match)

      (list 'slice (lambda (args) (slice (car args) (nth 1 args) (nth 2 args))))
      (list 'nth (lambda (args) (nth (car args) (nth 1 args))))
      (list 'flat-length (lambda (args) (flat-length (car args))))

      (list 'nil (list))

      (list 'infer-type (lambda (args) (infer-type (car args))))
      (list 'type (lambda (args) (type (car args))))
      (list 'is-list (lambda (args) (is-list (car args))))

      (list 'concat (lambda (args) (concat (car args) (nth 1 args))))
      (list 'substring (lambda (args) (substring (car args) (nth 1 args) (nth 2 args))))
      (list 'replace (lambda (args) (replace (car args) (nth 1 args) (nth 2 args))))

      ))

(defun repl (prev)
  (repl (print (car (interpret (parse (tokenize (read "h2> "))) (list))))))

(repl 'start)