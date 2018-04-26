/*global InCopyTron, File, Folder, app, NothingEnum, Note, $*/
InCopyTron.Plugins.Reference_Engine = {
    openFile: function () {
        "use strict";
        var filePath, open_file;
        filePath = new File(InCopyTron.General_Functions.getScriptPath().parent + "/plugins/GURef.txt");
        if (filePath && filePath.open("r", undefined, undefined)) {
            open_file = new File(filePath);
            open_file.open("r", undefined, undefined);
            return open_file;
        }
        return false;
    },
    getContext: function (text) {
        "use strict";
        var text_object, surrounding_paragraph;
        text_object = this.Refs[text];
        surrounding_paragraph = text_object.paragraphs[0].contents.split(text_object.contents);
        return surrounding_paragraph[0] + "\n\n&" + text_object.contents + "&\n\n" + surrounding_paragraph[1];
    },
    parseFile: function (open_file) {
        "use strict";
        var line, References = {}, ref, reference_buffer;
        do {
            ref = {};
            line = open_file.readln().split('\t');
            if (line.length > 1) {
                if (!References.hasOwnProperty(line[0].replace(',', ''))) {
                    References[line[0].replace(',', '')] = {};
                }
                ref = {
                    page: line[1],
                    title: line[2],
                    url: line[3],
                    hyperlink: line[3]  + "|" + line[2]
                };
                if (!References[line[0].replace(',', '')][ref.page]) {
                    References[line[0].replace(',', '')][ref.page] =  ref;
                } else {
                    if (typeof References[line[0].replace(',', '')][ref.page] === "object") {
                        reference_buffer = References[line[0].replace(',', '')][ref.page];
                        References[line[0].replace(',', '')][ref.page] = [reference_buffer];
                    }
                    References[line[0].replace(',', '')][ref.page].push(ref);
                }
            }
        } while (open_file.eof === false);
        open_file.close();
        return References;
    },
    getScriptPath: function () {
        "use strict"; /* Returns current script path, second half is needed if run in ExtendScript */
        try {
            return new Folder(app.activeScript.parent);
        } catch (myError) {
            return new Folder(myError.fileName).parent;
        }
    },
    load_refs: function () {
        "use strict";
        var file;
        file = this.openFile();
        this.References = this.parseFile(file);
    },
    parseRef_doLookup: function (ref) {
        "use strict";
        var month_day, year, page;
        ref = ref.replace(".", "");
        month_day = ref.match(/\w+ \d+/)[0];
        year = ref.match(/\d\d\d\d/) ?  ref.match(/\d\d\d\d/)[0] : '2013';
        page = ref.match(/(p|page) (\d+)/)[2];
        if (this.References[month_day + " " + year] && this.References[month_day  + " " + year][page]) {
            return this.References[month_day + " " + year][page];
        }
        return false;
    },
    pull_from_active_document: function () {
        "use strict";
        var found_text_objects, i = 0,
            Refs = [];
        app.findGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences.findWhat = 'C&EN, \\S* \\d+,( \\d+, | )\\w+ \\d+';
        app.findChangeGrepOptions.properties = {
            includeFootnotes: true,
            includeMasterPages: true,
            includeHiddenLayers: true,
            wholeWord: true,
            // The following are here to dig through locked layers even if you're in preview/read-only mode
            includeLockedStoriesForFind: true,
            includeLockedLayersForFind: true
            //
        };
        found_text_objects = app.documents[0].findGrep();
        for (i = 0; i < found_text_objects.length; i += 1) {
            if (found_text_objects[i].parent instanceof Note === false) {
                Refs.push(found_text_objects[i]);
            }
        }
        app.findGrepPreferences = NothingEnum.nothing;
        return Refs;
    },
    output_to_listbox: function (listbox_object) {
        "use strict";
        var i, len, pulled_references = this.pull_from_active_document(), Ref_ListBoxItem;
        this.Refs = {};
        len = pulled_references.length;
        for (i = 0; i < len; i += 1) {
            Ref_ListBoxItem = listbox_object.add("item", pulled_references[i]);
            Ref_ListBoxItem.text = pulled_references[i].contents;
            this.Refs[pulled_references[i].contents] = pulled_references[i];
        }
    },
    output_to_infobox: function (reference, infobox) {
        "use strict";
        var i, entry, j;
        if (!reference.length) {
		    reference = [reference];
		}
        for (i = 0; i < reference.length; i += 1) {
            for (j in reference[i]) {
                if (reference[i].hasOwnProperty(j) && typeof reference[i][j] === 'string') {
                    entry = infobox.add("item", j);
                    entry.subItems[0].text = reference[i][j];
                }
            }
        }
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var Ref_Tab = mainGUI.add("tab", undefined, "References"),
            Ref_panel = Ref_Tab.add("panel", undefined, "Refs"),
            Ref_listbox = Ref_panel.add("listbox", undefined, "References", {
                numberOfColumns: 1,
                showHeaders: true,
                columnTitles: ["References"],
                columnWidths: [300]
            }),
            Ref_infoPanel = Ref_Tab.add('panel', undefined, "Reference Information"),
            Ref_infoBox = Ref_infoPanel.add('listbox', undefined, "Reference Data", {
                name: 'Ref_infoBox',
                numberOfColumns: 2,
                showHeaders: true,
                columnTitles: ["Name", "Value"],
                columnWidths: [70, 270]
            }),
            Ref_contextPanel,
            Ref_context_statictext,
            Ref_applyHyperlinkButton,
			Ref_applyHyperlinkButton2;
        this.GUI = Ref_Tab;
        Ref_infoBox.preferredSize = [600, 100];
        Ref_Tab.alignChildren = "top";
        Ref_Tab.orientation = "row";
        Ref_infoPanel.output_field = Ref_infoPanel.add("edittext", undefined, "", {name: 'Ref_edittext'});
        Ref_infoPanel.output_field.minimumSize.width = 600;
        Ref_infoPanel.output_field2 = Ref_infoPanel.add("edittext", undefined, "", {name: 'Ref_edittext2'});
        Ref_infoPanel.output_field2.minimumSize.width = 600;
        Ref_contextPanel = Ref_infoPanel.add("panel", undefined, "Context");
        Ref_context_statictext = Ref_contextPanel.add("statictext", undefined, "Select a reference to see context", {name: "Reference Context", multiline: true});
        Ref_context_statictext.preferredSize = [600, 150];
        Ref_applyHyperlinkButton = Ref_contextPanel.add('button', undefined, "Apply Top Hyperlink");
        Ref_applyHyperlinkButton.onClick = function () {
            InCopyTron.Hyperlinking.makeHyperlink(InCopyTron.Plugins.Reference_Engine.Refs[Ref_listbox.selection], InCopyTron.GUI.Window.findElement('Ref_edittext').text);
            this.enabled = false;
        };
        Ref_applyHyperlinkButton2 = Ref_contextPanel.add('button', undefined, "Apply Bottom Hyperlink");
        Ref_applyHyperlinkButton2.onClick = function () {
            InCopyTron.Hyperlinking.makeHyperlink(InCopyTron.Plugins.Reference_Engine.Refs[Ref_listbox.selection], InCopyTron.GUI.Window.findElement('Ref_edittext2').text);
            this.enabled = false;
        };
        Ref_infoBox.onChange = function () {
            if (this.selection) {
                InCopyTron.GUI.Window.findElement('Ref_edittext').text = this.selection.subItems[0].text;
            }
        };
        Ref_listbox.onChange = function () {
            var ref;
            Ref_applyHyperlinkButton.enabled = false;
            Ref_applyHyperlinkButton2.enabled = false;
            try {
                if (this.selection) {
                    InCopyTron.GUI.Window.findElement('Ref_infoBox').removeAll();
                    ref = InCopyTron.Plugins.Reference_Engine.parseRef_doLookup(this.selection.text);
                    InCopyTron.GUI.Window.findElement("Reference Context").text = InCopyTron.Plugins.Reference_Engine.getContext(this.selection);
                    InCopyTron.GUI.Window.findElement('Ref_edittext').enabled = false;
                    InCopyTron.GUI.Window.findElement('Ref_edittext').text = "";
                    InCopyTron.GUI.Window.findElement('Ref_edittext2').enabled = false;
                    InCopyTron.GUI.Window.findElement('Ref_edittext2').text = "";
                    if (ref) {
                        InCopyTron.Plugins.Reference_Engine.output_to_infobox(ref, InCopyTron.GUI.Window.findElement('Ref_infoBox'));
                        InCopyTron.GUI.Window.findElement('Ref_edittext').text = ref.hyperlink || ref[0].hyperlink;
                        InCopyTron.GUI.Window.findElement('Ref_edittext2').text = ref.hyperlink ? "" : ref[1].hyperlink;
                        InCopyTron.GUI.Window.findElement('Ref_edittext').enabled = true;
                        InCopyTron.GUI.Window.findElement('Ref_edittext2').enabled = ref.hyperlink ? false : true;
                        Ref_applyHyperlinkButton.enabled = true;
                        if (InCopyTron.GUI.Window.findElement('Ref_edittext2').text !== "") {
                            Ref_applyHyperlinkButton2.enabled = true;
                        }
                    }
                }
            } catch (error) {
                $.writeln(error);
            }
        };
        if (InCopyTron.Plugins.Reference_Engine.References !== true) {
            InCopyTron.Plugins.Reference_Engine.load_refs();
        }
        Ref_listbox.preferredSize = [300, 330];
        this.output_to_listbox(Ref_listbox);
        Ref_applyHyperlinkButton.enabled = false;
        Ref_applyHyperlinkButton2.enabled = false;
        Ref_Tab.show();
    }
};