(ns kosmos.canvas.components)

(def font-width 8.6)

(defn calculate-width [base-width value]
  (let [value-count (count value)]
    (if (> value-count 2)
      (+ base-width (* (- value-count 3) font-width))
      base-width)))

; Duplicate from kosmos.canvas.views
(defn offset->transform [{:keys [x y]}]
  (str "translate(" x " " y ")"))

(defn drag-area [offset style]
  [:g {:transform (offset->transform offset)
       :fill (:stroke-color style)}
   [:path {:d "M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2
               2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9
               2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0
               6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"}]])

(defn node [{:keys [x y value]} style]
  (let [border-x (- x 20)
        border-y (- y 14)
        width (calculate-width 60 value)
        height 28]
    [:g
     [:rect {:x border-x
             :y border-y
             :width width
             :height height
             :fill (:fill-color style)
             :stroke (:stroke-color style)
             :stroke-width (:stroke-width style)
             :rx (:border-radius style)}]
     [drag-area {:x (- x 21) :y (- y 12)} style]]))
