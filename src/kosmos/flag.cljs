(ns kosmos.flag)

(def db {:svg true})

(defn enabled? [name] (get db name))
