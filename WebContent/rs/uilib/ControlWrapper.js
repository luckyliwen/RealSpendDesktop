/**
 * This class was used to wrap a normal control, now used in this case:
 *    The Expense hierarchy detail view the group row control no need display 
 */
sap.ui.core.Control.extend("rs.uilib.ControlWrapper", {
	metadata : {
		properties : {
			//used to control whether ignore the wrapped control
			'ignore'       : {type: 'boolean', defaultValue: false, bindable : "bindable"},
			
			//control whether is inline-block (use span) or block model
			'inlineModel'       : {type: 'boolean', defaultValue: true, bindable : "bindable"},
		},
		
		//Here use the aggregation so it is free for the caller to binding any control, 
		aggregations : {
				"content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		}
	},
	
	renderer : function(rm, oControl) {
		if ( oControl.getInlineModel()) {
			rm.write("<span");
		} else {
			rm.write("<div");
		}
		rm.writeControlData(oControl);
		rm.write(">");
		
		//if now are loading then
		if ( ! oControl.getIgnore()) {
			var aChildren = oControl.getContent();
			for (var i = 0; i < aChildren.length; i++) {
				rm.renderControl(aChildren[i]);
			}
		}
		
		if ( oControl.getInlineModel()) {
			rm.write("</span>");
		} else {
			rm.write("</div>");
		}
	},
});
