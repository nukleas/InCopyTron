InCopyTron.Plugins.CENsorSuite.Tests.question_marks = {
    /* This test checks for question marks in certain fields. These occur sometimes when copy-pasting from Word or other text editors. */
    run: function () {
        "use strict";
        var output = [];
        if (InCopyTron.Metadata.metadata_object === undefined) {
            return output;
        }
        if (InCopyTron.Metadata.metadata_object.Keywords !== undefined && InCopyTron.Metadata.metadata_object.Keywords.value.search(/\?/) !== -1) {
            output.push({
                page: "Meta",
                line_number: "M",
                line: "Keywords",
                message: "? in keywords."
            });
        }
        if (InCopyTron.Metadata.metadata_object['Related Documents'] !== undefined && InCopyTron.Metadata.metadata_object['Related Documents'].value.search(/\?/) !== -1) {
            output.push({
                page: "Meta",
                line_number: "M",
                line: "Related Docs",
                message: "? in Related Docs."
            });
        }
        if (InCopyTron.Metadata.metadata_object['Web Title'] !== undefined && InCopyTron.Metadata.metadata_object['Web Title'].value.search(/\?/) !== -1) {
            output.push({
                page: "Meta",
                line_number: "M",
                line: "Web Title",
                message: "? in Web Title."
            });
        }
        if (InCopyTron.Metadata.metadata_object['Web Dek'] !== undefined && InCopyTron.Metadata.metadata_object['Web Dek'].value.search(/\?/) !== -1) {
            output.push({
                page: "Meta",
                line_number: "M",
                line: "Web Dek",
                message: "? in Web Dek."
            });
        }
        return output;
    }
};
//TODO: subwebhed/deck