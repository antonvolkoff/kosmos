(ns kosmos.window.events
  (:require [re-frame.core :refer [reg-event-db]]))

(defn dimensions []
  {:width (.-innerWidth js/window) :height (.-innerHeight js/window)})

(defn init [db _]
  (assoc db :window (dimensions)))

(defn resized [db _]
  (assoc db :window (dimensions)))

(reg-event-db :window/init resized)
(reg-event-db :window/resized resized)
