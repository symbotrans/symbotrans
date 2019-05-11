symbol translator (symbotrans)
==============================

symbotrans is a web application (HTML5, CSS, JavaScript) to convert
between symbols of multiple defined systems. A system can have multiple
variations.

Basically, systems and symbols and relation between these symbols
and systems have to be defined in a translation table text file. The
relation can be a n:m relation, meaning that it might be possible
that one symbol can be translated into one or multiple symbols and a
resulting symbol can have on or more "origin" symbols.

This application was developed having translations between multiple
phonetic transcription systems used in the danish language in mind.

Get operational
===============

To use symbotrans you'll have to provide a proper **`data/`** directory
(the directory provided is just an example).

More precisely, you might need to adapt **`config.js`**.

Then you'll have to create a **translation table file** (named as
defined in `config.js`). The translation table file needs to be a UTF-8
coded CSV-file. The translation table can contain comment-lines that
begin with `#` and will be ignored on processing. Each other line will
be regarded as a system of symbols to translate from or to. A system
needs a unique name. This name is formed by the first two fields of the
line (the *base system*) and the fourth field that contains possible
*variations* of the base system. The variation field contains nothing or
a comma-seperated list (encapsulated by quote-marks `"`) of *variation
names* with a *switch-keyword* that indicates if the variation is
active/on or inactive/off (switch-keywords are defined in `config.js`).
The third field contains nothing or a *font name* that might be relevant
for proper presentation of certain symbols. Beginning with the fifth
field symbols can be defined. Each of these fields contains a "symbol"
even if it contains more than one character.

Let's have a look at an example:

    A,B,,"with c after b,with irrelevant variation",a,b,c,ab,bc,bc,b
    A,B,,"without c after b,with irrelevant variation",a,b,c,ab,b,b,b

The information taken from these lines is: We have a base system called
"AB" which has two variants. If the variation switch-keybords are "with"
for on/active and "without" for off/inactive (which makes sense in this
case, but has to be defined in `config.js`) then we have two variation
names: "c after b" and "irrelevant variation". Both systems don't need a
special font for displaying the symbols.

It is important that all systems have the same amount of symbols to
translate.

When the translation table gets large, you might want to provide an
individual **layout file** for a base system for the keyboard or picker
the user can use to write the "word" to translate. If no layout file is
present, all symbols (without duplicates) defined in the translation
table will be used. A layout file is a UTF-8 coded CSV-file that
contains all symbols in the same order in which they should be presented
as a keyboard. (Note that lines beginning with `#` are considered to be
comment lines and ignored on processing.) A layout file has to be named
after the base system it should be used for.

For example, for above translation table lines we can have a layout file
called `AB.csv` (for the base system "AB") with

    a,b
    c

which will result in a "keyboard" with two buttons (labelled "a" and
"b") on the first row and a third button (labelled "c") on the second
row.

If you need special **fonts**, you'll have to define them in
`data/fonts/fonts.css` and can place font files in `data/fonts/`.
Note, that you name your font as you named it in the translation table
file.

You can find some data sets that are known to
work with symbotrans in the [symbotrans_data
repository](https://github.com/abelbabel/symbotrans_data).


Structure and operation of the application
==========================================

JavaScript-files and CSS-files are located in `lib/`. Data that are
related to a specific instance of symbotrans are located in `data/`.
On the top-level of the project there is `index.html` which provides
the interface to the application.

    data/
      config.js
    index.html
    lib/
      converter.js
      htmlinteraction.js
      style.css

The main work is done by **JavaScript**-scripts. **`converter.js`**
holds data structures and functions that provide the core functionality,
forming all possible parts of an input and translate all of these
parts if possible. For example, from an input of `abc` all possible
divisions in parts `a b c`, `a bc`, `ab c` and `abc` are computed and
the application tries to translate each of these possibilities and each
of it parts to create possible solutions. After translation possible
solutions can be filtered. The core functions are called `getParts()`
and `translateParts()`.

In order to perform translations the application gets needed information
from text files (as mentioned above). It registers all base system
names, all variation names, for each system (name built with base system
name and a code that indicates the use of variations) a set of symbols
for the translation process will be created and a set of symbols to be
displayed as a "picker"/"keybord". These operations are done by several
"init" functions (e.g. `init_tab()`).

For input and output and presentation there is a HTML-file
called `index.html` which embeds all needed JavaScript-files and
CSS-files. `index.html` only contains a very basic set of elements.
**`htmlinteraction.js`** populates these elements, adds additional
elements if needed and gets and sets the state of the HTML-interface:
it gathers information about the selected source system, the input
"word" and the selected output system, passes this information to
converter-functions and presents the computed values at the HTML-page.

Any project that wants to use the converter, but wants to provide
another interface will likely must use **`converter.js`** but
can dismiss or heavily change the HTML-page, CSS-styles and
`htmlinteraction.js`.

Some variables are "out-sourced" into the `data/` directory in the
**`config.js`** file. This way, each "installation" of symbotrans with a
different set of translation table and layout files can provide its own
configuration file. Variables are named, so that they explain their use
or they have a comment to explain their use.


