(ns kosmos.editor.view
  (:require [clojure.string :as str]
            [kosmos.db :as db]))

(defn line* [{:keys [x y value]}]
  [:text {:x x :y y :value value}])

(defn line [idx line]
  (line* {:x 40 :y (+ 20 (* 40 (inc idx))) :value line}))

(defn get-ast []
  (:ast (db/pull @db/db '[:ast] :buffer)))

(defn sentance [{words :words punctuation :punctuation}]
  (str (str/join " " words) punctuation))

(defn paragraph [{sentences :sentences}]
  (str/join " " (map sentance sentences)))

(defn editor []
  (->>
   (mapv paragraph (:paragraphs (get-ast)))
   (map-indexed line)))
