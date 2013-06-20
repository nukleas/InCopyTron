InCopyTron.Plugins.Metadata = {
    priority: 1,
    output_to_treeview: function (metadata, tree_object) {
        "use strict";
        var property, tree_name;
        for (property in metadata) {
            if (metadata.hasOwnProperty(property)) {
                if (property.toString().match("Subitem") === null) {
                    tree_name = tree_object.add("node", metadata[property]);
                    tree_name.add("item", metadata[property].value);
                }
            }
        }
    },
    output_to_listbox: function (metadata, listbox_object) {
        "use strict";
        var property, meta_name;
        for (property in metadata) {
            if (metadata.hasOwnProperty(property)) {
                if (property.toString().match("Subitem") === null) {
                    meta_name = listbox_object.add("item", metadata[property].name);
                    meta_name.subItems[0].text = metadata[property].value;
                }
            }
        }
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var metadata_tab = mainGUI.add("tab", undefined, "Metadata"),
            metadata_panel = metadata_tab.add("panel", undefined, "Metadata"),
            error_checking_panel = metadata_tab.add("panel", undefined, "Errors"),
            error_checking_box = error_checking_panel.add("listbox", undefined, "", {
                name: "error_listbox",
                numberOfColumns: 4,
                showHeaders: true,
                columnTitles: ["Page", "Line", "Text", "Message"],
                columnWidths: [40, 25, 90, 200]
            });
        metadata_tab.alignChildren = "left";
        metadata_tab.orientation = "row";
        metadata_panel.alignChildren = "fill";
        //Begin building metadata viewing panel
        metadata_panel.meta_view = metadata_panel.add("listbox", undefined, "Metadata", {
            numberOfColumns: 2,
            showHeaders: true,
            columnTitles: ["Name", "Value"],
            columnWidths: [100, 400]
        });
        metadata_panel.meta_view.preferredSize.width = 500;
        metadata_panel.meta_view.preferredSize.height = 300;
        //End building metadata viewing panel
        metadata_panel.output_field = metadata_panel.add("edittext", undefined, "");
        metadata_panel.output_field.minimumSize.width = 500;
        metadata_panel.meta_view.onChange = function () {
            try {
                metadata_panel.output_field.text = metadata_panel.meta_view.selection.subItems[0];
            } catch (error) {}
        };
        error_checking_box.preferredSize.width = 400;
        error_checking_box.preferredSize.height = 300;
        if (successful_pull === true) {
            InCopyTron.Plugins.Metadata.output_to_listbox(InCopyTron.General_Functions.sort_object_properties(InCopyTron.Metadata.metadata_object), metadata_panel.meta_view);
        }
    }
};