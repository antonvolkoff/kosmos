(ns kosmos.canvas.views
  (:require [re-frame.core :refer [subscribe]]
            [kosmos.paper :refer [paper-container rectangle circle layer line]]
            [kosmos.canvas.grid :refer [make-grid]]
            [kosmos.canvas.subs]))

(def background-color "#fdfdfd")

(def grid-color "#ccc")

(def edge-color "#969696")

(def canvas-size [3840 2160]) ; This is an 4K size

(def dots (map (fn [center] {:center center :radius 1.25 :fill-color grid-color})
               (make-grid canvas-size)))

(defn edge-point
  [{:keys [x y]}]
  [x y])

(defn edge [{:keys [source target]}]
  [line {:from (edge-point source) :to (edge-point target) :stroke-color edge-color}])

(defn background []
  (let [edges @(subscribe [:canvas/edges-with-nodes])]
    [paper-container
     [layer
      [rectangle {:from [0 0] :size canvas-size :fill-color background-color}]
      (map-indexed (fn [idx dot] ^{:key (str "dot-" idx)} [circle dot])
                   dots)]
     [layer
      (map (fn [edge-attrs] [edge edge-attrs])
           edges)]]))

