(ns kosmos.editor.handlers
  (:require [clojure.zip :as z]
            [kosmos.lib.glfw :as glfw]
            [kosmos.text :as text-format]))

(defn- make-editor [body]
  (let [ast (-> body (text-format/unpack) (text-format/set-ids))
        zipper (text-format/zipper ast)]
    {:ast ast :zipper zipper :body body}))

(defn on-load [state [_ body]]
  (assoc-in state [:db :editor] (make-editor body)))

(defn- pressed? [{:keys [action]}]
  (= action glfw/glfw-press))

(defn- remove-letter [{:keys [zipper] :as editor}]
  (let [updated-zipper
        (z/edit zipper (fn [node]
                         (assoc node :value
                                (apply str (drop-last (:value node))))))]
    (-> editor
        (assoc :zipper updated-zipper)
        (assoc :ast (z/root updated-zipper)))))

(defn on-key [state [_ params]]
  (when (pressed? params)
    (let [key (get glfw/keyboard-keys (:key params))]
      (case key
        :down (update-in state [:db :editor :zipper] z/down)
        :up (update-in state [:db :editor :zipper] z/up)
        :left (update-in state [:db :editor :zipper] z/left)
        :right (update-in state [:db :editor :zipper] z/right)
        :backspace (update-in state [:db :editor] remove-letter)
        state))))

(defn- type-key [{:keys [zipper] :as editor} key]
  (let [updated-zipper
        (z/edit zipper (fn [node]
                         (update node :value str key)))]
    (-> editor
        (assoc :zipper updated-zipper)
        (assoc :ast (z/root updated-zipper)))))

(defn- add-sibling [editor]
  (let [zipper (-> editor
                   :zipper
                   (z/insert-right {:type :word
                                    :id (text-format/gen-id)
                                    :value ""})
                   (z/right))]
    (-> editor
        (assoc :zipper zipper)
        (assoc :ast (z/root zipper)))))

(defn on-char [state [_ ch]]
  (cond
    (= ch \space) (update-in state [:db :editor] add-sibling)
    :else (update-in state [:db :editor] type-key ch)))
