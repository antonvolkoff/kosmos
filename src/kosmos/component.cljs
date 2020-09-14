(ns kosmos.component)

(def container-style {:width "400px" :height "150px"})

(defn container [elements]
  [:svg {:style container-style} 
   (for [element elements]
     element)])

;; node

(def node-selected-color "#79B8FF")

(defn node-stroke-color [selected]
  (if selected node-selected-color "#999"))

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
  [:path {:d "M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"}])

(defn translate-string [x y]
  (str "translate(" x " " y ")"))

(defn display-value [b]
  (if b "" "none"))

(defn node [x y value selected]
  (let [width (node-width value)]
    [:g {:transform (translate-string x y)}
     [:rect {:width width 
             :height 28 
             :rx 6 
             :fill "#fff" 
             :stroke (node-stroke-color selected) 
             :stroke-width 1.5}]
     [:foreignObject {:x 22 :y 5 :width (- width 24) :height 28}
      [:textarea {:style node-input-style :rows 1} value]]
     [:g {:display (display-value selected) 
          :transform "translate(0 2)" 
          :fill node-selected-color} 
      [drag-indicator]]]))
