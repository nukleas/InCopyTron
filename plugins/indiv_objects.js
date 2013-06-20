InCopyTron.Plugins.Objects = {
    pull_all_objects_from_server: function () {
        "use strict";
        var server = app.activeDocument.k4GetObjects(),
            object_metadata = {},
            pulled_data = [],
            it,
            object,
            item,
            parsed_data,
            full_object;
        for (it = 0; it < server.length; it += 1) {
            object = server[it].k4GetServerData();
            object_metadata[it] = object;
        }
        for (item in object_metadata) {
            if (object_metadata.hasOwnProperty(item) && object_metadata[item].hasOwnProperty('k4MetaDataValues')) {
                parsed_data = InCopyTron.Metadata.build_object_from_metadata(object_metadata[item].k4MetaDataValues);
                full_object = {
                    metadata: parsed_data,
                    server_object: object_metadata[item]
                };
                pulled_data.push(full_object);
            }
        }
        return pulled_data;
    },
    pull_object_from_server: function (object) {
        "use strict";
        var server_data = object.k4GetServerData();
        if (server_data !== undefined) {
            return server_data;
        }
    },
    compile_metadata_for_object: function (object) {
        "use strict";
        var full_object, parsed_data;
        if (object !== null && object.hasOwnProperty('k4MetaDataValues')) {
            parsed_data = InCopyTron.Metadata.build_object_from_metadata(object.k4MetaDataValues);
            full_object = {
                metadata: parsed_data,
                server_object: object
            };
            return full_object;
        }
    },
    output_object_to_listbox: function (object, listbox) {
        "use strict";
        var item;
        if (object !== undefined && listbox !== undefined) {
            item = listbox.add("item", object.server_object.k4Name);
            item.subItems[0].text = object.server_object.k4WfName;
            if (object.metadata['Story Labels'] !== undefined) {
                item.subItems[1].text = object.metadata['Story Labels'].value;
            }
        }
    },
    output_metadata_to_listbox: function (metadata, listbox_object) {
        "use strict";
        var property, meta_name;
        listbox_object.removeAll();
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
        var objects_panel, objects_tab, it, pulled_objects, object, l;
        objects_tab = mainGUI.add("tab", void 0, "Objects");
        objects_panel = objects_tab.add("panel", void 0, "Objects");
        objects_tab.object_metadata_panel = objects_tab.add("panel", undefined, "Metadata");
        objects_tab.object_metadata_panel.object_metadata_box = objects_tab.object_metadata_panel.add("listbox", undefined, "Metadata", {
            numberOfColumns: 2,
            showHeaders: true,
            columnTitles: ["Name", "Value"],
            columnWidths: [100, 200]
        });
        objects_tab.alignChildren = "left";
        objects_tab.orientation = "row";
        objects_panel.alignChildren = "fill";
        //Begin building metadata viewing panel
        objects_panel.objects_view = objects_panel.add("listbox", undefined, "Objects", {
            numberOfColumns: 3,
            showHeaders: true,
            columnTitles: ["Name", "Type", "Label"],
            columnWidths: [50, 100, 100]
        });
        objects_panel.objects_view.preferredSize.width = 300;
        objects_panel.objects_view.preferredSize.height = 280;
        //End building metadata viewing panel
        objects_tab.object_metadata_panel.object_metadata_box.preferredSize.width = 500;
        objects_tab.object_metadata_panel.object_metadata_box.preferredSize.height = 330;
        objects_panel.pull_objects = objects_panel.add("button", undefined, "Pull Objects");
        objects_panel.pull_objects.onClick = function () {
            this.parent.objects_view.removeAll(); // Clear the listbox so it doesn't get crowded and the indexing works
            InCopyTron.Plugins.Objects.Pulled_Objects = app.activeDocument.k4GetObjects();
            pulled_objects = InCopyTron.Plugins.Objects.Pulled_Objects;
            InCopyTron.Plugins.Objects.Objects = [];
            for (it = 0, l = pulled_objects.length; it < l; it += 1) {
                object = InCopyTron.Plugins.Objects.pull_object_from_server(pulled_objects[it]);
                object = InCopyTron.Plugins.Objects.compile_metadata_for_object(object);
                InCopyTron.Plugins.Objects.output_object_to_listbox(object, this.parent.objects_view);
                InCopyTron.Plugins.Objects.Objects.push(object);
            }
        };
        objects_panel.pull_subarticles = objects_panel.add("button", undefined, "Pull Sub-articles");
        objects_panel.pull_subarticles.onClick = function () {
            this.parent.objects_view.removeAll(); // Clear the listbox so it doesn't get crowded and the indexing works
            InCopyTron.Plugins.Objects.Pulled_Objects = app.activeDocument.k4GetObjects();
            pulled_objects = InCopyTron.Plugins.Objects.Pulled_Objects;
            InCopyTron.Plugins.Objects.Objects = [];
            for (it = 0, l = pulled_objects.length; it < l; it += 1) {
                if (pulled_objects[it].k4ObjectLabel === 'Sub-article') {
                    object = InCopyTron.Plugins.Objects.pull_object_from_server(pulled_objects[it]);
                    object = InCopyTron.Plugins.Objects.compile_metadata_for_object(object);
                    InCopyTron.Plugins.Objects.output_object_to_listbox(object, this.parent.objects_view);
                    InCopyTron.Plugins.Objects.Objects.push(object);
                }
            }
        };
        objects_panel.objects_view.onDoubleClick = function () {
            var metadata_listbox, selected_object, selected_text;
            selected_text = this.selection;
            metadata_listbox = this.parent.parent.object_metadata_panel.object_metadata_box;
            selected_object = InCopyTron.Plugins.Objects.Objects[selected_text.index];
            InCopyTron.Plugins.Objects.output_metadata_to_listbox(selected_object.metadata, metadata_listbox);
        };
    }
};