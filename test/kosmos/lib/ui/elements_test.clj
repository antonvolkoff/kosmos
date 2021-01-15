(ns kosmos.lib.ui.elements-test
  (:require [clojure.test :refer [deftest is testing]]
            [kosmos.lib.ui.elements :as elements]))

(deftest rounded-rectangle-test
  (testing "defines element"
    (is (= {:type :rounded-rectangle :radius 6}
           (elements/rounded-rectangle {:radius 6})))
    (is (= {:type :rounded-rectangle :radius 10}
           (elements/rounded-rectangle {})))
    (is (= {:type :rounded-rectangle :radius 10}
           (elements/rounded-rectangle)))))

(deftest padding-test
  (testing "adds padding to an element"
    (is (= {:padding {:top 10 :right 10 :bottom 10 :left 10}}
           (elements/padding {} 10)))
    (is (= {:padding {:top 10 :right 20 :bottom 10 :left 20}}
           (elements/padding {} 10 20)))
    (is (= {:padding {:top 10 :right 11 :bottom 12 :left 13}}
           (elements/padding {} 10 11 12 13)))))

(deftest border-test
  (testing "adds border with fixed width"
    (is (= {:border {:width 1 :color 0xFF000000}}
           (elements/border {} 0xFF000000))))

  (testing "adds border with variable width"
    (is (= {:border {:width 3 :color 0xFF000000}}
           (elements/border {} 0xFF000000 :width 3)))))
