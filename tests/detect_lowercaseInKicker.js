/*global app, InCopyTron, NothingEnum */
InCopyTron.Plugins.CENsorSuite.Tests.lowercase_letter_in_kicker = {
/* This test detects lowercase, all-caps letters in the Kicker.
    These are usually mistakes, because if we wanted the character to be lowercase (for example, iOS) we would have to set it as not all-caps to have it show on page.
    */
    run: function () {
        "use strict";
        var search_results = [],
            output = [],
            i,
            object_to_push = {};
        app.findChangeGrepOptions.properties = {
                includeFootnotes: true,
                includeMasterPages: true,
                includeHiddenLayers: true,
                wholeWord: false
            };
        // Note: Since there are two paragraph styles for kickers, we need to concatenate the searches.
        // Now, I should probably add a check to make sure the paragraph style exists.
        // TODO: Add aforementioned check (does paragraph style exist in current document)
        if (app.activeDocument.paragraphStyles.itemByName("GEN_captionred").isValid){
            app.findGrepPreferences.properties = {
                findWhat: "\\l",
                appliedParagraphStyle: "GEN_captionred",
                capitalization: 1634493296
            };
            search_results = search_results.concat(app.activeDocument.findGrep());
        }
        if (app.activeDocument.paragraphStyles.itemByName("GEN_graphic").isValid){
            app.findGrepPreferences.properties = {
                findWhat: "\\l",
                appliedParagraphStyle: "GEN_graphic",
                capitalization: 1634493296
            };
            search_results = search_results.concat(app.activeDocument.findGrep());
            }
        for (i = 0; i < search_results.length; i += 1) {
            object_to_push = {
                message: "Lowercase, All-Caps letter in kicker",
                line: search_results[i].lines[0].contents,
                line_number: search_results[i].lines[0].numberingLevel
            };
            if (search_results[i].parentTextFrames[0] && search_results[i].parentTextFrames[0].parentPage !== null) {
                object_to_push.page = search_results[i].parentTextFrames[0].parentPage.name;
            } else {
                object_to_push.page = "N/A";
            }
            output.push(object_to_push);
        }
        app.changeGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences = NothingEnum.nothing;
        return output;
    }
};