(ns kosmos.events
  (:require [re-frame.core :refer [reg-event-fx]]
            [kosmos.node.path :refer [parse]]))

(def path-lib (js/require "path"))

(defn filename [path]
  (.-base (parse path)))

(defn title [filename]
  (str filename " - Kosmos"))

(reg-event-fx
 :init
 (fn [_ _]
   {:window-title (title "untitled")}))

(reg-event-fx 
 :menu/clicked-open
 (fn [_ [_ path]]
   {:window-title (-> path filename title)}))

(reg-event-fx
 :keyboard/open-file
 (fn [_ [_ path]]
   {:window-title (-> path filename title)}))

(reg-event-fx
 :menu/clicked-save-as
 (fn [_ [_ path]]
   {:window-title (-> path filename title)}))
