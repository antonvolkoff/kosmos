(ns kosmos.editor.db)

(def schema {:editor/buffer {:db/cardinality :db.cardinality/one
                             :db/valueType :db.type/ref}})

(def seeds [{:db/ident :editor :editor/buffer {}}])
