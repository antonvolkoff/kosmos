(ns kosmos.node.os)

(def os (js/require "os"))

(defn homedir [] (.homedir os))
