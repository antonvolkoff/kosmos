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

(defn move-node [db [_ [node-id x y]]]
  (update-in db [:canvas :nodes node-id] merge {:x x :y y}))

(defn part-of-edge? [{:keys [source-id target-id]} node-id]
  (or (= node-id source-id) (= node-id target-id)))

(def not-part-of-edge? (complement part-of-edge?))

; Should this belong to a different namespace?
(defn remove-all-edges [edges node-id]
  (filter #(not-part-of-edge? % node-id) edges))

(defn delete-node [db [_ node-id]]
  (print node-id)
  (-> db
      (update-in [:canvas :nodes] dissoc node-id)
      (update-in [:canvas :edges] remove-all-edges node-id)))

(reg-event-db :canvas/add-node add-node)
(reg-event-db :canvas/connect-nodes connect-nodes)
(reg-event-db :canvas/move-node move-node)
(reg-event-db :canvas/delete-node delete-node)
