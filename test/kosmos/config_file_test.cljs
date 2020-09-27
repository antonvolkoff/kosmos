(ns kosmos.config-file-test
  (:require [clojure.test :refer [deftest is use-fixtures]]
            [kosmos.node.fs :as fs]
            [kosmos.config-file :as cf]))

(def filename "read_test.edn")

(defn create-config-folder [path]
  (when-not (fs/exists-sync path)
    (fs/mkdir-sync path)))

(defn delete-config-file [path]
  (when (fs/exists-sync path)
    (fs/unlink-sync path)))

(defn setup-test [f]
  (create-config-folder cf/config-dir)
  (f)
  (delete-config-file (cf/path filename)))

(use-fixtures :each setup-test)

(deftest read-existing-file-test
  (fs/write-file-sync (cf/path filename) (pr-str {:ok true}))
  (is (= {:ok true} (cf/load filename))))

(deftest read-test
  (is (= {} (cf/load filename))))
