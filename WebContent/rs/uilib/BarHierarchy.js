
sap.ui.core.Control.extend("rs.uilib.BarHierarchy", {
	
	metadata : {
		properties : {
			"data":"object",
			"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "1280px"},
			"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "800px"},
			"barHeight":{type:"sap.ui.core.CSSSize",defaultValue:"25px"},
			"hierType":{type: "string", defaultValue: "CCG"},
		},
		events: 
		{
			"barSelect" : {},
		}        		
	},
	
	init: function() {
		this.id = this.getId() || "DefaultBarHierchyId";
		this.charContentId = this.id + "-chartContentId";
		this.w = parseInt(this.getWidth());
		this.h = parseInt(this.getHeight());
		this.parentId = this.getId().substr(0,5);
		this._backBtn = sap.ui.getCore().byId(this.parentId + "--BackBtnId");
	},
	
	
	renderer : function(oRm, oControl) {	
		oControl.init();
	
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.write(">");

		oRm.write("<div id="+ oControl.charContentId );
		oRm.addStyle("position", "absolute");
		oRm.addStyle("overflow-x", "auto" );
		oRm.addStyle("overflow-y", "auto" );
		oRm.addStyle("height", oControl.h-37+"px" );
		oRm.addStyle("width", oControl.w-40+"px" );
		oRm.addStyle("left", "0px" );
		oRm.addStyle("top", "20px" );
		oRm.writeStyles();
		oRm.write(">");

		oRm.write("</div>");
		
		oRm.write("</div>");
	},
	
	_fireBarSelectEvent:function()
	{
		this.fireBarSelect({hierId: this._eventData.hierId, 
						name: this._eventData.name, 
						total: this._eventData.total,
						variance:this._eventData.variance,
						variancePercentage:this._eventData.variancePercentage,
						parentId:this.parentId,
						barHighlighted: this.barHighlighted});		
	},


	onAfterRendering : function() {		

		var m = [20, 80, 20, 160], // top right bottom left
		w = parseInt(this.getWidth()) - m[1] - m[3], // width
		h = parseInt(this.getHeight()) - m[0] - m[2], // height

	    		
		x = d3.scale.linear().range([0, w]),
		y =  parseInt(this.getBarHeight()); // bar height		
        
		var aData;
		if(this.dCopy == null){
			aData = this.getData();
		}
		else{
			aData = this.dCopy;
		}
		
		var hierType = this.getHierType();
		var hierarchy = d3.layout.partition()
						    .value(function(d) {
								    	if(d.Budget != 0){
								    		return (d.Total/d.Budget);
								    	}
								    	else{
								    		return 0;
								    	}
								    });

		var that = this; 
		
		var formatPercent = d3.format(".0%");	
		var alreadyclicked= false;
		var alreadyclickedTimeout= null;
		var eventData = null;
		var eventIndex=0;
		var lastEventIndex = 0;
		var selectedbar = null;
		var lastSelectedbar = null;
		var lastSelectedName = "";
		var contentId = "#"+this.charContentId;
		var barChartId = "#"+this.getId();
		
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("top")			    
			.tickFormat(formatPercent);	
		
		
		var nodes= hierarchy.nodes(aData);
		
		var svgHeight;
		if(aData.children)
		{
			svgHeight = Math.max(aData.children.length * (y*1.6), parseInt(this.getHeight())-40);	//1.6 is the whole one bar height including margin
		} 
		else
		{
			svgHeight = Math.max((y*1.6), parseInt(this.getHeight())-40);	//1.6 is the whole one bar height including margin	
		}
		 

		var svgWidth = parseInt(this.getWidth())-60;	
		
		var svg = d3.select("#"+this.getId()).append("svg")
		.attr("class","noEnter")
	    .attr("width",svgWidth)
	    .attr("height", svgHeight)
	    .append("g")
	    .attr("transform", "translate(" +  m[3] + "," +  m[0] + ")");
		
	
		svg.append("rect")
		    .attr("class", "barHierRectBackground")
		    .attr("width", svgWidth-160)	//rect width, should reduce the text width 160
		    .attr("height", h);
	
		svg.append("g")
		    .attr("class", "x barHierAxis");
	
		svg.append("g")
		    .attr("class", "y barHierAxis");
	

		x.domain([0, aData.value]).nice();

		  
		var svg1 = d3.select("#"+this.charContentId).append("svg")
			.attr("class","needEnter")
		    .attr("width", svgWidth)
		    .attr("height", svgHeight)
		    .append("g")
		    .attr("class", "content")
		    .attr("transform", "translate(" +  m[3] + "," + 0 + ")");

		
		down(aData, 0);
				  
   	  function contentReOrganize(){
   		 var enter = $(barChartId).find(".noEnter").find(".enter");
   		 
   		 if(enter.length != 0){
   			$(contentId).find(".enter").remove();
   			$(contentId).find(".content").append(enter);
   		 }

   	  }		
   	  
	  function removeSVGDomNode(){
		  $(barChartId).find(".noEnter").remove();
		  $(contentId).find(".needEnter").remove();
	  }	  
	  
		function down(d, i) {
		  if (d.children == null || d.children.length == 0 || this.__transition__) return;
		  
		  that.dCopy = d;
		  //update the current level bar header info
		  if (d.parent == null ){
			  that._backBtn.setVisible(false);
			  that.barHighlighted = false;	//no bar highlighted
			  that._fireBarSelectEvent();
		  }
		  else{		
			  
			  updateBarHierarchyHeaderInfo(d);
			  
			  that._backBtn.setVisible(true);
			  if(!that.backBtnAttachedFlg){
				  that._backBtn.attachPress(up, this);
				  that.backBtnAttachedFlg = true;
			  }			  			  
			  
		  }
		  
		  
		  var duration = d3.event && d3.event.altKey ? 7500 : 750,
		      delay = duration / d.children.length;
	
		  // Mark any currently-displayed bars as exiting.
		  var exit = svg.selectAll(".enter").attr("class", "exit");
	
		  // Entering nodes immediately obscure the clicked-on bar, so hide it.
		  exit.selectAll("rect").filter(function(p) { return p === d; })
		      .style("fill-opacity", 1e-6);
	
		  // Enter the new bars for the clicked-on data.
		  // Per above, entering bars are immediately visible.
		  var enter = bar(d)
		      .attr("transform", stack(i))
		      .style("opacity", 1);
		 
		  // Have the text fade-in, even though the bars are visible.
		  // Color the bars as parents; they will fade to children if appropriate.
		  enter.select("text").style("fill-opacity", 1e-6);
	
		  // Update the x-scale domain.
		  x.domain([0, d3.max(d.children, function(d) { return value(d); })]).nice();
			  
		  xAxis.tickValues(calculateTicksValue(x.ticks(30)));	//30 is large enough
		  
		  // Update the x-axis.
		  svg.selectAll(".x.barHierAxis").transition()
		      .duration(duration)
		      .call(xAxis);
		  
		  // Transition entering bars to their new position.
		  var enterTransition = enter.transition()
		      .duration(duration)
		      .delay(function(d, i) { return i * delay; })
		      .attr("transform", function(d, i) { return "translate(0," + y * i * 1.6 + ")"; });
	
		  // Transition entering text.
		  enterTransition.select("text").style("fill-opacity", 1);
	
		  // Transition entering rects to the new x-scale.
		  enterTransition.select("rect")
		      .attr("width", function(d) { return x(value(d)); });
	
		  // Transition exiting bars to fade out.
		  var exitTransition = exit.transition()
		      .duration(duration)
		      .style("opacity", 1e-6)
		      .remove();
	
		  // Transition exiting bars to the new x-scale.
		  exitTransition.selectAll("rect").attr("width", function(d) { return x(value(d)); });
	
		  // Rebind the current node to the background.
		  svg.select(".barHierRectBackground").data([d]).transition().duration(duration * 2); 
		  
		  d.index = i;

		  contentReOrganize();
		
		}
	
		function up(d) {
		  var d = that.dCopy;
		  if (d.parent == null || this.__transition__) return;
		  

		  that.dCopy = d.parent;
		  removeSVGDomNode();

		  that.onAfterRendering();

		}
		
		function updateBarHierarchyHeaderInfo(data)
		{
			that._eventData.name = data.Name;
			that._eventData.total = data.Total;
			that._eventData.variance = data.Variance;			
			that._eventData.variancePercentage = data.VariancePercentage;

			that.barHighlighted = true;
			lastSelectedName = that._eventData.name;	//save current selection
			switch ( hierType ) 
			{
				case rs.HierType.Dep:
					that._eventData.hierId = data.CCHierarchyNodeID;
					break;
				case rs.HierType.Exp:
					that._eventData.hierId = data.CEHierarchyNodeID;
					break;
				case rs.HierType.Prj:
					that._eventData.hierId = data.IOHierarchyNodeID;
					break;
				default:
					rs.assert(false);
					break;
			}

			that._fireBarSelectEvent();
			
		}
		
		function fireClick()
		{
			alreadyclicked = false;
			
			d3.select(barChartId).selectAll(".enter").selectAll("rect").attr("height",y);
			d3.select(barChartId).selectAll(".enter").selectAll("text").attr("y",y/2);
			if(lastSelectedbar != null){
				$(lastSelectedbar).attr("transform", function() {   return "translate(0," + (y * lastEventIndex * 1.6) + ")";});
				$(lastSelectedbar).attr("stroke","transparent");
				$(lastSelectedbar).attr("stroke-width","0");
			}
			
			var data = null;
			var name = eventData.Name;
			if(name == lastSelectedName){
				//need to roll back and display the parent info
				if(eventData.parent.Name != null){
					data = eventData.parent;
					if(data.Name.length > 20){
						//for bold font, if >20, some characters have been reduced,now roll back to the name characters
			    		  $(selectedbar).children("text").text(data.Name);
			    	}
				}
				else{
					//back to root
					lastSelectedName = "";
					down(aData, 0);
					that.barHighlighted = false;
					that._fireBarSelectEvent();
					return;
				}
				
			}
			else{
				//just show the current bar info
				$(selectedbar).children("rect").attr("height",y+8);
				$(selectedbar).children("text").attr("y",y/2 + 5);
				$(selectedbar).attr("transform", function() {   return "translate(0," + (y * eventIndex * 1.6-4) + ")";});
				$(selectedbar).attr("stroke","black");
				$(selectedbar).attr("stroke-width","1");
				lastSelectedbar = selectedbar;	
				lastEventIndex = eventIndex;
				
				data = eventData;
				//for bold font, need reduce some characters
				if(data.Name.length > 19){
		    		  $(selectedbar).children("text").text(data.Name.substr(0,17) + "...");
		    	}
								
			}
			
			updateBarHierarchyHeaderInfo(data);
	
		}
		
	
		function showDetail(d,i){
			//using timer to delay single click event because of conflict with double click.
			if(true == alreadyclicked)
			{
				alreadyclicked = false;
				if(alreadyclickedTimeout)
				{
					clearTimeout(alreadyclickedTimeout);	
				}
				//dbl click, enter into child node
				down(eventData,eventIndex);
				  
			}
			else
			{
				alreadyclicked = true;
				eventData = d;
				eventIndex = i;
				selectedbar = this;
				alreadyclickedTimeout = setTimeout(function() {
					fireClick();
				}, 600);
			}			

		}
		// Creates a set of bars for the given data node, at the specified index.
		function bar(d) {
		  var bar = svg.insert("svg:g", ".y.barHierAxis")
		      .attr("class", "enter")
		      .attr("transform",function(){if($.browser.msie){		    	  									
		    	  								if(d.children.length * y*1.6 < h){
		    	  									return "translate(-10,5)";
		    	  								}
		    	  								else{
		    	  									//show scroll, need re-adjust the position in IE9
		    	  									return "translate(-2,5)";
		    	  								}
												
										   }
										   else{
											   return "translate(0,5)";  
										   }})
		    .selectAll("g")
		      .data(d.children)
		    .enter().append("svg:g")
		      .style("cursor", function(d) { return !d.children ? null : "pointer"; })		      
		      .on("click", showDetail);
	
		  bar.append("svg:text")
		      .attr("x", -6)
		      .attr("y", y/2+1)
		      .attr("dy", ".35em")
		      .attr("text-anchor", "end")
		      .text(function(d) { 
		    	  	  /*for current font size and the whole txt width, the max character number is 20*/
			    	  if(d.Name.length > 20){
			    		  return d.Name.substr(0,18) + "...";
			    	  }
			    	  else{
			    		  return d.Name; 
			    	  }
		    		});
	
		  bar.append("svg:rect")
		      .attr("width", function(d) { return x(value(d)); })
		      .style("fill", function(d) { return rs.view.getColorByVariancePercentage(d.VariancePercentage,d.Total); })
		      .attr("height", y);

		  	
		  return bar;
		}
			
		function value(d){
			if(d.Budget == 0){
				return 0;
			}
			else{
				return d.Total/d.Budget;
			}
		}
		
		// A stateful closure for stacking bars horizontally.
		function stack(i) {
		  var x0 = 0;
		  return function(d) {
		    var tx = "translate(" + x0 + "," + y * i * 1.6 + ")";
		    x0 += x(value(d));
		    return tx;
		  };
		}
		
		function calculateTicksValue(scaleTicks){
			var axisWidth =  svgWidth-160;
			var maxTickCnt = axisWidth/40	; //40 is for each tick value + padding
			if(scaleTicks.length <= maxTickCnt){
				//there are enouth space to draw the tick value in axis
				return scaleTicks;
			}
			else{
				// need reduce some tick values
				var ticks = [];
				if(maxTickCnt > 2){
					var mod = Math.round(scaleTicks.length/maxTickCnt) +1;
					for(var i = 0;i <scaleTicks.length ;i++){
						if( i % mod == 0){
							ticks.push(scaleTicks[i]);
						}
					}										
				}
				ticks.pop();
				ticks.push(scaleTicks[scaleTicks.length-1]);	//the last one always need
				return ticks;
			}
		}

	},
	
	_eventData: 
	{
		hierId: "",
		name: "",
		total: 0,
	    variance:0,
	    variancePercentage: 0
	},

	dCopy: null,
	backBtnAttachedFlg : false,
	barHighlighted : false
});


