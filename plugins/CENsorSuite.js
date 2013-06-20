/*global InCopyTron, Folder*/

InCopyTron.Plugins.CENsorSuite = {
    /* CENsor Suite is a plugin for InCopyTron.
        Its purpose is to load a set of JavaScript rules from the ./tests/ directory and concatenate the results.
        It then can inject said results into the error-checking listbox in the metadata area.
        */
    Object_Tests: {},
    Tests: {},
    ErrorMessage: function (page, line_number, line, message) {
        // Decided to make this an object, seemed to make more sense.
        this.page = page || "";
        this.line_number = line_number || "";
        this.line = line || "";
        this.message = message || "";
        },
    pull_tests_from_folder: function () {
        "use strict";
        /* Loads javascript files in the tests folder
            Now redundant code now that ICT-core has a pull_files_from_folder function.
            TODO: use ICT's core functions instead of adding new ones? Good for final development of plugin API
            */
        var file_list, scriptFolder, i;
        scriptFolder = InCopyTron.General_Functions.getScriptPath();
        scriptFolder = new Folder(scriptFolder.parent.parent + '/tests/');
        file_list = scriptFolder.getFiles();
        for (i = 0; i < file_list.length; i += 1) {
            // Checks if the file is a .js file before it loads, we can institute a tougher standard later.
            // TODO: Perhaps .ict_plugin or something? I don't know. js works for now, so jsx holds the template.
            if (file_list[i].name.split(".")[file_list[i].name.split(".").length - 1] === "js") {
                app.doScript(file_list[i]);
            }
        }
    },
    run_tests: function () {
        /* Runs a series of tests from a Tests object and returns an array with error/warning objects.
         */
        "use strict";
        var i, test, output = [], test_results = [];
        for(test in this.Tests) {
            if(this.Tests.hasOwnProperty(test)) {
                /* The assumption here is that you will be provided with an object such that:
                object = {line_number: int_line_number, page: int_page_number, l       ine: "line", message: "Error message"}
                */
                test_results = this.Tests[test].run();
         if (test_results){
                output = output.concat(test_results);
        }
    }
    }
        return output;
    },
    output_to_listbox: function(error_array, listbox_object) {
        "use strict";
        var property, meta_name, i;
        if (error_array && listbox_object){
            for(i = 0; i < error_array.length; i += 1) {
                meta_name = listbox_object.add("item", error_array[i].page);
                meta_name.subItems[0].text = error_array[i].line_number;
                meta_name.subItems[1].text = error_array[i].line;
                meta_name.subItems[2].text = error_array[i].message;
            }
        }
    },
    push_error_to_listbox: function (errorObject){
        this.output_to_listbox([errorObject], InCopyTron.GUI.Window.findElement("error_listbox"));
        },
    generateGUI: function(mainGUI) {
        var error_checking_box = mainGUI.parent.findElement("error_listbox"),
        //Refresh button Start
        refresh_button = error_checking_box.parent.add('button', undefined, "Refresh");
        refresh_button.onClick = function () {
            error_checking_box.removeAll();
            InCopyTron.Plugins.CENsorSuite.output_to_listbox(InCopyTron.Plugins.CENsorSuite.run_tests(), error_checking_box);
        };
        //Refresh Button Stop
        InCopyTron.Plugins.CENsorSuite.output_to_listbox(InCopyTron.Plugins.CENsorSuite.run_tests(), error_checking_box);
}
};
// Initialize
InCopyTron.Plugins.CENsorSuite.pull_tests_from_folder();