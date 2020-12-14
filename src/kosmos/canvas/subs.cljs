(ns kosmos.canvas.subs
  (:require [re-frame.core :refer [reg-sub]]))

(reg-sub
 :canvas
 (fn [db _]
   (:canvas db)))

(reg-sub
 :canvas/edges
 :<-[:canvas]
 (fn [canvas]
   (:edges canvas)))

(reg-sub
 :canvas/node
 :<-[:canvas]
 (fn [canvas [_ node-id]]
   (get-in canvas [:nodes node-id])))

(reg-sub
 :canvas/offset
 :<-[:canvas]
 (fn [canvas _]
   (:offset canvas)))
