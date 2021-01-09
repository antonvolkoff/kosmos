; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [kosmos.editor.core :as editor]
            [kosmos.editor.events]
            [kosmos.db :refer [seed!]]
            [kosmos.lib.ui.elements :as e]))

(defn init []
  (seed!))

(defn view [state]
  (-> (editor/view state)
      (e/padding 20)))
