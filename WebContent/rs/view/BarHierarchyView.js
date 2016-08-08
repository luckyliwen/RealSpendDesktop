// this view is used to show the bar-hierarchy view, and although peel from the HierOverView, the data is still driven from the HierOverView 
//and the purpose is to make it more clear on the view

rs.view.BarHierarchy = {
	createOutline : function(parentId,width,height) {
		var oBarLayout = new sap.ui.commons.layout.AbsoluteLayout(parentId + '--BarLayout');
		
		var borderHtml = new sap.ui.core.HTML(parentId + '--BoarderHtml');
		
		var contentParameter = "<div class='barHierarchyBorder' style='position:relative;background-color:#cecece;border-radius: 10px;'></div>"; 
		borderHtml.setContent(contentParameter);
		
 		var oBarHierarchyLayout = new sap.ui.commons.layout.AbsoluteLayout(parentId +'--BarHierarchyViewLayout');
 		
 		this.setSize(parentId,width,height);	
		
		var trapezoidHtml = new sap.ui.core.HTML();	
		var contentParameter1 = "<div class='barHierarchyTrapezoid' ></div>"; 	
		trapezoidHtml.setContent(contentParameter1);
		trapezoidHtml.attachAfterRendering(function(){
			$(".barHierarchyTrapezoid").css("width", parseInt(window.innerWidth * 0.45-300) +"px");
		 });				
		
		var selectedName = new sap.ui.commons.TextView(parentId +'--selectedName', {
      		text:"",
      		textAlign : "Left",
      		enabled: false,
      		design: sap.ui.commons.TextViewDesign.H5
      		});
      		
		var oTotaltext = new sap.ui.commons.TextView(parentId +'--totalText', {
  			text:"",
  			textAlign : "Left",
  			enabled: false,
  			design: sap.ui.commons.TextViewDesign.H6
  			});
  		
  		var oVariancetext = new sap.ui.core.HTML(parentId +'--varianceText');
  		
  		var oLeftOver = new sap.ui.commons.TextView(parentId +'--leftOver', {
  			text:"",
  			textAlign : "Left",
  			enabled: false,
  			design: sap.ui.commons.TextViewDesign.H6
  			});
  		
  		oLeftOver.addStyleClass("oLeftOverOnPieHeader");
  		
		var oDetailButton = new sap.ui.commons.Button(parentId + '--DetailBtnId',{
		        icon : "images/Alert_MarkasRead_Button_2x.png",
		        tooltip : "{i18n>SeeDetailInfomation}",
			}).addStyleClass("rsSeeDetailButton");

		oDetailButton.attachPress(this._detailBtnPressed, this);
		
		var oBackButton = new sap.ui.commons.Button(parentId + '--BackBtnId',{
	        icon : "images/Back.png",
	        tooltip : "{i18n>Back}",
	        visible : false,
		}).addStyleClass("rsBackButton");
		
  		var varianceLayout = new sap.ui.commons.layout.HorizontalLayout(
    			{content: [oVariancetext,oLeftOver]});
    	
																
		oBarLayout.addContent(borderHtml, {
				left : "15px",
				top : "0px"
			});   
		
		oBarLayout.addContent(trapezoidHtml, {
			left : "150px",
			top : "1px"
		}); 
		
		oBarLayout.addContent(selectedName, {
				left : "40%",
				top : "10px"
			}); 

		oBarLayout.addContent(oTotaltext, {
				left : "40%",				
				top : "30px"
			});
		
		oBarLayout.addContent(oBackButton, {
			left : "5%",
			top : "15px"
		});	
		
		oBarLayout.addContent(oDetailButton, {
				right : "5%",
				top : "15px"
			});			
		oBarLayout.addContent(varianceLayout, {
				left : "40%",
				top : "50px"
			});	
			
		oBarLayout.addContent(oBarHierarchyLayout, {
				left : "18px",
				top : "90px"
			});				

		return oBarLayout;
	},

	createBarHierarchyView:function(parentId,rootHeaderInfoParam){

		this.rootHeaderInfo[parentId] = rootHeaderInfoParam;
		
		this._updateBarHierarchyHeader(parentId,this.rootHeaderInfo[parentId].hierId,
				this.rootHeaderInfo[parentId].name,
				this.rootHeaderInfo[parentId].total,
				this.rootHeaderInfo[parentId].variance,
				this.rootHeaderInfo[parentId].variancePercentage);

      	var oVLayout = sap.ui.getCore().byId(parentId +'--BarHierarchyViewLayout');
      	oVLayout.destroyContent();
      	
		var barData = rs.model.ModelMng.getSpendData4BarHierarchy(rootHeaderInfoParam.hierId);
					
		var width = parseInt(oVLayout.getWidth());		
		
		var height =  parseInt(oVLayout.getHeight()) -20 ;
		if(height <210){
			height = 210;	//set the default min value
		}

    	var barChartTable = new rs.uilib.BarHierarchy(parentId + '--BarChartTable',
			{
				data: barData,
				width:width +"px",
				height: height +"px",
				hierType:rootHeaderInfoParam.hierType,
			}
		);	

    	oVLayout.addContent(barChartTable);
    	
    	barChartTable.attachBarSelect(this._onBarSelected, this);   	
	},
	
	
	setSize : function(parentId,width, height){
		
		var barLayout = sap.ui.getCore().byId(parentId + '--BarLayout');
		
		barLayout.setHeight(height + "px");
		barLayout.setWidth(width + "px");
		
		var borderHtml = sap.ui.getCore().byId(parentId + '--BoarderHtml');
		
		var borderHtmlwidth = width -22 ;				
		var borderHtmlHeight = height -20 ;		
		if(borderHtmlHeight < 300){
			borderHtmlHeight = 300;	//set the default minimum value
		}		
		
		borderHtml.attachAfterRendering(function(){
			$(".barHierarchyBorder").css("height",borderHtmlHeight+ "px");
			$(".barHierarchyBorder").css("width",borderHtmlwidth + "px");
			$(".barHierarchyBorder").addClass('arrow_box_left1');
		 });
		
		var barHierarchyLayout = sap.ui.getCore().byId(parentId +'--BarHierarchyViewLayout'); 
		barHierarchyLayout.setHeight((borderHtmlHeight - 90) + "px");
		barHierarchyLayout.setWidth(borderHtmlwidth + "px");
	},
	
	
	_detailBtnPressed : function(){
		
		var view = rs.view.Help.getActiveView();
		
		var parentId = view.getId();
		view._BarChartRenderAfterPieEndRotate = false;
		view.onSeeDetailsPressed(view.getRsHierType(),this.rootHeaderInfo[parentId].seeDetailHierId);
				
	},

	
	_onBarSelected:function(oEvent){
		var barHighlighted = oEvent.getParameters().barHighlighted;
		
		var parentId = oEvent.getParameters().parentId;
		var hierId,name,total,variance,variancePercentage;
		
		if(barHighlighted){
			hierId = oEvent.getParameters().hierId;
			name = oEvent.getParameters().name;
			total = oEvent.getParameters().total;
			variance = oEvent.getParameters().variance;
			variancePercentage = oEvent.getParameters().variancePercentage;
			
			this.rootHeaderInfo[parentId].seeDetailHierId = hierId;
		}
		else{
			hierId = this.rootHeaderInfo[parentId].hierId;
			name = this.rootHeaderInfo[parentId].name;
			total = this.rootHeaderInfo[parentId].total;
			variance = this.rootHeaderInfo[parentId].variance;
			variancePercentage = this.rootHeaderInfo[parentId].variancePercentage;
			
			this.rootHeaderInfo[parentId].seeDetailHierId =this.rootHeaderInfo[parentId].hierId;
			
		}


		this._updateBarHierarchyHeader(parentId,hierId,name,total,variance,variancePercentage);	
	},

	
	_updateBarHierarchyHeader:function(parentId,hierId, name,total,variance,variancePercentage){		
		
		  var totalFormat =  rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(total)+ " "+rs.getText("Spent");	

		  var variancePercentageFormat = rs.view.Help.formatVariancePercentage(variancePercentage);
						
		  var varianceFormat = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(Math.abs(variance))+variancePercentageFormat; 

		  var varianceColor = rs.view.getColorByVariancePercentage(variancePercentage,total);
			    
		  var leftOver = variance >= 0?rs.getText("Left") : rs.getText("Over");
		  this._setBarHierarchyHeaderInfo(parentId,name,totalFormat,varianceFormat,varianceColor,leftOver);
			
	},
		
	 _setBarHierarchyHeaderInfo: function(parentId,name,totalText,varianceText,color,leftOverText){

		 	var selectedName = sap.ui.getCore().byId(parentId + '--selectedName');
		 	selectedName.setText(name);
		 	
		 	var oTotalText = sap.ui.getCore().byId(parentId + '--totalText');
	  		oTotalText.setText(totalText);  		
	  		
	  		var contentParameter = "<div  style='position:relative;font-size:15px;top: 9px;color:";
			var contentParameterEnd = ";\'>" + varianceText + "</div>";
			
			var oVarianceText = sap.ui.getCore().byId(parentId + '--varianceText');
			oVarianceText.setContent(contentParameter +color+ contentParameterEnd);
	  		
			var oLeftOver = sap.ui.getCore().byId(parentId + '--leftOver');
	  		oLeftOver.setText(leftOverText);

	},
	
	
	rootHeaderInfo: {},
	
};