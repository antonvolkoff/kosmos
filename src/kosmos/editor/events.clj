(ns kosmos.editor.events
  (:require [clojure.zip :as z]
            [kosmos.db :as db]
            [kosmos.text :as text-format]))

(def ident :editor)

(defn- ast->editor-children [node]
  (let [node-child (mapv ast->editor-children (text-format/children node))]
    (assoc node :node/child node-child)))

(defn- make-zipper [root]
  (let [branch? (fn [node] (seq (:node/child node)))
        children (fn [node] (:node/child node))
        make-node (fn [node children] (assoc node :node/child children))]
    (z/zipper branch? children make-node root)))

(defn load-from-string [content]
  (let [ast (text-format/unpack content)]
    [{:db/ident :editor :node/child (ast->editor-children ast)}]))

(defn add-zipper []
  (let [editor (db/pull @db/db '[:db/ident :db/id :type :value {:node/child ...}] ident)
        root (-> editor :node/child first)]
    [{:db/ident ident :editor/loc (make-zipper root)}]))

(defn down []
  (let [{loc :editor/loc} (db/pull @db/db '[:editor/loc] :editor)
        updated-loc (z/down loc)]
    [{:db/ident :editor :editor/loc updated-loc :editor/current (-> updated-loc z/node :db/id)}]))

(defn up []
  (let [{loc :editor/loc} (db/pull @db/db '[:editor/loc] :editor)
        updated-loc (z/down loc)]
    [{:db/ident :editor :editor/loc updated-loc :editor/current (-> updated-loc z/node :db/id)}]))

(defn left []
  (let [{loc :editor/loc} (db/pull @db/db '[:editor/loc] :editor)
        updated-loc (z/left loc)]
    [{:db/ident :editor :editor/loc updated-loc :editor/current (-> updated-loc z/node :db/id)}]))

(defn right []
  (let [{loc :editor/loc} (db/pull @db/db '[:editor/loc] :editor)
        updated-loc (z/right loc)]
    [{:db/ident :editor :editor/loc updated-loc :editor/current (-> updated-loc z/node :db/id)}]))

(defn replace-node [value]
  (let [{loc :editor/loc} (db/pull @db/db '[:editor/loc] :editor)
        new-loc (z/edit loc merge value)]
    [{:db/ident :editor :editor/loc new-loc :node/child [(z/root new-loc)]}]))

(defn commit! [transactions]
  (db/transact! db/db transactions))

(comment
  (commit! (load-from-string "Hello\r\nThis is a sentance.\r\n"))
  (commit! (add-zipper))
  (commit! (down)) ; paragraph
  (commit! (down)) ; sentance
  (commit! (down)) ; word
  (commit! (replace-node {:type :word :value "Hey"})))
