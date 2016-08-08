/**
 * define the note control 
 */
rs.view.Note = {
		
		/**
		 * bind the note data through under parameter
		 * @param hierId      : this is the hier Id of current node 
		 * @param byHierId    : this is the byHier Id of current node
		 * @param fiscalYear  : this will tell the current fiscal year
		 */
		_bindNoteData:function(hierId,byHierId,fiscalYear){
			this.oModel = new sap.ui.model.json.JSONModel();
			this.oModel.setData({
				modelData: rs.model.Note.getNotesArrayByHierarchy(
						hierId,
						byHierId,
						fiscalYear
				)
			}); 
			this.oTable.setModel(this.oModel);
			this.oTable.bindRows("/modelData");	  	
		},
		
		/**
		 * show the note list popup after note click operation
		 * @param oEvent	: this will get the click row and get the bind path
		 */
		showNoteList:function(oEvent){
			// get bind data first
			var attachObj   = oEvent.getParameters().object;
			var context =  attachObj.getBindingContext();
			var path        = context.sPath;			
			var data        = context.oModel.getProperty(path);
			
			// get byHerId
			var aHierId = [ data.CCHierarchyNodeID,
			                data.CEHierarchyNodeID,  
			                data.IOHierarchyNodeID];
			
			this.hierGroup.depId = data.CCHierarchyNodeID;
			this.hierGroup.expId = data.CEHierarchyNodeID;
			this.hierGroup.prjId = data.IOHierarchyNodeID;
			
			//As now the ModeMng part data structure has changed, now the Topmost detail put under the spendData/Detail4Top, 
			//so need use string lookup instead of just get the first node
			
			//First get the hierId
			var that = this;
			$.each(aHierId, function(idx, id) {
				if ( id != "") {
					var pos = path.indexOf( id );
					if (pos != -1 ) {
						that.hierId = id; 
					}
				}
			});  		
			
			//then get the byId
			$.each(aHierId, function(idx, id) {
				if ( id != "" && id != that.hierId) {
					that.byHierId = id;
				}
			});  		
			
			this.objId       = attachObj.getId();  
			this.fiscalYear  = data.FiscalYear;
			
			// bind data
			this._bindNoteData(
					this.hierId,
					this.byHierId,
					this.fiscalYear);	
			
			//create note popup
			jQuery.sap.require("sap.ui.core.Popup");
			this.oNotePopup = new sap.ui.core.Popup(
					this.oListPanel,
					false,
					true,
					true
			);
			this.oListPanel.focus();
			this.oNotePopup.setAnimations(
					this._openAnim, 
					this._closeAnim
			);
			this.oNotePopup.open(
					500, 
					"right center",
					"left center",
					$("#"+that.objId),
					this._arrowOffset
			);
		},
		
		/**
		 * the successful recall function for rs.model.Note.createNote 
		 * and rs.model.Note.deleteNote
		 * @param operation		: the operation mode Add or Delete a note
		 */
		onCreateSucc:function(operation){	
			if(operation == rs.NoteOperation.Delete)
			{
				
				rs.model.ModelMng.updateNoteCount4Tree(
						this.aDeleteId[0],
						this.aDeleteId[1],
						operation
				);
			}
			else
			rs.model.ModelMng.updateNoteCount4Tree(
					this.hierId,
					this.byHierId,
					operation
			);
			this._bindNoteData(
					this.hierId,
					this.byHierId,
					this.fiscalYear
			);
			rs.view.Help.refreshScreenForNotesUpdated(this.hierId,this.byHierId);
			this.oNotePopup.open(
					500, 
					"right center", 
					"left center",
					$("#"+this.objId), 
					this._arrowOffset
			);
		},
		
		/**
		 * the failure recall function for rs.model.Note.createNote
		 * and rs.model.Note.deleteNote
		 */
		onCreateFail:function(error){
			rs.util.Util.showErrorMessage(null, error, null, null);
		},
		/**
		 * this will init three note panels, NewPanel, ListPanel 
		 * and DetailPanel.
		 */
		init:function(){
			this.oDateFormat  = new sap.ui.model.type.Date({
				pattern: "MM/dd/yy"
			}); 
			this.oNewPanel    = this._initNewNote();
			this.oListPanel   = this._initListNote();
			this.oDetailPanel = this._initDetailNote();
		},	 
		
		/**
		 * this will create a new note panel named oNewPanel.
		 * @returns {sap.ui.commons.Panel}
		 */
		_initNewNote:function(){
			var oNewLyt = new sap.ui.commons.layout.AbsoluteLayout({
				height : "100%",
				width  : "100%"
			});
			oNewLyt.addStyleClass("note_layout");	
			
/*			var oNoteInput = new sap.ui.commons.TextArea({
				height : "95%",
				width  : "95%"
			});
			oNoteInput.setValue(rs.getText('GetNote'));	*/
			var noteText = rs.getText('GetNote');
			var oNoteInput = new sap.ui.core.HTML({
				content: '<textarea id="NoteText" style="height: 230px;width: 250px;resize:none;overflow:auto" ></textarea>'
			});
			oNoteInput.attachAfterRendering(function(){
				$("#NoteText").attr("placeholder",noteText);
				rs.util.Util.addPlaceHolder($("#NoteText"));
			});      
			oNewLyt.addContent(oNoteInput,{
				top  : "6px",
				left : "6px"
			});
			
			//create new panel
			var oNewPanel = new sap.ui.commons.Panel("NewNote",{
				width            : "280px",
				height           : "290px", 
				showCollapseIcon : false
			});
			oNewPanel.setTitle(new sap.ui.commons.Title({
				text: rs.getText('NewNote')
			}));
			oNewPanel.addStyleClass("arrow_box_right");	
			
			//add two buttons
			var  that   = this;		
			var oSaveButton = new sap.ui.commons.Button("note_save",{
				text  : rs.getText('NoteSave'),
				press : function(){
					this.setEnabled(false);
					rs.model.Note.createNote(
							$("#NoteText")[0].value,
							that.hierGroup,
							that.onCreateSucc,
							that.onCreateFail,
							that, rs.NoteOperation.Add
					);
					this.setEnabled(true);
					$("#NoteText")[0].value = "";
				}
			});			
			var oCancelButton = new sap.ui.commons.Button("note_cancel",{
				text:rs.getText('NoteCancel'),
				press:function(){
					that.oNotePopup.open(
							500,
							"right center", 
							"left center", 
							$("#"+that.objId),
							that._arrowOffset
					);
					$("#NoteText")[0].value = "";
				}
			});     		         
			oNewPanel.addButton(oSaveButton);
			oNewPanel.addButton(oCancelButton);
			oNewPanel.addContent(oNewLyt);	
			return oNewPanel;
		},
		
		/**
		 * this will create a new panel for oListPanel
		 * @returns {sap.ui.commons.Panel}
		 */
		_initListNote:function(){
			this.oAddButton = new sap.ui.commons.Button("note_add", {
				lite:true,
				press:[function(){							       
				var oNoteNewPopup = new sap.ui.core.Popup(
						this.oNewPanel,
						false,
						true, 
						true);			      				  
				oNoteNewPopup.setAnimations(this._openAnim, this._closeAnim);
				oNoteNewPopup.open(
						500, 
						"right center", 
						"left center",
						$("#"+this.objId), 
						this._arrowOffset
				);},this]
			});		
			
			//create note panel
			oListPanel = new sap.ui.commons.Panel("Note",{
				width: "280px",
				height:"295px",
				applyContentPadding: true,
				showCollapseIcon: false
			});				
			oListPanel.setTitle(new sap.ui.commons.Title({
				text: rs.getText('Notes')
			}));			
			oListPanel.addStyleClass("arrow_box_right");
			oListPanel.addStyleClass("no_padding"); 
			oListPanel.addButton(this.oAddButton);
			
			//create table
			var that=this;
			this.oTable = new sap.ui.table.Table({
				visibleRowCount    : 3,
				firstVisibleRow    : 0,
				width              : "100%",
				height             : "100%",
				selectionMode      : sap.ui.table.SelectionMode.Single,
				navigationMode     : sap.ui.table.NavigationMode.Scroller,
				rowSelectionChange : function(oEvent){
					that.showDetails(oEvent);											
				}
			});
			this.oTable.setSelectionBehavior(
					sap.ui.table.SelectionBehavior.RowOnly
			);
			this.oTable.setColumnHeaderVisible(false);
			
			var oMainLayout = new sap.ui.commons.layout.AbsoluteLayout({
				width  : "100%",
				height : "100%"
			});
			oMainLayout.addStyleClass("note_layout");
			oMainLayout.addContent(this.oTable);
			oListPanel.addContent(oMainLayout);
			var oRenderLayout = new sap.ui.commons.layout.AbsoluteLayout();
			oRenderLayout.addContent(oListPanel);
			//create table item
			this.oRowLayout=this._initTableLayout();
			var column = new sap.ui.table.Column({
				template : this.oRowLayout,
				width    : "100%"
			});
			this.oTable.addColumn(column);	
			return oListPanel;
		},
		
		/**
		 * this will create a layout for the table in List Note.
		 * @returns {sap.ui.commons.layout.AbsoluteLayout}
		 */
		_initTableLayout:function(){
			var oRowLayout = new sap.ui.commons.layout.AbsoluteLayout({
				height : "80px",
				width  : "100%"
			});
			
			var oNoteImage = new sap.ui.commons.Image();	
			oNoteImage.bindProperty("src", "Status", 
					function(bValue) {		
				if( bValue == 2)
				{
					return "images/Alert_blue_circle_icon.png";
				}
				else
				{
					return null;
				}
   			});
			oRowLayout.addContent(oNoteImage,{top:"25px",left:"5px"});	 
			
			var oNoteArrow= new sap.ui.commons.Image({src:"images/Disclosure_Arrow_Gray.png"});	
			oRowLayout.addContent(oNoteArrow,{top:"28px",right:"5px"});	 
			
			this.oDateFormat = new sap.ui.model.type.Date( {
				pattern: "MM/dd/yy"
			}); 
			var oDateTextView = new sap.ui.commons.TextView({
				tooltip      : 'This is a Date',
				wrapping     : false,
				semanticColor: sap.ui.commons.TextViewColor.Positive,
			});
			oDateTextView.bindProperty("text","CreationDate",this.oDateFormat);
			oRowLayout.addContent(oDateTextView,{
				top  : "0px",
				left : "180px"
			}); 		
			
			var oCreatorLabel = new sap.ui.commons.Label();  			
			oCreatorLabel.setText(rs.getText('NoteBy'));   			
			oRowLayout.addContent(oCreatorLabel,{
				top  : "0px",
				left : "10px"
			});  			
			var oCreatorTextView = new sap.ui.commons.TextView({
				wrapping : false,
   		        enabled  : false,
   		        width    : "50%",
   		        design   : sap.ui.commons.TextViewDesign.H6
			});
			oCreatorTextView.bindProperty("text","CreatorName")
			.bindProperty("tooltip","CreatorName");	
			oRowLayout.addContent(oCreatorTextView,{
				top  : "0px",
				left : "50px"
			}); 
 			
			var oHierarchyTextView = new sap.ui.commons.TextView({
				width    : "190px",
				wrapping : false,
				enabled  : false
			});
			oHierarchyTextView.bindProperty("text","hireGroupName")
			.bindProperty("tooltip","hireGroupName");
			oRowLayout.addContent(oHierarchyTextView,{top:"20px",left:"30px"});
			
			var oContentTextView = new sap.ui.commons.TextView({
				tooltip  : 'This is a content',
				wrapping : false,
				width    : "200px",
				enabled  : false
			});
			oContentTextView.bindProperty("text","Content");
			oRowLayout.addContent(oContentTextView,{
				top  : "40px",
				left : "30px"
			});		
			
			return oRowLayout;
		},
		
		/**
		 * this will create a new panel named oDetailPanel
		 * @returns {sap.ui.commons.Panel}
		 */
		_initDetailNote:function(){
			var oDetailLyt = new sap.ui.commons.layout.AbsoluteLayout({
				height : "100%",
				width  : "100%"
			});
			oDetailLyt.addStyleClass("note_layout");		
			
			var oDateDetailText = new sap.ui.commons.TextView({
				wrapping      : false,
				semanticColor : sap.ui.commons.TextViewColor.Positive,
			});
			oDetailLyt.addContent(oDateDetailText,{
				top  : "30px",
				left : "20px"
			});	
				
			var oCreatorDetailText = new sap.ui.commons.TextView({
				wrapping : false,
				enabled  : false,
				design   : sap.ui.commons.TextViewDesign.H6,
			});		
			oDetailLyt.addContent(oCreatorDetailText,{
				top  : "10px",
				left : "20px"
			});  
			
			var oHierarchyDetailText = new sap.ui.commons.TextView({
		        wrapping : false,
		        enabled  : false,
		        width    : '90%',
		        });
			oDetailLyt.addContent(oHierarchyDetailText,{
				top  : "60px",
				left : "20px"
			});
			
			this.oContentDetailText = new sap.ui.commons.TextArea({
		        tooltip : 'This is a content',
		        width   : "235px",
		        height  : "110px",
			});		
			this.oContentDetailText.setEditable(false);
			oDetailLyt.addContent(this.oContentDetailText,{
				top  : "100px",
				left : "20px"
			});		
			
			//add two lines
			var upLine     = new sap.ui.commons.layout.AbsoluteLayout({
				width  : "230px",
				height : "0px"
			});
			var bottomLine = new sap.ui.commons.layout.AbsoluteLayout({
				width  : "230px",
				height : "0px"
			});
			upLine.addStyleClass("note_border");
			bottomLine.addStyleClass("note_border");
			oDetailLyt.addContent(upLine,{
				top  : "50px",
				left : "20px"
			});
			oDetailLyt.addContent(bottomLine,{
				top  : "80px",
				left : "20px"
			});	
			
			//add delete button
			var that=this;
			this.oDeleteNote = new sap.ui.commons.Button({
				width  : "120px",
				height : "25px",
				text   : rs.getText("DeleteNote"),
				press  : function(){		     	   
					this.setEnabled(false);
					rs.model.Note.deleteNote(
							that.noteId,
							that.onCreateSucc,
							that.onCreateFail,
							that,rs.NoteOperation.Delete
					);
					this.setEnabled(true);	   
				}
			});
			this.oDeleteNote.addStyleClass("notebutton");
			oDetailLyt.addContent(this.oDeleteNote,{
				top  : "217px",
				left : "80px"
			});
			
			//create detail panel
			oDetailPanel = new sap.ui.commons.Panel("DetailNote",{
				width            : "280px",
				height           : "290px",
				showCollapseIcon : false
			});
			oDetailPanel.setTitle(new sap.ui.commons.Title({
				text: rs.getText('NoteDetails')
			}));
			oDetailPanel.addStyleClass("arrow_box_right");
			oDetailPanel.addStyleClass("no_padding");
			oDetailButton = new sap.ui.commons.Button("DetailButton",{
				text  : rs.getText('Notes'),
				lite  : true,
				press : [function(){				
				this._bindNoteData(this.hierId,this.byHierId,this.fiscalYear);
				this.oNotePopup.open(
						500, 
						"right center",
						"left center", 
						$("#"+this.objId),
						this._arrowOffset
				);},this]});
			oDetailPanel.addButton(oDetailButton);      
			oDetailPanel.addContent(oDetailLyt);
			
			return oDetailPanel;
		},
		
		/**
		 * this will show the Detail Note Popup.
		 * @param oEvent		: this will tell the current select row 
		 * and get the bind data by path
		 */
		showDetails:function(oEvent){	
			this.oNotePopup.close();
			
			//get bind data
			this.aDeleteId = [];
			var data=this.oModel.getProperty(
					oEvent.getParameters().rowContext.sPath);
			
			if(data.CCHierarchyNodeID != "")
				this.aDeleteId.push(data.CCHierarchyNodeID);
			if(data.CEHierarchyNodeID != "")
				this.aDeleteId.push(data.CEHierarchyNodeID);
			if(data.IOHierarchyNodeID != "")
				this.aDeleteId.push(data.IOHierarchyNodeID);
			
			this.noteId =data.NoteID;
			rs.model.Note.markAsRead(this.noteId);
		
			
			//bind data
			var aDetailCtrl=this.oDetailPanel.getContent()[0].getContent();
			aDetailCtrl[0].setText(this.oDateFormat.formatValue(
					data.CreationDate,"string"
			));
			aDetailCtrl[1].setText(data.CreatorName);
			aDetailCtrl[2].setText(data.hireGroupName);
			aDetailCtrl[3].setValue(data.Content);	
			
			//add delete button		
			if(rs.model.GeneralParam.getUsername().toUpperCase()==data.Creator){
				this.oDeleteNote.setVisible(true);
				this.oContentDetailText.setHeight("110px");
			}
			else{
                this.oDeleteNote.setVisible(false);
                this.oContentDetailText.setHeight("130px");
			}
			
			//create detail popup
			var oDetailpopup = new sap.ui.core.Popup(
					this.oDetailPanel, 
					false, 
					true,
					true
			);	      				  
			oDetailpopup.setAnimations(this._openAnim, this._closeAnim);
			oDetailpopup.open(
					500,
					"right center", 
					"left center",  
					$("#"+this.objId), 
					this._arrowOffset
			);		  		
		},
		
		/**
		 * this is the open animation for popup
		 * @param Ref
		 * @param iDuration
		 * @param fnCallback
		 */
		_openAnim:function(Ref, iDuration, fnCallback) {
			Ref.slideDown(iDuration, fnCallback);
		},
		
		/**
		 * this is the close animation for popup
		 * @param Ref
		 * @param iDuration
		 * @param fnCallback
		 */
        _closeAnim:function(Ref, iDuration, fnCallback) {
        	Ref.slideUp(iDuration, fnCallback);
		},
		
		_arrowOffset : "-15, 0", /* arrow width 15px */
		byHierId     : null,     
		hierId       : null,
		hierGroup    : {},       /* hier id group */
		oModel       : null,     /* json Model */
		oTable       : null,
		objId        : null,     /* selcted note Id */
		fiscalYear   : null,
};