; Copyright (c) 2020 Anton Volkov. All rights reserved.
; This Source Code Form is subject to the terms of the Mozilla Public
; License, v. 2.0. If a copy of the MPL was not distributed with this
; file, You can obtain one at https://mozilla.org/MPL/2.0/.

(ns kosmos.db
  (:require [datascript.core :as datascript]))

(def schema {:children {:db/cardinality :db.cardinality/many
                        :db/valueType :db.type/ref}})

(defonce db (datascript/create-conn schema))

(def transact! datascript/transact!)

(def query datascript/q)

(def pull datascript/pull)
