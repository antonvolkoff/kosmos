(ns kosmos.editor.core
  (:require [clojure.string :as str]
            [kosmos.db :as db]))

(def editor-pattern
  '[:db/ident :editor/current :db/id :type :value {:node/child ...}])

(defn join-with-space [parts]
  (str/join " " parts))

(defn sentance [{words-n-punctuation :node/child}]
  (-> (map :value words-n-punctuation)
      join-with-space))

(defn paragraph->text-lines [{sentences :node/child}]
  (-> (map sentance sentences)
      join-with-space))

(defn view []
  (let [node (db/pull @db/db editor-pattern :editor)
        tree (-> node :node/child first)
        paragraphs (-> tree :node/child)
        text-lines (mapv paragraph->text-lines paragraphs)]
    (map (fn [line]
           [:text {:value line}])
         text-lines)))
