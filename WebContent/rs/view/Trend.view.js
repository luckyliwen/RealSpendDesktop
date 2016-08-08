/**
 * In order to reuse the common framework of SAPUI5 (such as auto generate the setXX/getXX, here we extend a view from the sap.ui.core.mvc.JSView
 */
jQuery.sap.declare("rs.view.Trend");
jQuery.sap.require("rs.view.HierBaseView");
//jQuery.sap.require("sap.ui.core.Control");

//sap.ui.jsview("rs.view.HierOverView", {
rs.view.HierBaseView.extend("rs.view.Trend", {
	metadata : {
		//Here in order to avoid name conflict, we add rs to the property name
		properties : {
			"rsHierType" : "string",
			'oldHierId' : 'string',  //The old hier id of last time display
			'oldByHierId' : 'string',  //The old byhier id of last time display
			"rsHierId":   'string',
			"rsByHierId":	'string',
			//the naviMng used to manage itself
			"naviMng" : "object",
		},
		// ---- control specific ----
		library : "sap.ui.core",
		
		//renderer: 
		

	},
	/**
	 * Save the new hier id and the old hier id will became the oldHierId
	 * @param id
	 */
	setRsHierId: function( id ) {
		//need first save the old id 
		var oldId = this.getRsHierId();
		this.setProperty('rsHierId', id);
		this.setOldHierId( oldId);
	},
	
	/**
	 * Save the new byHier id and the old byHier id will became the oldByHierId
	 * @param id
	 */
	setRsByHierId: function( id ) {
		//need first save the old id 
		var oldId = this.getRsByHierId();
		this.setProperty('rsByHierId', id);
		this.setOldByHierId( oldId);
	},
	
	//Just reuse the JSView is enough
	renderer: 'sap.ui.core.mvc.JSViewRenderer',

	getControllerName : function() {
        return "rs.controller.Trend";
     },
	/**
	 * Constant enum for the three views
	 */
	ViewType : {
		Area:  0,
		Bar: 1,
		Table :   2
	},
	
	
	/**
	 * Constant enum for month/quarter/year model
	 */
	ModelType: {
		Month:  0,
		Quarter: 1,
		Year:	2
	},

	/**
	 * Get the content header part height, need by consistent with the view implementation (normally is the information header and 
	 * the view switch part,  the detail view/lineItem/Trend need add the extra navigation part)
	 * Now use this static way because the jQuery.offset() only work for the visible element 
	 */
	getContentHeaderHeight: function() {
		// now 20 for the navigation
		return rs.view.Help.HeaderDataHeight + this.SwitchToolbarHeight + 20;
	},

	/**
	 * Adjust the table visible rows according to current model 
	 */
	adjustTreeTableRows: function() {
		//Also change the visible row
		var modeType = this.getModelType();
		var rowCnt = -1;
		switch (modeType) {
			case  this.ModelType.Month: 	rowCnt = 12; break;
			case  this.ModelType.Quarter: 	rowCnt = 4; break;
			case  this.ModelType.Year: 		rowCnt = 2; break;
			default: rs.assert(0); break;
		}
		
		if(rs.cfg.Cfg.desktop())
		{
			this._oTreeTable.setVisibleRowCount( rowCnt);	
		}
		
				
		rs.view.Help.setActiveTableHeight();
		
	},
	
	//if the treeTable height larger than the main content height, need set to scroll 
	setTreeTableScroll:function(){
		if(this.getViewType() == this.ViewType.Table){
			var that = this;
			setTimeout(function() {
				$("#"+that.createId('TreeTable')).css("overflow","auto");	
			}, 100);
		}
	},
	
	createSwitchToolbar : function() {
		//create the segment for switch between Area, Bar and Table
		var btnArea =  new rs.cfg.Control.Button({
			id:this.createId(this.BtnArea),
			icon:"images/ButtonLineChartUnSelected.png",
			iconHovered:"images/ButtonLineChartSelected.png",
			iconSelected:"images/ButtonLineChartSelected.png",
			textAlign:"Center",
			width:"60px",
			height:"40px"});
		
		var btnBar = new rs.cfg.Control.Button({
    	 	id:this.createId(this.BtnBar),
		 	icon:"images/ButtonColumnChartUnSelected.png",
		 	iconHovered:"images/ButtonColumnChartSelected.png",
		 	iconSelected:"images/ButtonColumnChartSelected.png",
		 	textAlign:"Center",
    	 	width:"60px",
    	 	height:"40px"});

		var btnTable = new rs.cfg.Control.Button({
		 	id:this.createId(this.BtnTable),		    			 	
    	 	icon:"images/OverviewTableViewUnSelected.png",
    	 	iconHovered:"images/OverviewTableViewSelected.png",
    	 	iconSelected:"images/OverviewTableViewSelected.png",
    	 	textAlign:"Center",
		 	width:"60px",
		 	height:"40px"});
		 
		
		//set the enum data, so later easy know which view type
		btnArea.setRSEnumData( this.ViewType.Area);
		btnBar.setRSEnumData( this.ViewType.Bar);
		btnTable.setRSEnumData( this.ViewType.Table);
		
		var oSBViewType = new rs.cfg.Control.SegmentedButton({
			id:this.createId("sbtn_viewtype"),
			buttons:[btnArea,btnBar,btnTable]});

		oSBViewType.setSelectedButton(btnArea);
		

		//Then create the month/quarter/year parts
		var  btnMonth = new rs.cfg.Control.Button({
			id : this.createId(this.BtnMonth),
			text : "{i18n>Monthly}",
			textAlign:"Center",
			width:"80px",
		 	height:"40px"});
		
		var btnQuarter =new rs.cfg.Control.Button({
			id : this.createId(this.BtnQuarter),
			text : "{i18n>Quarterly}",
			textAlign:"Center",
			width:"80px",
		 	height:"40px"});
		
		var btnYear = new rs.cfg.Control.Button({
			id : this.createId(this.BtnYear),
			text : "{i18n>Annual}",
			textAlign:"Center",
			width:"80px",
		 	height:"40px"});
		//set the enum data, so later easy know which model type
		btnMonth.setRSEnumData( this.ModelType.Month);
		btnQuarter.setRSEnumData( this.ModelType.Quarter);
		btnYear.setRSEnumData(this.ModelType.Year);
		
		var oSBMonthQuarteryear = new rs.cfg.Control.SegmentedButton({
			id : this.createId("sbtn_monthQuarterYear"),
			buttons : [ btnMonth,btnQuarter,btnYear]});

		oSBMonthQuarteryear.setSelectedButton(btnMonth);

		var oBoxSizeInfoTextView = new rs.cfg.Control.Text(this.createId('boxSizeInfo'), 
				{	textAlign : "Right",
					enabled: false,text:""
				});
		oBoxSizeInfoTextView.setText(rs.view.Help.formatBoxSizeHintText(rs.getText("TableValueCurrencyHint")));
		
		this._oBoxSizeInfoTextView = oBoxSizeInfoTextView;
		this._oSBMonthQuarterYear = oSBMonthQuarteryear;
		this._oSBViewType = oSBViewType;

		this._oSwitchLayout = new sap.ui.commons.layout.AbsoluteLayout(this
				.createId('switch_toolbar'), {
			height : this.SwitchToolbarHeightPx
		}).addStyleClass("switch_toolbar");

		this._oSwitchLayout.addContent(oSBViewType,{
			left : "0px",
			top : "0px"
		});
		

		this._oSwitchLayout.addContent(oSBMonthQuarteryear,{
				left : "210px",
				top : "0px"
			});

		this._oSwitchLayout.addContent(oBoxSizeInfoTextView,{
			right : "5px",
			top : "30px"
		});

		return this._oSwitchLayout;
	},


	createContentImpl : function(oController) {

		var headPart = this._createHeader();
		var switchToolbar = this.createSwitchToolbar();
		this._oContentLayout =this.createContentLayout();

		//set all the width to 100%
		headPart.setWidth('100%');
		//switchToolbar.setWidth('100%');
		//this._oContentLayout.setWidth('100%');

		//Later need add some space
		this._oMainLayout = new sap.ui.commons.layout.VerticalLayout(this
				.createId('mainVerticalLayout'), {
			//
			content : [ headPart, switchToolbar, this._oContentLayout ]
		}).addStyleClass("mainVerticalLayout");
		this._oMainLayout.setWidth('100%');

		return this._oMainLayout;
	},

	createTreeTable : function() {
		//create the columns
		var aCols = [ 
		    {label : "{i18n>TimePeriod}",}, 
		    {label : "{i18n>TotalSpending}",}, 
		    {label : "{i18n>Projected}",}, 
		    {label : "{i18n>LastYear}",}, 
		    {label : "{i18n>Budget}",}, 
		    {label : "{i18n>BudgetVsSpending}",} 
		    ];

		//the following code just set the each column width ratio,
	    var flexiableWidthRatio = [1,1,1,1,1,1];	
	    var total = 0;
	    for(var i=0 ;i <flexiableWidthRatio.length;i++){
	    	total += flexiableWidthRatio[i];
	    }

	    
		var columns = [];
		$.each(aCols, function(idx, ele) {
			columns.push(new sap.ui.table.Column({
				label : ele.label,
				width: flexiableWidthRatio[idx]*100/total +"%"
			}));
		});

		var oTable = new rs.cfg.Control.TreeTable(this.createId('TreeTable'), {
			selectionMode : sap.ui.table.SelectionMode.None,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
			showNoData:false,
			allowColumnReordering : true,
			columns: columns
		});

		oTable.setWidth('100%');
		
		return oTable;
	},

	//??
	createAreaChartLayout : function() {

		var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
		 	layoutFixed : false,
			columns : 1,
			width : "100%",
			widths:["100%"]
		});
		
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oMatrixLayout.addRow(oRow);				

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({id :this.createId('TrendAreaViewMatrixCell'),hAlign:sap.ui.commons.layout.HAlign.Center});
	
		oRow.addCell(oCell);
		return oMatrixLayout;	

	},

	
	createBarChartLayout : function() {

		var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
		 	layoutFixed : false,
			columns : 1,
			width : "100%",
			widths:["100%"]
		});
		
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oMatrixLayout.addRow(oRow);				

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({id :this.createId('TrendBarViewMatrixCell'),hAlign:sap.ui.commons.layout.HAlign.Center});
	
		oRow.addCell(oCell);
		return oMatrixLayout;	

	},

	/**
	 * The doInit function will called after finished set the parameter
	 * !! the init() will be called by framework, but at that time don't have the parameter such as the hierType, so don't have enough knowledget to do init work
	 */
	doInit : function() {
		var controller = this.getController();
		
		this.calculateMainContentWidthHeight();
		
		var content = this.createContentImpl(controller);
		this.addContent(content);
		
		//Set two switch control to parent
		this.setViewSwitchControl( this._oSBViewType);
		this.setModelSwitchControl( this._oSBMonthQuarterYear);		
		
		this._oTreeTable = this.createTreeTable();
		this._oAreaChart = this.createAreaChartLayout();		
		this._oBarChart = this.createBarChartLayout();
		
		var parentCell = sap.ui.getCore().byId(this.createId( 'contentCell'));
		
		this._oAreaBarTableMng = new rs.view.InternalPageMng(parentCell, 0,
				[ this._oAreaChart,  this._oBarChart,this._oTreeTable ]);
		
	
		//set the active table for export the table to CSV
		this.setActiveTable(this._oTreeTable);
		
		this._bindTableColumnsTemplate();
		
		this._oSBViewType.attachSelect(controller.onAreaBarTableSwitch,controller);

		this._oSBMonthQuarterYear.attachSelect(	controller.onMonthQuarterYearSwitch,controller);

		this.adjustTreeTableRows();
		
		//set legend mode
		this.setLegendMode(rs.view.LegendMode.TrendArea);
		
		//so add here for three different view?
		rs.cfg.Cfg.addChangeListener(controller.onConfigChanged, controller, null);
	},

	/*if user changed the time period setting, then the Id should be cleared, so if re-enter the detail,
	 * will update the screen with the new data, */
	clearId:function(){
		this.setRsHierId("");
		this.setRsByHierId("");
	},


	onResize:function(){
		this.calculateMainContentWidthHeight();
		var trendAreaChart = sap.ui.getCore().byId(this.createId("trendAreaChartView"));
		var trendBarChart = sap.ui.getCore().byId(this.createId("trendBarChartView"));
		
		var height = this.getMainContentHeight() +"px";
		var width = this.getMainContentWidth() +"px";
		
		if(trendAreaChart)
		{
			trendAreaChart.setWidth(width);
			trendAreaChart.setHeight(height);
			trendAreaChart.invalidate();
		}
		
		if(trendBarChart)
		{
			trendBarChart.setWidth(width);
			trendBarChart.setHeight(height);	
			trendBarChart.invalidate();	
		}
		
		this.adjustTreeTableHeight(this._oTreeTable);
	},
		
	_addTrendAreaChartToLayout:function(){
		var trendAreaData = this.getController()._oModelInfo.getDataByPeriodType(this._getCurrentPeriodType());
		
		var cell = sap.ui.getCore().byId(this.createId( 'TrendAreaViewMatrixCell'));
				
		var width = parseInt(window.innerWidth * 0.9) +"px";		

		var height = this.getMainContentHeight() +"px";
		var currencyStr = rs.cfg.Cfg.getCurrency();
		var trendAreaChart = new rs.uilib.AreaChart(this.createId("trendAreaChartView"),
			{
				data: trendAreaData,
				width:width,
				height:height,
				currency:currencyStr
			}
		);
		
		cell.addContent(trendAreaChart);
				
	},

	_addTrendBarChartToLayout:function(){

		var trendBarData = this.getController()._oModelInfo.getDataByPeriodType(this._getCurrentPeriodType());
		
		var cell = sap.ui.getCore().byId(this.createId( 'TrendBarViewMatrixCell'));
			
		var width = parseInt(window.innerWidth * 0.9) +"px";

		var height = this.getMainContentHeight() + "px";
		var currencyStr = rs.cfg.Cfg.getCurrency();
		var trendBarChart = new rs.uilib.BarChart(this.createId("trendBarChartView"),
			{
				data: trendBarData,
				width:width,
				height:height,
				currency:currencyStr
			}
		);
		
		cell.addContent(trendBarChart);
	},
	
	_getCurrentLegendType:function(){
		var viewType = this.getViewType();
		
		switch(viewType){
			case this.ViewType.Area:
				return rs.view.LegendMode.TrendArea;
				break;
			
			case this.ViewType.Bar:
				return rs.view.LegendMode.TrendBar;
				break;

			case this.ViewType.Table:
				return rs.view.LegendMode.TrendTable;
				break;
			default:
				rs.assert(false);
				break;
		}		
	},
	_getCurrentPeriodType:function(){
		var modelType = this.getModelType();
		
		switch(modelType){
			case this.ModelType.Month:
				return rs.PeriodType.Monthly;
				break;
			
			case this.ModelType.Quarter:
				return rs.PeriodType.Quarterly;
				break;

			case this.ModelType.Year:
				return rs.PeriodType.Annual;
				break;
			default:
				rs.assert(false);
				break;
		}

	},

	_createHeader:function(){
		var headerData = new sap.ui.commons.layout.AbsoluteLayout(this.createId('headerData'), {
			height : rs.view.Help.HeaderDataHeightPx 
		}).addStyleClass("headerData");
		this.oHeaderTextViewName = new rs.cfg.Control.Text(this.createId('headerDataName'), {
			textAlign : "Left",
			enabled: false
		}).addStyleClass("headerDataName");
				
		this.oHeaderTextViewYearofDate = new rs.cfg.Control.Text(this.createId('headerDataYearofDate') , {
			textAlign : "Left",
			enabled: false
		}).addStyleClass("headerDataYearofDate");

		var date=new Date();
		var year="",month="",day="";
		year=date.getFullYear();
		month=date.getMonth()+1;
		day=date.getDate();
		
		var datetext = rs.getText("AsOfNoPrefix") +" "+year+"-"+month+"-"+day;
		this.oHeaderTextViewYearofDate.setText(datetext);
		
		headerData.addContent(this.oHeaderTextViewName, {
			left : "0px",
			top : "0px"
		});

		headerData.addContent(this.oHeaderTextViewYearofDate, {
			left : "0px",
			top : "30px"
		});		

		
		return headerData;
	},
	
	_updateHeaderData:function(){

		var oHeaderName = sap.ui.getCore().byId(this.getId() +'--headerDataName');
		
		var hierIdName = rs.model.HierMng.getNameById(this.getRsHierId());
		var byHierIdName = rs.model.HierMng.getNameById(this.getRsByHierId());

		oHeaderName.setText(hierIdName + " "+"\u2014"+" "+ byHierIdName);	
	},
		
	_refreshScreenForCfgChanged:function(){

		this._oBoxSizeInfoTextView.setText(rs.view.Help.formatBoxSizeHintText(rs.getText("TableValueCurrencyHint")));
		
		this._oTreeTable.invalidate();
				
		this._refreshAreaBarChart();
		this._updateHeaderData();		

	},
	

	_refreshAreaBarChart:function(){
		var cell = sap.ui.getCore().byId(this.createId( 'TrendAreaViewMatrixCell'));
		cell.destroyContent();
		cell = sap.ui.getCore().byId(this.createId( 'TrendBarViewMatrixCell'));
		cell.destroyContent();
		this._addTrendAreaChartToLayout();
		this._addTrendBarChartToLayout();
	},
	
	_bindTableColumnsTemplate:function(){
		var textView= new rs.cfg.Control.Text({enabled: false});
		var textView1= new rs.cfg.Control.Text({enabled: false});
		var textView2= new rs.cfg.Control.Text({enabled: false});
		var textView3= new rs.cfg.Control.Text({enabled: false});
		var textView4= new rs.cfg.Control.Text({enabled: false});
		var varianceImage = new sap.ui.core.HTML();
		var textView5= new rs.cfg.Control.Text({enabled: false});
		var oVarianceRowLayout = new sap.ui.commons.layout.AbsoluteLayout( {height: "35px"});
		
		var contentParameter = "<div  style='position:relative;width:5px;height:30px;background-color:";
		var contentParameterEnd = ";\'></div>";

		textView.bindProperty("text", "Period",function(oValue){
			if(oValue != null){
				return rs.util.Util.formatPeriod(oValue,false);
			}
			else{
				return "";
			}
		});
		textView1.bindProperty("text", "Total",rs.util.Util.numericPrecisonFormat);
		textView2.bindProperty("text", "Projection",rs.util.Util.numericPrecisonFormat);
		textView3.bindProperty("text", "LastYearTotal",rs.util.Util.numericPrecisonFormat);
		textView4.bindProperty("text", "Budget",rs.util.Util.numericPrecisonFormat);
		
		//as it need several properties, so just binding to the parent using ""
		textView5.bindProperty("text", "",function(oValue){
				//As now the ui5 framework have bug before binding to row it will also do the update
				if ( oValue == null)
					return "";
					
				var variancePercentageFormat = rs.view.Help.formatVariancePercentage(oValue.VariancePercentage);					
				var leftOver = oValue.Variance >= 0 ? rs.getText("Left") : rs.getText("Over");
				return rs.util.Util.numericPrecisonFormat(Math.abs(oValue.Variance))+variancePercentageFormat + leftOver;
			});
			
	
		//as it need several properties, so just binding to the parent using ""
		varianceImage.bindProperty("content","",function(oValue){
			//As now the ui5 framework have bug before binding to row it will also do the update
			if ( oValue == null)
				return "";
	
			var color = rs.view.getColorByVariancePercentage(oValue.VariancePercentage,  oValue.Total);
			
			return contentParameter+color+contentParameterEnd;			
		});
		
		oVarianceRowLayout.addContent(varianceImage,{top:"2px",left:"0px"});	
		oVarianceRowLayout.addContent(textView5,{top:"10px",left:"10px"});
		
		this._oTreeTable.getColumns()[0].setTemplate(textView);
		this._oTreeTable.getColumns()[1].setTemplate(textView1);
		this._oTreeTable.getColumns()[2].setTemplate(textView2);
		this._oTreeTable.getColumns()[3].setTemplate(textView3);
		this._oTreeTable.getColumns()[4].setTemplate(textView4);
		this._oTreeTable.getColumns()[5].setTemplate(oVarianceRowLayout);
	
	},

	//==private internal member 
	_oSBMonthQuarterYear : null,
	_oSBViewType : null,

	_oAreaChart : null,
	_oBarChart : null,
	_oTreeTable : null,
	
	_oAreaBarTableMng : null,

	//===some constant text id
	BtnMonth : 'btn_month',
	BtnQuarter : 'btn_quarter',
	BtnYear : 'btn_year',

	//!!tips: the last is the corresponding idx
	BtnArea : 'btn_area_bar_table_0',
	BtnBar : 'btn_area_bar_table_1',
	BtnTable : 'btn_area_bar_table_2',
});
