/*
    Photo Ipsa Loquitur
    Finds the images on page, outputs their name, page no., and position
    By Nader Heidari
    Written for Chemical & Engineering News
*/
InCopyTron.Plugins.Photos = {
    find_center: function (geo_bounds) {
        "use strict";
        /*
            This function finds the center point of the image.
            This is important because the corners can be misleading when determining the location of the photos.
            NOTE: This does not align your chakras.
        */
        var center_point = [(geo_bounds[3] + geo_bounds[1]) / 2, (geo_bounds[0] + geo_bounds[2]) / 2];
        return center_point;
    },
    locate_image: function (geo_bounds) {
        "use strict";
        /*
            This function locates an image on a spread and outputs its page number and position.
        */
        var center_point, horiz_pos, vert_pos, x, y;
        /*
            First, lets find the center point of the image so we can see where a majority of the image lies.
            This is important because going by just the top corner by itself does not fully encapsulate the objects location.
            If something stretches across a page, then its corner position doesn't tell you much.
        */
        center_point = this.find_center(geo_bounds);

        x = center_point[0];

        y = center_point[1];
        /*
            Here, we're going to see if the position meets certain critera.
            Since we started whis program in picas, for our current purposes
            (I might later make these variables based on page size)
            the size of each page is 48 x 69 picas.
        */
        if ((32 < x && x < 48) || (-18 < x && x < 0)) {
            horiz_pos = "right";
        } else if ((0 <= x && x <= 18) || (-48 <= x && x <= -32)) {
            horiz_pos = "left";
        } else if ((18 <= x && x <= 48) || (-32 <= x && x <= -18)) {
            horiz_pos = "center";
        } else {
            horiz_pos = "Online Only";
        }
        if (0 <= y && y <= 26) {
            vert_pos = "top";
        } else if (26 <= y && y <= 42) {
            vert_pos = "center";
        } else if (42 <= y && y <= 69) {
            vert_pos = "bottom";
        } else {
            vert_pos = "";
        }
        /*
            Well, we don't want to dumbly say "center center"
            The point is for this program to not look like a dumb robot
            so we'll erase some redundancy here.
        */
        if (horiz_pos === "center" && vert_pos === "center") {
            return "center";
        }
        if (horiz_pos === "Online Only") {
            return "Online Only";
        }
        return vert_pos + " " + horiz_pos;
    },
    output_to_listbox: function (photo_object, listbox_object) {
        "use strict";
        var meta_name, i;
        for (i = 0; i < photo_object.length; i += 1) {
            meta_name = listbox_object.add("item", photo_object[i].name);
            meta_name.subItems[0].text = photo_object[i].page;
            meta_name.subItems[1].text = photo_object[i].position;
        }
    },
    process_art: function () {
        "use strict";
        var list = [],
            output = [],
            imgs = app.activeDocument.allGraphics, //Array with all the images in the active document
            i,
            property,
            comparison, // This is in case you have two images that are very close to each other.
            image_info = {},
            image_pos = {};
        // First, let us set the measurement methods the way we want them.
        app.activeDocument.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.PICAS;
        for (i = 0; i < imgs.length; i += 1) {
        //alert(imgs[i].itemLink.name + locate_image(imgs[i].parent.geometricBounds)[0] +locate_image(imgs[i].parent.geometricBounds)[1]);
            image_info = {
                name: (imgs[i].k4Name || imgs[i].id),
                page: (imgs[i].parentPage ? imgs[i].parentPage.name : "Off-Page"),
                position: this.locate_image(imgs[i].parent.geometricBounds),
                geo_bounds: imgs[i].parent.geometricBounds,
                center: this.find_center(imgs[i].parent.geometricBounds)
            };
        /*
        Hey, I don't want no ads! Just art please.
        */
            if (imgs[i].k4WfName === "Art" || imgs[i].k4WfName === "") {
                list.push(image_info);
            }
        }
        for (i = 0; i < list.length; i += 1) {
            if (image_pos.hasOwnProperty(list[i].page + ", " + list[i].position)) {
                image_pos[list[i].page + ", " + list[i].position].push(list[i]);
            } else {
                image_pos[list[i].page + ", " + list[i].position] = [list[i]];
            }
        }
        for (property in image_pos) {
            if (image_pos.hasOwnProperty(property)) {
            /*
            Note: This is a pretty ugly hack, and doesn't do comparisons if there are more than two photos close to each other.
            Am I going to fix it one day? Perhaps. Perhaps not.
            You can really only account for so many edge cases before you go crazy.
            Especially if you're just creating tools for use inside InDesign/InCopy.
            */
            /*
            "So What Are We Doing Here?"
            Well, what this does is place every image into an object's array by its position property.
            Then, we see if there are any that fall within the same page and position.
            After that, we compare the center points of just the first two and determine their relative positions accordingly.
            Then bam, the output should give us what we want.
            */
                if (image_pos[property].length > 1) {
                    comparison = [Math.abs(image_pos[property][0].center[0] - image_pos[property][1].center[0]), Math.abs(image_pos[property][0].center[1] - image_pos[property][1].center[1])];
                    if (comparison[1] < comparison[0]) {
                        if (image_pos[property][0].center[0] - image_pos[property][1].center[0] < 0) {
                        image_pos[property][0].position += ", left";
                        image_pos[property][1].position += ", right";
                        };
                    if (image_pos[property][0].center[0] - image_pos[property][1].center[0] > 0) {
                        image_pos[property][0].position += ", right";
                        image_pos[property][1].position += ", left";
                        };
                    }
                    if (comparison[1] > comparison[0]) {
                        image_pos[property][0].position += ", bottom" ;
                        image_pos[property][1].position += ", top";
                    }
                }
            }
        }
        for (i = 0; i < list.length; i += 1) {
            output.push({
                name: list[i].name,
                page: list[i].page,
                position: list[i].position
            });
        }
        return output;
    },
    generateGUI: function (mainGUI) {
        "use strict";
        var photo_tab, photo_panel, photo_box, photo_text;
        photo_tab = mainGUI.add("tab", undefined, "Photo Ipsa Loquitur");
        photo_panel = photo_tab.add('panel', undefined, "Photo/Art Information");
        photo_box = photo_panel.add('listbox', undefined, "", {
            name: "photo_tab",
            numberOfColumns: 3,
            showHeaders: true,
            columnTitles: ["Name", "Page", "Position"],
            columnWidths: [300, 100, 100]
        });
        photo_box.preferredSize.width = 500;
        photo_box.preferredSize.height = 330;
        photo_text = photo_panel.add("edittext", undefined, "");
        photo_text.minimumSize.width = 500;
        photo_box.onChange = function () {
            try {
                if (photo_box.selection && photo_box.selection.subItems[0] && photo_box.selection.subItems[1]) {
                photo_text.text = photo_box.selection.subItems[0] + ", " + photo_box.selection.subItems[1];
                }
            } catch (error) {}
        };
        this.output_to_listbox(this.process_art(), photo_box);
    }
};