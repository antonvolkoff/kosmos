; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.behaviours.keyboard
  (:require [clojure.core.async :as async :refer [chan go-loop <!]]
            [clojure.spec.alpha :as s]
            [clojure.zip :as zip]
            [kosmos.db :as db]
            [kosmos.lib.glfw :as glfw]))

(s/def ::keyboard-signal (s/keys :req [::key ::action ::scancode ::mode]))

(defonce in (chan 5))

(defn pressed? [{action :action}]
  (= action glfw/glfw-press))

(defn released? [{action :action}]
  (= action glfw/glfw-release))

(defn repeated? [{action :action}]
  (= action glfw/glfw-repeat))

(defn find-buffer []
  (try
    (db/pull @db/db '[:db/id :zipper] :buffer)
    (catch Exception _e
      nil)))

(defn move-down [buffer]
  [(update buffer :zipper zip/down)])

(defn move-up [buffer]
  [(update buffer :zipper zip/up)])

(defn move-left [buffer]
  [(update buffer :zipper zip/left)])

(defn move-right [buffer]
  [(update buffer :zipper zip/right)])

(defn on-key-pressed [key]
  (condp = key
    glfw/glfw-key-down (some->> (find-buffer) (move-down) (db/transact! db/db))
    glfw/glfw-key-up (some->> (find-buffer) (move-up) (db/transact! db/db))
    glfw/glfw-key-left (some->> (find-buffer) (move-left) (db/transact! db/db))
    glfw/glfw-key-right (some->> (find-buffer) (move-right) (db/transact! db/db))))

(on-key-pressed glfw/glfw-key-down)

(defn process [{:keys [key] :as signal}]
  (cond
    (released? signal) :do-nothing
    (pressed? signal) (on-key-pressed key)
    (repeated? signal) :do-nothing))

(defn init []
  (go-loop []
    (try
      (process (<! in))
      (catch Exception e
        (println "Error:" (.getMessage e))))
    (recur)))
