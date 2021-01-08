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
(padding (text "Hey") 20)

(frame (rectangle) {:width 200 :height 200})

(fill (rectangle) 0xFFFF0000)
```
