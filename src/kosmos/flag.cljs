(ns kosmos.flag)

(def db {:svg false})

(defn enabled? [name] (get db name))
