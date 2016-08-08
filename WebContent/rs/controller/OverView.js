sap.ui.controller("rs.controller.OverView", {


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

	onModelTypeChanged : function() {
		this._view._showPieWithDifferentMode(rs.HierType.Dep);

		this._view._showPieWithDifferentMode(rs.HierType.Exp);

		if (this._view.getPieNum() == 3) {
			this._view._showPieWithDifferentMode(rs.HierType.Prj);
		}
	},

	onConfigChanged : function(aEvent) {

		if (rs.cfg.ChangeEvent.isContainsOneEventAtLeast(
				              [rs.cfg.ChangeEvent.GoodThreshold,
						rs.cfg.ChangeEvent.BadThreshold,
						rs.cfg.ChangeEvent.ColorScheme,
						rs.cfg.ChangeEvent.CurrencyMode], aEvent)) {

			this._view._invalidatePies();
			
			this._view._redrawPiesHeader();
		}

	},
	
	onSelectPieSlice : function(oEvent) {
		var hierType = rs.model.HierMng.getTypeById(oEvent.getParameters().data.data.hierId);

		clearTimeout(this._view._pieTooltipTimer);
		
		if(this._view._pieTooltipPopup)
		{
			this._view._pieTooltipPopup.close();
		}	

		var bus = sap.ui.getCore().getEventBus();
		bus.publish("main", "pieSliceClicked", {
			hierType : hierType,
			sliceIndex: oEvent.getParameters().index,
			mode: this._view.isBudgetModel()
		});		
	},	
	

   _view:    null,
   _viewId: null,
});
