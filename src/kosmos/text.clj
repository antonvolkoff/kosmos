(ns kosmos.text
  (:require [blancas.kern.core :as kern]))

(def document-node {:type :document
                    :children [:paragraphs]
                    :paragraphs []})

(def paragraph-node {:type :paragraph
                     :children [:sentences]
                     :sentences []})

(def sentence-node {:type :sentence
                    :children [:words]
                    :punctuation ""
                    :words []})

(defn build-ast [ast token]
  ast)

(def word (kern/<+> (kern/many kern/letter)))

(def punctuation (kern/sym* \!))

(def sentance
  (kern/bind
   [words (kern/many (kern/<< word (kern/optional kern/space)))
    end-of-sentance (kern/optional punctuation)]
   (kern/return {:type :sentence
                 :children [:words :punctuation]
                 :words words
                 :punctuation end-of-sentance})))

(def paragraph
  (kern/bind
   [[sentances _] (kern/<*> (kern/many sentance)
                            (kern/optional kern/new-line*))]
   (kern/return (assoc paragraph-node :sentences sentances))))

(def document
  (kern/bind
   [paragraphs (kern/many paragraph)]
   (kern/return (assoc document-node :paragraphs paragraphs))))

(defn unpack [text]
  (kern/value document text))
