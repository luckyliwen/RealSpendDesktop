sap.ui.core.Control.extend("rs.uilib.BarChart", {
	metadata : {
		properties : {  
			"data"            : "object",
			"width"           : {
				type         : "sap.ui.core.CSSSize",
				group        : "Dimension", 
				defaultValue : null
			},
			"height"          : {
				type         : "sap.ui.core.CSSSize", 
				group        : "Dimension", 
				defaultValue : null
			},
			"barWidth"        : {
				type         : "sap.ui.core.CSSSize",
				defaultValue : "30px"
			},
			"interval"        : {
				type         : "sap.ui.core.CSSSize",
				defaultValue : "3px"
			},		 
			"commitColor"     : {
				type         : "sap.ui.core.CSSColor",
				defaultValue : "#7AAED6"
			},
			"projectionColor" : {
				type         : "sap.ui.core.CSSColor",
				defaultValue : "#B8D4E9"
			},
			"budgetColor"     : {
				type         : "sap.ui.core.CSSColor",
				defaultValue : "black"
			},		 
			"previousColor"   : {
				type         : "sap.ui.core.CSSColor",
				defaultValue : " #CCC"
			},
			"currency"        : {
				type         : "string",
				defaultValue : "$"
			}
		}
	},
	
	renderer : function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addStyle("background", "white");
		oRm.addStyle("border-top","1px solid grey");
		oRm.addStyle("border-left","1px solid grey");
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("</div>");
	},
	/**
	 * create background for area chart
	 * @param svg
	 * @param width
	 * @param height
	 */
	_createBackground : function(svg,width,height){
		svg.append("rect")
	  	.attr("x",0)
	  	.attr("y",0)
	  	.attr("width",width)
	  	.attr("height",height)
	  	.attr("fill","url(#gradientBarBackground)");
	},
	/**
	 * define the gradient for background and bar chart
	 * @param svg
	 */
	_defineGradient : function(svg){	
		var gradientBackground = svg.append("svg:defs").append("svg:linearGradient").attr("id", "gradientBarBackground").attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "0%").attr("y2", "100%");
		gradientBackground.append("svg:stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", 1);
		gradientBackground.append("svg:stop").attr("offset", "100%").attr("stop-color", "#eeeeee").attr("stop-opacity", 1);
		
		var gradientCommit = svg.append("svg:defs").append("svg:linearGradient").attr("id", "gradientCommitBar").attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%");
		gradientCommit.append("svg:stop").attr("offset", "0%").attr("stop-color", "#a2c6e2").attr("stop-opacity", 1);
		gradientCommit.append("svg:stop").attr("offset", "20%").attr("stop-color", "#bdd7eb").attr("stop-opacity", 1);
		gradientCommit.append("svg:stop").attr("offset", "80%").attr("stop-color", "#6e9dc1").attr("stop-opacity", 1);
		gradientCommit.append("svg:stop").attr("offset", "100%").attr("stop-color", "#87b6da").attr("stop-opacity", 1);   
		
		var gradientPrevious = svg.append("svg:defs").append("svg:linearGradient").attr("id", "gradientPreviousBar").attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%");
		gradientPrevious.append("svg:stop").attr("offset", "0%").attr("stop-color", "DarkGray").attr("stop-opacity", 1);
		gradientPrevious.append("svg:stop").attr("offset", "20%").attr("stop-color", "Silver").attr("stop-opacity", 1);
		gradientPrevious.append("svg:stop").attr("offset", "80%").attr("stop-color", "DimGray").attr("stop-opacity", 1);
		gradientPrevious.append("svg:stop").attr("offset", "100%").attr("stop-color", "Gray").attr("stop-opacity", 1);
	},
	/**
	 * create x and y axis for bar chart
	 * @param svg
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	_createAxis:function(svg,x,y,width,height){
		//set axis for trend chart
		var xAxis = d3.svg.axis()
		.scale(x)
	    .orient("bottom")
	    .tickSize(-height);
	
		var yAxis = d3.svg.axis()
		.scale(y)
	    .orient("left")
        .ticks(5)
        .tickSize(-width);
		
		svg.append("g")
		.attr("class", "axis1")
		.attr("transform", "translate(0," +height + ")")
		.call(xAxis);
    
		var currency=this.getCurrency();
		svg.append("g")
		.attr("class", "axis1")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(0)")
		.attr("y", 6)
		.attr("x",30)
		.attr("font-size","20px")
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("("+currency+")");
   
		svg.append("line")
		.attr("x1","0")
		.attr("y1",height)
		.attr("x2",width*0.99)
		.attr("y2",height)
		.attr("stroke-width","2px")
		.attr("stroke","black"); 		

		svg.append("line")
		.attr("x1","0")
		.attr("y1","0")
		.attr("x2","0")
		.attr("y2",height)
		.attr("stroke-width","1px")
		.attr("stroke","black");
	},
	/**
	 * set animation for bar chart
	 * @param barCP
	 * @param barPJ
	 * @param height
	 * @param yBar
	 */
	_setAnimation:function(barCP,barPJ,height,yBar){
		
		barCP.transition()
		.delay(function(d, i) { return i * 100; })
		.attr("y", function(d) { return height-yBar(d.count); })
		.attr("height", function(d) { return yBar(d.count); });

		barPJ.transition()
		.delay(function(d, i) { return i * 100; })
		.attr("y", function(d) { 
			if(d.name=="PreviousBar")
			{
				return 0;
			}
			else
				return height-yBar(d.count);
		})
		.attr("height", function(d) { 
			if(d.name=="PreviousBar")
			{
				return height;
			}
			else
			{
				return yBar(d.count); 
			}
		});
	},
	/**
	 * format the trend data
	 * @returns {Array}
	 */
	_formatData:function(){
		var data = $.extend(true,{},this.getData());
        var trendData = [];
		$.each(data,function(idx, ele){
			ele.barCP = [{name:"CommitBar",count:ele.Total},{name:"PreviousBar",count:ele.LastYearTotal}];
			ele.barPJ = [{name:"CommitBar",count:ele.Projection},{name:"PreviousBar",count:0}];
			trendData.push(ele);
		});
		return trendData;
	},
	
	onAfterRendering : function() {				
		//define the size of chart
		var margin = {top: 20, right: 20, bottom: 50, left: 100};
		var width  = parseInt(this.getWidth()) - margin.left - margin.right;
	    var height = parseInt(this.getHeight()) - margin.top - margin.bottom;		
				
		//format data	
	    var trendData = this._formatData();		
	    var maxValue = d3.max(trendData,function(d){
	    	return Math.max(d.Total,d.LastYearTotal,d.Projection,d.Budget);
	    });
		
	    //set range
		var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .4);
		
		var y = d3.scale.linear()
		.range([height,0]);
		
		var yBar = d3.scale.linear()
		.range([0,height]);
		
		var xBar = d3.scale.ordinal();
		
		// set range domain
		x.domain(trendData.map(function(d) { 
			return rs.util.Util.formatPeriod( d.Period, true); 
		}));
		xBar.domain(["commit","previous"]).rangeRoundBands([0, x.rangeBand()]);
		y.domain([0, maxValue*1.1]);
		yBar.domain([0, maxValue*1.1]);
		
		var line = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.count); });
	
		var svg = d3.select("#"+this.getId()).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		// set gradient		
		this._defineGradient(svg);
		
		//draw background
		this._createBackground(svg,width,height);
	  	
	  	//create Axis
	  	this._createAxis(svg,x,y,width,height);
	  	
	  	//create bar group
	  	var barChart = this._createBarGroup(svg,trendData,x);
	  	var barCP = this._createBarCP(svg,xBar,yBar,height,barChart);
	  	var barPJ = this._createBarPJ(xBar,height,barChart);
	  	
        //set animation
		this._setAnimation(barCP,barPJ,height,yBar);
			
		//create budget lines
		this._createBudget(svg,trendData,x,height,yBar);	
		
		//create tooltip
		this._createTooltip(svg);
	},
	/**
	 * create bar group projection
	 * @param xBar
	 * @param height
	 * @param barChart
	 * @returns
	 */
	_createBarPJ : function(xBar,height,barChart){
		var projectionColor = this.getProjectionColor();
		var barPJ = barChart.selectAll("barPJ")
		.data(function(d) { return d.barPJ; })
		.enter().append("rect")
		.attr("width",function(d){
			if(d.name=="PreviousBar")
			{
				return xBar.rangeBand()*2;
			}
			else
				return xBar.rangeBand()-2;
		})
		.attr("x", function(d) { 
			if(d.name=="PreviousBar")
			{
				return xBar(d.name)-4-xBar.rangeBand();
			}
			else
				return xBar(d.name)-3; 
		})
		.attr("y", height)
		.attr("height", 0)
		.attr("fill",function(d){
			if(d.name=="PreviousBar")
			{
				return "rgba(133,133,133, 0.2)";
			}
			else
				return "none";
				
		})
		.attr("opacity",function(d){
			if(d.name == "PreviousBar")
				return 0;
			else
				return 1;
		})
		.attr("stroke",function(d){
			if(d.name=="PreviousBar")
			{
				return "none";
			}
			else
				return projectionColor;
		})
		.attr("stroke-width","2px")
		.attr("stroke-dasharray","6px");
		return  barPJ;
	},
	/**
	 * create bar group for commit and previous
	 * @param svg
	 * @param xBar
	 * @param yBar
	 * @param height
	 * @param barChart
	 * @returns
	 */
	_createBarCP : function(svg,xBar,yBar,height,barChart){
		var roundCorner = svg.append("svg:defs");		     
		var count = 0;
		var barCP = barChart.selectAll("barCP")
		.data(function(d) {
			return d.barCP;
		})
		.enter().append("rect")
		.attr("width", xBar.rangeBand()-8)
		.attr("x", function(d) {
			return xBar(d.name);
		})
		.attr("y", height)
		.attr("height", 0)
		.attr("fill", function(d){
			return  "url(#gradient"+d.name+")";
		})
		.attr("clip-path",function(d){
			count++;
			var clipId="clipCommit"+count;
			roundCorner.append("clipPath")
			.attr("id",clipId)
			.append("rect")
			.attr("rx","5")
			.attr("ry","5")
			.attr("x",xBar(d.name))
			.attr("y",height-yBar(d.count) )
			.attr("width",xBar.rangeBand()-8)
			.attr("height",yBar(d.count)+4)
			.transition().duration(1000);
			return "url(#clipCommit"+count+")";
		});
		return barCP;
	},
	/**
	 * create bar group
	 * @param svg
	 * @param trendData
	 * @param x
	 * @returns
	 */
	_createBarGroup : function(svg,trendData,x){
	  	var currentId = this.getId();
	  	var barChart = svg.selectAll(this.getId())
	  	.data(trendData)
		.enter().append("g")
		.attr("class", "group")
		.attr("cursor","pointer")
		.on("mouseover",function(data){
			d3.select("#"+currentId+"commit").text(data.Total);
			d3.select("#"+currentId+"previous").text(data.LastYearTotal);
			d3.select("#"+currentId+"projection").text(data.Projection);
			d3.select("#"+currentId+"budget").text(data.Budget);
			var transform = $(this).attr("transform");
			$(this).find("rect").last().attr("opacity", 1);
			d3.select("#"+currentId+"tooltip").attr("transform",transform);
			d3.select("#"+currentId+"tooltip").attr("visibility","visible");
		})
		.on("mouseout",function(){
			$(this).find("rect").last().attr("opacity", 0);
			d3.select("#"+currentId+"tooltip").attr("visibility","hidden");
		})
		.attr("transform", function(d) { 
			return "translate(" + x(rs.util.Util.formatPeriod( d.Period, true)) + ",0)"; 
		});
	  	return barChart;
	},
	/**
	 * create budget line
	 * @param svg
	 * @param trendData
	 * @param x
	 * @param height
	 * @param yBar
	 */
	_createBudget  : function(svg,trendData,x,height,yBar){
		svg.selectAll(this.getId())
		.data(trendData)
		.enter().append("line")
		.attr("fill", "none")
		.attr("stroke",this.getBudgetColor())
		.attr("stroke-width","1.5px")
		.attr("x1", function(d) {
			return x(rs.util.Util.formatPeriod( d.Period, true));
		})
		.attr("x2",  function(d) {
			return x(rs.util.Util.formatPeriod( d.Period, true))+x.rangeBand()-8;
		})
		.attr("y1", function(d) {
			return  height-yBar(d.Budget);
		})
		.attr("y2", function(d) {
			return height-yBar(d.Budget); 
		});
	},
	/**
	 * create tooltip for barchart
	 * @param svg
	 */
    _createTooltip : function(svg){
    	var currentId = this.getId();
		var tooltip = svg.append("g")
		.attr("width","500")
		.attr("id",currentId+"tooltip")
		.attr("height","500")
		.attr("visibility","hidden")
		.on("mouseover",function(data){
			d3.select("#"+currentId+"tooltip").attr("visibility","visible");	
		})
		.on("mouseout",function(){
			d3.select("#"+currentId+"tooltip").attr("visibility","hidden");
		});
		tooltip.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("width",125)
		.attr("height",225)
		.attr("stroke","black")
		.attr("fill","white")
		.attr("rx",5)
		.attr("ry",5)
		.attr("style",function(){
			return "stroke-width: 1px; -webkit-svg-shadow: rgba(0, 0, 0, 0.298039) 3px 3px 8px;";
		});
		//create Commit part
		tooltip.append("text")
		.attr("x",10)
		.attr("y",25)
		.attr("style",function(){
			return "font-size: 15;font-weight:bold";
		})
		.text("Commit");
		tooltip.append("rect")
		.attr("x",5)
		.attr("y",35)
		.attr("width",13)
		.attr("height",13)
		.attr("rx",2)
		.attr("ry",2)
		.attr("fill","url(#gradientCommitBar)");
		tooltip.append("text")
		.attr("id",currentId+"commit")
		.attr("x",120)
		.attr("y",45)
		.attr("text-anchor","end")
		.attr("style",function(){
			return "font-size: 10;";
		});

	   //create Previous part
		tooltip.append("text")
		.attr("x",10)
		.attr("y",75)
		.attr("style",function(){
			return "font-size: 15;font-weight:bold";
		})
		.text("Previous");
		tooltip.append("rect")
		.attr("x",5)
		.attr("y",85)
		.attr("width",13)
		.attr("height",13)
		.attr("rx",2)
		.attr("ry",2)
		.attr("fill","url(#gradientPreviousBar)");
		tooltip.append("text")
		.attr("id",currentId+"previous")
		.attr("x",120)
		.attr("y",95)
		.attr("text-anchor","end")
		.attr("style",function(){
			return "font-size: 10;";
		});
		//create Projection part
		tooltip.append("text")
		.attr("x",10)
		.attr("y",125)
		.attr("style",function(){
			return "font-size: 15;font-weight:bold";
		})
		.text("Projection");
		tooltip.append("rect")
		.attr("x",5)
		.attr("y",135)
		.attr("width",13)
		.attr("height",13)
		.attr("rx",2)
		.attr("ry",2)
		.attr("fill","none")
		.attr("stroke","#B8D4E9")
		.attr("stroke-dasharray","1px");
		tooltip.append("text")
		.attr("id",currentId+"projection")
		.attr("x",120)
		.attr("y",145)
		.attr("text-anchor","end")
		.attr("style",function(){
			return "font-size: 10;";
		});
		//create Budget part
		tooltip.append("text")
		.attr("x",10)
		.attr("y",175)
		.attr("style",function(){
			return "font-size: 15;font-weight:bold";
		})
		.text("Budget");
		tooltip.append("line")
		.attr("x1",5)
		.attr("y1",190)
		.attr("x2",18)
		.attr("y2",190)
		.attr("fill","none")
		.attr("stroke","black")
		.attr("stoke-width","1.5px");
		tooltip.append("text")
		.attr("id",currentId+"budget")
		.attr("x",120)
		.attr("y",195)
	    .attr("text-anchor","end")
		.attr("style",function(){
			return "font-size: 10;";
		});
    },
});