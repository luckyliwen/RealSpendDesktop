sap.ui.controller("rs.controller.LineItem", {


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

	onConfigChanged: function(aEvent){
		
		if(rs.cfg.ChangeEvent.isContainsOneEventAtLeast( [rs.cfg.ChangeEvent.NumPrecision,
												rs.cfg.ChangeEvent.GoodThreshold, 
		                                        rs.cfg.ChangeEvent.BadThreshold,
		                                         rs.cfg.ChangeEvent.ColorScheme,
		                                         rs.cfg.ChangeEvent.CurrencyMode],aEvent)){
			// the header data need to be re-rendered
			this._view._updateHeaderData();
			this._view._refreshScreenForCfgChanged();
			
		}		

	},

	onToggleOpenState:function(oEvent){

		var bExpanded = oEvent.getParameter("expanded");

		var context = oEvent.getParameters().rowContext;
		
		var bindPath = context.sPath;
		if (bExpanded) {
			var data = this._view.getModel().getProperty(bindPath,context);
			var hierPara = {
					hierId:		this._view.getRsHierId(),
					byHierId:	this._view.getRsByHierId(),
					groupType:	data.GroupType,
					groupId:	data.GroupID
			};

			var loadStatus = data.loadStatus;
			if (loadStatus == rs.LoadStatus.NotStart) {
				//first time need load
				rs.model.ModelMng.loadLineItemDetail(hierPara);
			} 
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
		if ( this._view.getOldHierId() == this._view.getRsHierId() && this._view.getOldByHierId() == this._view.getRsByHierId()) {
			//No need do anything
			return;
		} else {
			//first unload the old data
			this.unloadData();
		}
		
		this._oModelInfo = rs.model.ModelMng.getLineItemTreeModelInfo(this._view.getRsHierId(),this._view.getRsByHierId());
		
		if (this._oModelInfo.getLoadStatus() == rs.LoadStatus.NotStart) 
		{
            //Just pass down the hierId as extra param
			rs.model.ModelMng.loadLineItemTree(this._view.getRsHierId(),this._view.getRsByHierId(),
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
		
		rs.view.Help.setActiveTableHeight();
		
		rs.util.Util.hideLoadingIndicator(this._popupLoading);
		this._view._updateHeaderData();
		this._bindModelAndRows();
	},

	loadDataFailCB : function(error, cbData) {
		if ( cbData != this._view.getRsHierId()) {
			//The data not for current view, just ignore (as it saved in the model part, so still is there)
			return;
		}
		rs.util.Util.hideLoadingIndicator(this._popupLoading);
		//alert("load line item data fail! ");
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
		this._view._oTreeTable.bindRows(this._oModelInfo.getRowInfo());
	},

	onSearchSuggest:function(oEvent){
		var oFilter = null;
		var oTable = this._view._oTreeTable;
		var oTableBinding = oTable.getBinding("rows");
		
		var value = oEvent.getParameter("value");
		if(value)
		{
			oFilterName = new sap.ui.model.Filter("Name",sap.ui.model.FilterOperator.Contains, value);
			oFilterDepartment = new sap.ui.model.Filter("Department",sap.ui.model.FilterOperator.Contains, value);
			oFilterDescription = new sap.ui.model.Filter("Description",sap.ui.model.FilterOperator.Contains, value);
			oFilterProject = new sap.ui.model.Filter("Project",sap.ui.model.FilterOperator.Contains, value);
			oTableBinding.filter([oFilterName, oFilterDepartment, oFilterDescription, oFilterProject]);
		}
		else
		{
			oTableBinding.filter(null);
		}
	},
	
	onExpandAll:function(){
		var oTable = this._view._oTreeTable;
		rs.util.Util.expandTreeNodes(oTable, true, -1);
	},
	
	onCallapseAll: function(){
		var oTable = this._view._oTreeTable;
		rs.util.Util.expandTreeNodes(oTable, false, 0);
	},
	
	onExpandToLevel:function(strLevel){
		var oTable = this._view._oTreeTable;
		
		var level = parseInt(strLevel);
		rs.util.Util.expandTreeNodes(oTable, false, 0);
		rs.util.Util.expandTreeNodes(oTable, true, level);
	},
	

});