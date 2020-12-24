; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.main
  (:require [clojure.string :as str]
            [clojure.core.async :refer [go]]
            [nrepl.server :as nrepl]
            [kosmos.window :as window]
            [kosmos.db :as db]
            [kosmos.systems :as systems]))

(defn read-lines [path]
  (str/split-lines (slurp path)))

(defn save-lines [path lines]
  (spit path (str/join "\r\n" lines)))

(defn apply-system [state system]
  (merge state (system state)))

(defn update-db [state]
  (reset! db/db (:db state))
  state)

(defn tick [canvas]
  (-> {:db @db/db :canvas canvas}
      (apply-system systems/keyboard)
      (apply-system systems/render)
      (update-db)))

(defn keypress [_win key scancode action mods]
  (let [keyboard-entity (first (db/select-by-key @db/db :keyboard))
        event {:key key :action action :scancode scancode :mods mods}]
    (db/add! (update-in keyboard-entity [:keyboard :events] conj event))))

(defn make-caret []
  {:id (db/random-uuid)
   :caret {}
   :shape [:line {:x0 100 :y0 100 :x1 100 :y1 130}]})

(defn make-keyboard []
  {:id (db/random-uuid) :keyboard {:events []}})

(defn -main [& _args]
  (go (nrepl/start-server :port 7888)
      (println "nREPL is running on localhost:7888"))

  (db/add! (make-caret))
  (db/add! (make-keyboard))

  (window/create {:width 800
                  :height 640
                  :title "Kosmos"
                  :on-draw tick
                  :on-keypress keypress}))

(comment
  ; Open file
  (->> (kosmos.main/read-lines "/Users/antonvolkoff/Code/github.com/antonvolkoff/kosmos/src/kosmos/fx.cljs")
       (map-indexed (fn [idx line]
                      {:id (db/random-uuid)
                       :shape [:text {:x 40 :y (+ 60 (* idx 44)) :value line}]}))
       (map db/add!)
       (doall)))

