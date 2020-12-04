(ns kosmos.canvas.events
  (:require [re-frame.core :refer [reg-event-db]]
            [clojure.walk :refer [keywordize-keys]]))

(defn add-node [db [_ node]]
  (let [node (keywordize-keys node)
        node-id (:id node)]
    (assoc-in db [:canvas :nodes node-id] node)))

(defn connect-nodes [db [_ [source-id target-id]]]
  (let [edge {:source-id source-id :target-id target-id}]
    (update-in db [:canvas :edges] (fnil conj []) edge)))

(reg-event-db :canvas/add-node add-node)
(reg-event-db :canvas/connect-nodes connect-nodes)
