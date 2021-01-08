(ns kosmos.editor.core
  (:require [kosmos.db :as db]
            [kosmos.lib.ui :as ui]))

(def editor-pattern
  '[:db/ident :editor/current :db/id :type :value {:node/child ...}])

(defn- current-word? [{id :db/id}]
  (let [editor-node (db/pull @db/db editor-pattern :editor)]
    (= id (:editor/current editor-node))))

(defn- word-view [word]
  (let [value (str (:value word))]
    [:z-stack
     (when (current-word? word)
       [:rect {:x 0
               :y 0
               ;; TODO: add function to get text width without making it an element
               :width (ui/width [:text value])
               :height 28
               :fill 0xFFE4E4E4}])
     [:text value]]))

(defn- sentence-view [sentence]
  (concat [:v-stack]
           (map word-view (:node/child sentence))))

(defn- paragraph-view [paragraph]
  (concat [:v-stack]
          (map sentence-view (:node/child paragraph))))

(defn- document-view [document]
  ; TODO: change code to accept vectors/lazy-seq as arguments
  (concat [:h-stack]
          (map paragraph-view (get document :node/child []))))

(defn view []
  (let [node (db/pull @db/db editor-pattern :editor)
        tree (-> node :node/child first)]
    (document-view tree)))

(comment
  (db/pull @db/db editor-pattern :editor))