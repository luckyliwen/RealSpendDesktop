rs.view.Alert = {

		showAlert : function(){
			//alert("alert clicked!");
			if(this._oAlertTable == null){
				this._oAlertTable = this._createAlertTable();
			}
			this._oModelInfo = rs.model.Alert.getLoadingModelInfo();
			if(this._oModelInfo.getLoadStatus() == rs.LoadStatus.NotStart){
				rs.model.Alert.loadData(this.loadAlertDataSuccCB, this.loadAlertDataFailCB, this);
				rs.util.Util.showBusyIndicator();
			}
			else if(this._oModelInfo.getLoadStatus() == rs.LoadStatus.Pending)
			{
				rs.util.Util.showBusyIndicator();
			}
			else if(this._oModelInfo.getLoadStatus() == rs.LoadStatus.Succ){
				this.loadAlertDataSuccCB();
			}
			else if(this._oModelInfo.getLoadStatus() == rs.LoadStatus.Fail){
				//alert("load alert fail!");
				rs.util.Util.showErrorMessage(null, this._oModelInfo.getError(), null, null);				
			}	
		},

		loadAlertDataSuccCB : function() {
			rs.util.Util.hideBusyIndicator();
	
			this._oAlertTable.setModel(this._oModelInfo.getSAPModel());
	
			this._oAlertTable.bindRows(this._oModelInfo.getRowInfo());
		    
			if(this._oDialog == null){
				this._oDialog = new sap.ui.commons.Dialog();
				this._oDialog.setWidth("520px");
				this._oDialog.setTitle(rs.getText("Title_Alert"));
				this._oDialog.setModal(true);
				this._oDialog.addContent(this._oAlertTable);
				
				//add two buttons								
				var oButtonMarkAll = new sap.ui.commons.Button("BtnMarkAll",
						{
							text : "{i18n>BtnTextMarkAll}",
							press : [function() {
								// open a simple confirm box
								 this._oMessageBox = new sap.ui.commons.MessageBox.confirm("{i18n>MarkAllAsRead}", rs.view.Alert._fnCallbackConfirm, "{i18n>Question}");
															},this]
						});
				this._oDialog.addButton(oButtonMarkAll);
				
				var oButtonClose = new sap.ui.commons.Button("BtnClose",
						{
							text :"{i18n>Close}",
							press :[this.closeDialog,this]
						});
				this._oDialog.addButton(oButtonClose);	

			}
			
			this._oDialog.open();

	},

	loadAlertDataFailCB : function(error) {
		rs.util.Util.hideBusyIndicator();
		//alert("load alert fail!");
		rs.util.Util.showErrorMessage(null, error, null, null);
	},
	
	onAlertFilterSwitch : function(oEvent) {
		var id = oEvent.getParameters().selectedButtonId;
		var oListBinding = this._oAlertTable.getBinding('rows');
		var oFilter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, rs.model.Alert.Status.UnRead);
		var oFilter2 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, rs.model.Alert.Status.Read);
		
		if (jQuery.sap.endsWith(id, this.BtnAll)) {

			oListBinding.filter([oFilter1,oFilter2]);

		} else if (jQuery.sap.endsWith(id, this.BtnUnRead)) {

			oListBinding.filter([oFilter1]);
			
		} else if (jQuery.sap.endsWith(id, this.BtnRead)){

			oListBinding.filter([oFilter2]);
		}
	},
	
	_fnCallbackConfirm:function(bResult) {
		//alert("Result returned to fnCallbackConfirm: " + bResult);
		
		//this._oMessageBox.close();
		
		if(bResult){	
			//this._oDialog.close();
			rs.view.Alert.closeDialog();
			rs.model.Alert.markAllAsRead(rs.view.Alert.markAllAsReadSuccCB,rs.view.Alert.markAllAsReadFailCB,this);		
		}

	},
	
	_createAlertTable:function(){
		
		 var oSegmentedButton = new sap.ui.commons.SegmentedButton({
			 		id:"SBText",
			 		buttons:[new sap.ui.commons.Button({id: this.BtnAll,text:"{i18n>All}",width:"60px"}),
			 		         new sap.ui.commons.Button({id: this.BtnUnRead,text:"{i18n>UnRead}",width:"60px"}),
			 		         new sap.ui.commons.Button({id: this.BtnRead,text:"{i18n>Read}",width:"60px"})]});

		 var that = this;
		 
         oSegmentedButton.setSelectedButton(this.BtnAll);
         
         oSegmentedButton.attachSelect(this.onAlertFilterSwitch,this);
         
		var oTable = new sap.ui.table.Table({
		title: "{i18n>Your_alerts_for_the_past_30_days}",
		visibleRowCount: 5,
		firstVisibleRow: 3,
		width: "100%",
		navigationMode: sap.ui.table.NavigationMode.Scroller,
		selectionMode: sap.ui.table.SelectionMode.Single,
		selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
		columnHeaderVisible: false,
		toolbar: new sap.ui.commons.Toolbar({
				items: [oSegmentedButton]}),
				
		rowSelectionChange: function(oEvent){
			that._oDialog.close();
			
			var index = this.getContextByIndex(this.getSelectedIndex());
			var data = this.getModel().getProperty("",index);
			var alertID = data.AlertID;
			var ccHierId = data.CCHierarchyNodeID;
			var ioHierId =  data.IOHierarchyNodeID;

			var bus = sap.ui.getCore().getEventBus();
			bus.publish("main", "alertItemClicked", {
				ccHierId : ccHierId,
				ioHierId: ioHierId
			});				
			
			rs.model.Alert.markAsRead(alertID,that.markAsReadSuccCB,that.markAsReadFailCB,this);
			
		} });

	 	var oAlertRowLayout = new sap.ui.commons.layout.AbsoluteLayout( {height: "55px",width:"100%"});
	    
		var oAlertImage1 = new sap.ui.commons.Image({src: "images/Alert_budgetover_icon.png"});
		
		var oAlertImage2 = new sap.ui.commons.Image();
		
		//read or unread?
		oAlertImage2.bindProperty("src", "Status", function(bValue) {
			
		    if( bValue == rs.model.Alert.Status.UnRead)
		    {
		    	return "images/Alert_blue_circle_icon.png";
		    }
		    else
		    {
	    		return null;
		    }
		});
			
		oAlertRowLayout.addContent(oAlertImage1,{top:"20px",left:"5px"});	
		oAlertRowLayout.addContent(oAlertImage2,{top:"25px",left:"30px"});
		
		var oHierarchyNameTextView = new sap.ui.commons.TextView({
	        tooltip : 'This is a Hierarchy info',
	        enabled: false,
	        wrapping : false,
	        });
			
		//as it need several properties, so just binding to the parent using ""	  
		oHierarchyNameTextView.bindProperty("text","",function(oValue)
				{			
					//As now the ui5 framework have bug before binding to row it will also do the update
					if ( oValue == null)
						return "";
						
					return oValue.CCHierarchyName + " - "+  oValue.CEHierarchyName + " - " + oValue.TimeRangeText;
				});
		
		oAlertRowLayout.addContent(oHierarchyNameTextView,{top:"0px",left:"50px"});
		
		var oDateFormat = new sap.ui.model.type.Date( {pattern: "MM/dd/yy"});
		var oDateTextView = new sap.ui.commons.TextView({
	        tooltip : 'This is creation Date',
	        wrapping : false,
	        textAlign : "Right",
	        semanticColor: sap.ui.commons.TextViewColor.Positive,
	        });
		
		oDateTextView.bindProperty("text","CreationDate",oDateFormat);
		oAlertRowLayout.addContent(oDateTextView,{top:"0px",right:"20px"});
				
		var oOverBudgetTextView = new sap.ui.commons.TextView({
	        tooltip : 'This is a over budget value',
	        wrapping : false,
	        enabled: false,
	        });
		oOverBudgetTextView.bindProperty("text","Percentage",function(oValue)
		{
			return Math.round(oValue) + "% "+ rs.getText("OverBudget");
		});
		oAlertRowLayout.addContent(oOverBudgetTextView,{top:"30px",left:"50px"});
		

		 oTable.addColumn(new sap.ui.table.Column({template: oAlertRowLayout}));
		 
		 oTable.allowTextSelection(false);			
		 
		 return oTable;
	},
	
	markAsReadSuccCB : function(){
		//alert("mark read succ!");
		var obj = $('#rs_alert');
		var unreadCount = rs.model.Alert.getUnreadAlertCount();
		rs.util.Util.showBadge(obj, unreadCount); 		
	},
	
	markAsReadFailCB : function(error){
		//alert("mark read fail!");
		rs.util.Util.showErrorMessage(null, error, null, null);
	},
	
	markAllAsReadSuccCB : function(){
		alert(rs.getText("MarkAllReadSucc"));
		var obj = $('#rs_alert');
		rs.util.Util.showBadge(obj, 0); 		
	},
	
	markAllAsReadFailCB : function(error){
		//alert("mark all read fail!");
		rs.util.Util.showErrorMessage(null, error, null, null);
		
	},
	closeDialog:function(){
		this._oDialog.close();
	},
	
	BtnAll : 'btn_all',
	BtnUnRead : 'btn_unRead',
	BtnRead:'btn_read',
	_oAlertTable : null,
	_oDialog : null,
	_oMessageBox : null,
};
