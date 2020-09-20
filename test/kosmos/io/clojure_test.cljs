(ns kosmos.io.clojure-test
  (:require [clojure.test :refer [deftest is]]
            [kosmos.io.clojure :as io]))

(deftest parse-empty-test
  (is (= [] (io/parsre ""))))
