(ns kosmos.node.fs)

(def fs (js/require "fs"))

(defn read-file-sync [path]
  (.readFileSync fs path))

(defn exists-sync [path]
  (.existsSync fs path))

(defn write-file-sync [path str] 
  (.writeFileSync fs path str))

(defn mkdir-sync [path] 
  (.mkdirSync fs path))

(defn unlink-sync [path]
  (.unlinkSync fs path))
