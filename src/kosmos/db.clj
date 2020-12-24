; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.db
  (:require [clojure.spec.alpha :as s]))

(s/def ::db vector?)

(defonce db (atom {}))

(defn random-uuid []
  (java.util.UUID/randomUUID))

; TODO: Rename to insert! or transact!
(defn add! [entity]
  (swap! db assoc (:id entity) entity))

(defn select-by-key [db key]
  (filter #(contains? % key) (vals db)))