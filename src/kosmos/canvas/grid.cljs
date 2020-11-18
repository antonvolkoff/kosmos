(ns kosmos.canvas.grid)

(def gap 20)

(defn make-grid [width height]
  (let [columns (take (/ width gap) (range))
        rows (take (/ height gap) (range))]
    (apply concat
           (mapv (fn [r]
                   (mapv (fn [c] [(* gap c) (* gap r)])
                         columns))
                 rows))))
