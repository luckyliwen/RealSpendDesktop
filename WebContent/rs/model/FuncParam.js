//== the help function to create param for the SpendingDataByHierarhyNodesAndPeriod
rs.model.FuncParam = {};

//===now just use simple class to create, later can use more complex 
rs.model.FuncParam.Base = function() {
	//the base class which defined the common operation 

	//all the key and value will put here, 
	this._mParams = {};
};

rs.model.FuncParam.Base.prototype = {
	//the empty function sub class will overwrite
	init : function() {
	},

	getParams : function() {
		this.init();
		return rs.model.ODataHelper.createArrayFromMap(this._mParams);
	},
	
	getParam: function(key) {
		return this._mParams[key];
	},
	
	addParam : function(key, value) {
		this._mParams[key] = value;
	},

	addFiscalYear : function() {
		var year = rs.cfg.Cfg.getUsedFiscalYear();
		this.addParam('FiscalYear', year);
	},

	addHierNodeId : function(id) {
		this.addParam('HierarchyNodeID', id);
	},

	addByHierNodeId : function(id) {
		this.addParam('ByHierarchyNodeID', id);
	},

	addPlanVersion : function() {
		this.addParam('PlanVersion', rs.model.GeneralParam.getPlanVersion());
	},
	
	
	_getStartPeriodForOtherType: function() {
		var ret = "";
		var otherType = rs.cfg.Cfg.getOtherTimePeriodType();
		var otherValue = rs.cfg.Cfg.getOtherTimePeriodValue(); 
		switch (otherType) {
			case rs.cfg.OtherTimePeriod.Year:
				ret = '001';  //for the startPeriod, always from '001'
				break;
			case rs.cfg.OtherTimePeriod.Quarter:
				ret = otherValue;  //As the value is the start month of each quarter, so can directly use it
				break;
			case rs.cfg.OtherTimePeriod.Period:
				ret = otherValue;
				break;
		}
		return ret;
	},
	
	
	_getEndPeriodForOtherType: function() {
		var ret = "";
		//var lastMonth="";
		var otherType = rs.cfg.Cfg.getOtherTimePeriodType();
		var otherValue = rs.cfg.Cfg.getOtherTimePeriodValue(); 
		switch (otherType) {
			case rs.cfg.OtherTimePeriod.Year:
				if ( otherValue == rs.cfg.Year.ThisYear) {
					ret = rs.model.GeneralParam.getPeriod();  
				} else if ( otherValue == rs.cfg.Year.LastYear) {
					ret = '012'; //always the last month
				}
				break;
			case rs.cfg.OtherTimePeriod.Quarter:
				var currentQuarter = rs.util.Util.getCurrentQuarter(); 
				
				//If is current quarter, then is the current Period
				if ( currentQuarter == otherValue) {
					ret = rs.model.GeneralParam.getPeriod();
				} else {
					//otherwise is the last month of that quarter
					ret = rs.util.Util.getLastMonthForQuarter(otherValue); 
				}
				break;
			case rs.cfg.OtherTimePeriod.Period:
				ret = otherValue;
				break;
		}
		return ret;
	},
	
	
	//??here need check with zhiqiang about whether is the natural period or fiscal period, just use 001~010 to same as iPad Year-to-date
	addStartPeriod : function() {
		var ret = "";
		var timePeriod = rs.cfg.Cfg.getTimePeriod();
		switch( timePeriod) {
			case rs.cfg.TimePeriod.M2D :
				ret = rs.model.GeneralParam.getPeriod();  
				break;
			case rs.cfg.TimePeriod.Q2D : 
				ret = rs.util.Util.getCurrentQuarter();  
				break;
			case rs.cfg.TimePeriod.Y2D : 
				ret = '001';
				break;
			case rs.cfg.TimePeriod.OTH :
				ret = this._getStartPeriodForOtherType();
				break;				
		}
		
		this.addParam('StartPeriod', ret);
	},
	
	addEndPeriod : function() {
		var ret = "";
		var timePeriod = rs.cfg.Cfg.getTimePeriod();
		switch( timePeriod) {
			case rs.cfg.TimePeriod.M2D :  //fall down as same logic
			case rs.cfg.TimePeriod.Q2D :  //fall down as same logic
			case rs.cfg.TimePeriod.Y2D : //fall down as same logic
				ret = rs.model.GeneralParam.getPeriod();  
				break;
			case rs.cfg.TimePeriod.OTH :
				ret = this._getEndPeriodForOtherType();
				break;				
		}
		this.addParam('EndPeriod', ret);
	}
};


