(ns kosmos.editor.view
  (:require [clojure.string :as str]
            [kosmos.db :as db]))

(defn line* [{:keys [x y value]}]
  [:text {:x x :y y :value value}])

(defn line [idx line]
  (line* {:x 40 :y (+ 20 (* 40 (inc idx))) :value line}))

(defn editor []
  (let [{tokens :tokens} (db/pull @db/db '[:tokens] :buffer)
        lines (map #(str/join " " %) tokens)]
    (map-indexed line lines)))
