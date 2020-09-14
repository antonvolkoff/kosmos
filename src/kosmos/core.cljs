(ns kosmos.core
  (:require [kosmos.config-file :as cf]
            [reagent.dom :as dom]
            [kosmos.component :refer [container node]]))

(defn load [filename]
  (clj->js (cf/load filename)))

(defn ^:dev/after-load start []
  (let [el (.getElementById js/document "app")]
    (dom/render 
     [container [[node 20 50 "println" false]
                 [node 140 50 "42" false]]] 
     el)))

(defn start! [] (start))
