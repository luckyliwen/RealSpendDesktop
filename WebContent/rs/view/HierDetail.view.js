
/**
 * In order to reuse the common framework of SAPUI5 (such as auto generate the setXX/getXX, here we extend a view from the sap.ui.core.mvc.JSView
 */
jQuery.sap.declare("rs.view.HierDetail");
jQuery.sap.require("rs.view.HierBaseView");
//jQuery.sap.require("sap.ui.core.Control");

//sap.ui.jsview("rs.view.HierOverView", {
rs.view.HierBaseView.extend("rs.view.HierDetail", {
	metadata : {
		//Here in order to avoid name conflict, we add rs to the property name
		properties : {
			'oldHierId' : 'string',  //The old hier id of last time display
			
			"rsHierId":   'string',
			
			"rsHierType" : "string",
			
			//the naviMng used to manage itself
			"naviMng" : "object",
		},
		// ---- control specific ----
		library : "sap.ui.core",
		//renderer: 

	},
	
	/**
	 * Save the new hier id and the old hier id will became the oldHierId
	 * @param id
	 */
	setRsHierId: function( id ) {
		//need first save the old id 
		var oldId = this.getRsHierId();
		this.setProperty('rsHierId', id);
		this.setOldHierId( oldId);
	},
	
	//Just reuse the JSView is enough
	renderer: 'sap.ui.core.mvc.JSViewRenderer',
    
	getControllerName: function() {		
		return "rs.controller.HierDetail";
	},		

	
	/**
	 * Constant enum for the two views
	 */
	ViewType : {
		Bar:  0,
		Table: 1,
	},
	
	
	/**
	 * Constant enum for budgetRatio/spending model
	 */
	ModelType: {
		BudgetRatio:  0,
		Spending: 1
	},
	
	isBudgetModel: function() {
		return this.getModelType() == this.ModelType.BudgetRatio;
	},
	
	
	/**
	 * Get the content header part height, need by consistent with the view implementation (normally is the information header and 
	 * the view switch part,  the detail view/lineItem/Trend need add the extra navigation part)
	 * Now use this static way because the jQuery.offset() only work for the visible element 
	 */
	getContentHeaderHeight: function() {
		// now 20 for the navigation
		return rs.view.Help.HeaderDataHeight + this.SwitchToolbarHeight + 20;
	},
	
	
	onResize:function(){
		
		this.calculateMainContentWidthHeight();
		
		if (this._oTrendView)
		{
			this._oTrendView.onResize();
		}
		
		if(this._oLineItemView)
		{
			this._oLineItemView.onResize();
		}
		
		this.adjustTreeTableHeight(this._oBarTreeTable);
		this.adjustTreeTableHeight(this._oTextTreeTable);
	},
	
	
	/**
	 * Create the name column information 
	 */
	_createNameColumnInfo: function() {
		//the name label is different for different view type
		var label = "";
		switch ( this.getRsHierType()) {
			case rs.HierType.Dep:
				label = "{i18n>ExpenseType}";
				break;
			case rs.HierType.Exp:
				label = "{i18n>DepartAndProject}";
				break;
			case rs.HierType.Prj:
				label = "{i18n>ExpenseType}";
				break;
		};
		
		var template = new rs.cfg.Control.Text({text:"{Name}",enabled: false}); 
		return ({ "label": label,  "template": template});
	}, 
	

	/**
	 * Create the bar column information 
	 * @param budgetRatio  : if true, then use the 'constant' mode, otherwise use the scale model
	 */
	_createBarColumnInfo: function( budgetRatio ) {
		var label = "";
		if(budgetRatio){
			label = rs.getText("Actual") + " + "+rs.getText("CommittedSpending") +" ("+rs.getText("BudgetRatio") +" )" ;
		}
		else{
			label = rs.getText("Actual") +" + "+rs.getText("CommittedSpending")  ;
		}
		
		var bar = new rs.uilib.BudgetBar({
			total: "{Total}",
			budget: "{Budget}",
			committed: "{Commited}",
			variancePercentage: "{VariancePercentage}",
			barModel : budgetRatio ? "constant" : "scale"
			});
		
		var that  = this;
		bar.bindProperty("maxValue", "{MaxValue}", function(value) {
			return this.getModel().getProperty(that.getBindPath( that.getRsHierId())+"/MaxValue");
		});
		
		//As for the grouping row, no need show bar, so need user a wrap to wrap the bar
		var barWrapper = new rs.uilib.ControlWrapper( {
			ignore : "{isGroupHeader}"
		});
		barWrapper.addContent(bar);
		
		return ({ "label": label,  "template": barWrapper});
	},

	/**
	 * Create the variance column information
	 * @param needImage : if true, then need the image part 
	 */
	_createVarianceColumnInfo: function( needImage ) {

		var oLayout = new sap.ui.commons.layout.AbsoluteLayout( {height: "35px"});
		
		//the image part
		if ( needImage ) {
			var img = new sap.ui.core.HTML();
			var contentParameter = "<div  style='position:relative;width:5px;height:30px;background-color:";
			var contentParameterEnd = ";\'></div>";
			
			//as it need several properties, so just binding to the parent using ""
			img.bindProperty("content","",function(oValue){
				//As now the ui5 framework have bug before binding to row it will also do the update
				if ( oValue == null)
					return "";
				
				//for the grouping special case
				if ( oValue.isGroupHeader) 
					return "";
					
				color  = rs.view.getColorByVariancePercentage(oValue.VariancePercentage, oValue.Total);
				return contentParameter+color+contentParameterEnd;				
			});
			
			oLayout.addContent(img,{top:"2px",left:"2px"});
		}
		
		//the variance text view	
		var tvVariance = new rs.cfg.Control.Text({enabled: false});
		
		//as it need several properties, so just binding to the parent using ""
		tvVariance.bindProperty("text", "",function(oValue){
				//As now the ui5 framework have bug before binding to row it will also do the update
				if ( oValue == null)
					return "";
				
				//for the grouping special case
				if ( oValue.isGroupHeader) 
					return "";
			
				var variancePercentageFormat = rs.view.Help.formatVariancePercentage(  oValue.VariancePercentage);
				var leftOver = oValue.Variance >= 0 ? rs.getText("Left") : rs.getText("Over");
				return rs.util.Util.numericPrecisonFormat(Math.abs(oValue.Variance))+variancePercentageFormat+ leftOver;
			});

		
		//add the content
		oLayout.addContent(tvVariance,{top:"10px",left:"10px"});

		return ({ "label": "{i18n>Variance}",  "template": oLayout});
	},
	
	/**
	 * Create the note number column information 
	 */
	_createNoteColumnInfo: function() {
		
		//the note number
		var noteNum = new rs.uilib.NoteNumber();
		noteNum.bindProperty("count","NoteCount");
		
		//Just by the oEvent it can get all information, so no need provide extra parameter
		noteNum.attachPress(function(oEvent){
			rs.view.Note.showNoteList(oEvent);
		});			
		
                //As now the NoteNumber can handle the -1 (not show) so here no need use a ControlWrapper	
		
		return ({ "label": "{i18n>Notes}",  "template": noteNum});
	},
	
	_createTableToolbar:function(oController){
		var oButtonExpandAll = new sap.ui.commons.Button({
					text : rs.getText("ExpandAll"),
					press: function() 
					{
						oController.onExpandAll.call(oController);
					}
				});
		var oButtonCollapseAll = new sap.ui.commons.Button({
					text : rs.getText("CollapseAll"),
					press: function() 
					{
						oController.onCallapseAll.call(oController);
					}					
				});
		var oButtonExpandToLevel = new sap.ui.commons.Button({
					text : rs.getText("ExpandToLevel"),
					press: function() 
					{
						oController.onExpandToLevel.call(oController, oTextFieldToLevel.getValue());
					}							
				});
		var oButtonShare = new sap.ui.commons.Button({
					text : rs.getText("Title_Share"),
					press: function() 
					{
						rs.view.Help.doExport();
					}						
				});
		var oTextFieldToLevel = new sap.ui.commons.TextField({
									value: "2",
									width: "25px", 
									maxLength: 2,				
								});
		var oSearchField = 	new sap.ui.commons.SearchField({
											enableListSuggest: false,
											enableClear: true,
											startSuggestion: 0,	
											suggest: function(oEvent)
											{
												oController.onSearchSuggest(oEvent)
											}						
						});
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [oButtonExpandAll, oButtonCollapseAll, oButtonExpandToLevel, oTextFieldToLevel, oSearchField, oButtonShare]
		}).addStyleClass("treeTableToolbar");		
		
		return toolbar;
	},
	
	/**
	 * Create the bar table, also binding the template
	 */
	createBarTable: function(oController) {
		//there are 5 columns ,first create the column information: first two bar column (later will switch between them) 
		var cols = [];
		cols.push(  this._createNameColumnInfo() );
		cols.push(  this._createBarColumnInfo(true) );
		cols.push(  this._createBarColumnInfo(false) );
		cols.push(  this._createVarianceColumnInfo(false) );
		cols.push(  this._createNoteColumnInfo() );
		
		//the following code just set the each column width ratio,
	    var flexiableWidthRatio = [3,4,4,2,1];	//for "Name" "Actual+Spend"(budget mode),"Actual+Spend"(spend mode), "Variance", "Note"
	    var total = 0;
	    for(var i=0 ;i <flexiableWidthRatio.length;i++){
	    	total += flexiableWidthRatio[i];
	    }
	    
		//then add by same way
		var columns = [];
		$.each(cols, function(idx, ele) {
			columns.push(new sap.ui.table.Column({
				label : ele.label,
				template: ele.template,
				width: flexiableWidthRatio[idx]*100/total +"%"
			}));
		});
		
		var oTable = new rs.cfg.Control.TreeTable(
			this.createId("BarTable"), 
			{
					selectionBehavior:sap.ui.table.SelectionBehavior.RowOnly,
					selectionMode : sap.ui.table.SelectionMode.Single,
					allowColumnReordering : true,
					showNoData: false,
					expandFirstLevel : true,
					columns: columns,
					toolbar: this._oBarTableToolbar
			});

		//save the global column, so later can easily switch them
		this._oColumnBudgetRatioBar = columns[1];
		this._oColumnSpendingBar = columns[2];
		//in the begin, the spending bar column should hide 
		this._oColumnSpendingBar.setVisible(false);

		oTable.setWidth('100%');
		
		//register call back 
		oTable.attachRowSelectionChange(oController.onTreeTableRowSelected, oController);

		return oTable;
	},
	
	/**
	 * Create the text tree table
	 */
	createTextTable: function(oController) {

			//create all the column information 
			var cols = [];
			cols.push(  this._createNameColumnInfo() );

			//For the Actual, Committed,Budget,Actual, all is same (As the backend data is  Commited, so here use same also)
			var keys = ["Actual", "Commited", "Total", "Budget"];
			$.each( keys, function( idx, key) {
				cols.push(
						{ 
							label: "{i18n>" + key + "}",
							template:  new rs.cfg.Control.Text({enabled: false}).bindProperty(
									"text", "" ,function(value) {
										if ( value == null)
											return "";										
										//for the grouping special case
										if ( value.isGroupHeader) 
											return "";
										else 
											return rs.util.Util.numericPrecisonFormat(value[key]);
									})
						} );
			});
			//last is the variance and note 
			cols.push(  this._createVarianceColumnInfo(true) );
			
			cols.push(  this._createNoteColumnInfo() );
			
			//the following code just set the each column width ratio,
		    var flexiableWidthRatio = [2, 1, 1, 1, 1, 2,1];	//for "Name" "Actual", "Committed", "Total", "Budget","Variance","Note"
		    var total = 0;
		    for(var i=0 ;i <flexiableWidthRatio.length;i++){
		    	total += flexiableWidthRatio[i];
		    }
		    
			//then add by same way
			var columns = [];
			$.each(cols, function(idx, ele) {
				columns.push(new sap.ui.table.Column({
					label : ele.label,
					template: ele.template,
					width: flexiableWidthRatio[idx]*100/total +"%"
				}));
			});
			
			var oTable = new rs.cfg.Control.TreeTable(
				this.createId("TextTable"), 
				{
						selectionBehavior:sap.ui.table.SelectionBehavior.RowOnly,
						selectionMode : sap.ui.table.SelectionMode.Single,
						allowColumnReordering : true,
						showNoData: false,
						expandFirstLevel : true,
						columns: columns,
						toolbar: this._oTextTableToolbar
				});			

			oTable.setWidth('100%');
			
			//register call back 
			oTable.attachRowSelectionChange(oController.onTreeTableRowSelected, oController);

			return oTable;
	},
	
	/**
	 * Create the switch tool bar
	 * @returns {sap.ui.commons.layout.AbsoluteLayout}
	 */
	createSwitchToolbar : function() {

		//create the segment for switch between Bar and Table
		var btnBar =  new rs.cfg.Control.Button({
		 	icon:"images/Detail_Barchart_UnSelected.png",
		 	iconHovered:"images/Detail_Barchart_Selected.png",
		 	iconSelected:"images/Detail_Barchart_Selected.png",
		 	textAlign:"Center",
		 	width:"60px",
		 	height:"40px"});
		
		var btnTable =  new rs.cfg.Control.Button({
    	 	icon:"images/OverviewTableViewUnSelected.png",
    	 	iconHovered:"images/OverviewTableViewSelected.png",
    	 	iconSelected:"images/OverviewTableViewSelected.png",
    	 	textAlign:"Center",
    	 	width:"60px",
    	 	height:"40px"});
		
		//set the enum data, so later easy know which view type
		btnBar.setRSEnumData( this.ViewType.Bar);
		btnTable.setRSEnumData( this.ViewType.Table);
				
		var oSBViewType = new rs.cfg.Control.SegmentedButton({
			id:this.createId("sbtn_viewtype"),
			buttons:[btnBar,btnTable]});
			        	 			
		//first select for bar
		oSBViewType.setSelectedButton(btnBar);
		

		//Then create the budget/spending parts
		var  btnBudgetRatio = new rs.cfg.Control.Button({
			id : this.createId(this.BtnBudget),
			text : "{i18n>BudgetRatio}",
			textAlign:"Center",
			width:"85px",
		 	height:"40px"});
		var btnSpending = new rs.cfg.Control.Button({
			id : this.createId(this.BtnSpend),
			text : "{i18n>Spending}",
			textAlign:"Center",
			width:"85px",
		 	height:"40px"});
		
		//set the enum data, so later easy know which model type
		btnBudgetRatio.setRSEnumData( this.ModelType.BudgetRatio);
		btnSpending.setRSEnumData( this.ModelType.Spending);
		
	   // oSBViewType.setWidth("100%");
		//create the segment for switch between Budget and Spending
		var oSBBudgetSpend = new rs.cfg.Control.SegmentedButton({
			id : this.createId("sbtn_budgetSpend"),
			//tips:  so later easily change the mode
			buttons : [btnBudgetRatio, btnSpending]});

		oSBBudgetSpend.setSelectedButton(btnBudgetRatio);
		
		this._oBoxSizeInfoTextView = new rs.cfg.Control.Text({
			textAlign : "Right",
			enabled: false
		});
		
		this._oBoxSizeInfoTextView.setText(rs.view.Help.formatBoxSizeHintText(rs.getText("TableValueCurrencyHint")));
		
		
		this._oSBBudgetSpend = oSBBudgetSpend;
		this._oSBViewType = oSBViewType;

		this._oSwitchLayout = new sap.ui.commons.layout.AbsoluteLayout(this
				.createId('switch_toolbar'), {
			height : "60px"
		}).addStyleClass("switch_toolbar");

		this._oSwitchLayout.addContent(oSBViewType,{
			left : "0px",
			top : "0px"
		});
		

		this._oSwitchLayout.addContent(oSBBudgetSpend,{
				left : "210px",
				top : "0px"
			});

		this._oSwitchLayout.addContent(this._oBoxSizeInfoTextView,{
			right : "0px",
			top : "30px"
		});
		
		return this._oSwitchLayout;
	},


	/**
	 * Create all the real content
	 * @param oController
	 * @returns {sap.ui.commons.layout.VerticalLayout}
	 */
	createContentImpl : function(oController) {

		this.headPart = rs.view.Help.createHeaderData(this.getId());
		if(this.getRsHierType() != rs.HierType.Exp){
			this._addUserInfoToHeader();
		}
		
		var switchToolbar = this.createSwitchToolbar();

		this._oContentLayout = this.createContentLayout();

		//set all the width to 100%
		this.headPart.setWidth('100%');
		switchToolbar.setWidth('100%');
		this._oContentLayout.setWidth('100%');

		this._oMainLayout = new sap.ui.commons.layout.VerticalLayout(
			this.createId('mainVerticalLayout'), 
			{ 	
				content : [ this.headPart, switchToolbar, this._oContentLayout] 
			}
		).addStyleClass("mainVerticalLayout");
		this._oMainLayout.setWidth('100%');
		
		this._oBarTableToolbar = this._createTableToolbar(oController);
		this._oTextTableToolbar = this._createTableToolbar(oController);
		
		//Create two table and binding template 
		this._oBarTreeTable = this.createBarTable(oController);
		this._oTextTreeTable = this.createTextTable(oController);
		
		var parentCell = sap.ui.getCore().byId(this.createId( 'contentCell'));
		this._oViewMng = new rs.view.InternalPageMng(parentCell, 0,
				[ this._oBarTreeTable, this._oTextTreeTable]);
		
		return this._oMainLayout;
	},

	
	getTitle: function() {
		//Now all can use same title
		return rs.getText("Detail");
	},


	/**
	 * The doInit function will called after finished set the parameter
	 * !! the init() will be called by framework, but at that time don't have the parameter such as the hierType, so don't have enough knowledget to do init work
	 */
	doInit : function() {
		var controller = this.getController();
		
		this.calculateMainContentWidthHeight();
		
		var content = this.createContentImpl(controller);
		this.addContent(content);

		//set the active table for export the table to CSV
		this.setActiveTable(this._oBarTreeTable);
		
		//Set two switch control to parent
		this.setViewSwitchControl( this._oSBViewType);
		this.setModelSwitchControl( this._oSBBudgetSpend);
		
		//Attach segment button event
		this._oSBViewType.attachSelect( controller.onViewTypeChanged, controller );
		this._oSBBudgetSpend.attachSelect( controller.onModelTypeChanged, controller );
		
		//Now know the height, so can adjust table height
		this.adjustTreeTableHeight(this._oBarTreeTable);
		this.adjustTreeTableHeight(this._oTextTreeTable);
		
		this.setLegendMode(rs.view.LegendMode.Detail);

		rs.cfg.Cfg.addChangeListener(controller.onConfigChanged, controller, null);
	},


	/*if user changed the time period setting, then the hierId should be cleared, so if re-enter the detail,
	 * will update the screen with the new data, and also if the lineitem view or trend view is existed, 
	 * the related Id also should be cleared*/
	clearId:function(){
		this.setRsHierId("");
		
		if (this._oLineItemView != null){
			this._oLineItemView.clearId();
		}
		
		if (this._oTrendView != null){
			this._oTrendView.clearId();
		}
	},

	
	_refreshScreenForCfgChanged:function(){

		this._oBarTreeTable.invalidate();
		this._oTextTreeTable.invalidate();
		
		this._oBoxSizeInfoTextView.setText(rs.view.Help.formatBoxSizeHintText(rs.getText("TableValueCurrencyHint")));
	},
	
	//==========================================================================================================
	//              User information related functions
	//==========================================================================================================
	_addUserInfoToHeader:function(){

		var oHeaderName = sap.ui.getCore().byId(this.getId() +'--headerDataName');
		var oUserImage = new sap.ui.commons.Image(this.createId("userInfoImageId"));
		oUserImage.setSrc("images/Detail_Business_Card.png");
		oUserImage.setTooltip(rs.getText("SeeUserDetailInfomation"));
		oUserImage.addStyleClass("rsHeaderUserImage");
		
		oUserImage.attachPress(this._showUserInfo, this);

		var oHLayout = new sap.ui.commons.layout.HorizontalLayout(this.createId("HeaderDataNameHLayout"), {
		        content: [oHeaderName, oUserImage]
		});
		
		this.headPart.removeContent(oHeaderName);
		this.headPart.addContent(oHLayout,{
			left : "0px",
			right : "0px",
			top : "0px"
		});
	},

	_showUserInfo:function(oEvent){		
  	  
		var node = rs.model.HierMng.getHierNodeById(this.getRsHierId());

		this._userId  = node.ResponsibleUser;
		
		if(this._userId != ''){
			var status = rs.model.ModelMng.getUserProfileStatus(this._userId);
			if(status == rs.LoadStatus.NotStart){
				rs.util.Util.showBusyIndicator();
				rs.model.ModelMng.loadUserProfileById(this._userId,this._loadUserDataSuccCB, this._loadUserDataFailCB,this,null);
			}
			else if(status == rs.LoadStatus.Pending){
				rs.util.Util.showBusyIndicator();
			}
			else if(status == rs.LoadStatus.Succ){
				this._loadUserDataSuccCB(this._userId);
			}
			else if(status == rs.LoadStatus.Fail){
				this._loadUserDataFailCB();
			}
		}
		else{
			this._showUserInfoUnAvailable(oEvent);
		}
		
	},
	
	_loadUserDataSuccCB:function(){
		rs.util.Util.hideBusyIndicator();
		var profile = rs.model.ModelMng.getUserProfile(this._userId);
		var name = profile.Name;
		var email = profile.Email;
		var phone = profile.Telephone;
		var mobilePhone = profile.MobilePhone;
		var photoType =  profile.PhotoType;
		var photoData = profile.PhotoData;
		
	
		var imgElement = jQuery.sap.domById(this.createId("userInfoImageId"));
		
		var strHtml = '<div class = "userInformation arrow_box_left">';
		
		var strImei =  rs.util.Util.getMimeByFileExtension(photoType);
		if((photoData == '') || (undefined == strImei))
		{
			strHtml += '<img class = "userImage" src="images/Business_Card_Silhouette.png"/>';
		}
		else
		{
			strHtml += '<img class = "userImage" src="data:'+ strImei + ';base64,' + photoData + '"/>';
		}
		
		strHtml += '<div class = "userData">';
		strHtml += '<div> <button class = "dummy_button">' + name + '</button> </div>';
		strHtml += '<div>' +  rs.getText("MobilePhone") + ':  ' + mobilePhone + '</div>';
		strHtml += '<div>' +  rs.getText("Phone") + ':  ' + phone + '</div>';
		strHtml += '<div> <a href=mailto:' + email + '>' +  rs.getText("Email") + ':  ' + email + '</a> </div>';
		strHtml += '</div>';
		strHtml += '</div>';
		
		
		var oHTML = new sap.ui.core.HTML();	
		oHTML.setContent(strHtml);			
		
		function popupClosed()
		{
			oHTML.destroy();
		}
		
		var popup = new sap.ui.core.Popup(oHTML, false, true, true);
		
		popup.attachClosed(popupClosed);
		
		popup.open(0, sap.ui.core.Popup.Dock.LeftCenter , sap.ui.core.Popup.Dock.CenterCenter , imgElement, "30, 0");		
		
	},
	
	_loadUserDataFailCB:function(error){
		rs.util.Util.hideBusyIndicator();
		//alert("get user profile data fail!");
		rs.util.Util.showErrorMessage(null, error, null, null);	
	},
	
	_showUserInfoUnAvailable:function(oEvent){
		
		var imgElement = jQuery.sap.domById(this.createId("userInfoImageId"));
		
		var strHtml = '<div class = "userInformation arrow_box_left">';
		strHtml += '<div> <img class = "userImage" src="images/Business_Card_Silhouette.png"> </div>';
		strHtml += '<div class = "userData"> <button class = "dummy_button">' +  rs.getText('NoInfomationAvailable') + '</button></div>';
		strHtml += '</div>';
		
		var oHTML = new sap.ui.core.HTML();	
		oHTML.setContent(strHtml);			
		
		function popupClosed()
		{
			oHTML.destroy();
		}
		
		var popup = new sap.ui.core.Popup(oHTML, false, true, true);
		
		popup.attachClosed(popupClosed);
		
		popup.open(0, sap.ui.core.Popup.Dock.LeftCenter , sap.ui.core.Popup.Dock.CenterCenter , imgElement, "30, 0");	
	},
	
	//==private internal member 
	_oSBBudgetSpend : null,
	_oSBViewType : null,

	//===some constant text id
	BtnBudget : 'btn_budget',
	BtnSpend : 'btn_spend',

	_oViewMng:  null,
	//two tree table
	_oBarTreeTable: null,
	_oTextTreeTable: null,
	
	//two bar column
	_oColumnBudgetRatioBar: null,
	_oColumnSpendingBar: null,
	
	
		
	_oBarTableToolbar : null,
	_oTextTableToolbar : null,
	
	_userId:null,	
	_oLineItemView:  null,
	_oTrendView: null
});
