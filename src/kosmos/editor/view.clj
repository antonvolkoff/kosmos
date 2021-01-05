(ns kosmos.editor.view
  (:require [clojure.string :as str]
            [kosmos.db :as db]))

;; Getters

(def editor-pattern '[:db/ident :editor/current :db/id :type :value {:node/child ...}])

(def current-id-query '[:find [?e]
                        :where
                        [_ :editor/current ?e]])

(defn current-id []
  (-> (db/query current-id-query @db/db) first))

;; Components

(defn line* [{:keys [x y value]}]
  [:text {:x x :y y :value value}])

;; Views

(defn line [idx line]
  (line* {:x 40 :y (+ 20 (* 40 (inc idx))) :value line}))

(defn join-with-space [parts]
  (str/join " " parts))

(defn sentance [{words-n-punctuation :node/child}]
  (-> (map :value words-n-punctuation)
      join-with-space))

(defn paragraph [{sentences :node/child}]
  (-> (map sentance sentences)
      join-with-space))

(defn editor []
  (let [node (db/pull @db/db editor-pattern :editor)
        tree (-> node :node/child first)
        paragraphs (-> tree :node/child)]
    (->> paragraphs
         (mapv paragraph)
         (map-indexed line))))
