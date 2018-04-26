/*global InCopyTron*/
InCopyTron.Plugins.Keywords = {
    parse: function (metadata) {
        "use strict";
        /*
            This function parses the keywords along the '~'s.
            It then returns an array with all of them, or a blank array otherwise.

        */
        if (metadata.Keywords !== undefined) {
            var keywords = metadata.Keywords.value;
            keywords = keywords.split("~");
            return keywords;
        }
        return [];
    },
    output_to_treeview: function (metadata, tree_object) {
        "use strict";
        var i, tree_name, parsed_KW = InCopyTron.Plugins.Keywords.parse(metadata);
        for (i = 0; i < parsed_KW.length; i += 1) {
            tree_name = tree_object.add("node", parsed_KW[i]);
        }
    },
    output_to_listbox: function (metadata, listbox_object) {
        "use strict";
        var i, parsed_KW = InCopyTron.Plugins.Keywords.parse(metadata);
        for (i = 0; i < parsed_KW.length; i += 1) {
            listbox_object.add("item", parsed_KW[i]);
        }
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var keyword_related_tab = mainGUI.add("tab", undefined, "Keywords/RD"),
            keyword_panel = keyword_related_tab.add("panel", undefined, "Keywords"),
            keyword_listbox = keyword_panel.add("listbox", undefined, "Keywords", {
                numberOfColumns: 1,
                showHeaders: true,
                columnTitles: ["Keywords"],
                columnWidths: [200]
            });
        keyword_related_tab.alignChildren = "top";
        keyword_related_tab.orientation = "row";
        keyword_listbox.preferredSize = [200, 320];
        if (successful_pull === true) {
            InCopyTron.Plugins.Keywords.output_to_listbox(InCopyTron.Metadata.metadata_object, keyword_listbox);
        }
    }
};

InCopyTron.Plugins.Related_Documents = {
    parse: function (metadata) {
        "use strict";
        if (metadata["Related Documents"] !== undefined && metadata["Related Documents"].hasOwnProperty('value')) {
            var related_documents = metadata["Related Documents"].value,
                parsed_related_documents = {},
                i = 0;
            related_documents = related_documents.split("~");
            for (i = 0; i < related_documents.length; i += 1) {
                related_documents[i] = related_documents[i].split("|");
            }
            for (i = 0; i < related_documents.length; i += 1) {
                parsed_related_documents[i] = {
                    article_title: related_documents[i][1],
                    URL: related_documents[i][2]
                };
            }
            return parsed_related_documents;
        }
    },
    output_to_treeview: function (metadata, tree_object) {
        "use strict";
        var parsed_RD = InCopyTron.Plugins.Related_Documents.parse(metadata), item, tree_name;
        if (parsed_RD !== undefined) {
            for (item in parsed_RD) {
                if (parsed_RD.hasOwnProperty(item)) {
                    tree_name = tree_object.add("node", parsed_RD[item].article_title);
                    tree_name.add("item", parsed_RD[item].URL);
                }
            }
        }
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var i, tab, related_doc_panel, related_doc_tree;
        for (i = 0; i < mainGUI.children.length; i += 1) {
            if (mainGUI.children[i].text === "Keywords/RD") {
                tab = mainGUI.children[i];
                break;
            }
        }
        //If we didn't find a previous tab, create one
        //NOTE: Probably a cool function to make later, like "If exists, add to or else create"
        if (tab === undefined) {
            tab = mainGUI.add("tab", undefined, "Keywords/RD");
        }
        related_doc_panel = tab.add("panel", undefined, "Related Documents");
        related_doc_panel.add("statictext", undefined, "Double-click Related Document URL to open in browser");
        related_doc_tree = related_doc_panel.add("treeview", undefined, "RD");
        related_doc_tree.preferredSize = [500, 300];
        if (successful_pull === true) {
            InCopyTron.Plugins.Related_Documents.output_to_treeview(InCopyTron.Metadata.metadata_object, related_doc_tree);
        }
        related_doc_tree.addEventListener("click", function (event) {
            if (event.detail === 2 /*if double-click*/ && this.selection.type === "item") {
                InCopyTron.General_Functions.open_URL_in_browser(this.selection.toString());
            }
        }
            );


    }
};