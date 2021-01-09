(ns kosmos.editor.core
  (:require [kosmos.db :refer [pull]]
            [kosmos.lib.ui :as ui]
            [kosmos.lib.ui.elements :as e]))

(def editor-pattern
  '[:db/ident :editor/current :db/id :type :value {:node/child ...}])

(defn- current-wrapper [element]
  (e/z-stack
   [(-> (e/rectangle)
        (e/frame {:width (ui/width element) :height (ui/height element)})
        (e/fill 0xFFE4E4E4))
    element]))

(defn- word-view [{id :db/id body :value} current-node-id]
  (let [element (e/text (str body))]
    (if (= id current-node-id)
      (current-wrapper element)
      element)))

(defn- sentence-view [{id :db/id words :node/child} current-node-id]
  (let [element (e/v-stack 
                 (map #(word-view % current-node-id) words)
                 :spacing 10) ]
    (if (= id current-node-id)
      (current-wrapper element)
      element)))

(defn- paragraph-view [{id :db/id sentences :node/child} current-node-id]
  (let [element (e/v-stack
                 (map #(sentence-view % current-node-id) sentences)
                 :spacing 10)]
    (if (= id current-node-id)
      (current-wrapper element)
      element)))

(defn- document-view [document current-node-id]
  (e/h-stack 
   (map #(paragraph-view % current-node-id) (get document :node/child []))
   :spacing 10))

(defn view [{:keys [db]}]
  (let [editor (pull db editor-pattern :editor)
        document (-> editor :node/child first)
        current-node-id (:editor/current editor)]
    (document-view document current-node-id)))
