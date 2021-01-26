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
(def panel-header-height 80)

(defn panel-header [filename]
  (let [bg (-> (el/rectangle)
               (el/frame {:height panel-header-height})
               (el/fill header-bg))]
    (el/z-stack
     [bg
      (-> (el/text filename)
          (el/padding 20))])))

(defn panel-body [inner]
  (el/z-stack [inner]))

(defn panel [header body]
  (el/h-stack [header body]))

(defn view [db]
  (let [content (editor/view db)]
    (el/v-stack
     [(panel
       (panel-header "Filename")
       (panel-body
        (el/padding content 10 20)))
      (el/svg [:svg {:height 100 :width 100}
               [:text {:x 20 :y 20 :stroke "black"} "Hello"]])])))
