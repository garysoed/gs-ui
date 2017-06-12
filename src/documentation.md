# Documenting web components.

Each web component must be fully documented. The documentation should be written in the `js` or `ts`
file, using the appropriate documentation language. I.e.: `jsdoc` for `.js` files, and `typedoc` for
`.ts` files.

Basic structure of documentation:

```javascript
/**
 * @webcomponent element-name
 * One lined description of the element.
 *
 * More detailed description of what the element does.
 *
 * @attr {type} attr-name Description for attribute "attr-name"
 * @attr {type} attr-name2 Description for attribute "attr-name2"
 *
 * @css {type} css-var-name Description for CSS variable "css-var-name"
 * @css {type} css-var-name-2 Description for CSS variable "css-var-name-2"
 *
 * @slot slotName Description of the slot "slotName"
 *
 * @event {payloadType} eventName Description of the event "eventName". Also describe the payload.
 * @event {payloadType} eventName2 Description of the event "eventName2". Also describe the payload.
 */
```

Note that an empty line separates each section. The sections must come in that order. Each item in
every section must be alphabetically ordered.

## Attributes

The type of attributes are quite different from ECMAScript types, since they are `string` based. The
types supported are the ones with the corresponding `Parser` in `gs-tools`. This means:

-   `boolean`
-   `enum<EnumType>`
-   `float`
-   `hex`
-   `int`
-   `list<ItemType>`
-   `percent`
-   `string`

## CSS

The CSS lists CSS variables that the client code can override. The names should exclude the `--`
prefix. The types are one of the CSS data types listed in MDN. Though CSS variables support a
combination of CSS types, this should never be used. Instead, multiple variables should be used to represent them.

## Slot

Slots are slots used for shadow dom. If a `@slot` has no name, and there is only one `@slot` entry,
that slot is considered to be the default slot. This means that any components with multiple slots
must have all of its slots named. If a slot has no name, `_` is used for the name.

## Event

Events are events dispatched by the component. The payload types are `TS` types. Only document
custom events.