// Find and display hyperlinks
// Written By Nader Heidari
//
// The purpose of this script is to pull the page number, words linked, and linked URL from hyperlinks on page.
// It will then present those links in edit boxes as a tab-delimited string, which can be copied directly into an Excel sheet.
// Maybe allowing the option of other data structures (csv, etc.) will be a goal of future versions.
//
InCopyTron.Plugins.Hyperlinks = {
    iterateOverHyperlinks_DisplayResults: function () {
        "use strict";
        var i, linkedText, linkedURL, linkedPageNumber, extracted_hyperlinks = {
            hyperlinks_array: [],
            texterity_array: []
        },
            myHyperlinks = app.activeDocument.hyperlinks,
            extracted_hyperlink;
        for (i = 0; i < myHyperlinks.length; i += 1) {
            if (myHyperlinks.item(i).source && myHyperlinks.item(i).destination){
            linkedText = myHyperlinks.item(i).source.sourceText.contents; //extract linked text
            linkedURL = myHyperlinks.item(i).destination.destinationURL; //.split("|")[0]; //extract URL (the splitting here is to remove the link title if it exists.)
            } else {
                /*

                    */
                alert('Warning: Possibly broken hyperlink');
                // If the error-checking suite is installed, push an error.
                if(InCopyTron.Plugins.CENsorSuite){
                    InCopyTron.Plugins.CENsorSuite.push_error_to_listbox(new InCopyTron.Plugins.CENsorSuite.ErrorMessage("Doc", "N/A", "Hyperlinks", "At least one hyperlink is broken."));
                    }
                break;
                }
            /*
                This next one looks a little silly. So I'm going to explain it a bit more thoroughly.
                We're going to find the hyperlink, then the source, then the source text. This is the text that is linked in the document.
                Then from there, we actually backtrack and look at the parent (or what contains set text, the 'child').
                In this case, we are looking at the parent text frame, which is more obvious on the layout. It's the box the designers fill the text with.
                then, we look at the parent of the text frame, namely the page. And we extract its name. This gives us the page number of the linked text.
            */
            if (myHyperlinks.item(i).source.sourceText.parentTextFrames[0] !== undefined && myHyperlinks.item(i).source.sourceText.parentTextFrames[0].parentPage !== null) {
                linkedPageNumber = myHyperlinks.item(i).source.sourceText.parentTextFrames[0].parentPage.name;
                // And now we put it all together into an object!
                extracted_hyperlink = {
                    text: linkedText,
                    URL: linkedURL,
                    page: linkedPageNumber
                };
                extracted_hyperlinks.hyperlinks_array.push(extracted_hyperlink);
            }
        }
        return extracted_hyperlinks;
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var i,
            hyperlinks_tab = mainGUI.add("tab", undefined, "Hyperlinks");
        hyperlinks_tab.hyperlinks_panel = hyperlinks_tab.add("panel", undefined, "Hyperlinks");
        hyperlinks_tab.hyperlinks_panel.box = hyperlinks_tab.hyperlinks_panel.add("edittext", undefined, "", {
            multiline: true
        });
        hyperlinks_tab.hyperlinks_panel.box.minimumSize.width = 900;
        hyperlinks_tab.hyperlinks_panel.box.preferredSize.height = 300;
        for (i = 0; i < InCopyTron.Plugins.Hyperlinks.Output.hyperlinks_array.length; i += 1) {
            hyperlinks_tab.hyperlinks_panel.box.text += InCopyTron.Plugins.Hyperlinks.Output.hyperlinks_array[i].text + "\t" + InCopyTron.Plugins.Hyperlinks.Output.hyperlinks_array[i].URL + "\n";
        }
    }
};
InCopyTron.Plugins.Hyperlinks.Output = InCopyTron.Plugins.Hyperlinks.iterateOverHyperlinks_DisplayResults(); // Actually call the function