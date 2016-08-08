//==put the view part global enum and constant here

/**
 * The budget spending mode
 */
rs.view.BudgetSpendMode = {
	Budget : 0,
	Spend : 1
};

rs.view.LegendMode = {
	Main : 0,
	Detail : 1,
	TrendArea : 2,
	TrendBar : 3,
	TrendTable : 4,
	Empty : 5,
};

rs.view.LegendUI = {
	Block_Size : "20px",
	Color : {
		BadThreshold : '#CCC',
		GoodThreshold : '#7AAED6',
		AverageThreshold : '#B8D4E9',
		CommitThreshold : 'gray'
	}
};

/**
 * Get the configured color by the variance percentage
 * 
 * @param {}
 *            variancePercentage: variancePercentage like 0.04, means left 4%
 *            money Good threshold: 0.95 bad threshold: 1.05
 */
rs.view.getColorByVariancePercentage = function(variancePercentage, total) {

	var colors = rs.cfg.Cfg.getColorScheme();
	if (variancePercentage == Infinity || variancePercentage == -Infinity) {
		if (total < 0) {
			return colors[0];
		} else if (total == 0) {
			return colors[1];
		} else {
			return colors[2];
		}
	} else {
		var realSpended = 1 - variancePercentage;

		if (realSpended < rs.cfg.Cfg.getGoodThreshold())
			return colors[0];
		else if (realSpended < rs.cfg.Cfg.getBadThreshold())
			return colors[1];
		else
			return colors[2];
	}
};

/**
 * The common color select for the pie
 */
rs.view.colorSelector = function(d) {
	return rs.view.getColorByVariancePercentage(d.VariancePercentage, d.Total);
};

/**
 * Add a convenient way to add enum data by using the normal custom data
 * mechanism
 */
sap.ui.core.Control.prototype.setRSEnumData = function(data) {
	this.addCustomData(new sap.ui.core.CustomData({
		key : 'rsEnumKey',
		value : data
	}));
};

/**
 * Add a convenient way to add enum data by using the normal custom data
 * mechanism
 */
sap.ui.core.Control.prototype.getRSEnumData = function() {
	var aData = this.getCustomData();

	var ret = null;

	// find a value with the key
	for ( var i = 0; i < aData.length; i++) {
		var d = aData[i];
		if (d.getKey() == 'rsEnumKey') {
			ret = d.getValue();
			break;
		}
	}
	return ret;
};



/**
 * The common tooltip select for the pie
 * ??temp solution, need change later
 */
rs.view.tooltipSelector = function(d) {

	var name = new sap.ui.commons.Label();
	name.setText(d.label);
	name.setDesign(sap.ui.commons.LabelDesign.Bold);

	
	var varianceColor = rs.view.getColorByVariancePercentage(
			d.VariancePercentage, d.Total);
	var variancePercentageFormat = rs.view.Help.formatVariancePercentage(d.VariancePercentage);
	var contentParameter = "<div  style='position:relative;font-size:15px; textAlign:right; color:";
	var variance = new sap.ui.core.HTML();
	variance.setContent(contentParameter + varianceColor + ";\'>"
			+ rs.cfg.Cfg.getCurrency()
			+ rs.util.Util.commaSplit(Math.abs(d.Variance))
			+ variancePercentageFormat + "</div>");
    
    
	var actualString = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(d.Actual);
	var actual = new sap.ui.commons.Label();
	actual.setText(rs.getText("Actual") + ": " + actualString);

	var commitString = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(d.Commited);
	var commit = new sap.ui.commons.Label();
	commit.setText(rs.getText("Committed") + ": " + commitString);
	
	var budgetString = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(d.Budget);
	var budget = new sap.ui.commons.Label();
	budget.setText(rs.getText("Budget") + ": " + budgetString);
	
	var tips = new sap.ui.commons.layout.VerticalLayout({
		content : [ name, variance, actual,commit, budget ]
	});
	return tips;
},

// a internal view manage, as the PageMng need the parent ID is existed on dom,
// but sometime one view is not there, so can't use the PageMng.
// here just use a Panel Or Layout, then dynamically addContent,
// removeAllContent
rs.view.InternalPageMng = function(parent, activePage, pages) {
	this.parent = parent;
	this.aPages = [];
	this.activePageIdx = activePage;

	if (pages) {
		for ( var i = 0; i < pages.length; i++) {
			this.addPage(pages[i]);
		}
	}

};

