(ns kosmos.systems
  (:require [kosmos.db :refer [select-by-key]]))

(def key-codes {262 :right
                263 :left})

(defn- move-caret [caret events]
  (if (empty? events)
    caret
    (let [top-event (first events)]
      (case (get key-codes (:key top-event) (:key top-event))
        :left (move-caret (-> caret
                              (update-in [:shape 1 :x0] - 10)
                              (update-in [:shape 1 :x1] - 10)) (rest events))
        :right (move-caret (-> caret
                               (update-in [:shape 1 :x0] + 10)
                               (update-in [:shape 1 :x1] + 10)) (rest events))
        (move-caret caret (rest events))))))

(defn keyboard [db]
  (let [keyboard-entity (first (select-by-key db :keyboard))
        caret (first (select-by-key db :caret))
        updated-caret (move-caret caret (get-in keyboard-entity [:keyboard :events]))]
    {(:id keyboard-entity) (assoc keyboard-entity :keyboard {:events []})
     (:id caret) updated-caret}))
