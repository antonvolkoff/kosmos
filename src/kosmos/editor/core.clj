(ns kosmos.editor.core
  (:require [kosmos.db :as db]
            [kosmos.lib.ui :as ui]))

(def editor-pattern
  '[:db/ident :editor/current :db/id :type :value {:node/child ...}])

(defn- current-node? [{id :db/id}]
  (let [editor-node (db/pull @db/db editor-pattern :editor)]
    (= id (:editor/current editor-node))))

(defn- current-wrapper [element]
  [:z-stack
   [:rect 
    {:width (ui/width element) :height (ui/height element) :fill 0xFFE4E4E4}]
   element])

(defn- word-view [word]
  (let [value (str (:value word))
        element [:text value]]
    (if (current-node? word)
      (current-wrapper element)
      element)))

(defn- sentence-view [sentence]
  (let [sentance-element 
        (concat [:v-stack] (map word-view (:node/child sentence)))]
    (if (current-node? sentence)
      (current-wrapper sentance-element)
      sentance-element)))

(defn- paragraph-view [paragraph]
  (let [element 
        (concat [:v-stack] (map sentence-view (:node/child paragraph)))]
    (if (current-node? paragraph)
      (current-wrapper element)
      element)))

(defn- document-view [document]
  ; TODO: change code to accept vectors/lazy-seq as arguments
  (concat [:h-stack]
          (map paragraph-view (get document :node/child []))))

(defn view []
  (let [node (db/pull @db/db editor-pattern :editor)
        tree (-> node :node/child first)]
    (document-view tree)))
