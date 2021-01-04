(ns kosmos.editor.view
  (:require [clojure.string :as str]
            [kosmos.db :as db]))

;; Getters

(defn pull-editor []
  (db/pull @db/db '[*] :editor))

(defn ast []
  (:editor/ast (pull-editor)))

;; Components

(defn line* [{:keys [x y value]}]
  [:text {:x x :y y :value value}])

;; Views

(defn line [idx line]
  (line* {:x 40 :y (+ 20 (* 40 (inc idx))) :value line}))

(defn sentance [{words :words punctuation :punctuation}]
  (let [word-values (map :value words)
        punctuation-values (map :value punctuation)]
    (str (str/join " " word-values) (str/join "" punctuation-values))))

(defn paragraph [{sentences :sentences}]
  (str/join " " (map sentance sentences)))

(defn editor []
  (let [paragraphs (:paragraphs (ast))]
    (->>
     (mapv paragraph paragraphs)
     (map-indexed line))))
