(ns kosmos.components
  (:require [re-frame.core :refer [dispatch subscribe]]
            [reagent.dom :as rdom]))

;;;;;;;;;;;;;;;;;;;

(defn node-dot [{:keys [x y]}]
  (let [style {:fill "#fff" :stroke "#444" :stroke-width 2 :r 4}]
    [:circle.r-6-hover (merge style {:cx x :cy y})]))

(defn node-input []
  (let [style {:font-family "Fira Code" :font-size "14px" :border 0 :outline "none"}]
     [:input {:style style :placeholder "Enter value"}]))

(def node-input-wrapper 
  (with-meta node-input {:component-did-mount #(.focus (rdom/dom-node %))}))

(defn node [{:keys [x y]}]
  (let [tx (+ x 12) ty (- y 9)]
    [:g
     [node-dot {:x x :y y}]
     [:foreignObject {:x tx :y ty :width 100 :height 20}
      [node-input-wrapper]]]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn add-point [{:keys [x y]}]
  (let [offset 4 radius 7 stroke "#999" fill "#fff"]
    [:g.c-add-point {:on-click (fn [] (dispatch [:clicked-add-point]))}
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
  (let [nodes (subscribe [:nodes])]
    [:g 
     (map-indexed #(-> ^{:key %1} [node (position 0 %1)]) @nodes)
     [add-point (position 0 (count @nodes))]]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn canvas
  ([]
   (canvas {:width 500 :height 1000}))
  ([{:keys [width height]}]
   [:svg.c-svg {:width width :height height :style {:background-color "#fdfdfd"}}
    [document]]))
