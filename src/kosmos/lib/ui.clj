(ns kosmos.lib.ui
  (:require [clojure.spec.alpha :as s]
            [kosmos.lib.skija :refer [color]])
  (:import [org.jetbrains.skija FontMgr FontStyle Paint Font Rect]))

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

(def default-rect-args {:x 0 :y 0 :width 0 :height 0 :fill 0xFF000000})

(declare text)
(declare stack)
(declare layer)
(declare rect)
(declare padding)

(defmulti draw
  (fn [_ [type _]]
    (or type :unknown)))

(defmethod draw :text [canvas [_ args]]
  (text canvas (merge default-text-args args)))

(defmethod draw :stack [canvas [_ args]]
  (stack canvas args))

(defmethod draw :layer [canvas [_ args]]
  (layer canvas args))

(defmethod draw :rect [canvas [_ args]]
  (rect canvas (merge default-rect-args args)))

(defmethod draw :padding [canvas [_ length element]]
  (padding canvas length element))

(defmethod draw :unknown [_ _]
  nil)

(defn text [canvas {:keys [x y value]}]
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

(defn stack [canvas {:keys [direction elements]}]
  (when (seq elements)
    (let [direction-fn
          (case direction
            :horizontal horizontal
            :vertical vertical)]
      (->> elements
           (align direction-fn)
           (run! #(draw canvas %))))))

(defn layer [canvas {:keys [elements]}]
  (run! #(draw canvas %) elements))

(defn rect [canvas {:keys [x y width height fill]}]
  (let [skia-rect (Rect/makeXYWH x y width height)
        paint (-> (new Paint) (.setColor (color fill)))]
    (-> canvas (.drawRect skia-rect paint))))

(defn padding [canvas pad-size element]
  (-> canvas .save)
  (-> canvas (.translate pad-size pad-size))
  (draw canvas element)
  (-> canvas .restore))

(defn skia [canvas & elements]
  (run! #(draw canvas %) elements))
