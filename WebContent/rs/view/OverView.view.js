jQuery.sap.declare("rs.view.OverView");
jQuery.sap.require("rs.view.HierBaseView");

rs.view.HierBaseView.extend("rs.view.OverView", {
	metadata : {
		properties : {
			"pieNum" : "int",  //How many pies need create
		}
	},

	// Just reuse the JSView is enough
	renderer : 'sap.ui.core.mvc.JSViewRenderer',

	/**
	 * Constant enum for budget/spending model
	 */
	ModelType : {
		Budget : 0,
		Spending : 1
	},

	getControllerName: function() {
		return "rs.controller.OverView";
	},	

	isBudgetModel : function() {
		return this.getModelType() == this.ModelType.Budget;
	},

	/**
	 * Get the content header part height, need by consistent with the view
	 * implementation (normally is the information header and the view switch
	 * part, the detail view/lineItem/Trend need add the extra navigation part)
	 * Now use this static way because the jQuery.offset() only work for the
	 * visible element
	 */
	getContentHeaderHeight : function() {
		// be consistent with _createOverviewHeader
		return this.ViewHeaderHeight;
	},

	/**
	 * @param pieNum
	 */
	updatePieNum : function(pieNum) {
		if (pieNum == this.getPieNum())
			return;

		// from 2-->3 or from 3-->2
		var rows = this._oContentLayout.getRows();
		rs.assert(rows.length == 2);

		var prjCells = this._createPrjTwoLayoutCellsAndContainer();

		this._oContentLayout.setColumns(pieNum);
		if (pieNum == 3) {
			//Here it will cause the pie redraw so delete the old content here to avoid it flicker
			rs.util.Util.destroyContentEffectively(this._aPieContainer[0]);
			rs.util.Util.destroyContentEffectively(this._aPieContainer[1]);
			
			rows[0].addAggregation('cells', prjCells[0], true);
			rows[1].addAggregation('cells', prjCells[1], true);
			this._oContentLayout.setWidths(["33%", "34%", "33%"]);
		} else {
			// from 3-->2, remove two cells
			rows[0].removeCell(prjCells[0]);
			rows[1].removeCell(prjCells[1]);

			this._oContentLayout.setWidths(["50%", "50%"]);
		}
		this.setPieNum(pieNum);
	},

	/**
	 * Here do the real work
	 */
	doInit : function() {
		this.calculateMainContentWidthHeight();
		
		var controller = this.getController();

		// !!
		var pieNum = this.getPieNum();

		var headerPart = this._createOverviewHeader();
		
		this._oContentLayout = this._createMainPart(pieNum);	
		
  		this._oMainLayout = new sap.ui.commons.layout.VerticalLayout(
  				this.createId('mainVerticalLayout'), 
  				{ content : [headerPart, this._oContentLayout]}).addStyleClass("mainVerticalLayout");

		this.setModelSwitchControl(this._oSBBudgetSpend);

		this._oSBBudgetSpend.attachSelect(controller.onModelTypeChanged, controller);

		this._oMainLayout.setWidth('100%');

		// !!Finally add to the content
		this.addContent(this._oMainLayout);

		rs.cfg.Cfg.addChangeListener(controller.onConfigChanged, controller, null);

	},



	/**
	 * Call back for the top hier load successful, now the data for create the
	 * pie is ready, can create header and pie
	 * 
	 * @param hierType: rs.HierType
	 */
	onTopHierLoadSucc : function(hierType) {
		this._addPieHeaderInfoToLayout(hierType);

		this._addPieToLayout(hierType);
		
		this.oHeaderTextViewYearofDate.bindText(rs.view.Help.getTimePeriod(),
				rs.view.Help.formatTimePeriod);
	},

	/**
	 * The call back for the top hier load failed
	 */
	onTopHierLoadFail : function(hierType, error) {
		rs.util.Util.showErrorMessage(null, error, null, null);
	},

	/**
	 * The call back for windows resize event, it need re-calculate the pie
	 * coordinate and redraw it
	 */
	onResize : function() {
		function adjustPieCoordinate(hierType, pieParam) {
			var pie = sap.ui.getCore().byId("pie_" + hierType);
			if (pie) {
				pie.setWidth(pieParam.width);
				pie.setHeight(pieParam.height);
				pie.setOuterRadius(pieParam.outerRadius);
				pie.setInnerRadius(pieParam.innerRadius);
				pie.invalidate();
			}
		}

		this.calculateMainContentWidthHeight();
		this.pieParam = this.calculatePieCoordination();

		adjustPieCoordinate(rs.HierType.Dep, this.pieParam);
		adjustPieCoordinate(rs.HierType.Exp, this.pieParam);
		
		if (this.getPieNum() == 3) {
			adjustPieCoordinate(rs.HierType.Prj, this.pieParam);
		}
	},

	_redrawPiesHeader : function() {
		this._addPieHeaderInfoToLayout(rs.HierType.Dep);
		this._addPieHeaderInfoToLayout(rs.HierType.Exp);

		if (this.getPieNum() == 3) {
			this._addPieHeaderInfoToLayout(rs.HierType.Prj);
		}
	},

	/**
	 * Show the pie with different mode, need considerate whether the pie can
	 * display under new mode
	 * 
	 * @param hierType
	 */
	_showPieWithDifferentMode : function(hierType) {
		var pieData = rs.model.ModelMng.getSpendDataModel4Pie(hierType);
		if (rs.view.Help.areAllValueZero4PieData(pieData, this.isBudgetModel())) {
			// special case , no pie to draw
			this._addPieToLayout(hierType);
		} else {
			var newPieData = [];
			rs.view.Help.pieDataWipeOffZero(pieData, this.isBudgetModel(),
					newPieData);
			var pie = sap.ui.getCore().byId("pie_" + hierType);
			if (pie) {
				pie.loadNewData(newPieData);
			} else {
				this._addPieToLayout(hierType);
			}

		}
	},

	_invalidatePies : function() {
		//Now pie is put inside the vertical layout, so just invalidate layout is enough
		for (var i=0; i<this.getPieNum(); i++) {
			this._aPieContainer[i].invalidate();
		}
	},
	

	_valueSelector : function(d) {
		return this.isBudgetModel() ? d.Budget : d.Total;
	},

	_createPieheaderInfo : function(hierType, totalText, varianceText, color,
			leftOverText) {
		var oTotaltext = new sap.ui.commons.TextView({
					text : totalText,
					enabled : false,
					design : sap.ui.commons.TextViewDesign.H6
				});

		var oVariancetext = new sap.ui.core.HTML();

		var contentParameter = "<div  style='position:relative;font-size:15px;color:";
		var contentParameterEnd = ";\'>" + varianceText + "</div>";

		oVariancetext.setContent(contentParameter + color + contentParameterEnd);

		var oLeftOver = new sap.ui.commons.TextView({
					text : leftOverText,
					enabled : false,
					design : sap.ui.commons.TextViewDesign.H6
				});
		oLeftOver.addStyleClass("oLeftOverOnPieHeader");

		var oPieName = new sap.ui.commons.TextView({
			enabled : false,
			design : sap.ui.commons.TextViewDesign.H5
		});
		
		//bind to different key
		switch ( hierType) {
			case rs.HierType.Dep: 
				oPieName.bindText("i18n>SpendingByDepartments");
				break;
			case rs.HierType.Exp: 
				oPieName.bindText("i18n>SpendingByExpenseTypes");
				break;
			case rs.HierType.Prj: 
				oPieName.bindText("i18n>SpendingByProjects");
				break;
		}
	
		var varianceLayout = new sap.ui.commons.layout.HorizontalLayout({
					content : [oVariancetext, oLeftOver]
				});
		
		//find out the container
		var idx = this.getIndexFromHierType(hierType);
		var container = this._aHeaderContainer[idx];

		//first delete the old
		rs.util.Util.destroyContentEffectively(container);
		
		//then add new content
		container.addContent(oPieName);
		container.addContent(oTotaltext);
		container.addContent(varianceLayout);
	},

	_addPieHeaderInfoToLayout : function(hierType) {

		  var hierNodeId = rs.model.HierMng.getTopHierIdByType(hierType);
		  var oModelInfo = this.getSpendDataModelInfo(hierNodeId);
		  
		  var bindPath = this.getBindPath(hierNodeId);
		  
		  var total = oModelInfo.getSAPModel().getProperty(bindPath+"Total");
		  var variance = oModelInfo.getSAPModel().getProperty(bindPath+"Variance");
		  var variancePercentage = oModelInfo.getSAPModel().getProperty(bindPath+"VariancePercentage");
		  var variancePercentageFormat = rs.view.Help.formatVariancePercentage(variancePercentage);
			  
		  var varianceColor = rs.view.getColorByVariancePercentage(variancePercentage,total);
			    
		  var leftOver = variancePercentage == undefined ? " " : variance >= 0 ? rs.getText("Left") : rs.getText("Over");
		  var totalFormat =  rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(total)+ " "+rs.getText("Spent");			
		  var varianceFormat = variancePercentage == undefined ? variancePercentageFormat : 
		                  rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(Math.abs(variance))+variancePercentageFormat;
		  this._createPieheaderInfo(hierType,totalFormat,varianceFormat,varianceColor,leftOver);		   
      },
      
      /**
       * ??not good, change soon
       * Calculate the pie coordination: width, height, outer and inner radius 
       */
      calculatePieCoordination :function(){
    	var cellWidth = this.getMainContentWidth() / this.getPieNum();
    	
    	cellWidth = Math.round( cellWidth * 0.8); //as normally width is bigger,so use a small factor
		
    	//first remove the pie header part
		var height = this.getMainContentHeight() - this.PieHeaderHeigh;
		height = Math.round(height * 0.9);

		var minValue = Math.min(cellWidth, height);
		var pieParam = {};
		pieParam.width = minValue;
		pieParam.height = minValue;

		pieParam.outerRadius = Math.round((pieParam.width - 100) / 2);
		pieParam.innerRadius = Math.round(pieParam.outerRadius / 2);

		return pieParam;
	},

	_addPieToLayout : function(hierType) {
		var idx = this.getIndexFromHierType(hierType);
		var container = this._aPieContainer[idx];

		//first delete old content
		rs.util.Util.destroyContentEffectively(container);
		
		if (this.pieParam == null)
			this.pieParam = this.calculatePieCoordination();

		var pieData = rs.model.ModelMng.getSpendDataModel4Pie(hierType);

		if (rs.view.Help.areAllValueZero4PieData(pieData, this.isBudgetModel())) {
			var oTextView = new sap.ui.commons.TextView({
						semanticColor : sap.ui.commons.TextViewColor.Negative,
						design : sap.ui.commons.TextViewDesign.H4
						
					}).addStyleClass("noDrawPieForAllDataZero");
			oTextView.setText(rs.getText("NoPieToDraw"));

			container.addContent(oTextView);

		} else {
			var newPieData = [];
			rs.view.Help.pieDataWipeOffZero(pieData, this.isBudgetModel(),newPieData);

			var that = this;
			var pie = new rs.uilib.Pie("pie_" + hierType, {
						data : newPieData,
						width : that.pieParam.width,
						height : that.pieParam.height,
						outerRadius : that.pieParam.outerRadius,
						innerRadius : that.pieParam.innerRadius,
						useDefaultTooltip: false,
						tooltipSelector : rs.view.tooltipSelector,
						colorSelector : rs.view.colorSelector,
						valueSelector : function(d) {
							return that._valueSelector(d);
						},
						rotatable : false,
					});

			var controller = this.getController();
			pie.attachSelect(controller.onSelectPieSlice, controller);

			pie.attachMouseOutSlice(this._mouseOutPieSlice, this);
			pie.attachMouseOnSlice(this._mouseOverPieSlice, this);

			container.addContent(pie);
		}

	},

		

	getIndexFromHierType : function(hierType) {
		var idx = -1;
		switch (hierType) {
			case rs.HierType.Dep :
				idx = 0;
				break;
			case rs.HierType.Exp :
				idx = 1;
				break;
			case rs.HierType.Prj :
				idx = 2;
				break;
			default :
				rs.assert(false);
				break;
		}
		return idx;
	},

	_createOverviewHeader : function() {
		var headerData = new sap.ui.commons.layout.AbsoluteLayout(	this.createId('headerData'), 
							{ height : this.ViewHeaderHeight + "px"	}).addStyleClass("headerData");
		
		var oHeaderTextViewName = new sap.ui.commons.TextView(this.createId('headerDataName'), 
				{
					textAlign : "Left",
					enabled : false,
					text : "{i18n>SpendingOverview}"
				}).addStyleClass("headerDataName");
		
		this.oHeaderTextViewYearofDate = new sap.ui.commons.TextView(this.createId('headerDataYearofDate'), 
				{
					textAlign : "Left",
					enabled : false
				}).addStyleClass("headerDataYearofDate");
		
		headerData.addContent(oHeaderTextViewName, {
					left : "10px",
					top : "0px"
				});

		headerData.addContent(this.oHeaderTextViewYearofDate, {
					left : "10px",
					top : "30px"
				});
		this.oHeaderTextViewYearofDate.bindText(rs.view.Help.getTimePeriod(),
				rs.view.Help.formatTimePeriod);

		// Then create the budget/spending parts
		var btnBudget = new sap.ui.commons.Button({
					id : this.createId(this.BtnBudget),
					text : "{i18n>Budget}",
					textAlign : "Center",
					width : "80px",
					height : "40px"
				});
		var btnSpending = new sap.ui.commons.Button({
					id : this.createId(this.BtnSpend),
					text : "{i18n>Spending}",
					textAlign : "Center",
					width : "80px",
					height : "40px"
				});

		// set the enum data, so later easy know which model type
		btnBudget.setRSEnumData(this.ModelType.Budget);
		btnSpending.setRSEnumData(this.ModelType.Spending);

		// create the segment for switch between Budget and Spending
		this._oSBBudgetSpend = new sap.ui.commons.SegmentedButton({
					id : this.createId("sbtn_budgetSpend"),
					// tips: so later easily change the mode
					buttons : [btnBudget, btnSpending]
				});

		this._oSBBudgetSpend.setSelectedButton(this.createId(this.BtnBudget));

		headerData.addContent(this._oSBBudgetSpend, {
					left : "45%",
					top : "0px"
				});

		headerData.setWidth('100%');
		return headerData;
	},

	/**
	 * Create two layout cells for the project, as the project may
	 * appear/disappear, so here save it to global variable for re-user later
	 */
	_createPrjTwoLayoutCellsAndContainer : function() {
		if (this._aPrjLayoutCell.length != 0)
			return this._aPrjLayoutCell;

		var oCell_02 = new sap.ui.commons.layout.MatrixLayoutCell({
					id : 'overViewMatrixCell-0-2',
					hAlign : sap.ui.commons.layout.HAlign.Center
				});
		var oCell_12 = new sap.ui.commons.layout.MatrixLayoutCell({
					id : 'overViewMatrixCell-1-2',
					hAlign : sap.ui.commons.layout.HAlign.Center,
					vAlign : sap.ui.commons.layout.VAlign.Top
				});
		
		//Now the header and pie put under VerticalLayout,so need create it here also
		var headerContainer = new sap.ui.commons.layout.VerticalLayout();
		this._aHeaderContainer.push(headerContainer);
		oCell_02.addContent(headerContainer);
		
		
		var pieContainer = new sap.ui.commons.layout.VerticalLayout();
		this._aPieContainer.push(pieContainer);
		oCell_12.addContent(pieContainer);
		
		this._aPrjLayoutCell.push(oCell_02);
		this._aPrjLayoutCell.push(oCell_12);
		return this._aPrjLayoutCell;
	},

	_createMainPart : function(pieNum) {
		var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed : false,
					columns : pieNum,
					width : "100%"
					,
				});

		oMatrixLayout.addStyleClass("rsOverviewMatrixLayout");
		var rowHeader = new sap.ui.commons.layout.MatrixLayoutRow({
					height : this.PieHeaderHeigh + 'px'
				});
		var rowPie = new sap.ui.commons.layout.MatrixLayoutRow({
					id : 'overViewPieRow'
				});
		oMatrixLayout.addRow(rowHeader);
		oMatrixLayout.addRow(rowPie);
		oMatrixLayout.setWidths(["50%", "50%"]);

		// first add 2 * 2 cells: ( As the l of cell and 1 is too easy to
		// confuse, so here add an _ to separate them)
		var oCell_00 = new sap.ui.commons.layout.MatrixLayoutCell({
					id : 'overViewMatrixCell-0-0',
					hAlign : sap.ui.commons.layout.HAlign.Center
				});
		var oCell_01 = new sap.ui.commons.layout.MatrixLayoutCell({
					id : 'overViewMatrixCell-0-1',
					hAlign : sap.ui.commons.layout.HAlign.Center
				});

		var oCell_10 = new sap.ui.commons.layout.MatrixLayoutCell({
					id : 'overViewMatrixCell-1-0',
					hAlign : sap.ui.commons.layout.HAlign.Center,
					vAlign : sap.ui.commons.layout.VAlign.Top
				});
		var oCell_11 = new sap.ui.commons.layout.MatrixLayoutCell({
					id : 'overViewMatrixCell-1-1',
					hAlign : sap.ui.commons.layout.HAlign.Center,
					vAlign : sap.ui.commons.layout.VAlign.Top
				});
		rowHeader.addCell(oCell_00);
		rowHeader.addCell(oCell_01);

		rowPie.addCell(oCell_10);
		rowPie.addCell(oCell_11);

		// Now create 2 header and  pie container so later can directly control it: as the third will handler later
		for (var i = 0; i < 2; i++) {
			this._aHeaderContainer.push(new sap.ui.commons.layout.VerticalLayout());

			this._aPieContainer.push(new sap.ui.commons.layout.VerticalLayout());
		}

		// and add them to the cells now
		oCell_00.addContent(this._aHeaderContainer[0]);
		oCell_01.addContent(this._aHeaderContainer[1]);

		oCell_10.addContent(this._aPieContainer[0]);
		oCell_11.addContent(this._aPieContainer[1]);

		// then add the last 2 cells if project exists
		if (pieNum == 3) {
			oMatrixLayout.setWidths(["33%", "34%", "33%"]);

			var aCell = this._createPrjTwoLayoutCellsAndContainer();

			rowHeader.addCell(aCell[0]);
			rowPie.addCell(aCell[1]);
		}

		return oMatrixLayout;
	},

	

	// Now the header and pie use a vertical layout is for performance issue
	_aHeaderContainer : [], // the header container,
	_aPieContainer : [], // the pie container

	// two layout cells for the project
	_aPrjLayoutCell : [],
	_oContentLayout : null, // for the pie header and real pie
	_oMainLayout : null, // view part text header and _oContentLayout

	BtnBudget : 'btn_budget',
	BtnSpend : 'btn_spend',

	// Some static config value
	ViewHeaderHeight : 55, // the height for the view header text part
	PieHeaderHeigh : 100
		// the height for the the text header above the pie
});
