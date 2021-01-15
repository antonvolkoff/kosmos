(ns kosmos.lib.ui
  (:require [kosmos.lib.skija :refer [color]])
  (:import [org.jetbrains.skija FontMgr FontStyle Paint Font Rect PaintMode
            RRect]))

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

(defn height [{:keys [type] :as element}]
  (case type
    :text default-font-size
    :v-stack (apply max (map height (:children element)))
    :z-stack (apply max (map height (:children element)))
    0))

(defn width [{:keys [type] :as element}]
  (case type
    :text (-> element :body text-dimentions :width)
    :v-stack (reduce + (conj (map width (:children element))
                             (* (:spacing element) (count (:children element)))))
    :z-stack (apply max (map width (:children element)))
    0))

(defmulti draw
  (fn [_canvas {:keys [type]}]
    (or type :unknown)))

(defn text [canvas {:keys [body]}]
  (-> canvas (.drawString body 0 default-font-size default-font default-paint)))

(defn h-stack [canvas {:keys [children spacing]}]
  (-> canvas .save)
  (->> children
       (map (fn [child]
              (draw canvas child)
              (-> canvas (.translate 0 (+ (height child) spacing)))))
       doall)
  (-> canvas .restore))

(defn v-stack [canvas {:keys [children spacing]}]
  (-> canvas .save)
  (->> children
       (map (fn [child]
              (draw canvas child)
              (-> canvas (.translate (+ (width child) spacing) 0))))
       doall)
  (-> canvas .restore))

(defn z-stack [canvas {:keys [children]}]
  (-> canvas .save)
  (->> children (map #(draw canvas %)) doall)
  (-> canvas .restore))

(defn rect [canvas {:keys [frame fill border]}]
  (let [{:keys [width height]} frame
        skia-rect (Rect/makeXYWH 0 0 width height)]
    (when fill
      (let [paint (-> (new Paint) (.setColor (color fill)))]
        (-> canvas (.drawRect skia-rect paint))))
    (when border
      (let [paint (-> (new Paint)
                      (.setMode PaintMode/STROKE)
                      (.setColor (color (:color border)))
                      (.setStrokeWidth (:width border)))]
        (-> canvas (.drawRect skia-rect paint))))))

(defn rrect [canvas {:keys [radius frame fill border]}]
  (let [shape (RRect/makeXYWH 0 0 (:width frame) (:height frame) radius)]
    (when fill
      (let [paint (-> (new Paint) (.setColor (color fill)))]
        (-> canvas (.drawRRect shape paint))))
    (when border
      (let [paint (-> (new Paint)
                      (.setMode PaintMode/STROKE)
                      (.setColor (color (:color border)))
                      (.setStrokeWidth (:width border)))]
        (-> canvas (.drawRRect shape paint))))))

(defn apply-padding [canvas {:keys [padding]}]
  (when padding
    (-> canvas (.translate (:left padding) (:top padding)))))

(defmethod draw :unknown [_ _] nil)

(defmethod draw :text [canvas element]
  (apply-padding canvas element)
  (text canvas element))

(defmethod draw :h-stack [canvas element]
  (apply-padding canvas element)
  (h-stack canvas element))

(defmethod draw :v-stack [canvas element]
  (apply-padding canvas element)
  (v-stack canvas element))

(defmethod draw :z-stack [canvas element]
  (apply-padding canvas element)
  (z-stack canvas element))

(defmethod draw :rectangle [canvas element]
  (apply-padding canvas element)
  (rect canvas element))

(defmethod draw :rounded-rectangle [canvas element]
  (apply-padding canvas element)
  (rrect canvas element))

(defn skia [canvas & elements]
  (run! #(draw canvas %) elements))
