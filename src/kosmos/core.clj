; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.core
  (:require [kosmos.editor.core :as editor]
            [kosmos.lib.ui.elements :refer [padding]]))

(defn init [args]
  (editor/init args))

(defn handle-message [state event]
  (editor/handle-message state event))

(defn view [db]
  (-> (editor/view db)
      (padding 20)))
