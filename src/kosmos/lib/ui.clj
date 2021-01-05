(ns kosmos.lib.ui
  (:require [clojure.spec.alpha :as s]
            [kosmos.lib.skija :refer [color]])
  (:import [org.jetbrains.skija FontMgr FontStyle Paint Font]))

(def default-paint (-> (new Paint) (.setColor (color 0xFF000000))))

(def typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "JetBrains Mono" FontStyle/NORMAL)))

(def default-font (-> (new Font) (.setTypeface typeface) (.setSize 28)))

(s/def ::text-value string?)

(defn text [value]
  (let [bounding-box (.measureText default-font value)
        width (-> bounding-box .getWidth)
        height (-> bounding-box .getHeight)]
    (with-meta
      {:type :text :value value :x 0 :y height}
      {:width width :height height})))

(s/def ::axis #{:horizontal :vertical})

(defn- below [top-element bottom-element]
  [top-element])

(defn stack [axis & elements]
  (->> elements
       (partition 2 1 nil)
       (map below elements)))

;;; Render

(defn draw-text [canvas {:keys [x y value]}]
  (.drawString canvas value x y default-font default-paint))

(defmulti draw (fn [_ {type :type}] type))
(defmethod draw :text [canvas attributes] (draw-text canvas attributes))

(defn skia [canvas & elements]
  (run! #(draw canvas %) elements))

(comment
  [stack :horizontal
   [text "Hello"]
   [text "How are you?"]])