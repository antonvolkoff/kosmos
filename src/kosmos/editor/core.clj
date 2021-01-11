(ns kosmos.editor.core
  (:require [clojure.zip :as z]
            [kosmos.lib.ui :as ui]
            [kosmos.lib.ui.elements :as e]
            [kosmos.editor.handlers :as handlers]))

(defn init [_args]
  {:db {:editor {}}})

(defn handle-message [state event]
  (case (first event)
    :key (handlers/on-key state event)
    :editor/load (handlers/on-load state event)
    state))

(defn- current-wrapper [element]
  (e/z-stack
   [(-> (e/rectangle)
        (e/frame {:width (ui/width element) :height (ui/height element)})
        (e/fill 0xFFE4E4E4))
    element]))

(defn- word-view [{id :id body :value} current-node-id]
  (let [element (e/text (str body))]
    (if (= id current-node-id)
      (current-wrapper element)
      element)))

(defn- sentence-view [{id :id words :words} current-node-id]
  (let [element (e/v-stack
                 (map #(word-view % current-node-id) words)
                 :spacing 10)]
    (if (= id current-node-id)
      (current-wrapper element)
      element)))

(defn- paragraph-view [{id :id sentences :sentences} current-node-id]
  (let [element (e/v-stack
                 (map #(sentence-view % current-node-id) sentences)
                 :spacing 10)]
    (if (= id current-node-id)
      (current-wrapper element)
      element)))

(defn- document-view [document current-node-id]
  (e/h-stack
   (map #(paragraph-view % current-node-id) (get document :paragraphs []))
   :spacing 10))

(defn view [{:keys [editor]}]
  (let [document (:ast editor)
        current-id (some-> editor :zipper z/node :id)]
    (document-view document current-id)))