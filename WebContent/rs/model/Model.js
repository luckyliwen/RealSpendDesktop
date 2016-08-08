//use to manually simulate the network long time delay in order for easy test.
//a delay array unit is ms, so if you want to control the first data retrieve take longer time then the next one, then can set it like [1000 100] 
rs.gaDelay = [];  
rs.gDelayIdx=0;


/**
 * The general model loading information,
 */
rs.model.ModelInfo = function() {
	this.loadStatus = rs.LoadStatus.NotStart;
	this.model = null;
	this.rowInfo = null;
	this.error = null;
};

rs.model.ModelInfo.prototype = {
	// ==public function used by other module
	getLoadStatus : function() {
		return this.loadStatus;
	},

	getSAPModel : function() {
		return this.model;
	},

	getRowInfo : function() {
		return this.rowInfo;
	},
	getError : function() {
		return this.error;
	},

	// ====function used by model module internal
	startLoading : function(fnSucc, fnFail, context, cbData) {
		this.loadStatus = rs.LoadStatus.Pending;
		this._cbFnSucc = fnSucc;
		this._cbFnFail = fnFail;
		this._cbContext = context;
		this._cbData = cbData;
	},
	
	
	//==following function add only to debug and test the special delay condition, so later can remove 
	onDelayedSucc: function(ms) {
		console.log("!!Now delayed time " + ms + " over");
		if ( this.timeoutId != undefined ) {
			clearInterval(this.timeoutId);
			delete this.timeoutId;
		}
		
		this.loadStatus = rs.LoadStatus.Succ;
		if (this._cbFnSucc) {
			this._cbFnSucc.call(this._cbContext, this._cbData);
		}
	},
 	
	onSucc : function() {
		if ( rs.gaDelay.length !=0) {
			var that = this;
			console.log("!!Now start delay simulation for " + rs.gaDelay[ rs.gDelayIdx  % rs.gaDelay.length]);
			
			var ms = rs.gaDelay[ rs.gDelayIdx  % rs.gaDelay.length];
			this.timeoutId = setInterval( function() {
					that.onDelayedSucc( ms );
				},  rs.gaDelay[ rs.gDelayIdx  % rs.gaDelay.length]);
			
			rs.gDelayIdx++;
			return
		};
		
		this.loadStatus = rs.LoadStatus.Succ;
		if (this._cbFnSucc) {
			this._cbFnSucc.call(this._cbContext, this._cbData);
		}
	},

	/*the old onSucc : function() {
		this.loadStatus = rs.LoadStatus.Succ;
		if (this._cbFnSucc) {
			this._cbFnSucc.call(this._cbContext, this._cbData);
		}
	},*/
	
	onFail : function(error) {
		this.loadStatus = rs.LoadStatus.Fail;
		this.error = error;
		if (this._cbFnFail)
			this._cbFnFail.call(this._cbContext, error, this._cbData);
	},
	
	setModel : function(model) {
		this.model = model;
	},
	
	setRowInfo : function(row) {
		this.rowInfo = row;
	},
	
	/**
	 * just extend a method for the trend data, for simple, it just put it inside the same function
	 *  
	 * @param {rs.PeriodType} periodType
	 */
	getRowInfoByPeriodType: function(periodType) {
		return 	this.getRowInfo() + "/" + periodType;	
	},
	
	/**
	 * Return the data for the TrendData D3 usage.
	 * @param {rs.PeriodType} periodType
	 * @return {}
	 */
	getDataByPeriodType: function(periodType) {
		var data = this.getSAPModel().getData();
		
		var key = this.rowInfo.substr(1);
		return data[key][periodType];	
	}
};

/**
 * The help class for some entity (such as the note, alert) which need three
 * hier id
 * 
 * @param {}
 *            depId
 * @param {}
 *            expId
 * @param {}
 *            prjId
 */
rs.model.HierGroup = function(depId, expId, prjId) {
	this.depId = depId;
	this.expId = expId;
	this.prjId = prjId;
};
