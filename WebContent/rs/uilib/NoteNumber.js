sap.ui.core.Control.extend("rs.uilib.NoteNumber", {
	
	
	 metadata : 
	 {                            
        properties : 
        {
			"count" : {type: "int", defaultValue: 0, bindable : "bindable"},
        },
		events: 
		{
			"press" : {}
		}        
	}, //end of metadata

	init: function()
	{
		
	},
	
	renderer : function(oRm, oControl) 
	{
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addStyle("position", "relative");
		oRm.writeStyles();
		oRm.write(">");
		
		//Only the valid count need display control
		if (  oControl.getCount() >= 0) {
			oRm.write("<button class='note_button'>");
			oRm.write(oControl.getCount());
			oRm.write("</button>");
		}
		
		oRm.write("</div>");
	},	
	
	showLoadingSpin: function()
	{
		$('#' + this.getId()).empty();
		var strHtml = '<image width = "32px" height = "32px" src = images/loading.gif>';
		$('#' + this.getId()).append(strHtml);
		
	},
	
	stopLoadingSpin:function()
	{
		$('#' + this.getId()).empty();
		
		var strHtml = '<button class="note_button">' + this.getCount() + '</button>';
		
		$('#' + this.getId()).append(strHtml);
	},	
	
	onclick: function()
	{
		this.firePress({object: this});
	}

});