/**
 * 
 */
rs.model.Alert = {
	/**
	 * The Alert status
	 */
	Status : {
		UnRead:  '01',
		Read  : '02'
	},	
		
	getLoadingModelInfo : function() {
		return this._oLoadingModelInfo;
	},
	
	getMarkingModelInfo: function(){
		return this._oMarkingModelInfo;
	},

	/**
	 * Load the alert from back-end. 
	 * @param {} (optional) fnSucc
	 * @param {} (optional) fnFail
	 * @param {} (optional) context
	 * @param {} (optional) cbData
	 */
	loadData : function(fnSucc, fnFail, context, cbData) {
		
		if (this._oLoadingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}
		
		this._oLoadingModelInfo.startLoading(fnSucc, fnFail, context, cbData);

		rs.model.ODataHelper.read("Alerts", null, this._odataLoadSuccCB,
				this._odataLoadErrCB, this);
	},

	/**
	 * get all alert data. return in array 
	 */	
	getAllAlerts: function(){
		return this._alertData;
	},
	
	/*
	 * get the count of unread alert
	 */
	getUnreadAlertCount: function(){
		var nCount = 0;
		for (var i=0; i< this._alertData.length; i++)
		{
			if(this.Status.UnRead == this._alertData[i].Status)
			{
				nCount++;
			}
		}
		
		return nCount;
	},
	
	/**
	 * get hierarchy related alert data 
	 * @param {rs.model.HierGroup} hierGroup   : this will tell how this alert is related with which spend data
	 */	
	getAlertByHierarchy: function(hierGroup){
		//var alerts = [];
		var nLen = 0;
		
		for(var p in hierGroup)
		{
			if(undefined == hierGroup[p])
			{
				hierGroup[p] = "";
			}

		}
		
		for (var i=0; i< this._alertData.length; i++)
		{
			if( (hierGroup.depId == this._alertData[i].CCHierarchyNodeID) && 
					(hierGroup.expId == this._alertData[i].CEHierarchyNodeID) &&
					(hierGroup.prjId == this._alertData[i].IOHierarchyNodeID ))
			{
				//alerts[nLen++] = this._alertData[i];
				nLen++;
			}
		}
		
		//return alerts;
		return nLen;
	},

	
	
	/**
	 * Mark all the alerts as read 
	 * @param {} (optional) fnSucc
	 * @param {} (optional) fnFail
	 * @param {} (optional) context
	 * @param {} (optional) cbData
	 */
	markAllAsRead : function(fnSucc, fnFail, context, cbData) {
		
		
		if (this._oMarkingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}		
		
		var sUrl = "UpdateAlertsStatus?AlertsID=\'*\'&Status=\'" + this.Status.Read +  "\'";
		
		this._oMarkingModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		
		this._curreteAlert = "*";
		
		rs.model.ODataHelper.create(sUrl, null, null, this._odataUpdateSuccCB,
				this._odataUpdateErrCB, this);	
	},

	/**
	 * Makr the alert identify by the alertId as read
	 * @param {} alertId
	 * @param {} (optional) fnSucc
	 * @param {} (optional) fnFail
	 * @param {} (optional) context
	 * @param {} (optional) cbData 
	 */
	markAsRead : function(alertId, fnSucc, fnFail, context, cbData) {
		
		if (this._oMarkingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}			
		
		var sUrl = "UpdateAlertsStatus?AlertsID=\'" + alertId + "\'&Status=\'" + this.Status.Read +"\'";
		
		this._oMarkingModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		
		this._curreteAlert = alertId;
		
		rs.model.ODataHelper.create(sUrl, null, null, this._odataUpdateSuccCB,
				this._odataUpdateErrCB, this);		
	},

	/**
	 * call back for load odata successfully
	 * @param data
	 * @param response
	 */
	_odataLoadSuccCB : function(data, response) {
		
		//empty the array
		this._alertData.splice(0, this._alertData.length);  		
		
		for ( var i = 0; i < data.results.length; i++) 
		{
			
			var node = data.results[i];
			
			this._alertData[i] = node;
			
			this._alertData[i].Amount = parseFloat(this._alertData[i].Amount); 
			this._alertData[i].RuleAmount = parseFloat(this._alertData[i].RuleAmount);
			this._alertData[i].Percentage = parseFloat(this._alertData[i].Percentage);
			this._alertData[i].RulePercentage = parseFloat(this._alertData[i].RulePercentage);
			
			this._alertData[i].CCHierarchyName = rs.model.HierMng.getNameById(node.CCHierarchyNodeID);
			this._alertData[i].CEHierarchyName = rs.model.HierMng.getNameById(node.CEHierarchyNodeID);
			this._alertData[i].IOHierarchyName = rs.model.HierMng.getNameById(node.IOHierarchyNodeID );
		
			
			//convert "/Date1380000000/" and "2012-09-24T08:00:00" to date object
			if(node.CreationDate)
			{
				this._alertData[i].CreationDate = rs.util.Util.getDateObjectByString(node.CreationDate);
			}
			
			//convert "/Date1380000000/" and "2012-09-24T08:00:00" to date object
			if(node.PostingDate)
			{
				this._alertData[i].PostingDate = rs.util.Util.getDateObjectByString(node.PostingDate);
			}
			
		}
		
		this._alertJsonModel.setData(this._alertData);
		this._alertJsonModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
		
		this._oLoadingModelInfo.setModel(this._alertJsonModel);
		this._oLoadingModelInfo.setRowInfo('/');
		
		//notify the listener
		this._oLoadingModelInfo.onSucc();
	},

	/**
	 * call back for load odata failed
	 * @param error
	 */
	_odataLoadErrCB : function(error) {
		this._oLoadingModelInfo.onFail(error);
	},		
	
	
	/**
	 * call back for update alert status successful
	 * @param data
	 * @param response
	 */
	_odataUpdateSuccCB:function(data, response) {
		
		//update local alerts status after successful back-end update operation
		if("*" == this._curreteAlert) // "*" means update all alerts.
		{
			for(var i =0; i< this._alertData.length; i++)
			{
				this._alertData[i].Status =  this.Status.Read;
			}
		}
		else
		{
			for(var i =0; i< this._alertData.length; i++)
			{
				if(this._curreteAlert == this._alertData[i].AlertID)
				{
					this._alertData[i].Status =  this.Status.Read;
					break;
				}
				
			}
		}
		
		this._curreteAlert = "";
		
		this._alertJsonModel.setData(this._alertData);
		
		this._oMarkingModelInfo.setModel(this._alertJsonModel);
		this._oMarkingModelInfo.setRowInfo('/');		
		
		this._oMarkingModelInfo.onSucc();
	},
	
	/**
	 * call back for update alert status failed
	 * @param error
	 */	
	_odataUpdateErrCB: function(error) {
		this._curreteAlert = "";
		this._oMarkingModelInfo.onFail(error);
	},	
		
	
	//==private data
	
	/* model info for loading data */
	_oLoadingModelInfo : new rs.model.ModelInfo(),
	
	/* model info for marking as read */
	_oMarkingModelInfo : new rs.model.ModelInfo(),
	
	/* data array for all alert data*/
	_alertData: [],
	
	/* json model for all alert data */
	_alertJsonModel: new sap.ui.model.json.JSONModel(),
	
	//== current alert id
	_curreteAlert: "",
	
};