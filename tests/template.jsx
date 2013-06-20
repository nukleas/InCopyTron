InCopyTron.Plugins.CENsorSuite.Tests.check_for_keywords = {
	run: function () {
		var output = [];
        if(InCopyTron.Metadata.metadata_object === undefined){
            return output;
            }
		if(InCopyTron.Metadata.metadata_object.Keywords === undefined || InCopyTron.Metadata.metadata_object.Keywords.value === "") {
			output.push({
				page: "Meta",
				line_number: "M",
				line: "Keywords",
				message: "Keywords are missing."
			});
		}
		return output;
	}
}
