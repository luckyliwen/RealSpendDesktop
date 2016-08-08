/**
 * 
 */
rs.model.HierMng = {

	/**
	 * @param hierId
	 */
	getHierNodeById : function(hierId){
		return this._mHierNodes[hierId];
	},
		
	/**
	 * @param {rs.HierType}	type   
	 */
	getTopHierIdByType : function(type) {
		return this._mTopHierNodeId[type];
	},

	/**
	 * @param {rs.HierType}	type   
	 */
	getTopHierNameByType : function(type) {
		var id = this.getTopHierIdByType(type);
		return this.getNameById[id];
	},

	/**
	 * 
	 * @param hierId: if hierId is empty or null, then just return ""
	 */
	getNameById : function(hierId) {
		if ( hierId == null ||  hierId.length > 0) {
			this._assertHierId(hierId);
			return this._mHierNodes[hierId].Name;
		} else {
			return "";
		}
	},

	/**
	 * Return the HierarchyType from the hier id
	 * @param hierId
	 * @return {rs.HierType}
	 */
	getTypeById : function(hierId) {
		this._assertHierId(hierId);
		return this._mHierNodes[hierId].HierarchyType;
	},

	/**
	 * check whether is department type
	 * @param {} hierId
	 */
	isDepartmentType : function(hierId) {
		var type = this.getTypeById(hierId);
		return type == rs.HierType.Dep;
	},

	/**
	 * check whether is project  type
	 * @param {} hierId
	 */
	isProjectType : function(hierId) {
		var type = this.getTypeById(hierId);
		return type == rs.HierType.Prj;
	},

	
	/**
	 * check whether is expense type
	 * @param {} hierId
	 */
	isExpenseType : function(hierId) {
		var type = this.getTypeById(hierId);
		return type == rs.HierType.Exp;
	},

	
	/**
	 * 
	 * @param hierId
	 */
	isTopmostHier : function(hierId) {
		this._assertHierId(hierId);
		return this._mHierNodes[hierId].NodeLevel == 0;
	},

	/**
	 * Get the path array from it's topmost parent, 
	 * @param hierId
	 */
	getIndexPathById : function(hierId) {
		this._assertHierId(hierId);
		return this._mHierNodes[hierId]._aIdxPath;
	},

	getAllHierIdAsArray : function() {
		return this._aHierNodes;
	},
	
	/**
	 * 
	 * @param hierId
	 * @returns {Array}, array contains all its descendants' hierid.
	 */
	getChildrenByHierId : function(hierId){
		var hierNode = this.getHierNodeById(hierId);
		var that = this;
		var allChildren = [];
		function addChild(parent){
			if(parent.IsLeaf == 'true') return;
			for(var i=0;i<parent._children.length;i++){
				var child = that.getHierNodeById(parent._children[i]);
				allChildren.push(child.HierarchyNodeID);
				addChild(child);
			}
		}
		
		addChild(hierNode);
		return allChildren;
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

		rs.model.ODataHelper.read("HierarchyNodes", null, this._odataSuccCB,
				this._odataErrCB, this);

		/*
		 ChildrenNumber: 3
		HierarchyNodeID: "CCGH5000"
		HierarchyType: "CCG"
		IsLeaf: false
		Name: "Application Development"   
		NodeLevel: 0
		ParentID: ""
		ResponsibleUser: "KUMARRU"
		ResponsibleUserName: "Ruchi Kumar Chand"
		 */
	},

	/**
	 * Just used to assert that the hier node id  is valid (means has get by the HierarchyNodes info)
	 * @param hierId
	 */
	_assertHierId : function(hierId) {
		rs.assert(this._mHierNodes[hierId], 'The hierId ' + hierId
				+ " is not valid!");
	},

	/**
	 * call back for load odata successful
	 * @param data
	 * @param response
	 */
	_odataSuccCB : function(data, response) {

		//step 1: Just add to the map, and get the three top hier 
		for ( var i = 0; i < data.results.length; i++) {

			//for the level 0, add to top level
			var node = data.results[i];
			if (node.NodeLevel == 0) {
				switch (node.HierarchyType) {
				case rs.HierType.Dep:
					this._mTopHierNodeId[rs.HierType.Dep] = node.HierarchyNodeID;
					break;
				case rs.HierType.Exp:
					this._mTopHierNodeId[rs.HierType.Exp] = node.HierarchyNodeID;
					break;
				case rs.HierType.Prj:
					this._mTopHierNodeId[rs.HierType.Prj] = node.HierarchyNodeID;
					break;
				default:
					rs.assert(false, "unknown hier type " + node.HierarchyType);
				}
			}

			//Add to the _hierNodes maps	
			this._mHierNodes[node.HierarchyNodeID] = node;
			//also add to the node id array
			this._aHierNodes.push(node.HierarchyNodeID);
		}

		//step 2: Get the index under his parent
		for ( var nodeId in this._mHierNodes) {
			var node = this._mHierNodes[nodeId];
			if (node.NodeLevel > 0) {
				var parent = this._mHierNodes[node.ParentID];

				if (!('_children' in parent)) {
					//first time to add , so create
					parent['_children'] = [];
				}
				//just add the child node id 
				parent['_children'].push(nodeId);

				//most import is the current index
				node._idx4Parent = parent['_children'].length - 1;
			}
		}

		//step 3: Create the index path array from the topmost parent, so later is easy to create the TreeTable data
		for ( var nodeId in this._mHierNodes) {
			var node = this._mHierNodes[nodeId];

			if (node.NodeLevel > 0) {
				//use a loop to get the index for parent, parent's parent
				node._aIdxPath = [];

				var nextNode = node;
				do {
					node._aIdxPath.push(nextNode._idx4Parent);

					//move to the parent
					nextNode = this._mHierNodes[nextNode.ParentID];

				} while (nextNode.NodeLevel > 0);

				//finished , now need reverse it
				node._aIdxPath.reverse();
			}
		}

		//notify the listener
		this._oLoadModelInfo.onSucc();
	},

	/**
	 * call back for load odata failed
	 * @param error
	 */
	_odataErrCB : function(error) {
		this._oLoadModelInfo.onFail(error);
	},

	//===private data
	/**
	 *  a map, key is HierarchyNodeID, content is a HierarchyNode 
	 *  			 ChildrenNumber: 3
					HierarchyNodeID: "CCGH5000"
					HierarchyType: "CCG"
					IsLeaf: false
					Name: "Application Development"
					NodeLevel: 0
					ParentID: ""
					ResponsibleUser: "KUMARRU"
					ResponsibleUserName: "Ruchi Kumar Chand"
	
		and extra parent information
	 */
	_mHierNodes : {

	},

	//== the all hier node id array
	_aHierNodes : [],

	/**
	 * Only three, key is rs.HierTypeType, value is HierarchyNodeID
	 */
	_mTopHierNodeId : {

	},

	//the model information used to manage the load status
	_oLoadModelInfo : new rs.model.ModelInfo()

};