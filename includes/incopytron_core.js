/*global app, alert, Folder, File, ScriptLanguage, Window, LocationOptions*/
var InCopyTron = {
    Core: {
        pull_files_from_folder: function(folder_name, file_type) {
            "use strict";
            /* Loads javascript files in the specified folder */
            var file_list = [],
                scriptFolder,
                i;
            scriptFolder = InCopyTron.General_Functions.getScriptPath();
            scriptFolder = new Folder(
                scriptFolder.parent + "/" + folder_name + "/"
            );
            file_list = scriptFolder.getFiles();
            for (i = 0; i < file_list.length; i += 1) {
                // Checks the filetype before loading
                if (
                    file_list[i].name.split(".")[
                        file_list[i].name.split(".").length - 1
                    ] === file_type
                ) {
                    app.doScript(file_list[i]);
                }
            }
        },
        load_plugins: function() {
            "use strict";
            var plugin,
                loading_array = [],
                i;
            /* This function does exactly what it says on the tin:
            Loads plugins from within the InCopyTron object.
            */
            for (plugin in InCopyTron.Plugins) {
                if (InCopyTron.Plugins.hasOwnProperty(plugin)) {
                    if (
                        InCopyTron.Plugins[plugin].hasOwnProperty("priority") &&
                        InCopyTron.Plugins[plugin].priority === 1
                    ) {
                        loading_array.unshift(InCopyTron.Plugins[plugin]);
                    } else {
                        loading_array.push(InCopyTron.Plugins[plugin]);
                    }
                }
            }
            for (i = 0; i < loading_array.length; i += 1) {
                loading_array[i].generateGUI(InCopyTron.GUI.Window.children[0]);
            }
        }
    },
    General_Functions: {
        getScriptPath: function() {
            "use strict";
            /* Returns current script path, second half is needed if run in ExtendScript */
            try {
                return app.activeScript;
            } catch (myError) {
                return new Folder(myError.fileName).parent;
            }
        },
        getByProperty: function(object, property_name, property_value) {
            /* Returns an object's property if it meets a certain value.
            For example, you could use it to pull informaton from a set of objects
            by the name of a property such as "name" or "value"
            */
            "use strict";
            var i, len;
            for (i = 0, len = object.length; i < len; i += 1) {
                if (object[i][property_name] === property_value) {
                    return object[i];
                }
            }
        },
        sort_object_properties: function(object) {
            "use strict";
            // Fun fact. Did you know JavaScript doesn't natively sort object properties?
            // I mean seriously, is it so hard?
            // I guess not, cause the following code does it for you.
            // Alphabetically, of course.
            var keys = [],
                new_object = {},
                property,
                i,
                k;
            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    keys.push(property);
                }
            }
            keys.sort();
            for (i = 0; i < keys.length; i += 1) {
                k = keys[i];
                new_object[k] = object[k];
            }
            return new_object;
        },
        open_URL_in_browser: function(URL) {
            "use strict";
            var vbscript =
                'dim objShell\rset objShell = CreateObject("Shell.Application")\rstr = "' +
                URL +
                '"\robjShell.ShellExecute str, "", "", "open", 1 ';
            app.doScript(vbscript, ScriptLanguage.VISUAL_BASIC);
        }
    },
    Plugins: {},
    GUI: {
        main: function() {
            "use strict";
            var incopytronGUI = new Window("window", "InCopyTron", undefined, {
                    name: "InCopyTron",
                    closeButton: true
                }),
                tpanel = incopytronGUI.add("tabbedpanel");
            incopytronGUI.alignChildren = "right";
            tpanel.name = "InCopyTron_tabPanel";
            tpanel.alignChildren = ["fill", "fill"];
            tpanel.preferredSize = [900, 330];
            return incopytronGUI;
        }
    },
    Metadata: {
        get_data_from_server: function(k4_item) {
            "use strict";
            if (k4_item.isValid) {
                InCopyTron.Metadata.server_data = k4_item.k4GetServerData();
            }
            if (!InCopyTron.Metadata.server_data) {
                alert("Server data pull failed. Are you logged into K4?");
                return false;
            }
            return true;
        },
        build_object_from_metadata: function(server_metadata) {
            "use strict";
            var metadata_object,
                output = {},
                i;
            if (server_metadata !== undefined) {
                for (i = 0; i < server_metadata.length; i += 1) {
                    metadata_object = InCopyTron.Metadata.determine_type_return_metadata_object(
                        server_metadata[i],
                        app.k4Publications[0].k4MetaDataDefs
                    );
                    if (metadata_object) {
                        output[metadata_object.name] = metadata_object;
                    }
                }
                return output;
            }
            alert("Fail!");
            return false;
        },
        determine_type_return_metadata_object: function(
            k4Metadata_Object,
            k4Definitions
        ) {
            "use strict";
            var metadata_result,
                val_list_def,
                pulled_item,
                string_def,
                int_def,
                int_value;
            switch (k4Metadata_Object.k4MetaDataType.toString()) {
                case "K4_STRING":
                    string_def = InCopyTron.General_Functions.getByProperty(
                        k4Definitions,
                        "k4Id",
                        k4Metadata_Object.k4MetaDataDefId
                    );
                    try {
                        metadata_result = {
                            name: string_def.k4Name,
                            value: k4Metadata_Object.k4StringValue
                        };
                    } catch (e) {}
                    return metadata_result;
                case "K4_VALUE_LIST":
                    if (
                        k4Metadata_Object.k4ValueListValue !== "30467" &&
                        k4Metadata_Object.k4ValueListValue !== "0"
                    ) {
                        val_list_def = InCopyTron.General_Functions.getByProperty(
                            k4Definitions,
                            "k4Id",
                            k4Metadata_Object.k4MetaDataDefId
                        );
                        pulled_item = InCopyTron.General_Functions.getByProperty(
                            val_list_def.k4MetaDataDefValueLists,
                            "k4Id",
                            k4Metadata_Object.k4ValueListValue
                        );
                        metadata_result = {
                            name: val_list_def.k4Name,
                            value: pulled_item ? pulled_item.k4Name : ""
                        };

                        return metadata_result;
                    }
                    metadata_result = {
                        name: InCopyTron.General_Functions.getByProperty(
                            k4Definitions,
                            "k4Id",
                            k4Metadata_Object.k4MetaDataDefId
                        ).k4Name,
                        value: ""
                    };

                    return metadata_result;
                case "K4_INTEGER":
                    int_def = InCopyTron.General_Functions.getByProperty(
                        k4Definitions,
                        "k4Id",
                        k4Metadata_Object.k4MetaDataDefId
                    );

                    metadata_result = {
                        name: int_def.k4Name,
                        value: k4Metadata_Object.k4IntValue
                    };
                    return metadata_result;
            }
        }
    },
    Hyperlinking: {
        insertNoteAfter: function(container, selectionPoint, comment) {
            "use strict";
            var justInserted = container.notes.add(
                LocationOptions.AFTER,
                selectionPoint
            ).id;
            container.notes.itemByID(justInserted).texts[0].contents = comment;
        },
        makeHyperlinkDestination: function(URL) {
            //If the hyperlink destination already exists, use it;
            //if it doesn't, then create it.
            "use strict";
            var myHyperlinkDestination;
            if (
                app.activeDocument.hyperlinkURLDestinations.item(URL).isValid &&
                app.activeDocument.hyperlinkURLDestinations.item(URL).name
            ) {
                return myHyperlinkDestination;
            }
            myHyperlinkDestination = app.activeDocument.hyperlinkURLDestinations.add(
                URL,
                { hidden: true, name: Math.random().toString() }
            );
            myHyperlinkDestination.name = URL;
            return myHyperlinkDestination;
        },
        makeHyperlink: function(target, URL) {
            "use strict";
            var hyperlinkTextSource,
                i,
                hyperlinkSources = app.activeDocument.hyperlinkTextSources,
                hyperlink;
            for (i = 0; i < hyperlinkSources.length; i += 1) {
                if (hyperlinkSources[i].sourceText === target) {
                    return hyperlinkSources[i];
                }
            }
            hyperlinkTextSource = app.activeDocument.hyperlinkTextSources.add(
                target
            );
            hyperlink = app.activeDocument.hyperlinks.add(
                hyperlinkTextSource,
                this.makeHyperlinkDestination(URL),
                { hidden: false, name: target.contents }
            );
            hyperlink.visible = false;
            this.insertNoteAfter(
                hyperlinkTextSource.sourceText,
                hyperlinkTextSource.sourceText.insertionPoints.item(0),
                URL
            );
        }
    }
};
Array.prototype.getUnique = function() {
    "use strict";
    var u = {},
        a = [],
        i = 0,
        l = this.length;
    for (i = 0, l; i < l; i += 1) {
        if (u.hasOwnProperty(this[i]) === false) {
            a.push(this[i]);
            u[this[i]] = 1;
        }
    }
    return a;
};
