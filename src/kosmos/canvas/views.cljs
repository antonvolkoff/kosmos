(ns kosmos.canvas.views
  (:require [kosmos.paper :refer [paper-container rectangle circle layer]]
            [kosmos.canvas.grid :refer [make-grid]]))

(def background-color "#fdfdfd")

(def grid-color "#ccc")

(def canvas-size [3840 2160]) ; This is an 4K size

(def dots (map (fn [center] {:center center :radius 1.25 :fill-color grid-color})
               (make-grid canvas-size)))

(defn background []
  [paper-container
   [layer
    [rectangle {:from [0 0] :size canvas-size :fill-color background-color}]
    (map-indexed (fn [idx dot] ^{:key (str "dot-" idx)} [circle dot])
                 dots)]])
