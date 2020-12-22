(ns kosmos.window
  (:require [kosmos.lib.glfw :as glfw])
  (:import [org.lwjgl.glfw GLFWErrorCallback]
   [org.lwjgl.opengl GL GL11]
   [org.jetbrains.skija DirectContext BackendRenderTarget FramebufferFormat Surface
    SurfaceColorFormat SurfaceOrigin ColorSpace]))

(defn with-error-callback [next]
  (.set (GLFWErrorCallback/createPrint System/err))
  (next)
  (.free (glfw/set-error-callback nil)))

(defn destroy [win]
  (glfw/destroy-window win)
  (glfw/terminate))

; FIXME: GLFW & Skia is mixed here. It's better to keep these to concepts separate
(defn create [{:keys [width height title on-draw on-keypress]}]
  (with-error-callback
    (fn []
      (glfw/init)
      (glfw/window-hint glfw/visible glfw/glfw-false)
      (glfw/window-hint glfw/resizable glfw/glfw-false)
      (glfw/window-hint glfw/cocoa_retina_framebuffer glfw/glfw-true)

      (let [win (glfw/create-window width height title glfw/null glfw/null)]
        (glfw/set-key-callback win on-keypress)
        (glfw/make-context-current win)
        (glfw/swap-interval 1)
        (glfw/show-window win)

        (GL/createCapabilities)
        (let [context (DirectContext/makeGL)
              framebuffer-id (GL11/glGetInteger 0x8CA6)
              target (BackendRenderTarget/makeGL (* width 2)
                                                 (* height 2)
                                                 0
                                                 8
                                                 framebuffer-id
                                                 FramebufferFormat/GR_GL_RGBA8)
              surface (Surface/makeFromBackendRenderTarget context
                                                           target
                                                           SurfaceOrigin/BOTTOM_LEFT
                                                           SurfaceColorFormat/RGBA_8888
                                                           (ColorSpace/getSRGB))
              canvas (.getCanvas surface)]
          (loop []
            (if (glfw/window-should-close? win)
              (destroy win)
              (do
                (on-draw canvas)
                (.flush context)
                (glfw/swap-buffers win)
                (glfw/poll-events)
                (recur)))))))))
