
jQuery.sap.declare("rs.view.HierBaseView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");




//sap.ui.jsview("rs.view.HierOverView", {
sap.ui.core.mvc.JSView.extend("rs.view.HierBaseView", {
	metadata : {
		//Here in order to avoid name conflict, we add rs to the property name
		properties : {
			"activeTable": "object",
			"activeScreen" : "object",
			//the coordination for the main content
			'mainContentWidth' : 'int',
			'mainContentHeight' : 'int',
			
			//the switch controls used for switch between different views
			'viewSwitchControl'  : {type: "object" /*'sap.ui.core.Control'*/},  
			
			//the segment button used for switch between different model (budget/spending)
			'modelSwitchControl'  : {type: "object"/*'sap.ui.core.Control'*/},

			// legend mode
			"legendMode": 'int',
		},
		// ---- control specific ----
		library : "sap.ui.core",
		//renderer: 

	},
	
	//Just reuse the JSView is enough
	//renderer: 'sap.ui.core.mvc.JSViewRenderer',

	
	//Now all use SegmentButton, if later changed to other control then need change code here
	getViewType: function() {
		var id = this.getViewSwitchControl().getSelectedButton();
		return sap.ui.getCore().byId(id).getRSEnumData();
	},
	
	getModelType: function() {
		var id = this.getModelSwitchControl().getSelectedButton();
		return sap.ui.getCore().byId(id).getRSEnumData();
	},
	
	
	createContent : function(oController) {
		return null;
	},
	
	/**
	 * the implementation of send by mail
	 */
	doSendByMail : function() {
		//here use the "this._currentActiveScreen" to send the screen by mail
	},

	/**
	 * the implementation of export, 
	 */
	doExport : function() {
		//here use the "this._currentActiveTable" to export to CSV
	},

	
	adjustTreeTableHeight: function( table) {
		if(rs.cfg.Cfg.desktop())
		{
			//??use 40 fix value is not good
			var visibleRowCnt = Math.floor(this.getMainContentHeight()/40)  -1 ;	//default rowHeight = 40 
			table.setVisibleRowCount(visibleRowCnt);
		}
		else
		{
			var strWidth = this.getMainContentWidth() + 'px';
			var strHeight =  Math.round(this.getMainContentHeight()) -50 + 'px'; //50 for alignment
			table.setWidth(strWidth);
			table.setHeight(strHeight);
			table.invalidate();			
		}
	},
	
	getContentHeaderHeight: function() {
		rs.assert(false, "The subview must overwrite this function");
	},
	
	/**
	 * Calculate both the width and height of the main content 
	 */
	calculateMainContentWidthHeight: function() {
		var width = Math.round(this.calculateMainContentWidth());
		var height = Math.round(this.calculateMainContentHeight());
		
	
		this.setMainContentWidth(width);
		this.setMainContentHeight(height);
	},
	
	/**
	 * Calculate the width for the main content 
	 * @returns {Number}
	 */
	calculateMainContentWidth: function () {
		if(rs.cfg.Cfg.desktop())
		{
			return $('body').width() - 170;  // UX Shell margin 40*2 padding 35*2 scrolling bar 15	
		}
		else
		{
			//just use the div of data-view to calculate it, so you can freely change the style of of 
			var viewContainer = $('#data-view');
			return viewContainer.width();			
		}
		
	},
	
	/**
	 * Calculate the height for the main content 
	 * @returns {Number}
	 */
	calculateMainContentHeight: function () {
		if(rs.cfg.Cfg.desktop())
		{
			//Now the top of bottom legend part and top of the #data-view (the content container) is fixed, but the height of the view header
			//part is different, so every view will be responsible to tell itself header part height 
			
			var legendCtrl = $('.footer');
			
			var headerHeight = this.getContentHeaderHeight();
			
			//50 is the padding between legend
			//??Tmp add more for demo jam
			var height = legendCtrl.offset().top - headerHeight - 150;
			
			return height;			
		}
		else
		{
			//Now the top of bottom legend part and top of the #data-view (the content container) is fixed, but the height of the view header
			//part is different, so every view will be responsible to tell itself header part height 
			
			var legendCtrl = $('.footer');
			var viewContainer = $('#data-view');
			
			var headerHeight = this.getContentHeaderHeight();
			
			//50 is the padding between legend
			var height = legendCtrl.offset().top - viewContainer.offset().top - headerHeight - 50;
			
			return height;			
		}
	},
	
	//create the main part of screen
	createContentLayout : function() {
		
		var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
		 	layoutFixed : false,
			columns : 1,
			width : "100%",
			widths:["100%"]
		});
					
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oMatrixLayout.addRow(oRow);				

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({id : this.createId('contentCell'),
								hAlign:sap.ui.commons.layout.HAlign.Center,vAlign:sap.ui.commons.layout.VAlign.Top});
	
		oRow.addCell(oCell);
		return oMatrixLayout;	
	},
	
	/**
	 * Update the header part UI by the hier id
	 * 
	 * @param hierNodeId
	 */
	updateHeaderDataByHierNodeId : function(hierNodeId) {
		//First get the data
		var oModelInfo = this.getSpendDataModelInfo(hierNodeId);
		if(oModelInfo.getLoadStatus() != rs.LoadStatus.Succ){
			return ;
		}
		var bindPath = this.getBindPath(hierNodeId);
		
		var data = oModelInfo.getSAPModel().getProperty(bindPath);

		
		this.updateHeaderData( data);
	},
	
	
	/**
	 * Update the header part UI by the data
	 * @param data
	 */
	updateHeaderData: function(data) {
		//Update the ui
		rs.view.Help.updateHeaderData( this.getId(), data);
		
		//save data
		this._headerData = data;
	} ,
	
	/**
	 *Get the bind path  by the hierId
	 * @param hierId
	 */
	getBindPath:function(hierId){
		var bindPath;
		if(this.getViewName() == 'rs.view.HierDetail'){
			bindPath = rs.model.ModelMng.getBindPath4Detail(hierId);
		}
		else{
			bindPath = rs.model.ModelMng.getBindPath4Overview(hierId);
		}
		return bindPath;
	},
	
	/**
	 *Get the Spend data model info  by the hierId
	 * @param hierId
	 */
	getSpendDataModelInfo:function(hierId){
		
		var modelInfo;
		
		if(this.getViewName() == 'rs.view.HierDetail')
			modelInfo = rs.model.ModelMng.getSpendDataModelInfo4Detail(hierId);
		else
			modelInfo = rs.model.ModelMng.getSpendDataModelInfo4Overview(hierId);
		return modelInfo;
	},
	
	/**
	 *Check if the top node info showed on the detail screen
	 * @param hierId
	 */
	//here show the detail info of top node such as CEG5000 on the detail view,not the overview info
	isTopNodeInfoShowedOnDetailView:function(hierId){
		var viewName = this.getViewName();
		
		if(rs.model.HierMng.isTopmostHier(hierId) && viewName == 'rs.view.HierDetail'){
			return true;
		}
		else{
			return false;
		}
	},
	
	onResize:function(){
	},
	
	_closePieTooltip:function(){
		if(this._pieTooltipPopup)
		{
			this._pieTooltipPopup.close();
		}
	},	
	
	_mouseOutPieTooltip:function(){
		var that = this;
		clearTimeout(this._pieTooltipTimer);
		this._pieTooltipTimer = setTimeout(function() {
			that._closePieTooltip();
		}, 200);	
	},
	
	_mouseOverPieTooltip: function(){
		clearTimeout(this._pieTooltipTimer);
	},
	
	_mouseOutPieSlice: function(oEvent) {
		var that = this;
		clearTimeout(this._pieTooltipTimer);
		this._pieTooltipTimer = setTimeout(function() {
			that._closePieTooltip();
		}, 200);		
	},

	_mouseOverPieSlice: function(oEvent) {
		clearTimeout(this._pieTooltipTimer);
		if(this._pieTooltipPopup)
		{
			this._pieTooltipPopup.close();
		}
				
		this._pieTooltipPopup = rs.util.Util.showPieTooltip(oEvent.getParameters().data.data, oEvent.getParameters().position, this._mouseOverPieTooltip, this._mouseOutPieTooltip, this);
	},


	//Some static configuration value, so later only need change once
	SwitchToolbarHeight: 60,
	SwitchToolbarHeightPx: '60px',
	
	//The header part data, it may update by the TreeMap and load data call back
	_headerData: null,
	

	_pieTooltipPopup: null,
	_pieTooltipTimer: null,

});

//??need check why put it to base it not work
//rs.view.HierBaseView.prototype.renderer = 'sap.ui.core.mvc.JSViewRenderer';

rs.view.HierBaseView.prototype.createContent = function(oController) {
	return null;
};

