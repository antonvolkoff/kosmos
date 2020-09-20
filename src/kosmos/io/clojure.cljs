(ns kosmos.io.clojure
  (:require [clojure.walk :refer [postwalk]]
            [clojure.tools.reader :refer [read-string]]))

(defn- wrap [form] (str "[" form "]"))

(defn- unwrap [ast] (:form ast))

(defn- convert-type [form]
  (cond 
    (number? form) :number
    (string? form) :string
    (keyword? form) :keyword
    (symbol? form) :symbol
    (list? form) :list
    (vector? form) :vector
    (set? form) :set
    (map? form) :map
    :else :unknown))

(defn- convert-form [form]
  (if (map? form) 
    (mapv (fn [[k v]] {:key k :value v}) form) 
    form))

(defn node [form]
  {:form (convert-form form) 
   :type (convert-type form) 
   :meta (meta form)})

(defn- walker [form]
  (if (map-entry? form) form (node form)))

(defn- walk-and-convert [form]
  (postwalk walker form))

(defn parse [data]
  (-> data
      wrap
      read-string
      walk-and-convert
      unwrap))
