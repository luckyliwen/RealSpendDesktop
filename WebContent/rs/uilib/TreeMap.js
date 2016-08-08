sap.ui.core.Control.extend("rs.uilib.TreeMap", {
	
	
	 metadata : 
	 {                            
        properties : 
        {
			"width" : {type: "sap.ui.core.CSSSize", defaultValue: "1024px"},
			"height" : {type: "sap.ui.core.CSSSize", defaultValue: "600px"},
			//selector functions
			"nameSelector" : "object",
			"valueSelector" : "object",
			"colorSelector" : "object",
			
			//treemap data
			"data" : "object",   
        },
		events: 
		{
			"press" : {},
			"zoom": {}
		}        
	}, //end of metadata


	init : function()
	{
		this.touchEnabled = (jQuery.sap.touchEventMode !== "OFF");
	},
	
	_init : function()
	{
		
		if(this._bIsInited)
		{
			return;
		}
		else
		{
				this._bIsInited = true;
				
				//selector functions
				this.nameSelector = typeof(this.getNameSelector()) === "function" ? this.getNameSelector() : function(d){return d.name;};
				this.valueSelector = typeof(this.getValueSelector()) === "function" ? this.getValueSelector() : function(d) {return d.value;};
				this.colorSelector = typeof(this.getColorSelector()) === "function" ? this.getColorSelector() : function(d) {return d.color;};
				
				this.treeMapId = this.getId() + "-treeMap";
				
				this._rootNode = this.getData();
				this._currentNode = this._rootNode;					
		}

	},
		

	renderer : function(oRm, oControl) 
	{
		oControl._init();
	
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addStyle("position", "relative");
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("<div id=" + oControl.treeMapId + " class='treemap'");
		oRm.addStyle("display", "inline-block");
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("</div>");
		oRm.write("</div>");
	},
	
	
	onAfterRendering : function() 
	{
		this._drawTreeMap(this._currentNode);
	},
	
	refreshTreeMap: function()
	{
		var that = this;
		function rejustSize() 
		{
			this
				.style("left", function(d) 
				{
					return that._getLeftPosition(d);
				})
				.style("top", function(d) 
				{
					return that._getTopPosition(d);
				})
				.style("width", function(d) 
				{
					return that._getElementWidth(d);
				})	
				.style("height", function(d) 
				{
					return that._getElementHeight(d);
				})
				.style('opacity', function (data, i) 
				{
					var element = $(this);
					return that._getResizeOpacity(element, data);
				});						
					
		} // end rejust function		
		
		var element = this._treemapDiv.selectAll(".cell")	
				.data(this._treemap.value(function(d) { return that.valueSelector(d); }))
				.attr("class", function(d){return that._classSelector(d);})
				.style("background", function(d){return that._getBackground(d);});			
	
		element.transition()
        	.duration(500)
        	.call(rejustSize);	
				
	},		
	
	_zoomInTreeMap:function(data)
	{
		if(data.children && data.children.length)
		{
			this._zoomTreeMap(data);
		}
	},
	
	_zoomOutTreeMap:function(data)
	{
		if(data.parent && data.parent.parent)
		{
			this._zoomTreeMap(data.parent.parent);
		}
	},


	_zoomTreeMap:function(data)
	{
		this._currentNode = data;
		this._drawTreeMap(this._currentNode);
		this.fireZoom({zoomedObject:data});
	},
		
	
	_getLeftPosition:function(d)
	{
		var strLeft = "";
		if(2 == d.depth)
		{
			var nLeft;
			if(0 == d.parent.dx)
			{
				nLeft = d.x;
			}
			else
			{
				/*
				if parent decrease the width to give gap between adjacent level one cell, 
				we need decrease width according to our proportion in parent and move left position accordingly 
				*/ 
				if((d.parent.x + d.parent.dx) < (d.parent.parent.x + d.parent.parent.dx))
				{
					nLeft =  Math.ceil(d.x - ((d.x- d.parent.x)/d.parent.dx ) * this._levelOneMargin);
				}
				else
				{
					/* parent didn't change the width,  we just keep the original left position */
					nLeft = d.x;
				}
				
				/* get relative offset */
				nLeft -= d.parent.x;
				
			}
			strLeft = Math.max(0, nLeft) + "px";
		}
		else if((1 == d.depth) || (0 == d.depth))
		{
			strLeft =  Math.max(0, d.x) + "px";
		}
		else
		{
			strLeft =  "0px";
		}
		
		return strLeft;
	},
	
	_getTopPosition:function(d)
	{
		var strTop = "";
		if(2 == d.depth)
		{
			var nTop;
			if(0 == d.parent.dy)
			{
				nTop = d.y;
			}
			else
			{
				/*
				if parent decrease the height to give gap between adjacent level one cell, 
				we need decrease height according to our proportion in parent and move top position accordingly 
				*/ 				
				if((d.parent.y + d.parent.dy) < (d.parent.parent.y + d.parent.parent.dy))
				{
					nTop = Math.ceil(d.y - ((d.y - d.parent.y)/d.parent.dy) * this._levelOneMargin);
				}
				else
				{
					/* parent didn't change the height,  we just keep the original top position */
					nTop = d.y;
				}
				
				/* get relative offset */
				nTop -= d.parent.y;
			}
			strTop =  Math.max(0, nTop) + "px";
		}
		else if((1 == d.depth) || (0 == d.depth))
		{
			strTop =  Math.max(0, d.y)+ "px";
		}
		else
		{
			strTop =  "0px";
		}
		
		return strTop;
	},
	
	_getElementWidth:function(d)
	{
		var strWidth = "";
		if(0 == d.depth)
		{
			strWidth =  Math.max(0, d.dx) + "px";
		}
		else if(1 == d.depth)
		{
			var nWidth;
			/* if we have an adjacent sibling, leave 10 pixels for gap. 10 pixels for gap between level one cell */
			if((d.x + d.dx) < ( d.parent.x + d.parent.dx))
			{
				nWidth = d.dx - this._levelOneMargin;
			}
			else
			{
				nWidth = d.dx;
			}
			strWidth =  Math.max(0, nWidth) + "px";
		}
		else if(2 == d.depth)
		{
			var nWidth;
			if(0 == d.parent.dx)
			{
				nWidth = 0;
			}
			else
			{
				/*
				if parent decrease the width to give gap between adjacent level one cell, 
				we need decrease width according to our proportion in parent 
				*/ 					
				if((d.parent.x + d.parent.dx) < (d.parent.parent.x + d.parent.parent.dx))
				{
					nWidth = Math.floor(d.dx - (d.dx/d.parent.dx) * this._levelOneMargin);
				}
				else
				{
					/* parent didn't change the width,  we just keep the original width */
					nWidth = d.dx;
				}
				
				/* if we have an adjacent sibling, leave one pixel for gap */
				if((d.x + d.dx) < (d.parent.x + d.parent.dx))
				{
					nWidth -= 1;
				}
			}
			strWidth = Math.max(0, nWidth) + "px";	
		}
		else
		{
			strWidth = "0px";
		}
		
		return strWidth;
	},
	
	_getElementHeight:function(d)
	{
		var strHeight = "";
		if(0 == d.depth)
		{
			strHeight =  Math.max(0, d.dy) + "px";
		}
		else if(1 == d.depth)
		{
			var nHeight;
			/* if we have an adjacent sibling, leave 10 pixels for gap. 10 pixels for gap between level one cell */
			if((d.y + d.dy) < (d.parent.y + d.parent.dy))
			{
				nHeight = d.dy - this._levelOneMargin;
			}
			else
			{
				nHeight = d.dy;
			}
			strHeight =  Math.max(0, nHeight) + "px";
		}
		else if(2 == d.depth)
		{
			var nHeight;
			if(0 == d.parent.dy)
			{
				nHeight = 0;
			}
			else
			{
				/*
				if parent decrease the height to give gap between adjacent level one cell, 
				we need decrease height according to our proportion in parent 
				*/ 						
				if((d.parent.y + d.parent.dy) < (d.parent.parent.y + d.parent.parent.dy))
				{
					nHeight = Math.floor(d.dy - (d.dy/d.parent.dy) * this._levelOneMargin);	
				}
				else
				{
					/* parent didn't change the height,  we just keep the original height */
					nHeight = d.dy;
				}
				
				/* if we have an adjacent sibling, leave one pixel for gap */
				if((d.y + d.dy) < (d.parent.y + d.parent.dy))
				{
					nHeight -= 1;
				}
			}
			strHeight = Math.max(0, nHeight) + "px";
		}
		else
		{
			strWidth = "0px";
		}
				
		return strHeight;
	},
	
	_getHtmlData:function(element, data)
	{
		var that = this;
		var strDom = "";
		
		data.element = element[0];
		if((1 == data.depth) || (2 == data.depth))
		{
			if(this.touchEnabled)
			{
				$(element).bind('tap', function(evt) {
					evt.cancelBubble = true;  
					evt.stopPropagation();					
					//console.log(evt.clientX, evt.clientY, evt.originalEvent.clientX, evt.originalEvent.clientY);
					var position = [evt.originalEvent.clientX||evt.clientX, evt.originalEvent.clientY||evt.clientY];
					that.firePress({pressdObject: data, element: $(this), position: position});
				});
			}
			else
			{
				d3.select(element[0]).on("click", function(data, i) 
				{
					that._onMouseClick(data, this);
				});
			}
		}

		if(2 == data.depth)
		{
			strDom =  '<div class = "text" >' + this.nameSelector(data) + '</div>';
		}
		else if (1 == data.depth)
		{
			strDom =  '<div class = "head" > <div class = "header_text">' + this.nameSelector(data) + ' </div> <div class = "header_image" style="display:none;"></div></div>';
		}		
		
		return strDom;
	},
	
	_getBackground: function(d)
	{
		var strBackground = null;
		if((2 == d.depth) || ((1 == d.depth) && (!(d.children && d.children.length))))
		{
			var strColor = this._colorSelector(d);
			var bright_color = d3.rgb(strColor).brighter(1).toString();
			var dark_color = d3.rgb(strColor).toString();

			//disable gradient in IE Browser
			if($.browser.msie)
			{
				strBackground =  this._colorSelector(d);	
			}
			else if ($.browser.mozilla )
			{
				strBackground = " -moz-linear-gradient(left, " +  bright_color + " 0%, " + dark_color + " 100%)";
			}
			else
			{
				strBackground = " -webkit-linear-gradient(left, " +  bright_color + " 0%, " + dark_color + " 100%)";
			}
		}
		
		return strBackground;
	},
	
	_getOpacity:function(element, data)
	{
		var that = this;
		
		var domData = this._getHtmlData(element, data);
		
		if(domData)
		{
			$(element[0]).append(domData);
		}
		
		//construct div tree hierarchy. move level 2 div to be child of level 1 div .
		if(data.depth > 0)
		{
			 element.appendTo($(data.parent.element));
		}
		
		this._getResizeOpacity(element, data);
		
		if(this.touchEnabled)
		{
			if(1 == data.depth)
			{
				//console.log($(element[0])); 
				var hammerElement = Hammer($(element[0]), {
											transform_always_block: true,
											transform_min_scale: 0.5,
											});
				var lastScale = 1, bPinched = false, that = this;							
				hammerElement.on('release pinch', function(ev) {
					if('pinch' == ev.type)
					{
						lastScale = ev.gesture.scale;
						bPinched = true;
					}
					else
					{
						if(bPinched)
						{
							bPinched = false;
							if(lastScale > 1)
							{
								that._zoomInTreeMap(data);
							}
							else if (lastScale < 1)
							{
								that._zoomOutTreeMap(data);
							}
						}
					}
				});
			}
		}
		else 
		{
			//bind click event to zoom icon.
			if(1 == data.depth)
			{
				if(data.children && data.children.length)
				{
					var strImage = '<image class = "treemap_zoomin" src = "images/ZoomIn.png">';
					$(element[0]).find('.header_image').append(strImage);					
				}
	
				if(this._currentNode != this._rootNode)
				{
					var strImage = '<image class = "treemap_zoomout" src = "images/ZoomOut.png">';
					$(element[0]).find('.header_image').append(strImage);					
				}
				
				$(element[0]).find('.treemap_zoomin').click(function(oEvent) 
				{
					//stop event propagation, forbid to fire press event
					oEvent.cancelBubble = true;  
					oEvent.stopPropagation();  
	  				that._zoomTreeMap(data);
				});
				
			
				$(element[0]).find('.treemap_zoomout').click(function(oEvent) 
				{
					//stop event propagation, forbid to fire press event
					oEvent.cancelBubble = true;  
					oEvent.stopPropagation();  
	  				that._zoomTreeMap(data.parent.parent);
				});
				
				$(element[0]).find('.head').hover(
					function()
					{
						$(this).find('.header_image').show();	
					},
					function()
					{
						$(this).find('.header_image').hide();
					}
				);			
	
			}			
		}


	},	

	_getResizeOpacity:function(element, data)
	{
		
		var LEVEL_ONE_HEADER_HEIGHT = 50;
		if(1 == data.depth)
		{
			var nHeight = parseInt(this._getElementHeight(data));
			var nWidth =Math.max(0, parseInt(this._getElementWidth(data)) -5);
			$(element[0]).find('.header_text').width(nWidth);
			if(nHeight < LEVEL_ONE_HEADER_HEIGHT)
			{
				var nTextHeight = Math.max(0, nHeight -6);
				$(element[0]).find('.header_text').height(nTextHeight);
				$(element[0]).find('.head').height(nHeight);
			}
			else
			{
				$(element[0]).find('.header_text').height(LEVEL_ONE_HEADER_HEIGHT - 6);
				$(element[0]).find('.head').height(LEVEL_ONE_HEADER_HEIGHT);
			}			
		}
		
		if(2 == data.depth)
		{
			var nWidth = Math.max(0, parseInt(this._getElementWidth(data)) -5);
			var nHeight = parseInt(this._getElementHeight(data));
			$(element[0]).find('.text').width(nWidth);
			if(((data.y == data.parent.y) && (data.dy < LEVEL_ONE_HEADER_HEIGHT)) ||
				nHeight < 5)
			{
				$(element[0]).find('.text').hide();
			}
			else
			{
				$(element[0]).find('.text').show();
			}			

		}
	},	
	

	
	_drawTreeMap : function(nodeData)
	{
		var that = this;
		
		var height = parseInt(this.getHeight());
		var width = parseInt(this.getWidth());
		
		$('#' + this.treeMapId).empty();
		
		var treemap = d3.layout.treemap()
					.size([width - 10, height -10])
					.sticky(true)
				    .sort(function (itemOne, itemTwo){return that._sortFunc(itemOne, itemTwo);})
					.value(function(d){return that.valueSelector(d);});		
		
		this._treemap = treemap;
	    				
		var div = d3.select("#"+ this.treeMapId).append("div")
		    .style("position", "relative")
		    .style("width", this.getWidth())
		    .style("height", this.getHeight());
	
		this._treemapDiv = div;
		
		var element = div.data([nodeData]).selectAll("div")
				.data(treemap.nodes)
				.enter().append("div")
				.attr("class", function(d){return that._classSelector(d);})
				.style("background", function(d){return that._getBackground(d);})
				.text(function(d){return that._textSelector(d);});
	
		 element.transition()
        .duration(500)
        .call(cell);
		
		
		// used for trace.
		/*		
		var node = treemap.nodes();		
		console.log("=== tree map nodes:", node);		
		*/

		function cell() 
		{
			this.style("left", function(d) 
				{
					return that._getLeftPosition(d);
				})
				.style("top", function(d) 
				{
					return that._getTopPosition(d);
				})
				.style("width", function(d) 
				{
					return that._getElementWidth(d);
				})	
				.style("height", function(d) 
				{
					return that._getElementHeight(d);
				})
				.style('opacity', function (data, i) 
				{
					var element = $(this);
					return that._getOpacity(element, data);
				});				
		} // end cell function
		
	},// end _drawTreeMap function
	
	_fireClickEvent:function()
	{
		this._alreadyclicked = false;
		this.firePress({pressdObject: this._eventData.pressdObject, element: this._eventData.element, position: this._eventData.position});
	},
	
	_onMouseClick : function(data, element)
	{
		var LEVEL1_HEADER_HEIGHT = 50;
		//for level1 cell, if out of header area, don't response or will repeat with level2 cell click event.
		if( ((1 == data.depth) && (data.children && data.children.length) && ((d3.mouse(element))[1] > LEVEL1_HEADER_HEIGHT)) ||
			(0 == data.depth) )
		{
				return;
		}
		
		//using timer to delay single click event because of conflict with double click.
		if(true == this._alreadyclicked)
		{
			//click again, it's a double click. cancel the timer.
			this._alreadyclicked = false;
			if(this._alreadyclickedTimeout)
			{
				clearTimeout(this._alreadyclickedTimeout);	
			}
		}
		else
		{
			this._alreadyclicked = true;
			
			//save the event related data, used by delayed fire action
			this._eventData.pressdObject = data;
			this._eventData.element = element;
			this._eventData.position = d3.mouse(document.body);
			
			var me = this;
			
			//set a timeout to delay event fire, conflict with double click.
			this._alreadyclickedTimeout = setTimeout(function() {
				me._fireClickEvent();
			}, 600);
		}
		
		//this.firePress({pressdObject: data, element: element, position: d3.mouse(element)});
	},

	_textSelector : function(data)
	{
		return null;
	},
	
	_sortFunc : function (itemOne, itemTwo)
	{
		return d3.descending(this.valueSelector(itemTwo), this.valueSelector(itemOne));
	},
	
	_colorSelector : function(data)
	{
		if((1 == data.depth) || (2 == data.depth))
		{
			return this.colorSelector(data);
		}
		else
		{
			return null;
		}
	},
	
	_classSelector : function(data)
	{
		var strClass = "cell ";
		if(0 == data.depth)
		{
			strClass +=  " level-zero ";
		}
		else if(1 == data.depth)
		{
			strClass +=  " level-one ";
		}
		else if(2 == data.depth)
		{
			strClass += " level-two ";
		}
		
		if((0 == data.dx) || (0 == data.dy) || (data.depth > 2))
		{
			strClass += " hideCell";
		}
		
		return strClass;
	},
	
	_alreadyclicked: false,
	_alreadyclickedTimeout: null,
	_eventData: 
	{
		pressdObject: null,
		element: null,
		position: []
	},
	_currentNode: null,
	_rootNode: null,
	_levelOneMargin: 10,
	
	_treemap: null,
	_treemapDiv: null,	
	_bIsInited: false,
	
	
}); //end of sap.ui.core.Control.extend("rs.uilib.TreeMap")

rs.uilib.TreeMap.M_EVENTS = {'press':'press', 'zoom':'zoom'};
