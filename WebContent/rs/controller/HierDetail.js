sap.ui.controller("rs.controller.HierDetail", {


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
	 * The call back for switch between bar table and text table
	 */
	onViewTypeChanged : function(oEvent) {
		
		//switch to different view
		var viewType = this._view.getViewType();
		this._view._oViewMng.setActivePage(viewType);
		
		if( viewType == this._view.ViewType.Bar){
			this._view._oSBBudgetSpend.setVisible(true);
			this._view.setActiveTable(this._view._oBarTreeTable);
		} else {
			this._view._oSBBudgetSpend.setVisible(false);
			this._view.setActiveTable(this._view._oTextTreeTable);
		}

	},
	
	
	/**
	 * Call back function for the budget ratio and spending model
	 * @param oEvent
	 */
	onModelTypeChanged : function(oEvent) {
		//Just switch the visible of two column
		var visible = this._view.isBudgetModel();
		
		this._view._oColumnBudgetRatioBar.setVisible( visible ); 
		this._view._oColumnSpendingBar.setVisible( !visible );
	},
	

	onConfigChanged: function(aEvent){	
		
		if(rs.cfg.ChangeEvent.isContainsOneEventAtLeast( [rs.cfg.ChangeEvent.NumPrecision,
												rs.cfg.ChangeEvent.GoodThreshold, 
		                                        rs.cfg.ChangeEvent.BadThreshold,
		                                         rs.cfg.ChangeEvent.ColorScheme,
		                                         rs.cfg.ChangeEvent.CurrencyMode],aEvent)){
			// the header data need to be re-rendered
			this._view.updateHeaderDataByHierNodeId(this._view.getRsHierId());
			
			this._view._refreshScreenForCfgChanged();
			
		}

	},

	/*while load data from back-end ,need unload data first*/
	unloadData:function(){
		this._unbindModelAndRows();
	},
	
	/**
	 * Try to show available data or load data from the backend according to current status
	 */
	showOrLoadData : function() {
		if ( this._view.getOldHierId() == this._view.getRsHierId()) {
			//No need do anything
			return;
		} else {
			//first unload the old data
			this.unloadData();
		}

		this._oModelInfo = this._view.getSpendDataModelInfo(this._view.getRsHierId());
		
				
		if (this._oModelInfo.getLoadStatus() == rs.LoadStatus.NotStart) 
		{
			this._popupLoading = rs.util.Util.showLoadingIndicator(this._view.createId('contentCell'));
			//Just pass down the hierId as extra param
			

			if(this._view.getViewName() == 'rs.view.HierDetail'){
				rs.model.ModelMng.loadSpentData4Detail(this._view.getRsHierId(),
						this.loadDataSuccCB, this.loadDataFailCB, this,  this._view.getRsHierId() );
			}
			else{
				rs.model.ModelMng.loadSpentData4Overview(this._view.getRsHierId(),
						this.loadDataSuccCB, this.loadDataFailCB, this,  this._view.getRsHierId() );
			}			
			
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
		
		this._view.updateHeaderDataByHierNodeId(this._view.getRsHierId());
		
		this._bindModelAndRows();	
	},

	loadDataFailCB : function(error, cbData) {
		if ( cbData != this._view.getRsHierId()) {
			//The data not for current view, just ignore (as it saved in the model part, so still is there)
			return;
		}

		rs.util.Util.hideLoadingIndicator(this._popupLoading);
		//alert("load detail data fail! ");
		rs.util.Util.showErrorMessage(null, error, null, null);
	},

	
	
	_unbindModelAndRows: function() {
		this._view.setModel(null);
		
		this._view._oBarTreeTable.setModel(null);
		this._view._oBarTreeTable.unbindRows();

		this._view._oTextTreeTable.setModel(null);
		this._view._oTextTreeTable.unbindRows();
	},
	
	_bindModelAndRows: function() {
		//Just  bind data
		this._view.setModel(this._oModelInfo.getSAPModel());
		
		this._view._oBarTreeTable.setModel(this._oModelInfo.getSAPModel());
		this._view._oBarTreeTable.bindRows(this._oModelInfo.getRowInfo());
		
		this._view._oTextTreeTable.setModel(this._oModelInfo.getSAPModel());
		this._view._oTextTreeTable.bindRows(this._oModelInfo.getRowInfo());
	},
	
	onTreeTableRowSelected: function(oEvent) {	
		if(rs.view.Note.oNotePopup!=null && rs.view.Note.oNotePopup.isOpen())
		{
			return;
		}
		var rowIndex = oEvent.getParameters().rowIndex;
		if(rowIndex >= 0)
		{
			var context = oEvent.getParameters().rowContext;
			
			var data = this._view.getModel().getProperty("",context);
			
			//for the group, just exit
			if ( data.isGroupHeader) {
				return;
			}
			
			this._view.total4Lineitem = data.Total;
			this._view.variance4Lineitem = data.Variance;
	        this._view.variancePercentage4LineItem = data.VariancePercentage;
	          
	        if(this._view.getRsHierType() == rs.HierType.Dep || this._view.getRsHierType() == rs.HierType.Prj)
	        {
	        	 this._view.byHierId = data.CEHierarchyNodeID;
	        }
	        else
	        {
	        	this._view.byHierId = data.CCHierarchyNodeID;
	        	if(this._view.byHierId =="")
	        	{
	        		this._view.byHierId = data.IOHierarchyNodeID;
	        	}
	        }	
	
			var position = rs.util.Util.getMousePosition();
			var option = {bShowTrend: true, bHorizontalArrowOnly: true};
			var callback = {detailCallback: this.onSeeDetailsPressed, trendCallback: this.onSeeTrendPressed};			
			
			rs.util.Util.showExpensePopup(data, position, option, callback, null, this);			
		}

		
	},

	onSeeDetailsPressed: function() {
		var naviMng = this._view.getNaviMng();
		
		var mSetting = {naviItem: this._view.getTitle()};
		
		if (this._view._oLineItemView == null) {
			this._view._oLineItemView = new rs.view.LineItem( this._view.createId('LineItem'),
				{
					rsHierType: this._view.getRsHierType(),
					rsHierId:  this._view.getRsHierId(),
					rsByHierId: this._view.byHierId,
					total: this._view.total4Lineitem,
					variance:this._view.variance4Lineitem,
					variancePercentage:this._view.variancePercentage4LineItem,
					viewName : 'rs.view.LineItem'
				});
			
			this._view._oLineItemView.doInit();
		} else {
	
			//just update the data
			this._view._oLineItemView.setRsHierId(this._view.getRsHierId());
			this._view._oLineItemView.setRsByHierId(this._view.byHierId);
			this._view._oLineItemView.setRsHierType(this._view.getRsHierType());
			this._view._oLineItemView.setTotal(this._view.total4Lineitem);
			this._view._oLineItemView.setVariance(this._view.variance4Lineitem);
			this._view._oLineItemView.setVariancePercentage(this._view.variancePercentage4LineItem);
		}
			
		this._view._oLineItemView.getController().showOrLoadData();
		
		naviMng.push( this._view._oLineItemView,  mSetting);
	},
	
	onSeeTrendPressed: function() {
		var naviMng = this._view.getNaviMng();
		var mSetting = {naviItem: this._view.getTitle()	};
		
		if (this._view._oTrendView == null) {
			this._view._oTrendView = new rs.view.Trend( this._view.createId('Trend'),
				{
					rsHierType: this._view.getRsHierType(),
					rsHierId:  this._view.getRsHierId(),
					rsByHierId: this._view.byHierId,
					viewName : 'rs.view.Trend'
				});
			
			this._view._oTrendView.doInit();
			
		} else {			
			this._view._oTrendView.setRsHierId(this._view.getRsHierId());
			this._view._oTrendView.setRsByHierId(this._view.byHierId);
			this._view._oTrendView.setRsHierType(this._view.getRsHierType());
		}
			
		this._view._oTrendView.getController().showOrLoadData();
		
		naviMng.push( this._view._oTrendView,  mSetting);
	},


	onSearchSuggest:function(oEvent){
		var oFilter = null;
		var oTable = this._view.getActiveTable();
		var oTableBinding = oTable.getBinding("rows");
		
		if(oEvent.getParameter("value"))
		{
			oFilter = new sap.ui.model.Filter("Name",sap.ui.model.FilterOperator.Contains, oEvent.getParameter("value"));
			oTableBinding.filter([oFilter]);
		}
		else
		{
			oTableBinding.filter(null);
		}
	},
	
	onExpandAll:function(){
		var oTable = this._view.getActiveTable();
		rs.util.Util.expandTreeNodes(oTable, true, -1);
	},
	
	onCallapseAll: function(){
		var oTable = this._view.getActiveTable();
		rs.util.Util.expandTreeNodes(oTable, false, 0);
	},
	
	onExpandToLevel:function(strLevel){
		var oTable = this._view.getActiveTable();
		
		var level = parseInt(strLevel);
		rs.util.Util.expandTreeNodes(oTable, false, 0);
		rs.util.Util.expandTreeNodes(oTable, true, level);
	},
	

});