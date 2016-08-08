
 jQuery.sap.require("sap.ui.thirdparty.d3");
 jQuery.sap.require("sap.ui.thirdparty.datajs");
 
/**
 * Here create all the level 0 and level 1 namespace 
 */
rs = {};
rs.cfg = {};
rs.model = {};
rs.util = {};
rs.view = {};
rs.controller = {};

/**
 * Some shorthand for the long tools 
 */
rs.assert = jQuery.sap.assert;

/**
 * Used to assert the passed param is a sap.ui.core.Control
 */
rs.assertControl = function(ctrl) {
	jQuery.sap.assert( ctrl instanceof sap.ui.core.Control,  'It need a sap.ui.core.Control, but is ' + ctrl.toString());
};


/**
 * Used to assert the index is within the array index range
 * @param idx
 * @param arr
 * @param msg
 */
rs.assertIdxInArray = function(idx, arr, msg) {
	jQuery.sap.assert(  idx>=0 && idx<arr.length, "Index [" + idx + "] not within the rangne [0 :" + arr.length + " " + msg);
};

/**
 * the top level hierarchy 
 */
/*
rs.HierType = {
	Dep:    "Dep",
	Exp:	"Exp",
	Prj: 	"Prj"	
};
*/

rs.HierType = {
	Dep:   'CCG',
	Exp:	'CEG',
	Prj:	'IOG'
};

/**
 * Now the trend data will have following three types
 */
rs.PeriodType = {
		Monthly:   'month',
		Quarterly: 'quarter',
		Annual:    'annual'
};



/**
 * UI part can choose different action according to the load status  
 */
rs.LoadStatus = {
		NotStart: 'n',
		Pending:  'P',
		Succ:	  's',
		Fail: 	  'f'	
};

/**
 * note operation type: add & delete
 */
rs.NoteOperation = {
		Add : 'add',
		Delete:'del'
};

//==it manage the start sequence
//== the backend data
rs.BEData = {
	GeneralParam: 'gp',
	Hier		: 'h',
	Note		: 'n',
	Alert		: 'a'
};

rs.ModuleMng = {
		
	basicDataLoadSuccCB: function(beData) {
		//Now 
		switch( beData) {
			case rs.BEData.GeneralParam: 
				this._generalParamLoadOk = true; 
				break;
			case rs.BEData.Hier:	     
				this._hierLoadOk = true;
				break;
			default:
				rs.assert(false);
		}
				
		//After both is ready, then inform the view 
		if ( this._generalParamLoadOk && this._hierLoadOk) {
			//start load the note and alert data, and can immediate tell the view to start load spend data  
			rs.model.Alert.loadData(this.alertDataLoadSuccCB, null, this, null);
			rs.model.Note.loadData();

			this._mainView.OnBackendBasicDataLoadSucc();
		}
	},
	
	basicDataLoadFailCB: function(error) {
		this._mainView.onBackendBasicDataLoadFail(error);
	},
	
	alertDataLoadSuccCB:function(){
		var obj = $('#rs_alert');
		var unreadCount = rs.model.Alert.getUnreadAlertCount();
		rs.util.Util.showBadge(obj, unreadCount); 
	},
	
	loginSucceed:function(){
		this.loadResource();
	},
	
	loginFailed:function(error){
		rs.util.Util.showErrorMessage(null, error, null, null);
		rs.view.Legend.init();
		rs.view.Note.init();
		rs.cfg.Cfg.addChangeListener(this.onConfigChanged,this);	
	},

	loadResource:function(){
		
		//First show the legend so user can see some information when waiting load data from backend
		
		rs.view.Legend.init();

		rs.model.ODataHelper.init();
		
		rs.model.GeneralParam.init( this.basicDataLoadSuccCB, this.basicDataLoadFailCB, this, rs.BEData.GeneralParam);
		
		rs.model.HierMng.init(this.basicDataLoadSuccCB, this.basicDataLoadFailCB, this, rs.BEData.Hier);
		
		//As the modleMng will not load data, so no need call back
		rs.model.ModelMng.init();
		
		rs.view.Note.init();
		
		rs.cfg.Cfg.addChangeListener(this.onConfigChanged,this);		
	},

	init: function() {

		this.initControlClass();
		
		rs.model.TextMng.init();

		rs.cfg.Cfg.init();
		
		if(rs.cfg.Cfg.isDemoMode())
		{
			rs.demoData.Transform.loadDemoData();
		}
		
		this._mainView = sap.ui.view({
					id : 'main-view',
					viewName : "rs.view.Main",
					type : sap.ui.core.mvc.ViewType.JS
				});		
		this._mainView.createShell();
				
		if((rs.cfg.Cfg.isDemoMode()) || (window.location.host == "ldciuxd.wdf.sap.corp:44329"))
		{
			this.loadResource();
		}
		else
		{
			rs.model.ODataHelper.login(this.loginSucceed, this.loginFailed, this);
		}
	},
	
	/**
	 * Only interested in the connection mode change event
	 */
	onConfigChanged : function(aEvent) {
		if (rs.cfg.ChangeEvent.isContainEvent(rs.cfg.ChangeEvent.ConnectionSetting, aEvent)) {
			
			this._generalParamLoadOk = false;
			this._hierLoadOk = false;
			
			//Only need do necessary init work
			rs.model.ODataHelper.init();
			rs.model.GeneralParam.init( this.basicDataLoadSuccCB, this.basicDataLoadFailCB, this, rs.BEData.GeneralParam);
			rs.model.HierMng.init(this.basicDataLoadSuccCB, this.basicDataLoadFailCB, this, rs.BEData.Hier);
			
			//the ModelMng only need re-init the data 
			rs.model.ModelMng._initData();
		}
	},

	/**
	 * This just used for debug, so it just do the init function but will not call the view part init
	 */
	initWithoutView: function() {
		rs.cfg.Cfg.init();
		rs.model.ODataHelper.init();
		rs.model.TextMng.init();
		rs.model.GeneralParam.init();
		rs.model.HierMng.init();

		//As the modleMng will not load data, so no need call back
		rs.model.ModelMng.init();
	},
	
	initControlClass:function(){
		if(rs.cfg.Cfg.desktop())
		{
			rs.cfg.Control.Button = sap.ui.commons.Button;
			rs.cfg.Control.Text = sap.ui.commons.TextView;
			rs.cfg.Control.SegmentedButton = sap.ui.commons.SegmentedButton;
			rs.cfg.Control.TreeTable = sap.ui.table.TreeTable;
		}
		else
		{
			rs.cfg.Control.Button = sap.m.Button;
			rs.cfg.Control.Text = sap.m.Text;			
			rs.cfg.Control.SegmentedButton = sap.m.SegmentedButton;
			rs.cfg.Control.TreeTable = rs.uilib.TreeTable;
		}
	},
	
	getActivePage:function()
	{
		var topPage = this._mainView.getActiveTopView();
		return topPage;
	},
	
	_mainView: null,
	_generalParamLoadOk: false,
	_hierLoadOk: 		false,
};


