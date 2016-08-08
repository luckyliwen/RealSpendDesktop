
/**
 * In order to reuse the common framework of SAPUI5 (such as auto generate the setXX/getXX, here we extend a view from the sap.ui.core.mvc.JSView
 */
jQuery.sap.declare("rs.view.LineItem");
jQuery.sap.require("rs.view.HierBaseView");
//jQuery.sap.require("sap.ui.core.Control");

//sap.ui.jsview("rs.view.HierOverView", {
rs.view.HierBaseView.extend("rs.view.LineItem", {
	metadata : {
		//Here in order to avoid name conflict, we add rs to the property name
		properties : {
			'oldHierId' : 'string',  //The old hier id of last time display
			'oldByHierId' : 'string',  //The old byhier id of last time display
			
			"rsHierId":   'string',
			"rsByHierId":	'string',
			"rsHierType" : "string",
			"total": 'string',
			"variance":'string',
			"variancePercentage": 'string',
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
	
	/**
	 * Save the new byHier id and the old byHier id will became the oldByHierId
	 * @param id
	 */
	setRsByHierId: function( id ) {
		//need first save the old id 
		var oldId = this.getRsByHierId();
		this.setProperty('rsByHierId', id);
		this.setOldByHierId( oldId);
	},
	
	//Just reuse the JSView is enough
	renderer: 'sap.ui.core.mvc.JSViewRenderer',

	getControllerName: function() {
		return "rs.controller.LineItem";
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
	



	createContentImpl : function(oController) {

		var headPart = rs.view.Help.createHeaderData(this.getId());

		headPart.setWidth('100%');
				
		this._oContentLayout = this.createContentLayout();		

		this._oTableToolbar = this._createTableToolbar(oController);
		this._oTreeTable = this.createTreeTable(oController);
		var parentCell = sap.ui.getCore().byId(this.createId( 'contentCell'));
		parentCell.addContent(this._oTreeTable);						
		this._oTreeTable.setWidth('100%');
		
		var oBoxSizeInfoTextView = new rs.cfg.Control.Text({
			enabled: false,
			textAlign : "Right"
		});
		
		oBoxSizeInfoTextView.setText(rs.view.Help.formatBoxSizeHintText(rs.getText("TableValueCurrencyHint")));

		this._oBoxSizeInfoTextView = oBoxSizeInfoTextView;
		
		var oSwitchLayout = new sap.ui.commons.layout.AbsoluteLayout(this
				.createId('switch_toolbar'), {
			height : this.SwitchToolbarHeightPx
		}).addStyleClass("switch_toolbar");

		oSwitchLayout.addContent(oBoxSizeInfoTextView,{
			right : "5px",
			top : "30px"
		});
		
		//Later need add some space
		this._oMainLayout = new sap.ui.commons.layout.VerticalLayout(this
				.createId('mainVerticalLayout'), {
			//
			content : [ headPart,oSwitchLayout, this._oContentLayout ]
		}).addStyleClass("mainVerticalLayout");
		this._oMainLayout.setWidth('100%');

		return this._oMainLayout;
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

	createTreeTable : function(oController) {
		//create the columns
		var aCols = [ 
		    {label : "{i18n>ExpenseAccount}",}, 
		    {label : "{i18n>Description}",}, 
		    {label : rs.getText("Department")+"/"+rs.getText("Project"),},		    
		    {label : "{i18n>Status}",}, 
		    {label : "{i18n>Date}",}, 
		    {label : "{i18n>Amount}",}, 
		    {label : "{i18n>ATTACHMENT}",},
		    ];

		
		//the following code just set the each column width ratio,
	    var flexiableWidthRatio = [2,2,2,2,2,2,0.7];	//for "ExpenseAccount", "Description","Department/Project", "Status", "Date","Amount","ATTACHMENT"
	    var total = 0;
	    for(var i=0 ;i <flexiableWidthRatio.length;i++){
	    	total += flexiableWidthRatio[i];
	    }
	    
	    var columns = [];		
		$.each(aCols, function(idx, ele) {
			columns.push(new sap.ui.table.Column({
				label : ele.label,
				width: flexiableWidthRatio[idx]*100/total +"%"
			}));
		});

		var oTable = new rs.cfg.Control.TreeTable(this.createId('TreeTable'), {
			title: "{i18n>LineItems}",
			rowHeight: 39,
			selectionMode : sap.ui.table.SelectionMode.None,
			selectionBehavior:sap.ui.table.SelectionBehavior.RowOnly,
			showNoData:false,
			allowColumnReordering : false,
			expandFirstLevel : true,
			columns: columns,
			toolbar: this._oTableToolbar
		}).addStyleClass("lineItemTreeTable");


		oTable.setWidth('100%');
		
		//oData?, fnFunction, oListener, here must set this is the oListener
		oTable.attachToggleOpenState( oController.onToggleOpenState, oController);
		
		return oTable;
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
		this.setActiveTable(this._oTreeTable);
		
		//Now know the height, so can adjust table height
		this.adjustTreeTableHeight(this._oTreeTable);
		
		//set legend mode
		this.setLegendMode(rs.view.LegendMode.Empty);
		
		this._bindTableColumnsTemplate();
		
		rs.cfg.Cfg.addChangeListener(controller.onConfigChanged,controller,null);		
	},

	/*if user changed the time period setting, then the Id should be cleared, so if re-enter the detail,
	 * will update the screen with the new data, */
	clearId:function(){
		this.setRsHierId("");
		this.setRsByHierId("");
	},
	
	
	onResize:function(){
		
		this.calculateMainContentWidthHeight();
		this.adjustTreeTableHeight(this._oTreeTable);
	},	
	
	_refreshScreenForCfgChanged:function(){

		this._oBoxSizeInfoTextView.setText(rs.view.Help.formatBoxSizeHintText(rs.getText("TableValueCurrencyHint")));
		
		this._oTreeTable.invalidate();
		
		this._updateHeaderData();
	},	


	_updateHeaderData:function(){

		var oHeaderName = sap.ui.getCore().byId(this.getId() +'--headerDataName');
		
		var hierIdName = rs.model.HierMng.getNameById(this.getRsHierId());
		var byHierIdName = rs.model.HierMng.getNameById(this.getRsByHierId());

		oHeaderName.setText(hierIdName + " "+"\u2014"+" "+ byHierIdName);		
		
		var oHeaderSpend = sap.ui.getCore().byId(this.getId() +'--headerDataSpend');	
		
		oHeaderSpend.setText(rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(this.getTotal())+" " + rs.getText("Spent"));

		var oHeaderDiff = sap.ui.getCore().byId(this.getId() +'--headerDataDiff'); 				
		var contentParameter = "<div  style='position:relative;font-size:15px; textAlign:right; color:";			

		var	color = rs.view.getColorByVariancePercentage(this.getVariancePercentage(),this.getTotal());

		var variancePercentageFormat = rs.view.Help.formatVariancePercentage(this.getVariancePercentage());			
		
		var content = contentParameter + color+ ";\'>"+ rs.cfg.Cfg.getCurrency() + 
						rs.util.Util.commaSplit(Math.abs(this.getVariance()))+variancePercentageFormat+ "</div>";
		
		oHeaderDiff.setContent(content);
		
		var leftOver = this.getVariance() >=0?rs.getText("Left") : rs.getText("Over");
		var oHeaderLeftOrOver = sap.ui.getCore().byId(this.getId() +'--headerDataLeftOrOver'); 
		oHeaderLeftOrOver.setText(leftOver);	
		
		var oHeaderYearofDate = sap.ui.getCore().byId(this.getId() +'--headerDataYearofDate');
		
		oHeaderYearofDate.bindText(rs.view.Help.getTimePeriod(),rs.view.Help.formatTimePeriod);
	},
	
	_dateFormat:function(oValue){
		if(oValue != null){
			var year = oValue.substr(0,4);
			var month = oValue.substr(4,2);
			var date = oValue.substr(6,2);
			return month +"/"+date+"/"+year;
		}
		else{
			return "";
		}
	},

	_bindTableColumnsTemplate:function(){
		var nameTextView = new rs.cfg.Control.Text({enabled: false}); 
		var textView1= new rs.cfg.Control.Text({enabled: false});
		var textView2= new rs.cfg.Control.Text({enabled: false});
		var textView3= new rs.cfg.Control.Text({enabled: false});
		var textView4= new rs.cfg.Control.Text({enabled: false});
		var textView5= new rs.cfg.Control.Text({enabled: false});
		
		var that = this;
		var attachmentNum = new rs.uilib.AttachmentNumber();
		attachmentNum.attachPress(function(oEvent){
			that._showAttachmentList(oEvent);
		});
		
		
		nameTextView.bindProperty("text", "Name");

		var wrapper = new rs.uilib.LoadingWrapper( {
			text : "{Name}"
		});

		wrapper.addContent(nameTextView);


		wrapper.bindProperty('loadingStatus', 'loading',
				function( oValue) {
					//var context = this.getBindingContext();
					
					if (oValue == undefined) {
						return false;
					} 
					return oValue;
				}
			);
		var that = this; 
		textView1.bindProperty("text", "Description");
		textView2.bindProperty("text", "CostCenterName");
		textView3.bindProperty("text", "TypeText");
		textView4.bindProperty("text", "PostingDateString",that._dateFormat);
		textView5.bindProperty("text", "Amount",function(oValue){
			return rs.util.Util.numericPrecisonFormat(Math.abs(oValue));
		});

		
		attachmentNum.bindProperty("count","AttachmentNumber",function(oValue){

			return oValue;
		});		
		
		this._oTreeTable.getColumns()[0].setTemplate(wrapper);
		this._oTreeTable.getColumns()[1].setTemplate(textView1);
		this._oTreeTable.getColumns()[2].setTemplate(textView2);
		this._oTreeTable.getColumns()[3].setTemplate(textView3);
		this._oTreeTable.getColumns()[4].setTemplate(textView4);
		this._oTreeTable.getColumns()[5].setTemplate(textView5);
		this._oTreeTable.getColumns()[6].setTemplate(attachmentNum);
		
	},

	_attachmentOverlayClosed: function(){
		this._attachmentOverlay.destroyContent();
		this._attachmentOverlay = null;
	},


	_showAttachmentContentView:function(){
		var attachmentContent = rs.model.ModelMng.getAttachmentContent(this._attachmentList[this._attchmentIndex].AttachmentID);
		
		//console.log("===_showAttachmentContentView ===");
		
		var oOverlayContainer = new sap.ui.ux3.OverlayContainer({openButtonVisible:false, closeButtonVisible:true});
		
		
		
		if('text/plain' == this._attachmentMime)
		{
			var oHTML = new sap.ui.core.HTML();
			//var strHtml = '<object data='+ '\"data:'+ this._attachmentMime +';charset=unicode;base64,' + attachmentContent +'"  type="'+ this._attachmentMime +'\" ></object>';	
			var strHtml = '<object data='+ '\"data:'+ this._attachmentMime +';charset=utf-8;base64,' + attachmentContent +'"  type="'+ this._attachmentMime +'\" ></object>';
			var element = $(strHtml);
		
			oHTML.setDOMContent(element);		
			oOverlayContainer.addContent(oHTML);		
							
		}
		else if(-1 != this._attachmentMime.indexOf("image"))
		{
			var imgsrc = 'data:' + this._attachmentMime + ';base64,' + attachmentContent;
			oImage = new sap.ui.commons.Image();
			oImage.setSrc(imgsrc);
			//oImage.setHeight("100%");
			//oImage.setWidth("100%");			
			var strHtml = '<object width=100% height=100% data='+ '\"data:'+ this._attachmentMime +';base64,' + attachmentContent +'"  type="'+ this._attachmentMime +'\" ></object>';
			oOverlayContainer.addContent(oImage);		
		}
		else
		{
			var oHTML = new sap.ui.core.HTML();
			var strHtml = '<object width = 100% height = 100% data='+ '\"data:'+ this._attachmentMime +';base64,' + attachmentContent +'"  type="'+ this._attachmentMime +'\" ></object>';	
			var element = $(strHtml);
		
			oHTML.setDOMContent(element);		
			
			oOverlayContainer.addContent(oHTML);		
			
		}		

		oOverlayContainer.open();

		this._attachmentOverlay = oOverlayContainer;
		
		var me = this;
		
		oOverlayContainer.attachClose(function(oControlEvent) 
		{
			me._attachmentOverlayClosed; 
		});
		
		
	},

	_attachmentContentLoadSuccCB: function(){
		this._attachObject.stopLoadingSpin();
		this._showAttachmentContentView();
	},

	_attachmentContentLoadFailCB: function(){
		this._attachObject.stopLoadingSpin();
	},


	_showAttachmentContent: function(attachmentID){

		this._attchmentIndex = -1;
		
		for(var i=0; i<this._attachmentList.length; i++)
		{
			if(attachmentID == this._attachmentList[i].AttachmentID)
			{
				this._attchmentIndex = i;
				break;
			}
		}
		
		rs.assert((-1 != this._attchmentIndex), 'AttachmentID is not valid!');		

		this._attachmentMime = rs.util.Util.getMimeByFileExtension(this._attachmentList[this._attchmentIndex].FileExtension);

		//console.log("=== _showAttachmentContent. id: ", attachmentID, "ext: ", this._attachmentList[this._attchmentIndex].FileExtension);

		if(undefined == this._attachmentMime)
		{
			//alert("unsupported file type");
			rs.util.Util.showPopup(null, rs.getText("UnsupportedFileType"), null, null);
			return;
		}
		
		var status = rs.model.ModelMng.getAttachmentContentStatus(attachmentID);
		
		if(rs.LoadStatus.NotStart == status)
		{
			rs.model.ModelMng.loadAttachmentContentById(attachmentID, this._attachmentContentLoadSuccCB, this._attachmentContentLoadFailCB, this, null);
			this._attachObject.showLoadingSpin();
			
		}
		else if (rs.LoadStatus.Succ == status)
		{
			this._showAttachmentContentView();
		}
				
	},

	_showAttachmentListView : function(){
		
		var attachmentList = rs.model.ModelMng.getAttachmentList(this._attachmentPath);
		
		this._attachmentList = attachmentList;
		
		var strDom = '<div class = "attachmentList arrow_box_right">';
		
		var count = attachmentList.length;
		
		strDom += '<div class ="attachment_title_area"> <div class="attachment_title_content">' + rs.getText('ATTACHMENT') + '(' + count +   ')</div></div>';
		
		var me = this;		
				
		for(var i=0; i<count; i++)
		{
			var id = attachmentList[i].AttachmentID, ext = attachmentList[i].FileExtension;
			
			var fSize = new Number(attachmentList[i].FileSize);
			
			if(fSize < 1024)
			{
				strSize = fSize + 'B';
			}
			else
			{
				strSize =  rs.util.Util.numericPrecisonFormat(fSize/1024) + 'KB';
			}
			
			var strFilename = attachmentList[i].FileName + '.' + ext;
			
			var listDom = '<button class = "attachment_item" id="' + id + '" title = "' + strFilename + '">';
			listDom += strFilename + '<br/>' + strSize + ' </button>';
			
			strDom += listDom;
		}
		
		strDom += '</div>'; 
		
		
		var oHTML = new sap.ui.core.HTML();	
		oHTML.setContent(strDom);			
		
		function popupClosed()
		{
			oHTML.destroy();
		}
		
		var popup = new sap.ui.core.Popup(oHTML, false, true, true);
		
		popup.attachClosed(popupClosed);
		
		var arrowOffset = "-25, 0"; /* arrow width 25px */
		
		popup.open(0, sap.ui.core.Popup.Dock.RightCenter , sap.ui.core.Popup.Dock.CenterCenter  , this._attachmentElement, arrowOffset);
		
		for(var i=0; i<count; i++)
		{
			$('#' + attachmentList[i].AttachmentID).click(function(eventObj) {
				me._showAttachmentContent(eventObj.target.id);
			});
		}		
		
	},

	_attachmentListLoadSuccCB: function(){
		this._attachObject.stopLoadingSpin();
		this._showAttachmentListView();
	},

	_attachmentListLoadFailCB: function(){
		this._attachObject.stopLoadingSpin();
	},


	_showAttachmentList: function(oEvent){
		
		var attachObj = oEvent.getParameters().object;
		
		var element = $('#' + attachObj.getId());
		
		var path = attachObj.getBindingContext().sPath;
		
		this._attachObject = attachObj;
		this._attachmentPath = path;
		this._attachmentElement = element;
		
		var status = rs.model.ModelMng.getAttachmentListStatus(path);
		

		if(rs.LoadStatus.NotStart == status)
		{
			
			this._attachObject.showLoadingSpin();
			rs.model.ModelMng.loadAttachmentListByPath(path, this._attachmentListLoadSuccCB, this._attachmentListLoadFailCB, this, null);
			
		}
		else if (rs.LoadStatus.Succ == status)
		{
			this._showAttachmentListView();
		}
		
	},
	
	_attachmentOverlay: null,
	_attachmentList: null,
	_attchmentIndex: -1,
	_attachObject: null,
	_attachmentMime: null,
	_attachmentElement: null,
	_attachmentPath: null,
	
	_oTreeTable : null,
	_oModelInfo : null,

	_oTableToolbar : null,
	
});
