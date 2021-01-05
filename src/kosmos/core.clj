; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [clojure.core.async :refer [>!!]]
            [kosmos.lib.skija :refer [color]]
            [kosmos.behaviours.keyboard :as keyboard]
            [kosmos.editor.view :refer [editor]]
            [kosmos.editor.events]
            [kosmos.db :refer [seed!]])
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
  (seed!)
  (keyboard/init))

(defn render [^Canvas canvas]
  (.clear canvas (color 0xFFFAFAFA))
  (let [layer (.save canvas)]
    (doall (map #(draw canvas %) (editor)))
    (.restoreToCount canvas layer)))

(defn handle-key [_win key scancode action mods]
  (>!! keyboard/in {:key key :action action :scancode scancode :mods mods}))
