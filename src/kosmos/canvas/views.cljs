(ns kosmos.canvas.views
  (:require [reagent.core :as r]
            [reagent.dom :as rdom]
            [paper :as paper]))

(defn- canvas [{:keys [on-mount]}]
  (r/create-class
   {:component-did-mount #(on-mount (rdom/dom-node %))
    :reagent-render #(-> [:canvas])}))

(defn- paper-canvas [{:keys [on-mount]}]
  [canvas {:on-mount #(-> % paper/setup on-mount)}])

(defn render []
  ;; Examples of drawing path and text
  (new paper/Path.Rectangle
       #js {:from #js [0 0] :to #js [150 150] :strokeColor "black"})
  (new paper/PointText
       #js {:point #js [50 50] :content "Hey" :fontSize 16}))

(defn background []
  [paper-canvas {:on-mount render}])
