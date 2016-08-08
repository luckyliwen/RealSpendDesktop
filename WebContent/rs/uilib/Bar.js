/**
 * TODO list
 * 1, don't have to format total, budget and maxValue, assume there are all numbers
 * 2, expose animation duration as a property
 * 3, find a warning icon and put a icon at the bar tail if total is much better than buget
 * 4, add a triangle for tooltip box
 * 5, consider budget = 0 case
 */

sap.ui.core.Control.extend("rs.uilib.BudgetBar", {
	
	metadata : {
		properties : {
			//scale model: the position of budget line is relative to "total" and "width".
			//constant model: budget line will be placed at a constant position, which has no relationship with width
			//the default is constant model
			"barModel": {type: "string", defaultValue: "constant"},
			
			"height" : {type : "sap.ui.core.CSSSize", defaultValue : "30px"},
			//the width of the control
			"width" : {type: "string", defaultValue: "100%"},
			
			//committed value
			"committed" : {type : "string", bindable : "bindable"},
			//decide the length of bar
			"total" : {type : "string", bindable : "bindable"},
			//decide the position of budget line
			"budget" : {type : "string", bindable : "bindable"},
			//in scale model, this will be used together with budget to decide the position of budget line. It has the same format as budget
			"maxValue" : {type : "string", bindable : "bindable"},
			
			//color
			//either provide color directly, or provide colorFnc
			//In later way, use variancePercentage to calculate color
			"variancePercentage":{type : "string", bindable : "bindable"},
			"colorFnc" : "object",
			"color" : {type : "string", bindable : "bindable"},
			
			//tooltip content
			"tooltipContent" : {type: "string", defaultValue: ""}
		}
	},
	
	init: function() {
		//Actually, should not depend on any rs objects, inject color function if needed. Only do this in order to support current rs design
		if(rs != null && rs.view != null && rs.view.getColorByVariancePercentage != null) {
			this.colorFnc = rs.view.getColorByVariancePercentage;
		} else {
			//default
			this.colorFnc = function(){return "green";};
		}
	},
	
	_calBudgetLength : function () {
		if(!this.getMaxValue()) {
			//console.log("maxValue is not set in scale model");
			return "0%";
		}
		if(!this.getBudget()) {
			//set a minimum length?
			return "0%";
		}
		var max = Number(this.getMaxValue());
		var b = Number(this.getBudget());
		return 100 * (b/max) + "%";
	},
	
	_calTotalLength : function() {
		var tStr = this.getTotal();
		var bStr = this.getBudget();
		if(tStr != null && bStr != null) {
			var total = Number(tStr);
			var budget = Number(bStr);
			if(total != 0 && budget != 0) {
				var _bl = Number(this.budgetLength.replace(/[\%,]/g,""));
				return _bl * (total/budget) + "%";
			} else if(budget == 0 && this.getBarModel() == "scale") {
				//in scale model, need to display total even if budget is 0
				var max = Number(this.getMaxValue());
				return 100 * (total/max) + "%";
			}
		}
		//set a minimum length?
		return "0%";
	},
	
	_calCommittedLengh : function() {
		var t = Number(this.getTotal());
		var c = Number(this.getCommitted());
		if(t != 0 && c != 0) {
			return  100 * (c/t) + "%";
		}
		//set a minimum length?
		return "0%";
	},
	
	_init : function() {
		//console.log("bar id:", this.getId());
		
		//calculate length for total line
		if(this.getBarModel() == "scale") {
			this.budgetLength = this._calBudgetLength();
			this.totalLengh = this._calTotalLength();
		} else {
			//this.budgetLength = Number(this.getBudget().replace(/[\$,]/g,"")) == 0 ? "0%" : "80%";
			this.budgetLength = this.getBudget() == 0 ? "0%" : "80%";
			this.totalLengh = this._calTotalLength();
		}
		
		//calculate length committed value, which is part of total
		this.committedLengh = this._calCommittedLengh();
		//console.log("committed length:", this.committedLeng);

		//set color
		if(this.getColor()) {
			this.color = this.getColor();
		} else {
			if(this.getColorFnc()) {
				this.colorFnc = this.getColorFnc();
			}
			this.color = this.colorFnc.call(this, this.getVariancePercentage(), this.getTotal());
		}
		
		//color for committed, hard code grey
		this.committedColor = "grey";
		
		//see if need to show toolitp icon
		if(this.getBarModel() != "scale") {
			if(this.budgetLength == "0%") {
				this.warningIcon = true;
			} else {
				this.warningIcon = (Number(this.totalLengh.replace(/%/g,"")) / Number(this.budgetLength.replace(/%/g,"")))  >= 1.2 ? true : false;
			}
		}
		
		if(rs != null && rs.getText != null) {
			if (this.budgetLength != "0%") {
	            this.tooltipContent = rs.getText("BarTooltipOverflow");
			} else {
	            this.tooltipContent = rs.getText("BarTooltipNoBudget");
			}
		} else {
			this.tooltipContent = "rs lib no exit, use default tooltip content";
		}

	},
	
	renderer : function(oRm, oControl) {
		oControl._init();

		//start of outside container
		oRm.write("<div class='budget_bar' ");
		oRm.writeControlData(oControl);
		oRm.addStyle("position", "relative");
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">");
		
		
		//warning icon
		oRm.write("<div class='warningIcon'");
		if(!oControl.warningIcon) {
			oRm.addStyle("display", "none");
		}
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("</div>");
		
		oRm.write("<div class='barWarningInformation'>");		
		oRm.write("</div>");		
		
		//in constant model, if budget is 0%, show nothing,
		//in scale model, show total/max even if budget is 0
		if(oControl.budgetLength == "0%" && oControl.getBarModel() == "constant") {
			oRm.write("</div>");
			return;
		}
		//container for bar and budget
		oRm.write("<div");
		oRm.addStyle("position", "absolute");
		oRm.addStyle("width", "100%");
		oRm.addStyle("height", "100%");
		oRm.addStyle("left", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">");
		//bar, set some CSS attributes that are not supposed to change
		oRm.write("<div class='budget_bar_total' bar-length='" + oControl.totalLengh + "'");
		oRm.addStyle("position", "absolute");
		oRm.addStyle("top", "10%");
		oRm.addStyle("width", "0px");
		oRm.addStyle("height", "80%");
		oRm.addStyle("background-color", oControl.color);				
		oRm.writeStyles();
		oRm.write(">");
		//committed part
		if(!oControl.warningIcon) {
			oRm.write("<div class='budget_bar_committed'");
			oRm.addStyle("float", "right");
			oRm.addStyle("height", "100%");
			oRm.addStyle("width", oControl.committedLengh); 
			//oRm.addStyle("background-color", oControl.committedColor); //set color in css
			oRm.writeStyles();
			oRm.write("/>");
		}
		oRm.write("</div>");
		//budget line
		oRm.write("<div");
		oRm.addStyle("position", "absolute");
		oRm.addStyle("width", "2px");
		oRm.addStyle("height", oControl.getHeight());
		oRm.addStyle("top", "0px");
		oRm.addStyle("left", oControl.budgetLength);
		oRm.addStyle("background-color", "black");
		if( oControl.budgetLength == "0%") {
			oRm.addStyle("display", "none");
		}
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("</div>");
		oRm.write("</div>");
		//container for bar and budget end
		
		
		//end of outside container
		oRm.write("</div>");
	},
	
	barWarningInfoHandle : function(){
		var imgElement = $("#" +  this.getId()).find('.warningIcon');
		var lengthRatio = "";
		if(this.getBudget() != 0){
			lengthRatio = Math.round(this.getTotal()/this.getBudget() *100 )  +"%";
		}
		else{
			lengthRatio = "0%";
		}
		
		var info =  $("#" +  this.getId()).find('.barWarningInformation');
		info.empty();			
		var strHtml = '';
		var ttStr = (lengthRatio == "0%") ? this.tooltipContent : this.tooltipContent + lengthRatio + ")";
		strHtml += '<div > <button class = "dummy_button">' + ttStr + '</button></div>';
		info.append(strHtml);
		
		var popup;
		//bind tooltip event
		$("#" + this.getId()).find('.warningIcon').bind("mouseover", function(event){					
			popup = new sap.ui.core.Popup(info, false, true, true);
			popup.open(0, sap.ui.core.Popup.Dock.LeftCenter , sap.ui.core.Popup.Dock.CenterCenter , imgElement, "22, -3");				
		}).bind("mouseout", function(event) {
			popup.destroy();			
		});
	},
	
	onAfterRendering : function() {
		var oControl = this;
		//annimate bar length
		var realLength = this.totalLengh;
		var controlId = this.getId();
		
		if(this.warningIcon) {			
			this.barWarningInfoHandle();
			
			$("#" + controlId).find('div[bar-length="' + realLength + '"]').animate({
			    width: '+='  + "90%",
			  }, 1000, function() {
				var toothsize = 5;
				var tcWidth = 2 * toothsize + "px";
				  
				//add a container to hold sawtooth
				var $teethContainer = $("<div>").css("position", "absolute").css("overflow", "hidden");
				$teethContainer.css("left", "100%").css("width", tcWidth).css("height", "100%");
				$teethContainer.appendTo($(this));
			    //add a sawtooth effect. left side
				var howmanyteeth = parseInt((Number(oControl.getHeight().replace(/[Pp][Xx]|% |[Ee][Mm]/g,"")) *0.8) / toothsize); //the reason multiple 0.8 is because width of bar is usually 80% of total control height
				for(var i = 0; i< howmanyteeth; i ++) {
					var $tri = $("<div>");
					$tri.addClass("tri_left");
					$tri.css("top", i * toothsize + "px");
					$tri.css("border-width", toothsize + "px");
					$tri.css("border-color", "transparent transparent transparent " + oControl.color);
					$tri.appendTo($teethContainer);
				}
				
				//right side, left side is 90%, then right side + gap should be 10%
				var $right_div = $("<div>");
				$right_div.css("position", "absolute");
				$right_div.css("height", "100%");
				$right_div.css("width", "7%");
				$right_div.css("left", "103%");
				$right_div.css("top", "0px");
				$right_div.css("background-color", oControl.color);
				//add a container to hold sawtooth
				var $teethContainerR = $("<div>").css("position", "absolute").css("overflow", "hidden");
				$teethContainerR.css("left", "-" + tcWidth).css("width", tcWidth).css("height", "100%");
				$teethContainerR.appendTo($right_div);
				for(var i = 0; i< howmanyteeth; i ++) {
					var $tri = $("<div>");
					$tri.addClass("tri_right");
					$tri.css("top", i * toothsize + "px");
					$tri.css("border-width", "6px"); //bigger than toothsize=5, to make sure it will fit
					$tri.css("border-color", "transparent " + oControl.color + " transparent transparent");
					$tri.appendTo($teethContainerR);
				}
				$right_div.appendTo($(this));
			  });
		} else {
			$("#" + controlId).find('div[bar-length="' + realLength + '"]').animate({
			    width: '+=' + realLength,
			  }, 1000, function() {
			    // Animation complete.
			  });
		}
		
		
		
	},
	
	
});