rs.demoData = {};
rs.demoData.Transform = {

	loadDemoData: function()
	{
		var that = this;
		$.getScript("rs/DemoData/demoData.js", function() {
    			that.bDataLoaded = true;
    			that.init();
    			if(that.readQueue.length)
    			{
    				for(var i=0; i<that.readQueue.length; i++)
    				{
    					var arg = that.readQueue[i];
    					that.read.apply(that, arg);
    				}
    			}
    			
    			that.readQueue = [];
		});
	},
	
	init:function()
	{
		this.readFunction = 
		[
			{"reg" : /^SpendingDataByHierarhyNodesAndPeriod$/i, 		"func": this.getSpendData},
			{"reg" : /^GenericSummaryItemsByHierNodesAndPeriod$/i, 		"func": this.getSummaryLineItems},
			{"reg" : /^GenericLineItemsByHierNodesAndPeriod$/i, 		"func": this.getLineItems},
			{"reg" : /^LineItems.*\/Attachments$/i, 					"func": this.getAttachmentList},
			{"reg" : /^Attachments.*\/Content/i, 						"func": this.getAttachment},
			{"reg" : /^Users\(.*\)/i, 									"func": this.getUserProfile},
		];
	
		this.directData =
		[
			{"reg" : /^GeneralParameters$/i, 	"data": rs.demoData.GeneralParameters},
			{"reg" : /^HierarchyNodes$/i, 		"data": rs.demoData.HierarchyNodes},
			{"reg" : /^Notes$/i, 				"data": rs.demoData.Notes},
			{"reg" : /^Alerts$/i, 				"data": rs.demoData.Alerts},
			{"reg" : /^TrendDataByHierarchyNodes$/i, 			"data": rs.demoData.TrendData},
		];
		
		this.createFunction = 
		[
			{"reg" : /^UpdateAlertsStatus/i, 	"func": this.updateResponse},
			{"reg" : /^UpdateNotesStatus/i, 	"func": this.updateResponse},
			{"reg" : /^Notes$/i, 				"func": this.createNote},
		];
	},
    
    _createResponseData:function(demoData, fnSucc, fnErr, context, cbData)
    {
        var response = {'statusCode' : 200, 'statusText': 'OK'};
        setTimeout(function() {
                fnSucc.call(context, demoData, response, cbData);       
            }, 100);                
    },
	
	read:function(sPath, aParams, fnSucc, fnErr, context, cbData)
	{
		if(!this.bDataLoaded)
		{
			this.readQueue.push(arguments);
			return;
		}
		
		var i =0;
		
		for(i=0; i<this.directData.length; i++)
		{
			if(sPath.match(this.directData[i].reg))
			{
				var data = {"results": this.directData[i].data};
				this._createResponseData(data, fnSucc, fnErr, context, cbData);
				return;
			}
		}
		
		for(i=0; i<this.readFunction.length; i++)
		{
			if(sPath.match(this.readFunction[i].reg))
			{
				this.readFunction[i].func.call(this,sPath, aParams, fnSucc, fnErr, context, cbData);
				return;
			}
		}
	},


    create : function(sPath, oData, oContext, fnSucc, fnErr, context, cbData) 
    {
		for(var i=0; i<this.createFunction.length; i++)
		{
			if(sPath.match(this.createFunction[i].reg))
			{
				this.createFunction[i].func.call(this,sPath, oData, oContext,fnSucc, fnErr, context, cbData);
				return;
			}
		}    	
    },

	updateResponse:function(sPath, oData, oContext, fnSucc, fnErr, context, cbData)
	{
		this._createResponseData(null, fnSucc, fnErr, context, cbData);
	},

    _decodeHierarchyId : function(params) 
    {

        var parameter = {};

        parameter.CCHierarchyNodeID = '';
        parameter.CEHierarchyNodeID = '';
        parameter.IOHierarchyNodeID = '';
        parameter.children = [];
        parameter.hierType = rs.HierType.Dep;
        parameter.field = "";
        
		var hierId, byHierId;
		for(var i=0; i<params.length; i++)
		{
			if(params[i].match(/^HierarchyNodeID='(.+?)'$/i))
			{
				hierId = params[i].match(/^HierarchyNodeID='(.+?)'$/i)[1];
			}
			
			if(params[i].match(/^ByHierarchyNodeID='(.+?)'$/i))
			{
				byHierId = params[i].match(/^ByHierarchyNodeID='(.+?)'$/i)[1];
			}
		}        
        // expense overview
        if (isNaN(hierId))
        {
            parameter.CCHierarchyNodeID = '';
            parameter.IOHierarchyNodeID = '';
            parameter.CEHierarchyNodeID = byHierId;
            parameter.hierType = rs.HierType.Exp;
            parameter.field = "CEHierarchyNodeID";
        }
        else 
        {
            switch (rs.model.HierMng.getTypeById(hierId)) 
            {
                case rs.HierType.Exp:
	                parameter.CEHierarchyNodeID = hierId;
	                break;
                case rs.HierType.Dep:
	                parameter.CCHierarchyNodeID = hierId;
	                break;
                case rs.HierType.Prj:
	                parameter.IOHierarchyNodeID = hierId;
	                break;
            }

            parameter.hierType = rs.model.HierMng.getTypeById(byHierId);
            switch (parameter.hierType) 
            {
                case rs.HierType.Exp:
	                parameter.CEHierarchyNodeID = byHierId;
	                parameter.field = "CEHierarchyNodeID";
	                break;
                case rs.HierType.Dep:
	                parameter.CCHierarchyNodeID = byHierId;
	                parameter.field = "CCHierarchyNodeID";
	                break;
                case rs.HierType.Prj:
	                parameter.IOHierarchyNodeID = byHierId;
	                parameter.field = "IOHierarchyNodeID";
	                break;
            }
        }
        parameter.children = rs.model.HierMng.getChildrenByHierId(byHierId);
        parameter.children.unshift(parameter[parameter.field]);
        return parameter;
    },

    getSpendData: function(sPath, aParams, fnSucc, fnErr, context, cbData) 
    {
        this.onGoing = true;
        var param = this._decodeHierarchyId(aParams);
        var results = [];

        for(var i=0; i<param.children.length; i++)
        {
            param[param.field] = param.children[i];
            for(var j=0; j<rs.demoData.SpendingData.length; j++)
            {
                var node = rs.demoData.SpendingData[j];
                if(( (param.CCHierarchyNodeID == "") || (param.CCHierarchyNodeID == node.CCHierarchyNodeID)) 
                    && ((param.CEHierarchyNodeID == "") || (param.CEHierarchyNodeID == node.CEHierarchyNodeID)) 
                    && ((param.IOHierarchyNodeID == "") || (param.IOHierarchyNodeID == node.IOHierarchyNodeID)))
                {
                    node.FiscalYear = rs.demoData.GeneralParameters[0].FiscalYear; 
                    results.push(node);
                }
            }           
        }

        var data = {"results": results};
        this._createResponseData(data, fnSucc, fnErr, context, cbData);
    },

    getSummaryLineItems : function(sPath, aParams, fnSucc, fnErr, context, cbData) 
    {
        var param = this._decodeHierarchyId(aParams);
        var results = [];

        for(var i=0; i<param.children.length; i++)
        {
            param[param.field] = param.children[i];
            for(var j=0; j<rs.demoData.SummaryLineItems.length; j++)
            {
                var node = rs.demoData.SummaryLineItems[j];
                if(( (param.CCHierarchyNodeID == "") || (param.CCHierarchyNodeID == node.CCHierarchyNodeID)) 
                    && ((param.CEHierarchyNodeID == "") || (param.CEHierarchyNodeID == node.CEHierarchyNodeID)) 
                    && ((param.IOHierarchyNodeID == "") || (param.IOHierarchyNodeID == node.IOHierarchyNodeID))
                    &&(node.StartPeriod == rs.demoData.GeneralParameters[0].StartMonthOfFiscalYear))
                {
                    node.GroupType = "Account";  //??need to modify demo data tool in the future
                    node.GroupTypeDesc = "Account";
                    node.LineItemNumber = 10;
                    results.push(node);
                }
            }           
        }
        var data = {"results": results};
        this._createResponseData(data, fnSucc, fnErr, context, cbData);
    },

    getLineItems : function(sPath, aParams,fnSucc, fnErr, context, cbData)
    {
        var lineItems = [];
        var groupID = "";

		for(var i=0; i<aParams.length; i++)
		{
			if(aParams[i].match(/^GroupID='(.+?)'$/i))
			{
				groupID = aParams[i].match(/^GroupID='(.+?)'$/i)[1];
			}
		}
					
    	var date = new Date();
    	var strDate = rs.util.Util.date2str(date, "yyyyMMdd");

        for(var i=0; i<rs.demoData.LineItems.length; i++)
        {
            var node = rs.demoData.LineItems[i];
            if(groupID == node.CostElement) 
            {
                node.AttachmentNumber = 1;
                node.DocumentNumber = node.SummaryID;
                node.DocumentDateString = strDate; 
                node.PostingDateString = strDate;
                node.CreationDateString = strDate; 
                lineItems.push(node);
            }
        }           
        var data = {"results": lineItems};
        this._createResponseData(data, fnSucc, fnErr, context, cbData);
    },

    getUserProfile:function(sPath, aParams, fnSucc, fnErr, context, cbData) 
    {
        var user;
        var userId = sPath.match(/Users\('(.+?)'\)/)[1];

        for(var i=0; i<rs.demoData.User.length; i++)
        {
            var node = rs.demoData.User[i];
            if(userId == node.UserID) 
            {
                user = node;
                break;
            }
        }           
        this._createResponseData(user, fnSucc, fnErr, context, cbData);
    },

    getAttachmentList : function(sPath, aParams, fnSucc, fnErr, context, cbData) 
    {
    	
    	var date = new Date();
    	var strDate = rs.util.Util.date2str(date, "yyyy-MM-dd") + 'T00:00:00';
        var result = {};
        result.AttachmentID = 'FOL33000000000004EXT37000000000024';
        result.FileName = 'PM1 External Training ARACRI Andy 03062012';
        result.FileExtension = 'pdf';
        result.CreationDate = strDate;
        result.CreationTime = 'PT11H53M29S';
        result.Creator = 'User';
        result.FileSize = '000000383665';
        result.CreatorName = 'Demo User';
        var data = {"results": [result]};
        this._createResponseData(data, fnSucc, fnErr, context, cbData);
    },

    getAttachment : function(sPath, aParams, fnSucc, fnErr, context, cbData) 
    {
        var that = this;
        $.get("rs/DemoData/Attachment1.txt", {}, function(xml) {
            var data = {"Content": xml};
            that._createResponseData(data, fnSucc, fnErr, context, cbData);
            }, 'html');
    },

    createNote : function(sPath, oData, oContext, fnSucc, fnErr, context, cbData)
    {
        var result = {};
        result.Content = oData.Content;
        result.CCHierarchyNodeID = oData.CCHierarchyNodeID;
        result.CEHierarchyNodeID = oData.CEHierarchyNodeID;
        result.IOHierarchyNodeID = oData.IOHierarchyNodeID;
        result.CreationTime = new Date().toTimeString();
        result.CreationDate = new Date().toDateString();
        result.NoteID = '10';
        result.ControllingArea = 'H5010';
        result.Status = "01";
        result.Creator = '100';
        result.CreatorName = 'Demo User';
        result.FiscalYear = rs.demoData.GeneralParameters[0].FiscalYear;
        fnSucc.call(context, result, null, cbData);
    },

	bDataLoaded : false,
	readQueue: [],
};