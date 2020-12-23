(ns kosmos.db
  (:require [clojure.spec.alpha :as s]))

(s/def ::db vector?)

(defonce db (atom []))

(defn random-uuid []
  (java.util.UUID/randomUUID))

(defn add! [entity]
  (swap! db conj entity))
