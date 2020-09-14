(ns kosmos.core
  (:require (kosmos.config-file :as cf)))

(defn load [filename]
  (clj->js (cf/load filename)))

(defn start! []
  nil)
