(ns kosmos.subs
  (:require [re-frame.core :refer [reg-sub]]))

(reg-sub
 :nodes
 (fn [db _]
   (:nodes db)))
