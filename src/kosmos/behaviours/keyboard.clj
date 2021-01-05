; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.behaviours.keyboard
  (:require [clojure.core.async :as async :refer [chan go-loop <!]]
            [clojure.spec.alpha :as s]
            [kosmos.lib.glfw :as glfw]
            [kosmos.editor.events :as editor]))

(s/def ::keyboard-signal (s/keys :req [::key ::action ::scancode ::mode]))

(defonce in (chan 5))

(defn pressed? [{action :action}]
  (= action glfw/glfw-press))

(defn released? [{action :action}]
  (= action glfw/glfw-release))

(defn repeated? [{action :action}]
  (= action glfw/glfw-repeat))

(defn on-key-pressed [key]
  (condp = key
    glfw/glfw-key-down (editor/commit! (editor/down))
    glfw/glfw-key-up (editor/commit! (editor/up))
    glfw/glfw-key-left (editor/commit! (editor/left))
    glfw/glfw-key-right (editor/commit! (editor/right))))

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
