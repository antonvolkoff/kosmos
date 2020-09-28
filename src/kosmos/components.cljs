(ns kosmos.components
  (:require [re-frame.core :refer [dispatch subscribe]]
            [reagent.dom :as rdom]))

;;;;;;;;;;;;;;;;;;;

(defn node-dot [{:keys [x y]}]
  (let [style {:fill "#fff" :stroke "#444" :stroke-width 2 :r 4}]
    [:circle.r-6-hover (merge style {:cx x :cy y})]))

(def node-input-style
  {:font-family "Fira Code" :font-size "14px" :border 0 :outline "none"
   :background-color "#fdfdfd"})

(def node-input-placeholder "Enter value")

(defn node-input [{:keys [on-change value]}]
  [:input {:style node-input-style
           :placeholder node-input-placeholder
           :value value
           :on-change on-change}])

(def node-input-wrapper 
  (with-meta node-input {:component-did-mount #(.focus (rdom/dom-node %))}))

(defn change-handler [id]
  (fn [e] 
    (let [new-value (-> e .-target .-value)]
      (dispatch [:change-node-value id new-value]))))

(defn node [{:keys [x y id value]}]
  (let [tx (+ x 12) ty (- y 9)]
    [:g
     [node-dot {:x x :y y}]
     [:foreignObject {:x tx :y ty :width 100 :height 20}
      [node-input-wrapper {:on-change (change-handler id) :value value}]]]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn add-point [{:keys [x y]}]
  (let [offset 4 radius 7 stroke "#999" fill "#fff"]
    [:g.c-add-point {:on-click (fn [] (dispatch [:add-node]))}
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
     (map-indexed (fn [n [k v]] ^{:key k} [node (merge (position 0 n) v)])
                  @nodes)
     [add-point (position 0 (count @nodes))]]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn canvas
  ([]
   (canvas {:width 500 :height 1000}))
  ([{:keys [width height]}]
   [:svg.c-svg {:width width :height height :style {:background-color "#fdfdfd"}}
    [document]]))