rs.view.InternalPageMng.prototype = {
	addPage : function(page) {
		rs.assertControl(page);
		this.aPages.push(page);

		var idx = this.aPages.length - 1;

		var id = this.parent.getId() + '--page' + idx;

		var htmlCtrol = new sap.ui.core.HTML();
		// for the active page, no need set display: none
		var content = "<div id=\'" + id + "\'";
		if (idx != this.activePageIdx)
			content += " style='display: none'";
		content += "></div>";

		htmlCtrol.setContent(content);
		this.parent.addContent(htmlCtrol);

		htmlCtrol.attachAfterRendering(function() {
			page.placeAt(id);
		});
	},

	setActivePage : function(idx) {
		if (this.activePageIdx == idx)
			return;

		var id;
		// first hide the old, then show the new
		if (this.activePageIdx != -1) {
			id = "#" + this.parent.getId() + '--page' + this.activePageIdx;
			$(id).hide('fast');
		}

		id = "#" + this.parent.getId() + '--page' + idx;
		$(id).show('slow');

		this.activePageIdx = idx;
	},

	/**
	 * Get the current active page
	 * 
	 * @returns
	 */
	getActivePage : function() {
		return this.aPages[this.activePageIdx];
	}
};

rs.view.Help = {
		
	/**
	 * Get the current activate view 
	 * @returns
	 */
	getActiveView : function() {
		var topView = rs.ModuleMng.getActivePage();
		if('rs.view.OverView' == topView.getViewName()){
			//it is the Overview 
			return topView;
		} else {
			//then for the NaviMng is the current active page
			var subPage = topView.getActivePage(); 
			return subPage;
		}
	},

	/**
	 * the implementation of export,
     */
	doExport : function() {
		//here use the full name so outside can directly call it, otherwise the this will point to Window
		var view = rs.view.Help.getActiveView();
		
		//??later need only available for the view which have the table
		if ( view.getActiveTable() != null) {
			rs.util.Util.saveTable2CSV(view.getActiveTable());
		}
	},


	/**
	 * Refresh the related two screen when the notes number updated
	 * @param hierId
	 * @param byHierId
	 */	
	refreshScreenForNotesUpdated : function(hierId, byHierId)  {
		var  hierType = rs.model.HierMng. getTypeById( hierId);
		var  byHierType = rs.model.HierMng. getTypeById(byHierId);

		var aPrefix = {};
		aPrefix[ rs.HierType.Dep ] = 'DepOV';
		aPrefix[ rs.HierType.Exp ] = 'ExpOV';
		aPrefix[ rs.HierType.Prj ] = 'PrjOV';
	

		[hierType, byHierType].forEach( function(type) {
			var table;
			var barTableId = aPrefix[ type ] +"--HierDetail--BarTable";		
			var texttableId = aPrefix[ type ] +"--HierDetail--TextTable";
			
			[barTableId,texttableId].forEach( function(id){
				table = sap.ui.getCore().byId(id);
				if(table != null){
					table.invalidate();
				}
			});			
		});

	},

	
	createHeaderData : function(parentId) {
		// Create textview field for header data
		var headerData = new sap.ui.commons.layout.AbsoluteLayout(parentId
				+ '--headerData', {
			height : this.HeaderDataHeightPx
		}).addStyleClass("headerData");
		
		this.oHeaderTextViewName = new rs.cfg.Control.Text(parentId
				+ '--headerDataName', {
			enabled : false,
			textAlign : "Left"
		}).addStyleClass("headerDataName");

		this.oHeaderTextViewSpend = new rs.cfg.Control.Text(parentId
				+ '--headerDataSpend', {
			enabled : false,
			textAlign : "Right"
		}).addStyleClass("headerDataSpend");

		this.oHeaderTextViewYearofDate = new rs.cfg.Control.Text(parentId
				+ '--headerDataYearofDate', {
			enabled : false,
			textAlign : "Left",
		}).addStyleClass("headerDataYearofDate");

		this.oHeaderTextViewDiff = new sap.ui.core.HTML(parentId
				+ '--headerDataDiff');

		this.oHeaderTextViewLeftOrOver = new rs.cfg.Control.Text(parentId
				+ '--headerDataLeftOrOver', {
			enabled : false,
			textAlign : "Right",
			design : sap.ui.commons.TextViewDesign.H6
		}).addStyleClass("headerDataLeftOrOver");

		headerData.addContent(this.oHeaderTextViewName, {
			left : "0px",
			top : "0px"
		});

		headerData.addContent(this.oHeaderTextViewSpend, {
			right : "0px",
			top : "0px"
		});

		headerData.addContent(this.oHeaderTextViewYearofDate, {
			left : "0px",
			top : "30px"
		});

		// ??Here top is 38 but others is 30 because it use HTML control, and it
		// choose different font-size
		headerData.addContent(this.oHeaderTextViewDiff, {
			right : "40px",
			top : "38px"
		});

		headerData.addContent(this.oHeaderTextViewLeftOrOver, {
			right : "0px",
			top : "30px"
		});

		return headerData;
	},

	/**
	 * Update the header part data
	 * @param parentId
	 * @param data
	 */
	updateHeaderData : function(parentId, data) {		
		var variancePercentageFormat = this
				.formatVariancePercentage(data.VariancePercentage);

		var varianceColor = rs.view.getColorByVariancePercentage(
				data.VariancePercentage, data.Total);

		var leftOver = data.Variance >= 0 ? rs.getText("Left") : rs.getText("Over");

		var oHeaderName = sap.ui.getCore().byId(parentId + '--headerDataName');
		oHeaderName.setText(data.Name);

		var oHeaderSpend = sap.ui.getCore()
				.byId(parentId + '--headerDataSpend');
		oHeaderSpend.setText(rs.cfg.Cfg.getCurrency()
				+ rs.util.Util.commaSplit(data.Total)+ " " + rs.getText("Spent"));

		var oHeaderDiff = sap.ui.getCore().byId(parentId + '--headerDataDiff');
		var contentParameter = "<div  style='position:relative;font-size:15px; textAlign:right; color:";

		oHeaderDiff.setContent(contentParameter + varianceColor + ";\'>"
				+ rs.cfg.Cfg.getCurrency()
				+ rs.util.Util.commaSplit(Math.abs(data.Variance))
				+ variancePercentageFormat + "</div>");

		var oHeaderLeftOrOver = sap.ui.getCore().byId(
				parentId + '--headerDataLeftOrOver');
		oHeaderLeftOrOver.setText(leftOver);
		
		var oHeaderYearofDate = sap.ui.getCore().byId(
				parentId + '--headerDataYearofDate');

		oHeaderYearofDate.bindText(this.getTimePeriod(), this.formatTimePeriod);
	},

	getHierNodeKey : function(hierType) {
		switch (hierType) {
		case rs.HierType.Dep:
			key = "CCHierarchyNodeID";
			break;
		case rs.HierType.Exp:
			key = "CEHierarchyNodeID";
			break;
		case rs.HierType.Prj:
			key = "IOHierarchyNodeID";
			break;
		}
		return key;
	},

	formatBoxSizeHintText : function(oText) {
		var lang = rs.model.TextMng.getCurrentLocale();
		var numPrecision = rs.cfg.Cfg.getNumPrecision();
		var currency = rs.cfg.Cfg.getCurrency();
		if (numPrecision == rs.cfg.NumPrecision.Full) {
			return oText + " " + currency;
		} else if (numPrecision == rs.cfg.NumPrecision.Thousand) {
			if (lang == 'en-US') {
				return oText + " "
						+ rs.getText("TableValueCurrencyHintThousands") + " "
						+ currency;
			} else {
				return oText + " " + currency + " "
						+ rs.getText("TableValueCurrencyHintThousands");
			}

		} else if (numPrecision == rs.cfg.NumPrecision.Million) {
			if (lang == 'en-US') {
				return oText + " "
						+ rs.getText("TableValueCurrencyHintMillions") + " "
						+ currency;
			} else {
				return oText + " " + currency + " "
						+ rs.getText("TableValueCurrencyHintMillions");
			}
		}
	},

	getTimePeriod : function() {
		var timePeriod = rs.cfg.Cfg.getTimePeriod();
		var timePeriodTxt;

		switch (timePeriod) {
		case rs.cfg.TimePeriod.M2D:

			timePeriodTxt = "i18n>MonthToDate";
			break;

		case rs.cfg.TimePeriod.Q2D:
			timePeriodTxt = "i18n>QuarterToDate";
			break;

		case rs.cfg.TimePeriod.Y2D:
			timePeriodTxt = "i18n>YearToDate";
			break;

		case rs.cfg.TimePeriod.OTH:
			timePeriodTxt = "i18n>AsOf"; // ??if is other, then need set the
											// exactly time
			break;

		default:
			rs.assert(false);
			break;
		}
		;
		return timePeriodTxt;
	},

	formatTimePeriod : function(oValue) {
		var date = new Date();
		var year = "", month = "", day = "";
		year = date.getFullYear();
		month = date.getMonth() + 1;
		day = date.getDate();

		if (rs.cfg.Cfg.getTimePeriod() == rs.cfg.TimePeriod.M2D
				|| rs.cfg.Cfg.getTimePeriod() == rs.cfg.TimePeriod.Q2D
				|| rs.cfg.Cfg.getTimePeriod() == rs.cfg.TimePeriod.Y2D) {
			return oValue + " " + year + "-" + month + "-" + day;
		} else {
			// here need to get the customized date from cfg
			var ret = "";
			var otherType = rs.cfg.Cfg.getOtherTimePeriodType();
			var otherValue = rs.cfg.Cfg.getOtherTimePeriodValue();
			var fiscalYear = rs.model.GeneralParam.getFiscalYear();

			switch (otherType) {
			case rs.cfg.OtherTimePeriod.Year:
				if (otherValue == rs.cfg.Year.ThisYear) {
					ret = rs.getText("FiscalYear") + " " + fiscalYear;
				} else if (otherValue == rs.cfg.Year.LastYear) {
					ret = rs.getText("FiscalYear") + " " + (fiscalYear - 1);
				}
				break;

			case rs.cfg.OtherTimePeriod.Quarter:
				if (otherValue == rs.cfg.Quarter.Q1) {
					ret = rs.getText("Quarter") + " " + "1" + " " + fiscalYear;
				} else if (otherValue == rs.cfg.Quarter.Q2) {
					ret = rs.getText("Quarter") + " " + "2" + " " + fiscalYear;
				} else if (otherValue == rs.cfg.Quarter.Q3) {
					ret = rs.getText("Quarter") + " " + "3" + " " + fiscalYear;
				} else if (otherValue == rs.cfg.Quarter.Q4) {
					ret = rs.getText("Quarter") + " " + "4" + " " + fiscalYear;
				}
				break;

			case rs.cfg.OtherTimePeriod.Period:
				ret = rs.util.Util.getMonthText(otherValue);
				ret = ret + " " + fiscalYear;
				break;

			default:
				rs.assert(false);
				break;
			}
			return ret + " " + oValue + " " + year + "-" + month + "-" + day;
		}

	},
	getBarColumnLabelText : function(barMode) {
		var barLabelText;
		if (barMode) {
			barLabelText = rs.getText("Actual") + " + "
					+ rs.getText("CommittedSpending") + " ("
					+ rs.getText("BudgetRatio") + " )";
		} else {
			barLabelText = rs.getText("Actual") + " + "
					+ rs.getText("CommittedSpending");
		}
		return barLabelText;
	},

	// check if all the values are zero, then pie can not draw, need show the
	// text to hint the user
	areAllValueZero4PieData : function(pieData, budgetMode) {
		var allValueAreZero = true;
		for ( var i = 0; i < pieData.length; i++) {
			if (budgetMode) {
				if (pieData[i].Budget != 0) {
					allValueAreZero = false;
					break;
				}
			} else {
				if (pieData[i].Total != 0) {
					allValueAreZero = false;
					break;
				}
			}
		}
		return allValueAreZero;
	},

	pieDataWipeOffZero : function(pieData, budgetMode, newPieData) {
		if (budgetMode) {
			for ( var i = 0; i < pieData.length; i++) {
				if (pieData[i].Budget != 0) {
					newPieData.push(pieData[i]);
				}
			}
		} else {
			for ( var i = 0; i < pieData.length; i++) {
				if (pieData[i].Total != 0) {
					newPieData.push(pieData[i]);
				}
			}

		}

		return newPieData;
	},

	formatVariancePercentage : function(variancePercentage) {
		if (variancePercentage == undefined)
			return rs.getText('NoBudget');
		return variancePercentage == Infinity
				|| variancePercentage == -Infinity ? " " : " ("
				+ Math.round(Math.abs(variancePercentage) * 100) + "%) ";
	},
	
	setActiveTableHeight:function(){
		var view =this.getActiveView();
		
		var table = view.getActiveTable();
		if ( table == null) 
			return;
		
		var id = table.getId();
		var id1="";
		if(id.indexOf("HierDetail")>0){
			//for HierDetailView, only set the TextTable as active table for export CSV, so for BarTable , also need set height
			id1 = id.replace(/Text/i,"Bar");
		}
		setTimeout(function() {
			$("#"+id).css("height",view.getMainContentHeight()+40+"px");	//for lineitem/trend view , need 1 more row height 40
			if(id1 != ""){
				$("#"+id1).css("height",view.getMainContentHeight()+40+"px");
			}
		}, 100);	
	},
	
	
	addRightSideBar:function(){
		
		var strDom = '';
		 
		strDom += '<div class="logo"></div>';
		strDom += '<div class="alert" id="rs_alert"></div>'; 
		strDom += '<div class="tabbar">';				
		strDom += '<ul class="tabs">';
		strDom += '<li><a class="tab" id="rs_tab_0"><span>' + rs.getText("Department") + '</span></a></li>';
		strDom += '<li><a class="tab" id="rs_tab_1"><span>' + rs.getText("ExpenseType") +'</span></a></li>';
		strDom += '<li><a class="tab" id="rs_tab_2"><span>' + rs.getText("Project") +'</span></a></li>';
		strDom += '</ul>';
		strDom += '</div>';
		strDom += '<div id="rs_calendar" class="calendar"></div>';
		strDom += '<div id="rs_help"     class="help"></div> ';
		strDom += '<div id="rs_share"    class="share"></div>';
		strDom += '<div id="rs_setting"  class="setting"></div>';

		
		var oHTML = new sap.ui.core.HTML();	
		oHTML.setContent(strDom);	
		
		var strHeight = $("#right-bar").height() + 'px';
		
		var oScrollContainer = new sap.m.ScrollContainer({
									horizontal: false,
									vertical: true,
									content:[oHTML],
									height: strHeight,
									width: "55px"
								});
								
		oScrollContainer.placeAt('right-bar');								
				
		
	},
	
	getOverViewTitleString: function(hierType, hireId){
		var backString = "", descriptionString = "";
		switch (hierType) {
		case rs.HierType.Dep:
			backString = rs.getText("SpendingByDepartments");
			descriptionString = rs.getText("DepartmentSpendingByExpenseType");
			break;
		case rs.HierType.Exp:
			backString = rs.getText("SpendingByExpenseTypes");
			descriptionString = rs.getText("ExpenseSpendingByDepartmentAndProject");
			break;
		case rs.HierType.Prj:
			backString = rs.getText("SpendingByProjects");
			descriptionString = rs.getText("ProjectSpendingByExpense");
			break;
		}		
		
		var mSetting = 
		{
			naviItem: backString,
			description: descriptionString
		};		
		
		return mSetting;
		
		
	},
	
	getDetailViewTitleString: function(hierType, hireId, type){
		var backString = "", descriptionString = "";
		switch (hierType) {
		case rs.HierType.Dep:
			backString = rs.getText("DepartmentSpendingByExpenseType");
			if("lineitem" == type)
			{
				descriptionString = rs.getText("DepartmentLineItemByExpenseType");	
			}
			else
			{
				descriptionString = rs.getText("DepartmentTrendDataByExpenseType");
			}

			break;
		case rs.HierType.Exp:
			backString = rs.getText("ExpenseSpendingByDepartmentAndProject");
			if("lineitem" == type)
			{
				if(rs.model.HierMng.isDepartmentType(hireId))
				{
					descriptionString = rs.getText("ExpenseLineItemByDepartment");	
				}
				else
				{
					descriptionString = rs.getText("ExpenseLineItemByProject");
				}
			}
			else
			{
				descriptionString = rs.getText("ExpenseTrendData");
			}
			
			break;
		case rs.HierType.Prj:
			backString = rs.getText("ProjectSpendingByExpense");
			if("lineitem" == type)
			{
				descriptionString = rs.getText("ProjectLineItemByExpense");	
			}
			else
			{
				descriptionString = rs.getText("ProjectTrendDataByExpenseType");
			}
			
			break;
		}		
		
		var mSetting = 
		{
			naviItem: backString,
			description: descriptionString
		};		
		
		return mSetting;
	},

	// the static height, so late only need change once
	HeaderDataHeight : 55,
	HeaderDataHeightPx : '55px',
	
};  //end of rs.view.Help