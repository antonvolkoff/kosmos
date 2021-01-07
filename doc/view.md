# View 

## Text

```clojure
; Simple text
[:text "Text"]
```

## Rectangle

```clojure
; Simple rectangle
[:frame {:width 200 :height 200}
 [:fill 0xFFFF0000
  [:rectangle]]]
```

## Stacks

```clojure
[:h-stack 
  [:text "Top line"]
  [:text "Bottom line"]]

[:v-stack 
  [:text "Left line"]
  [:text "Right line"]]

[:z-stack 
  [:text "Over line"]
  [:text "Under line"]]
```

## Modifiers

```clojure
[:padding 10.0 [:text "Hey"]]

[:frame {:width 100 :height 100} ...]

[:fill 0xFFFF0000 [:rectangle]]
```