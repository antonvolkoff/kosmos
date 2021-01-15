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
    :rectangle (-> element :frame :height)
    :rounded-rectangle (-> element :frame :height)
    0))

(defn width [{:keys [type] :as element}]
  (case type
    :text (-> element :body text-dimentions :width)
    :v-stack (reduce + (conj (map width (:children element))
                             (* (:spacing element) (count (:children element)))))
    :z-stack (apply max (map width (:children element)))
    :rectangle (-> element :frame :width)
    :rounded-rectangle (-> element :frame :width)
    0))

(defmulti draw
  (fn [_ {:keys [type]}]
    (or type :unknown)))

(defn text [{:keys [canvas]} {:keys [body]}]
  (-> canvas (.drawString body 0 default-font-size default-font default-paint)))

(defn h-stack [{:keys [canvas] :as context} {:keys [children spacing]}]
  (-> canvas .save)
  (->> children
       (map (fn [child]
              (draw context child)
              (-> canvas (.translate 0 (+ (height child) spacing)))))
       doall)
  (-> canvas .restore))

(defn v-stack [{:keys [canvas] :as context} {:keys [children spacing]}]
  (-> canvas .save)
  (->> children
       (map (fn [child]
              (draw context child)
              (-> canvas (.translate (+ (width child) spacing) 0))))
       doall)
  (-> canvas .restore))

(defn z-stack [{:keys [canvas] :as context} {:keys [children]}]
  (-> canvas .save)
  (->> children (map #(draw context %)) doall)
  (-> canvas .restore))

(defn rect [{:keys [canvas]} {:keys [frame fill border]}]
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

(defn rrect [{:keys [canvas]} {:keys [radius frame fill border]}]
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

(defn apply-padding [{:keys [canvas]} {:keys [padding]}]
  (when padding
    (-> canvas (.translate (:left padding) (:top padding)))))

(defn expand-frame [context {:keys [frame] :as element}]
  (cond-> element
    (nil? (:width frame)) (assoc-in [:frame :width] (:width context))
    (nil? (:height frame)) (assoc-in [:frame :height] (:height context))))

(defmethod draw :unknown [_ _] nil)

(defmethod draw :text [context element]
  (apply-padding context element)
  (text context element))

(defmethod draw :h-stack [context element]
  (apply-padding context element)
  (h-stack context element))

(defmethod draw :v-stack [context element]
  (apply-padding context element)
  (v-stack context element))

(defmethod draw :z-stack [context element]
  (apply-padding context element)
  (z-stack context element))

(defmethod draw :rectangle [context element]
  (let [full-element (expand-frame context element)]
    (apply-padding context full-element)
    (rect context full-element)))

(defmethod draw :rounded-rectangle [context element]
  (let [full-element (expand-frame context element)]
    (apply-padding context full-element)
    (rrect context full-element)))

(defn skia [context & elements]
  (run! #(draw context %) elements))