rs.model.FuncParam.SpendingDataByHierarhyNodesAndPeriod = function(hierId,
		byHierId,numberOfLevels) {
	this.hierId = hierId;
	this.byHierId = byHierId;
	this.numberOfLevels = numberOfLevels;
	rs.model.FuncParam.Base.call(this);

};
rs.model.FuncParam.SpendingDataByHierarhyNodesAndPeriod.prototype = new rs.model.FuncParam.Base();

rs.model.FuncParam.SpendingDataByHierarhyNodesAndPeriod.prototype.init = function() {
	/*HierarchyNodeID='CCGH5000'&ByHierarchyNodeID='CEGSPEND'&NumberOfLevels=10 & SkipTop=false&FiscalYear='2012'& StartPeriod='001'& EndPeriod='003'&
	IsAggregated=true&PlanVersion='000'
	 */
	this.addHierNodeId(this.hierId);
	this.addByHierNodeId(this.byHierId);
	this.addParam('NumberOfLevels', this.numberOfLevels);
	this.addParam('SkipTop', false);
	this.addFiscalYear();
	this.addParam('IsAggregated', true);
	this.addStartPeriod();
	this.addEndPeriod();
	this.addPlanVersion();

};

// Generic Summary items
rs.model.FuncParam.GenericSummaryItemsByHierarchyNodesAndPeriod = function(hierId,
		byHierId) {
	this.hierId = hierId;
	this.byHierId = byHierId;
	rs.model.FuncParam.Base.call(this);

};
rs.model.FuncParam.GenericSummaryItemsByHierarchyNodesAndPeriod.prototype = new rs.model.FuncParam.Base();

rs.model.FuncParam.GenericSummaryItemsByHierarchyNodesAndPeriod.prototype.init = function() {
	/*/SummaryLineItemsByHierarhyNodesAndPeriod?
	 * HierarchyNodeID='CCGH5000'&
	 * ByHierarchyNodeID='CEGSPEND'&
	 * FiscalYear='2012'&
	 * StartPeriod='001'&
	 * EndPeriod='003'
	 */
	this.addHierNodeId(this.hierId);
	this.addByHierNodeId(this.byHierId);
	this.addFiscalYear();
	this.addStartPeriod();
	this.addEndPeriod();
};

//Generic Line items
rs.model.FuncParam.GenericLineItemsByHierarchyNodesAndPeriod = function(hierId,
		byHierId,groupId,groupType,orderBy,skip,top) {
	this.hierId = hierId;
	this.byHierId = byHierId;
	this.groupId = groupId;
	this.groupType = groupType;
	this.orderBy = orderBy;
	this.skip = skip;
	this.top = top;
	rs.model.FuncParam.Base.call(this);
};

rs.model.FuncParam.GenericLineItemsByHierarchyNodesAndPeriod.prototype = new rs.model.FuncParam.Base();

rs.model.FuncParam.GenericLineItemsByHierarchyNodesAndPeriod.prototype.init = function() {
	/*/GenericLineItemsByHierNodesAndPeriod?
	 * HierarchyNodeID='CCGH5000'&
	 * ByHierarchyNodeID='CEGSPEND'&
	 * GroupID='0000510050'&
	 * GroupType='01'&
	 * FiscalYear='2012'&
	 * StartPeriod='001'&
	 * EndPeriod='003'
	 */
	this.addHierNodeId(this.hierId);
	this.addByHierNodeId(this.byHierId);
	this.addParam('GroupID',this.groupId);
	this.addParam('GroupType', this.groupType);
	this.addParam('OrderBy', this.orderBy);
	this.addParam('Skip', this.skip);
	this.addParam('Top', this.top);
	this.addFiscalYear();
	this.addStartPeriod();
	this.addEndPeriod();
};


//==Trend data
rs.model.FuncParam.TrendDataByHierarchyNodes = function(hierId, byHierId) {
	this.hierId = hierId;
	this.byHierId = byHierId;
	rs.model.FuncParam.Base.call(this);
};

rs.model.FuncParam.TrendDataByHierarchyNodes.prototype = new rs.model.FuncParam.Base();
rs.model.FuncParam.TrendDataByHierarchyNodes.prototype.init = function() {
	this.addHierNodeId(this.hierId);
	this.addByHierNodeId(this.byHierId);
};
