(ns kosmos.app.core
  (:require [re-frame.core :refer [reg-event-fx]]
            [kosmos.lib.ui.elements :as e]
            [kosmos.editor.core :as editor]))

(defn init [_ _]
  {:db (merge {}
              (editor/init))})

(defn handle-key [_ _]
  {:})

(reg-event-fx :init init)
(reg-event-fx :app/key handle-key)

(defn view [db]
  (-> (editor/view db)
      (e/padding 20)))