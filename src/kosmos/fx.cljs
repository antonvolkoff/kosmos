(ns kosmos.fx
  (:require [re-frame.core :refer [reg-fx]]))

(reg-fx
 :window-title
 (fn [title]
   (set! (.-title js/document) title)))
