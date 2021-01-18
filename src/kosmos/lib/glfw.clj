; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.lib.glfw
  (:require [clojure.set :refer [map-invert]])
  (:import [org.lwjgl.glfw
            GLFW GLFWKeyCallback GLFWCharCallback GLFWMouseButtonCallback
            GLFWCursorPosCallback GLFWScrollCallback]
           [org.lwjgl.system MemoryUtil]))

; Keyboard keys
(def key-index {:space GLFW/GLFW_KEY_SPACE
                :apostrophe GLFW/GLFW_KEY_APOSTROPHE
                :comma GLFW/GLFW_KEY_COMMA
                :minus GLFW/GLFW_KEY_MINUS
                :period GLFW/GLFW_KEY_PERIOD
                :slash GLFW/GLFW_KEY_SLASH
                :0 GLFW/GLFW_KEY_0
                :1 GLFW/GLFW_KEY_1
                :2 GLFW/GLFW_KEY_2
                :3 GLFW/GLFW_KEY_3
                :4 GLFW/GLFW_KEY_4
                :5 GLFW/GLFW_KEY_5
                :6 GLFW/GLFW_KEY_6
                :7 GLFW/GLFW_KEY_7
                :8 GLFW/GLFW_KEY_8
                :9 GLFW/GLFW_KEY_9
                :semicolon GLFW/GLFW_KEY_SEMICOLON
                :equal GLFW/GLFW_KEY_EQUAL
                :enter GLFW/GLFW_KEY_ENTER
                :backspace GLFW/GLFW_KEY_BACKSPACE
                :right GLFW/GLFW_KEY_RIGHT
                :left GLFW/GLFW_KEY_LEFT
                :down GLFW/GLFW_KEY_DOWN
                :up GLFW/GLFW_KEY_UP})

(def keyboard-keys (map-invert key-index))

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

(defn set-key-callback [win callback]
  (GLFW/glfwSetKeyCallback win
                           (proxy [GLFWKeyCallback] []
                             (invoke [window key scancode action mods]
                               (callback window key scancode action mods)))))

// TODO: Remove double set here :)
(defn set-set-char-callback [win callback]
  (GLFW/glfwSetCharCallback win
                            (proxy [GLFWCharCallback] []
                              (invoke [window codepoint]
                                (callback window codepoint)))))

(defn set-mouse-button-callback [win callback]
  (GLFW/glfwSetMouseButtonCallback win
                                   (proxy [GLFWMouseButtonCallback] []
                                     (invoke [window button action mode]
                                       (callback window button action mode)))))

(defn set-mouse-pos-callback [win callback]
  (GLFW/glfwSetCursorPosCallback win
                                 (proxy [GLFWCursorPosCallback] []
                                   (invoke [window pos-x pos-y]
                                     (callback window pos-x pos-y)))))

(defn set-scroll-callback [win callback]
  (GLFW/glfwSetScrollCallback win
                              (proxy [GLFWScrollCallback] []
                                (invoke [window x-offset y-offset]
                                  (callback window x-offset y-offset)))))

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
