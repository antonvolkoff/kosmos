(ns kosmos.main
  (:require [clojure.string :as str]
            [nrepl.server :as nrepl]
            [kosmos.window :as window]
            [kosmos.db :as db])
  (:import [org.jetbrains.skija Paint Font FontMgr FontStyle]))

(defonce lines (atom []))

(defn read-lines [path]
  (str/split-lines (slurp path)))

(defn remove-at [coll n]
  (concat (take n coll) (drop (inc n) coll)))

(defn save-lines [path lines]
  (spit path (str/join "\r\n" lines)))

(defn color [rgba]
  (.intValue (Long/valueOf rgba)))

(def clear-color (color 0xFFF0F0F0))

(def black-color (color 0xFF000000))

(def black-paint (.setColor (new Paint) black-color))

(defn clear-canvas [db canvas]
  (.clear canvas clear-color)
  db)

(defn draw-text [db canvas]
  (let [typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "JetBrains Mono" FontStyle/NORMAL))
        font (-> (new Font) (.setTypeface typeface) (.setSize 32))
        paint (-> (new Paint) (.setColor black-color))]
    (doall
     (map-indexed (fn [idx line]
                    (.drawString canvas line 40 (+ 60 (* idx 44)) font paint))
                  @lines)))
  db)

(defn line-shape? [{:keys [shape]}]
  (and shape (= :line (first shape))))

(defn draw-line-fn [canvas]
  (fn [{shape :shape}]
    (let [[_ attrs] shape {:keys [x0 y0 x1 y1]} attrs]
      (.drawLine canvas x0 y0 x1 y1 black-paint))))

(defn draw-lines [db canvas]
  (->> db
       (filter line-shape?)
       (map (draw-line-fn canvas))
       (doall))
  db)

(defn keyboard-event? [{:keys [keyboard-event]}]
  (boolean keyboard-event))

(defn process-keyboard [db]
  (remove keyboard-event? db))

(defn update-window [canvas]
  (let [updated-db (-> @db/db
                       (process-keyboard)
                       (clear-canvas canvas)
                       (draw-text canvas)
                       (draw-lines canvas))]
    (reset! db/db updated-db)))

(defn keypress [_win key scancode action mods]
  (let [entity {:id (db/random-uuid)
                :keyboard-event {:key key :action action :scancode scancode :mods mods}}]
    (db/add! entity)))

(defn make-caret []
  {:id (db/random-uuid)
   :caret {}
   :shape [:line {:x0 100 :y0 100 :x1 100 :y1 130}]})

(defn -main [& _args]
  (nrepl/start-server :port 8888)
  (-> (Thread. #(clojure.main/main)) (.start))

  (db/add! (make-caret))

  (window/create {:width 800
                  :height 640
                  :title "Kosmos"
                  :on-draw update-window
                  :on-keypress keypress}))

(comment
  ; Open file
  (reset! kosmos.main/lines (kosmos.main/read-lines "/Users/antonvolkoff/Code/github.com/antonvolkoff/kosmos/src/kosmos/fx.cljs"))

  ; Edit
  (swap! kosmos.main/lines conj "; Adding comment")

  ; Save file
  (kosmos.main/save-lines "/Users/antonvolkoff/Code/github.com/antonvolkoff/kosmos/src/kosmos/fx.cljs" @kosmos.main/lines))
