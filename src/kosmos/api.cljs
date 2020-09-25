(ns kosmos.api
  (:require [kosmos.config-file :as config-file]
            [re-frame.core :as f]
            [kosmos.io.clojure]))

(defn load [filename]
  (clj->js (config-file/load filename)))

(defn dispatch [event]
  (let [[name params] (js->clj event)
        name (keyword name)]
    (f/dispatch [name params])))

(defn parse [data]
  (-> data kosmos.io.clojure/parse clj->js))
