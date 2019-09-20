;; (defun map (arr fun)
;;   (if (eq? (length arr) 0)
;;       nil
;;     (cons (fun (car arr)) (map (cdr arr) fun))))

;; (defun double-map (arr arr2 fun)
;;   (if (eq? (length arr) 0)
;;       nil
;;     (cons (fun (car arr) (car arr2)) (double-map (cdr arr) (cdr arr2) fun))))

;; (defun for-match (val clauses env)
;;   (if (eq? (length clauses) 1)
;;       (interpret-exp (car clauses) env store)
;;     (if (eq? val (interpret-exp (car clauses) env store))
;;         (interpret-exp (nth 1 clauses) env store)
;;       (for-match val (cdr (cdr clauses)) env)
;;       )
;;     )
;;   )

;; (defun reduce (list acc fun)
;;   (if (eq? (length list) 0)
;;       acc
;;       (reduce (cdr list) (fun acc (car list)) fun)))

(defun interpret (ast env)
  (cons (interpret-exp (car ast) env store)
        (if (eq? (length (cdr ast)) 0)
            nil
          (interpret (cdr ast) env))))

;; (set 'store
;;      (dict
;;       ;; (list
;;       ;;  (list 'interpret-exp (lambda (args) (interpret-exp (car args) (nth 1 args) (nth 2 args))))
;;       ;;  ;; (list 'eval (lambda (args env) (car (interpret (parse (tokenize (car args))) env store))))
;;       ;; )
;;       )
;;      )

(defun run-program (src)
  (interpret (parse (tokenize (sanitize src))) (dict)))


;; Interpreter Tower

(defun tower-repl (prompt)
  (if abort-repl
      (set 'abort-repl false)
    (let (line (read prompt))
      (if (eq? line "quit")
          nil
      (if (eq? (length line) 0)
          (tower-repl prompt)
        (tower-repl prompt (print (car (interpret (transform (parse (tokenize line))) (dict))))))))))

;; Transform hook, making it simpler to change the interpreter while running
(defun transform (ast) ast)

;; old-cont
(set 'abort-repl false)

(set 'store (dict
             (list
              (list 'em-cont (lambda (args) (em '(tower-repl (concat "lisp-" tower-level "> ")))))
              (list 'em (lambda (args) (eval args)))
              )))

(defun old-cont ()
  (em '(set 'abort-repl true)))

(defun init-tower (level)
  (progn
    (set 'tower-level level)
    (if (> level 0)
        ;; Load next interpreter
        (progn
          (run-program (file "lisp.lisp"))
          (print (car (run-program (concat " (init-tower " (- level 1) ")")))))
      (tower-repl (concat "lisp-" level "> ")))
    nil
      ;; nil)
    )
  )
