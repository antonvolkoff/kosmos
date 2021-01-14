; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [kosmos.editor.core :as editor]
            [kosmos.lib.ui.elements :as el]))

(defn init [args]
  (editor/init args))

(defn handle-message [state event]
  (editor/handle-message state event))

;; Views
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(def header-bg 0xFFD5D5D5)
(def body-bg 0xFFFFFFFF)
(def panel-width 800)
(def panel-header-height 80)

(defn panel-header-view [filename]
  (let [bg (-> (el/rectangle)
               (el/frame {:width panel-width :height panel-header-height})
               (el/fill header-bg))]
    (el/z-stack
     [bg
      (el/text filename)])))

(defn panel-view [inside]
  (let [width 800]
    (el/h-stack
     [(panel-header-view "Filename")
      (el/z-stack
       [(-> (el/rectangle)
            (el/frame {:width width :height 1000})
            (el/fill body-bg))
        (-> inside
            (el/padding 20))])])))

(defn view [db]
  (-> (panel-view (editor/view db))
      (el/padding 20)))
