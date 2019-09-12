(defun token (chars)
  (let (char (car chars))
    (match char
           "(" char
           " " ""
           ")" char
           (match (car (cdr chars))
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

(defun lookup (key)
  (car (cdr (assoc key store)))
  )

(defun interpret-exp (ast env first)

  (if (eq? (length ast) 0)
      nil

    (if (is-list ast)

        (match (car ast)
               "if" (call (lookup (car ast)) (cons (interpret-exp (car (cdr ast)) env) (cdr (cdr ast))))
               (call (lookup (car ast))
                     (map (cdr ast) (lambda (x) (interpret-exp x env)))
                     env))
      ast
      )
    )
  )

(defun interpret (ast env)
  (cons (interpret-exp (car ast) env)
        (if (eq? (length (cdr ast)) 0)
            nil
          (interpret (cdr ast) env))))

(set 'store
     (list
      (list '+ (lambda (args) (+ (car args) (car (cdr args)))))
      (list '- (lambda (args) (- (car args) (car (cdr args)))))
      (list '* (lambda (args) (* (car args) (car (cdr args)))))
      (list '/ (lambda (args) (/ (car args) (car (cdr args)))))
      (list 'eq? (lambda (args) (eq? (car args) (car (cdr args)))))
      (list 'if (lambda (args env) (if (car args) (interpret-exp (car (cdr args)) env)
                                 (interpret-exp (car (cdr (cdr args))) env))))
      ))

(defun repl (prev)
  (repl (print (interpret (parse (tokenize (read "h2> "))) (list)))))

(repl 'start)