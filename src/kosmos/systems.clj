(ns kosmos.systems
  (:require [kosmos.db :refer [select-by-key]])
  (:import [org.jetbrains.skija Paint Font FontMgr FontStyle]))

(def key-codes {262 :right
                263 :left})

(defn- move-caret [caret events]
  (if (empty? events)
    caret
    (let [top-event (first events)]
      (case (get key-codes (:key top-event) (:key top-event))
        :left (move-caret (-> caret
                              (update-in [:shape 1 :x0] - 10)
                              (update-in [:shape 1 :x1] - 10)) (rest events))
        :right (move-caret (-> caret
                               (update-in [:shape 1 :x0] + 10)
                               (update-in [:shape 1 :x1] + 10)) (rest events))
        (move-caret caret (rest events))))))

(defn keyboard [{:keys [db]}]
  (let [keyboard-entity (first (select-by-key db :keyboard))
        caret (first (select-by-key db :caret))
        updated-caret (move-caret caret (get-in keyboard-entity [:keyboard :events]))]
    {:db {(:id keyboard-entity) (assoc keyboard-entity :keyboard {:events []})
          (:id caret) updated-caret}}))

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
  ; TODO: Use multifunc to render different elements
  (draw-lines db canvas)
  (draw-text db canvas)
  {})
