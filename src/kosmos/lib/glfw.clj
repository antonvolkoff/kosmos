(ns kosmos.lib.glfw
  (:import [org.lwjgl.glfw GLFW GLFWKeyCallback]
           [org.lwjgl.system MemoryUtil]))

(def null MemoryUtil/NULL)

(def visible GLFW/GLFW_VISIBLE)

(def resizable GLFW/GLFW_RESIZABLE)

(def cocoa_retina_framebuffer GLFW/GLFW_COCOA_RETINA_FRAMEBUFFER)

(def glfw-false GLFW/GLFW_FALSE)

(def glfw-true GLFW/GLFW_TRUE)

(defn set-key-callback [win calback]
  (GLFW/glfwSetKeyCallback win
                           (proxy [GLFWKeyCallback] []
                             (invoke [window key scancode action mods]
                               (calback window key scancode action mods)))))

(defn window-hint [h v] (GLFW/glfwWindowHint h v))

(defn window-should-close? [w] (GLFW/glfwWindowShouldClose w))

(defn swap-buffers [w] (GLFW/glfwSwapBuffers w))

(defn poll-events [] (GLFW/glfwPollEvents))

(defn show-window [w] (GLFW/glfwShowWindow w))

(defn swap-interval [i] (GLFW/glfwSwapInterval i))

(defn make-context-current [w] (GLFW/glfwMakeContextCurrent w))

(defn create-window [w h t a b] (GLFW/glfwCreateWindow w h t a b))

(defn init [] (GLFW/glfwInit))

(defn terminate [] (GLFW/glfwTerminate))

(defn destroy-window [w] (GLFW/glfwDestroyWindow w))

(defn set-error-callback [cb] (GLFW/glfwSetErrorCallback cb))
