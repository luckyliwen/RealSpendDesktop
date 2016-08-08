rs.ErrorSimulator = {
	ErrorParam : {
		// the operation supposed to issue errors
		ErrorDef : {
			'GeneralParameters' : false,
			'HierarchyNodes' : false,
			'SpendingData' : false,
			'TrendData' : false,
			'SummaryItems' : false,
			'LineItems' : true,
			'User' : false,
			// attach list
			'LineItems(' : false
		},

		// how often error happens
		g_responseIndex : 0,

		getErrorDef : function() {
			var errorDef = [];
			for ( var key in this.ErrorDef) {
				if (this.ErrorDef[key]) {
					errorDef.push(key);
				}
			}
			return errorDef;
		}
	},

	buildError : function(oReq, fnSucc, fnErr, context, cbData, _oHandler,
			client, _oMetadata) {
		this.ErrorParam.g_responseIndex++;
		var errorDef = this.ErrorParam.getErrorDef();
		var url = oReq.requestUri;
		var opType = url.substring(url.lastIndexOf('/'));

		var isError = false;
		for ( var i = 0; i < errorDef.length; i++) {
			if (opType.indexOf(errorDef[i]) > 0
					&& this.ErrorParam.g_responseIndex % 2 == 1) {
				isError = true;
				break;
			}
		}

		if (isError) {
			var error = {
				message : 'resource not found'
			};
			fnErr.call(context, error, cbData);
			return;
		}

		if (rs.cfg.Cfg.isDemoMode()) {
			rs.DemoData.Transform.buildResultsForDemo(oReq, fnSucc, fnErr,
					context, cbData, _oHandler, client,_oMetadata);
		} else {
			OData.read(oReq, function(data, response) {
				fnSucc.call(context, data, response, cbData);
			}, function(error) {
				if (fnErr) {
					fnErr.call(context, error, cbData);
				}
			}, _oHandler, client, _oMetadata);
		}
	}
};