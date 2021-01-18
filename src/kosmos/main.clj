; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.main
  (:require [nrepl.server :as nrepl]
            [mvu.core :as m]
            [kosmos.core :as core]
            [kosmos.lib.glfw :as glfw]
            [kosmos.lib.opengl :as gl]
            [kosmos.lib.skija :as skija]
            [kosmos.lib.ui :as ui]))

(def window-width 640)

(def window-height 480)

(def window-title "Kosmos")

(def nrepl-port 7888)

(def app (m/make-application core/init core/handle-message core/view))

(defn handle-key [_win key scancode action mods]
  (m/dispatch [:key {:key key :action action :scancode scancode :mods mods}]))

(defn handle-char [_win code]
  (m/dispatch [:char (char code)]))

(defn handle-mouse-button [_win button action mode]
  (println {:button button :action action :mode mode}))

(defn handle-mouse-pos [_win pos-x pos-y]
  (println {:x pos-x :y pos-y}))

(defn handle-scroll [_win x-offset y-offset]
  (println {:x-offset x-offset :y-offset y-offset}))

(defn -main [& args]
  (m/start app [])

  (glfw/init)
  (glfw/window-hint glfw/visible glfw/glfw-false)
  (glfw/window-hint glfw/resizable glfw/glfw-false)
  (glfw/window-hint glfw/cocoa_retina_framebuffer glfw/glfw-true)
  (let [window (glfw/create-window window-width window-height window-title glfw/null glfw/null)]
    (glfw/make-context-current window)
    (glfw/swap-interval 1)
    (glfw/show-window window)
    (gl/create-capabilities)

    (nrepl/start-server :port nrepl-port)
    (println (str "nREPL server started at locahost:" nrepl-port))

    (glfw/set-key-callback window handle-key)
    (glfw/set-set-char-callback window handle-char)
    (glfw/set-mouse-button-callback window handle-mouse-button)
    (glfw/set-mouse-pos-callback window handle-mouse-pos)
    (glfw/set-scroll-callback window handle-scroll)

    (let [width (* window-width 2)
          height (* window-height 2)
          framebuffer-id (gl/gl-get-integer gl/gl-framebuffer-binding)
          context (skija/make-gl-context)
          target (skija/make-gl-target width height framebuffer-id)
          surface (skija/make-surface-from-target context target)
          canvas (.getCanvas surface)]
      (while (not (glfw/window-should-close? window))
        (.clear canvas (skija/color 0xFFFAFAFA))
        (let [layer (.save canvas)]
          (try
            (ui/skia {:canvas canvas :width width :height height}
                     (m/render app))
            (catch Exception e
              (println "Render: " (.getMessage e))
              (.printStackTrace e)))
          (.restoreToCount canvas layer))
        (.flush context)
        (glfw/swap-buffers window)
        (glfw/poll-events))

    (glfw/hide-window window)
    (glfw/destroy-window window)
    (glfw/terminate)
    (shutdown-agents))))

(comment
  (m/dispatch [:editor/load "Hello. How are you?\r\nHi! I'm good.\r\n"])
  (-> @m/*state :editor :zipper))
