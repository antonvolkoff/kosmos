; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.lib.opengl
  (:import [org.lwjgl.opengl GL GL46]))

(def gl-framebuffer-binding GL46/GL_FRAMEBUFFER_BINDING)

(defn create-capabilities [] (GL/createCapabilities))

(defn gl-get-integer [i] (GL46/glGetInteger i))
