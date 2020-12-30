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

(defn move-down [db]
  (update-in db [:buffer :zipper] zip/down))

(defn move-up [db]
  (update-in db [:buffer :zipper] zip/up))

(defn move-left [db]
  (update-in db [:buffer :zipper] zip/left))

(defn move-right [db]
  (update-in db [:buffer :zipper] zip/right))

(defn on-key-pressed [key]
  (condp = key
    glfw/glfw-key-down (swap! db/db move-down)
    glfw/glfw-key-up (swap! db/db move-up)
    glfw/glfw-key-left (swap! db/db move-left)
    glfw/glfw-key-right (swap! db/db move-right)))

(defn process [{:keys [key] :as signal}]
  (cond
    (released? signal) :do-nothing
    (pressed? signal) (on-key-pressed key)
    (repeated? signal) :do-nothing))

(defn init []
  (go-loop []
    (process (<! in))
    (recur)))
