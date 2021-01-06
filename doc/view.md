# View declarative data 

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
