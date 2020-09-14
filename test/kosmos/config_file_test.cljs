(ns kosmos.config-file-test
  (:require [clojure.test :refer [deftest is use-fixture]]
            [kosmos.node.fs :as fs]
            [kosmos.config-file :as cf]))

(def filename "read_test.edn")

(defn delete-test-configs [f]
  (f)
  (fs/unlink-sync (cf/path filename)))

(use-fixture :each delete-test-configs)

(deftest read-existing-file-test
  (fs/write-file-sync (cf/path filename) (pr-str {:ok true}))
  (is (= {:ok true} (cf/load filename))))

(deftest read-test
  (is (= {} (cf/load filename))))

(comment
  (read-existing-file-test)
  (read-test))
