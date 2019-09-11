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
      (list)
    (let (tok (token input))
      (if (eq? (length tok) 0)
          (tokenize (substring 1 (length input) input))
        (cons tok (tokenize (substring (length tok) (length input) input)))
        ))))

(defun parse-symbol (s) s)

(defun parse (lexemes)

  (if (eq? (length lexemes) 0)
      (list)
    
    (match (car lexemes)
           "(" (let (exp (parse (cdr lexemes)))
                 (cons exp (parse (slice (+ (length exp) 2) (length lexemes) lexemes)))
                 )
           ")" (list)
           (cons (parse-symbol (car lexemes)) (parse (cdr lexemes))))
    )
  )

(defun interpret (ast store env)

  (call (car (cdr (assoc (car ast) store))) (cdr ast))
  )


(set 'store
     (list
      (list '+ (lambda (args) (+ (car args) (car (cdr args)))))
      ))

(defun repl (prev)
  (repl (print (interpret (parse (tokenize (read "h2> "))) store (list)))))

(repl 'start)