(ns kosmos.canvas.views
  (:require [re-frame.core :refer [subscribe]]
            [kosmos.paper :refer [paper-container rectangle circle layer line]]
            [kosmos.canvas.grid :refer [make-grid]]
            [kosmos.canvas.subs]
            [clojure.data]))

(def background-color "#FDFDFD")

(def grid-color "#CCC")

(def edge-color "#969696")

(def canvas-size [3840 2160]) ; This is an 4K size

(def dots (map (fn [center] {:center center :radius 1.25 :fill-color grid-color})
               (make-grid canvas-size)))

(defn edge-point
  [{:keys [x y]}]
  [x y])

(defn edge [{:keys [source-id target-id]}]
  (let [source @(subscribe [:canvas/node source-id])
        target @(subscribe [:canvas/node target-id])]
    [line {:from (edge-point source) :to (edge-point target) :stroke-color edge-color}]))

(defn background []
  (let [edges @(subscribe [:canvas/edges])]
    [paper-container
     [layer
      [rectangle {:from [0 0] :size canvas-size :fill-color background-color}]
      (map-indexed (fn [idx dot] ^{:key (str "dot-" idx)} [circle dot])
                   dots)]
     [layer
      (map (fn [edge-attrs] [edge edge-attrs])
           edges)]]))
