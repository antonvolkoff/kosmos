(ns kosmos.lib.ui
  (:require [kosmos.lib.skija :refer [color]])
  (:import [org.jetbrains.skija FontMgr FontStyle Paint Font Rect]))

(def default-paint (-> (new Paint) (.setColor (color 0xFF000000))))

(def typeface (-> (FontMgr/getDefault)
                  (.matchFamilyStyle "Fira Code" FontStyle/NORMAL)))

(def default-font-size 28)

(def default-font (-> (new Font)
                      (.setTypeface typeface)
                      (.setSize default-font-size)))

(defn text-dimentions [value]
  (let [bounding-box (.measureText default-font value)
        width (-> bounding-box .getWidth)
        height (-> bounding-box .getHeight)]
    {:width width :height height}))

(defn height [[type & opts]]
  (case type
    :text default-font-size
    :v-stack (apply max (map height opts))
    :z-stack (apply max (map height opts))
    0))

(defn width [[type & opts]]
  (case type
    :text (-> opts first text-dimentions :width)
    :v-stack (reduce + (map width opts))
    :z-stack (apply max (map width opts))
    0))

(def default-text-args {:x 0 :y 0 :value ""})

(def default-rect-args {:x 0 :y 0 :width 0 :height 0 :fill 0xFF000000})

(defmulti draw
  (fn [_ [type _]]
    (or type :unknown)))

(defn text [canvas value]
  (.drawString canvas value 0 default-font-size default-font default-paint))

(defn h-stack [canvas elements]
  (-> canvas .save)
  (->> elements
       (map (fn [el]
              (draw canvas el)
              (-> canvas (.translate 0 (height el)))))
       doall)
  (-> canvas .restore))

(defn v-stack [canvas elements]
  (-> canvas .save)
  (->> elements
       (map (fn [el]
              (draw canvas el)
              (-> canvas (.translate (width el) 0))))
       doall)
  (-> canvas .restore))

(defn z-stack [canvas elements]
  (-> canvas .save)
  (->> elements (map #(draw canvas %)) doall)
  (-> canvas .restore))

(defn rect [canvas {:keys [x y width height fill]}]
  (let [skia-rect (Rect/makeXYWH x y width height)
        paint (-> (new Paint) (.setColor (color fill)))]
    (-> canvas (.drawRect skia-rect paint))))

(defn padding [canvas pad-size element]
  (-> canvas .save)
  (-> canvas (.translate pad-size pad-size))
  (draw canvas element)
  (-> canvas .restore))

(defmethod draw :unknown [_ _] nil)
(defmethod draw :text [canvas [_ value]] (text canvas value))
(defmethod draw :h-stack [canvas [_ & elements]] (h-stack canvas elements))
(defmethod draw :v-stack [canvas [_ & elements]] (v-stack canvas elements))
(defmethod draw :z-stack [canvas [_ & elements]] (z-stack canvas elements))
(defmethod draw :rect [canvas [_ args]]
  (rect canvas (merge default-rect-args args)))
(defmethod draw :padding [canvas [_ length element]]
  (padding canvas length element))

(defn skia [canvas & elements]
  (run! #(draw canvas %) elements))
