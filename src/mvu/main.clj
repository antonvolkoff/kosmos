(ns mvu.main
  (:require [mvu.core :as m :refer [dispatch]]))

(defn init [_args]
  {:db {:value 0}})

(defn handle-message [{:keys [db]} event]
  (case (first event)
    :inc {:db (update db :value inc)}
    :dec {:db (update db :value inc)}))

(defn view [db]
  (println (:value db)))

(def app (m/make-application init handle-message view))

(defn -main [& args]
  (m/start app args)

  (loop []
    (Thread/sleep 2000)
    (dispatch [:inc])
    (m/render app)
    (recur)))
