(ns kosmos.canvas.views
  (:require [re-frame.core :refer [subscribe dispatch]]
            [kosmos.canvas.grid :refer [make-grid]]
            [kosmos.canvas.components :as components]
            [kosmos.canvas.subs]
            [clojure.data]))

(def background-color "#FDFDFD")

(def grid-color "#CCC")

(def edge-color "#969696")

(def canvas-size [3840 2160]) ; This is an 4K size

(def node-style
  {:fill-color "#ffffff"
   :stroke-color "#999999"
   :active-color "#79B8FF"
   :stroke-width 1.5
   :border-radius 6
   :font-family "monospace"
   :font-size "14px"})

(def dots (map (fn [center] {:center center :radius 1.25 :fill grid-color})
               (make-grid canvas-size)))

(defn edge-point
  [{:keys [x y]}]
  [x y])

(defn edge-id [{:keys [source-id target-id]}]
  (str source-id "-" target-id))

(defn edge [{:keys [source-id target-id]}]
  (let [source @(subscribe [:canvas/node source-id])
        target @(subscribe [:canvas/node target-id])
        [x1 y1] (edge-point source)
        [x2 y2] (edge-point target)]
    [:line {:x1 x1 :y1 y1 :x2 x2 :y2 y2 :stroke edge-color}]))

(defn dot [{:keys [center radius fill]}]
  (let [[cx cy] center]
    [:circle {:cx cx :cy cy :r radius :fill fill}]))

(defn edges-layer []
  (let [edges @(subscribe [:canvas/edges])]
    [:g
     (for [edge-attrs edges]
       ^{:key (edge-id edge-attrs)} [edge edge-attrs])]))

(defn nodes-layer []
  (let [nodes @(subscribe [:canvas/nodes])]
    [:g
     (for [node nodes]
       ^{:key (:id node)}
       [components/node {:data node
                         :style node-style
                         :on-click #(dispatch [:canvas/node-clicked (:id node)])}])]))

(defn offset->transform [{:keys [x y]}]
  (str "translate(" x " " y ")"))

(defn movable-group [children]
  (let [offset @(subscribe [:canvas/offset])]
    [:g {:transform (offset->transform offset)}
     children]))

(defn canvas []
  (let [[width height] canvas-size
        window-size @(subscribe [:window])]
    [:svg {:width (:width window-size) :height (:height window-size)}
     [:g {:on-click #(dispatch [:canvas/background-clicked])}
      [:rect {:x 0 :y 0 :width width :height height :fill background-color}]
      (map-indexed (fn [idx attrs] ^{:key (str "dot-" idx)} [dot attrs]) dots)]
     [movable-group
      [edges-layer]]
     [movable-group
      [nodes-layer]]]))
