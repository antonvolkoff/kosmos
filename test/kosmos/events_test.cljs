(ns kosmos.events-test
  (:require [clojure.test :refer [deftest testing is]]
            [kosmos.events :refer [add-node change-node-value]]))

(deftest add-node-test
  (testing "adds node to database"
    (let [db {:nodes {}}
          event [:add-node]
          
          result-db (add-node db event)
          
          added (= 1 (-> result-db :nodes vals count))]
      (is added))))

(deftest change-node-value-test
  (testing "updated node value"
    (let [node-id 1
          db {:nodes {node-id {:value "foo"}}}
          event [:change-node-value node-id "bar"]
          
          result-db (change-node-value db event)
          
          updated (= "bar" (get-in result-db [:nodes node-id :value]))]
      (is updated))))
