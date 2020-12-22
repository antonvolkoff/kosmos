(ns kosmos.main
  (:require [nrepl.server :as nrepl]
            [kosmos.window :as window])
  (:import [org.jetbrains.skija Paint Font FontMgr FontStyle]))

(defn color [rgba]
  (.intValue (Long/valueOf rgba)))

(defn draw [canvas]
  (.clear canvas (color 0xFFF0F0F0))
  (let [typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "monospace" FontStyle/NORMAL))
        font (-> (new Font) (.setTypeface typeface) (.setSize 32))
        black-paint (-> (new Paint) (.setColor (color 0xFF000000)))]
    (.drawString canvas "(defn hello []" 40 60 font black-paint)
    (.drawString canvas "(print \"Hello\"))" 60 110 font black-paint)))

(defn keypress [_win _key _scancode _action _mods]
  true)

(defn -main [& _args]
  (nrepl/start-server :port 8888)
  (-> (Thread. #(clojure.main/main)) (.start))
  (window/create {:width 800
                  :height 640
                  :title "Kosmos"
                  :on-draw draw
                  :on-keypress keypress}))
