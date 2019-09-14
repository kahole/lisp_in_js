(defun token-quote (chars level)
  (match (car chars)
         "'" (concat (car chars) (token-quote (cdr chars) (+ level 0)))
         "(" (concat (car chars) (token-quote (cdr chars) (+ level 1)))
         " " (if (eq? level 0) "" (concat (car chars) (token-quote (cdr chars) level)))
         ")" (if (eq? level 0) "" (concat (car chars) (token-quote (cdr chars) (- level 1))))
         (concat (car chars) (token-quote (cdr chars) level))
         )
  )

(set 'pruned 0)

(defun token-string-literal (chars)

  (match (car chars)
         "\"" (car chars)
         "\\" (progn (set 'pruned (+ pruned 1)) (concat (nth 1 chars) (token-string-literal (cdr (cdr chars)))))
         (concat (car chars) (token-string-literal (cdr chars)))
         )
  )

(defun token (chars)
  (let (char (car chars))
    (match char
           "'" (concat "'" (token-quote (cdr chars) 0))
           "\"" (progn (set 'pruned 0) (concat "\"" (token-string-literal (cdr chars))))
           "(" char
           " " ""
           ")" char
           (match (nth 1 chars)
                  ")" char
                  " " char
                  (concat char (token (cdr chars)))
                  ))))

(defun tokenize (input)

  (progn (set 'pruned 0)
  
  (if (eq? (length input) 0)
      nil
    (let (tok (token input))
      (if (eq? (length tok) 0)
          (tokenize (substring 1 (length input) input))
        (cons tok (tokenize (substring (+ (length tok) pruned) (length input) input)))
        )))))

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

(defun double-map (arr arr2 fun)
  (if (eq? (length arr) 0)
      nil
    (cons (call fun (car arr) (car arr2)) (double-map (cdr arr) (cdr arr2) fun))))

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
               "if" (call (lookup env (car ast)) (cons (interpret-exp (nth 1 ast) env) (cdr (cdr ast))) env)
               "match" (call (lookup env (car ast)) (cons (interpret-exp (nth 1 ast) env) (cdr (cdr ast))) env)
               "let" (call (lookup env (car ast)) (cdr ast) env)
               "lambda" (call (lookup env (car ast)) (cdr ast) env)
               "defun" (call (lookup env (car ast)) (cdr ast) env)
               (call (lookup env (car ast))
                     (map (cdr ast) (lambda (x) (interpret-exp x env)))
                     env))

      (if (eq? (type ast) "string")
          (match true
                 (eq? (substring 0 1 ast) "'") (substring 1 (length ast) ast)
                 (eq? (substring 0 1 ast) "\"") (substring 1 (- (length ast) 1) ast)
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

(defun for-match (val clauses env)
  (if (eq? (length clauses) 1)
      (interpret-exp (car clauses) env)
    (if (eq? val (interpret-exp (car clauses) env))
        (interpret-exp (nth 1 clauses) env)
      (for-match val (cdr (cdr clauses)) env)
      )
    )
  )

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
      (list 'assoc (lambda (args) (assoc (car args) (nth 1 args))))
      (list 'set (lambda (args)
                   (progn
                    (set 'store (cons (list (car args) (nth 1 args)) store))
                    (nth 1 args))))

      (list 'defun (lambda (args env) (call (lookup env 'set)
                                            (list (car args) 
                                            (call (lookup env 'lambda) (cdr args) env)))))

      (list 'let (lambda (args env)
                   (let (key (car (car args)))
                     (let (val (interpret-exp (nth 1 (car args)) env))
                       (interpret-exp (nth 1 args) (cons (list key val) env))
                       ))
                   ))

      (list 'lambda (lambda (args env)
                      (lambda (lam-args)
                        (let (lam-arg-bindings
                              (double-map (car args) lam-args (lambda (key val)
                                                                (list key val))))
                          (interpret-exp (nth 1 args) (append lam-arg-bindings env))))))
      (list 'call (lambda (args) (call (car args) (cdr args))))
      (list 'eval (lambda (args env) (car (interpret (parse (tokenize (car args))) env))))
      (list 'progn (lambda (args) (nth (- (length args) 1) args)))

      (list 'print (lambda (args) (print (car args))))

      (list 'req (lambda (args) (req (car args))))
      (list 'json (lambda (args) (json (car args))))
      (list 'read (lambda (args) (read (car args))))
      (list 'file (lambda (args) (file (car args))))

      (list 'match (lambda (args env)
                     (for-match (car args) (cdr args) env)
                     ))

      (list 'slice (lambda (args) (slice (car args) (nth 1 args) (nth 2 args))))
      (list 'append (lambda (args) (append (car args) (nth 1 args))))
      (list 'nth (lambda (args) (nth (car args) (nth 1 args))))
      (list 'flat-length (lambda (args) (flat-length (car args))))

      (list 'nil (list))

      (list 'infer-type (lambda (args) (infer-type (car args))))
      (list 'type (lambda (args) (type (car args))))
      (list 'is-list (lambda (args) (is-list (car args))))

      (list 'concat (lambda (args) (concat (car args) (nth 1 args))))
      (list 'substring (lambda (args) (substring (car args) (nth 1 args) (nth 2 args))))
      (list 'replace (lambda (args) (replace (car args) (nth 1 args) (nth 2 args))))
      (list 'sanitize (lambda (args) (sanitize (car args))))
      ))

(defun repl (prompt)
  (let (line (read prompt))
    (if (eq? (length line) 0)
        (repl prompt)
      (repl prompt (print (car (interpret (parse (tokenize line)) (list))))))))

(defun run-program (src)
  (interpret (parse (tokenize (sanitize src))) (list)))
