(ns kosmos.component)

;; grid

(def grid-size 20)

(def grid-background "#fdfdfd")

(def grid-point-color "#ccc")

(defn point->grid-point-coords [[x y]]
  [(* x grid-size) (* y grid-size)])

(defn grid-point-coordinates [width height] 
  (let [columns (/ width grid-size)
        rows (/ height grid-size)
        points (for [i (range columns) j (range rows)] [i j])]
    (map point->grid-point-coords points)))

(defn grid-point [x y]
  [:circle {:cx x :cy y :r 1.25 :fill grid-point-color}])

(defn grid [width height]
  [:g
   [:rect {:width width :height height :fill grid-background}]
   (for [[x y] (grid-point-coordinates width height)]
     [grid-point x y])])

;; container

(defn container [width height elements]
  [:svg {:style {:width width :height height}}
   [grid width height]
   (for [element elements]
     element)])

;; node

(def selected-color "#79B8FF")

(def not-selected-color "#999")

(defn node-stroke-color [selected]
  (if selected selected-color not-selected-color))

(def node-input-style {:font-size "14px"
                       :font-family "monospace"
                       :outline "none"
                       :border "none"
                       :magin 0
                       :padding 0
                       :resize "none"
                       :line-height "17px"})

(def default-node-width 60)

(def font-width 8.0)

(defn node-width [value]
  (if (> (count value) 2)
    (+ default-node-width (* (- (count value) 3) font-width))
    default-node-width))

(defn drag-indicator []
  [:path {:d "M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 
              0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 
              2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 
              2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 
              6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"}])

(defn translate-string [x y]
  (str "translate(" x " " y ")"))

(defn display-value [b]
  (if b "" "none"))

(defn node [x y value selected]
  (let [width (node-width value)]
    [:g {:transform (translate-string x y)
         :on-click #(print "Clicked")}
     [:rect {:width width 
             :height 28 
             :rx 6 
             :fill "#fff" 
             :stroke (node-stroke-color selected) 
             :stroke-width 1.5}]
     [:foreignObject {:x 22 :y 5 :width (- width 24) :height 28}
      [:textarea {:style node-input-style :rows 1 :defaultValue value}]]
     [:g {:display (display-value selected) 
          :transform "translate(0 2)" 
          :fill selected-color} 
      [drag-indicator]]]))

;; edge

(defn edge-color [selected]
  (if selected selected-color not-selected-color))

(defn edge [x1 y1 x2 y2 selected]
  [:line {:x1 x1 :y1 y1 
          :x2 x2 :y2 y2 
          :stroke (edge-color selected) 
          :stroke-width 1.5
          :on-click #(print "Clicked")}])
