; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [clojure.string :as str]
            [clojure.zip :as zip]
            [kosmos.lib.skija :refer [color]]
            [kosmos.db :as db]
            [kosmos.systems :as systems])
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
  (db/add! {:id "caret" :caret {} :shape [:line {:x0 100 :y0 100 :x1 100 :y1 130}]})
  (db/add! {:id "keyboard" :keyboard {:events []}})
  (swap! db/db assoc :buffer {:tokens []}))

(defn update-state []
  (let [changeset (systems/keyboard @db/db)]
    (swap! db/db merge changeset)))

(defn render [^Canvas canvas]
  (update-state)
  (.clear canvas (color 0xFFFAFAFA))
  (let [layer (.save canvas)
        shapes (db/select-by-key @db/db :shape)
        tokens (get-in @db/db [:buffer :tokens])
        lines (map #(str/join " " %) tokens)
        text-shapes (map-indexed (fn [idx line]
                                   {:x 40 :y (+ 20 (* 40 (inc idx))) :value line})
                                 lines)]
    (->> shapes
         (map :shape)
         (map #(draw canvas %))
         doall)
    (->> text-shapes
         (map #(draw-text canvas %))
         doall)
    (.restoreToCount canvas layer)))

(defn handle-key [_win key scancode action mods]
  (let [keyboard-entity (first (db/select-by-key @db/db :keyboard))
        event {:key key :action action :scancode scancode :mods mods}]
    (db/add! (update-in keyboard-entity [:keyboard :events] conj event))))

(comment
  ; load text into a buffer
  (let [lines (str/split-lines "# Hello\r\nThis is a sentance.\r\n")
        tokens (mapv #(str/split % #" ") lines)]
    (swap! db/db assoc :buffer {:tokens tokens}))

  ; update text in a buffer
  (let [tokens (get-in @db/db [:buffer :tokens])
        zipper (zip/vector-zip tokens)
        updated (-> zipper zip/down zip/down (zip/replace "#") zip/root)]
    (swap! db/db assoc :buffer {:tokens updated})))
