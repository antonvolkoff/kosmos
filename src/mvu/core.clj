(ns mvu.core
  (:require [clojure.core.async :refer [chan put! <! go-loop close!]]))

(def *state (atom {}))

(def messages (chan 5))

(defn make-application [init-fn update-fn view-fn]
  {:init-fn init-fn :update-fn update-fn :view-fn view-fn})

(defn dispatch [event]
  (put! messages event))

(defmacro rescue [& body]
  (try
    ~@body
    (catch Exception e
      (println "Failed while processing message with:" (.getMessage e)))))

(defn handle-update! [{:keys [db]}]
  (when db (reset! *state db)))

(defn start [{:keys [init-fn update-fn]} args]
  (reset! *state (:db (init-fn args)))
  (go-loop []
    (let [msg (<! messages)]
      (when msg
        (try
          (println "[message] " msg)
          (handle-update! (update-fn {:db @*state} msg))
          (catch Exception e
            (println "Failed while processing message with:" (.getMessage e))))
        (recur)))))

(defn stop []
  (close! messages))

(defn render [{:keys [view-fn]}]
  (view-fn @*state))
