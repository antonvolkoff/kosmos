(ns kosmos.main
  (:require [clojure.string :as str]
            [nrepl.server :as nrepl]
            [kosmos.window :as window])
  (:import [org.jetbrains.skija Paint Font FontMgr FontStyle]))

(defonce db (atom []))

(defonce lines (atom []))

(defn random-uuid []
  (java.util.UUID/randomUUID))

(defn read-lines [path]
  (str/split-lines (slurp path)))

(defn remove-at [coll n]
  (concat (take n coll) (drop (inc n) coll)))

(defn save-lines [path lines]
  (spit path (str/join "\r\n" lines)))

(defn color [rgba]
  (.intValue (Long/valueOf rgba)))

(defn draw [db canvas]
  (.clear canvas (color 0xFFF0F0F0))
  (let [typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "JetBrains Mono" FontStyle/NORMAL))
        font (-> (new Font) (.setTypeface typeface) (.setSize 32))
        black-paint (-> (new Paint) (.setColor (color 0xFF000000)))]
    (doall
     (map-indexed (fn [idx line]
                    (.drawString canvas line 40 (+ 60 (* idx 44)) font black-paint))
                  @lines)))
  db)

(defn keyboard-event? [{:keys [keyboard-event]}]
  (boolean keyboard-event))

(defn process-keyboard [db]
  (remove keyboard-event? db))

(defn update-window [canvas]
  (let [updated-db (-> @db
                       (process-keyboard)
                       (draw canvas))]
    (reset! db updated-db)))

(defn keypress [_win key scancode action mods]
  (let [entity {:id (random-uuid)
                :keyboard-event {:key key :action action :scancode scancode :mods mods}}]
    (swap! db conj entity)))

(defn -main [& _args]
  (nrepl/start-server :port 8888)
  (-> (Thread. #(clojure.main/main)) (.start))
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
