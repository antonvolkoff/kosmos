; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.lib.glfw
  (:import [org.lwjgl.glfw GLFW GLFWKeyCallback]
           [org.lwjgl.system MemoryUtil]))

; Keyboard keys
(def glfw-key-right GLFW/GLFW_KEY_RIGHT)
(def glfw-key-left GLFW/GLFW_KEY_LEFT)
(def glfw-key-down GLFW/GLFW_KEY_DOWN)
(def glfw-key-up GLFW/GLFW_KEY_UP)

; The key or mouse button was released.
(def glfw-release GLFW/GLFW_RELEASE)

; The key or mouse button was pressed.
(def glfw-press GLFW/GLFW_PRESS)

; The key was held down until it repeated.
(def glfw-repeat GLFW/GLFW_REPEAT)

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

(defn hide-window [w] (GLFW/glfwHideWindow w))
