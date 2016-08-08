sap.ui.core.Control.extend("rs.uilib.AreaChart", {
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
			"commitColor"     : {
				type         : "sap.ui.core.CSSColor",
				defaultValue : "#004CB3" 
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
				defaultValue : "black"
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
	 * define the gradient for background and area chart
	 * @param svg
	 */
	_defineGradient : function(svg){
		var gradientBackground = svg.append("svg:defs").append("svg:linearGradient").attr("id", "gradientBackground").attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "0%").attr("y2", "100%");
		gradientBackground.append("svg:stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", 1);
		gradientBackground.append("svg:stop").attr("offset", "100%").attr("stop-color", "#eeeeee").attr("stop-opacity", 1);
		
		var gradientCommit = svg.append("svg:defs").append("svg:linearGradient").attr("id", "gradientCommit").attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "0%").attr("y2", "100%");	
		gradientCommit.append("svg:stop").attr("offset", "0%").attr("stop-color", this.getCommitColor()).attr("stop-opacity", 0.6);
		gradientCommit.append("svg:stop").attr("offset", "100%").attr("stop-color", this.getCommitColor()).attr("stop-opacity", 0.1);   
		
		var gradientPrevious = svg.append("svg:defs").append("svg:linearGradient").attr("id", "gradientPrevious").attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "0%").attr("y2", "100%");
		gradientPrevious.append("svg:stop").attr("offset", "0%").attr("stop-color", this.getPreviousColor()).attr("stop-opacity", 0.4);
		gradientPrevious.append("svg:stop").attr("offset", "100%").attr("stop-color", this.getPreviousColor()).attr("stop-opacity", 0.1);
	},
	/**
	 * create the background for area chart
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
	  	.attr("fill","url(#gradientBackground)");
	},
	/**
	 * create the x and y axis for area chart
	 * @param svg
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	_createAxis:function(svg,x,y,width,height){
		var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
	    .tickSize(-height);
		
		var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(5)
		.tickSize(-width);
		
		var temp=-x.rangeBand()/2;	
		svg.append("g")
		.attr("class", "axis2")
		.attr("transform", "translate("+temp+"," + height + ")")
		.call(xAxis);
	        
		var currency=this.getCurrency();  
		svg.append("g")
		.attr("class", "axis2")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(0)")
		.attr("y", 6)
		.attr("x",10)
		.attr("font-size","20px")
		.attr("dy", ".91em")
		.text("("+currency+")");	
		
		// create x and y axis	  
		svg.append("line")
		.attr("x1","0")
		.attr("y1",height)
		.attr("x2",width*0.95)
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
	 * create commit and previous areas 
	 * @param svg
	 * @param aPrevious
	 * @param aCommit
	 * @param area
	 */
	_createAreas : function(svg,aPrevious,aCommit,area){
		//create commit area    
		var commit=svg.append("path")
		.datum(aPrevious)
		.attr("fill","url(#gradientCommit)")
		.attr("d",area);	
		
		// create previous area	  
		var previous=svg.append("path")
		.datum(aCommit)
		.attr("fill","url(#gradientPrevious)")	      
		.attr("d", area);
		// set animation	
		previous
		.datum(aPrevious)
		.transition()
		.duration(1000)
		.attr("d", area);      
		commit
		.datum(aCommit)
		.transition()
		.duration(1000)
		.attr("d", area);
	},
	onAfterRendering : function() {		
		//format data
		var aPrevious=[];
		var aCommit=[];
		var aProjection=[];
		var aBudget=[]; 
		var aData=this.getData();		
		$.each(aData,function(key, ele){									
		var	formatedData = rs.util.Util.formatPeriod( ele.Period, true);    
			aCommit.push(    {date: formatedData,  count: ele.Total});
			aPrevious.push(  {date: formatedData,  count: ele.LastYearTotal});
			aBudget.push(	    {date: formatedData,  count: ele.Budget});
			aProjection.push({date: formatedData,  count:  ele.Projection});
		});		
		
		// set chart size
		var margin = {top: 20, right: 20, bottom: 50, left: 100};
		var width  = parseInt(this.getWidth()) - margin.left - margin.right;
		
		if(aCommit.length==2)
		{	
			width = parseInt(this.getWidth())+950;
		}
		else if(aCommit.length==4)
			width = parseInt(this.getWidth())+200;
		var height = parseInt(this.getHeight()) - margin.top - margin.bottom;
		
		var svg = d3.select("#"+this.getId()).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	    // get max value
		var MaxValue=[];	
		MaxValue.push(d3.max(aCommit, function(d) { return d.count; }));
		MaxValue.push(d3.max(aBudget, function(d) { return d.count; }));
		MaxValue.push(d3.max(aProjection, function(d) { return d.count; }));
		MaxValue.push(d3.max(aPrevious, function(d) { return d.count; }));
		
		//set range
		var x = d3.scale.ordinal()
		.rangeRoundBands([0, width]);		
		var y = d3.scale.linear()
		.range([height, 0]);
		x.domain(aCommit.map(function(d) { 
			return d.date; 
		}));
		y.domain([0.001, d3.max(MaxValue)*1.1]);	
	
		var line = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.count); });
		
		var area = d3.svg.area()
		.x(function(d) { return x(d.date); })
		.y0(height)
		.y1(function(d) { 
			return y(d.count); });		
		
		//define gradient
		this._defineGradient(svg);
		
		//create background
		this._createBackground(svg,width,height);
		
		//create axis
		this._createAxis(svg,x,y,width,height);

		//create areas
		this._createAreas(svg,aPrevious,aCommit,area);
		
		// create projection line  
		this._createProjection(svg,aProjection,aCommit,line);
	
		// create budget line  
		this._createBudget(svg,aBudget,line);
	},
	/**
	 * create projection line
	 * @param svg
	 * @param aProjection
	 * @param aCommit
	 * @param line
	 */
	_createProjection : function(svg,aProjection,aCommit,line){
		var dataProjection= [];		  		  		  
		var count=0;		  
		$.each(aProjection,function(key,ele){
			if(ele.count>0)
			{
				if(count!=1)
					dataProjection.push(aCommit[key-1]);
				dataProjection.push(ele);
				count=1;
			}
		});		  
		svg.append("path")
		.datum(dataProjection)
		.attr("fill","none")
		.attr("stroke",this.getProjectionColor())
		.attr("stroke-width","1.5px")
		.attr("stroke-dasharray","4px")		  
		.attr("d", line);
	},
	/**
	 * create budget line
	 * @param svg
	 * @param aBudget
	 * @param line
	 */
	_createBudget : function(svg,aBudget,line){
		svg.append("path")
		.datum(aBudget)
		.attr("fill","none")
		.attr("stroke",this.getBudgetColor())
		.attr("stroke-width","1.5px")
		.attr("d", line);	  
	},
});