(ns kosmos.systems
  (:import [org.jetbrains.skija Paint Font FontMgr FontStyle]))

(defn keyboard [_state]
  )

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn color [rgba]
  (.intValue (Long/valueOf rgba)))

(def clear-color (color 0xFFF0F0F0))

(def black-color (color 0xFF000000))

(def black-paint (.setColor (new Paint) black-color))

(def typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "JetBrains Mono" FontStyle/NORMAL)))

(def font (-> (new Font) (.setTypeface typeface) (.setSize 32)))

(defn line-shape? [{:keys [shape]}]
  (and shape (= :line (first shape))))

(defn text-shape? [{:keys [shape]}]
  (and shape (= :text (first shape))))

(defn draw-text-fn [canvas]
  (fn [{[_ shape] :shape}]
    (.drawString canvas (:value shape) (:x shape) (:y shape) font black-paint)))

(defn draw-line-fn [canvas]
  (fn [{shape :shape}]
    (let [[_ attrs] shape {:keys [x0 y0 x1 y1]} attrs]
      (.drawLine canvas x0 y0 x1 y1 black-paint))))

(defn draw-text [db canvas]
  (let [text-shapes (filter text-shape? (vals db))]
    (->> text-shapes (map (draw-text-fn canvas)) doall)))

(defn draw-lines [db canvas]
  (let [line-shapes (filter line-shape? (vals db))]
    (->> line-shapes (map (draw-line-fn canvas)) doall)))

(defn render [{:keys [db canvas]}]
  (.clear canvas clear-color)
  (draw-lines db canvas)
  (draw-text db canvas)
  {})
