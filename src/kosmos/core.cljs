(ns kosmos.core
  (:require [reagent.dom :as rdom]
            [kosmos.fx]
            [kosmos.events]
            [kosmos.subs]
            [kosmos.canvas.views :as canvas]
            [kosmos.api]
            [re-frame.core :as rf]))

(defn ^:dev/after-load start []
  (let [element (.getElementById js/document "app")]
    (rdom/render [canvas/background] element)))

(defn start! []
  (rf/dispatch [:init])
  (start))
