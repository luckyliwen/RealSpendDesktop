sap.ui.controller("rs.controller.Trend", {


/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
*/
   onInit: function() {
	   this._view = this.getView();
	   this._viewId =  this._view.getId();  
   },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
*/
//   onBeforeRendering: function() {
//
//   },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
*/
//   onAfterRendering: function() {
//
//   },

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
*/
//   onExit: function() {
//
//   }

	/**
	 * The call back for swtich between tree map, tree table and pie
	 */
	onAreaBarTableSwitch : function(oEvent) {
		
		var viewType = this._view.getViewType();
		
		this._view._oAreaBarTableMng.setActivePage(viewType);				

		if(  viewType == this._view.ViewType.Bar ||  viewType == this._view.ViewType.Area ){
			this._view._oBoxSizeInfoTextView.setVisible(false);
		}
		else{
			this._view.setTreeTableScroll();
			
			this._view._oBoxSizeInfoTextView.setVisible(true);
			rs.view.Help.setActiveTableHeight();
		}

		// set the legend mode
		switch(viewType){
		case this._view.ViewType.Bar:
			this._view.setLegendMode(rs.view.LegendMode.TrendBar);
			break;
		case this._view.ViewType.Area:
			this._view.setLegendMode(rs.view.LegendMode.TrendArea);
			break;
		case this._view.ViewType.Table:
			this._view.setLegendMode(rs.view.LegendMode.TrendTable);
			break;
		}

		rs.view.Legend.showLegend(this._view._getCurrentLegendType());	
	},

	onMonthQuarterYearSwitch : function(oEvent) {
		this._bindModelAndRows();
		this._view._refreshAreaBarChart();
		this._view.adjustTreeTableRows();
		this._view.setTreeTableScroll();
	},

	onConfigChanged: function(aEvent){
		
		if(rs.cfg.ChangeEvent.isContainsOneEventAtLeast( [rs.cfg.ChangeEvent.NumPrecision,
												rs.cfg.ChangeEvent.GoodThreshold, 
		                                        rs.cfg.ChangeEvent.BadThreshold,
		                                        rs.cfg.ChangeEvent.ColorScheme,
		                                        rs.cfg.ChangeEvent.CurrencyMode],aEvent)){

			this._view._refreshScreenForCfgChanged();
			
		}
	},

	/*while load data from back-end ,need unload data first*/
	unloadData:function(){
		this._unbindModelAndRows();
		var cell = sap.ui.getCore().byId(this._view.createId( 'TrendAreaViewMatrixCell'));
		cell.destroyContent();
		cell = sap.ui.getCore().byId(this._view.createId( 'TrendBarViewMatrixCell'));
		cell.destroyContent();
	},
	/**
	 * Try to show available data or load data from the backend according to current status
	 */
	showOrLoadData : function() {
		if ( this._view.getOldHierId() == this._view.getRsHierId() && this._view.getOldByHierId() == this._view.getRsByHierId()) {
			//No need do anything
			return;
		} else {
			//first unload the old data
			this.unloadData();
		}
		this._oModelInfo = rs.model.ModelMng.getTrendDataModelInfo(this._view.getRsHierId(),this._view.getRsByHierId());
	
		if (this._oModelInfo.getLoadStatus() == rs.LoadStatus.NotStart) 
		{
			rs.model.ModelMng.loadTrendDataByTwoHierId(this._view.getRsHierId(),this._view.getRsByHierId(),
					this.loadDataSuccCB, this.loadDataFailCB, this,this._view.getRsHierId());

			this._popupLoading = rs.util.Util.showLoadingIndicator(this._view.createId('contentCell'));
		} else if (this._oModelInfo.getLoadStatus() == rs.LoadStatus.Pending)
		{
			this._popupLoading = rs.util.Util.showLoadingIndicator(this._view.createId('contentCell'));
		}
		else if(this._oModelInfo.getLoadStatus() == rs.LoadStatus.Succ){
			this.loadDataSuccCB(this._view.getRsHierId());
		}
		else if(this._oModelInfo.getLoadStatus() == rs.LoadStatus.Fail){
			this.loadDataFailCB();
		}				
		
	},

	/**
	 * 
	 * @param cbData
	 */
	loadDataSuccCB : function( cbData ) {
		if ( cbData != this._view.getRsHierId()) {
			//The data not for current view, just ignore (as it saved in the model part, so still is there)
			return;
		}		

		rs.util.Util.hideLoadingIndicator(this._popupLoading);
		
		this._view.setTreeTableScroll();
		this._view._refreshAreaBarChart();
		this._bindModelAndRows();
		this._view._updateHeaderData();		
		
		//rs.view.Legend.showLegend(this._getCurrentLegendType());
		
	},

	loadDataFailCB : function(error, cbData) {
		if ( cbData != this._view.getRsHierId()) {
			//The data not for current view, just ignore (as it saved in the model part, so still is there)
			return;
		}
		rs.util.Util.hideLoadingIndicator(this._popupLoading);
		rs.util.Util.showErrorMessage(null, error, null, null);
	},


	_unbindModelAndRows: function() {
		this._view.setModel(null);		
		this._view._oTreeTable.setModel(null);
		this._view._oTreeTable.unbindRows();
	},
	
	_bindModelAndRows: function() {
		//Just  bind data				
		this._view.setModel(this._oModelInfo.getSAPModel());
		this._view._oTreeTable.setModel(this._oModelInfo.getSAPModel());
		this._view._oTreeTable.bindRows(this._oModelInfo.getRowInfoByPeriodType(this._view._getCurrentPeriodType()));
		
	},

});