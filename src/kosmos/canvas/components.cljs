(ns kosmos.canvas.components)

(def font-width 8.6)

(defn calculate-width [base-width value]
  (let [value-count (count value)]
    (if (> value-count 2)
      (+ base-width (* (- value-count 3) font-width))
      base-width)))

(defn value-width [value]
  (* (count value) font-width))

(defn node [{:keys [x y value]} style]
  (let [border-x (- x 20)
        border-y (- y 14)
        width (calculate-width 60 value)
        height 28]
    [:rect {:x border-x
            :y border-y
            :width width
            :height height
            :fill (:fill-color style)
            :stroke (:stroke-color style)
            :stroke-width (:stroke-width style)
            :rx (:border-radius style)}]))
