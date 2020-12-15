(ns kosmos.window.core
  (:require [kosmos.window.events]
            [kosmos.window.subs]
            [re-frame.core :refer [dispatch]]))

(defn on-resize [_event]
  (dispatch [:window/resized]))

(set! (.-onresize js/window) on-resize)
