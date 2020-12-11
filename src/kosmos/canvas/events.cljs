(ns kosmos.canvas.events
  (:require [re-frame.core :refer [reg-event-db reg-event-fx]]
            [clojure.walk :refer [keywordize-keys]]))

(defn add-node [db [_ node]]
  (let [node (keywordize-keys node)
        node-id (:id node)]
    (assoc-in db [:canvas :nodes node-id] node)))

(defn connect-nodes [db [_ [source-id target-id]]]
  (let [edge {:source-id source-id :target-id target-id}]
    (update-in db [:canvas :edges] (fnil conj []) edge)))

(defn get-child-ids [canvas node-id]
  (->> (:edges canvas)
       (filter #(= node-id (:source-id %)))
       (map :target-id)))

(defn node-moved
  "Prefer using node-moved-by instead. This event is handled for compitability with older event
   handling."
  [{:keys [db]} [_ [node-id x y]]]
  (let [node (get-in db [:canvas :nodes node-id])
        dx (- x (:x node))
        dy (- y (:y node))]
    {:fx [[:dispatch [:canvas/node-moved-by [node-id dx dy]]]]}))

(defn node-moved-by [{:keys [db]} [_ [node-id dx dy]]]
  (let [child-ids (get-child-ids (:canvas db) node-id)]
    {:db (-> db
             (update-in [:canvas :nodes node-id :x] + dx)
             (update-in [:canvas :nodes node-id :y] + dy))
     :fx (map (fn [child-id]
                [:dispatch [:canvas/node-moved-by [child-id dx dy]]])
              child-ids)}))

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
(reg-event-fx :canvas/node-moved node-moved)
(reg-event-fx :canvas/node-moved-by node-moved-by)
(reg-event-db :canvas/delete-node delete-node)
