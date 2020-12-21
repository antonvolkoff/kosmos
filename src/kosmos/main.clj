(ns kosmos.main
  (:import [org.lwjgl.glfw GLFW GLFWErrorCallback GLFWKeyCallback]
           [org.lwjgl.opengl GL GL11]
           [org.lwjgl.system MemoryUtil]
           [org.jetbrains.skija Paint Font FontMgr FontStyle DirectContext BackendRenderTarget FramebufferFormat Surface SurfaceColorFormat SurfaceOrigin ColorSpace]))

(defn set-error-callback []
  (.set (GLFWErrorCallback/createPrint System/err)))

(defn free-error-callback []
  (.free (GLFW/glfwSetErrorCallback nil)))

(defn create-window [width height title]
  (GLFW/glfwCreateWindow width height title MemoryUtil/NULL MemoryUtil/NULL))

(defn init []
  (GLFW/glfwInit)
  (GLFW/glfwWindowHint GLFW/GLFW_VISIBLE GLFW/GLFW_FALSE)
  (GLFW/glfwWindowHint GLFW/GLFW_RESIZABLE GLFW/GLFW_TRUE)

  (let [window (create-window 800 800 "Kosmos")]
    (GLFW/glfwSetKeyCallback window
                             (proxy [GLFWKeyCallback] []
                               (invoke [window key _scancode action _mods]
                                 (when (and (= key GLFW/GLFW_KEY_ESCAPE)
                                            (= action GLFW/GLFW_RELEASE))
                                   (GLFW/glfwSetWindowShouldClose window true)))))
    (GLFW/glfwMakeContextCurrent window)
    (GLFW/glfwSwapInterval 1)
    (GLFW/glfwShowWindow window)
    window))

(defn render-loop [window draw-fn]
  (GL/createCapabilities)
  (let [context (DirectContext/makeGL)
        framebuffer-id (GL11/glGetInteger 0x8CA6)
        target (BackendRenderTarget/makeGL 801 801 0 8 framebuffer-id FramebufferFormat/GR_GL_RGBA8)
        surface (Surface/makeFromBackendRenderTarget context target SurfaceOrigin/BOTTOM_LEFT SurfaceColorFormat/RGBA_8888 (ColorSpace/getSRGB))
        canvas  (.getCanvas surface)]
    (loop []
      (when (not (GLFW/glfwWindowShouldClose window))
        (draw-fn canvas)
        (.flush context)
        (GLFW/glfwSwapBuffers window)
        (GLFW/glfwPollEvents)
        (recur)))))

(defn cleanup [window]
  (GLFW/glfwDestroyWindow window)
  (GLFW/glfwTerminate))

(defn color [rgba]
  (.intValue (Long/valueOf rgba)))

(defn draw [canvas]
  (.clear canvas (color 0xFFFFFFFF))
  (let [typeface (-> (FontMgr/getDefault) (.matchFamilyStyle "monospace" FontStyle/NORMAL))
        font (-> (new Font) (.setTypeface typeface) (.setSize 13))
        red-paint (-> (new Paint) (.setColor (color 0xFFFF0000)))
        black-paint (-> (new Paint) (.setColor (color 0xFF000000)))]
    (.drawCircle canvas 50 50 30 red-paint)
    (.drawString canvas "Hello, world!" 100 100 font black-paint)))

(defn -main [& _args]
  (set-error-callback)
  (let [window (init)]
    (render-loop window draw)
    (cleanup window))
  (free-error-callback))
