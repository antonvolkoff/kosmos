(ns kosmos.canvas.events
  (:require [re-frame.core :refer [reg-event-db reg-event-fx]]
            [clojure.walk :refer [keywordize-keys]]))

; TODO: Find a better place for this function
(defn deactivate-all [nodes]
  (->> nodes
       (map (fn [[id node]] [id (assoc node :active? false)]))
       (into {})))

; TODO: Find a better place for this function
(defn activate [nodes node-id]
  (assoc-in nodes [node-id :active?] true))

; TODO: Find a better place for this function
(defn part-of-edge? [{:keys [source-id target-id]} node-id]
  (or (= node-id source-id) (= node-id target-id)))

; TODO: Find a better place for this function
(def not-part-of-edge? (complement part-of-edge?))

; TODO: Find a better place for this function
(defn remove-all-edges [edges node-id]
  (filter #(not-part-of-edge? % node-id) edges))

(defn init [db _]
  (assoc db :canvas {:nodes {} :edges [] :offset {:x 0 :y 0}}))

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

(defn node-value-changed [db [_ [node-id new-value]]]
  (assoc-in db [:canvas :nodes node-id :value] new-value))

(defn node-clicked [db [_ node-id]]
  (-> db
      (update-in [:canvas :nodes] deactivate-all)
      (update-in [:canvas :nodes] activate node-id)))

(defn delete-node [db [_ node-id]]
  (print node-id)
  (-> db
      (update-in [:canvas :nodes] dissoc node-id)
      (update-in [:canvas :edges] remove-all-edges node-id)))

(defn moved [db [_ offset-change]]
  (let [dx (get offset-change "dx") dy (get offset-change "dy") bound 0]
    (-> db
        (update-in [:canvas :offset :x] (fn [x] (min bound (- x dx))))
        (update-in [:canvas :offset :y] (fn [y] (min bound (- y dy)))))))

(defn background-clicked [db _]
  (update-in db [:canvas :nodes] deactivate-all))

(reg-event-db :canvas/init init)
(reg-event-db :canvas/add-node add-node)
(reg-event-db :canvas/connect-nodes connect-nodes)
(reg-event-fx :canvas/node-moved node-moved)
(reg-event-fx :canvas/node-moved-by node-moved-by)
(reg-event-db :canvas/node-value-changed node-value-changed)
(reg-event-db :canvas/node-clicked node-clicked)
(reg-event-db :canvas/delete-node delete-node)
(reg-event-db :canvas/moved moved)
(reg-event-db :canvas/background-clicked background-clicked)
