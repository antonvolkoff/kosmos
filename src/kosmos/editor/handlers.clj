(ns kosmos.editor.handlers
  (:require [clojure.zip :as z]
            [kosmos.lib.glfw :as glfw]
            [kosmos.text :as text-format]))

(defn- make-editor [body]
  (let [ast (-> body (text-format/unpack) (text-format/set-ids))
        zipper (text-format/zipper ast)]
    {:original ast :zipper zipper :body body}))

(defn- pressed? [{:keys [action]}]
  (= action glfw/glfw-press))

(defn- remove-char [zipper]
  (z/edit zipper (fn [node]
                   (assoc node :value
                          (apply str (drop-last (:value node)))))))

(defn- add-char [zipper key]
  (z/edit zipper #(update % :value str key)))

(defn- make-word []
  {:type :word :id (text-format/gen-id) :value ""})

(defn- make-sentence []
  {:type :sentence :id (text-format/gen-id) :children [:words] :words []})

(defn- make-paragraph []
  {:type :paragraph :id (text-format/gen-id) :children [:sentences]
   :sentences []})

(defn- add-word [zipper]
  (-> zipper
      (z/insert-right (make-word))
      (z/right)))

(defn- add-sentence [zipper]
  (let [word (make-word)
        sentence (assoc (make-sentence) :words [word])]
    (-> zipper
        (z/up)
        (z/insert-right sentence)
        (z/right)
        (z/down))))

(defn- add-paragraph [zipper]
  (let [word (make-word)
        sentence (assoc (make-sentence) :words [word])
        paragraph (assoc (make-paragraph) :sentences [sentence])]
    (-> zipper
        (z/up)
        (z/up)
        (z/insert-right paragraph)
        (z/right)
        (z/down)
        (z/down))))

(defn on-load [state [_ body]]
  (assoc-in state [:db :editor] (make-editor body)))

(defn on-key [state [_ params]]
  (when (pressed? params)
    (let [key (get glfw/keyboard-keys (:key params))]
      (case key
        :down (update-in state [:db :editor :zipper] z/down)
        :up (update-in state [:db :editor :zipper] z/up)
        :left (update-in state [:db :editor :zipper] z/left)
        :right (update-in state [:db :editor :zipper] z/right)
        :backspace (update-in state [:db :editor :zipper] remove-char)
        :enter (update-in state [:db :editor :zipper] add-paragraph)
        state))))

(defn on-char [state [_ ch]]
  (case ch
    \space (update-in state [:db :editor :zipper] add-word)
    (\. \? \!) (update-in state [:db :editor :zipper] add-sentence)
    (update-in state [:db :editor :zipper] add-char ch)))
