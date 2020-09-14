(ns kosmos.config-file
  (:require [kosmos.node.os :as os]
            [kosmos.node.fs :as fs]
            [cljs.reader :as reader]))

(def config-dir (str (os/homedir) "/.kosmos"))

(defn path [filename] (str config-dir "/" filename))

(defn- create-config-dir []
  (when-not (fs/exists-sync config-dir)
    (fs/mkdir-sync config-dir)))

(defn- create-file [path]
  (create-config-dir)
  (fs/write-file-sync path (pr-str {})))

(defn- read-file [path]
  (-> path fs/read-file-sync .toString reader/read-string))

(defn load [filename]
  (let [path (path filename)]
    (when-not (fs/exists-sync path)
      (create-file path))
    (read-file path)))
