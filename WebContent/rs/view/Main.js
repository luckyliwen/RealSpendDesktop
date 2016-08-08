/**
 * this class is the main class which will cooperate with the other component, so it just use the global class instead of teh sap.ui.jsview
 */
rs.view.TabIdx = {
	OverView : 0,
	Dep : 1,
	Exp : 2,
	Prj : 3
};
var gShell = null;

sap.ui.jsview("rs.view.Main", {
	
	getControllerName: function() {
		return "rs.controller.Main";
	},	

	init: function(){
		this._oController = this.getController();
	},
	
	createContent: function(oController) {
	},
	
	_init : function() {
		this._createTopViews();
		
		//this.createShell();
		
		this.onReady();
	},

	onWorksetItemSelected: function(oEvent) {
			if (this._bViewCreated)
			{
				var sId = oEvent.getParameter("id");
				var oShell = oEvent.oSource;
				//now id like WI_0 ~WI_3, so just by last idx can know how to switch
				idx =  parseInt( sId.substr( sId.length -1));
				oShell.setContent( this._aTopView [ idx ] ) ;
			}
	},
	
	/*
	*Simulate user click a tab, used by pie select, or click the alert jump to other view, for ux3 and normal tab have different action
	*/
	simulateTabItemClicked: function(idx) {
		//by this way not work, so use the jQuery this._oShell.fireWorksetItemSelected('NavItem_' + idx);
		var id = '#NavItem_' + idx;
		$(id).click();
	},
	
	getActiveTopView : function() {
		var selId = this._oShell.getSelectedWorksetItem();
		idx =  parseInt( selId.substr( selId.length -1));
		return this._aTopView[idx];
	},


	createShell : function() {
		 var that = this;
		 this._oShell = new sap.ui.ux3.Shell("mainShell", {
			 //title
			appTitle: "RealSpend",
			appIcon: "images/SAPLogo.png",
			appIconTooltip: "SAP RealSpend",
			
			headerType: sap.ui.ux3.ShellHeaderType.SlimNavigation,
			fullHeightContent: false,
			
			//left part
			showLogoutButton: false,
			showSearchTool: false,
			showInspectorTool: false,
			showFeederTool: false,
			
			worksetItems: [  new sap.ui.ux3.NavigationItem("NavItem_0", {key:"NavItem_0",	text:"{i18n>Overview}"}),
			                 new sap.ui.ux3.NavigationItem("NavItem_1", {key:"NavItem_1",   text:"{i18n>Department}"}),
			                 new sap.ui.ux3.NavigationItem("NavItem_2", {key:"NavItem_2",	text:"{i18n>ExpenseType}"}),
			                 new sap.ui.ux3.NavigationItem("NavItem_3", {key:"NavItem_3",	text:"{i18n>Project}"})],
			
			//paneBarItems: [ new sap.ui.core.Item("PI_Date",{key:"pi_date",text:"date"}),
			//              new sap.ui.core.Item("PI_Browser",{key:"pi_browser",text:"browser"})],
			                 
	         headerItems: [
						new sap.ui.commons.Button({
							text: "{i18n>Title_Alert}",
							//icon: "images/LeftNavi_Alert_Button.png",
							lite: true,
							press: function(){
									if (that._bViewCreated) 
									{
										rs.view.Alert.showAlert();
									}	
								}
						}),
						
				       new sap.ui.commons.Button({
				        	text: "{i18n>TimePeriod}",
				        	//icon: "images/TimePeriodButton.png",
				        	lite: true,
				        	press: function(){
				        		if (that._bViewCreated)
				        		{
				        			rs.cfg.onTimePeriodClicked();	
				        		}
				        	}
				        }),
				        /*
			            new sap.ui.commons.Button({
			            	text: "{i18n>Title_Share}",
			            	//icon: "images/ExportButton.png",
			            	lite: true,
			            	press: function(){
			            		if (that._bViewCreated)
			            		{
			            			rs.view.Help.doExport();	
			            		}
			            	}
			            }), 
			            */ 
			
			            new sap.ui.commons.Button({
			            	text: "{i18n>Help}",
			            	//icon: "images/HelpButton.png",
			            	lite: true,
			            	press: function(){rs.view.HelpInfo.showHelp();}
			            }), 
			            
			            new sap.ui.commons.Button({
			            	text: "{i18n>Title_Setting}",
			            	//icon: "images/settingButton.png",
			            	lite: true,
			            	press: function(){rs.cfg.onSettingDialogClicked();}
			            })	
                    ]
		 });
		 
		 this._oShell.attachWorksetItemSelected( this.onWorksetItemSelected, this);
		 
		 this._oShell.placeAt('main-tabs');
		 
		 //and set the first view as the default content
		 //this._oShell.setContent( this._aTopView[0]);
		 
		 
		 gShell = this._oShell;

	},

	/**
	 * 
	 */
	onReady: function() {
		this.bindEvents();
	},
	
	/**
	 * Bind the events, this must be called after document finished load
	 */
	bindEvents : function() {
		this._bindResizeEvent();
		this._bindMouseDownEvent();
	},

	/**
	 * According to the current setting and last time setting adjust the Project tab and project view
	 */
	updateProjectTabAndView: function() {
		//hide or show the project tab
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			$('#rs_tab_3').show();
		} else {
			$('#rs_tab_3').hide();
		}
		
		//then the project view	
		//But for the Prj, only create it when configure the parameter
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			if ( this._aTopView.length == 3) {
				//old not exists, need add
				var prjNaviMng = this._createPrjViewAndNaviMng();
				prjNaviMng.doInit();
				
				this._aTopView.push( prjNaviMng);
				this._oTopViewMng.addPage(prjNaviMng);
			}
		} else {
			if ( this._aTopView.length == 4) {
				//old exists, need remove from PageMng and _aTopView
				this._oTopViewMng.removeLastPage();
				this._aTopView.pop();
			}
		}
	},
	
	/**
	 * Call back for the backend basic data load successful
	 */
	OnBackendBasicDataLoadSucc : function() {
		if (!this._bViewCreated) {
			
			this._bViewCreated = true;
			
			//Now know the backend configuration, so know how to create main panel
			this._init();
			
			
			this.updateProjectTabAndView();
			
			//then ask all the view to load the data
			for ( var i = 1; i < this._aTopView.length; i++) {
				this._aTopView[i].getMainPage().getController().loadData();
			}
		} else {
			//Update the pie number first
			this._overViewPage.updatePieNum( this.getPieNum() );
			
			//When switch demo/network mode, the project may dispear or appear, so need do update
			this.updateProjectTabAndView();
			
			//then ask all the view to load the data
			for ( var i = 1; i < this._aTopView.length; i++) {
				this._aTopView[i].getMainPage().getController().reloadData();
			}
			
		}
	},

	/**
	 * 
	 * @param bSwitchDemoNetworkMode: if true, then is caused by switch between the demo/network mode, 
	 *                                otherwise, the first time call back then need do the init work to create view content   
	 */
	onBackendBasicDataLoadFail : function(error,bSwitchDemoNetworkMode) {
		//??If failed, can do nothing
		/*
		alert('Load data from backend ' + rs.cfg.Cfg.getBaseUrl()
				+ ' failed:\r\n' + rs.util.Util.getInforFromError(error));
		*/
		rs.util.Util.showErrorMessage(null, error, null, null);
				
	},


	getTabIdxByHierType:function(hierType){
		return this._getTabIdxByHierType(hierType);
	},
	
	_createNaviMngForHierOverView: function(view) {
		var naviMng = sap.ui.view({
			id : 'navi-' + view.getId(),
			viewName : "rs.view.NaviMng",
			type : sap.ui.core.mvc.ViewType.JS,
			viewData: {'type': view.getRsHierType()}
		});
		
		//and set the relationship for each other
		naviMng.setMainPage(view);
		view.setNaviMng(naviMng);
		return naviMng;
	},
	
	/**
	 * Create the Project view and the wrapped NaviMng view
	 */
	_createPrjViewAndNaviMng: function() {
		if (this._oPrjNaviMng) {
			return this._oPrjNaviMng;
		}
		
		var viewPrj = new rs.view.HierOverView("PrjOV", {
			rsHierType : rs.HierType.Prj,
			rsTabIdx : rs.view.TabIdx.Prj,
			viewName : 'rs.view.HierOverView'
		});
		viewPrj.doInit();
		
		this._oPrjNaviMng = this._createNaviMngForHierOverView(viewPrj);
		return this._oPrjNaviMng;
	},
	
	getPieNum: function() {
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			return 3;
		} else {
			return 2;
		}
	},
	
	_createTopViews : function() {
		sap.ui.localResources("rs");

		var pieNum = this.getPieNum();
		
		//!! if later the OverView also use the same logic, then can put the data in a array and use loop to do init work
		var viewOverview = new  rs.view.OverView({
			pieNum: pieNum,
			id : "MainOV",
			viewName : "rs.view.OverView",
		});

		var viewDep = new rs.view.HierOverView("DepOV", {
			rsHierType : rs.HierType.Dep,
			rsTabIdx : rs.view.TabIdx.Dep,
			viewName : 'rs.view.HierOverView',
		});

		
		var viewExp = new rs.view.HierOverView("ExpOV", {
			rsHierType : rs.HierType.Exp,
			rsTabIdx : rs.view.TabIdx.Exp,
			viewName : 'rs.view.HierOverView'
		});

		//now can ask the hierView to do the init work as it has enough info now
		viewDep.doInit();
		viewExp.doInit();
		
		//the first three tab always ready  
		//??here need use the NaviMng to wrap the hierView
		this._aTopView.push(viewOverview);
		
		this._aTopView.push(this._createNaviMngForHierOverView(viewDep));
		this._aTopView.push(this._createNaviMngForHierOverView(viewExp));
		
		//But for the Prj, only create it when configure the parameter
		if ( rs.model.GeneralParam.isPrjAvailable()) {
			var prjNaviMng = this._createPrjViewAndNaviMng();
			this._aTopView.push( prjNaviMng);
		}
		
		//now can do init work
		for ( var i = 0; i < this._aTopView.length; i++) {
			this._aTopView[i].doInit();
		}

		//this._oTopViewMng = new rs.view.PageMng('data-view', this._aTopView);
		//this._oTopViewMng.setActivePage(rs.view.TabIdx.OverView);
		
		this._overViewPage = viewOverview;
		
		this._oShell.setContent( this._aTopView[0]);
	},


	_bindResizeEvent:function(){
		var that = this;
		var resizeTimer = null;
		$(window).resize(function(event) {
			if (resizeTimer)
			{
				clearTimeout(resizeTimer);
				resizeTimer = null;
			}
			resizeTimer = setTimeout(function() 
			{
				if(that._overViewPage)
				{
					that._overViewPage.onResize();	
				}
				
				for ( var i = 1; i < that._aTopView.length; i++) 
				{
					that._aTopView[i].getMainPage().onResize();
				}			   
			}, 250);
			  
		});		
	},	
	
	_bindMouseDownEvent:function(){
		$(window).mousedown(function(event) {
			rs.util.Util.setMousePosition(event.clientX, event.clientY);
		});		
	},


	_getTabIdxByHierType: function(hierType) {
		switch (hierType) {
			case rs.HierType.Dep:  return rs.view.TabIdx.Dep;
			case rs.HierType.Exp:  return rs.view.TabIdx.Exp;
			case rs.HierType.Prj:  return rs.view.TabIdx.Prj;
			default:
				rs.assert(false);
		}
	},

	_oShell : null,
	
	//The topmost 4 tabs 
	_overViewPage : null, //just a shorthand 

	_aTopView : [],
	_oTopViewMng : null,
	
	_bViewCreated: false,
	
	//The project navigation mng view, here need a separate variable because when switch between the demo/network mode, it may appear/disappear, 
	//so save it here can be reused later
	_oPrjNaviMng: null,
	
	_oController: null,
});