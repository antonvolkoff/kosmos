(ns kosmos.text
  (:require [blancas.kern.core :as kern]))

(defn make-node [type]
  {:type type :children []})

(defn add-child [node child-type child]
  (if child
    (-> node
        (update :children conj child-type)
        (assoc child-type child))
    node))

(def word (kern/<+> (kern/many
                     (kern/<|> kern/letter kern/digit (kern/sym* \,)))))

(def punctuation (kern/<|> (kern/sym* \!)
                           (kern/sym* \.)
                           (kern/sym* \?)))

(def sentance
  (kern/bind
   [words (kern/many (kern/<< word (kern/optional kern/space)))
    end-of-sentance (kern/optional punctuation)]
   (kern/return
    (-> (make-node :sentence)
        (add-child :words (remove empty? words))
        (add-child :punctuation end-of-sentance)))))

(def paragraph
  (kern/bind
   [[sentances _] (kern/<*> (kern/many sentance)
                            (kern/optional kern/new-line*))]
   (kern/return
    (-> (make-node :paragraph) (add-child :sentences sentances)))))

(def document
  (kern/bind
   [paragraphs (kern/many paragraph)]
   (kern/return
    (-> (make-node :document) (add-child :paragraphs paragraphs)))))

(defn unpack [text]
  (kern/value document text))
