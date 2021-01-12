(ns kosmos.text-test
  (:require [clojure.test :refer [deftest testing is]]
            [clojure.zip :as z]
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
                                       :punctuation [{:type :punctuation :value \!}]
                                       :words [{:type :word :value "Hello"}
                                               {:type :word :value "World"}]}]}]}
           (text/unpack "Hello World!\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \.}]
                                       :words [{:type :word :value "One"}
                                               {:type :word :value "1"}]}
                                      {:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \?}]
                                       :words [{:type :word :value "Two"}]}]}
                         {:type :paragraph
                          :children [:sentences]
                          :sentences []}
                         {:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words]
                                       :words [{:type :word :value "Three"}]}]}]}
           (text/unpack "One 1. Two?\n\nThree\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \.}]
                                       :words [{:type :word :value "Hello,"}
                                               {:type :word :value "John"}]}]}]}
           (text/unpack "Hello, John.\n")))

    (is (= {:type :document
            :children [:paragraphs]
            :paragraphs [{:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \.}]
                                       :words [{:type :word :value "Hi"}]}
                                      {:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \?}]
                                       :words [{:type :word :value "How"}
                                               {:type :word :value "are"}
                                               {:type :word :value "you"}]}]}
                         {:type :paragraph
                          :children [:sentences]
                          :sentences [{:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \.}]
                                       :words [{:type :word :value "Hey"}]}
                                      {:type :sentence
                                       :children [:words :punctuation]
                                       :punctuation [{:type :punctuation :value \!}]
                                       :words [{:type :word :value "I'm"}
                                               {:type :word :value "good"}]}]}]}
           (text/unpack "Hi. How are you?\nHey. I'm good!\n")))))

(def example-tree
  {:type :document
   :children [:paragraphs]
   :paragraphs [{:type :paragraph
                 :children [:sentences]
                 :sentences [{:type :sentence
                              :children [:words :punctuation]
                              :punctuation [{:type :punctuation :value \.}]
                              :words [{:type :word :value "Hello,"}
                                      {:type :word :value "John"}]}]}]})

(deftest zipper-test
  (let [zipper (text/zipper example-tree)]
    (testing "should fetch children"
      (is (= [{:type :word :value "Hello,"}
              {:type :word :value "John"}
              {:type :punctuation :value \.}]
             (-> zipper z/down z/down z/children))))

    (testing "should add a child"
      (is (= [{:type :word :value "Hello,"}
              {:type :word :value "John"}
              {:type :word :value "and"}
              {:type :word :value "Emmy"}
              {:type :punctuation :value \.}]
             (-> zipper
                 z/down
                 z/down
                 (z/append-child {:type :word :value "and"})
                 (z/append-child {:type :word :value "Emmy"})
                 (z/children)))))))
