; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [kosmos.editor.core :as editor]
            [kosmos.editor.events]
            [kosmos.db :refer [seed!]]))

(defn init []
  (seed!))

(defn view []
  [:padding 20
   [:stack
    {:direction :horizontal
     :elements (editor/view)}]])
