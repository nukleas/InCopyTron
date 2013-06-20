/*global app, NothingEnum, InCopyTron, XML, Socket*/
InCopyTron.Plugins.DOI = {
    /* DOI Extractor Plugin
        Detects DOIs in article, displays them
        Also allows user to open DOI from UI
        */
    DOI_regex: /10\.\d+\/[^( \>\"\|<\,);\s]+/,
    pull_from_active_document: function () {
        "use strict";
        var found_text_objects, i = 0,
            DOIs = [];
        app.findGrepPreferences.properties = {
            findWhat: '10\\.\\d+\\/[^( \\>\\"\\|\\<\\,\\s);]+'
        };
        app.findChangeGrepOptions.properties = {
            includeFootnotes: false,
            includeMasterPages: true,
            includeHiddenLayers: true,
            wholeWord: true,
            // The following are here to dig through locked layers even if you're in preview/read-only mode
            includeLockedStoriesForFind: true,
            includeLockedLayersForFind: true
            //
        };
        found_text_objects = app.activeDocument.findGrep();
        for (i = 0; i < found_text_objects.length; i += 1) {
            if (found_text_objects[i].parent instanceof Note === false) {
                DOIs.push(found_text_objects[i]);
            }
        }
        app.findGrepPreferences = NothingEnum.nothing;
        return DOIs;
    },
    current_DOIs: {},
    output_to_listbox: function (listbox_object) {
        "use strict";
        var i, pulled_DOIs = this.pull_from_active_document(), DOI_ListBoxItem;
        InCopyTron.Plugins.DOI.current_DOIs = {};
        for (i = 0; i < pulled_DOIs.length; i += 1) {
            DOI_ListBoxItem = listbox_object.add("item", pulled_DOIs[i]);
            DOI_ListBoxItem.text = pulled_DOIs[i].contents;
            InCopyTron.Plugins.DOI.current_DOIs[pulled_DOIs[i].contents] = pulled_DOIs[i];
        }
    },
    makeRequest: function (host, url, accept) {
        "use strict";
        /*
            This function builds a basic HTTP request that can be used with a socket device to pull stuff from the web.
        */
        var request;
        request = "GET /" + url + " HTTP/1.1\n" + "Host: " + host + "\n" + "User-Agent: InCopy ExtendScript\n" + "Accept: " + accept + "\n" + "Connection: close\n" + "\n";
        return request;
    },
    callDOI: function (DOI) {
        /*
            Calls DOI from web
            Could probably refactor some of this code and add to general functions for other API calls in other plugins.
            TODO: Refactor call code to core functions
        */
        "use strict";
        var redirect_url, request, response, socket, redirects;
        /*
            So Socket is ExtendScript's way of doing network connections.
            It's not very fleshed out, so it requires some setup from our part.
            I was tempted to use Extendable's interpretation of HTTP calls,
            but there was so much cruft that came with it I decided it was best
            to engineer a rigid way of doing it in hopes of later merging it with
            the larger InCopyTron framework later.
        */
        socket = new Socket();
        //Correctly encode all the things!
        socket.encoding = "UTF-8";
        //Because seriously, if you don't, you'll be sad.
        request = this.makeRequest('dx.doi.org:80', DOI, 'application/unixref+xml');
        socket.open('dx.doi.org:80');
        socket.write(request);
        // Why is the following number so high? Well, if its more bytes than that, we probably don't want it anyway.
        response = socket.read(9999999999);
        socket.close();
        // The following is a bit of an ugly hack to check if you're getting redirected.
        // It then follows the redirect.
        // I try not to use while loops often, but this is a case that would be a good use of them.
        redirects = 0;
        while (response.match('1.1 30[123]') && redirects < 10) {
            redirect_url = response.match('(?:Location: )(.*?)\n')[1];
            redirect_url = redirect_url.split('/');
            this.makeRequest(redirect_url[2], redirect_url[3], 'application/unixref+xml');
            socket.open(redirect_url[2] + ':80');
            socket.write(request);
            response = socket.read(9999999999);
            socket.close();
            redirects += 1;
        }
        return response;
    },
    getDOIXML: function (DOI) {
        "use strict";
        /*
            This function grabs the DOI XML from the dx.doi.org service.
            It uses the callDOI function to do so, using DOI as input.
            That fetches the header and the XML. We then trim off that header
            and return the XML.
        */
        var response, header, doi_xml;
        response = this.callDOI(DOI);
        header = response.split('\n\n')[0];
        if (!header.match('404 Not Found') && response.split('\n\n').length > 1) {
            doi_xml = new XML(response.split('\n\n')[1]);
            return doi_xml;
        }
        return false;
    },
    output_XML_to_listbox: function (DOI_XML, listbox_object) {
        "use strict";
        var data_array = [], entry, i;
        if (DOI_XML && typeof DOI_XML === 'xml' && listbox_object) {
            listbox_object.removeAll(); // Clears Listbox to avoid crazy levels of items
            /*
                NOTE: UGLY UGLY HACK!
                Basically, while I would love to have the whole XML fit into the listbox,
                XML's tree-form data does not work well with that.
                I personally don't like treeviews that are more than say, one to two nodes deep.
                Don't agree with me? Debate Jeff Atwood:
                http://www.codinghorror.com/blog/2005/03/trees-treeviews-and-ui.html
                http://www.codinghorror.com/blog/2012/12/web-discussions-flat-by-design.html

                Until then, we're going to call SPECIFIC parts of the XML and go with that.
            */
            if (DOI_XML.xpath('doi_record/crossref/journal/journal_article/titles/title').toString() === "") {
                for (i = 0; i < DOI_XML.descendants('title').length(); i += 1) {
                    data_array.push(['title', DOI_XML.descendants('title')[i].toString()]);
                }
            } else {
                data_array.push(['title', DOI_XML.xpath('doi_record/crossref/journal/journal_article/titles/title').toString().replace(/<.*?>/g, '').replace(/(^\s+|\s+$)/g, '').replace(/[\n\t]/g,"").replace(/\s+/g,' ')]);
            }
            data_array.push(
                ['journal', DOI_XML.xpath('doi_record/crossref/journal/journal_metadata/full_title').toString()],
                ['journal_abbrev', DOI_XML.xpath('doi_record/crossref/journal/journal_metadata/abbrev_title').toString()],
                ['print_pub_date', DOI_XML.xpath('doi_record/crossref/journal/journal_issue/publication_date/month').toString() + "/" + DOI_XML.xpath('doi_record/crossref/journal/journal_issue/publication_date/year').toString()],
                ['online_pub_date', DOI_XML.xpath('doi_record/crossref/journal/journal_article/publication_date/month').toString() + "/" + DOI_XML.xpath('doi_record/crossref/journal/journal_article/publication_date/year').toString()],
                ['doi', DOI_XML.descendants('doi').toString()]
            );
            for (i = 0; i < data_array.length; i += 1) {
                entry = listbox_object.add("item", data_array[i][0]);
                entry.subItems[0].text = data_array[i][1];
            }
        //TODO: Clean the stringcleaning
            InCopyTron.GUI.Window.findElement('DOI_edittext').text = InCopyTron.GUI.Window.findElement('DOI_edittext').text + DOI_XML.xpath('doi_record/crossref/journal/journal_article/titles/title').toString().toString().replace(/<.*?>/g, '').replace(/(^\s+|\s+$)/g, '');
        }
    },
    getContext: function (text) {
        "use strict";
		var text_object, surrounding_paragraph;
        text_object = InCopyTron.Plugins.DOI.current_DOIs[text];
        surrounding_paragraph = text_object.paragraphs[0].contents.split(text_object.contents);
        return surrounding_paragraph[0] + "\n\n" + text_object.contents + "\n\n" + surrounding_paragraph[1];
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var DOI_tab = mainGUI.add("tab", undefined, "DOIs"),
            DOI_panel = DOI_tab.add("panel", undefined, "DOIs"),
            DOI_statictext = DOI_panel.add("statictext", undefined, "Double-click to open DOI in browser"),
            DOI_listbox = DOI_panel.add("listbox", undefined, "Keywords", {
                numberOfColumns: 1,
                showHeaders: true,
                columnTitles: ["DOIs"],
                columnWidths: [300]
            }),
            DOI_pullButton = DOI_panel.add('button', undefined, "Pull XML From Web"),
            DOI_XML_panel = DOI_tab.add('panel', undefined, "DOI Information (If there are multiple titles, choose one)"),
            DOI_XML_box = DOI_XML_panel.add('listbox', undefined, "Data From XML", {
                name: 'DOI_XML_box',
                numberOfColumns: 2,
                showHeaders: true,
                columnTitles: ["Name", "Value"],
                columnWidths: [70, 270]
            }),
            DOI_contextpanel,
            DOI_context_statictext,
            DOI_applyHyperlinkButton;
        this.GUI = DOI_tab;
        DOI_XML_box.preferredSize = [600, 130];
        DOI_pullButton.onClick = function () {
            var DOI, DOI_XML;
            if (DOI_listbox.selection && DOI_listbox.selection.toString().match(this.DOI_regex)) {
                DOI = DOI_listbox.selection.toString();
                DOI_XML = InCopyTron.Plugins.DOI.getDOIXML(DOI);
                InCopyTron.Plugins.DOI.output_XML_to_listbox(DOI_XML, InCopyTron.GUI.Window.findElement('DOI_XML_box'));
                DOI_applyHyperlinkButton.enabled = true;
            }
        };
        DOI_XML_box.onChange = function () {
            if (this.selection.text === "title") {
                InCopyTron.GUI.Window.findElement('DOI_edittext').text = InCopyTron.GUI.Window.findElement('DOI_edittext').text.split("|")[0] + "|" + this.selection.subItems[0].text;
            }
        };
        DOI_listbox.onDoubleClick = function () {
            // Opens dx.doi.org link for DOI in browser
            var URL;
            URL = "http://dx.doi.org/" + this.selection.toString();
            InCopyTron.General_Functions.open_URL_in_browser(URL);
        };
        DOI_tab.alignChildren = "top";
        DOI_tab.orientation = "row";
        DOI_XML_panel.output_field = DOI_XML_panel.add("edittext", undefined, "", {name: 'DOI_edittext'});
        DOI_XML_panel.output_field.minimumSize.width = 600;
        DOI_contextpanel = DOI_XML_panel.add("panel", undefined, "Context");
        DOI_context_statictext = DOI_contextpanel.add("statictext", undefined, "Select a DOI to see context", {name: "DOI Context", multiline: true});
        DOI_context_statictext.preferredSize = [600, 150];
        DOI_applyHyperlinkButton = DOI_contextpanel.add('button', undefined, "Apply Hyperlink");
        DOI_applyHyperlinkButton.onClick = function () {
            InCopyTron.Hyperlinking.makeHyperlink(InCopyTron.Plugins.DOI.current_DOIs[DOI_listbox.selection], InCopyTron.GUI.Window.findElement('DOI_edittext').text);
            this.enabled = false;
        };
        DOI_listbox.onChange = function () {
            try {
                if (this.selection) {
                    DOI_XML_panel.output_field.text = "http://dx.doi.org/" + this.selection.toString() + "|";
                    InCopyTron.GUI.Window.findElement("DOI Context").text = InCopyTron.Plugins.DOI.getContext(this.selection);
                }
            } catch (error) {
			    $.writeln(error);
		    }
        };
        DOI_listbox.preferredSize = [300, 330];
        this.output_to_listbox(DOI_listbox);
        DOI_applyHyperlinkButton.enabled = false;
        DOI_tab.show();
    }
};