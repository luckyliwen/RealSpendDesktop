rs.model.GeneralParam = {
		
	/**
	 * 
	 * @returns
	 */
	getFiscalYear : function() {
		this.assertState();
		return this._data.FiscalYear;

	},

	getPlanVersion : function() {
		this.assertState();
		return this._data.PlanVersion;
	},

	/**
	 * Return the start month of the fiscal year, now it look like '201201'
	 * @returns
	 */
	getStartMonth: function() {
		this.assertState();
		return this._data.StartMonthOfFiscalYear;
	},
	
	/**
	 * Return the period for the fiscal year
	 * @return {}
	 */
	getPeriod : function() {
		return this._data.Period;
	},


	getUsername: function() {
		this.assertState();
		return this._data.UserID;
	},
	
	/**
	 * Return the currency key for the currency mode
	 * @returns {}
	 */
	getCurrencyKey :function(){
		this.assertState();
		return this._data.CurrencyKey;
	},
	/**
	 * Whether the project information available,
	 * @return  true | false
	 */
	isPrjAvailable: function() {
		this.assertState();
		return this._data.InternalOrderGroup != "";
	}, 
	
	/**
	 * Begin load the General params
	 * @param fnSucc  the call back function for success
	 * @param fnFail  the call back function for failure
	 * @param context the context which will be used for the call back
	 * @param cbData (optional)  the extra data used to contain additional information
	 * */
	init : function(fnSucc, fnFail, context, cbData) {
		this._oLoadModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		rs.model.ODataHelper.read("GeneralParameters", null, this._odataSuccCB,
				this._odataErrCB, this);
	},
	

	//??just for debug, to ensure only after the data is ready then call the getXX
	assertState: function() {
		rs.assert( this._oLoadModelInfo.loadStatus == rs.LoadStatus.Succ,  "Only after the GeneralParam data finish load, call the getXX is valid");
	},

	
	/**
	 * call back for load odata successful
	 * @param data
	 * @param response
	 */
	_odataSuccCB : function(data, response) {
		//console.log(this, data, response);
		//Now just copy all the data from backend 
		this._data = data.results[0];

		this._oLoadModelInfo.onSucc();
		/*
		ControllingArea: "US01"
		CostCenterGroup: "CCGH5000"
		CostElementGroup: "CEGSPEND"
		CurrencyKey: "USD"
		CurrencyName: "US Dollar"
		FiscalYear: "2012"
		InternalOrderGroup: ""
		Period: "009"
		PlanVersion: "000"
		PlanVersions: Object
		StartMonthOfFiscalYear: "201201"
		TimeZone: "CET"
		UserID: "LIWEN1"
		UserName: "Lucky Li"*/
	},

	/**
	 * call back for load odata failed
	 * @param error
	 */
	_odataErrCB : function(error) {
		this._oLoadModelInfo.onFail(error);
	},

	//==internal data structure, to avoid one level too many varialbe, put all the data under the _data
	_data : {
		fiscalYear : 0,
		planVersion : '',
		startMonth : 0,
	},

	//the model information used to manage the load status
	_oLoadModelInfo : new rs.model.ModelInfo()
};