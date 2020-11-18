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

(defn- render [^paper/PaperScope scope]
  (let [view ^paper/CanvasView (.-view scope)
        width (-> view .-bounds .-width)
        height (-> view .-bounds .-height)
        bg-rect #js {:from #js [0 0] :to #js [width height] :fillColor background-color}
        dot-circles (map (fn [center]
                           #js {:center (clj->js center) :radius 1.25 :fillColor grid-color})
                         (make-grid width height))]
    (new paper/Path.Rectangle bg-rect)
    (dorun (map #(new paper/Path.Circle %) dot-circles))))

(defn background []
  [canvas {:on-mount #(-> % paper/setup render)}])

(comment
  (paper/install js/window))
