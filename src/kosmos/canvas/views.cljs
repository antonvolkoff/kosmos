(ns kosmos.canvas.views
  (:require [reagent.core :as r]
            [reagent.dom :as rdom]
            [paper :as paper]
            [kosmos.canvas.grid :refer [make-grid]]))

(def background-color "#fdfdfd")

(def grid-color "#ccc")

(defn- canvas [{:keys [on-mount]}]
  (r/create-class
   {:component-did-mount #(on-mount (rdom/dom-node %))
    :reagent-render #(-> [:canvas {:resize ""}])}))

(defn- render [^paper/PaperScope _scope]
  (let [size [3840 2160] ; This is an 4K size
        bg-rect #js {:from #js [0 0] :to (clj->js size) :fillColor background-color}
        dot-circles (map (fn [center]
                           #js {:center (clj->js center) :radius 1.25 :fillColor grid-color})
                         (make-grid size))]
    (new paper/Path.Rectangle bg-rect)
    (dorun (map #(new paper/Path.Circle %) dot-circles))))

(defn background []
  [canvas {:on-mount #(-> % paper/setup render)}])

(comment
  (paper/install js/window))
