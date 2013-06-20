// InCopyTron
// A document analysis tool to help blur the lines between InCopy and K4.
// By Nader Heidari
//

#targetengine InCopyTron;
#strict on;
#include ./includes/incopytron_core.js;
#include ./includes/debug.js;

/*
    NOTE:
    For the testing purposes of this current prototype,
    Metadata is automatically pulled from K4 until I write button code for the main plugin.
    So if this breaks from not being logged in to K4, don't freak out
*/

InCopyTron.Debug.active = false; // Use example metadata if set to true

var successful_pull = InCopyTron.Metadata.get_data_from_server(app.activeDocument.k4Articles[0]) || false;

if (successful_pull === true) {
    // Because otherwise we'll start trying to work with the metadata... which isn't there.
    InCopyTron.Metadata.metadata_object = InCopyTron.Metadata.build_object_from_metadata(InCopyTron.Metadata.server_data.k4MetaDataValues, app.k4Publications[0].k4MetaDataDefs);
}

if (InCopyTron.Debug.active === true) {
    /*
        InCopyTron Debug Mode uses a sample main article metadata object.
        Great for offline use.
    */
    InCopyTron.Debug.load_debug_metadata();
    successful_pull = true;
}

if (!InCopyTron.GUI.Window) {
    InCopyTron.GUI.Window = InCopyTron.GUI.main();
}

if (!InCopyTron.GUI.Window.visible) {
    if (app.documents.length === 0) {
        alert("No documents are open.  Please open a document and try again.");
    // Well, what did you expect?
        exit();
    }
    InCopyTron.Core.pull_files_from_folder('plugins', 'js');
    InCopyTron.Core.load_plugins();
    InCopyTron.GUI.Window.show();
} else {
    InCopyTron.GUI.Window.show();
}

InCopyTron.GUI.Window.onDeactivate = function () {
    "use strict";
    /*
        This function stores the active tab to use in the bugfix for Adobe's CS5 tabbed panel bug.
        Better than the alternative, which was going back to the first tab.
    */
    try {
        if (InCopyTron.GUI.Window) {
            InCopyTron.GUI.active_tab = InCopyTron.GUI.Window.children[0].selection;
        }
    } catch (error) {
        $.writeln(error);
        }
};

InCopyTron.GUI.Window.onActivate = function () {
    "use strict";
    /* Why is this function here?
    Oh, because Adobe is too cool to fix a known bug for CS5, instead fixing it for CS5.5 and above.
    So this workaround makes it so you can use tabbed panels without them breaking when another dialog appears.
    */
        if (InCopyTron.GUI.Window.children && InCopyTron.GUI.active_tab){
            try {
                InCopyTron.GUI.Window.children[0].selection = InCopyTron.GUI.active_tab;
                } catch (error) {
                    $.writeln(error);
                    }
        }
};

var breakpoint = "Arbitrary";
