/*global InCopyTron, app*/
InCopyTron.Plugins.CENsorSuite.Tests.Hyperlinks = {
    run: function () {
        "use strict";
        var output,
            number_of_hyperlinks = app.activeDocument.hyperlinks.length,
            number_of_hyperlink_destinations = app.activeDocument.hyperlinkURLDestinations.length,
            number_of_hyperlink_sources = app.activeDocument.hyperlinkTextSources.length;
        if (number_of_hyperlinks !== number_of_hyperlink_destinations || number_of_hyperlink_destinations !== number_of_hyperlink_sources) {
            output = new InCopyTron.Plugins.CENsorSuite.ErrorMessage("Hyperlinks","H","Hyperlinks","Hyperlink Source/Dest/Objects might be broken");
            /*
            output.push({
                page: "Hyperlinks",
                line_number: "H",
                line: "Hyperlinks",
                message: "Hyperlink Source/Dest/Objects might be broken"
            });
            */
        }
        if (output) {
            return output;
        }
        // Well, something broke
        return false;
    }
};