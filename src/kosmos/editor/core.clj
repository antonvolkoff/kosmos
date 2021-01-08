(ns kosmos.editor.core
  (:require [kosmos.db :as db]
            [kosmos.lib.ui :as ui]
            [kosmos.lib.ui.elements :as e]))

(def editor-pattern
  '[:db/ident :editor/current :db/id :type :value {:node/child ...}])

(defn- current-node? [{id :db/id}]
  (let [editor-node (db/pull @db/db editor-pattern :editor)]
    (= id (:editor/current editor-node))))

(defn- current-wrapper [element]
  (e/z-stack
   [(-> (e/rectangle)
        (e/frame {:width (ui/width element) :height (ui/height element)})
        (e/fill 0xFFE4E4E4))
    element]))

(defn- word-view [word]
  (let [value (str (:value word))
        element (e/text value)]
    (if (current-node? word)
      (current-wrapper element)
      element)))

(defn- sentence-view [sentence]
  (let [element (e/v-stack 
                 (map word-view (:node/child sentence))
                 :spacing 10) ]
    (if (current-node? sentence)
      (current-wrapper element)
      element)))

(defn- paragraph-view [paragraph]
  (let [element (e/v-stack 
                 (map sentence-view (:node/child paragraph))
                 :spacing 10)]
    (if (current-node? paragraph)
      (current-wrapper element)
      element)))

(defn- document-view [document]
  (e/h-stack 
   (map paragraph-view (get document :node/child []))
   :spacing 10))

(defn view []
  (let [node (db/pull @db/db editor-pattern :editor)
        tree (-> node :node/child first)]
    (document-view tree)))
