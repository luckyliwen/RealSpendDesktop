rs.cfg.g_settingDialog = null;
sap.ui.commons.Dialog.extend("rs.cfg.SetDialog",{
    metadata : 
    {                            
          properties : 
          {
                          "data" : "object",
          },     
   }, 
   
   reOpen : function(data){
	   this.open();
	   this.cfgData = data;
	   //this.oColorWidSlider.destroy();
	   //this._reSetLayout();	
	   this._chooseNode(this.currentNode);   
   },
   
   _reSetLayout : function(){
		this.oColorLayout      = this._createColor();
		this.oCurrencyLayout   = this._createCurrency();
		this.oNumericLayout    = this._createNumeric();
		this.oConnectionLayout = this._createConnection();
		this.oFeedBackLayout   = this._createFeedBack();
		this.oThemeLayout      = this._createTheme();
   },
   
   doInit : function(){
	   
	   //create overview layout
	    this.cfgData = this.getData();
		this.oRightlayout = new sap.ui.commons.layout.AbsoluteLayout("rightlayout",
				{width:"100%",height:"100%"});
		var oMainlayout   = new sap.ui.commons.layout.AbsoluteLayout(
				"mainlayout", {
					width  : "95%",
					height : "95%"
				});				
		oMainlayout.addContent(this.oRightlayout,{left:"210px"});
		oMainlayout.addContent(this._createTree());
		this.addContent(oMainlayout);
		
	   //create tree node layout	
		this.oAboutLayout      = this._createAbout();
		this.oTermsLayout      = this._createTerms();
		this.oColorLayout      = this._createColor();
		this.oCurrencyLayout   = this._createCurrency();
		this.oNumericLayout    = this._createNumeric();
		this.oConnectionLayout = this._createConnection();
		this.oFeedBackLayout   = this._createFeedBack();
		this.oThemeLayout      = this._createTheme();

		//add two buttons
		var oButtonOk = new sap.ui.commons.Button(
				"BtnOk",
				{
					text :"{i18n>SetOk}",
					press :[this._onButtonOk,this]
				});
		this.addButton(oButtonOk);	
 
		var oButtonCancel = new sap.ui.commons.Button(
				"BtnCancel", {
					text : "{i18n>SetCancel}",
					press : [function() {
						this.close();
					},this]
				});
		this.addButton(oButtonCancel);
		
		//set default tree node
		this._chooseNode( this.currentNode);
   },
   
   _onButtonOk : function(){
		this.close();
		
		
		var changedEvent = rs.cfg.CfgValue.compare(this.cfgData);
		
		if ( changedEvent.length != 0) {
			rs.cfg.CfgValue = this.cfgData;
			rs.cfg.CfgValue.save();
			
			//?? Use a timeout to schedule the call back, otherwise it have long delay to close the dialog
			rs.cfg.Cfg.onCfgChanged( changedEvent);
		}
   },
   
   _createTree : function(){	   
	   //create tree node	
		var aTreeNode = [ "About"             ,
		                  "TermsOfUse"        , 
		                  "ColorSettings"     ,
		                  "Currency"          , 
		                  "NumericPrecision"  ,
		                  "ConnectionSettings",
		                  "Theme"             ,
		                  "SendFeedback"       ];	
		var oSetTree = new sap.ui.commons.Tree("SetTree",{showHeader:false});						
			$.each(aTreeNode,function(idx,ele) {
				oSetTree.addNode(new sap.ui.commons.TreeNode(
						ele,
						{
							text : rs.getText(ele)
						}));
			});	
			
		// attach select event	
		var that = this;
		oSetTree.attachSelect(function(oEvent) {
        that._chooseNode("#"+oEvent.getParameter("node").getId());
		});
		
		return oSetTree;
   },
   
   _chooseNode : function(Id){
	   this.oRightlayout.removeAllContent();
	   this.setFocus(Id);	   
	   //select tree node
	   var content = null;
       this.currentNode = Id;
			switch (Id) {
			case "#About":
				content = this.oAboutLayout;
				break;
			case "#TermsOfUse":
				content = this.oTermsLayout;
				break;
			case "#ColorSettings":
				content = this.oColorLayout;
				break;
			case "#Currency":
				content = this.oCurrencyLayout;
				break;
			case "#NumericPrecision":
				content = this.oNumericLayout;
				break;
			case "#SendFeedback":
				content = this.oFeedBackLayout;
				break;
			case "#ConnectionSettings":
				content = this.oConnectionLayout;
				break;
			case "#Theme":
				content = this.oThemeLayout;
				break;
			}
			this.oRightlayout.addContent(content);
   },
   
   _createAbout : function(){   
	    var oAbout = new sap.ui.commons.layout.AbsoluteLayout(
				{width:"100%",height:"100%"});
	    
	    //set About label
		var aAboutLabel = [ {
			text : "{i18n>AboutLabel}",
			id   : "AboutName",
			top  :"80px",
			left :"150px",
		}, {
			text : "{i18n>Version}",
			id   : "AboutVersion",
			top  :"150px",
			left :"230px",
		} ];						
		$.each(aAboutLabel,function(idx,ele) {
			var oItem = new sap.ui.commons.TextView(
					ele.id,
					{
						text  : ele.text,
					});
			oAbout.addContent(oItem,{top:ele.top,left:ele.left});
		});	
		return oAbout;
   },
   
   _createTerms : function(){   
	   var oTerms = new sap.ui.commons.layout.AbsoluteLayout(
				{width:"100%",height:"100%"});
	   var oLicenselabel = new sap.ui.commons.TextView({
			text   : "End User License Agreement ",
			design : sap.ui.commons.TextViewDesign.H1,
		});
	   oTerms.addContent(oLicenselabel,{top:"60px",left:"100px"});
	
	   return oTerms;
   },
   
   _createColor : function(){ 
	   var oColor = new sap.ui.commons.layout.AbsoluteLayout(
				{width:"100%",height:"100%"});
	   
	   //create color text
	   var	aColorInfo = [ {
			text : "{i18n>ColorRepresents}",
			top:"20px",
		}, {
			text : "{i18n>ColorScheme}",
			top:"160px",
		} ];	
		$.each(aColorInfo,function(idx,ele) {
			var oItem = new sap.ui.commons.TextView({
				text : ele.text,
				design : sap.ui.commons.TextViewDesign.H3
		});
		    oColor.addContent(oItem,{top:ele.top,left:"50px"});
	    });		
		
		//create color radio
	   var that = this;   
	   var oColorRBG = new sap.ui.commons.RadioButtonGroup({
				select : function() {
					 that.cfgData.ColorScheme=this.getSelectedItem().getKey();
					 that.oColorWidSlider.changeMode(that.cfgData.ColorScheme);
				} 
	   });
	   var	oColorRadio = [
	      	               rs.cfg.ColorScheme.GYR, 
	      	               rs.cfg.ColorScheme.BYG ];		
		$.each(oColorRadio,function(idx,ele) {
			oColorRBG.addItem(new sap.ui.core.Item({
				key: ele
			}));
			if(ele==that.cfgData.ColorScheme)
				oColorRBG.setSelectedIndex(idx);
		});			
		oColor.addContent(oColorRBG,{top:"60px",left:"90px"});
		
		//create color slider
		var oColorSpend = ["Actual Spending", "0% of the Budget", "100% of the Budget", "200% of the Budget",];
		this.oColorWidSlider = new Slider({
			id       : "setting",
			title    : oColorSpend[0],
			comment1 : oColorSpend[1],
			comment2 : oColorSpend[2],
			comment3 : oColorSpend[3]
		}).addStyleClass("colorSettingSlider");
		oColor.addContent(this.oColorWidSlider,{top:"220px",left:"20px"});
		//create segment button
		var aColorSegBtn = [ {								
			buttons : [ new sap.ui.commons.Button({width:"50px",enabled:false}).addStyleClass("greenButton"),
			            new sap.ui.commons.Button( {width:"50px",enabled:false}).addStyleClass("yellowButton"),
			            new sap.ui.commons.Button({width:"50px",enabled:false}).addStyleClass("redButton")
			            ],
			            top:"60px",							     
		}, {
			buttons : [ new sap.ui.commons.Button({width:"50px",enabled:false}).addStyleClass("blueButton"),
			            new sap.ui.commons.Button({width:"50px",enabled:false}).addStyleClass("yellowButton"),
			            new sap.ui.commons.Button({width:"50px",enabled:false}).addStyleClass("greyButton")
			            ],
			            top:"85px",
		} ];
		$.each(aColorSegBtn,function(idx,ele) {
			var oItem = new sap.ui.commons.SegmentedButton(
					{
						buttons : ele.buttons
					});
			oColor.addContent(oItem,{top:ele.top,left:"120px"});
		});		
		return oColor;			
   },
   
   _createCurrency : function(){
	   var oCurrency = new sap.ui.commons.layout.AbsoluteLayout(
			   {width:"100%",height:"100%"});
	   
   	   var oCurrencyText = new sap.ui.commons.TextView(
   			   {
   				   text   : "{i18n>SelectCurrency}",
   				   design : sap.ui.commons.TextViewDesign.H3
   			   });
   	   oCurrency.addContent(oCurrencyText,{top:"20px",left:"50px"});
   	   
	   //create radio button
   	   var currency = rs.model.GeneralParam.getCurrencyKey();
   	   var oCurrencyRadio = new sap.ui.commons.RadioButton({
   		   text     : rs.getText(currency),
   		   selected : true
   	   });
   	   oCurrency.addContent(oCurrencyRadio,{top:"60px",left:"90px"});	   
       return oCurrency;
   },
   
   _createNumeric : function(){
	   var oNumeric = new sap.ui.commons.layout.AbsoluteLayout(
			   {width:"100%",height:"100%"});

	   var oSelectPrecision = new sap.ui.commons.TextView(
			   {
				   text : "{i18n>SelectNumericPrecision}",
				   design : sap.ui.commons.TextViewDesign.H3
			   });
	   oNumeric.addContent(oSelectPrecision,{top:"20px",left:"50px"});
	   
	   //create radio button
	   var that = this;						
	   var oNumericRBG = new sap.ui.commons.RadioButtonGroup({
		   select : function() {
			   that.cfgData.NumPrecision=this.getSelectedItem().getKey();
		   } 
       });
	   oNumericRBG.addStyleClass("rmline");
	   var aNumericRadio = [ {
		   text : rs.getText("FullPrecision"),
		   key  : rs.cfg.NumPrecision.Full,
	   }, {
		   text : rs.getText("Thousands"),
		   key  : rs.cfg.NumPrecision.Thousand,
	   }, {
		   text : rs.getText("Millions"),
		   key  : rs.cfg.NumPrecision.Million,
	   } ];
	   $.each(aNumericRadio,function(idx,ele) {
		   oNumericRBG.addItem(new sap.ui.core.Item({
			   key: ele.key,
			   text:ele.text
		   }));
		   if(ele.key == that.cfgData.NumPrecision)
			   oNumericRBG.setSelectedIndex(idx);
	   });	
	   var top = 39;
	   oNumeric.addContent(oNumericRBG,{top:"60px",left:"90px"});
	   	   
	   //create label
	   var aNumericLabel = [ {
		   text : "1,234,567" ,
	   }, {
		   text : "{i18n>SampleThousands}",
	   }, {
		   text : "{i18n>SampleMillion}",
	   } ];	
	   $.each(aNumericLabel,function(idx,ele) {
		   var oItem = new sap.ui.commons.TextView({
			   text : ele.text,
	   });
		   top = top + 22;
		   oNumeric.addContent(oItem,{top:top+"px",left:"220px"});
	   });		
	   
	   return oNumeric;
   },
   
   _createConnection : function(){
	   var oConnection = new sap.ui.commons.layout.AbsoluteLayout(
			   {width:"100%",height:"100%"});

	   var oSelectConnection = new sap.ui.commons.TextView({
		   text : "{i18n>SelectNumericConnection}",
		   design : sap.ui.commons.TextViewDesign.H3
	   });
	   oConnection.addContent(oSelectConnection,{top:"20px",left:"50px"});
	   
	   //create radio button
	   var that = this;
	   var oConnectionRBG = new sap.ui.commons.RadioButtonGroup({
		   select : function() {
			   that.cfgData.ConnectionSetting=this.getSelectedItem().getKey();
		   } 
	   });
	   oConnectionRBG.addStyleClass("rmline");
	   var aConnection=[{
		   text : "Demo",
		   key  : rs.cfg.ConnectionSetting.Demo,
	   },{
		   text : "Net",
		   key  : rs.cfg.ConnectionSetting.Net,
	   } ];
	   $.each(aConnection,function(idx,ele) {
		   oConnectionRBG.addItem(new sap.ui.core.Item({
			   key: ele.key,
			   text:rs.getText(ele.text)
		   }));
		if(ele.key == that.cfgData.ConnectionSetting)
			oConnectionRBG.setSelectedIndex(idx);
	   });	
	   oConnection.addContent(oConnectionRBG,{top:"60px",left:"90px"});
	   
	   return oConnection;
   },
   _createTheme:function(){
	   var oTheme = new sap.ui.commons.layout.AbsoluteLayout(
			   {width:"100%",height:"100%"});

	   var oThemeText = new sap.ui.commons.TextView({
		   text : "{i18n>ThemeInfo}",
		   design : sap.ui.commons.TextViewDesign.H3
	   });
	   oTheme.addContent(oThemeText,{top:"20px",left:"50px"});
	   
	   var that=this;
	   var oThemeRBG = new sap.ui.commons.RadioButtonGroup({
		   select : function() {
			   that.cfgData.Theme=this.getSelectedItem().getKey();
			   sap.ui.getCore().applyTheme(that.cfgData.Theme);
		   } 
	   });
	   oThemeRBG.addStyleClass("rmline");
	   var aThemeRadio = [ {
		   text : rs.getText("goldreflection"),
		   key  : rs.cfg.Theme.GOL,
	   }, {
		   text : rs.getText("ux"),
		   key  : rs.cfg.Theme.UX,
	   }, {
		   text : rs.getText("hcb"),
		   key  : rs.cfg.Theme.HCB,
	   },{
		   text : rs.getText("platinum"),
		   key  : rs.cfg.Theme.PLA,
	   } ];
	   $.each(aThemeRadio,function(idx,ele) {
		   oThemeRBG.addItem(new sap.ui.core.Item({
			   key: ele.key,
			   text:ele.text
		   }));
		   if(ele.key == that.cfgData.Theme)
			   oThemeRBG.setSelectedIndex(idx);
	   });	
	   oTheme.addContent(oThemeRBG,{top:"60px",left:"90px"});
	   
	   return oTheme;
   },
   _createFeedBack : function(){
	   var oFeedBack = new sap.ui.commons.layout.AbsoluteLayout(
			   {width:"100%",height:"100%"});
	   
	   //create text view 
	   var aFeedBackText = [ {
		   id	  : "FirstName",
		   left   : "50px",
		   top    : "60px"
	   }, {
		   id	  : "LastName",
		   left   : "300px",
		   top    : "60px"
	   }, {
		   id     : "Email",
		   left   : "50px",
		   top    : "100px"
	   }, {
		   id     : "Organisation",
		   left   : "300px",
		   top    : "100px"
	   }, {
		   id     : "EnterMessage",
		   width  : "470px",
		   height : "100px",
		   top    : "150px",
		   left   : "50px"
	   } ];
	   var aFeedBackControl = [];
	   aFeedBackControl[0]  = new sap.ui.core.HTML({
			content: '<textarea id="FirstName" style="width:220px;resize:none;overflow:auto"></textarea>'
		});
	   aFeedBackControl[1]  = new sap.ui.core.HTML({
			content: '<textarea id="LastName" style="width:220px;resize:none;overflow:auto"></textarea>'
		});
	   aFeedBackControl[2]  = new sap.ui.core.HTML({
			content: '<textarea id="Email" style="width:220px;resize:none;overflow:auto"></textarea>'
		});
	   aFeedBackControl[3]  = new sap.ui.core.HTML({
			content: '<textarea id="Organisation" style="width:220px;resize:none;overflow:auto"></textarea>'
		});
	   aFeedBackControl[4]  = new sap.ui.core.HTML({
			content: '<textarea id="EnterMessage" style="width:470px;height:100px;resize:none;overflow:auto"></textarea>'
		});
	      
	   $.each(aFeedBackText,function(idx,ele) {
		   aFeedBackControl[idx].attachAfterRendering(function(){			  
			   $("#"+ele.id).attr("placeholder",rs.getText(ele.id));
			   rs.util.Util.addPlaceHolder($("#"+ele.id));
		   });   
		   
		   oFeedBack.addContent( aFeedBackControl[idx],{top:ele.top,left:ele.left});
	   });
	
	   // create submit button
	   var oSubmit = new sap.ui.commons.Button("oSubmit",{
		   text   : "{i18n>Submit}",
		   width  : "100px",
		   height : "30px",
		   lite   : true,
		   press  : function() {			   
			   var browserVersion = $.browser.version;
			   if($.browser.safari){
				   var start = navigator.appVersion.split("Version");
				   var end   = start[1].substr(1,start[1].length-1);
				   var appVersion = end.split(" ");
				   browserVersion = appVersion[0];
               }
               if($.browser.chrome){
            	   var start = navigator.appVersion.split("Chrome");
            	   var end   = start[1].substr(1,start[1].length-1);
            	   var appVersion = end.split(" ");
            	   browserVersion = appVersion[0];
              }
               var p  = "%0D%0A";
               var to = "SAPRealSpend@sap.com";		
               var subject = rs.getText("fbSubject") + " " +$("#Organisation").attr("value");
               var content = rs.getText("fbContent");			   
               var body = content + p + $("#EnterMessage").attr("value")
               + p + p + p + p + p +  rs.getText("fbDiagnostic")
               + p + rs.getText("fbAppVersion") +" 1.0"
			   + p + rs.getText("fbSystem") + rs.util.Util.detectOS()
			   + p + rs.getText("fbBrowserType") + rs.util.Util.detectBrowser() 
			   + p + rs.getText("fbBrowserVersion") + browserVersion
			   + p + rs.getText("fbFrom")
			   + p + p + p + rs.getText("fbGreet")
			   + p + $("#FirstName").attr("value") + ", " + $("#LastName").attr("value") 
			   + p + $("#Email").attr("value");				
               var mailURL =	"mailto:" + to + 	"?subject=" + subject + "&body=" + body;					
               window.location = mailURL;
			}
	   });
	   oFeedBack.addContent(oSubmit,{top:"275px",left:"390px"});
	   
	   return oFeedBack;
   },
   
   setFocus : function(Id){
		$(this.currentNode).removeClass("setArrow");	
		$(Id).addClass("setArrow");
   },
   
   renderer : 'sap.ui.commons.DialogRenderer',
   
   currentNode       : "#About",       // current select tree node
   cfgData           : null,           // the cfg data load from local storage
   oRightlayout      : null,           // the right content parts
   oAboutLayout      : null,           // the about part 
   oTermsLayout      : null,           // the use of terms part 
   oColorLayout      : null,           // the color setting part
   oCurrencyLayout   : null,           // the currency part
   oNumericLayout    : null,           // the numeric setting part
   oConnectionLayout : null,           // the connection setting part
   oFeedBackLayout   : null,           // the send us feed back part
   oColorWidSlider   : null,           // the color slider 
   CfgChanged        : null,           // collection of changed item
   aSliderText       : null,           // label control for slider
});

rs.cfg.onSettingDialogClicked = function() {
		   if(!rs.cfg.g_settingDialog)
		   {
			   rs.cfg.g_settingDialog = new rs.cfg.SetDialog("DialogSetting",{
				   width  : "800px",
				   height : "600px",
				   modal  : true,
				   title  : "{i18n>Settings}",
				   data   : rs.cfg.CfgValue.clone()
			   });
	  		   rs.cfg.g_settingDialog.doInit();
			   rs.cfg.g_settingDialog.open();
			   rs.cfg.g_settingDialog.setFocus(rs.cfg.g_settingDialog.currentNode);	//set default tree node
		   }
		   else{
			   rs.cfg.g_settingDialog.reOpen(rs.cfg.CfgValue.clone());
		   }
	   };					