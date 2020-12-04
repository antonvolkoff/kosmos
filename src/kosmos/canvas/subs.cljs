(ns kosmos.canvas.subs
  (:require [re-frame.core :refer [reg-sub]]))

(reg-sub
 :canvas
 (fn [db _]
   (:canvas db)))

(defn edge->edge-with-nodes
  [{:keys [source-id target-id]} nodes]
  {:source (get nodes source-id) :target (get nodes target-id)})

(reg-sub
 :canvas/edges-with-nodes
 :<-[:canvas]
 (fn [{:keys [nodes edges]}]
   (map #(edge->edge-with-nodes % nodes) edges)))
