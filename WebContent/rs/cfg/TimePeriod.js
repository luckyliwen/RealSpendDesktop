rs.cfg.g_timePeriodDialog = null;

/**
 * this will open the time period dialog
 */
rs.cfg.onTimePeriodClicked = function() {
	if(!rs.cfg.g_timePeriodDialog)
	{
		rs.cfg.g_timePeriodDialog = new rs.cfg.TimeDialog("DialogTimePeriod",{
			width  : "600px",
			height : "400px",
			title  : "{i18n>TimePeriod}",
			modal  : true,
			data   : rs.cfg.CfgValue.clone()
		});
		rs.cfg.g_timePeriodDialog.doInit();
		
		rs.cfg.g_timePeriodDialog.open();
		rs.cfg.g_timePeriodDialog.setFocus(
				rs.cfg.g_timePeriodDialog._getCurrentId()
		);
	}
	else{
		rs.cfg.g_timePeriodDialog.reOpen(rs.cfg.CfgValue.clone());
	}
	if(rs.cfg.CfgValue.TimePeriod!=rs.cfg.TimePeriod.OTH)
	{
		$("#TimeLayout").css("visibility","hidden");
	}
	else
		$("#TimeLayout").css("visibility","visible");
};

sap.ui.commons.Dialog.extend("rs.cfg.TimeDialog",{
    metadata : 
    {                            
          properties : 
          {
                          "data" : "object",
          },     
   }, 
   
   /**
    * this function reopen the time period dialog
    * @param data : the cfg data get from rs.cfg.CfgValue
    */
   reOpen : function(data){
	  this.cfgData = data;  //get data from local storage
	//  this.oTimeLayout.removeAllRows();   
	  
	  //set default time mode
	  var selectIndex = null;
	  switch(this.cfgData.TimePeriod)
	  {
	  case rs.cfg.TimePeriod.Y2D:
		  selectIndex = 0;
		  break;
	  case rs.cfg.TimePeriod.Q2D:
		  selectIndex = 1;
		  break;
	  case rs.cfg.TimePeriod.M2D:
		  selectIndex = 2;
		  break;
	  case rs.cfg.TimePeriod.OTH:
		  selectIndex = 3;
		  this._initOther();
		  break;
	  }	
		this.oTimeRBG.setSelectedIndex(selectIndex);
		
		//open dialog
		rs.cfg.g_timePeriodDialog.open();
		this.setFocus(this._getCurrentId());
   },
   
   /**
    * this will init the time period dialog 
    */
   doInit: function(){	   
       this.cfgData  = this.getData();  //get data from local storage	 
       this.oTimeRBG = this._initRadioButton();  
	   this.addContent(this.oTimeRBG);
	    
	   // add ok and cancel button
	   var that = this;
		var oButtonOkTime = new sap.ui.commons.Button(
				"BtnOkTime",
				{
					text  : "{i18n>SetOk}",
					press : [this._onButtonOk,this]
				});
		this.addButton(oButtonOkTime);

		var oButtonCancelTime = new sap.ui.commons.Button(
			   "BtnCancelTime", {
				   text  : "{i18n>SetCancel}",
				   press : function() {
					   that.close();
				   }
			   });
		this.addButton(oButtonCancelTime);
		
		//init two layout
		this.oTimeLayout = new sap.ui.commons.layout.MatrixLayout(
				"TimeLayout",
				{
					width  : "500px",
					height : "150px",
				});
	   this.addContent(this.oTimeLayout);
	   this.oRightLayout = new sap.ui.commons.layout.AbsoluteLayout("OtPright");
		
	   //create time tree node
	   this.oTimeTree = new sap.ui.commons.Tree(
			   "TimeTree",
			   {
				   height     : "146px",
				   width      : "120px",
				   showHeader : false,
			   });
	   this.oTimeTree.attachSelect(function(oEvent) {		
		   that._showDetailTime(oEvent.getParameter("node").getId());
	   });
	   var	aTreeNode = [ {
			id   : "Year",
			text : "{i18n>Year}"
		}, {
			id   : "Quarter",
			text : "{i18n>Quarter}"
		}, {
			id   : "Month",
			text : "{i18n>Month}"
		} ];	
	   $.each(aTreeNode,function(idx,ele) {
		   that.oTimeTree.addNode(new sap.ui.commons.TreeNode(
				   ele.id,
				   {
					   text : ele.text
				   }));
	   });		
	   
	   //init default time mode part
	   this.oYearRBG    = this._createYearRBG();
	   this.oQuarterRBG = this._createQuarterRBG();
	   this.oMonthRBG   = this._createMonthRBG();
	   this._showDetailTime(this._getCurrentId());
	   this.oTimeLayout.createRow(this.oRightLayout);
	   this.oTimeLayout.createRow(this.oTimeTree);
   },
   
   /**
    * this will save the time period data and inform the view to change
    */
   _onButtonOk:function(){
		this.close();
		this.CfgChanged = rs.cfg.CfgValue.compare(this.cfgData);
		if (this.CfgChanged.length != 0) {
			this.CfgChanged = rs.cfg.CfgValue
			.compare(this.cfgData);
			rs.cfg.CfgValue = this.cfgData;							
			rs.cfg.CfgValue.save();
			rs.cfg.Cfg.onCfgChanged(this.CfgChanged);
		}
   },
   
   /**
    * this will get the currend selected tree node's Id
    * @returns currentId
    */
   _getCurrentId:function(){
	   var currentId = null;
	   switch(this.cfgData.OtherTimePeriod)
	   {
	   case rs.cfg.OtherTimePeriod.Year:
		   currentId = "Year";
		   break;
	   case rs.cfg.OtherTimePeriod.Quarter:
		   currentId = "Quarter";
		   break;
	   case rs.cfg.OtherTimePeriod.Period:			
		   currentId = "Month";
		   break;
	   }
	   return currentId;
   },
   
   /**
    * this will recreate three radio button group 
    */
   _initOther:function(){
   this.oYearRBG    =  this._createYearRBG();
   this.oQuarterRBG =  this._createQuarterRBG();
   this.oMonthRBG   =  this._createMonthRBG();
   this._showDetailTime(this._getCurrentId());
   },
   
   /**
    * this will show the detail time by selected tree node Id
    * @param currentId		: the selected tree node Id
    */
   _showDetailTime:function(currentId){
	   this.oRightLayout.removeAllContent();
	   var content = null;
	   var selectNode = null;
	   this.setFocus(currentId);
	   switch (currentId) {
	   case "Year":
		   content = this.oYearRBG;
		   selectNode = 0;
		   this.oRightLayout.addContent(content,{
			   left : "50px",
			   top  : "30px"
		   });
		   this.cfgData.OtherTimePeriod = rs.cfg.OtherTimePeriod.Year;
		   break;
	   case "Quarter":
		   content = this.oQuarterRBG;
		   selectNode = 1;
		   this.oRightLayout.addContent(content,{
			   left : "50px",
			   top  : "20px"
		   });
		   this.cfgData.OtherTimePeriod = rs.cfg.OtherTimePeriod.Quarter;
		   break;
	   case "Month":
		   content = this.oMonthRBG;
		   selectNode = 2;
		   this.oRightLayout.addContent(content,{
			   left : "20px",
			   top  : "20px"
		   });
		   this.cfgData.OtherTimePeriod = rs.cfg.OtherTimePeriod.Period;
		   break;
	   default:
		   alert("Default Error!");
	   break;
	   }
	   this.oTimeTree.getNodes()[selectNode].setIsSelected(true);
	   this.cfgData.DetailTime = content.getSelectedItem().getKey();

   },
   
   /**
    * this will add the css triangle style for selected tree node
    * @param currentId		: the selected tree node Id
    */
   setFocus:function(currentId){
	   var currentNode = null;
	   switch(this.cfgData.OtherTimePeriod){
	   case rs.cfg.OtherTimePeriod.Year:
		   currentNode = "#Year";
		   break;
	   case rs.cfg.OtherTimePeriod.Quarter:
		   currentNode = "#Quarter";
		   break;
	   case rs.cfg.OtherTimePeriod.Period:
		   currentNode  = "#Month";
		   break;
	   }

	   $(currentNode).removeClass("timeArrow");
	   $("#"+currentId).addClass("timeArrow");

   },
   
   /**
    * this will create radio button group for year
    * @returns {sap.ui.commons.RadioButtonGroup}
    */
   _createYearRBG:function(){
	   //create radio button group
	  var that = this;
	  var oYearRBG = new sap.ui.commons.RadioButtonGroup({
		  select : function() {
			  that.cfgData.DetailTime=this.getSelectedItem().getKey();
		  } 
	  });
	  oYearRBG.addStyleClass("YearRBG");
	  //create radio button item
	  var	aButtonYear = [ {
		  text : "CurrentFiscalYear",
		  key  : rs.cfg.Year.ThisYear,
	  }, {
		  text : "LastFiscalYear",
		  key  : rs.cfg.Year.LastYear,
	  } ];
	  $.each(aButtonYear,function(idx,ele){
		  oYearRBG.addItem(new sap.ui.core.Item({
			  text : rs.getText(ele.text),
			  key  : ele.key
		  }));
		  if(ele.key == that.cfgData.DetailTime)
			  oYearRBG.setSelectedIndex(idx);
	  });
	  return oYearRBG;
   },
   
   /**
    * this will create radio button group for quarter
    * @returns {sap.ui.commons.RadioButtonGroup}
    */
   _createQuarterRBG:function(){
	   //create radio button group
	   var that=this;
	   var oQuarterRBG = new sap.ui.commons.RadioButtonGroup({
		   select : function() {
			   that.cfgData.DetailTime=this.getSelectedItem().getKey();
		   } 
	   });
	   oQuarterRBG.addStyleClass("QuarterRBG");
	   //create radio button item
	   var aButtonQuarter = [ {
		   text : rs.getText('Q1') + " ",
		   key  : rs.cfg.Quarter.Q1,
	   }, {
		   text : rs.getText('Q2') + " ",
		   key  : rs.cfg.Quarter.Q2,
	   }, {
		   text : rs.getText('Q3') + " ",
		   key  : rs.cfg.Quarter.Q3,
	   }, {
		   text : rs.getText('Q4') + " ",
		   key  : rs.cfg.Quarter.Q4,
	   } ];
	   	   
	   var currentQuarter = rs.util.Util.getCurrentQuarter();
	   var fiscalYear     = rs.model.GeneralParam.getFiscalYear();
	   $.each(aButtonQuarter,function(idx,ele){
		   if(idx<(parseInt(currentQuarter/3,10)+1))
			   oQuarterRBG.addItem(new sap.ui.core.Item({
				   text : rs.getText(ele.text)+fiscalYear,
				   key  : ele.key
			   }));
		   if(ele.key == that.cfgData.DetailTime)
			   oQuarterRBG.setSelectedIndex(idx);
	   });
	   return oQuarterRBG;
   },
   
   /**
    * this will create radio button group for month
    * @returns {sap.ui.commons.RadioButtonGroup}
    */
   _createMonthRBG:function(){
	   //create radio button group
	   var that = this;
	   var oMonthRBG = new sap.ui.commons.RadioButtonGroup({
		   columns : 3,
		   select  : function(){
			   that.cfgData.DetailTime=this.getSelectedItem().getKey();
		   }
	   });
	   oMonthRBG.addStyleClass("MonthRBG");
	   //create radio button item
	   aMonth  = [];
	   var key = null;
	   for (var i = 1;i<13;i++) {
		   key = rs.cfg.Month[ 'm' + i];
		   aMonth.push(
				   {
					   text : rs.util.Util.getMonthText(key)+" ",
					   key  : key
				   });
	   }
	   var currentPeriod = rs.model.GeneralParam.getPeriod();
	   var fiscalYear     = rs.model.GeneralParam.getFiscalYear();
	   $.each(aMonth,function(idx,ele){
		   if(idx<parseFloat(currentPeriod))
		   {	
			   oMonthRBG.addItem(new sap.ui.core.Item({
				   text : rs.getText(ele.text)+fiscalYear,
				   key  : ele.key
			   }));
		   }
		   if(ele.key==that.cfgData.DetailTime)
			   oMonthRBG.setSelectedIndex(idx);
	   });
	   return oMonthRBG;
   },
   
   /**
    * this will create radio button group for time period
    * @returns {sap.ui.commons.RadioButtonGroup}
    */
   _initRadioButton:function(){
	   //create radio button group
	   var that = this;
	   var oTimeRBG = new sap.ui.commons.RadioButtonGroup({
		   select : function() {
			   that.cfgData.TimePeriod=this.getSelectedItem().getKey();
			   if(that.cfgData.TimePeriod==rs.cfg.TimePeriod.OTH)
			   {   
				   that._showDetailTime(that._getCurrentId());
				   $("#TimeLayout").css("visibility","visible");
			   }
			   else
			   {
				   $("#TimeLayout").css("visibility","hidden");
			   }
		   } 
	   });
	   oTimeRBG.addStyleClass("TimeRBG");
	   //create radio button item
	   var  aTimePeriod = [ {
			text : "YearToDate",
			key  : rs.cfg.TimePeriod.Y2D
	   }, 
		{
			text : "QuarterToDate",
			key  : rs.cfg.TimePeriod.Q2D
		}, 
		{
			text : "MonthToDate",
			key  : rs.cfg.TimePeriod.M2D
		},{
			text : "OtherTime",
			key  : rs.cfg.TimePeriod.OTH
		} ];
	   $.each(aTimePeriod,function(idx,ele){
		   oTimeRBG.addItem(new sap.ui.core.Item({
			   text:rs.getText(ele.text),
			   key: ele.key
		   }));
		   if(that.cfgData.TimePeriod==ele.key)
			   oTimeRBG.setSelectedIndex(idx);
	   });
	   return oTimeRBG;
   },
   
   renderer: 'sap.ui.commons.DialogRenderer',
   
   cfgData      : null,           // the cfg data load from local storage
   oTimeLayout  : null,           // main layout for other time period
   oRightLayout : null,           // right part of main layout
   oTimeRBG     : null,           // radio button for time
   oYearRBG     : null,           // radio button group for year
   oQuarterRBG  : null,           // radio button group for quarter
   oMonthRBG    : null,           // radio button group for month
   oTimeTree    : null,           // tree node for time
   CfgChanged   : null,           // collection of changed item
   
});


rs.cfg.TimePeriods = {
		disable : function() {
			this._count++;
			$("#rs_calendar").mouseover(function () {
				$(this).css("cursor","not-allowed");
			});
			$('#rs_calendar').unbind('click');
		},
		enable : function(){
			this._count--;
			if(this._count == 0){
				this.reset();
			}
		},
		
		reset : function(){
			this._count = 0;
			$("#rs_calendar").mouseover(function () {
				$(this).css("cursor","pointer");
			});
			$('#rs_calendar').bind('click', $.proxy(rs.cfg.onTimePeriodClicked, rs.cfg));
		},
		_count : 0
};