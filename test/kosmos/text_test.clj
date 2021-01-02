(ns kosmos.text-test
  (:require [clojure.test :refer [deftest testing is]]
            [kosmos.text :as text]))

(deftest unpack-test
  (testing "should return an ast"
    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs []}
           (text/unpack "")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences []}]}
           (text/unpack "\r\n")
           (text/unpack "\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences []}
                         {:type :paragraph
                          :children [:sentences]
                          :sentences []}]}
           (text/unpack "\r\n\r\n")
           (text/unpack "\n\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation \!
                                       :words ["Hello" "World"]}]}]}
           (text/unpack "Hello World!\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation \.
                                       :words ["One" "1"]}
                                      {:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation \?
                                       :words ["Two"]}]}
                         {:type :paragraph
                          :children [:sentences]
                          :sentences []}
                         {:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words]
                                       :words ["Three"]}]}]}
           (text/unpack "One 1. Two?\n\nThree\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation \.
                                       :words ["Hello," "John"]}]}]}
           (text/unpack "Hello, John.\n")))))
