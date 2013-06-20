/*global InCopyTron, app, NothingEnum*/
/*
    Notable Quotables
    an InCopyTron plugin
*/

InCopyTron.Plugins.NotableQuotables = {
    generateGUI: function (mainGUI) {
        "use strict";
        var note_copybox, note_listbox, quote_copybox, note_panel, quote_listbox, quote_panel, quote_tab;
        quote_tab = mainGUI.add("tab", undefined, "NotableQuotables");
        quote_panel = quote_tab.add("panel", undefined, "Quotes");
        quote_listbox = quote_panel.add("listbox", undefined, "Quotes", {name: "quote_listbox"});
        note_panel = quote_tab.add("panel", undefined, "Notes");
        note_listbox = note_panel.add("listbox", undefined, "Notes");
        note_copybox = note_panel.add("edittext", undefined, "");
        note_listbox.onChange = function () {
            if (note_listbox.selection) {
                note_copybox.text = note_listbox.selection;
            }
        };
        quote_copybox = quote_panel.add("edittext", undefined, "");
        quote_listbox.onChange = function () {
            if (quote_listbox.selection) {
                quote_copybox.text = quote_listbox.selection;
            }
        };
        quote_listbox.onDoubleClick = function () {
            var i,
                quotes = InCopyTron.Plugins.NotableQuotables.quotes;
            if (quote_listbox.selection) {
                for (i = 0; i < quotes.length; i += 1) {
                    if (quote_listbox.selection.text === quotes[i].contents) {
                        quotes[i].select();
                        quotes[i].showText();
                    }
                }
            }
        };
        this.quotes = this.pull_quotes_from_active_document();
        this.notes = this.pull_notes_from_active_document();
        this.output_to_listbox(quote_listbox, this.quotes);
        this.output_to_listbox(note_listbox, this.notes);
        note_listbox.preferredSize.height = 100;
        note_listbox.preferredSize.width = 900;
        note_copybox.preferredSize.width = 900;
        note_listbox.maximumSize.height = 100;
        note_listbox.maximumSize.width = 900;
        quote_listbox.preferredSize.height = 200;
        quote_listbox.preferredSize.width = 900;
        quote_listbox.maximumSize.height = 200;
        quote_listbox.maximumSize.width = 900;
        quote_copybox.preferredSize.width = 900;
    },
    pull_quotes_from_active_document: function () {
        "use strict";
        var found_text_objects, i = 0,
            quotes = [];
        app.findGrepPreferences = NothingEnum.nothing;
        // Alright, first, we're going to use a grep search to find everything inside quotes.
        app.findGrepPreferences.properties = {
            findWhat: '~{.*?~}'
        };
        app.findChangeGrepOptions.properties = {
            includeFootnotes: false,
            includeMasterPages: true,
            includeHiddenLayers: true,
            wholeWord: true,
            // The following are here to dig through locked layers even if you're in preview/read-only mode
            includeLockedStoriesForFind: true,
            includeLockedLayersForFind: true
            //
        };
        found_text_objects = app.activeDocument.findGrep();
        // Since this search pulls the text objects, we need to pull their text content from them.
        for (i = 0; i < found_text_objects.length; i += 1) {
            quotes.push(found_text_objects[i]);
        }
        app.findGrepPreferences = NothingEnum.nothing;
        // Because we often link quotes and don't hide notes, they usually get double-picked up. I thought we might as well only work with unique quotes.
        // NOTE: Found how to distinguish between notes and non-notes quite a bit after this code was written.
        // I think we should still focus on unique quotes anyway.
        return quotes;
    },
    output_to_listbox: function (listbox_object, list_to_add) {
        "use strict";
        var i, item;
        for (i = 0; i < list_to_add.length; i += 1) {
            item = listbox_object.add("item", list_to_add[i]);
            if (list_to_add[i].hasOwnProperty('contents')) {
                item.text = list_to_add[i].contents;
            }
        }
    },
    pull_notes_from_active_document: function () {
        "use strict";
        var stories = app.activeDocument.stories,
            note_list = [],
            i,
            note;
        for (i = 0; i < stories.length; i += 1) {
            if (stories[i].notes.length > 0) {
                for (note = 0; note < stories[i].notes.length; note += 1) {
                    note_list = note_list.concat(stories[i].notes[note].texts[0].contents);
                }
            }
        }
        return note_list;
    }
};