/*global InCopyTron */
InCopyTron.Plugins.CENsorSuite.Tests.check_for_keywords = {
    /* This simple check looks for keywords to be set in the main article of the story. */
    // TODO: Allow this test to distinguish between Collections (Concentrates, etc) that shouldn't have a main set of keywords.
    run: function () {
        "use strict";
        var output;
        if (InCopyTron.Metadata.metadata_object === undefined) {
            return output;
        }
        if (InCopyTron.Metadata.metadata_object.Keywords === undefined || InCopyTron.Metadata.metadata_object.Keywords.value === "") {
            output = [];
            output.push({
                page: "Meta",
                line_number: "M",
                line: "Keywords",
                message: "Keywords are missing."
            });
        }
        if (output) {
            return output;
        }
    }
};