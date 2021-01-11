(ns mvu.core
  (:require [clojure.core.async :refer [chan put! <! go-loop close!]]))

(def *state (atom {}))

(def messages (chan 5))

(defn make-application [init-fn update-fn view-fn]
  {:init-fn init-fn :update-fn update-fn :view-fn view-fn})

(defn dispatch [event]
  (put! messages event))

(defn start [{:keys [init-fn update-fn]} args]
  (reset! *state (:db (init-fn args)))
  (go-loop []
    (let [msg (<! messages)]
      (when msg
        (reset! *state (:db (update-fn {:db @*state} msg)))
        (recur)))))

(defn stop []
  (close! messages))

(defn render [{:keys [view-fn]}]
  (view-fn @*state))
