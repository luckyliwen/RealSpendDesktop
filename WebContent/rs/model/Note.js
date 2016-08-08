/**
 * 
 */
rs.model.Note = {

	Status : {
		UnRead:  '01',
		Read  : '02'
	},		
	
	getLoadingModelInfo : function() {
		return this._oLoadingModelInfo;
	},


	getMarkingModelInfo : function() {
		return this._oMarkingModelInfo;
	},

	
	getDeletingModelInfo : function() {
		return this._oDeletingModelInfo;
	},
	
	getCreatingModelInfo : function() {
		return this._oCreatingModelInfo;
	},
	
	
	/**
	 * Load all notes from back-end 
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

		rs.model.ODataHelper.read("Notes", null, this._odataLoadSuccCB,
									this._odataLoadErrCB, this);
	},

	/**
	 * get all notes data in array. 
	 */
	getAllNotes:function(){
		
		return this._noteData;
	},
	
	/**
	 * Return the notes array by matching the hierId and the byHierId and all its descendant id.
	 * @param {} hierId
	 * @param {} byHierId: 
	 * @param {String} fiscalYear   :  filter by fiscal year 
	 */
	getNotesArrayByHierarchy: function(hierId, byHierId, fiscalYear) {
		
		//used by UI to display note related hierarchy information
		var hireGroupName = rs.model.HierMng.getNameById(hierId) + '--' + rs.model.HierMng.getNameById(byHierId);
		
		var notesArray = [];
		var hireInfo = new rs.model.HierGroup(null, null, null);
		
		var byHireArray = [];		
		var byHireType;
		
		byHireArray = rs.model.HierMng.getChildrenByHierId(byHierId);
		byHireArray.push(byHierId);				
		
		if (rs.model.HierMng.isExpenseType(hierId)) 
		{
			hireInfo.expId = hierId;
			if (rs.model.HierMng.isDepartmentType(byHierId))  //byHierId: department ID. find department related expense
			{
				byHireType = rs.HierType.Dep; 
			}
			else  //byHierId: project ID. find project related expense
			{
				byHireType = rs.HierType.Prj; 
			}
		}
		else
		{
			byHireType = rs.HierType.Exp;
			if (rs.model.HierMng.isDepartmentType(hierId))  //hireId: department ID. find department related expense
			{
				hireInfo.depId = hierId;
			}
			else  //hireId: project ID. find project related expense
			{
				hireInfo.prjId = hierId;
			}
		}
		
		for(var i=0; i<byHireArray.length; i++)
		{
			if(rs.HierType.Exp == byHireType)
			{
				hireInfo.expId = byHireArray[i];
			}
			else if (rs.HierType.Prj == byHireType)
			{
				hireInfo.prjId = byHireArray[i];
			}
			else
			{
				hireInfo.depId = byHireArray[i];
			}
			
			var note = this.getNotesArrayByHierarchyGroup(hireInfo, fiscalYear);
			
			for(var j=0; j<note.length; j++)
			{
				note[j].hireGroupName = hireGroupName;
			}
			
		 	notesArray = notesArray.concat(note);
		}		
		
		return notesArray;
		
	},

	/**
	 * get hierarchy group related notes array 
	 * @param {rs.model.HierGroup} hierGroup   : this will tell how this note is related with which spend data
	 * @param {String} fiscalYear   :  filter by fiscal year 
	 */		
	getNotesArrayByHierarchyGroup: function(hierGroup, fiscalYear){
		var notes = [];
		
		for(var p in hierGroup)
		{
			if(undefined == hierGroup[p])
			{
				hierGroup[p] = "";
			}
		}	
		
		for(var i =0; i<this._noteData.length; i++)
		{
			if( (fiscalYear == this._noteData[i].FiscalYear) && 
				(hierGroup.depId == this._noteData[i].CCHierarchyNodeID) && 
				(hierGroup.expId == this._noteData[i].CEHierarchyNodeID) &&
				(hierGroup.prjId == this._noteData[i].IOHierarchyNodeID))		
			{
				notes.push(this._noteData[i]);
			}
		}
		
		return notes;
	},
	
	/**
	 * get hierarchy related notes count 
	 * @param {rs.model.HierGroup} hierGroup   : this will tell how this note is related with which spend data
	 * @param {String} fiscalYear   :  filter by fiscal year
	 */		
	getNotesNumberByHierarchy: function(hierGroup, fiscalYear){
		//var notes = [];
		var nLen = 0;
		
		for(var p in hierGroup)
		{
			if(undefined == hierGroup[p])
			{
				hierGroup[p] = "";
			}
		}	
		
		for(var i =0; i<this._noteData.length; i++)
		{
			if( (fiscalYear == this._noteData[i].FiscalYear) && 
				(hierGroup.depId == this._noteData[i].CCHierarchyNodeID) && 
					(hierGroup.expId == this._noteData[i].CEHierarchyNodeID) &&
					(hierGroup.prjId == this._noteData[i].IOHierarchyNodeID) )
			{
				//notes[nLen++] = this._noteData[i];
				nLen++;
			}
		}
		
		//return notes;
		return nLen;
	},
	
	/**
	 * Mark all the notes as read 
	 * @param {} (optional) fnSucc
	 * @param {} (optional) fnFail
	 * @param {} (optional) context
	 * @param {} (optional) cbData	 * 
	 */
	markAllAsRead : function(fnSucc, fnFail, context, cbData) {
		
		if (this._oMarkingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}				
		
		var sUrl = "UpdateNotesStatus?NotesID=\'*\'&Status=\'" +  this.Status.Read + "\'";
		
		this._oMarkingModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		
		this._curreteMarkingNote = "*";
		
		rs.model.ODataHelper.create(sUrl, null, null, this._odataUpdateSuccCB,
				this._odataUpdateErrCB, this);	
	},

	/**
	 * Mark the note identify by the noteId as read
	 * @param {} noteId
	 * @param {} (optional) fnSucc
	 * @param {} (optional) fnFail
	 * @param {} (optional) context
	 * @param {} (optional) cbData 
	 */
	markAsRead : function(noteId, fnSucc, fnFail, context, cbData) {

		
		if (this._oMarkingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}					
		
		var sUrl = "UpdateNotesStatus?NotesID=\'" + noteId + "\'&Status=\'" +  this.Status.Read + "\'";
		
		this._oMarkingModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		
		this._curreteMarkingNote = noteId;
		
		rs.model.ODataHelper.create(sUrl, null, null, this._odataUpdateSuccCB,
				this._odataUpdateErrCB, this);		
	},

	/**
	 * Mark the note identify by the noteId as read
	 * @param {} noteId
	 * @param {} (optional) fnSucc
	 * @param {} (optional) fnFail
	 * @param {} (optional) context
	 * @param {} (optional) cbData 
	 */	
	deleteNote: function(noteId, fnSucc, fnFail, context, cbData){
		
		if (this._oDeletingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}			
		
		var sUrl = "Notes(NoteID=\'" + noteId + "\')";
		
		this._oDeletingModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		
		this._currentDeletingNote = noteId;
		
		rs.model.ODataHelper.remove(sUrl, null, this._odataDeleteSuccCB,
				this._odataDeleteErrCB, this);		

	},
	
	/**
	 * Create a new note and save to backend. Here only need provide the note content,
	 * @param {} content
	 * @param {rs.model.HierGroup} hierGroup   : this will tell how this note is related with which spend data
	 */
	createNote : function(content, hierGroup, fnSucc, fnFail, context, cbData) {
		
		if (this._oCreatingModelInfo.getLoadStatus() == rs.LoadStatus.Pending) 
		{
			return;
		}			
		
		var noteData = {};
		noteData.Content = content;
		noteData.CCHierarchyNodeID = hierGroup.depId;
		noteData.CEHierarchyNodeID = hierGroup.expId;
		noteData.IOHierarchyNodeID  = hierGroup.prjId;
		
		this._oCreatingModelInfo.startLoading(fnSucc, fnFail, context, cbData);
		
		rs.model.ODataHelper.create("Notes", noteData, null, this._odataCreateSuccCB,
				this._odataCreateErrCB, this);		
	},
	
	
	
	/**
	 * call back for create note successfully. add new note to local array.
	 * @param data
	 * @param response
	 */	
	_odataCreateSuccCB:function(data, response) {

		var node = data;
		
		node.CCHierarchyName = rs.model.HierMng.getNameById(node.CCHierarchyNodeID);
		node.CEHierarchyName = rs.model.HierMng.getNameById(node.CEHierarchyNodeID);
		node.IOHierarchyName = rs.model.HierMng.getNameById(node.IOHierarchyNodeID );
		
		//convert "PT09H28M44S" to "09:28:44". sometimes returned CreationTime like this "PT09H28M44S" 
		var reg = /^pt\d/i;
		if((node.CreationTime) && (node.CreationTime.match(reg)))
		{
			//convert "PT09H28M44S" to "09:28:44". sometimes returned CreationTime like this "PT09H28M44S" 
			node.CreationTime = rs.util.Util.getTimeStringByString(node.CreationTime);
		}		
		
		//convert "/Date1380000000/" and "2012-09-24T08:00:00" to date object
		if(node.CreationDate)
		{
			node.CreationDate = rs.util.Util.getDateObjectByString(node.CreationDate);
		}
		
		if(!node.CreationDate)
		{
			node.CreationDate = new Date();
		}
		
		
		//add new note to local array. 
		this._noteData.push(node);
		
		this._noteJasonModel.setData(this._noteData);
		
		this._oCreatingModelInfo.setModel(this._noteJasonModel);
		this._oCreatingModelInfo.setRowInfo('/');			
		
		this._oCreatingModelInfo.onSucc();
		
	},
	
	/**
	 * call back for create note failed.
	 * @param error
	 */		
	_odataCreateErrCB: function(error) {
		this._oCreatingModelInfo.onFail(error);				
	},
	
	/**
	 * call back for delete note successfully
	 * @param data
	 * @param response
	 */		
	_odataDeleteSuccCB:function(data, response) {
		//delete note from local array.
		this._syncNoteAfterDelete();
		
		this._noteJasonModel.setData(this._noteData);
		
		this._oDeletingModelInfo.setModel(this._noteJasonModel);
		this._oDeletingModelInfo.setRowInfo('/');		
		
		this._oDeletingModelInfo.onSucc();		
		
	},
	
	/**
	 * call back for delete note failed.
	 * @param error
	 */		
	_odataDeleteErrCB: function(error) {
		//for delete operation. HTTP Status code 204 means "The server has fulfilled the request but does not need to return an entity-body"
		if("204" == error.response.statusCode)
		{
			this._syncNoteAfterDelete();
			
			this._noteJasonModel.setData(this._noteData);
			
			this._oDeletingModelInfo.setModel(this._noteJasonModel);
			this._oDeletingModelInfo.setRowInfo('/');				
			
			this._oDeletingModelInfo.onSucc();		
		}
		else
		{
			this._curreteNote = "";
			this._oDeletingModelInfo.onFail(error);
		}
		
	},

	/**
	 * delete note from local array after successful backend delete operation.
	 */			
	_syncNoteAfterDelete:function(){
		for(var i =0; i< this._noteData.length; i++)
		{
			if(this._currentDeletingNote == this._noteData[i].NoteID)
			{
				//delete this note from array
				this._noteData.splice(i, 1);
				break;
			}
		}		
		
		this._currentDeletingNote = "";		
	},
	
	
	/**
	 * call back for update note status successfully
	 * @param data
	 * @param response
	 */			
	_odataUpdateSuccCB:function(data, response) {

		//update note status in local array after successful back-end update operation. 
		if("*" == this._curreteMarkingNote)  // "*" means update all notes. 
		{
			for(var i =0; i< this._noteData.length; i++)
			{
				this._noteData[i].Status =  this.Status.Read;
			}
		}
		else
		{
			for(var i =0; i< this._noteData.length; i++)
			{
				if(this._curreteMarkingNote == this._noteData[i].NoteID)
				{
					this._noteData[i].Status =  this.Status.Read;
					break;
				}
				
			}
		}
		
		this._curreteMarkingNote = "";
		
		this._noteJasonModel.setData(this._noteData);
		
		this._oMarkingModelInfo.setModel(this._noteJasonModel);
		this._oMarkingModelInfo.setRowInfo('/');		
		
		this._oMarkingModelInfo.onSucc();
	},
	
	/**
	 * call back for update note status failed.
	 * @param error
	 */			
	_odataUpdateErrCB: function(error) {
		this._curreteMarkingNote = "";
		this._oMarkingModelInfo.onFail(error);
	},	
	
	
	/**
	 * call back for load notes successfully
	 * @param data
	 * @param response
	 */
	_odataLoadSuccCB : function(data, response) {
	
		//empty the array
		this._noteData.splice(0, this._noteData.length);
		
		for ( var i = 0; i < data.results.length; i++) 
		{
			var node = data.results[i];
			this._noteData[i] = node;
			
			this._noteData[i].CCHierarchyName = rs.model.HierMng.getNameById(node.CCHierarchyNodeID);
			this._noteData[i].CEHierarchyName = rs.model.HierMng.getNameById(node.CEHierarchyNodeID);
			this._noteData[i].IOHierarchyName = rs.model.HierMng.getNameById(node.IOHierarchyNodeID );
			
			var reg = /^pt\d/i;
			if((node.CreationTime) && (node.CreationTime.match(reg)))
			{
				//convert "PT09H28M44S" to "09:28:44". sometimes returned CreationTime like this "PT09H28M44S" 
				this._noteData[i].CreationTime = rs.util.Util.getTimeStringByString(node.CreationTime);
			}
			
			//convert "/Date1380000000/" and "2012-09-24T08:00:00" to date object
			if(node.CreationDate)
			{
				this._noteData[i].CreationDate = rs.util.Util.getDateObjectByString(node.CreationDate);
			}
						
		}
		
		
		
		this._noteJasonModel.setData(this._noteData);
		this._noteJasonModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
		this._oLoadingModelInfo.setModel(this._noteJasonModel);
		this._oLoadingModelInfo.setRowInfo('/');			
		
		//notify the listener
		this._oLoadingModelInfo.onSucc();
	},	
	
	/**
	 * call back for load notes failed
	 * @param error
	 */
	_odataLoadErrCB : function(error) {
		this._oLoadingModelInfo.onFail(error);
	},
	

	//==private data
	
	/*model info for loading notes */
	_oLoadingModelInfo : new rs.model.ModelInfo(),
	
	/*model info for marking note as read */
	_oMarkingModelInfo : new rs.model.ModelInfo(),
	
	/* model info for deleting note */
	_oDeletingModelInfo : new rs.model.ModelInfo(),
	
	/* model info for creating note */
	_oCreatingModelInfo : new rs.model.ModelInfo(),
	
	
	/*data array for all notes */
	_noteData: [],	
	
	/* json model for all notes */
	_noteJasonModel: new sap.ui.model.json.JSONModel(),
	
	/* current marking operation Note ID */
	_curreteMarkingNote: "",
	
	/* current deleting operation Note ID */
	_currentDeletingNote: "",
	
};