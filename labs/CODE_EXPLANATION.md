# COMP 4537 Lab 2 — Code Walkthrough

JSON, Object Constructor, localStorage.

A file-by-file explanation of every file in `2/`: what each one is responsible for, then
each class and each method. Anything with non-obvious logic gets a line-by-line
breakdown.

---

## Table of contents

- [What the app does](#what-the-app-does)
- [How the files fit together](#how-the-files-fit-together)
- [Five design rules used everywhere](#five-design-rules-used-everywhere)
- [Two end-to-end traces](#two-end-to-end-traces)
- **File by file**
  - [The three HTML pages](#the-three-html-pages)
  - [lang/messages/en/user.js](#langmessagesenuserjs)
  - [js/Widget.js](#jswidgetjs)
  - [js/AppButton.js](#jsappbuttonjs)
  - [js/NoteData.js](#jsnotedatajs)
  - [js/NoteStore.js](#jsnotestorejs)
  - [js/Note.js](#jsnotejs)
  - [js/ReadOnlyNote.js](#jsreadonlynotejs)
  - [js/StatusLabel.js](#jsstatuslabeljs)
  - [js/PageApp.js](#jspageappjs)
  - [js/WriterApp.js](#jswriterappjs)
  - [js/ReaderApp.js](#jsreaderappjs)
  - [js/IndexApp.js](#jsindexappjs)
  - [js/index.js, js/writer.js, js/reader.js](#jsindexjs-jswriterjs-jsreaderjs)
  - [css/style.css](#cssstylecss)
- [Class responsibilities at a glance](#class-responsibilities-at-a-glance)
- [Questions you might get asked](#questions-you-might-get-asked)

---

## What the app does

Three pages.

**`index.html`** — the title, your name, and two buttons that navigate to the other two
pages.

**`writer.html`** — an **Add** button that creates a note. Each note is a textarea with
its own **Remove** button. Every keystroke writes the whole set of notes to
`localStorage` immediately, and the top-right corner updates to `"Stored at 2:31:07 PM"`.
Removing a note takes its contents out of storage at once. Reopening the page restores
everything you typed.

**`reader.html`** — the same notes, read-only. It reads storage when it opens, and reads
it again every time the writer tab changes something, so it stays current with no
refresh button and no polling timer. The corner reads `"Updated at 2:31:07 PM"`.

---

## How the files fit together

Two inheritance trees, plus one model class that belongs to neither:

```
Widget                     PageApp                 NoteData
├── AppButton              ├── WriterApp           (no parent - it is data,
├── Note                   └── ReaderApp            not a page and not an
├── ReadOnlyNote                                    element)
└── StatusLabel            IndexApp (stands alone)
```

And how each page reaches them at runtime:

```
index.html  ──▶ js/index.js  ──▶ IndexApp  ──▶ AppButton

writer.html ──▶ js/writer.js ──▶ WriterApp ──┬─▶ Note ──┬─▶ AppButton
                                 NoteStore   │          └─▶ NoteData
                                             ├─▶ NoteData
                               (via PageApp) ┼─▶ AppButton
                                             └─▶ StatusLabel

reader.html ──▶ js/reader.js ──▶ ReaderApp ──┬─▶ ReadOnlyNote
                                 NoteStore   │
                               (via PageApp) ┼─▶ AppButton
                                             └─▶ StatusLabel
```

Fifteen files in total: three one-line entry points, eleven classes, and the messages
file.

The writer and reader share four classes outright — `NoteStore`, `NoteData`, `AppButton`
and `StatusLabel` — and inherit a fifth, `PageApp`. The `NoteStore` sharing is the
architecturally important one: **neither page knows the storage format.** Only
`NoteStore` knows the key name and that the data is JSON, so the two pages cannot drift
apart. If you changed the key tomorrow, you would edit one line in one file.

---

## Five design rules used everywhere

**1. The HTML files are empty on purpose.**
All three have an empty `<body>` and an empty `<title>`. Every element is created in
JavaScript with `document.createElement`. The lab forbids hard-coded markup and text, so
the HTML is just a shell that loads the stylesheet and one module script.

**2. `<script type="module">`.**
It does three things:
- Enables `import` / `export`, which is how the files reference each other.
- Defers execution until the document is fully parsed, so `document.body` always exists
  when the code runs. That is why there is no `DOMContentLoaded` listener anywhere.
- Runs each module exactly once, even when several files import it.

**3. No user-facing string is written in a JS or HTML file.**
Every visible word is a property of the `MESSAGES` object in
`lang/messages/en/user.js` — including the `<title>` of each page. Adding French means
adding `lang/messages/fr/user.js` and changing one import path.

**4. Each class owns its own DOM elements.**
A `Note` owns its `<textarea>` and its Remove button. Nothing outside the class reaches
in with `document.getElementById` to grab them. Objects communicate through methods
(`mount()`, `remove()`) and callbacks (`onInput(handler)`, `onRemove(handler)`).

**5. Anything two classes both need is inherited, not copied.**
Three separate applications of the same idea:

- **`Widget`** — every widget needs an element, a way to attach it and a way to detach it.
  Written once in `Widget`; `AppButton`, `Note`, `ReadOnlyNote` and `StatusLabel` inherit
  all three.
- **`PageApp`** — the writer page and the reader page are the same page with different
  middles: both have a title, a status label, a heading, a list of notes and a Back
  button. `PageApp.start()` builds all of that in a fixed order and calls
  `buildContent()` in the middle; each subclass writes only that one method.
- **`NoteData` vs `Note`** — a note's *data* and a note's *appearance* are two different
  responsibilities, so they are two classes. `NoteData` is `{ id, text }` with no DOM
  attached, which is exactly why the same note can travel from the writer, through a
  string in `localStorage`, to the reader. `Note` is the textarea that displays one.

---

## Two end-to-end traces

Reading the call chain once makes the individual files much easier to follow.

### Trace 1 — you type one character in the writer

```
you press a key in a <textarea>
  └─ browser fires the "input" event
       └─ the listener registered by Note.onInput()             (Note.js)
            ├─ this.data.text = this.textarea.value      ← model updated first
            └─ WriterApp.save()                                 (WriterApp.js)
                 ├─ this.noteData()  → the NoteData behind each Note on screen
                 ├─ NoteStore.save(thoseModels)                 (NoteStore.js)
                 │    └─ JSON.stringify(array)
                 │         ├─ calls NoteData.toJSON() on each   (NoteData.js)
                 │         │    → { id: 1, text: "milk" }
                 │         └─ localStorage.setItem(KEY, thatString)
                 └─ StatusLabel.showNow("Stored at ")           (StatusLabel.js)
                      └─ corner now reads "Stored at 2:31:07 PM"
```

Every keystroke rewrites the entire array. That is the point of the lab — storing *on
change*, not on a timer.

The first line inside the listener is the one to notice. The `Note` copies the textarea
into its `NoteData` **before** telling the page to save, so by the time `save()` runs the
model is already correct. One listener does both steps, which is why they can never
happen in the wrong order.

### Trace 2 — the reader tab notices

```
localStorage changed in the writer tab
  └─ browser fires the "storage" event in EVERY OTHER TAB of this origin
       └─ the listener registered by NoteStore.onExternalChange()   (NoteStore.js)
            └─ checks event.key === KEY, then calls the handler
                 └─ ReaderApp.refresh()                             (ReaderApp.js)
                      ├─ removes every ReadOnlyNote on screen
                      ├─ NoteStore.load() → array of NoteData
                      │    ├─ JSON.parse(localStorage.getItem(KEY))
                      │    └─ NoteData.fromJSON(item) for each      (NoteData.js)
                      │         └─ returns null for anything malformed,
                      │            which load() then filters out
                      ├─ builds a fresh ReadOnlyNote per model
                      └─ StatusLabel.showNow("Updated at ")
```

Note the event fires in every *other* tab — never in the tab that wrote. That is the
browser's behavior, not something the code works around, and it is why the writer cannot
save itself into an infinite loop.

---

## The three HTML pages

`index.html`, `writer.html` and `reader.html` are byte-for-byte identical except for one
line — the script they load:

```html
<script type="module" src="js/index.js"></script>    <!-- index.html  -->
<script type="module" src="js/writer.js"></script>   <!-- writer.html -->
<script type="module" src="js/reader.js"></script>   <!-- reader.html -->
```

Each is 12 lines: doctype, charset, viewport, an empty `<title>`, the stylesheet link,
the module script, and an empty `<body>`.

The `<title>` is left empty deliberately. Each app class sets it at runtime —
`document.title = this.title` — because the title is a user-facing string and must come
from the messages file like every other one.

---

## `lang/messages/en/user.js`

No class, no method. One exported object:

```js
export const MESSAGES = {
    INDEX_TITLE: "Lab 2: JSON, Object Constructor, localStorage",
    STUDENT_NAME: "Davi Emery Araujo Vargas",
    WRITER_TITLE: "Writer",
    READER_TITLE: "Reader",
    ADD_BUTTON: "Add",
    REMOVE_BUTTON: "Remove",
    BACK_BUTTON: "Back",
    STORED_AT: "Stored at ",
    UPDATED_AT: "Updated at ",
    NO_NOTES: "There are no notes yet."
};
```

Two details worth pointing at:

- `STORED_AT` and `UPDATED_AT` **end with a space**. `StatusLabel.showNow()` does
  `message + new Date().toLocaleTimeString()`, so the space in the string is what
  separates `"Stored at"` from `"2:31:07 PM"`. Without it you would get
  `"Stored at2:31:07 PM"`.
- `WRITER_TITLE` and `READER_TITLE` each do triple duty — the `<h1>` on their page, the
  `<title>` of that page, and the label on the index page's navigation button. One
  string, three uses. `WriterApp` and `ReaderApp` each hand theirs up to `PageApp`
  through `super()`, and the base class uses it for both the title and the heading.

---

## `js/Widget.js`

**Responsibility:** the base class for everything that owns one element on the page.

`AppButton`, `Note`, `ReadOnlyNote` and `StatusLabel` all need exactly the same three
things: an element, a way to put it somewhere, and a way to take it out again. Those
three things used to be written out four times, once per class. Now they are written
once here and inherited.

```js
export class Widget {
    constructor(tagName, className) {
        this.element = document.createElement(tagName);
        this.element.className = className;
    }

    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    remove() {
        this.element.remove();
    }
}
```

### `constructor(tagName, className)`

Creates the element and sets its class. Subclasses call it through `super(...)` and then
add whatever is specific to them — `AppButton` adds a `type` and a label, `ReadOnlyNote`
adds text, `Note` appends a textarea and a button.

The element is created but deliberately **not attached** to the page. Attaching is
`mount()`'s job, which leaves the caller in control of where the widget goes.

### `mount(parent)`

Attaches the element to whatever the caller passes, then returns `this` so a widget can
be created and placed in one expression:

```js
new ReadOnlyNote(data.text).mount(this.noteList)      // ReaderApp.refresh()
```

`return this` hands back the **wrapper object**, not the DOM element — which is what lets
that line push a `ReadOnlyNote` (not a bare `<div>`) onto the tracking array.

### `remove()`

Detaches the element from the DOM. Because every widget nests its parts inside one
wrapper element, removing that wrapper takes the children with it. That is why `Note`
needs no `remove()` of its own to clean up its textarea and its button — the inherited
one already does it.

### Why `element` is public rather than `#element`

Modern JavaScript has private fields (`#element`), but a `#` field is **not visible to
subclasses**. Declaring it private here would break all four classes that extend `Widget`.
Inheritance and private fields pull in opposite directions in this design, and the
inheritance is worth more.

---

## `js/AppButton.js`

**Responsibility:** wrap a `<button>` element so no page ever builds one by hand. Every
button in the lab is an `AppButton` — the two nav buttons, Add, every Remove, and both
Back buttons.

`extends Widget`, so `mount()` and `remove()` come for free and what is left is a
constructor and one method.

### `constructor(label, className)`

```js
super("button", className);
this.element.type = "button";
this.element.textContent = label;
```

`super(...)` creates the `<button>` and sets its class. The two lines after it are what
this class adds.

`type = "button"` is set explicitly because the HTML default for `<button>` is
`"submit"`. A submit button inside a form would try to submit and navigate; setting the
type rules that out permanently.

`textContent` rather than `innerHTML` — this matters throughout the lab. `textContent`
treats the string as plain text, so a note containing `<script>alert(1)</script>` is
displayed as those literal characters instead of being parsed and run. Using `innerHTML`
anywhere a note's text is displayed would be an XSS hole.

### `onClick(handler)`

```js
this.element.addEventListener("click", handler);
return this;
```

Passes the handler straight through, unwrapped, because an `AppButton` has nothing extra
to report about itself. (Compare `Note.onRemove()` below, which *does* wrap, because a
`Note` needs to identify itself to its handler.)

`return this` matches `mount()`, so the three steps of making a button read as one
statement:

```js
new AppButton(MESSAGES.BACK_BUTTON, "back-button")
    .onClick(() => { window.location.href = PageApp.INDEX_URL; })
    .mount(backRow);
```

That form is used for the Back button, the Add button and both nav buttons.

---

## `js/NoteData.js`

**Responsibility:** one note *as data* — the part that actually gets stored. No element,
no DOM, no page.

This class is the "object constructor" the assignment title refers to, and it is the
reason the same note can start life in the writer, spend time as a string inside
`localStorage`, and arrive in the reader still recognisable.

```js
constructor(id, text) {
    this.id = id;
    this.text = text;
}
```

Two properties, both primitives. That is the entire model.

### `static fromJSON(raw)`

```js
if (raw === null || typeof raw !== "object") {
    return null;
}
if (!Number.isInteger(raw.id)) {
    return null;
}
const text = typeof raw.text === "string" ? raw.text : "";
return new NoteData(raw.id, text);
```

Rebuilds a `NoteData` from one entry of the parsed JSON — or returns `null` when that
entry is not a note at all. `NoteStore.load()` filters the `null`s out.

`localStorage` is fully visible and editable in DevTools, so **nothing coming out of it
is taken on trust.** The three checks handle three different kinds of junk:

- `raw === null || typeof raw !== "object"` — the entry is `null`, a number, or a bare
  string. (`typeof null` is famously `"object"`, which is why `null` has to be tested
  separately; without that first clause, reading `.id` off it would throw on the next
  line.)
- `!Number.isInteger(raw.id)` — there is an object there, but its id is missing or is a
  string. Without a usable id the writer could not tell two notes apart, so the entry is
  dropped rather than patched up.
- `typeof raw.text === "string" ? raw.text : ""` — the id is fine but the text is
  missing. This one is **recoverable**, so it is repaired instead of dropped: the note
  survives with empty text. Without this line that note would render the literal word
  `"undefined"` on the reader page.

Deciding *per field* whether a problem is fatal or repairable is the whole job of this
method, and keeping it in one place is why neither page needs a single defensive check
of its own.

It is `static` because it is called on the class — `NoteData.fromJSON(item)` — there
being no instance yet. Producing one is the point of the method.

### `static nextId(notes)`

```js
return notes.reduce((highest, note) => Math.max(highest, note.id), 0) + 1;
```

The id to give the next note: one past the largest id currently in use.

`reduce` walks the array carrying the biggest id seen so far, starting from the seed `0`.
On an empty array the callback never runs, `reduce` returns that seed, and the first note
gets id `1`.

The important property is that **the counter is derived, never stored.** An earlier
version of this lab kept a `this.nextId` field on `WriterApp` and had to nudge it forward
while loading —

```js
if (stored.id >= this.nextId) {     // the old approach, no longer needed
    this.nextId = stored.id + 1;
}
```

— so that reopening a page holding notes 1, 2 and 3 would not hand out a second id 1.
Computing the value from the data on demand makes that entire class of bug impossible:
there is no counter left to fall out of step with the notes.

It is `static` because it asks a question about a *set* of notes, not about any single
one.

### `toJSON()`

```js
return { id: this.id, text: this.text };
```

Returns the plain object that ends up in storage.

The name is not decorative. **`JSON.stringify` looks for a method called exactly
`toJSON` and calls it automatically** whenever it meets an object that has one. So
`NoteStore.save()` can hand `JSON.stringify` an array of live `NoteData` instances and
get clean output back, with no conversion step anywhere in between:

```js
JSON.stringify([ new NoteData(1, "milk") ])   →   '[{"id":1,"text":"milk"}]'
```

Here the method is nearly a formality, since a `NoteData` has only those two properties
to begin with. It earns its place by being a **guarantee**: the stored shape is written
down in this one method, so adding a field to the class later cannot silently change
what gets written to storage.
---

## `js/NoteStore.js`

**Responsibility:** the *only* class in the app that touches `localStorage`. It converts
`NoteData` objects into a JSON string going in, and back into `NoteData` objects coming
out. It also owns the cross-tab notification.

This is the most important file in the lab — it is where the three assignment keywords
(JSON, localStorage, and the stored object) actually meet.

### `static KEY = "comp4537_lab2_notes"`

One key for the whole app. `localStorage` is shared by **every page on the same origin**
— if all your labs are served from the same domain, they share one storage area. A
distinctively prefixed key avoids collisions. Making it `static` means the key is
written once and referenced as `NoteStore.KEY` in the three places that need it.

### `save(notes)`

```js
localStorage.setItem(NoteStore.KEY, JSON.stringify(notes));
```

`localStorage` can only store **strings** — that is the whole reason `JSON.stringify` is
in this lab. An array of two `NoteData` objects becomes the string

```
'[{"id":1,"text":"milk"},{"id":2,"text":"eggs"}]'
```

If you passed the array to `setItem` directly, the browser would call `toString()` on it
and store the useless `"[object Object],[object Object]"`. The data would be
unrecoverable.

`notes` here is an array of **`NoteData` instances**, handed over as-is. No conversion
happens in this method and none is needed: `JSON.stringify` walks the array, finds a
`toJSON()` method on each element, and calls it. That is why this method is one line
instead of two.

### `load()` — line by line

```js
const raw = localStorage.getItem(NoteStore.KEY);
if (raw === null) {
    return [];
}
```

`getItem` returns `null` — not `undefined`, not `""` — when the key has never been set.
That is the first-visit case. Returning `[]` instead of `null` means every caller can
immediately `for…of` the result without a null check. The whole method is built around
that guarantee.

```js
let parsed;
try {
    parsed = JSON.parse(raw);
} catch (error) {
    return [];
}
if (!Array.isArray(parsed)) {
    return [];
}
```

Two **separate** defenses that catch two different failures:

- **The `try/catch` handles corrupt JSON.** `JSON.parse` *throws* a `SyntaxError` on
  malformed input — say someone edited the value by hand in DevTools, or a write was
  interrupted. An uncaught throw inside `ReaderApp.refresh()` would abort the rest of
  the method and leave the page half-built. Returning `[]` degrades gracefully: you see
  "There are no notes yet." instead of a broken page.

- **`Array.isArray(parsed)` handles valid JSON of the wrong shape.** `'{"a":1}'`, `'42'`
  and `'"hello"'` are all perfectly legal JSON. They parse without throwing, so the
  `try/catch` never fires — but none of them is an array, and `for (const x of 42)`
  throws later, somewhere less obvious. This check catches the problem at the boundary.

`parsed` is declared with `let` *outside* the `try` so it is still in scope afterwards. A
`const` inside the `try` block would be invisible to the `Array.isArray` line below it.

The `catch (error)` parameter is unused; it is there because older JavaScript required
it. (Modern syntax allows a bare `catch {}`.)

```js
return parsed
    .map((item) => NoteData.fromJSON(item))
    .filter((note) => note !== null);
```

**The third defense, and the one that produces objects rather than raw parsed data.**
Even a genuine array can hold entries that are not notes. `map` runs every entry through
`NoteData.fromJSON`, which returns either a real `NoteData` or `null`; `filter` then
drops the `null`s.

Worked example — storage holding a deliberately damaged array:

```js
[ {id:1,text:"good"}, null, {id:"x",text:"bad id"}, {id:2}, "garbage", {id:3,text:"ok"} ]
```

`load()` returns **four** `NoteData` objects: ids 1, 2 and 3, where id 2 has empty text
because its `text` field was missing and that is repairable. The `null`, the string-id
entry and the bare `"garbage"` string are gone. Neither page ever sees them.

The combined result: **`load()` has exactly one possible return type — an array of valid
`NoteData` — no matter what is sitting in storage.** Every caller can rely on that,
which is why neither `WriterApp` nor `ReaderApp` contains a single check on the data it
receives.

### `onExternalChange(handler)` — the cross-tab mechanism

```js
window.addEventListener("storage", (event) => {
    if (event.key === NoteStore.KEY || event.key === null) {
        handler();
    }
});
```

This is what makes the reader page live-update, so it is worth being precise about the
`storage` event:

- **It fires in every other tab or window of the same origin** when `localStorage`
  changes. "Same origin" means same protocol, host and port.
- **It does not fire in the tab that made the change.** This is specified browser
  behavior. It is also the reason the writer cannot trigger itself: if `WriterApp` ever
  listened to this event, its own `save()` still would not wake it up.
- **`event.key`** is the name of the key that changed. The check means a different key
  changing — another lab on the same domain writing its own data — does not cause a
  pointless `refresh()` on the reader.
- **`event.key === null`** is the special case for `localStorage.clear()`, which wipes
  the entire storage area at once and therefore reports no single key. Without that
  clause, clearing storage from DevTools would leave the reader displaying notes that no
  longer exist.

The event object also carries `oldValue` and `newValue`, which this code deliberately
ignores — it just calls `handler()` and lets `ReaderApp` re-read through `load()`. That
keeps one code path for "read the notes" instead of two.

**To demonstrate this you need both tabs open at once.** Two windows side by side, type
in the writer, watch the reader.

---

## `js/Note.js`

**Responsibility:** the editable *view* of one `NoteData` — a textarea showing its text
and a button to remove it.

The split is worth stating plainly, because the two classes are easy to confuse:

| | `NoteData` | `Note` |
|---|---|---|
| Is | the note's data | the note's appearance |
| Holds | `id`, `text` | an element, a textarea, a button, and **a `NoteData`** |
| Survives in storage | yes | no — it is rebuilt on every page load |
| Used by | writer and reader | writer only |

`extends Widget`, so `mount()` and `remove()` are inherited.

### Static class-name constants

```js
static ROW_CLASS = "note-row";
static TEXT_CLASS = "note-text";
static REMOVE_CLASS = "remove-button";
```

The three CSS class names, named once at the top of the class instead of appearing as
bare strings inside the constructor. `static` puts them on the class rather than on
every instance.

### `constructor(data)`

```js
super("div", Note.ROW_CLASS);
this.data = data;

this.textarea = document.createElement("textarea");
this.textarea.className = Note.TEXT_CLASS;
this.textarea.value = data.text;
this.element.appendChild(this.textarea);

this.removeButton = new AppButton(MESSAGES.REMOVE_BUTTON, Note.REMOVE_CLASS);
this.removeButton.mount(this.element);
```

The structure it builds:

```html
<div class="note-row">
    <textarea class="note-text">milk</textarea>
    <button class="remove-button">Remove</button>
</div>
```

Four things to understand:

- **It takes a `NoteData`, not an id and a text.** One argument instead of two, and the
  note keeps a reference to the actual model object — not a copy of its values. That
  reference is what lets `onInput()` below keep the model current, and what lets
  `WriterApp.save()` collect the models straight off the notes on screen.

- **`this.textarea.value = data.text`, not `.textContent`.** For a `<textarea>`, `.value`
  is the live editable content — what the user sees and edits, and what you read back
  later. `.textContent` would set the element's *default* content, which is a different
  thing and gets out of sync the moment the user types.

- **`data.text` is `""` for a new note**, and the previously stored text when
  `WriterApp.buildContent()` rebuilds notes from storage. One constructor serves both
  cases, because `NoteData` has already normalised the value.

- **The Remove button is an `AppButton` mounted inside this note's own row.** Each note
  therefore owns its own Remove button as a child, which is what makes the inherited
  `remove()` sufficient.

### `onInput(handler)`

```js
this.textarea.addEventListener("input", () => {
    this.data.text = this.textarea.value;
    handler();
});
```

Two jobs in one listener, in a fixed order: **copy the typing into the model, then tell
the page to save.**

That ordering is the reason this wraps the handler instead of passing it straight
through the way `AppButton.onClick` does. If the model update lived in its own separate
listener, the two would run in whatever order they happened to be registered, and a save
could serialize a `NoteData` that is one keystroke stale. Doing both inside one listener
makes the order structural rather than a coincidence.

This also replaces an older `getData()` method, which read `this.textarea.value` at save
time and built a fresh plain object from it. Keeping the model updated as you type is
why `WriterApp.save()` no longer needs a conversion step.

The choice of event matters too. **`input` fires on every change to the field** — every
keystroke, plus paste, cut, drag-and-drop text, and undo. The alternatives all miss
something:

| Event | Problem |
|-------|---------|
| `change` | Only fires when the field **loses focus** — nothing is saved while you type |
| `keyup` | Misses pasting with the mouse and drag-and-drop |
| `keypress` | Deprecated, and does not fire for Backspace |

`input` is what satisfies the requirement to store on change rather than on a timer.

### `onRemove(handler)`

```js
this.removeButton.onClick(() => handler(this));
```

The arrow function does two jobs:

1. An arrow function does **not** bind its own `this`, so `this` inside still refers to
   the `Note` instance. A `function () {}` would have `this` pointing at the DOM button
   element, and `handler(this)` would pass the wrong thing entirely.
2. It passes `this` — **the whole `Note` object** — to the handler. That is how
   `WriterApp.removeNote(note)` receives the exact object to drop, without needing to
   search by id or by index.

---

## `js/ReadOnlyNote.js`

**Responsibility:** one note as the reader page displays it — the text only, with nothing
to edit and nothing to remove.

`extends Widget`. With `mount()` and `remove()` inherited, the entire class is now a
constructor and one constant.

### `constructor(text)`

```js
super("div", ReadOnlyNote.CLASS_NAME);      // "read-note"
this.element.textContent = text;
```

Using a **`<div>` instead of a disabled `<textarea>`** is the design decision here. A
disabled textarea would still be a form control — greyed out, awkward to style, and
still scrollable. A plain div is genuinely non-editable with no workaround needed, and
the CSS gives it the same width and border so it reads as a card.

`textContent` again, so a note's text is never parsed as HTML.

It takes a plain `text` string rather than a whole `NoteData`, because the reader has no
use for the id — it never modifies, reorders or removes anything, so it never needs to
identify a particular note. `ReaderApp.refresh()` passes `data.text` and leaves the model
behind.

### Inherited `mount()` and `remove()`

Not written in this file at all any more — both come from `Widget`. That shared base is
what lets `ReaderApp.refresh()` loop over its notes calling `remove()` without caring
which class it is holding, and it is why this class can no longer drift out of step with
`Note`.

---

## `js/StatusLabel.js`

**Responsibility:** the small bold line pinned in the top-right corner, reporting the
most recent time the notes were stored (writer) or retrieved (reader).

`extends Widget`.

### `constructor()`

```js
super("div", StatusLabel.CLASS_NAME);       // "status"
```

Created empty — nothing is displayed until the first `showNow()` call. On the writer
that is the first save; on the reader it is the initial `refresh()`, which happens
immediately inside `buildContent()`.

Note this constructor takes **no arguments**: the tag and the class are both fixed, so it
supplies them to `super()` itself. A caller writes `new StatusLabel()` and cannot get it
wrong.

### `showNow(message)`

```js
this.element.textContent = message + new Date().toLocaleTimeString();
```

- `new Date()` with no arguments captures **the moment the method is called**, which is
  the moment of the store or retrieve.
- `.toLocaleTimeString()` formats only the time portion, using the browser's own locale
  settings — `"2:31:07 PM"` on an en-US machine, `"14:31:07"` on most others. You get
  the user's expected format for free rather than hand-formatting hours and minutes.
- Concatenated with `MESSAGES.STORED_AT` (which ends in a space) the result is
  `"Stored at 2:31:07 PM"`.

One class serves both pages; only the prefix argument differs. That is why the message is
a parameter rather than being baked into the class.

`PageApp` mounts it **first**, before the heading, so it is the first child of `<body>`.
Its position on screen comes entirely from CSS (`position: fixed; top: 1rem; right: 1rem`),
not from where it sits in the DOM.

---

## `js/PageApp.js`

**Responsibility:** everything the writer page and the reader page have in common.

Put the two pages side by side and they are the same page with different middles. Both
set a title, mount a status label, show an `<h1>`, keep a list of notes and a `<div>` to
put them in, and end with a Back button to the index. Only the middle differs: the
writer adds an Add button and editable notes, the reader adds read-only notes and a
storage subscription.

So all of the sameness lives here, once, and each subclass writes one method.

### `static INDEX_URL = "index.html"`

Where the Back button goes. One copy, inherited by both pages — it used to be declared
separately on `WriterApp` and on `ReaderApp`.

### `constructor(root, store, title)`

```js
this.root = root;
this.store = store;      // the NoteStore, injected from writer.js / reader.js
this.title = title;      // MESSAGES.WRITER_TITLE or MESSAGES.READER_TITLE
this.notes = [];         // the note widgets currently on screen
this.status = new StatusLabel();
this.noteList = document.createElement("div");
this.noteList.className = "note-list";
```

The store is **injected** rather than constructed here — `writer.js` does
`new WriterApp(document.body, new NoteStore())`. Two benefits: no app class ever names
`localStorage`, and either page could be handed a fake store in a test.

`title` is passed up from the subclass through `super()`. That is what lets one base
class set both `document.title` and the `<h1>` without knowing which page it is building.

`this.notes` holds **widgets** — `Note` on the writer, `ReadOnlyNote` on the reader. The
base class never looks inside them; it only needs the array to exist. Keeping the
distinction between these widgets and the `NoteData` they represent is the key to reading
`WriterApp.save()`.

### `start()` — the template method

```js
start() {
    document.title = this.title;
    this.status.mount(this.root);

    const heading = document.createElement("h1");
    heading.textContent = this.title;
    this.root.appendChild(heading);

    this.root.appendChild(this.noteList);

    this.buildContent();                 // ← the subclass's one contribution

    const backRow = document.createElement("div");
    backRow.className = "back-row";
    this.root.appendChild(backRow);

    new AppButton(MESSAGES.BACK_BUTTON, "back-button")
        .onClick(() => {
            window.location.href = PageApp.INDEX_URL;
        })
        .mount(backRow);
}
```

This is the **template method** pattern: the base class fixes the *order* of the steps
and lets the subclass fill in one of them. Neither `WriterApp` nor `ReaderApp` has a
`start()` at all — they inherit this one.

Three consequences worth naming:

- **The page layout is decided in exactly one place.** Status, heading, note list,
  subclass content, Back button. Changing that order for both pages is a one-line edit.
- **`buildContent()` runs between the note list and the Back button**, which is exactly
  where the writer's Add button needs to go. Because `noteList` is appended *before*
  `buildContent()` runs, every new note is inserted above the Add button and pushes it
  further down the page — the behavior the lab asks for. That comes purely from DOM
  order; there is no repositioning code anywhere.
- **A subclass cannot forget a step.** Previously each page built its own heading and its
  own Back button, and the two copies could quietly drift apart — which is how the writer
  and the reader ended up with slightly different `start()` methods in the first place.

`window.location.href = ...` performs the navigation. The Back button behaves like a
link but is still an `AppButton`, keeping the rule that no page hand-writes markup.

### `buildContent()`

```js
buildContent() {
}
```

Deliberately empty. It is the **hook** the subclass overrides, and giving it an empty
body in the base class means `start()` can call it unconditionally without checking
whether it exists.

JavaScript has no `abstract` keyword, so an empty method is how "a subclass should fill
this in" gets expressed. Empty is the right default here rather than something that
throws, because a page with no extra content is a perfectly sensible thing — it would
simply be a heading and a Back button.

---

## `js/WriterApp.js`

**Responsibility:** the writer page. It holds one `Note` widget per stored `NoteData` and
writes the whole set to storage the moment anything changes.

`extends PageApp`. It has no `start()`, no heading code, no Back button code and no
status-mounting code — all inherited.

### `constructor(root, store)`

```js
constructor(root, store) {
    super(root, store, MESSAGES.WRITER_TITLE);
}
```

The entire constructor. Its only job is to tell the base class which title this page
uses; `super()` sets up everything else.

### `buildContent()`

```js
new AppButton(MESSAGES.ADD_BUTTON, "add-button")
    .onClick(() => this.addNote())
    .mount(this.root);

for (const data of this.store.load()) {
    this.createNote(data);
}
```

The two things that make this page the writer rather than the reader.

`.onClick(() => this.addNote())` uses an arrow function to preserve `this` as the
`WriterApp` instance. Writing `.onClick(this.addNote)` would break — `this` inside
`addNote` would be `undefined` when the DOM invoked it.

The loop restores what was saved before. `load()` always returns an array of `NoteData`
(see above), so it is safe with no guard; on a first visit the array is empty and the body
never runs. Each model gets a `Note` widget built around it.

Note what is **not** here any more: the old version also tracked the highest id seen while
looping, to keep a `nextId` counter in step. `NoteData.nextId()` computes that on demand
instead, so the loop is now just "one widget per model".

### `noteData()`

```js
return this.notes.map((note) => note.data);
```

The models behind the widgets on screen, in the order they appear.

One line, but it is the seam between the two halves of the design: `this.notes` is
*widget* objects, the returned array is *model* objects. Both `save()` and `addNote()` go through
it, so "which notes exist, as data" is answered in one place.

Because each `Note` keeps its `NoteData` updated on every keystroke, the models this
returns are always current — there is no gathering or conversion step, just a lookup.

### `createNote(data)`

```js
const note = new Note(data);
note.onInput(() => this.save());
note.onRemove((target) => this.removeNote(target));
note.mount(this.noteList);
this.notes.push(note);
return note;
```

The single place where a `Note` is constructed and wired up. Both `addNote()` and the
restore loop in `buildContent()` go through it, so a restored note behaves identically to
a freshly added one — there is no second code path to keep in sync.

`note.onInput(() => this.save())` is the line that implements **"store on change"**:
every keystroke in any textarea updates that note's model and rewrites the whole array to
storage.

`note.onRemove((target) => this.removeNote(target))` — `target` is the `Note` object the
class handed back through `handler(this)`. It is passed straight to `removeNote`.

### `addNote()`

```js
this.createNote(new NoteData(NoteData.nextId(this.noteData()), ""));
this.save();
```

Read it inside out: collect the current models, ask `NoteData` what the next free id is,
build an empty model with that id, build a widget around it, save.

Saving right away means the new empty note reaches storage at once, so a reader tab shows
a blank card instantly rather than waiting for the first keystroke.

The old version was three lines — create with `this.nextId`, then `this.nextId += 1`, then
save — and it depended on that counter having been advanced correctly at load time.
Deriving the id from the notes that actually exist removes both the counter and the bug it
could cause.

### `removeNote(note)`

```js
this.notes = this.notes.filter((candidate) => candidate !== note);
note.remove();
this.save();
```

```js
this.notes.filter((candidate) => candidate !== note)
```
`!==` on two objects compares **identity** — are these the same object in memory? — not
contents. So two notes both containing `"milk"` are still distinct objects, and exactly
the one whose button was clicked is dropped. Comparing by text would remove the wrong one;
comparing by id would work but requires the ids to be trustworthy, and identity is simply
more direct.

`filter` also returns a **new array** rather than mutating in place. Mutating an array
while something else iterates it is a classic source of skipped elements; assigning a
fresh array sidesteps that entirely.

```js
note.remove();
```
The inherited `Widget.remove()`. It takes the row off the page — textarea and Remove button
included, since they are its children.

```js
this.save();
```
Writes the now-shorter array out **immediately**. The lab requires that a removed note's
contents leave `localStorage` at once, not on some later tick. Because `save()`
serializes the current models — which no longer include the removed note — the text is
gone from storage as soon as this line runs.

### `save()`

```js
this.store.save(this.noteData());
this.status.showNow(MESSAGES.STORED_AT);
```

Hand the current models to the store, then stamp the time.

Compare it with the version from before the model class existed:

```js
this.store.save(this.notes.map((note) => note.getData()));   // the old line
```

The `map` was mandatory back then, because `this.notes` held `Note` objects carrying
references to DOM elements. Calling `JSON.stringify` on one would try to walk
`this.element`, `this.textarea` and `this.removeButton` — DOM nodes, which contain
references back to their parents and children. At best you get useless output; a circular
reference makes `JSON.stringify` throw outright.

That hazard has not gone away — it is precisely why `noteData()` exists. What changed is
*where* the boundary sits: the conversion is no longer squeezed into the save call, it is
a named method, and what comes out of it is a real `NoteData` rather than an anonymous
object literal.

Because `save()` is called from `addNote()`, `removeNote()` and every keystroke, the
corner updates on every one of those.

The whole array is rewritten each time rather than patching one entry. For a handful of
notes that is simpler and completely correct.

---

## `js/ReaderApp.js`

**Responsibility:** the reader page. Display the stored notes and keep them current
without a page reload.

`extends PageApp`, and like `WriterApp` it has no `start()` of its own.

### `constructor(root, store)`

```js
super(root, store, MESSAGES.READER_TITLE);

this.emptyMessage = document.createElement("p");
this.emptyMessage.className = "empty-message";
this.emptyMessage.textContent = MESSAGES.NO_NOTES;
```

`super(...)` handles root, store, title, the notes array, the status label and the note
list. The only field this page adds is the empty-state paragraph.

`emptyMessage` is built **once in the constructor** and reused. `refresh()` attaches and
detaches that same element rather than constructing a new `<p>` every time — which
matters because `refresh()` can fire on every keystroke in the writer tab.

### `buildContent()`

```js
this.refresh();
this.store.onExternalChange(() => this.refresh());
```

Two lines, and they are the reader's entire behavior:

- **`this.refresh()`** does the initial read when the page opens. This covers the case
  where notes were saved earlier and both tabs were then closed.
- **`this.store.onExternalChange(() => this.refresh())`** subscribes to the cross-tab
  `storage` event so every later change triggers another read.

Together they satisfy "retrieve on load **and** on change".

This is also where the one deliberate asymmetry between the two pages lives.
`WriterApp.buildContent()` does *not* subscribe, so two writer tabs open at once would
overwrite each other. That is a conscious choice rather than an oversight: rebuilding the
writer's notes on an external change would destroy the textarea you are typing in, along
with its cursor position and its selection. The lab describes one writer and one reader,
and with `PageApp` in place that difference is now visible in a single line rather than
buried inside two near-identical `start()` methods.

### `refresh()` — line by line

The method has three phases: tear down, rebuild, stamp.

```js
for (const note of this.notes) {
    note.remove();
}
this.notes = [];
this.emptyMessage.remove();
```

**Tear-down.** Every `ReadOnlyNote` currently on screen is detached and the tracking
array is emptied.

`this.emptyMessage.remove()` runs **unconditionally**, with no check for whether it is
currently displayed. That is safe: calling `remove()` on an element that is not in the
DOM is a harmless no-op. Checking first would be strictly more code for identical
behavior.

Rebuilding everything from scratch rather than diffing against what is already there is a
deliberate simplification, and it is appropriate here: nothing on this page is editable,
so there is no cursor position, selection or scroll state inside a note to preserve, and
the note count is small.

```js
const stored = this.store.load();
for (const data of stored) {
    this.notes.push(new ReadOnlyNote(data.text).mount(this.noteList));
}
```

**Rebuild.** One `ReadOnlyNote` per stored model, mounted and tracked.

That single line does three things, reading left to right: construct the widget, attach it
to the list, push it onto the tracking array. It works because `Widget.mount()` returns
`this` — the `ReadOnlyNote`, not the `<div>` — so what lands in `this.notes` is a widget
with a `remove()` method ready for the next tear-down.

Only `data.text` is used. `data.id` is loaded but ignored, because the reader never
modifies, reorders or removes anything and so has no need to identify a note.

```js
if (stored.length === 0) {
    this.noteList.appendChild(this.emptyMessage);
}
```

Shows "There are no notes yet." only when storage is genuinely empty. Note it tests
`stored.length`, the data — not `this.notes.length` — though at this point the two are
equal.

```js
this.status.showNow(MESSAGES.UPDATED_AT);
```

**Stamp.** Because `refresh()` is the single path for reading, this timestamp updates
exactly when the reader actually re-reads storage: once on load, then on every external
change.

---

## `js/IndexApp.js`

**Responsibility:** the front page — the title, the student name, and the two buttons that
lead to the writer and the reader.

### Why it does not extend `PageApp`

The index page has no notes, no store, no status label and no Back button — a Back button
on the page you would go back *to* makes no sense. Inheriting from `PageApp` would mean
inheriting five things it has to ignore, plus a `store` parameter it has nothing to pass.

So `IndexApp` stands alone and shares only `AppButton`. Inheritance is for classes that
genuinely have the same shape; forcing it here would make the base class worse in order to
serve a page that does not fit it.

What it *does* share is the pattern: a constructor that builds, a `start()` that
assembles, and a one-line entry point — `new IndexApp(document.body).start()` — exactly
like the other two pages.

### `static WRITER_URL` / `static READER_URL`

```js
static WRITER_URL = "writer.html";
static READER_URL = "reader.html";
```

The two destinations, as class constants rather than loose module-level variables.

### `constructor(root)`

```js
this.root = root;
this.navRow = document.createElement("div");
this.navRow.className = "nav-row";
```

No store — this page never touches storage. `navRow` is the flex row the two buttons sit
in, built here and mounted in `start()`.

### `start()`

```js
document.title = MESSAGES.INDEX_TITLE;

const heading = document.createElement("h1");
heading.textContent = MESSAGES.INDEX_TITLE;
this.root.appendChild(heading);

const studentName = document.createElement("p");
studentName.className = "student-name";
studentName.textContent = MESSAGES.STUDENT_NAME;
this.root.appendChild(studentName);

this.root.appendChild(this.navRow);

this.addNavButton(MESSAGES.WRITER_TITLE, IndexApp.WRITER_URL);
this.addNavButton(MESSAGES.READER_TITLE, IndexApp.READER_URL);
```

Title, heading and student name — all three strings from `MESSAGES` — then the row holding
the two buttons. The button labels reuse `WRITER_TITLE` and `READER_TITLE`, the same
strings those pages use for their own headings.

### `addNavButton(label, url)`

```js
new AppButton(label, "nav-button")
    .onClick(() => {
        window.location.href = url;
    })
    .mount(this.navRow);
```

Builds one navigation button and puts it in the row. The arrow function captures `url`
from the parameter list — a **closure** — so each of the two buttons remembers its own
destination.

This used to be a free-standing arrow function at module scope inside `index.js`, taking
the row as an extra argument. As a method it reads the row off `this` instead, and the
index page now has a class like the other two.

---

## `js/index.js`, `js/writer.js`, `js/reader.js`

The three entry points — the files the HTML actually loads. One line of real code each:

```js
new IndexApp(document.body).start();                    // index.js
new WriterApp(document.body, new NoteStore()).start();  // writer.js
new ReaderApp(document.body, new NoteStore()).start();  // reader.js
```

Construct the app with the page body as its root (plus a fresh `NoteStore` for the two
that need one), then start it.

This is where the dependency injection happens: these three files are the only place in
the lab that knows both "which app" and "which store" — everything else just receives what
it is given. Passing `document.body` rather than letting the app assume it means an app
could be mounted inside any container.

`index.js` used to be the odd one out at roughly 30 lines, building the front page with
raw `document.createElement` calls at module top level while the other two were
one-liners. Moving that work into `IndexApp` is what made all three identical in shape.

All three run at module top level with no wrapping function, which is fine because
`type="module"` guarantees the document is already parsed.

---

## `css/style.css`

Most of the file is ordinary layout. Five rules have real reasoning behind them.

```css
.status {
    position: fixed;
    top: 1rem;
    right: 1rem;
    font-weight: bold;
}
```
`fixed` positions relative to the **viewport**, so the label stays in the corner even
when a long list of notes scrolls the page.

```css
h1 {
    padding-right: 14rem;
}
```
Follows directly from the rule above. A `position: fixed` element is taken **out of
normal flow** — it does not push anything aside, and other elements behave as though it
were not there. Without this padding, a long heading would run underneath the status
label. 14rem reserves room for the widest expected `"Updated at 12:00:00 AM"`.

```css
.note-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}
```
Puts each textarea and its Remove button side by side. `align-items: flex-start` pins
the button to the **top** of the textarea rather than centering it vertically — which
matters because `resize: vertical` lets the user drag a textarea taller, and a centered
button would drift down to the middle of a tall note.

```css
.read-note {
    white-space: pre-wrap;
}
```
The most important CSS line in the lab. HTML collapses runs of whitespace and ignores
newlines by default, so a multi-line note typed in the writer would appear as one
run-on line in the reader. `pre-wrap` preserves the newlines and spaces exactly as typed
**and** still wraps long lines at the container width.

(`pre` alone would preserve whitespace but refuse to wrap, pushing long lines off the
side of the card. `pre-wrap` is the one that does both.)

The editable `<textarea>` needs no equivalent — form controls preserve their own
whitespace natively. This rule exists only because the reader displays the text in a
`<div>`.

```css
.note-text { width: 20rem; height: 4rem;     resize: vertical; }
.read-note { width: 20rem; min-height: 4rem; }
```
Matching widths, so a note occupies the same footprint on both pages and the two views
look like the same object. The difference is `height` versus `min-height`: the editable
one has a fixed height the user can drag taller, while the read-only one has a floor and
grows automatically to fit however much text it holds.

---

## Class responsibilities at a glance

| Class | Extends | Owns | Knows about | Used by |
|-------|---------|------|-------------|---------|
| `Widget` | — | one element, `mount`, `remove` | nothing | the four widgets |
| `AppButton` | `Widget` | one `<button>` | nothing | every page |
| `NoteData` | — | one note's `id` and `text` | nothing | `NoteStore`, `Note`, `WriterApp` |
| `NoteStore` | — | the `localStorage` key and the JSON format | `localStorage`, `JSON`, `NoteData` | writer + reader |
| `Note` | `Widget` | a row: `<textarea>` + Remove button, and its `NoteData` | `AppButton`, `MESSAGES` | writer |
| `ReadOnlyNote` | `Widget` | one `<div>` of text | nothing | reader |
| `StatusLabel` | `Widget` | the corner `<div>` | `Date` | writer + reader |
| `PageApp` | — | title, status, heading, note list, Back button | `AppButton`, `StatusLabel`, `MESSAGES` | `WriterApp`, `ReaderApp` |
| `WriterApp` | `PageApp` | the writer page and its `Note` array | `Note`, `NoteData`, `AppButton` | `writer.js` |
| `ReaderApp` | `PageApp` | the reader page and its `ReadOnlyNote` array | `ReadOnlyNote` | `reader.js` |
| `IndexApp` | — | the front page | `AppButton`, `MESSAGES` | `index.js` |

Two things to read out of this table.

**The "Knows about" column only ever points one way** — from the pages down to the
pieces. No piece reaches back up to the page holding it: a `Note` never calls
`WriterApp`, it raises a callback and lets `WriterApp` decide what to do.

**The two base classes know nothing about their subclasses.** `Widget` does not know that
`Note` exists; `PageApp` does not know whether it is building a writer or a reader. All
the base class has is a `title` it was handed and a `buildContent()` it calls. That is
what makes them safe to inherit from.

---

## Questions you might get asked

**Why are the HTML files empty?**
The lab forbids hard-coded text and markup. Everything, including each page's `<title>`,
is created in JavaScript so that all strings come from the messages file.

**Where are the user-facing strings?**
`lang/messages/en/user.js`, exported as the `MESSAGES` object. Adding another language
means adding a parallel folder and changing one import path — no other file contains a
displayable string.

**How do you store objects in `localStorage`?**
`localStorage` only holds strings. `NoteStore.save()` runs the array of `NoteData`
objects through `JSON.stringify`, which calls each one's `toJSON()` method for you.
`load()` runs the string back through `JSON.parse`, guarded by a `try/catch` for corrupt
data and an `Array.isArray` check for valid-but-wrong-shape data, then rebuilds each
entry with `NoteData.fromJSON` — so it always returns an array of valid notes.

**Where is the "object constructor" part of the assignment?**
`NoteData` is the constructor. `new NoteData(id, text)` builds the object that gets
stored; `toJSON()` defines what it looks like as JSON and `fromJSON()` rebuilds it on the
way back. `Note`, `ReadOnlyNote`, `AppButton` and `StatusLabel` are constructors in the
same style, for the visible parts.

**What is the difference between `NoteData` and `Note`?**
`NoteData` is the note's *data* — two properties, no DOM, and the thing that actually
survives in `localStorage`. `Note` is the note's *appearance* on the writer page — a
textarea and a Remove button wrapped around one `NoteData`. The reader never builds a
`Note` at all; it builds `ReadOnlyNote`s from the same `NoteData`.

**Why keep the model updated on every keystroke instead of reading the textarea when you save?**
Both work. Updating on keystroke keeps the ordering explicit: `Note.onInput` copies the
textarea into the model and *then* calls the page's save handler, in one listener, so a
save can never serialize a model that is one character behind. It also means
`WriterApp.save()` is a plain lookup rather than a gather-and-convert step.

**Why not call `JSON.stringify` on a `Note` directly?**
A `Note` holds references to DOM elements, which contain circular references back to
their parents. `JSON.stringify` cannot meaningfully serialize those and may throw. The
`NoteData` a `Note` wraps holds nothing but two primitives, which is what makes it safe.

**Where does the id for a new note come from?**
`NoteData.nextId(notes)` — one past the largest id currently in use, computed from the
notes on screen at the moment you click Add. No counter is stored anywhere, so no counter
can get out of step with the data after a reload.

**When exactly does it save?**
On every keystroke (`Note.onInput` → `WriterApp.save`), when a note is added, and when a
note is removed. Never on a timer.

**How does the reader update without a refresh?**
`NoteStore.onExternalChange()` listens for the browser's `storage` event, which fires in
every *other* tab of the same origin when `localStorage` changes. The reader responds by
calling `refresh()`, which re-reads storage and rebuilds the list. The event never fires
in the tab that did the writing, so the writer cannot trigger itself into a loop. Both
tabs must be open at the same time to see it.

**Why does `removeNote` compare with `!==` instead of matching ids?**
`!==` on two objects compares identity. The `Note` hands itself to the handler through
`onRemove(() => handler(this))`, so the exact object is already in hand — no lookup
needed, and two notes with identical text are still correctly distinguished.

**What stops a removed note's text from lingering in storage?**
`removeNote()` calls `save()` immediately after filtering the note out of the array.
`save()` serializes the current models, which no longer include it, so the text is gone
from `localStorage` on that same click.

**What happens if someone corrupts the stored JSON by hand?**
Three layers catch it. `JSON.parse` throwing is caught and returns `[]`. Valid JSON that
is not an array returns `[]`. And inside a genuine array, every entry goes through
`NoteData.fromJSON`, which drops anything without a usable integer id and repairs a
missing `text` to `""`. The page degrades to showing whatever notes were still valid, or
"There are no notes yet."

**Why is there a `PageApp` class?**
Because the writer and the reader were the same page with different middles, and that
sameness was previously copy-pasted: two headings, two Back buttons, two status mounts,
two `INDEX_URL` constants. `PageApp.start()` now fixes the shared order and calls
`buildContent()`, which is the only method either subclass writes.

**What is a template method?**
A method on a base class that defines the sequence of steps and delegates one or more of
them to the subclass. `PageApp.start()` is one: it always builds status → heading → note
list → `buildContent()` → Back button, and only `buildContent()` differs between pages.

**Why doesn't `IndexApp` extend `PageApp` too?**
It has no notes, no store, no status label and no Back button. It would inherit five
things it must ignore. Inheritance is for classes that genuinely share a shape — forcing
it here would mean weakening `PageApp` to accommodate a page that is not like the others.

**Why do four classes extend `Widget`?**
`AppButton`, `Note`, `ReadOnlyNote` and `StatusLabel` each own exactly one element and
each need `mount()` and `remove()`. Written once in `Widget`, those methods cannot drift
apart between classes — and `ReaderApp.refresh()` can call `remove()` on whatever is in
its array without caring which class it holds.

**Why aren't the fields private with `#`?**
A `#` private field is not visible to subclasses in JavaScript. `Widget` and `PageApp` both
rely on subclasses using their fields — `Note` appends to `this.element`, `WriterApp`
reads `this.store` and `this.notes` — so making those private would break the
inheritance. The design trades enforced privacy for a shared base class.
