(ns kosmos.main
  (:import [org.lwjgl.glfw GLFW GLFWErrorCallback GLFWKeyCallback]
           [org.lwjgl.opengl GL GL11]
           [org.lwjgl.system MemoryUtil]))

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

  (let [window (create-window 300 300 "Kosmos")]
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

(defn render-loop [window]
  (GL/createCapabilities)
  (GL11/glClearColor 1 0 0 0)

  (loop []
    (when (not (GLFW/glfwWindowShouldClose window))
      (GL11/glClear GL11/GL_COLOR_BUFFER_BIT)
      (GL11/glClear GL11/GL_DEPTH_BUFFER_BIT)
      (GLFW/glfwSwapBuffers window)
      (GLFW/glfwPollEvents)
      (recur))))

(defn cleanup [window]
  (GLFW/glfwDestroyWindow window)
  (GLFW/glfwTerminate))

(defn -main [& _args]
  (set-error-callback)
  (let [window (init)]
    (render-loop window)
    (cleanup window))
  (free-error-callback))
