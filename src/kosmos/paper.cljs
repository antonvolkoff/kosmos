(ns kosmos.paper
  (:require [clojure.set :refer [rename-keys]]
            ["@psychobolt/react-paperjs" :refer [PaperContainer Line Rectangle Circle Layer]]))

(def kmap {:stoke-color :stokeColor
           :fill-color :fillColor})

(def paper-props {:canvasProps {:resize ""}})

(defn paper-container
  [& children]
  (conj [:> PaperContainer paper-props] children))

(defn layer
  [& children]
  [:> Layer children])

(defn line
  "Creates a line path.
   Example:
   ```clojure
   [line {:from [0 0] :to [100 100] :stoke-color \"black\"}]
   ```"
  [attrs]
  [:> Line (rename-keys attrs kmap)])

(defn rectangle
  "Creates a rectangle path.
   Example:
   ```clojure
   [rectangle {:from [0 0] :size [100 100] :fill-color \"black\"}]
   ```"
  [attrs]
  [:> Rectangle (rename-keys attrs kmap)])

(defn circle
  "Creates a circle path.
   Example:
   ```clojure
   [circle {:center [50 50] :radius 20 :fill-color \"black\"}]
   ```"
  [attrs]
  [:> Circle (rename-keys attrs kmap)])
