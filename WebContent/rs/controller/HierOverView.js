sap.ui.controller("rs.controller.HierOverView", {


	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	*/
   onInit: function() {
	   
	   this._view = this.getView();
	   this._viewId =  this._view.getId();
	   
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("config", "configChanged", this.onConfigChanged, this);
	   
	   
   },

	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	*/
   onBeforeRendering: function() {
	   //console.log('==before view render');
   },

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	*/
   onAfterRendering: function() {
	   //console.log('View has been render');
   },

	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	*/
   onExit: function() {

   },

   
	reloadData:function(){
		this._unbindModelAndRows();

		if (this._view._oDetailView != null){
			this._view._oDetailView.clearId();
		}
		this.loadData();
	},
	
	loadData : function() { 
		var hierId  = rs.model.HierMng.getTopHierIdByType( this._view.getRsHierType());
		this._view.setRsHierId( hierId);
		
		//In some case, it don't have the hier information for one type, if so just ignore it 
		//?? Need show to user
		rs.cfg.TimePeriods.disable();
		rs.model.ModelMng.loadSpentData4Overview(this._view.getRsHierId(), this.loadDataSuccCB, this.loadDataFailCB, this);

		this._oModelInfo = this._view.getSpendDataModelInfo(this._view.getRsHierId());

		//must be in pending status
		rs.assert(this._oModelInfo.getLoadStatus() == rs.LoadStatus.Pending);
		rs.util.Util.showBusyIndicator();
		
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
		var oTableBinding = this._view._oTreeTable.getBinding("rows");
		
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
	
	onExpandAll:function(oEvent){
		rs.util.Util.expandTreeNodes(this._view._oTreeTable, true, -1);
	},
	
	onCallapseAll: function(oEvent){
		rs.util.Util.expandTreeNodes(this._view._oTreeTable, false, 0);
	},
	
	onExpandToLevel:function(strLevel){
		
		var level = parseInt(strLevel);
		rs.util.Util.expandTreeNodes(this._view._oTreeTable, false, 0);
		rs.util.Util.expandTreeNodes(this._view._oTreeTable, true, level);
	},
	
	loadDataSuccCB : function() {
	
		rs.util.Util.hideBusyIndicator();
		rs.cfg.TimePeriods.enable();
		
		$("#"+this._view.createId("TreeTable")).css("height",this._view.getMainContentHeight()+"px");
		
		this._bindModelAndRows();					
		
		this._view.updateHeaderDataByHierNodeId(this._view.getRsHierId());
		
		this._view._reAddPieToContainer();//add the pie to layout
		this._view._reAddTreeMapToContainer();	
		this._view._pieSliceIndex = 0; //set the dafault pie selected slice index
		
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("main", "reloadDataSucceed", {
			hierType :this._view.getRsHierType()
		});		
		
		
	},

	loadDataFailCB : function(error) {
		rs.util.Util.hideBusyIndicator();
		rs.cfg.TimePeriods.enable();
		
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("main", "reloadDataFailed", {
			error: error,
			hierType :this._view.getRsTabIdx()
		});				
		
	},
	

	/**
	 * The call back for switch between tree map, tree table
	 */
	onViewTypeChanged: function(oEvent) {
		
		var viewType = this._view.getViewType();
		
		//switch to different view
		this._view._oViewMng.setActivePage(viewType);
		
		//Update hint info
		this._view.updateMainContentHintInfo();

		//show or hide model switch control ??the way is not good!! 
		if( viewType == this._view.ViewType.TreeTable){
			this._view._oSBBudgetSpend.setVisible(false);
		}
		else{
			this._view._oSBBudgetSpend.setVisible(true);
		}
	},


	onModelTypeChanged : function(oEvent) {
		
		if (this._view.getViewType() == this._view.ViewType.TreeMap ) {
			this._view.updateMainContentHintInfo();
			
			var treemap = sap.ui.getCore().byId(this._view.createId("treeMapView"));
			treemap.refreshTreeMap();
		} else {

			this._view._reAddPieToContainer();
			this._view._BarChartRenderAfterPieEndRotate = false;
		}
	},

	onConfigChanged: function(aEvent){
		if(rs.cfg.ChangeEvent.isContainEvent( rs.cfg.ChangeEvent.TimePeriod,aEvent)){
			this._view._headerData = null;	//need reset the headData while time period changed
			this.reloadData();			
		}

		if(rs.cfg.ChangeEvent.isContainsOneEventAtLeast( [rs.cfg.ChangeEvent.NumPrecision,
												rs.cfg.ChangeEvent.GoodThreshold, 
		                                        rs.cfg.ChangeEvent.BadThreshold,
		                                         rs.cfg.ChangeEvent.ColorScheme,
		                                         rs.cfg.ChangeEvent.CurrencyMode],aEvent)){
			
			// Only when there are valid header data, then it need to be re-rendered
			if(this._view._headerData != null){
				this._view.updateHeaderData( this._view._headerData);
			}
			else{
				//Only the case is that it failed to load data, in this case, nothing need do
			}
			
			this._view._refreshScreenForCfgChanged();
		}
	},

	onSeeDetailsPressed: function(hierType, hireId){
		
		var naviMng = this._view.getNaviMng();
		
		var mSetting = {naviItem: this._view.getTitle()};
				
		//Only create for first time
		if (this._view._oDetailView == null) {
			this._view._oDetailView = new rs.view.HierDetail( this._view.createId('HierDetail'),
			{
				rsHierType: hierType,
				rsHierId:  hireId,
				viewName : 'rs.view.HierDetail'
			});
			this._view._oDetailView.doInit();
		} else {
			this._view._oDetailView.setRsHierId(hireId);
		}

		this._view._oDetailView.getController().showOrLoadData();		
		
		naviMng.push( this._view._oDetailView,  mSetting);
	},
	
	/**
	 * Call back function for tree table one row selected 
	 * @param oEvent
	 */
	onTreeTableRowSelected: function(oEvent) {
		
		var rowIndex = oEvent.getParameters().rowIndex;
		if(rowIndex >= 0)
		{
			hireType = this._view.getRsHierType();
			hireId = this.getHierIdByRowSelectEvent( oEvent);
			this.onSeeDetailsPressed(hireType, hireId);
		}
		
	},	

	onHeaderAreaClicked :function(event){
	
			var position = [];
			position[0] = event.clientX;
			position[1] = event.clientY;

			//As the header may change by TreeMap, so hierId need get from the header data
			var hireId = this._view._headerData[ rs.view.Help.getHierNodeKey( this._view.getRsHierType())];
			var option = {bShowTrend: false, bHorizontalArrowOnly: false};
			var argument = [this._view.getRsHierType(), hireId];
			var callback = {detailCallback: this.onSeeDetailsPressed, trendCallback: null};				
			
			rs.util.Util.showExpensePopup(this._view._headerData, position, option, callback, argument, this);
      },
	

	onTreeMapZoom:function(oEvent){
		var data = oEvent.getParameters().zoomedObject;
		this._view.updateHeaderData(data);
	},
	
	onTreeMapClick: function(oEvent){
		
		var position = oEvent.getParameters().position;
		var data = oEvent.getParameters().pressdObject;
	
		hireType = this._view.getRsHierType();
		hireId = data[rs.view.Help.getHierNodeKey(hireType)];		
		
		var option = {bShowTrend: false, bHorizontalArrowOnly: false};
		var argument = [hireType, hireId];
		var callback = {detailCallback: this.onSeeDetailsPressed, trendCallback: null};				
		
		rs.util.Util.showExpensePopup(data, position, option, callback, argument, this);
	},
   
	getHierIdByRowSelectEvent: function (oEvent) {
		var context = oEvent.getParameters().rowContext;
		
		//here by the hierType need know use which id need get:
		//CCHierarchyNodeID: "CC_R5002" 		CEHierarchyNodeID: "CEGSPEND"
		var hierId = this._view.getModel().getProperty(rs.view.Help.getHierNodeKey(this._view.getRsHierType()), context);
		return hierId;
	},   
	
	onPieEndRotate:function(oEvent)
	{
		clearTimeout(this._view._pieTooltipTimer);
	
		if(this._view._pieTooltipPopup)
		{
			this._view._pieTooltipPopup.close();
		}			
	
		this._view._pieSliceIndex = oEvent.getParameters().index;		  
	
		if(this._view._BarChartRenderAfterPieEndRotate)
		{
			this._view._reAddBarToContainer();
		}
		else
		{
			this._view._BarChartRenderAfterPieEndRotate = true;	
		}
	},	   
	
	/**
	 * The call back function after the pie rendering
	 */
	onAfterPieRender:function()
	{
		var pie = sap.ui.getCore().byId(this._view.createId("pieView"));
	
		//Budget Mode
		if(this._view.isBudgetModel())
		{
			var budget = pie.getData()[this._view._pieSliceIndex].Budget;	
			if(budget == 0)
			{
				for(var i = 0; ;i++)
				{
					if(pie.getData()[i].Budget != 0)
					{
						break;
					}
				}
				this._view._pieSliceIndex = i;
				this._view._BarChartRenderAfterPieEndRotate = true;
			}
		}
		else
		{
			//Spending Mode
			var total = pie.getData()[this._view._pieSliceIndex].Total;
			if(total == 0)
			{
				for(var i = 0; ;i++){
				if(pie.getData()[i].Total != 0)
				{
					break;
				}
				}
				this._view._pieSliceIndex = i;	
				this._view._BarChartRenderAfterPieEndRotate = true;
			}
		}      	      	
	
		if(this._view.pieResizeFlag)
		{
			this._view._BarChartRenderAfterPieEndRotate = false;
		}
		else
		{
			this._view.pieResizeFlag = false;
		}
		this._view._triggerPieSelectedOn(this._view._pieSliceIndex);		
	},	
   
   //==private
   
   _hierType: null,
   _view:    null,
   _viewId: null,
});
