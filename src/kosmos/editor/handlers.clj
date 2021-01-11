(ns kosmos.editor.handlers
  (:require [clojure.zip :as z]
            [kosmos.lib.glfw :as glfw]
            [kosmos.text :as text-format]))

(defn- make-editor [body]
  (let [ast (text-format/unpack body)
        zipper (text-format/zipper ast)]
    {:ast ast :zipper zipper :body body}))

(defn on-load [state [_ body]]
  (assoc-in state [:db :editor] (make-editor body)))

(defn- pressed-down? [{:keys [key action]}]
  (and (= action glfw/glfw-press) (= key glfw/glfw-key-down)))

(defn- pressed-up? [{:keys [key action]}]
  (and (= action glfw/glfw-press) (= key glfw/glfw-key-up)))

(defn- pressed-left? [{:keys [key action]}]
  (and (= action glfw/glfw-press) (= key glfw/glfw-key-left)))

(defn- pressed-right? [{:keys [key action]}]
  (and (= action glfw/glfw-press) (= key glfw/glfw-key-right)))

(defn on-key [state [_ params]]
  (cond
    (pressed-down? params) (update-in state [:db :editor :zipper] z/down)
    (pressed-up? params) (update-in state [:db :editor :zipper] z/up)
    (pressed-left? params) (update-in state [:db :editor :zipper] z/left)
    (pressed-right? params) (update-in state [:db :editor :zipper] z/right)
    :else state))