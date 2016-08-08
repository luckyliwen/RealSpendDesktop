sap.ui.core.Control.extend("rs.uilib.LoadingWrapper", {
	metadata : {
		properties : {
			
			//??why can't validate
			//'wrappedControl' : { type: "sap.ui.core.Control", defaultValue: null, bindable : "bindable"},
			//'wrappedControl' : { type: "object",  bindable : "bindable"},
		
			'loadingStatus'       : {type: 'boolean', defaultValue: false, bindable : "bindable"},
			
			//the text
			'text'				  : {type: 'string', defaultValue: "", bindable : "bindable"},

			//Following two property used to customized the Loading control
			'loadingText'    :  {type: "string", defaultValue: ' loading...'}, //used to give a hint to user that now is loading
			
			'loadingImageSrc':  {type: "string", defaultValue: 'images/loading.gif'},  //the image
		},
		
		//Here use the aggregation so it is free for the caller to binding any control, 
		aggregations : {
					"content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		}
	},
	
	renderer : function(rm, oControl) {
	
		rm.write("<span");
		rm.writeControlData(oControl);
		rm.write(">");
		
		//if now are loading then
		if ( oControl.getLoadingStatus()) {
			rm.renderControl(oControl.getLoadingControl());
		} else {
		
				var aChildren = oControl.getContent();
				for (var i = 0; i < aChildren.length; i++) {
					rm.renderControl(aChildren[i]);
				}
	
		}
		rm.write("</span>");
	},
	
	getLoadingControl: function() {
	
		if (this._loadingControl == null) {
			this._loadingControl = this._createLoadingControl();
		}
		return this._loadingControl;
	},
	//
	_createLoadingControl: function() {
		var layout = new sap.ui.commons.layout.HorizontalLayout();
	
		layout.addContent(new sap.ui.commons.Image(
			{  width: '32px', height: '32px', 
			    src :  this.getLoadingImageSrc()
			})
		); 
		layout.addContent(new sap.ui.commons.TextView().setText( this.getLoadingText()));
			
		return layout;
	},
	
	_loadingControl: null,
});
