; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.lib.skija
  (:import [org.jetbrains.skija BackendRenderTarget DirectContext FramebufferFormat Surface
            SurfaceOrigin SurfaceColorFormat ColorSpace Canvas]))

(def canvas Canvas)

(defn make-gl-context []
  (DirectContext/makeGL))

(defn make-gl-target [width height fb-id]
  (BackendRenderTarget/makeGL width height 0 8 fb-id FramebufferFormat/GR_GL_RGBA8))

(defn make-surface-from-target [context target]
  (Surface/makeFromBackendRenderTarget
   context
   target
   SurfaceOrigin/BOTTOM_LEFT
   SurfaceColorFormat/RGBA_8888
   (ColorSpace/getSRGB)))

(defn color [^long l]
  (.intValue (Long/valueOf l)))
