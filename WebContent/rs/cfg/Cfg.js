rs.cfg.EventListener = function (cbFn, context, cbData) {
	this.cbFn = cbFn;
	this.context = context;
	this.cbData  = cbData;
};


rs.cfg.Cfg = {

		onCfgChanged: function( aChangedEvent) {

	         $.each(rs.cfg.Cfg._aListener, function(idx,listen) {
					listen.cbFn.call( listen.context, aChangedEvent, listen.cbData);
				});                  
			},
		/**
		 	the other module will write call back like this
		 	 view = {
		 	 	onTimePeriodChanged: function ( aEvent) {
		 	 		if (rs.cfg.ChangeEvent.isContainEvent(rs.cfg.ChangeEvent.TimePeriod, aEvent)  {
		 	 			//??
		 	 			
		 	 		}
		 	 		if (rs.cfg.ChangeEvent.isContainEvent(GoodThreshold, aEvent) {
		 	 			//??
		 	 			
		 	 		}
		 	 		
		 	 	}
		 	 } 
		 */
		
		/**
		 *  call back function like:
		 *   
		 */
		addChangeListener: function(cbFn, context, cbData) {
			this._aListener.push( new rs.cfg.EventListener(cbFn, context, cbData));
		},
		
		/**
		 * Get the current used fiscal year according to the general parameter and current configuration
		 * @returns
		 */
		getUsedFiscalYear : function() {
			var year = rs.model.GeneralParam.getFiscalYear();
			
			//If time period choose other, then may be this year or last year
			if ( rs.cfg.Cfg.getTimePeriod() == rs.cfg.TimePeriod.OTH ) {
				var otherType = rs.cfg.Cfg.getOtherTimePeriodType();
				var otherValue = rs.cfg.Cfg.getOtherTimePeriodValue();
				
				if ( otherType == rs.cfg.OtherTimePeriod.Year) {
					if ( otherValue ==  rs.cfg.Year.LastYear) {
						//The year like '2012' so last year is "2011"
						year = "" + ( parseInt(year) -1 );
					}
				}
			}
			
			return year; 
		},
		
		/**
		 * Get the good threshold, like 0.95
		 */
		getGoodThreshold: function() {		
			  return rs.cfg.CfgValue.GoodThreshold/100;				 
		},
		
		/**
		 * Get the bad threshold, like 1.05
		 */
		getBadThreshold: function() {
			  return rs.cfg.CfgValue.BadThreshold/100;
		},
		
		/**
		 * Return a array with three css style color, such as ['green', 'yellow', 'red']
		 */
		getColorScheme: function() {
		
			if(rs.cfg.CfgValue.ColorScheme=="gyr")
				rs.cfg.ColorArray=new Array("rgb(93,165,48)","rgb(255,194,0)","rgb(204,65,39)");
			else
				rs.cfg.ColorArray=new Array("rgb(160,209,242)","rgb(255,194,0)","rgb(196,195,194)");
			return rs.cfg.ColorArray;
			//return new Array("green","yellow","red"); //for test
		},
		
		getNumPrecision:function() {
			return rs.cfg.CfgValue.NumPrecision;

		},
		getTimePeriod:function(){
			return rs.cfg.CfgValue.TimePeriod;

		},
		
		/**
		 * Only valid when the return type of getTimePeriod() is rs.cfg.TimePeriod.OTH
		 *  @return {rs.cfg.OtherTimePeriod} 
		 */		
		getOtherTimePeriodType : function() {					
			if(this.getTimePeriod()==rs.cfg.TimePeriod.OTH)
				return rs.cfg.CfgValue.OtherTimePeriod;
			else 
				Rs.assert(this.getTimePeriod()==rs.cfg.TimePeriod.OTH);
		},
		
		/**
		 * Only valid when the return type of getTimePeriod() is rs.cfg.TimePeriod.OTH
		 *  @return Depend the return type of  getOtherTimePeriodType() it may return following three types of value
		 *     rs.cfg.Year,  rs.cfg.Quarter  rs.cfg.Month		
		 */		
		getOtherTimePeriodValue : function() {
			if(this.getTimePeriod()==rs.cfg.TimePeriod.OTH)
                  return rs.cfg.CfgValue.DetailTime;	
			else
				Rs.assert(this.getTimePeriod()==rs.cfg.TimePeriod.OTH);
		},
		
		
		getCurrency:function(){
			var currency;
			switch(rs.cfg.CfgValue.CurrencyMode){
				case rs.cfg.Currency.Dolar :
					currency  = '$';
					break;
				
				case rs.cfg.Currency.Euro :
					currency  = '€';
					break;
				
				case rs.cfg.Currency.Pound :
					currency  = '£';
					break;
				
				default:
					currency  = '$';
					break;	
			
			}
			return currency;

		},
		getDetailTime:function(){
			return rs.cfg.CfgValue.DetailTime;
		},

		isDemoMode: function() {
			return (rs.cfg.ConnectionSetting.Demo == rs.cfg.CfgValue.ConnectionSetting);
		},
		
		isSimulateErrorMode : function(){
			return this._bErrorMode;
		},
		
		/**
		 * https://ldcigm2.wdf.sap.corp:44318/sap/opu/odata/sap/LWM_RS_REALSPEND;v=2/
		 */
		getBaseUrl:  function() {
			if ( this.isDemoMode())
			{
				return "./rs/DemoData/";
			}
			else
			{
				if (window.location.host == "ldciuxd.wdf.sap.corp:44329")
				{
					return this._serverUrl;					
				}  
				else
				{
					return this._baseUrl;	
				}
			}
		},


		getUserName: function() {
			return this._userName;
		},
		
		getPassword: function() {
			return this._passWord;
		},

		/**
		 * Read from the local storage, 
		 */
		init: function() {
			//has local storage, then overwrite	
			rs.cfg.oSetCfg = new Object();
			rs.cfg.CfgValue.load();
		},
		
		getTarget:function()
		{
			return this._target;
		},
	
		mobile:function()
		{
			if(rs.cfg.Target.Mobile == this._target)
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		
		desktop: function()
		{
			if(rs.cfg.Target.Desktop == this._target)
			{
				return true;
			}
			else
			{
				return false;
			}		
		},
			
		
		//==internal function used for event register and notify
		_notifyListener: function(aEvent) {
			$.each(_aListener, function(idx,listen) {
				listen.cbFn.call( listen.context, aEvent, listen.cbData);
			});
		},
		
		//==used for event register and notify
		_aListener: [],
			
		_bErrorMode: false,
		//_baseUrl : "https://ldcigm2.wdf.sap.corp:44318/sap/opu/odata/sap/LWM_RS_REALSPEND;v=2/" ,
		//Now IE have problem to access https, so just use http
		
		//gm3
		//used for BSP server
		_serverUrl : window.location.protocol + '//' + window.location.host + '/sap/opu/odata/sap/LWM_RS_REALSPEND;v=2/',
		
		//used for local development
		//GM3:
		_baseUrl : 	"http://ldcigm3.wdf.sap.corp:50057/sap/opu/odata/sap/LWM_RS_REALSPEND;v=2/",
		_userName:	'reals',
		_passWord:	'saptest',

		//GM2:
		/* 
		_baseUrl: "http://ldcigm2.wdf.sap.corp:50018/sap/opu/odata/sap/LWM_RS_REALSPEND;v=2/",	
		_userName:	'liwen1',
		_passWord:	'imsmobile'
		*/
		
		_target:  rs.cfg.Target.Desktop,
};
