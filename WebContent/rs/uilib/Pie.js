/**
 * TODO list
 * DONE ///1, label in each slice, need to calculate the position after rotate
 * Done ///2, Don't display label in slice, if it is less than 8%
 * 3, a shadow effect for pie, need to adjust
 * 4, refactor the code to use event other than properties in metadata
 * 5, a bug, properties type should use number instead of string for width, height, outerRadius, innerRadius, hideTextPercent
 * 6, Gradient color for each slice
 * 7, put required css in to a seperate file
 */

sap.ui.core.Control.extend("rs.uilib.Pie", {
	
	metadata : {
		properties : {
			//measurement is PX
			"width" : {type: "string", defaultValue: 350},
			"height" : {type: "string", defaultValue: 450},
			"outerRadius" : {type: "string"},
			"innerRadius" : {type: "string"},
			"hideTextPercent" : {type: "string", defaultValue: 0.05},
			"rotatable" : {type: "boolean", defaultValue: false},
			"animation" : {type: "boolean", defaultValue: true},
			"showShadow" : {type: "boolean", defaultValue: true},
			"useDefaultTooltip" : {type: "boolean", defaultValue: true},
			
			//selector functions
			"nameSelector" : "object",
			"tooltipSelector" : "object",
			"valueSelector" : "object",
			/**
			 * in order to support gradient, the returned color string format needs to be recognized by d3.rgb(), following are valid
			 *   rgb decimal - "rgb(255,255,255)"
			 *	 hsl decimal - "hsl(120,50%,20%)"
			 *	 rgb hexadecimal - "#ffeeaa"
			 *	 rgb shorthand hexadecimal - "#fea"
			 *	 named - "red", "white", "blue"
			 */
			"colorSelector" : "object",
			
			//pie data
			"data" : "object",
			
			//demo model
			"demoModel" : {type: "boolean", defaultValue: false},
		},
		
		events: {
			"endRotate": {},
			"select":{},
			"mouseOnSlice":{},
			"mouseOutSlice":{},
			"afterPieRender": {}
		}
	},

	init: function() {
		//can't get properties here
		
		//sample data
		this.demoData = [{"label":"oneadsadf", "value":5, "color":"yellow"}, {"label":"two", "value":60, "color":"green"}, {"label":"three", "value":30, "color":"red"}];
		
		//each element represent a slice(the arc data calculated by d3), the sequence is the same to the data.
		this.arcData = [];
	},
	
	_init: function() {
		//may need a more comprehensive way to generate the div names in order to avoid duplication with existing elements in the same page 
		this.id = this.getId() || "DefaultOverviewPies";
		this.pieId = this.id + "-pie";
		this.gradientColorPrefix = this.id + "-color-";
		this.tooltipDiv = this.id + "-tooltip";
		this.shadowColorId = this.id + "-shadow";
		this.data = this.getDemoModel() ? this.demoData : this.getData();
		this.beginData = [];
		
		//selector functions
		this.nameSelector = this.getNameSelector();
		this.valueSelector = this.getValueSelector() || function(d) {return d.value;};
		this.colorSelector = this.getColorSelector() || function(d) {return d.color;};
		this.tooltipSelector = this.getTooltipSelector() || function(d) {return d.label;};
		
		//based on properties, initiate values that will be used pie drawing by d3
		this.rotatable = this.getRotatable();
		this.w = Number(this.getWidth());
		this.h = Number(this.getHeight());
		//default size logic in case outerRaius is not set, width can't be small than 40, and height can't be small than 80
		if(this.getOuterRadius() == null) {
			if(this.w - 40 < this.h - 80) {
				this.r = (this.w - 40)/2;
			} else {
				this.r = (this.h - 60)/2;
			}
		} else {
			this.r = Number(this.getOuterRadius());
		}
		if(this.getInnerRadius() == null) {
			this.ir = this.r * 0.5;
		} else {
			this.ir = Number(this.getInnerRadius());
		}
		//this.r = Number(this.getOuterRadius());
		//this.ir = Number(this.getInnerRadius());
		this.offset = this.r + 20; //how much the <path> will be translated inside svg element
		this.shadow_cx = this.r + 20; //for shadow eclipse
		this.shadow_cy = 2 * this.r +20 + 40;
		this.shadow_rx = this.r;
		this.shadow_ry = 8;
		this.pie = d3.layout.pie().value(this.valueSelector).sort(null);
		this.arc = d3.svg.arc().outerRadius(this.r).innerRadius(this.ir);
	},
	
	exit : function() {
		//Destroy sub elements to release resource
		//TODO
	},
	
	renderer : function(oRm, oControl) {
		oControl._init();

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addStyle("position", "relative");
		oRm.writeStyles();
		oRm.write(">");
		//output div for pie
		oRm.write("<div id=" + oControl.pieId + " class='pie_container'");
		oRm.addStyle("position", "relative");
		oRm.addStyle("height", oControl.h + "px");
		oRm.addStyle("width", oControl.w + "px");
		oRm.writeStyles();
		oRm.write(">");
		//output tooltip div
		oRm.write("<div id=" + oControl.tooltipDiv + " class='pie_tooltip'");
		oRm.addStyle("display", "none");
		oRm.addStyle("position", "absolute");
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("<div class='tri1'></div>");
		oRm.write("<div class='tri2'></div>");
		oRm.write("</div>");
		
		oRm.write("</div>");
		oRm.write("</div>");
	},
	
	onAfterRendering : function() {
		//put animation from empty data
		if(this.getAnimation()) {
			var _backupData = this.data;
			this.data = [];
			this._drawPie([], this.pieId);
			this.loadNewData(_backupData);
			
		} else {
			this._drawPie(this.data, this.pieId);
		}
		this.fireEvent("afterPieRender",{});
	},
	
	_calRotateDegree: function(x, y) {
	    //Math.atan returns an arc value which is between -PI/2 to PI/2, need to convert.
	    //remember the coordinates direction. Y towards down
	    var abs_d = (Math.atan(Math.abs(y)/Math.abs(x)) * 180)/Math.PI;
	    if(x > 0 && y > 0) {
	        return -abs_d;
	    } else if(x > 0 && y < 0) {
	        return abs_d;
	    } else if(x < 0 && y > 0) {
	        return -(180 - abs_d);
	    } else if(x < 0 && y < 0) {
	        return 180 - abs_d;
	    } else {
	        //should not go here
	        return 0;
	    }
	},
	
	_offsetSlice : function(d, c) {
		var oControl = c || this;
	    d.innerRadius = oControl.ir;
	    d.outerRadius = oControl.r;
	    var midPoint = oControl.arc.centroid(d);
	    var offsetPoint = [];
	    offsetPoint [0] = midPoint[0]/5;
	    offsetPoint [1] = midPoint[1]/5;
	    //return "translate(" + offsetPoint + ")";
	    //no offset
	    return "";
	},
	
	//select on a slice
	//"c" is the reference of control itself, "this" could be the selected SVG element, also could be the control, depends on if this is triggered by triggerSelectionOn function
	_sel : function(d, i, c) {
		//console.log("this in _sel()", this);
		var oControl = c || this;
	    if(oControl.rotatable) {
	    	//if selected slice is already selected, then do nothing, "_offsetSlice" is the default offset value
	    	if(oControl.slices[0][i].getAttribute("transform") != oControl._offsetSlice(d, oControl)) {
	    		return;
	    	}
	    	
	    	//get the coordinates of the middle point for the selected slice
		    d.innerRadius = oControl.ir;
		    d.outerRadius = oControl.r;
		    var midPoint = oControl.arc.centroid(d);
		    
		    //reset all slices and hide tooltip
		    oControl.slices.attr("transform", function(d) {
		    	return oControl._offsetSlice(d, oControl);
		    });
		    $("#" + oControl.tooltipDiv).hide();
		    
		    //offset the selected slice
		    var offsetPoint = [];
		    offsetPoint [0] = midPoint[0]/9;
		    offsetPoint [1] = midPoint[1]/9;
		    //if the function is invoked by selection on a slice, then "this" is a HTML object(not a d3 object)
		    //if triggered by triggerSelectionOn(), "this" is the control itself
		    //so don't use "this" here, use "oControl.slices" instead
		    oControl.slices[0][i].setAttribute("transform", "translate(" + offsetPoint + ")");
		    
		    //reset strokes for all slices
		    oControl.slices.select("path").attr("style", "stroke-width:2;stroke:white;");
		    
		    //calculate the degrees,
		    var deg = oControl._calRotateDegree(midPoint[0], midPoint[1]);
		    
		    //update arcData[] in order to further calculation, like track the midPoint after rotation
		    //the calculated degree is from -180 to 180 (then angle is from -PI to PI)
		    //"angle" is relative to original position of each slice. so, need to use the initial startAngle and endAngle to do Math every time
		    //console.log("arcData before rotate", oControl.arcData);
		    var angle = (deg / 180) *  Math.PI;
		    //console.log("rotated angle", angle);
		    for(var j in oControl.arcData) {
		    	var ad = oControl.arcData[j];
		    	var r = (ad.innerRadius + ad.outerRadius) / 2;
		    	var a = ((ad.startAngle + ad.endAngle) / 2) + angle - (Math.PI / 2);
		    	ad.currentAnchorAngle = a;
		    	ad.midPoint = [Math.cos(a) * r, Math.sin(a) * r];
		    }
		   //console.log("arcData after rotate", oControl.arcData);
		    
		    
		    //rotate the whole slices group according to the degree calculated above.
		    oControl.piePanel.selectAll("text").remove();  //remove description for each slice
		    oControl.slicesGroup.transition().duration(1000).attr("transform", "rotate(" + deg + ")")
		        .each("end", function(){
		        	//set extra stroke for selected slice
		        	d3.select(oControl.slices[0][i]).select("path").attr("style", "stroke-width:2;stroke:black;");
		        	
		        	oControl._createTextAfterRotate();
		        	
		        	oControl.fireEvent("endRotate",{"data":d, "index": i});
		        	
//		        	//re create description for each slice.
//		            //put them in piePanle instead of sliceGroup, then will not be rotated along with sliceGroup
//		            oControl.piePanel.selectAll("text").data(oControl.arcData).enter().append("svg:text")
//		                .attr("transform", function(d, i){
//		                     return "translate(" + d.midPoint + ")";})
//		                .attr("style", "text-anchor:middle;").attr("class", "slice_text")
//		                .text(function(d, i) {
//		                	if(d.perc < oControl.getHideTextPercent()) {return "";}
//		                    return oControl.nameSelector == "function" ? d.percStr + " - " + oControl.nameSelector(d) : d.percStr;
//		                 });
		        	
		        	//other stuff
		        });
		    
	    }
		oControl.fireEvent("select",{"data":d, "index": i});
	},
	
	
	//hover function, fire hover event to let outside handle tooltip or use the default provided one
	_hoverOnSlice : function(d, i, c) {
		var oControl = c || this;
		
		//set stroke for unselected slices
		if(oControl.slices[0][i].getAttribute("transform") == oControl._offsetSlice(d, oControl)) {
			//highlight hovered slice, move the slice to the top(the last slice)
			if($.browser.msie) {
				//appendChild has problem in IE, do nothing at the moment, 
				//need to find other way to move the slice to the top
			} else {
				oControl.slices[0][i].parentNode.appendChild(oControl.slices[0][i]); //not work in IE
			}
			d3.select(oControl.slices[0][i]).select("path").attr("style", "stroke-width:2;stroke:blue");
    	}

		//midPoint is related to the donuts, so need to translate back the coordinates by offset
		//besides, if use this coordinates to position tooltip, need to use new mid position from arcData
		var midPoint = oControl.arcData[i].midPoint || oControl.arc.centroid(d);
		
		//check if need to prepare default tooltip
		if(!oControl.getUseDefaultTooltip()) {
			var position = [];
			position[0] = $('#'+oControl.getId()).offset().left + midPoint[0] + oControl.offset - 25;
			position[1] = $('#'+oControl.getId()).offset().top + midPoint[1] + oControl.offset;
			//oControl.fireEvent("mouseOnSlice",{"data":d, "index": i, "top":midPoint[1] + oControl.offset + "px", "left": midPoint[0] + oControl.offset - 25 + "px"});
			oControl.fireEvent("mouseOnSlice",{"data":d, "index": i, position:position});
			return;
		}

		var tooltip = $("#" + oControl.tooltipDiv);
		
		//this method will be called multiple times while mouse is moving inside the region without re-entering, so prevent the event if tooltip is already displayed
		if(tooltip.css("display") != "none") return;
		
		//when mouse move to tooltip div from the slice, it will trigger mouseout event, 
		//in order to handle this smoothly, attache mouseover and mouseout events for tooltip div as well
		tooltip.hover(function(){
			$(this).show();
		}, function() {
			$(this).hide();
		});
		
		//prepare the position of tooltip
		tooltip.css("display", "inline-block");
		//tooltip.css("left", d3.mouse(document.getElementById(oControl.pieId))[0]);
		//tooltip.css("top", d3.mouse(document.getElementById(oControl.pieId))[1]);
		//when translate back to DIV coordinate, need to offset x-ray "-25px" to make the triangle match the center of slice, 
		tooltip.css("left", midPoint[0] + oControl.offset - 25 + "px");
		tooltip.css("top", midPoint[1] + oControl.offset + "px");
		
		//prepare the content of tooltip
		var tooltipContent = oControl.tooltipSelector(d.data);
		if(tooltipContent instanceof sap.ui.core.Control) {
			tooltipContent.placeAt(oControl.tooltipDiv, "only");
		} else if(typeof(tooltipContent) === "string" ) {
			tooltip.html(tooltipContent);
		} else {
			tooltip.text("missing tooltip text, please set tooltipSelector");
		}
		
		//show tooltip
		tooltip.show();

	},
	

	//event
	_mouseOutOfSlice : function(d, i, c) {
		var oControl = c || this;
		
		//only affect unselected slices
		if(oControl.slices[0][i].getAttribute("transform") == oControl._offsetSlice(d, oControl)) {
			//remove highlight slice
			d3.select(oControl.slices[0][i]).select("path").attr("style", "stroke-width:2;stroke:white;");
    	}
		
		if(!oControl.getUseDefaultTooltip()) {
			oControl.fireEvent("mouseOutSlice",{"data":d, "index": i});
			return;
		}
		
		//hide tooltip div
		$("#" + oControl.tooltipDiv).hide();
		
		
	},
	
	
	/**
	 * The steps to draw a pie:
	 *  1, create svg element
	 *  2, binding pie data and draw path(slices), start animation
	 *  3, create gradient
	 *  4, set color to each path
	 *  5, when animation end, update slices and extract arcData from slices
	 *  6, create text
	 *  7, draw shadow
	 */
	_drawPie : function(data, divId) {
		var oControl = this;
		
		//remove exist svg elements
		d3.select("#" + divId).selectAll("svg").remove();
		
		this.piePanel = d3.select("#" + divId).append("svg:svg")
	    	.attr("style", "height:" + oControl.h + "px;width:" + oControl.w + "px").attr("class", "pie_svg")
	    	.append("svg:g").attr("transform", "translate(" + oControl.offset + "," + oControl.offset + ")");

		this.slicesGroup = this.piePanel.append("svg:g");

		this.slices = this.slicesGroup.selectAll("g").data(oControl.pie(data)).enter().append("svg:g"); 
		
		//set initial offset for each slice
		this.slices.attr("transform", function(d){
			return oControl._offsetSlice(d, oControl);
			});
		
		this._createGradient(oControl);
		
		//draw each slice, set color and stroke for each slice
		this.slices.append("svg:path")
					.attr("d", oControl.arc)
					.attr("fill", function(d, i) {
						return "url(#" + oControl.gradientColorPrefix + i + ")";
						})
					.attr("class", "slice")
					.attr("style", function(d, i) {
							if(oControl.data.size <= 1) 
								return "";
							else
								return "stroke-width:2;stroke:white;";
						})
					.each(function(d){this.sliceData = $.extend(true, {}, d);});
		
		this._extractArcData(oControl);

		this._appendText(oControl);

		//draw shadow for the pie
		if(this.getShowShadow()) {
			this.svgCanvas = d3.select("#" + divId).select("svg");
			
			//define gradient
			var bright_grey = d3.rgb("grey").brighter(2).toString();
			var dark_grey = d3.rgb("grey").brighter().toString();
			var shadow_gradient = this.svgCanvas.append("svg:defs").append("svg:linearGradient")
						.attr("id", oControl.shadowColorId)
						.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
			shadow_gradient.append("svg:stop").attr("offset", "0%").attr("style", "stop-color:" + bright_grey);
			shadow_gradient.append("svg:stop").attr("offset", "100%").attr("style", "stop-color:" + dark_grey);
			
			//create shadow ellipse
			this.svgCanvas.append("svg:ellipse")
				.attr("cx", this.shadow_cx)
				.attr("cy", this.shadow_cy)
				.attr("rx", this.shadow_rx)
				.attr("ry", this.shadow_ry)
				.attr("fill", "url(#" + oControl.shadowColorId + ")");
		}
		
	},
	
	//public methods
	//simulator a selection on a slice.
	// "this" has to the control itself
	triggerSelectionOn : function(seq) {
		if(seq >= this.arcData.length) {
			//invalid sequence. number do nothing
			return;
		}
		this._sel(this.arcData[seq], seq, this);
	},
	
	
	/**
	 * load new data using animation
	 * @param data
	 */
	loadNewData : function(newData) {
		//this has to be the control
		var oControl = this;
		
		oControl.beginData = oControl.data;
		var oldData = oControl.beginData;
		oControl.data = newData;
		
		var currentSlices = oControl.slicesGroup.selectAll("g").data(oControl.pie(newData));
		var slicesNeedToRemove = null;
		var slicesNeedToAdd = null;
		
		if(newData.length < oldData.length) {
			slicesNeedToRemove = currentSlices.exit();
			slicesNeedToRemove.select("path").each(function(d){
		            d.startAngle = 2*Math.PI;
		            d.endAngle = 2*Math.PI; 
		        });
		} else if(newData.length > oldData.length) {
			slicesNeedToAdd = currentSlices.enter().append("svg:g").attr("transform", function(d){
    				return oControl._offsetSlice(d, oControl);
				});
			slicesNeedToAdd.append("svg:path").each(function(d){
		        	this.sliceData = $.extend(true, {}, d);
		        	this.sliceData.startAngle = 2*Math.PI;
		        	this.sliceData.endAngle = 2*Math.PI;
		        });
		}
		
		function tween(d, i) {
//			console.log("i:", i);
//		    console.log("current arc", this.sliceData);
//		    console.log("target arc:", d);
			var i = d3.interpolate(this.sliceData, d);
		    return function(t) {
		    		return oControl.arc(i(t));
		    	};
		}
		
		//update color before animation
		oControl.slices = oControl.slicesGroup.selectAll("g");
		oControl.slices.select("text").remove();
		oControl.piePanel.selectAll("text").remove();
		oControl._createGradient();
		
		oControl.slices.select("path")
				.attr("class", "slice")
				.attr("style", function(d, i) {
					if(oControl.data.size <= 1) 
						return "";
					else
						return "stroke-width:2;stroke:white;";
					})
				.attr("fill", function(d, i) {
					return "url(#" + oControl.gradientColorPrefix + i + ")";
				})
				.transition().duration(500).attrTween("d", tween)
				.each("start", function() {
					
				})
				.each("end", function() {
					//delete not used slices
					if(slicesNeedToRemove != null) slicesNeedToRemove.remove();
					
					//below logic will execute multiptimes for each path, better to move it out
					//update oControl.slices, to make data consistent with arcData
					oControl.slices = oControl.slicesGroup.selectAll("g");
					oControl.slices.select("path").each(function(d){this.sliceData = $.extend(true, {}, d);});
					oControl._extractArcData();
					oControl._appendText();
				});
		
		//the other situation is loading new data after rotate, this is tricky, need to find a solution
		//doesn't work use oControl._createTextAfterRotate(), because need to re-calculate degree in _extractArcData()
		
	},
	
	
	_appendText : function(control, _slices) {
		var oControl = control || this;
		var slices = _slices || oControl.slices;
		
		//append text for each slice, but the text will be replaced after a rotate finished
		slices.select("text").remove();
		slices.append("svg:text").attr("transform", function(d, i){
	    			d.innerRadius = oControl.ir;
	    			d.outerRadius = oControl.r;
	    			return "translate(" + oControl.arc.centroid(d) + ")";})
	    		.attr("style", "text-anchor:middle;").attr("class", "slice_text")
	    		.text(function(d, i) {
	    			var percent = oControl.arcData[i].perc;
	    			var oText = oControl.arcData[i].percStr;
	    			if(percent < oControl.getHideTextPercent()) {
	    				return "";
	    			}
	    			return (typeof oControl.nameSelector == "function") ? oText + " - " + oControl.nameSelector(d.data) : oText;
	    			})
	    		.on("click", function(d, i) {
	    				oControl._sel.call(this, d, i, oControl);
	    		})
				.on("mouseover",function(d, i){oControl._hoverOnSlice.call(this, d, i, oControl);})
				.on("mouseout", function(d, i){oControl._mouseOutOfSlice.call(this, d, i, oControl);});
		
	},
	
	
	_createGradient : function(control, _slices) {
		var oControl = control || this;
		var slices = _slices || oControl.slices;
		
		slices.select("defs").remove();
		//define gradient based on colorSelector
		var gradients = slices.append("svg:defs").append("svg:linearGradient")
								.attr("id", function(d, i) {return oControl.gradientColorPrefix + i;})
								.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
		gradients.append("svg:stop").attr("offset", "0%").attr("style", function(d, i){
						var color = oControl.colorSelector(d.data);
						var brighter_color = d3.rgb(color).brighter().toString();
						return "stop-color:" + brighter_color;
						//return "stop-color:rgb(250, 250, 250)";
						});
		gradients.append("svg:stop").attr("offset", "100%").attr("style", function(d, i){
						var color = oControl.colorSelector(d.data);
						var darker_color = d3.rgb(color).darker().toString();
						return "stop-color:" + darker_color;
						});
		
	},
	
	_createTextAfterRotate : function(control) {
		var oControl = control || this;
		
		oControl.piePanel.selectAll("text").data(oControl.arcData).enter().append("svg:text")
        .attr("transform", function(d, i){
             return "translate(" + d.midPoint + ")";})
        .attr("style", "text-anchor:middle;").attr("class", "slice_text")
        .text(function(d, i) {
        	if(d.perc < oControl.getHideTextPercent()) {return "";}
            return oControl.nameSelector == "function" ? d.percStr + " - " + oControl.nameSelector(d) : d.percStr;
         });
	},
	
	_extractArcData : function(control, _slices) {
		var oControl = control || this;
		var slices = _slices || oControl.slices;
		
		slices.call(function(d) {
			//save arc data. When data is assigned to an element, it is stored in the property __data__
			for(var i =0 ; i < d[0].length; i++) {
				//Need deep copy, other wise it will affect the data which is already bind to the element. 
				if(d[0][i] == null) continue;
				oControl.arcData[i] = $.extend(true, {}, d[0][i].__data__);
				oControl.arcData[i].innerRadius = oControl.ir;
				oControl.arcData[i].outerRadius = oControl.r;
				oControl.arcData[i].currentAnchorAngle = (oControl.arcData[i].endAngle - oControl.arcData[i].startAngle) / 2;
				//calculate the percentage of the slice using arc angle, and save it to arcData for later use	
				oControl.arcData[i].perc = Math.abs(oControl.arcData[i].endAngle - oControl.arcData[i].startAngle)/(2 * Math.PI);
				oControl.arcData[i].percStr = Math.round(oControl.arcData[i].perc * 100) + "%";
			}
		})
		.on("click", function(d, i) {
			oControl._sel.call(this, d, i, oControl);
		})
		.on("mouseover",function(d, i){oControl._hoverOnSlice.call(this, d, i, oControl);})
		.on("mouseout", function(d, i){oControl._mouseOutOfSlice.call(this, d, i, oControl);});
	}
	
	
});

    