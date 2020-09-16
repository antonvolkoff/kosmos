(ns kosmos.node.path)

(def path (js/require "path"))

(defn parse [str]
  (.parse path str))
