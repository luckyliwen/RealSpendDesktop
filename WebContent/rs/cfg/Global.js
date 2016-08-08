//===here define all the constant enum

/**
 *define the numeric mode 
 */
rs.cfg.NumPrecision = {
		Full     : 'f',
		Thousand : 't',
		Million  : 'm'
};

/**
 * define the time period mode
 */
rs.cfg.TimePeriod = {
		M2D : 'm2d',
		Q2D : 'q2d',
		Y2D : 'y2d',
		OTH : 'oth'
};

/**
 * define the sap ui5 theme
 */
rs.cfg.Theme = {
		HCB : 'sap_hcb',
		GOL : 'sap_goldreflection',
		UX  : 'sap_ux',
		PLA : 'sap_platinum'
};
/**
 * Only valid when it is 
 * @type 
 */
rs.cfg.OtherTimePeriod = {
		Year    : 'y',
		Quarter : 'q',
		Period  : 'p'
};

/**
 * define the color scheme
 */
rs.cfg.ColorScheme = {
		GYR : 'gyr',
		BYG : 'byg'
};
	
/**
 * define the currency mode
 */
rs.cfg.Currency = {
		Dolar : 'dolar',
		Euro  : 'euro',
		Pound : 'pound'
};

/**
 * define the connection mode
 */
rs.cfg.ConnectionSetting = {
		Demo : 'demo',
		Net  : 'net'
};
/**
 * define the default slider value
 */
rs.cfg.SliderValue = {
		goodThreshold : '95',
		badThreshold  : '105'
};

/**
 * Now only support this year and last year
 * @type 
 */
rs.cfg.Year = {
		ThisYear : 't',
		LastYear : 'l'
};

/**
 * Here the value can be used as the StartPeriod/EndPeriod directly, so don't change the value!!!
 * @type 
 */
rs.cfg.Quarter = {
		Q1 : '001',
		Q2 : '004',
		Q3 : '007',
		Q4 : '010'
};
  
/**
 * Here the value can be used as the StartPeriod/EndPeriod directly, so don't change the value!!!
 * @type 
 */
rs.cfg.Month = {
		Jan : '001',
		Feb : '002',
		Mar : '003',
		Apr : '004',
		May : '005',
		Jun : '006',
		Jul : '007',
		Aug : '008',
		Sep : '009',
		Oct : '010',
		Nov : '011',
		Dec : '012',
	
	//==The old define is inconvenient, change to two way so it can use loop to do iterate
		m1  : '001',
		m2  : '002',
		m3  : '003',
		m4  : '004',
		m5  : '005',
		m6  : '006',
		m7  : '007',
		m8  : '008',
		m9  : '009',
		m10 : '010',
		m11 : '011',
		m12 : '012'
};

rs.cfg.Target = {
	Mobile: 'Mobile',
	Desktop: 'Desktop'
};

rs.cfg.Control = {
	Button: null,
	Text: null,
	SegmentedButton: null,
	TreeTable: null,
};

rs.cfg.CfgValue = {
		/**
		 * this will load the config data from local storage
		 */
		load: function() {
			var localData=JSON.parse(
					window.localStorage.getItem("rssettings")
			);
			if(window.localStorage.getItem("rssettings")==null)
			{
				this.TimePeriod        = rs.cfg.TimePeriod.Y2D;
				this.NumPrecision      = rs.cfg.NumPrecision.Full;
				this.ColorScheme       = rs.cfg.ColorScheme.GYR;
				this.CurrencyMode      = rs.cfg.Currency.Dolar;
				this.GoodThreshold     = rs.cfg.SliderValue.goodThreshold;
				this.BadThreshold      = rs.cfg.SliderValue.badThreshold;
				this.DetailTime        = rs.cfg.Year.ThisYear;
				this.OtherTimePeriod   = rs.cfg.OtherTimePeriod.Year;
				this.ConnectionSetting = rs.cfg.ConnectionSetting.Net;
				this.Theme             = rs.cfg.Theme.GOL;
			}
			else
			{
				var that=this;
				$.each(localData,function(key){
					that[key] = localData[key];
				});
			}
			//sap.ui.getCore().applyTheme(this.Theme);
		},	
		
		/**
		 * this will save the config data to local storage
		 */
		save: function() {		
			var localData = {
					"TimePeriod"       : this.TimePeriod,
					"NumPrecision"     : this.NumPrecision,
					"ColorScheme"      : this.ColorScheme,
					"CurrencyMode"     : this.CurrencyMode,
					"GoodThreshold"    : this.GoodThreshold,
					"BadThreshold"     : this.BadThreshold,
					"DetailTime"       : this.DetailTime,
					"OtherTimePeriod"  : this.OtherTimePeriod,
					"ConnectionSetting": this.ConnectionSetting,
					"Theme"            : this.Theme
			};
			window.localStorage.setItem("rssettings",
					JSON.stringify(localData)
			);
		},
		
		/**
		 * this will clone the config data
		 * @returns rs.cfg.CfgValue
		 */
		clone: function() {		
			return jQuery.extend(true, {}, this);
		},
	
		compare: function(other) {
			var _changeEvent = [];
			$.each(other,function(key){
				if(other[key]!=rs.cfg.CfgValue[key] && 
						rs.cfg.CfgValue[key]!=null)
				{
					if(key=="DetailTime" || key=="OtherTimePeriod" 
						|| key=="TimePeriod")
						_changeEvent.push(rs.cfg.ChangeEvent["TimePeriod"]);
					else
					_changeEvent.push(rs.cfg.ChangeEvent[key]);				
				}			
			});
			return _changeEvent;
		}	
};

rs.cfg.ChangeEvent = {
		TimePeriod        : 'tp',
		NumPrecision      : 'np',
		GoodThreshold     : 'gt',
		BadThreshold      : 'bt',
		ColorScheme       : 'cs',
		CurrencyMode      : 'cm',    
		ConnectionSetting : 'co',
	/**
	 * util used to check whether the event is contained in the event array
	 *  the registered function will normally like
	 *   if  ( rs.cfg.ChangeEvent.isContainEvent( rs.cfg.ChangeEvent.TimePeriod,
	 *     aEvent) {
	 *   	xxxx
	 *   }
	 */
		isContainEvent: function( event, aEvent) {		
				for (var i = 0; i<aEvent.length; i++) {
					if ( aEvent[i] == event)
						return true;
				}
				return false;		
		},
	
	/**
	 * Used to check that it contain one event at least. Typical usage
	 * 
	 *  if  ( rs.cfg.ChangeEvent.isContainsOneEventAtLeast( [rs.cfg.ChangeEvent.GoodThreshold,  rs.cfg.ChangeEvent.BadThreshold],  aEvent) {
	 *   	xxxx
	 *   }
     * 
	 * @param checkEvents
	 * @param aEvent
	 */
		isContainsOneEventAtLeast : function(checkEvents, aEvent) {
			for (var i = 0; i<checkEvents.length; i++) {
				if ( this.isContainEvent( checkEvents[i], aEvent))
					return true;
			}
			return false;
		}
};




