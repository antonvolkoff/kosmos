(ns kosmos.components)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn add-point [{:keys [x y]}]
  (let [offset 4 radius 7 stroke "#999" fill "#fff"]
    [:g.c-add-point
     [:circle
      {:cx x :cy y :r radius :fill fill :stroke stroke :stroke-width 1.2}]
     [:line {:x1 (- x offset) :y1 y :x2 (+ x offset) :y2 y :stroke stroke}]
     [:line {:x1 x :y1 (- y offset) :x2 x :y2 (+ y offset) :stroke stroke}]]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(def start-x 40)

(def step-x 25)

(def start-y 60)

(def step-y 25)

(defn position [col row]
  {:x (+ start-x (* step-x col))
   :y (+ start-y (* step-y row))})

(defn document []
  [:g [add-point (position 0 0)]])

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn canvas
  ([]
   (canvas {:width 500 :height 1000}))
  ([{:keys [width height]}]
   [:svg.c-svg {:width width :height height :style {:background-color "#fdfdfd"}}
    [document]]))
