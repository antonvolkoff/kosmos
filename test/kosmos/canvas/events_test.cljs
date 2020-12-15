(ns kosmos.canvas.events-test
  (:require [clojure.test :refer [deftest testing is]]
            [kosmos.canvas.events :as e]))

(deftest node-moved-test
  (testing "should dispatch node-moved-by event"
    (let [db {:canvas {:nodes {:a {:id :a :x 75 :y 140}}}}
          event [:canvas/node-moved [:a 100 100]]
          result (e/node-moved {:db db} event)]
      (is (= {:fx [[:dispatch [:canvas/node-moved-by [:a 25 -40]]]]}
             result)))))

(deftest node-moved-by-test
  (testing "should update position of the node"
    (let [db {:canvas {:nodes {:a {:id :a :x 75 :y 140}}}}
          event [:canvas/node-moved-by [:a 25 -40]]
          result (e/node-moved-by {:db db} event)]
      (is (= 100 (get-in result [:db :canvas :nodes :a :x])))
      (is (= 100 (get-in result [:db :canvas :nodes :a :y])))))

  (testing "should dispatch the same event for children"
    (let [db {:canvas {:nodes {:a {:id :a :x 75 :y 140}
                               :b {:id :b :x 75 :y 240}
                               :c {:id :c :x 175 :y 240}}
                       :edges [{:source-id :a :target-id :b}
                               {:source-id :a :target-id :c}]}}
          event [:canvas/node-moved-by [:a 25 -40]]
          result (e/node-moved-by {:db db} event)]
      (is (= [[:dispatch [:canvas/node-moved-by [:b 25 -40]]]
              [:dispatch [:canvas/node-moved-by [:c 25 -40]]]]
             (:fx result))))))
