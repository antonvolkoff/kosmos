(ns kosmos.events
  (:require [re-frame.core :refer [reg-event-fx reg-event-db]]
            [kosmos.node.path :refer [parse]]))

(def path-lib (js/require "path"))

(defn filename [path]
  (.-base (parse path)))

(defn title [filename]
  (str filename " - Kosmos"))

(reg-event-fx
 :init
 (fn [_ _]
   {:window-title (title "untitled")
    :db {:nodes {}}}))

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

(defn add-node 
  [db _]
  (let [id (random-uuid)
        node {:id id :value ""}]
    (assoc-in db [:nodes id] node)))

(reg-event-db :add-node add-node)

(defn change-node-value
  [db [_ id new-value]]
  (assoc-in db [:nodes id :value] new-value))

(reg-event-db :change-node-value change-node-value)
