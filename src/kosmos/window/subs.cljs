(ns kosmos.window.subs
  (:require [re-frame.core :refer [reg-sub]]))

(reg-sub
 :window
 (fn [db _]
   (:window db)))
