(ns kosmos.lib.ui
  (:require [clojure.spec.alpha :as s]
            [kosmos.lib.skija :refer [color]])
  (:import [org.jetbrains.skija FontMgr FontStyle Paint Font]))

(def default-paint (-> (new Paint) (.setColor (color 0xFF000000))))

(def typeface (-> (FontMgr/getDefault)
                  (.matchFamilyStyle "JetBrains Mono" FontStyle/NORMAL)))

(def default-font (-> (new Font) (.setTypeface typeface) (.setSize 28)))

(s/def ::text-value string?)

(defn text-dimentions [value]
  (let [bounding-box (.measureText default-font value)
        width (-> bounding-box .getWidth)
        height (-> bounding-box .getHeight)]
    {:width width :height height}))

(def default-text-args {:x 0 :y 0 :value ""})

(declare draw-text)
(declare draw-stack)
(declare draw-layer)

(defmulti draw
  (fn [_ [type _]]
    (or type :unknown)))

(defmethod draw :text [canvas [_ args]]
  (draw-text canvas (merge default-text-args args)))

(defmethod draw :stack [canvas [_ args]]
  (draw-stack canvas args))

(defmethod draw :layer [canvas [_ args]]
  (draw-layer canvas args))

(defmethod draw :unknown [_ _]
  nil)

(defn draw-text [canvas {:keys [x y value]}]
  (let [{height :height} (text-dimentions value)]
    (.drawString canvas value x (+ y height) default-font default-paint)))

(defn horizontal [[_ top-args] [bottom-type bottom-args]]
  (let [height (-> top-args :value text-dimentions :height)
        y (or (:y top-args) 0)]
    [bottom-type
     (-> default-text-args (merge bottom-args) (update :y + y height))]))

(defn vertical [[_ top-args] [bottom-type bottom-args]]
  (let [width (-> top-args :value text-dimentions :width)
        x (or (:x top-args) 0)]
    [bottom-type
     (-> default-text-args (merge bottom-args) (update :x + x width))]))

(defn align
  ([direction-fn unaligned]
   (align direction-fn (rest unaligned) [(first unaligned)]))
  ([direction-fn unaligned aligned]
   (if (empty? unaligned)
     aligned
     (let [aligned-element (direction-fn (last aligned) (first unaligned))]
       (recur direction-fn (rest unaligned) (conj aligned aligned-element))))))

(defn draw-stack [canvas {:keys [direction elements]}]
  (when (seq elements)
    (let [direction-fn
          (case direction
            :horizontal horizontal
            :vertical vertical)]
      (->> elements
           (align direction-fn)
           (run! #(draw canvas %))))))

(defn draw-layer [canvas {:keys [elements]}]
  (run! #(draw canvas %) elements))

(defn skia [canvas & elements]
  (run! #(draw canvas %) elements))
