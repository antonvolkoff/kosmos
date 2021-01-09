(ns kosmos.text
  (:require [clojure.set :refer [rename-keys]]
            [clojure.zip :as z]
            [blancas.kern.core :as kern]))

(def children-types {:word :words
                     :sentence :sentences
                     :paragraph :paragraphs
                     :punctuation :punctuation})

(defn make-node [node children]
  (let [children-by-type (rename-keys (group-by :type children) children-types)
        children-keys (keys children-by-type)]
    (cond-> (merge node children-by-type)
      children-keys (assoc :children children-keys))))

(defn children [node]
  (mapcat #(% node) (:children node)))

(def word
  (kern/bind
   [value (kern/<+> (kern/many (kern/<|> kern/letter kern/digit (kern/sym* \,))))]
   (kern/return
    (make-node {:type :word :value value} []))))

(def punctuation
  (kern/bind
   [value (kern/<|> (kern/sym* \!) (kern/sym* \.) (kern/sym* \?))]
   (kern/return
    (make-node {:type :punctuation :value value} []))))

(def sentance
  (kern/bind
   [begining-of-sentance (kern/optional kern/space)
    words (kern/many (kern/<< word (kern/optional kern/space)))
    end-of-sentance (kern/optional punctuation)]
   (kern/return
    (if end-of-sentance
      (make-node {:type :sentence} (conj words end-of-sentance))
      (make-node {:type :sentence} words)))))

(def paragraph
  (kern/bind
   [[sentances _] (kern/<*> (kern/many sentance)
                            (kern/optional kern/new-line*))]
   (kern/return
    (make-node {:type :paragraph :children [:sentences], :sentences []} sentances))))

(def document
  (kern/bind
   [paragraphs (kern/many paragraph)]
   (kern/return
    (make-node {:type :document :children [:paragraphs] :paragraphs []} paragraphs))))

(defn unpack [text]
  (kern/value document text))

(defn zipper [root]
  (let [branch? map?]
    (z/zipper branch? children make-node root)))