InCopyTron.Plugins.About = {
    generateGUI: function (mainGUI) {
	    "use strict";
        var about_tab, about_panel, about_text, about_title;
        about_tab = mainGUI.add('tab', undefined, "About InCopyTron");
        about_tab.add("image", undefined, new File(InCopyTron.General_Functions.getScriptPath().parent + "/includes/ICT.jpg"));
        about_panel = about_tab.add('panel', undefined, 'InCopyTron');
        about_tab.orientation = "row";
        about_tab.alignment = "fill";
        about_title = about_panel.add('statictext', undefined, "InCopyTron");
        about_title.graphics.font = "dialog:24";
        about_text = about_panel.add('statictext', undefined, "", {multiline: true, justify: 'center'});
        about_text.text = "A set of (hopefully) useful scripts for InCopy/InDesign and K4\n\nBy Nader Heidari\n\nWritten for C&&EN\n\n";
        about_text.graphics.font = "dialog:18";
        about_text.orientation = "column";
        about_text.alignment = "fill";
    }
};