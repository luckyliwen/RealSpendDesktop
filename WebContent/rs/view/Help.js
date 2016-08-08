rs.view.HelpInfo = {

		showHelp : function(){
			
			this._oHelpContent = this.createHelpContent("500px");
			
			this._oDialog = new sap.ui.commons.Dialog();
			this._oDialog.setWidth("520px");
			//this._oDialog.setTitle("");
			this._oDialog.setModal(true);
			this._oDialog.addContent(this._oHelpContent);			
			
			this._oDialog.open();

		},

	      
	      createHelpContent: function (contentWidth) {

	    	  var data = {
		    	    	help: [{
		    	          title: 'Title_UsingSAPRealSpend',
		    	          content: 'Content_UsingSAPRealSpend',
		    	          image: 'images/SAPLogo.png',
		    	        },{
		    	          title: 'Title_Alert',
		    	          content: 'Content_Alert',
		    	          image: 'images/LeftNavi_Alert_Button.png',
		    	        },{
		    	          title: 'Title_Calendar',
		    	          content: 'Content_Calendar',
		    	          image: 'images/RightNavi_TimeSelection_Button.png',
		    	        },{
		    	          title: 'Title_Share',
		    	          content: 'Content_Share',
		    	          image: 'images/RightNavi_Export_Button.png',
		    	        },{
		    	          title: 'Title_Setting',
		    	          content: 'Content_Setting',
		    	          image: 'images/RightNavi_Setting_Button.png',
		    	        },
		    	        
		    	        {
		    	          title: 'Title_HowToUseThisPage',
		    	          content: 'Content_HowToUseThisPage',
		    	          image: 'images/Help_FullPage_Header_Icon.png',
		    	        },{
		    	          title: 'Title_UsingTheTitleArea',
		    	          content: 'Content_UsingTheTitleArea',
		    	          image: 'images/Help_FullPage_TapHeader_Icon.png',
		    	        },{
		    	          title: 'Title_TreeMapView',
		    	          content: 'Content_TreeMapView',
		    	          image: 'images/OverviewTreeMapUnSelected.png',
		    	        },{
		    	          title: 'Title_TableView',
		    	          content: 'Content_TableView',
		    	          image: 'images/OverviewTableViewUnSelected.png',
		    	        },{
		    	          title: 'Title_PieBarChartView',
		    	          content: 'Content_PieBarChartView',
		    	          image: 'images/Detail_Piechart_UnSelected.png',
			    	    },{
		    	          title: 'Title_SpendBudgetButton',
		    	          content: 'Content_SpendBudgetButton',
		    	          image: 'images/Help_SpendBudget_Icon.png',
		    	        },{
		    	          title: 'Title_UsingTheTreeMap',
		    	          content: 'Content_UsingTheTreeMap',
		    	          image: 'images/Help_TreeMap_TapOverlay_Icon.png',
		    	        },{
		    	          title: 'Title_Zoomingin',
		    	          content: 'Content_Zoomingin',
		    	          image: 'images/ZoomIn.png',
		    	        },{
		    	          title: 'Title_Zoomingout',
		    	          content: 'Content_Zoomingout',
		    	          image: 'images/ZoomOut.png',
		    	        },	    	        	    	      
		    	      ],
		    	      
		    	      glossary: 
		    	       [{
		    	          title: 'Title_Departments',
		    	          content: 'Content_Departments',
		    	          image: '',
		    	        },{
		    	          title: 'Title_ActualExpenses',
		    	          content: 'Content_ActualExpenses',
		    	          image: '',
		    	        },{
		    	          title: 'Title_CommittedExpenses',
		    	          content: 'Content_CommittedExpenses',
		    	          image: '',
		    	        },{
		    	          title: 'Title_Budget',
		    	          content: 'Content_Budget',
		    	          image: '',
		    	        },{
		    	          title: 'Title_YearToData',
		    	          content: 'Content_YearToData',
		    	          image: '',
		    	        },{
		    	          title: 'Title_AsOfDate',
		    	          content: 'Content_AsOfDate',
		    	          image: '',
		    	        }],
		    	        	    	        	    	      
		    	    };
	    	    var that = this; 
	    	    // List
	    	    this.oHelpRowRepeater = new sap.ui.commons.RowRepeater({numberOfRows:3});
	    	    
	    	    this.oGlossaryRowRepeater = new sap.ui.commons.RowRepeater({numberOfRows:3});	    	    
	    	    
	    	    var oModel = new sap.ui.model.json.JSONModel();
	    	    
	    	    oModel.setData(data);
	    	    
	    		this.oHelpRowRepeater.setModel(oModel);
	    		this.oGlossaryRowRepeater.setModel(oModel);
	    		
	    	    // SegmentedButton
	    	    var helpBtn = new sap.ui.commons.Button({
	    	      text: "{i18n>Help}",
	    	      textAlign:"Center",
	    	      width: "50%",
	    	      press: function (evt) { refreshHelpContainor('help'); }
	    	    });
	    	    var glossaryBtn = new sap.ui.commons.Button({
	    	      text: "{i18n>Glossary}",
	    	      textAlign:"Center",
	    	      width: "50%",
	    	      press: function (evt) { refreshHelpContainor('glossary'); }
	    	    });
	    	    var helpSegmentedBtn = new sap.ui.commons.SegmentedButton ({
	    	      width: contentWidth,
	    	      buttons: [helpBtn, glossaryBtn],
	    	      selectedButton: helpBtn,
	    	    }); 
	    	    
	    	  //create the template control that will be repeated and will display the data

	    	    var oHelpRowLayout = new sap.ui.commons.layout.AbsoluteLayout({height: "170px",width:"500px"});
	    	    
	    		var oTitleView4Help = new sap.ui.commons.TextView({
	    	        wrapping : false,
	    	        enabled: false,
	    	        design: sap.ui.commons.TextViewDesign.H3
	    	        });
	    		oTitleView4Help.bindProperty("text","title",function(oValue){
	    			return rs.getText(oValue);
	    		});
	    		
	    		oHelpRowLayout.addContent(oTitleView4Help,{top:"0px",left:"0px"});    	    
	    		
	    		var oImage = new sap.ui.commons.Image();

	    		oImage.bindProperty("src", "image", function(oValue) {
	    			
	    		    if( oValue != "")
	    		    	{
	    		    		return oValue;
	    		    	}
	    		    else
	    		    	{
	    	    		return null;
	    		    	}
	    		});

	    		oHelpRowLayout.addContent(oImage,{top:"30px",left:"0px"});
	    		
	    		var oTextView4Help = new sap.ui.commons.TextView({
	    	        wrapping : true,
	    	        enabled: false,
	    	        design: sap.ui.commons.TextViewDesign.H5
	    	        });
	    		oTextView4Help.bindProperty("text","content",function(oValue){
	    			return rs.getText(oValue);
	    		});
	    		
	    		oHelpRowLayout.addContent(oTextView4Help,{top:"30px",left:"60px"});
	    		
	    		var oDivider4Help = new sap.ui.commons.HorizontalDivider({width: "100%", type: "Page", height: "Small"});	
	    		oHelpRowLayout.addContent(oDivider4Help,{top:"165px",left:"0px"});

	    		
	    	    var oGlossayRowLayout = new sap.ui.commons.layout.AbsoluteLayout({height: "130px",width:"500px"});
	    	    
	    		var oTitleView4Glossary = new sap.ui.commons.TextView({
	    	        wrapping : false,
	    	        enabled: false,
	    	        design: sap.ui.commons.TextViewDesign.H3
	    	        });
	    		oTitleView4Glossary.bindProperty("text","title",function(oValue){
	    			return rs.getText(oValue);
	    		});
	    			    		    	    
	    		oGlossayRowLayout.addContent(oTitleView4Glossary,{top:"0px",left:"0px"});
	    			    		
	    		var oTextView4Glossary = new sap.ui.commons.TextView({
	    	        wrapping : true,
	    	        enabled: false,
	    	        design: sap.ui.commons.TextViewDesign.H5
	    	        });
	    		oTextView4Glossary.bindProperty("text","content",function(oValue){
	    			return rs.getText(oValue);
	    		});
	    			    		
	    		oGlossayRowLayout.addContent(oTextView4Glossary,{top:"30px",left:"0px"});
	    		
	    		var oDivider4Glossary = new sap.ui.commons.HorizontalDivider({width: "100%", type: "Page", height: "Small"});		    		
	    		oGlossayRowLayout.addContent(oDivider4Glossary,{top:"125px",left:"0px"});
	    			    		
	    		
	    		this.oHelpRowRepeater.bindRows("/help",oHelpRowLayout);
	    		this.oGlossaryRowRepeater.bindRows("/glossary",oGlossayRowLayout);
	    	    
	    	    
	    	    this.helpContainor = new sap.ui.commons.layout.VerticalLayout({
	    	      width: contentWidth,
	    	      height: '600px',
	    	      content: [helpSegmentedBtn,this.oHelpRowRepeater],
	    	    });


	    	    
	    	    function refreshHelpContainor(type) {	    	      
	    	      if (type === 'help') {
	    	    	  that.helpContainor.removeContent(that.oGlossaryRowRepeater);
	    	    	  that.helpContainor.addContent(that.oHelpRowRepeater);
	    	      }
	    	      else{
	    	    	  that.helpContainor.removeContent(that.oHelpRowRepeater);
	    	    	  that.helpContainor.addContent(that.oGlossaryRowRepeater);
	    	      }
	    	      
	    	    }
	    	    
	    	    return this.helpContainor;
	    	  },
		
};
