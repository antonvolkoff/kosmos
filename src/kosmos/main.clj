; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.main
  (:require [nrepl.server :as nrepl]
            [kosmos.core :as core]
            [kosmos.lib.glfw :as glfw]
            [kosmos.lib.opengl :as gl]
            [kosmos.lib.skija :as skija]))

(def window-width 640)

(def window-height 480)

(def window-title "Kosmos")

(def nrepl-port 7888)

(defn -main [& _args]
  (core/init)

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

    (glfw/set-key-callback window core/handle-key)

    (let [framebuffer-id (gl/gl-get-integer 0x8CA6)
          context (skija/make-gl-context)
          target (skija/make-gl-target (* window-width 2) (* window-height 2) framebuffer-id)
          surface (skija/make-surface-from-target context target)
          canvas (.getCanvas surface)]
      (while (not (glfw/window-should-close? window))
        (try
          (core/render canvas)
          (catch Exception e
            (println "Error: " (.getMessage e))))
        (.flush context)
        (glfw/swap-buffers window)
        (glfw/poll-events))

    (glfw/hide-window window)
    (glfw/destroy-window window)
    (glfw/terminate)
    (shutdown-agents))))
