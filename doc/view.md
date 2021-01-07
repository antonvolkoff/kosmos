# View declarative data 

## Layer element

Layer is a grouping element that does not have any visual representation.

```clojure
[:layer {:elements [[:text {:x 100 :y 100 :value "1"}]
                    [:text {:x 200 :y 200 :value "2"}]]}]
```

## Text elements

```clojure
; Simple text
[:text {:value "Text"}]

; Text with an absolute position
[:text {:x 100 :y 100 :value "Text"}]
```

## Stack element

```clojure
; Elements stacked horizontally
[:stack {:direction :horizontal 
         :elements [[:text {:value "Line 1"}]
                    [:text {:value "Line 2"}]]}]

; Elements stacked vertically
[:stack {:direction :vertical 
         :elements [[:text {:value "Line 1"}]
                    [:text {:value "Line 2"}]]}]
```

## Rectangle element

```clojure
; Simple rectangle
[:rect {:width 100 :height 100}]

; Rectangle with color property
[:rect {:width 100 :height 100 :fill 0xFFFFFFFF}]
```

## padding

### Example

```clojure
[:padding
  10.0 
  [:text {:value "Hey"}]]
```