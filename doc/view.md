# View

## Text

```clojure
; Simple text
(text "Text")
```

## Rectangle

```clojure
; Simple rectangle
(-> (rectangle)
    (frame {:width 200 :height 200})
    (fill 0xFFFF0000))
```

## Rounded Rectangle

Default radius is 10.

```clojure
(-> (rounded-rectangle)
    (frame {:width 200 :height 200})
    (fill 0xFFFF0000))

(-> (rounded-rectangle {:radius 5})
    (frame {:width 200 :height 200})
    (fill 0xFFFF0000))
```

## Stacks

```clojure
(h-stack
 [(text "Top line")
  (text "Bottom line")])

(v-stack [(text "Left") (text "Right")] :spacing 10)

(z-stack
 [(text "Background")
  (text "Foreground")])
```

## Modifiers

```clojure
; Padding. Options work the same way as in CSS.
(padding (text "Hey") 20)
(padding (text "Hey") 20 10)
(padding (text "Hey") 1 2 3 4)

(frame (rectangle) {:width 200 :height 200})

(fill (rectangle) 0xFFFF0000)

; Border
(border (rectangle) 0xFFFF0000)
(border (rectangle) 0xFFFF0000 :width 2)
```
