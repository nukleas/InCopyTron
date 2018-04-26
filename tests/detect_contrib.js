/*global app NothingEnum InCopyTron */
InCopyTron.Plugins.CENsorSuite.Tests.check_for_contrib = {
    run: function () {
        "use strict";
        var search_results = [],
            output = [],
            i,
            object_to_push;
            app.findGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences.properties = {
            findWhat: ".+",
            appliedCharacterStyle: "Name",
            appliedParagraphStyle: "GEN_deckbyline"
            };
        app.findChangeGrepOptions.properties = {
            includeFootnotes: true,
            includeMasterPages: true,
            includeHiddenLayers: true,
            wholeWord: false
        };
        search_results = app.activeDocument.findGrep();
        if(search_results[0] !== undefined){
        object_to_push = new InCopyTron.Plugins.CENsorSuite.ErrorMessage("Meta", "M", search_results[0].contents, "");
        }
        app.changeGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences = NothingEnum.nothing;
        search_results = NothingEnum.nothing;
        if(object_to_push && InCopyTron.Metadata.metadata_object !== undefined && InCopyTron.Metadata.metadata_object['Contributor 1'] && InCopyTron.Metadata.metadata_object['Contributor 1'].value !== "" && InCopyTron.Metadata.metadata_object['Contributor 1'].value !== "{NoValue}"){
            object_to_push.message = "Both styled contributor and drop-down";
            return object_to_push;
            }

}
};
