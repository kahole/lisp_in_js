(print (cdr (assoc 'title (json (req 'https://jsonplaceholder.typicode.com/todos/1)))))

(set 'x 71)
(set 'x 'hallo)

(eval '(+ 112 (eval '(+ 55 55))))

(eval '(+ 112 (eval '(+ 55 55) ) ) ) 

(set 'reverse_div (lambda (x y) (/ y x)))

(reverse_div 2 10)

(call (lambda (x y) (* y x))
    2 44)

(if (not (eq? (+ (/ 10 2) 20) 45))
    x
    'eple)

(if (eq? (+ (/ 10 2) 20) 45)
    x
    'eple)

(let (k 3) (+ k 6))

(let (k 3)
    (let (m 7)
        (+ k m)))

(set 'pot (lambda (x) (* x x)))
(pot 6)
(pot 66)

(eval '(eq? '111 '111))

(car (cdr (assoc 'a (list (list 'b 9) (list 'a 5)))))

(set 'rec (lambda (x y) (if (eq? x 0) (+ y 0) (rec (- x 1) (+ y x)))))

(rec 5 0)

(defun add-hello (str) (concat str "hello"))

(add-hello "test")