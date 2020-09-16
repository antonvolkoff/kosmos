(ns kosmos.core
  (:require [kosmos.config-file :as cf]
            [reagent.dom :as dom]
            [kosmos.component :refer [container node edge]]
            [kosmos.flag :refer [enabled?]]))

(defn load [filename]
  (clj->js (cf/load filename)))

(defn render-svg-canvas []
  (let [el (.getElementById js/document "app")]
    (dom/render
     [container 1000 1000 [[edge 20 64 140 64]
                           [node 20 50 "println" false]
                           [node 140 50 "42" true]]]
     el)))

(defn ^:dev/after-load start []
  (when (enabled? :svg) (render-svg-canvas)))

(defn start! [] (start))
