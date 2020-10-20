(ns kosmos.core
  (:require [reagent.dom :as rdom]
            [re-frame.core :refer [dispatch]]))

(def placeholder-id "app")

(defn ^:dev/after-load start []
  (dispatch [:start])
  (->> placeholder-id
       (.getElementById js/document)
       (rdom/render [:div "application"])))

(defn init! []
  (dispatch [:init])
  (start))
