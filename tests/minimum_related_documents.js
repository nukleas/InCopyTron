/*global InCopyTron */
InCopyTron.Plugins.CENsorSuite.Tests.minimum_related_documents = {
    /* This simple check looks for keywords to be set in the main article of the story. */
    // TODO: Allow this test to distinguish between Collections (Concentrates, etc) that shouldn't have a main set of keywords.
    run: function() {
        "use strict";
        function parseRelatedDocuments(metadata) {
            "use strict";
            if (
                metadata["Related Documents"] !== undefined &&
                metadata["Related Documents"].hasOwnProperty("value")
            ) {
                var related_documents = metadata["Related Documents"].value,
                    parsed_related_documents = [],
                    i = 0;
                related_documents = related_documents.split("~");
                for (i = 0; i < related_documents.length; i += 1) {
                    related_documents[i] = related_documents[i].split("|");
                }
                for (i = 0; i < related_documents.length; i += 1) {
                    parsed_related_documents.push({
                        article_title: related_documents[i][1],
                        URL: related_documents[i][2]
                    });
                }
                return parsed_related_documents;
            }
        }
        var output = [];
        if (InCopyTron.Metadata.metadata_object === undefined) {
            return output;
        }
        var relatedDocuments = parseRelatedDocuments(
            InCopyTron.Metadata.metadata_object
        );
        $.write(relatedDocuments.length);
        if (relatedDocuments.length < 3) {
            output.push({
                page: "Meta",
                line_number: "M",
                line: "Related Docs",
                message: "Under 3 Related Documents"
            });
        }
        if (output) {
            return output;
        }
    }
};
