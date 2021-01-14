(ns kosmos.lib.ui.elements
  (:require [clojure.spec.alpha :as s]))

(s/def ::elements vector?)
(s/def ::element map?)

;; Elements
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn h-stack [elements & {:keys [spacing] :or {spacing 0}}]
  {:type :h-stack :children elements :spacing spacing})

(defn v-stack [elements & {:keys [spacing] :or {spacing 0}}]
  {:type :v-stack :children elements :spacing spacing})

(defn z-stack [elements]
  {:type :z-stack :children elements})

(defn text [value]
  {:type :text :body value})

(defn rectangle []
  {:type :rectangle})

;; Modifiers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn padding
  ([element size]
   (padding element size size size size))
  ([element x y]
   (padding element x y x y))
  ([element top right bottom left]
   (assoc element :padding {:top top :right right :bottom bottom :left left})))

(defn frame [element {:keys [width height]}]
  (assoc element :frame {:width width :height height}))

(defn fill [element color]
  (assoc element :fill color))
