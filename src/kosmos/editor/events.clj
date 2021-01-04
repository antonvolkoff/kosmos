(ns kosmos.editor.events
  (:require [clojure.zip :as z]
            [kosmos.db :as db]
            [kosmos.text :as text-format]))

(defn load-from-string [content]
  (let [ast (text-format/unpack content)
        txs [{:db/ident :editor :editor/ast ast :editor/loc (text-format/zipper ast)}]]
    (db/transact! db/db txs)))

(defn down []
  (let [editor (db/pull @db/db '[:editor/loc] :editor)
        new-loc (z/down (:editor/loc editor))]
    (db/transact! db/db [{:db/ident :editor :editor/loc new-loc}])))

(defn up []
  (let [editor (db/pull @db/db '[:editor/loc] :editor)
        new-loc (z/up (:editor/loc editor))]
    (db/transact! db/db [{:db/ident :editor :editor/loc new-loc}])))

(defn left []
  (let [editor (db/pull @db/db '[:editor/loc] :editor)
        new-loc (z/left (:editor/loc editor))]
    (db/transact! db/db [{:db/ident :editor :editor/loc new-loc}])))

(defn right []
  (let [editor (db/pull @db/db '[:editor/loc] :editor)
        new-loc (z/right (:editor/loc editor))]
    (db/transact! db/db [{:db/ident :editor :editor/loc new-loc}])))

(defn replace-node [value]
  (let [editor (db/pull @db/db '[:editor/loc] :editor)
        new-loc (z/replace (:editor/loc editor) value)]
    (db/transact! db/db [{:db/ident :editor :editor/loc new-loc :editor/ast (z/root new-loc)}])))

(comment
  (load-from-string "Hello\r\nThis is a sentance.\r\n")
  (down) ; paragraph
  (down) ; sentance
  (down) ; word
  (replace-node {:type :word :value "Hey"})

  (z/node (:editor/loc (db/pull @db/db '[*] :editor))))
