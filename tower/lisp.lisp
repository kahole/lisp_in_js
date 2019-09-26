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

(defun run-program (src)
  (interpret (parse (tokenize (sanitize src))) (dict)))


;; Interpreter Tower

(defun tower-repl (prompt)
  (if abort-repl
      (progn
        (set 'abort-repl false)
        cont-value)
    (let (line (read prompt))
      (if (eq? (length line) 0)
          (tower-repl prompt)
        (tower-repl prompt (print (car (interpret (transform (parse (tokenize line))) (dict)))))))))

;; Transform hook, making it simpler to change the interpreter while running
(defun transform (ast) ast)


(defun load-new-level ()
  ;; (let (old-store-pair (get-dict 'store store))
  (let (old-store-pair (list 'store (copy store)))
    ;; NB! Denne setter store.store fra dette perspektivet
    (let (new-store (nth 6 (run-program (file "tower/lisp.lisp"))))
      (progn
        ;; (car (run-program (concat "(tower-repl \"exlisp-" new-tower-level "> \")")))
        (run-program (concat "(set 'tower-level " (* tower-level 10) ")"))
        ;; (put-dict-destructive (list 'tower-level (* tower-level 10)) new-store)
        ;; (set 'tower-level (+ tower-level 1))
        (put-dict-destructive old-store-pair store)
        (print store)
        )
      )
    )
  )

;; old-cont
(set 'abort-repl false)

(set 'store (dict
             (list
              ;; TODO: Tror dette er nøkkelen til å koble sammen stores på riktig måte! 
              (list 'interpret-exp (lambda (args env level-store) (progn (print tower-level) (interpret-exp args env level-store))))
              (list 'em-cont (lambda ()
                               (progn
                                 (if (eq? (em 'em) nil)
                                     (progn
                                       "No more meta levels above"
                                       (em '(load-new-level))
                                 ;;       ;; (let (old-store-pair (list 'store store))
                                 ;;       ;;   (progn
                                 ;;       ;;     (let (new-store (nth 7 (run-program (file "tower/lisp.lisp"))))
                                 ;;       ;;       ;; Denne gjør ingengting: men hjelper ikke fikse det pga det under..
                                 ;;       ;;       (put-dict-destructive old-store-pair new-store)
                                 ;;       ;;       )
                                 ;;       ;;     ;; Virker ikke på grunn av implisitt linking av interpreterene gjennom rekursjon!
                                 ;;       ;;     (let (new-tower-level (+ tower-level 1))
                                 ;;       ;;       (progn
                                 ;;       ;;         (set 'tower-level (+ tower-level 2))
                                 ;;       ;;         (run-program (concat "(set 'tower-level " new-tower-level ")"))
                                 ;;       ;;         (car (run-program (concat "(tower-repl \"exlisp-" new-tower-level "> \")")))
                                 ;;       ;;         )
                                 ;;       ;;     )
                                 ;;       ;;     )
                                 ;;       ;;   )
                                       )
                                   (em '(tower-repl (concat "lisp-" tower-level "> ")))
                                   )
                                 )))
              ;; (list 'meta-load-new-level (lambda (args) (load-new-level)))
              (list 'em (lambda (args) (eval args)))
              (list 'old-cont (lambda (args) (progn (set 'cont-value args) (set 'abort-repl true) "Moving down"))))))

(defun init-tower (level)
  (progn
    (set 'tower-level level)
    (if (> level 0)
        ;; Load next interpreter
        (progn
          (run-program (file "tower/lisp.lisp"))
          (print (car (run-program (concat "(init-tower " (- level 1) ")")))))
      (tower-repl (concat "lisp-" level "> ")))
    nil))