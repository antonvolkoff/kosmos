(ns kosmos.canvas.views
  (:require [re-frame.core :refer [subscribe]]
            [kosmos.canvas.grid :refer [make-grid]]
            [kosmos.canvas.subs]
            [clojure.data]))

(def background-color "#FDFDFD")

(def grid-color "#CCC")

(def edge-color "#969696")

(def canvas-size [3840 2160]) ; This is an 4K size

(def dots (map (fn [center] {:center center :radius 1.25 :fill grid-color})
               (make-grid canvas-size)))

(defn edge-point
  [{:keys [x y]}]
  [x y])

(defn edge [{:keys [source-id target-id]}]
  (let [source @(subscribe [:canvas/node source-id])
        target @(subscribe [:canvas/node target-id])
        [x1 y1] (edge-point source)
        [x2 y2] (edge-point target)]
    [:line {:x1 x1 :y1 y1 :x2 x2 :y2 y2 :stroke edge-color}]))

(defn dot [{:keys [center radius fill]}]
  (let [[cx cy] center]
    [:circle {:cx cx :cy cy :r radius :fill fill}]))

(defn background []
  (let [edges @(subscribe [:canvas/edges])
        [width height] canvas-size]
    [:svg {:width 800 :height 800}
     [:g
      [:rect {:x 0 :y 0 :width width :height height :fill background-color}]
      (map-indexed (fn [idx attrs] ^{:key (str "dot-" idx)} [dot attrs]) dots)]
     [:g
      (map (fn [edge-attrs] [edge edge-attrs]) edges)]]))
