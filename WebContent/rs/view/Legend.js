rs.view.Legend = {
	init : function() {

		this._oTextViewOfGood = new sap.ui.commons.TextView({
			enabled : false
		});
		this._oTextViewOfAverage = new sap.ui.commons.TextView({
			enabled : false
		});
		this._oTextViewOfBad = new sap.ui.commons.TextView({
			enabled : false
		});
		this._oTextViewOfCommit = new sap.ui.commons.TextView({
			enabled : false
		});

		this._blockOfGood = new sap.ui.core.HTML();
		this._blockOfAverage = new sap.ui.core.HTML();
		this._blockOfBad = new sap.ui.core.HTML();
		this._blockOfCommit = new sap.ui.core.HTML();
		
		this._layoutOfGood = new sap.ui.commons.layout.HorizontalLayout(
				"layoutOfGood", {
					content : [ this._blockOfGood, this._oTextViewOfGood ]
				});
		this._layoutOfGood.addStyleClass('sapUiHLayout_in_item');

		this._layoutOfAverage = new sap.ui.commons.layout.HorizontalLayout(
				"layoutOfAverage", {
					content : [ this._blockOfAverage, this._oTextViewOfAverage ]
				});
		this._layoutOfAverage.addStyleClass('sapUiHLayout_in_item');

		this._layoutOfBad = new sap.ui.commons.layout.HorizontalLayout(
				"layoutOfBad", {
					content : [ this._blockOfBad, this._oTextViewOfBad ]
				});
		this._layoutOfBad.addStyleClass('sapUiHLayout_in_item');

		this._layoutOfCommit = new sap.ui.commons.layout.HorizontalLayout(
				"layoutOfCommit", {
					content : [ this._blockOfCommit, this._oTextViewOfCommit ]
				});
		this._layoutOfCommit.addStyleClass('sapUiHLayout_in_item');

		this._legendLayout = new sap.ui.commons.layout.HorizontalLayout(
				"legendlayout", {
					content : [ this._layoutOfGood, this._layoutOfAverage,
							this._layoutOfBad, this._layoutOfCommit ]
				});

		this._legendLayout.addStyleClass('sapUiHLayout_items');

		this.showLegend(rs.view.LegendMode.Main);

		rs.cfg.Cfg.addChangeListener(this.onConfigChanged, this, null);

		this._legendLayout.placeAt("legend-view");

	},

	onConfigChanged : function(aEvent) {

		if (rs.cfg.ChangeEvent.isContainsOneEventAtLeast([
				rs.cfg.ChangeEvent.GoodThreshold,
				rs.cfg.ChangeEvent.BadThreshold ], aEvent)) {
			// re update the budget ratio text
			this._updateLegendText();

		}

		if (rs.cfg.ChangeEvent.isContainEvent(rs.cfg.ChangeEvent.ColorScheme,
				aEvent)) {
			// re update the budget ratio image
			this._updateLegendImage();

		}

	},

	/* create the color theme of budget ratio */
	showLegend : function(mode) {
		this._legendLayout.setVisible(true);
		$("#legend-view").css("display", "inline");

		switch (mode) {
		case rs.view.LegendMode.Main:
		case rs.view.LegendMode.TrendTable:
			this._showLegendMain();
			this._layoutOfCommit.setVisible(false);
			break;

		case rs.view.LegendMode.Detail:
			this._showLegendDetail();
			this._layoutOfCommit.setVisible(true);
			break;

		case rs.view.LegendMode.TrendBar:
			this._showLegendTrendBar();
			this._layoutOfCommit.setVisible(true);
			break;

		case rs.view.LegendMode.TrendArea:
			this._showLegendTrendArea();
			this._layoutOfCommit.setVisible(true);
			break;

		case rs.view.LegendMode.Empty:
			this._legendLayout.setVisible(false);
			//also hide it's parent div
			$("#legend-view").css("display", "none");
			break;

		default:
			rs.assert(false);
			break;
		}

	},

	_showLegendMain : function() {
		this._updateLegendImage();
		this._updateLegendText();
	},

	_showLegendDetail : function() {
		this._updateLegendImage();
		this._updateLegendText();

		this._oTextViewOfCommit.bindText("i18n>Committed");

		this._blockOfCommit.setContent(this
				._buildHTML4Content(rs.view.LegendUI.Color.CommitThreshold));
	},

	_showLegendTrendBar : function() {
		this._oTextViewOfGood.bindText("i18n>ActualAndCommittedSpending");
		
		this._blockOfGood.setContent(this
				._buildHTML4Content(rs.view.LegendUI.Color.GoodThreshold));
		
		this._oTextViewOfAverage.bindText("i18n>ProjectSpending");
		
		this._blockOfAverage.setContent(this
				._buildHTML4Content(rs.view.LegendUI.Color.AverageThreshold));
		
		this._oTextViewOfBad.bindText("i18n>PreviousYearSpending");
		
		this._blockOfBad.setContent(this
				._buildHTML4Content(rs.view.LegendUI.Color.BadThreshold));
		
		this._oTextViewOfCommit.bindText("i18n>Budget");
		
		this._blockOfCommit.setContent(this._budgetBlock);
	},

	_showLegendTrendArea : function() {

		this._oTextViewOfGood.bindText("i18n>ActualAndCommittedSpending");
		
		this._blockOfGood.setContent(this
				._buildHTML4Content(rs.view.LegendUI.Color.GoodThreshold));
		
		this._oTextViewOfAverage.bindText("i18n>PreviousYearSpending");
		
		this._blockOfAverage.setContent(this
				._buildHTML4Content(rs.view.LegendUI.Color.BadThreshold));
		
		this._oTextViewOfBad.bindText("i18n>ProjectSpending");
		
		this._blockOfBad.setContent(this._prjSpendBlock);

		this._oTextViewOfCommit.bindText("i18n>Budget");
		
		this._blockOfCommit.setContent(this._budgetBlock);
	},

	_updateLegendImage : function() {
		var colorArray = rs.cfg.Cfg.getColorScheme();

		this._blockOfGood.setContent(this._buildHTML4Content(colorArray[0]));
		this._blockOfAverage.setContent(this._buildHTML4Content(colorArray[1]));
		this._blockOfBad.setContent(this._buildHTML4Content(colorArray[2]));
	},

	_updateLegendText : function() {

		this._oTextViewOfGood.setText("<="
				+ Math.round(rs.cfg.Cfg.getGoodThreshold() * 100) + "% "
				+ rs.getText("Budget"));

		this._oTextViewOfAverage.setText(Math.round(rs.cfg.Cfg
				.getGoodThreshold() * 100)
				+ "% - "
				+ Math.round(rs.cfg.Cfg.getBadThreshold() * 100)
				+ "% " + rs.getText("Budget"));

		this._oTextViewOfBad.setText(">="
				+ Math.round(rs.cfg.Cfg.getBadThreshold() * 100) + "% "
				+ rs.getText("Budget"));

	},

	_buildHTML4Content : function(color) {

		var content = "<div  style='width:" + rs.view.LegendUI.Block_Size
				+ ";height:" + rs.view.LegendUI.Block_Size
				+ ";background-color:" + color + ";'></div>";
		if(color == rs.view.LegendUI.Color.CommitThreshold){
			content = "<div  class='budget_bar_committed' style='width:" + rs.view.LegendUI.Block_Size
			+ ";height:" + rs.view.LegendUI.Block_Size
			+ ";background-color:" + color + ";'></div>";
		}else if(color ==rs.view.LegendUI.Color.AverageThreshold){
			var blockSize = Number(rs.view.LegendUI.Block_Size.replace('px',''))-2+'px';
			content = "<div  style='width:" + blockSize
			+ ";height:" + blockSize
			+ ";border-color:" + color + ";border-style:dashed;border-width:2px;'></div>";
		}
		return content;
	},

	_prjSpendBlock : "<div  style='color:#93BDEC;margin-top:8px;border-style:dashed ;width:31px'></div>",

	_budgetBlock : "<div  style='position:relative;top:8px;width:30px;height:4px;background-color:black;'></div>",

	_legendLayout : null,
	_oTextViewOfGood : null, // show "<=95% Budget" ,"Actual and Committed
	// Spending",etc
	_oTextViewOfAverage : null, // show "95%-105% Budget", "Project Spending",
	// etc
	_oTextViewOfBad : null, // show ">=105% Budget", "Previous Year
	// Spending", etc
	_oTextViewOfCommit : null, // show "Committed"
	_blockOfGood : null, // for the above corresponding image
	_blockOfAverage : null,
	_blockOfBad : null,
	_blockOfCommit : null,
};