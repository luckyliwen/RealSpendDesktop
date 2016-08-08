sap.ui.controller("rs.controller.Main", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 */
	onInit : function() {
		
		this._view = this.getView();
		this._viewId =  this._view.getId();		
		console.log('== rs.controller.Main onInit for the view ==', this._viewId);

		// subscribe to event bus
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("main", "reloadDataSucceed", this.onTopTabLoadDataSuccCB, this);
		bus.subscribe("main", "reloadDataFailed", this.onTopTabLoadDataFailCB, this);
		bus.subscribe("main", "pieSliceClicked", this.onPieSliceClicked, this);
		bus.subscribe("main", "alertItemClicked", this.onAlertItemClicked, this);

	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 */
	onBeforeRendering : function() {

	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 */
	onAfterRendering : function() {

	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 */
	onExit : function() {

	},

	bindSettingandHelpEvent:function(){
			$('#rs_setting').bind('click', $.proxy(rs.cfg.onSettingDialogClicked,rs.cfg));
			$('#rs_help').bind('click', $.proxy(rs.view.HelpInfo.showHelp, rs.view.HelpInfo));		
	},

	onTopTabClicked : function(tabId) {
		//Just by the last number to decide show which pages
		var idx = parseInt(tabId.substr(tabId.length - 1));
		
		this._view._oTopViewMng.setActivePage(idx);
		
		//Now when switch the tab, just display what the last time display
		//If later need change the logic to show the first page, then comments out following lines 
		/*
			this._aTopView[idx].showMainPage();
		*/
				
		var currentView = this._view._oTopViewMng.getActivePage();
		if('rs.view.OverView' == currentView.getViewName()){
			rs.view.Legend.showLegend(rs.view.LegendMode.Main);
		}
		else{
			var view = currentView.getActivePage();
			rs.view.Legend.showLegend(view.getLegendMode());
		}
				
		if('rs.view.NaviMng' == currentView.getViewName())
		{
			if(currentView.getActivePage() ==  currentView.getMainPage())
			{
				rs.cfg.TimePeriods.reset();
			}
			else
			{
				rs.cfg.TimePeriods.disable();
			}
		}
		else
		{
			rs.cfg.TimePeriods.reset();
		}
		
	},

	/**
	 * The call back function for the top 
	 */
	onTopTabLoadDataSuccCB : function(channelId, eventId, data) {
		//just tell the overview that some data has finished, it can show the information now
		if(rs.cfg.Cfg.desktop())
		{
			this._view._overViewPage.onTopHierLoadSucc(data.hierType);	
		}
	},
	
	/**
	 * The call back function for the top 
	 */
	onTopTabLoadDataFailCB : function(channelId, eventId, data){
		//alert("Load over view information for " + hierType + " failed:" + error);
		rs.util.Util.showErrorMessage(null, data.error, null, null);
		if(rs.cfg.Cfg.desktop())
		{
			this._view._overViewPage.onTopHierLoadFail(data.hierType);	
		}
		
	},
		
	
	//onPieSliceClicked: function(hierType,sliceIndex,mode){
	onPieSliceClicked: function(channelId, eventId, data){
		
		var idx = this._view.getTabIdxByHierType(data.hierType);

		this._view.simulateTabItemClicked(idx);

		this._view._aTopView[idx].getMainPage().showPieBarChart(data.sliceIndex, data.mode);
	},	
	
	onAlertItemClicked: function(channelId, eventId, data){
		var hierType;
		var hierId;
		if(data.ccHierId != "" && data.ioHierId ==""){
			hierType = rs.HierType.Dep;
			hierId = data.ccHierId;
		}
		else if(data.ccHierId == "" && data.ioHierId !=""){
			hierType = rs.HierType.Prj;
			hierId = data.ioHierid;
		}
		else{
			alert(" can not switch to detail view!");
			return;
		}
		var idx = this._view.getTabIdxByHierType(hierType);
		this._view.simulateTabItemClicked(idx);
		
		this._view._aTopView[idx].showMainPage();

		this._view._aTopView[idx].getMainPage().getController().onSeeDetailsPressed(hierType,hierId);

	},	

   _view:    null,
   _viewId: null,

});
