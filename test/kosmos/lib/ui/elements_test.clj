(ns kosmos.lib.ui.elements-test
  (:require [clojure.test :refer [deftest is testing]]
            [kosmos.lib.ui.elements :as elements]))

(deftest padding-test
  (testing "adds padding to an element"
    (is (= {:padding {:top 10 :right 10 :bottom 10 :left 10}}
           (elements/padding {} 10)))
    (is (= {:padding {:top 10 :right 20 :bottom 10 :left 20}}
           (elements/padding {} 10 20)))
    (is (= {:padding {:top 10 :right 11 :bottom 12 :left 13}}
           (elements/padding {} 10 11 12 13)))))
