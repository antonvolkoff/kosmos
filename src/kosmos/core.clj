; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [clojure.string :as str]
            [clojure.zip :as zip]
            [clojure.core.async :refer [>!!]]
            [kosmos.lib.skija :refer [color]]
            [kosmos.db :as db]
            [kosmos.behaviours.keyboard :as keyboard])
  (:import [org.jetbrains.skija Canvas FontMgr FontStyle Paint Font]))

(def black-paint (.setColor (Paint.) (color 0xFF000000)))

(def typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "JetBrains Mono" FontStyle/NORMAL)))

(def font (-> (new Font) (.setTypeface typeface) (.setSize 28)))

(def elements [[:line {:x0 0 :y0 0 :x1 100 :y1 100}]
               [:text {:x 100 :y 100 :value "Hello"}]])

(defn draw-line [canvas {:keys [x0 y0 x1 y1]}]
  (.drawLine canvas x0 y0 x1 y1 black-paint))

(defn draw-text [canvas {:keys [x y value]}]
  (.drawString canvas value x y font black-paint))

(defmulti draw
  (fn [_ element]
    (first element)))

(defmethod draw :line [canvas [_ attributes]]
  (draw-line canvas attributes))

(defmethod draw :text [canvas [_ attributes]]
  (draw-text canvas attributes))

(defmethod draw :default [_ _]
  (println "Warning: Unknown element"))

(defn init []
  (swap! db/db assoc :buffer {:tokens []})
  (keyboard/init))

(defn render [^Canvas canvas]
  (.clear canvas (color 0xFFFAFAFA))
  (let [layer (.save canvas)
        tokens (get-in @db/db [:buffer :tokens])
        lines (map #(str/join " " %) tokens)
        text-shapes (map-indexed (fn [idx line]
                                   [:text {:x 40 :y (+ 20 (* 40 (inc idx))) :value line}])
                                 lines)]
    (->> text-shapes
         (map #(draw canvas %))
         doall)
    (.restoreToCount canvas layer)))

(defn handle-key [_win key scancode action mods]
  (>!! keyboard/in {:key key :action action :scancode scancode :mods mods}))

(comment
  ; load text into a buffer
  (let [lines (str/split-lines "# Hello\r\nThis is a sentance.\r\n")
        tokens (mapv #(str/split % #" ") lines)]
    (swap! db/db assoc :buffer {:tokens tokens
                                :zipper (zip/vector-zip tokens)}))

  ; update text in a buffer
  (let [zipper (get-in @db/db [:buffer :zipper])
        updated-tokens (-> zipper (zip/replace "X") zip/root)]
    (swap! db/db assoc-in [:buffer :tokens] updated-tokens))

  (get-in @db/db [:buffer :zipper]))
