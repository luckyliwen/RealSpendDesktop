/**
 * 
 */

// == put all Spend data related function here, it will handle the return value
// for the SpendingDataByHierarhyNodesAndPeriod
rs.model.SpendData = {

	/**
	 * Add the missing field for the SpendingData
	 */
	addMissingData : function(data, hierField) {
		// ??later need use the $metadata so no need do the parseFloat
		/*
		 * data['Total'] = data.Actual + data.Commited;
		 * 
		 * //for the Variance, >0 means left, <0 means over data['Variance'] =
		 * parseFloat(data.Budget) - data['Total'];
		 * 
		 * //the percentage data['VariancePercentage'] = data['Variance'] /
		 * data.Budget ;
		 * 
		 * data['Name'] = rs.model.HierMng.getNameById( data[hierField ]);
		 * 
		 * //??for the others can add here or just use format function to
		 * display var absVar = Math.abs( data['Variance'] ); var absVarPer =
		 * Math.abs(data['VariancePercentage']) * 100; //just remain the int
		 * value absVarPer = Math.floor(absVarPer);
		 * 
		 * //??now just simple use LeftOver, later need format by the config var
		 * leftOver = "" + absVar + " (" + absVarPer + "%) "; if (
		 * data['Variance'] >=0 ) { leftOver += " Left"; } else { leftOver += "
		 * Over"; } data['LeftOver'] = leftOver;
		 */
		data.Actual = parseFloat(data.Actual);
		data.Commited = parseFloat(data.Commited);
		data.Budget = parseFloat(data.Budget);

		data['Total'] = data.Actual + data.Commited;

		// for the Variance, >0 means left, <0 means over
		data['Variance'] = parseFloat(data.Budget) - data['Total'];

		// the percentage
		data['VariancePercentage'] = data['Variance'] / data.Budget;

		data['Name'] = rs.model.HierMng.getNameById(data[hierField]);

		// ??for the others can add here or just use format function to display
		var absVarPer = Math.abs(data['VariancePercentage']) * 100;
		// just remain the int value
		absVarPer = Math.floor(absVarPer);

		// ??now just simple use LeftOver, later need format by the config
		/*
		 * var leftOver = "Left"; if (data['Variance'] < 0) { leftOver = "Over"; }
		 * data['LeftOver'] = leftOver;
		 */
	},

	getHierFieldByHierType : function(hierType) {
		switch (hierType) {
		case rs.HierType.Dep:
			return 'CCHierarchyNodeID';
		case rs.HierType.Exp:
			return 'CEHierarchyNodeID';
		case rs.HierType.Prj:
			return 'IOHierarchyNodeID';
		default:
			rs.assert(false, "Must be rs.HierType but is " + hierType);
		}
	},

	// If the corresponding structure not existed, then created it
	/**
	 * here, construct tree
	 */
	createStructureByPathArray : function(obj, node, hierNode) {
		var parentNode = rs.model.HierMng.getHierNodeById(hierNode.ParentID);
		var indexPath = [].concat(rs.model.HierMng
				.getIndexPathById(hierNode.HierarchyNodeID));
		var subObj = obj;
		while (indexPath.length > 0) {
			if (!subObj.children) {
				subObj.children = [];
				// here, dont user parentNode.ChildrenNumber, it's not the
				// property from which you can get the exact children number.
				for ( var i = 0; i < parentNode._children.length; i++) {
					subObj.children[i] = {};
				}
			}
			var key = parseInt(indexPath.shift());
			if (indexPath.length == 0) {
				// subObj.children.push(node);
				this.copySimpleData(node, subObj.children[key]);
				return obj;
			}
			subObj = subObj.children[key];
		}

		return obj;
	},

	/**
	 * Add the missing data for the top level after the whole tree structure is
	 * built up
	 */
	/*
	 * addMissingData4TopNode : function(data, spendingTree, hierType) { var
	 * hierField = this.getHierFieldByHierType(hierType);
	 * this.addMissingData(data, hierField);
	 * 
	 * spendingTree['Total'] = data['Total']; spendingTree['Variance'] =
	 * data['Variance']; spendingTree['VariancePercentage'] =
	 * data['VariancePercentage']; spendingTree['Name'] = data['Name'];
	 * spendingTree['LeftOver'] = data['LeftOver']; spendingTree['Actual'] =
	 * data['Actual']; spendingTree['Commited'] = data['Commited'];
	 * spendingTree['Budget'] = data['Budget']; },
	 */

	/**
	 * Copy the simple data (not a object) from source to dest
	 * 
	 * @param {}
	 *            source
	 * @param {}
	 *            dest
	 */
	copySimpleData : function(source, dest) {
		for ( var key in source) {
			if (rs.util.Util.isSimpeJSType(source[key])) {
				dest[key] = source[key];
			}
		}
	},

	/**
	 * 
	 * @param {}
	 *            hierType
	 * @return {}
	 */
	createDescriptonStructForDetail : function(hierType) {
		var ret = {};
		if (hierType == rs.HierType.Dep) {
			ret['Name'] = rs.getText('DepartmentExpenseDescription');
		} else {
			rs.assert(hierType == rs.HierType.Prj);
			ret['Name'] = rs.getText('ProjectExpenseDescription');
		}

		// Also set the grouping flag, so the view know for this just show the
		// name column
		ret['isGroupHeader'] = true;

		// set to invalid value so view know no need draw this
		ret['NoteCount'] = -1;

		return ret;
	},

	/**
	 * For the detail part, the root name should be the name for hierId instead
	 * of byHierId For example for the node CCGH5020 'Development Department",
	 * use hierId=CCGH5020 , byHierId=CEGSPEND to get detail infor, then data
	 * should like { Name: "Development Department" ==> it used by View to show
	 * the header part '0': { ==> The node corresponding to 'All Expense' Name:
	 * 'All Expense' }
	 * 
	 * @param {}
	 *            tree
	 * @param {}
	 *            hierParam
	 */
	setNameValueForTreeRoot : function(tree, hierParam) {
		tree['Name'] = rs.model.HierMng.getNameById(hierParam.hierId);
	},

	/**
	 * 
	 * @param {}
	 *            tree
	 * @param {}
	 *            topmostData
	 * @param {}
	 *            hierParam
	 */
	handleTopmostData : function(tree, topmostData, hierParam) {
		var newTree = {};

		if (rs.model.HierMng.isTopmostHier(hierParam.hierId)
				&& !hierParam.isDetail) {
			// for the over view information, just copy topmost to the tree root
			this.copySimpleData(topmostData, tree);
			return tree;
		} else {
			if (rs.model.HierMng.isExpenseType(hierParam.hierId)) {
				newTree.children = [];
				// for the expense part, need promote by department or project
				if (rs.model.HierMng.isDepartmentType(hierParam.byHierId)) {
					// use 0,1 for department
					newTree.children[0] = this
							.createDescriptonStructForDetail(rs.HierType.Dep);

					newTree.children[1] = tree;

					// the root need set data, just use the topmostData
					if (topmostData) {
						this.copySimpleData(topmostData, newTree.children[1]);
					} else {
						newTree.children[1].CEHierarchyNodeID = hierParam.hierId;
						newTree.children[1].CCHierarchyNodeID = hierParam.byHierId;
						newTree.children[1].Name = rs.model.HierMng
								.getNameById(hierParam.byHierId);
						newTree.children[1].isGroupHeader = true;
					}
					this.setNameValueForTreeRoot(newTree, hierParam);

				} else {
					rs.assert(rs.model.HierMng
							.isProjectType(hierParam.byHierId));

					// use 2,3 for project
					newTree.children[2] = this
							.createDescriptonStructForDetail(rs.HierType.Prj);

					newTree.children[3] = tree;

					// the root need set data, just use the topmostData
					if (topmostData)
						this.copySimpleData(topmostData, newTree.children[3]);
					else {
						newTree.children[3].CEHierarchyNodeID = hierParam.hierId;
						newTree.children[3].IOHierarchyNodeID = hierParam.byHierId;
						newTree.children[3].Name = rs.model.HierMng
								.getNameById(hierParam.byHierId);
						newTree.children[3].isGroupHeader = true;
					}
					this.setNameValueForTreeRoot(newTree, hierParam);
				}
				// copy the spend data for the expense detail
				var indexPath = [].concat(rs.model.HierMng
						.getIndexPathById(hierParam.hierId));
				var hierField = this.getHierFieldByHierType(rs.model.HierMng
						.getTypeById(hierParam.hierId));
				var topExpenseHierId = rs.model.HierMng
						.getTopHierIdByType(rs.HierType.Exp);
				var _topmostData = rs.model.ModelMng._overviewSpendData[topExpenseHierId].odata;
				for ( var i = 0; i < indexPath.length; i++) {
					if (_topmostData[hierField] == hierParam.hierId) {
						break;
					}
					_topmostData = _topmostData.children[indexPath[i]];
				}

				this.copySimpleData(_topmostData, newTree);
			} else {
				// for the department/project, just promote one level

				// Just promote one level
				this.copySimpleData(topmostData, tree);
				newTree.children = [];
				newTree.children[0] = tree;

				// the root need set data alos,
				this.copySimpleData(topmostData, newTree);
				this.setNameValueForTreeRoot(newTree, hierParam);
			}

			this.calculateNoteCountForNoneLeaf(tree);
			return newTree;
		}
	},

	/**
	 * Use depth first to calculate the note number
	 * 
	 * @param {}
	 *            tree
	 */
	calculateNoteCountForNoneLeaf : function(tree) {
		function countNote(parentData) {
			var noteNum = 0;
			if (parentData.NoteCount) {
				noteNum = parentData.NoteCount;
			} else {
				parentData.NoteCount = 0;
			}

			for ( var key in parentData) {
				if (typeof (parentData[key]) == 'object'
						&& !parentData[key].loading) {
					noteNum += countNote(parentData[key]);
					parentData.NoteCount = noteNum;
				}
			}
			return noteNum;
		}

		countNote(tree);
	},

	/**
	 * From two hierId find corresponding note number
	 * 
	 * @param {}
	 *            data
	 */
	addNoteCountForLeaf : function(data) {
		// ??

		var hierGroup = new rs.model.HierGroup(data.CCHierarchyNodeID,
				data.CEHierarchyNodeID, data.IOHierarchyNodeID);

		data['NoteCount'] = rs.model.Note.getNotesNumberByHierarchy(hierGroup,
				data.FiscalYear);
	},

	/**
	 * From the result of SpendingDataByHierarhyNodesAndPeriod, create the
	 * JSONModel required data structure, so it can used by JSONModel the
	 * topmost level is not created: if need created, call another function
	 * 
	 * @param results
	 *            the array of OData.read , call back of data.results
	 * @param hierParam
	 *            from the hierId and byHierId can know how the request come
	 *            from
	 * @returns {}
	 */
	createJSONDataFromArray : function(results, hierParam) {
		var ret = {};
		var topData = null;

		var byHierField = this.getHierFieldByHierType(rs.model.HierMng
				.getTypeById(hierParam.byHierId));

		var maxValue = 0;

		for ( var i = 0; i < results.length; i++) {

			// for the topmost hierNode, ignore it
			// need delete the __metadata, otherwise the sapui5 will treat it as
			// a tree node also
			var data = results[i];
			delete data['__metadata'];

			this.addMissingData(data, byHierField);

			// As the bar chart need the max value, so calculate it here
			maxValue = Math.max(maxValue, data.Total, data.Budget);

			this.addNoteCountForLeaf(data);
			if (rs.model.HierMng.isTopmostHier(data[byHierField])) {
				// Save the top data here as later it need add more information
				topData = data;

				// And the top no need create structure so need continue here
				continue;
			}

			this.createStructureByPathArray(ret, data, rs.model.HierMng
					.getHierNodeById(data[byHierField]));
		}

		// populate those nodes not in the result due to the 0
		// actual/commit/budget

		var that = this;
		var buildEmptyNode = function(hierParam) {
			var data = {
				"Actual" : 0,
				"Budget" : 0,
				"Commited" : 0,
				"Total" : 0,
				"Variance" : 0,
				"VariancePercentage" : 0,
				"EndPeriod" : '',
				"FiscalYear" : rs.cfg.Cfg.getUsedFiscalYear(),
				"StartPeriod" : '',
				"NoteCount" : 0,
				"MaxValue" : 0,
				"CCHierarchyNodeID" : '',
				"CEHierarchyNodeID" : '',
				"IOHierarchyNodeID" : ''
			};
			data["Name"] = rs.model.HierMng.getNameById(hierParam.byHierId);
			var hierField = that.getHierFieldByHierType(rs.model.HierMng
					.getTypeById(hierParam.hierId));

			// here must first set the originalHierField then set the
			// hierField, as for the Overview level, two field is same
			data[hierField] = hierParam.hierId;
			data[byHierField] = hierParam.byHierId;
			that.addNoteCountForLeaf(data);
			return data;
		};

		// populate the data for empty node detail view
		if (results.length == 0) {
			ret = buildEmptyNode(hierParam);
			topData = ret;
		}

		var children = rs.model.HierMng.getChildrenByHierId(hierParam.byHierId);
		for ( var i = 0; i < children.length; i++) {
			var inResult = false;
			for ( var j = 0; j < results.length; j++) {
				if (results[j][byHierField] == children[i]) {
					inResult = true;
					break;
				}
			}
			if (!inResult) {
				var data = buildEmptyNode({
					hierId : hierParam.hierId,
					byHierId : children[i]
				});

				that.createStructureByPathArray(ret, data, rs.model.HierMng
						.getHierNodeById(data[byHierField]));
			}
		}
		// rs.assert(topData != null);
		if (topData) {
			topData.MaxValue = maxValue; // here use MaxValue as other
			// property also use the Upper case
			// for first letter
		}
		ret = this.handleTopmostData(ret, topData, hierParam);

		// ??after create the tree from backend data, some data may be missed,
		// then the sub children is not order by sequence, if so then need add
		// that
		return ret;
	}
};
rs.model.LineItems = {
	addMissingData : function(data) {
		data.Amount = parseFloat(data.Amount);
		if (data.LineItemNumber) {
			data.LineItemNumber = parseInt(data.LineItemNumber);
			data.Name = data.GroupName;
		} else if (data.AttachmentNumber) {
			data.AttachmentNumber = parseInt(data.AttachmentNumber);
		}
	},

	addMissingData4LineItem : function(data, hierType) {
		this.addMissingData(data);
		if (hierType == rs.HierType.Dep) {
			// for department, use CostElement
			data.Name = data.CostElementName;
		} else {
			// for proj, use InternalOrder
			data.Name = data.InternalOrderName;
		}
	},

	createLineItemsJSONDataFromArray : function(results, tree, hierParam) {
		var hierType;
		var type = rs.model.HierMng.getTypeById(hierParam.hierId);
		{
			if (type == rs.HierType.Exp) {
				// for department, use CostElement
				hierType = rs.model.HierMng.getTypeById(hierParam.byHierId);
			} else {
				// for proj, use InternalOrder
				hierType = rs.model.HierMng.getTypeById(hierParam.hierId);
			}
		}

		for ( var i = 0; i < results.length; i++) {
			var lineItem = results[i];
			delete lineItem['__metadata'];
			delete lineItem['Attachments'];

			// Some time the DocumentCreationDate will be null, so the treetable
			// will think it have child, then it will create problem
			// so here just delete it (as now the view just use
			// PostingDateString to get date)
			delete lineItem['DocumentCreationDate'];

			// the status mark to tell if the attachment list is loaded
			if (lineItem.AttachmentNumber > 0) {
				lineItem.loadStatus = rs.LoadStatus.NotStart;
			}
			this.addMissingData4LineItem(lineItem, hierType);
			// use this key, so to keep the bindPath unique for each line item,
			// even the number of
			// line items changed after refresh.
			var key = lineItem.ControllingArea + '-' + lineItem.DocumentNumber
					+ '-' + lineItem.PostingRow;
			tree[hierParam.groupType][hierParam.groupId][key] = lineItem;
		}
	},

	createJSONDataFromArray : function(results, hierParam) {
		var ret = {};

		for ( var i = 0; i < results.length; i++) {
			var summaryItem = results[i];
			delete summaryItem['__metadata'];
			this.addMissingData(summaryItem);
			var groupType = summaryItem.GroupType;
			if (!ret[groupType]) {
				ret[groupType] = {};
			}
			ret[groupType][summaryItem.GroupID] = summaryItem;
			ret[groupType].Name = summaryItem.GroupTypeDesc;
			ret[groupType][summaryItem.GroupID].loadStatus = rs.LoadStatus.NotStart;
			ret[groupType][summaryItem.GroupID]['0'] = {
				loading : true
			};
		}

		this.calculateSpentData(ret);
		return ret;
	},

	calculateSpentData : function(tree) {
		function countSpent(parentData) {
			var amount = 0;
			if (parentData.Amount) {
				amount = parentData.Amount;
			} else {
				parentData.Amount = 0;
			}

			for ( var key in parentData) {
				if (typeof (parentData[key]) == 'object') {
					// '0' is marked for loading or not
					if (key == '0') {
						return parentData.Amount;
					}
					amount += countSpent(parentData[key]);
					parentData.Amount = amount;
				}
			}
			return amount;
		}

		countSpent(tree);
	}
};

rs.model.TendData = {
	addMissingData : function(data) {
		// data.Actual = parseFloat(data.Actual);
		// data.Commited = parseFloat(data.Commited);

		data.Budget = parseFloat(data.Budget);

		data['Total'] = parseFloat(data.Actual) + parseFloat(data.Commited);
		data['LastYearTotal'] = 0; // the default value, will change it later

		// for the Variance, >0 means left, <0 means over
		data['Variance'] = data.Budget - data['Total'];

		// the percentage
		data['VariancePercentage'] = data['Variance'] / data.Budget;

		data.Projection = parseInt(data.Projection);

		// those 2 no need anymore
		delete data.Acutal;
		delete data.Commited;
		delete data.CCHierarchyNodeID;
		delete data.CEHierarchyNodeID;
		delete data.IOHierarchyNodeID;
	},

	/**
	 * Add Period property by month/quarter/year
	 * 
	 * @param {}
	 *            data The big data structure, will add to it directly
	 * @param {}
	 *            periodType
	 */
	addPeriodByPeriodType : function(data, periodType) {
		var period = data.FiscalYear;
		switch (periodType) {
		case rs.PeriodType.Monthly:
			// format like 2012:Month1
			period += ":Month" + parseFloat(data.StartPeriod);
			break;
		case rs.PeriodType.Quarterly:
			// format like 2012:Q1, but the StartPeriod is rs.cfg.Quarter, so
			// need get the nautal index
			period += ":Q"
					+ rs.util.Util.getNaturalIndexForQuarter(data.StartPeriod);
			break;
		case rs.PeriodType.Annual:
			// Just the year enough
			break;
		}

		data.Period = period;
	},

	/**
	 * 
	 * @param {rs.cfg.Quarter}
	 *            quarter
	 */
	getMonthsForQuarter : function(quarter) {
		var ret = [];
		switch (quarter) {
		case rs.cfg.Quarter.Q1:
			ret = [ '001', '002', '003' ];
			break;
		case rs.cfg.Quarter.Q2:
			ret = [ '004', '005', '006' ];
			break;
		case rs.cfg.Quarter.Q3:
			ret = [ '007', '008', '009' ];
			break;
		case rs.cfg.Quarter.Q4:
			ret = [ '010', '011', '012' ];
			break;
		}
		return ret;
	},

	/**
	 * By the FiscalYear check whether is this year or not.
	 * 
	 * @param {}
	 *            data
	 */
	isThisYear : function(data) {
		if (data.FiscalYear == rs.model.GeneralParam.getFiscalYear())
			return true;
		else
			return false;
	},

	/**
	 * <d:FiscalYear>2012</d:FiscalYear> <d:StartPeriod>001</d:StartPeriod>
	 * <d:EndPeriod>012</d:EndPeriod> <d:Budget>2300000.00</d:Budget>
	 * <d:Actual>4127010.00</d:Actual> <d:Commited>0.00</d:Commited>
	 * <d:Projection>4127010.00</d:Projection>
	 * 
	 * @param {}
	 *            tree
	 * @param {}
	 *            quarter
	 */
	addQuarterData : function(tree, quarter) {
		var fields = [ 'Total', 'Budget', 'LastYearTotal', 'Projection' ];

		// just a shortcut
		var monthsData = tree[rs.PeriodType.Monthly];

		// create the init value
		var sum = {};
		for ( var i = 0; i < fields.length; i++) {
			sum[fields[i]] = 0;
		}

		// it like ['001', '002','003'], by those keys we can get the sum info
		var months = this.getMonthsForQuarter(quarter);

		for ( var iMonth = 0; iMonth < months.length; iMonth++) {
			var month = months[iMonth];

			for ( var iField = 0; iField < fields.length; iField++) {
				var field = fields[iField];

				if (monthsData[month])
					sum[field] += monthsData[month][field];
			}
		}

		// Add the Variance also
		// for the Variance, >0 means left, <0 means over
		sum['Variance'] = sum.Budget - sum.Total;

		// the percentage
		sum['VariancePercentage'] = sum['Variance'] / sum.Budget;

		sum['StartPeriod'] = quarter;
		sum['FiscalYear'] = rs.model.GeneralParam.getFiscalYear();
		this.addPeriodByPeriodType(sum, rs.PeriodType.Quarterly);
		// Then add to the tree
		tree[rs.PeriodType.Quarterly][quarter] = sum;
	},

	/**
	 * For the trend data, need do some sum for the quarter and put the LastYear
	 * Spend And as the view part need show data by different period type:
	 * yearly, monthly, quarterly, and we will get all the data once, so we
	 * build it now. The tree like { 'month': { '01': { }, '02': { } },
	 * 'quarter': { 'q1': {} 'q2': {}, }, 'annual': { '2012': {}, '2011': {} } }
	 * 
	 * @param {}
	 *            results
	 * @param {}
	 *            key
	 */
	createJSONDataFromArray : function(results, key) {
		// must be same as the value of rs.PeriodType
		var tree = {
			'month' : {},
			'quarter' : {},
			'annual' : {}
		};

		var thisYear = rs.model.GeneralParam.getFiscalYear();

		for ( var i = 0; i < results.length; i++) {
			var data = results[i];

			delete data['__metadata'];

			this.addMissingData(data);

			// by the fiscalyear, startperiod and end period decide how to add
			// the data
			if (this.isThisYear(data)) {
				if (data.StartPeriod == data.EndPeriod) {
					this.addPeriodByPeriodType(data, rs.PeriodType.Monthly);
					tree[rs.PeriodType.Monthly][data.StartPeriod] = data;
				} else {
					// then it like 001/012
					rs.assert(data.StartPeriod == '001'
							&& data.EndPeriod == '012',
							'TrendData for year not like 001/012');
					this.addPeriodByPeriodType(data, rs.PeriodType.Annual);
					tree[rs.PeriodType.Annual][data.FiscalYear] = data;
				}
			} else {
				// the last year data, need add the needed data to this year

				if (data.StartPeriod == data.EndPeriod) {

					if (data.StartPeriod in tree[rs.PeriodType.Monthly])
						tree[rs.PeriodType.Monthly][data.StartPeriod]['LastYearTotal'] = data.Total;

					// the month, just add to the last year, as backend may not
					// have the value, so need add safely
					/*
					 * rs.util.Util.addKeyValueSafely(
					 * tree[rs.PeriodType.Monthly], data.StartPeriod,
					 * 'LastYearTotal', data.Total);
					 */
				} else {
					// then it like 001/012
					rs.assert(data.StartPeriod == '001'
							&& data.EndPeriod == '012',
							'TrendData for year not like 001/012');

					if (thisYear in tree[rs.PeriodType.Annual])
						tree[rs.PeriodType.Annual][thisYear]['LastYearTotal'] = data.Total;

					// now got the last year total, so can it to the this year
					// spend of: LastYearTotal
					/*
					 * rs.util.Util.addKeyValueSafely(
					 * tree[rs.PeriodType.Annual],
					 * rs.model.GeneralParam.getFiscalYear(), 'LastYearTotal',
					 * data.Total);
					 */

					// also create a new entry
					this.addPeriodByPeriodType(data, rs.PeriodType.Annual);

					tree[rs.PeriodType.Annual][data.FiscalYear] = data;
				}
			}
		}

		// then calculate the quarterly value, only for those non-empty nodes
		if (results.length > 0) {
			this.addQuarterData(tree, rs.cfg.Quarter.Q1);
			this.addQuarterData(tree, rs.cfg.Quarter.Q2);
			this.addQuarterData(tree, rs.cfg.Quarter.Q3);
			this.addQuarterData(tree, rs.cfg.Quarter.Q4);
		}
		return tree;
	}
};

rs.model.ModelMng = {
	/**
	 * Update note count when the note is created or deleted
	 * 
	 * @param {}
	 *            hierId
	 * @param {}
	 *            byHierId:
	 * @param {String}
	 *            opType : add note or delete note
	 */
	updateNoteCount4Tree : function(hierId, byHierId, opType) {
		// here, update note count in two dimensions identified by hierId and
		// byHierId
		for ( var i = 0; i < 2; i++) {
			var theHierId = i == 0 ? hierId : byHierId;
			var theByHierId = i == 0 ? byHierId : hierId;
			var type = rs.model.HierMng.getTypeById(theHierId);

			// here, update the parent's note count in the tree according to the
			// indexPath
			var indexPath = rs.model.HierMng.getIndexPathById(theByHierId);
			var arr = [];
			function updateNote(parentData) {
				parentData.NoteCount += opType == rs.NoteOperation.Add ? 1 : -1;
				var data = parentData;
				for ( var i = 0; i < arr.length; i++) {
					data = data.children[arr[i]];
					if (data == null) {
						return;
					}
					data.NoteCount += opType == rs.NoteOperation.Add ? 1 : -1;
				}
			}

			arr = arr.concat(indexPath);
			var parentData = this._detailSpendData[theHierId] ? this._detailSpendData[theHierId].odata
					: null;

			if (parentData) {
				if (type != rs.HierType.Exp)
					updateNote(parentData.children[0]);
				else {
					var byType = rs.model.HierMng.getTypeById(theByHierId);
					if (byType == rs.HierType.Dep) {
						updateNote(parentData.children[1]);
					} else {
						updateNote(parentData.children[3]);
					}
				}
			}

		}

		// As only the noteNum changed the View part can't show the latest just
		// by setData
		// set the data again so the tree table can show the update
		// this._oSpendDataJSONModel.setData(tree);
	},

	/**
	 * Create a unique key by combine hierid and byHierId together
	 * 
	 * @param {}
	 *            hierId
	 * @param {}
	 *            byHierId
	 */
	createKeyFromHierIdAndByHierId : function(hierId, byHierId) {
		return hierId + "-" + byHierId;
	},

	/**
	 * get bind path for detail
	 * 
	 * @param hierId
	 * @returns
	 */
	getBindPath4Detail : function(hierId) {
		return this._detailSpendData[hierId].modelInfo.getRowInfo();
	},

	/**
	 * get bind path for overview
	 * 
	 * @param hierId
	 * @returns
	 */
	getBindPath4Overview : function(hierId) {
		return this._overviewSpendData[hierId].modelInfo.getRowInfo();
	},

	getSpendData4BarHierarchy : function(hierId) {

		var HierType = rs.model.HierMng.getTypeById(hierId);
		var topId = rs.model.HierMng.getTopHierIdByType(HierType);

		var indexPath = [].concat(rs.model.HierMng.getIndexPathById(hierId));
		var data = this._overviewSpendData[topId].odata;
		for ( var i = 0; i < indexPath.length; i++) {
			if (indexPath.length == 0) {
				return data;
			}
			data = data.children[indexPath.shift()];
		}

		return jQuery.extend(true, {}, data);
	},

	/**
	 * Return the json data for the tree map
	 */
	getSpendData4TreeMap : function(hierType) {
		var topHierId = rs.model.HierMng.getTopHierIdByType(hierType);
		// var data = this._mData.spendData[topHierId];
		return jQuery
				.extend(true, {}, this._overviewSpendData[topHierId].odata);
	},

	/**
	 * get pie data
	 * 
	 * @param hierType
	 * @returns {Array} Todo: when the data is reloaded because of the config's
	 *          change, empty _pieData.
	 */
	getSpendDataModel4Pie : function(hierType) {
		if (this._pieData[hierType]) {
			return this._pieData[hierType];
		}
		var pieArray = [];
		var topHierId = rs.model.HierMng.getTopHierIdByType(hierType);
		var spendData = this._overviewSpendData[topHierId].odata;
		for ( var i = 0; i < spendData.children.length; i++) {
			var hierField = rs.model.SpendData.getHierFieldByHierType(hierType);
			var childSpendData = spendData.children[i];

			// if both the budget and tatal is 0 then no way to show it so
			// can filter it out
			if (childSpendData["Total"] == 0 && childSpendData["Budget"] == 0) {
				continue;
			}

			var obj = {
				"label" : childSpendData["Name"],
				"Total" : childSpendData["Total"],
				"Budget" : childSpendData["Budget"],
				"hierId" : childSpendData[hierField],
				"VariancePercentage" : childSpendData["VariancePercentage"],
				"Actual" : childSpendData["Actual"],
				"Commited" : childSpendData["Commited"],
				"Variance" : childSpendData["Variance"]
			};
			pieArray.push(obj);
		}
		this._pieData[hierType] = pieArray;
		return this._pieData[hierType];
	},

	/**
	 * Get the rs.model.ModelInfo by hier id on the detail level
	 * 
	 * @param {}
	 *            hierId
	 * @return {rs.model.ModelInfo}
	 */
	getSpendDataModelInfo4Overview : function(hierId) {
		if (!(hierId in this._overviewSpendData)) {
			this._overviewSpendData[hierId] = {};
			this._overviewSpendData[hierId].odata = {};
			this._overviewSpendData[hierId].modelInfo = new rs.model.ModelInfo();
		}

		// here, organize the array for the pie
		return this._overviewSpendData[hierId].modelInfo;
	},

	/**
	 * Get the rs.model.ModelInfo by hier id on the detail level
	 * 
	 * @param {}
	 *            hierId
	 * @return {rs.model.ModelInfo}
	 */
	getSpendDataModelInfo4Detail : function(hierId) {
		if (!(hierId in this._detailSpendData)) {
			this._detailSpendData[hierId] = {};
			this._detailSpendData[hierId].odata = {};
			this._detailSpendData[hierId].modelInfo = new rs.model.ModelInfo();
		}

		// here, organize the array for the pie
		return this._detailSpendData[hierId].modelInfo;
	},

	/**
	 * spend data for overview
	 * 
	 * @param hierId
	 * @param fnSucc
	 * @param fnFail
	 * @param context
	 * @param cbData
	 */
	loadSpentData4Overview : function(hierId, fnSucc, fnFail, context, cbData) {
		this._loadSpentDataByHierId(hierId, fnSucc, fnFail, context, cbData,
				false);
	},

	/**
	 * spend data for detail
	 * 
	 * @param hierId
	 * @param fnSucc
	 * @param fnFail
	 * @param context
	 * @param cbData
	 */
	loadSpentData4Detail : function(hierId, fnSucc, fnFail, context, cbData) {
		this._loadSpentDataByHierId(hierId, fnSucc, fnFail, context, cbData,
				true);
	},

	/**
	 * load the overview and detail information
	 * 
	 * @param hierId
	 * @param fnSucc
	 *            the call back function for success
	 * @param fnFail
	 *            the call back function for failure
	 * @param context
	 *            the context which will be used for the call back
	 * @param cbData
	 *            (optional) the extra data used to contain additional
	 *            information
	 * @param detail4Top
	 *            (optional) to tell if it's the detail for top hier node
	 */
	_loadSpentDataByHierId : function(hierId, fnSucc, fnFail, context, cbData,
			isDetail) {

		rs.assert(hierId, 'Must be a avlid HierId');

		// ??need check status to avoid double load
		var _mSpentInfor;
		var _spendData;
		if (isDetail)
			_spendData = this._detailSpendData;
		else
			_spendData = this._overviewSpendData;

		if (!(hierId in _spendData)) {
			_spendData[hierId] = {};
			_spendData[hierId].odata = {};
			_spendData[hierId].modelInfo = new rs.model.ModelInfo();
		}

		_mSpentInfor = _spendData[hierId].modelInfo;

		if (_mSpentInfor.getLoadStatus() == rs.LoadStatus.Pending) {
			return;
		} else if (_mSpentInfor.getLoadStatus() == rs.LoadStatus.Succ) {
			return _mSpentInfor;
		}

		// create params
		_mSpentInfor.startLoading(fnSucc, fnFail, context, cbData);

		var theHierId;
		var theByHierId;

		// support ultimate hierarchy levels, just set numberofLevels=0
		var numberOfLevels = 0;
		if (rs.model.HierMng.isExpenseType(hierId)) {
			// numberOfLevels = 3;
			// for the exp,just reverse
			if (rs.model.HierMng.isTopmostHier(hierId) && !isDetail) {
				theHierId = '';
				theByHierId = rs.model.HierMng
						.getTopHierIdByType(rs.HierType.Exp);
			} else {
				// for expense detail screen, tow odata services needed, first
				// fetch
				// the department spending data, then fetch the project spending
				theHierId = hierId;
				theByHierId = rs.model.HierMng
						.getTopHierIdByType(rs.HierType.Dep);
			}
		} else {
			if (rs.model.HierMng.isTopmostHier(hierId) && !isDetail) {
				theHierId = rs.model.HierMng
						.getTopHierIdByType(rs.HierType.Exp);
				theByHierId = hierId;
				// numberOfLevels = 3;
			} else {
				// detail view for department/project
				theHierId = hierId;
				theByHierId = rs.model.HierMng
						.getTopHierIdByType(rs.HierType.Exp);
				// numberOfLevels = 0;
			}
		}

		var paramMng = new rs.model.FuncParam.SpendingDataByHierarhyNodesAndPeriod(
				theHierId, theByHierId, numberOfLevels);

		rs.model.ODataHelper.read('SpendingDataByHierarhyNodesAndPeriod',
				paramMng.getParams(), this._spendDataLoadSuccCB,
				this._spendDataLoadFailCB, this, {
					hierId : hierId,
					byHierId : theByHierId,
					isDetail : isDetail,
					spendData : _spendData[hierId]
				});
	},

	// ==this init function must be called after finished load HierMng
	init : function() {

		this._initData();
		rs.cfg.Cfg.addChangeListener(this.onConfigChanged, this, null);
	},

	onConfigChanged : function(aEvent) {
		if (rs.cfg.ChangeEvent.isContainEvent(rs.cfg.ChangeEvent.TimePeriod,
				aEvent)) {

			this._initData();

		}
	},

	_spendDataLoadSuccCB : function(data, response, hierParam) {
		/*
		 * create the tree, row data like <d:CCHierarchyNodeID>CCGH5020</d:CCHierarchyNodeID>
		 * <d:CEHierarchyNodeID>CEGSPEND</d:CEHierarchyNodeID>
		 * <d:IOHierarchyNodeID /> <d:FiscalYear>2012</d:FiscalYear>
		 * <d:StartPeriod>001</d:StartPeriod> <d:EndPeriod>006</d:EndPeriod>
		 * <d:Budget>1582000.00</d:Budget> <d:Actual>1457721.00</d:Actual>
		 * <d:Commited>0.00</d:Commited>
		 */
		// ??
		var hierId = hierParam.hierId;

		/*
		 * var obj = rs.model.SpendData.createJSONDataFromArray(data.results,
		 * hierType);
		 */
		// ??here need use the by id to get
		var tree = rs.model.SpendData.createJSONDataFromArray(data.results,
				hierParam);

		// also need set the data to mode
		// ??here even will set multiple time, but it is actually same object,
		// later need avoid set again (==it may cause the model update teh view
		// again)

		this._oSpendDataOverViewJSONModel.setData(this._overviewSpendData);
		this._oSpendDataDetailJSONModel.setData(this._detailSpendData);
		var spendInfo = hierParam.spendData.modelInfo;

		if (hierParam.isDetail)
			spendInfo.setModel(this._oSpendDataDetailJSONModel);
		else
			spendInfo.setModel(this._oSpendDataOverViewJSONModel);

		// if it's expense detail screen, launch the second odata service to
		// fetch
		// the project spending data.
		if (rs.model.HierMng.isExpenseType(hierId)
				&& rs.model.GeneralParam.isPrjAvailable() && hierParam.isDetail) {
			if (rs.model.HierMng.getTypeById(hierParam.byHierId) == rs.HierType.Dep) {
				// create new request to get project infor
				var prjTopHierId = rs.model.HierMng
						.getTopHierIdByType(rs.HierType.Prj);
				var paramMng = new rs.model.FuncParam.SpendingDataByHierarhyNodesAndPeriod(
						hierId, prjTopHierId, 0);

				rs.model.ODataHelper.read(
						'SpendingDataByHierarhyNodesAndPeriod', paramMng
								.getParams(), this._spendDataLoadSuccCB,
						this._spendDataLoadFailCB, this, {
							hierId : hierId,
							byHierId : prjTopHierId,
							isDetail : hierParam.isDetail,
							spendData : hierParam.spendData
						});

				hierParam.spendData.odata = tree;
				// !!Here use return to break
				return;
			} else {
				// the project part data is ready, so need combine two part data
				// together
				rs
						.assert(rs.model.HierMng
								.getTypeById(hierParam.byHierId) == rs.HierType.Prj);

				var departmentData = hierParam.spendData.odata;

				// just copy the children of proj to the tree
				// var arr = departmentData.children.concat(tree.children);
				tree.children[0] = departmentData.children[0];
				tree.children[1] = departmentData.children[1];
			}
		}
		// set the maxvalue expense node
		if (rs.model.HierMng.isExpenseType(hierId)
				&& (!rs.model.HierMng.isTopmostHier(hierId) || (rs.model.HierMng
						.isTopmostHier(hierId) && hierParam.isDetail))) {
			tree.MaxValue = tree.children[1].MaxValue ? tree.children[1].MaxValue
					: 0;
			if (tree.children[3]) {
				tree.MaxValue = tree.children[3].MaxValue ? Math.max(
						tree.children[3].MaxValue, tree.MaxValue)
						: tree.MaxValue;
			}
		}
		hierParam.spendData.odata = tree;
		hierParam.spendData.modelInfo.setRowInfo('/' + hierId + '/odata/');
		hierParam.spendData.modelInfo.onSucc();
	},

	_spendDataLoadFailCB : function(error, hierParam) {
		hierParam.spendData.modelInfo.onFail();
	},

	/**
	 * get summary line item model info by id
	 */
	getLineItemTreeModelInfo : function(hierId, byHierId) {
		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);
		if (!(key in this._mLineItems))
			this._mLineItems[key] = new rs.model.ModelInfo();

		// here, organize the array for the pie
		return this._mLineItems[key];
	},

	/**
	 * load the Generic Summary LineItems
	 * 
	 * @param hierId
	 * @param fnSucc
	 *            the call back function for success
	 * @param fnFail
	 *            the call back function for failure
	 * @param context
	 *            the context which will be used for the call back
	 * @param cbData
	 *            (optional) the extra data used to contain additional
	 *            information
	 */
	loadLineItemTree : function(hierId, byHierId, fnSucc, fnFail, context,
			cbData) {
		rs.assert(hierId, 'Must be a avlid HierId');
		rs.assert(byHierId, 'Must be a avlid byHierId');

		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);
		if (!(key in this._mLineItems)) {
			this._mLineItems[key] = new rs.model.ModelInfo();
		} else if (this._mLineItems[key].getLoadStatus() == rs.LoadStatus.Pending) {
			return;
		} else if (this._mLineItems[key].getLoadStatus() == rs.LoadStatus.Succ) {
			return this._mLineItems[key];
		}

		// create params
		this._mLineItems[key].startLoading(fnSucc, fnFail, context, cbData);

		var paramMng = new rs.model.FuncParam.GenericSummaryItemsByHierarchyNodesAndPeriod(
				hierId, byHierId);

		rs.model.ODataHelper.read('GenericSummaryItemsByHierNodesAndPeriod',
				paramMng.getParams(), this._summaryItemsLoadSuccCB,
				this._summaryItemsLoadFailCB, this, {
					hierId : hierId,
					byHierId : byHierId
				});
	},

	_summaryItemsLoadSuccCB : function(data, response, hierParam) {
		// console.log('Summary Line Items:', data.results);
		var hierId = hierParam.hierId;
		var byHierId = hierParam.byHierId;

		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);

		var obj = rs.model.LineItems.createJSONDataFromArray(data.results,
				hierParam);

		this._mData.lineItemData[key] = obj;

		this._oGenericLineItemsJSONModel.setData(this._mData.lineItemData);

		var summaryItemInfo = this._mLineItems[key];

		summaryItemInfo.setModel(this._oGenericLineItemsJSONModel);
		summaryItemInfo.setRowInfo("/" + key);

		// notify the caller
		this._mLineItems[key].onSucc();
	},

	_summaryItemsLoadFailCB : function(error, hierParam) {
		var key = this.createKeyFromHierIdAndByHierId(hierParam.hierId,
				hierParam.byHierId);

		this._mLineItems[key].onFail();
	},

	/**
	 * load the Generic Summary LineItems
	 * 
	 * @param hierId
	 * @param fnSucc
	 *            the call back function for success
	 * @param fnFail
	 *            the call back function for failure
	 * @param context
	 *            the context which will be used for the call back
	 * @param cbData
	 *            (optional) the extra data used to contain additional
	 *            information
	 */
	loadLineItemDetail : function(hierParam) {
		rs.assert(hierParam.hierId, 'Must be a avlid HierId');
		rs.assert(hierParam.byHierId, 'Must be a avlid byHierId');
		rs.assert(hierParam.groupId, 'Must be a avlid groupId');
		rs.assert(hierParam.groupType, 'Must be a avlid groupType');

		var hierId = hierParam.hierId;
		var byHierId = hierParam.byHierId;
		var groupType = hierParam.groupType;
		var groupId = hierParam.groupId;
		var orderBy = 'Amount desc';
		var skip = 0;
		var top = 10;
		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);

		var paramMng = new rs.model.FuncParam.GenericLineItemsByHierarchyNodesAndPeriod(
				hierId, byHierId, groupId, groupType, orderBy, skip, top);

		rs.model.ODataHelper.read('GenericLineItemsByHierNodesAndPeriod',
				paramMng.getParams(), this._lineItemsLoadSuccCB,
				this._lineItemsLoadFailCB, this, {
					hierId : hierId,
					byHierId : byHierId,
					groupId : groupId,
					groupType : groupType,
					orderBy : orderBy,
					skip : skip,
					top : top
				});
		this._mData.lineItemData[key][groupType][groupId].loadStatus = rs.LoadStatus.Pending;
	},

	_lineItemsLoadSuccCB : function(data, response, hierParam) {
		var hierId = hierParam.hierId;
		var byHierId = hierParam.byHierId;
		var groupType = hierParam.groupType;
		var groupId = hierParam.groupId;
		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);

		// insert line items to the tree.
		delete this._mData.lineItemData[key][groupType][groupId]['0'];
		rs.model.LineItems.createLineItemsJSONDataFromArray(data.results,
				this._mData.lineItemData[key], hierParam);

		this._mData.lineItemData[key][groupType][groupId].loadStatus = rs.LoadStatus.Succ;

		this._oGenericLineItemsJSONModel.setData(this._mData.lineItemData);

	},

	_lineItemsLoadFailCB : function(error, hierParam) {
		var key = this.createKeyFromHierIdAndByHierId(hierParam.hierId,
				hierParam.byHierId);
		var groupId = hierParam.groupId;
		var groupType = hierParam.groupType;
		this._mData.lineItemData[key][groupType][groupId].loadStatus = rs.LoadStatus.Fail;
		this._mData.lineItemData[key][groupType][groupId]['0'] = {
			loading : false,
			error : error.message
		};
	},

	/**
	 * if attachment list of the line item is alreay fetched
	 * 
	 * @param: bindPath: the path in the treetable
	 */
	getAttachmentList : function(path) {
		return this._mAttachmentList[path].List;
	},

	/**
	 * @param path:
	 *            the bindPath of the lineItem
	 */
	getAttachmentListStatus : function(path) {
		if (!this._mAttachmentList[path]) {
			this._mAttachmentList[path] = new rs.model.ModelInfo();
		}
		return this._mAttachmentList[path].getLoadStatus();
	},

	/**
	 * get attachment list
	 * 
	 * @param bindPath
	 *            the bind path used to locate the line item in the tree
	 */
	loadAttachmentListByPath : function(path, fnSucc, fnFail, context, cbData) {
		var indexPath = path.split('/');
		// remove the first element '' in the array.
		indexPath.shift();

		var tempStr = indexPath.pop();
		var keys = tempStr.split('-');

		var _url = 'LineItems(ControllingArea=\'' + keys[0]
				+ '\',DocumentNumber=\'' + keys[1] + '\',PostingRow=\''
				+ keys[2] + '\')/Attachments';

		this._mAttachmentList[path].startLoading(fnSucc, fnFail, context,
				cbData);

		rs.model.ODataHelper.read(_url, null, this._attachmentListSuccCB,
				this._attachmentListFailCB, this, {
					path : path
				});
	},

	/**
	 * success callback for attachment list
	 */
	_attachmentListSuccCB : function(data, response, attachParam) {
		// attachment list
		// id,title,updated,content,link
		var path = attachParam.path;

		this._mAttachmentList[path].List = data.results;
		this._mAttachmentList[path].onSucc();
	},

	/**
	 * failed callback for attachment list
	 */
	_attachmentListFailCB : function(error, attachParam) {
		this._mAttachmentList[attachParam.path].onFail();
	},

	/**
	 * get the status of the content, NOT_STARTED, Pending,Succ,Fail
	 * 
	 * @param attachId
	 */
	getAttachmentContentStatus : function(attachId) {
		if (!this._mAttachmentContent[attachId]) {
			this._mAttachmentContent[attachId] = new rs.model.ModelInfo();
		}

		return this._mAttachmentContent[attachId].getLoadStatus();
	},

	/**
	 * @param attachId
	 */
	getAttachmentContent : function(attachId) {
		return this._mAttachmentContent[attachId].content;
	},

	/**
	 * 
	 * @param attchId
	 * @param fnSucc
	 * @param fnFail
	 */
	loadAttachmentContentById : function(attachId, fnSucc, fnFail, context,
			cbData) {
		this._mAttachmentContent[attachId].startLoading(fnSucc, fnFail,
				context, cbData);

		// load the attachment content
		// url: baseUrl +
		// /Attachments('FOL33000000000004EXT37000000000025')/Content
		var _url = 'Attachments(\'' + attachId + '\')/Content';
		rs.model.ODataHelper.read(_url, null, this._attachmentContentSuccCB,
				this._attachmentContentFailCB, this, {
					attachId : attachId
				});
	},

	/**
	 * success callback for load attachment content
	 */
	_attachmentContentSuccCB : function(data, response, contentParam) {
		var attachId = contentParam.attachId;
		this._mAttachmentContent[attachId].content = data.Content;
		this._mAttachmentContent[attachId].onSucc();
	},

	/**
	 * failed callback for load attachment content
	 */
	_attachmentContentFailCB : function(error, contentParam) {
		var attachId = contentParam.attachId;
		this._mAttachmentContent[attachId].error = error;
		this._mAttachmentContent[attachId].onFail();
	},

	/**
	 * @param: userId
	 */
	getUserProfile : function(userId) {
		return this._mUserProfile[userId];
	},

	/**
	 * @param: userId
	 */
	getUserProfileStatus : function(userId) {
		if (!this._mUserProfile[userId]) {
			this._mUserProfile[userId] = new rs.model.ModelInfo();
		}
		return this._mUserProfile[userId].getLoadStatus();
	},

	/**
	 * Load user profile
	 * 
	 * @param userId:
	 */
	loadUserProfileById : function(userId, fnSucc, fnFail, context, cbData) {
		this._mUserProfile[userId]
				.startLoading(fnSucc, fnFail, context, cbData);
		var _url = 'Users(\'' + userId + '\')';

		rs.model.ODataHelper.read(_url, null, this._userProfileSuccCB,
				this._userProfileFailCB, this, {
					userId : userId
				});
	},

	/**
	 * load user profile successful
	 */
	_userProfileSuccCB : function(data, response, param) {
		var userId = param.userId;
		if (data) {
			rs.model.SpendData.copySimpleData(data, this._mUserProfile[userId]);
		}
		this._mUserProfile[userId].onSucc();
	},

	/**
	 * load user profile fail
	 */
	_userProfileFailCB : function(error, param) {
		this._mUserProfile[param.userId].onFail();
	},

	/**
	 * Get the rs.model.ModelInfo by hier id and by hierId
	 * 
	 * @param {}
	 *            hierId
	 * @return {rs.model.ModelInfo}
	 */
	getTrendDataModelInfo : function(hierId, byHierId) {
		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);

		if (!(key in this._mTrendInfor))
			this._mTrendInfor[key] = new rs.model.ModelInfo();

		// here, organize the array for the pie
		return this._mTrendInfor[key];
	},

	/**
	 * load the overview and detail information
	 * 
	 * @param hierId
	 * @param byHierId
	 * @param fnSucc
	 *            the call back function for success
	 * @param fnFail
	 *            the call back function for failure
	 * @param context
	 *            the context which will be used for the call back
	 * @param cbData
	 *            (optional) the extra data used to contain additional
	 *            information
	 */
	loadTrendDataByTwoHierId : function(hierId, byHierId, fnSucc, fnFail,
			context, cbData) {
		// ??need check status to avoid double load
		var key = this.createKeyFromHierIdAndByHierId(hierId, byHierId);

		if (!(key in this._mTrendInfor)) {
			this._mTrendInfor[key] = new rs.model.ModelInfo();
		}

		rs
				.assert(
						this._mTrendInfor[key].getLoadStatus() == rs.LoadStatus.NotStart,
						"It should call the getTrendDataModelInfo() to avoid recall it again");

		// create params
		this._mTrendInfor[key].startLoading(fnSucc, fnFail, context, cbData);

		var paramMng = new rs.model.FuncParam.TrendDataByHierarchyNodes(hierId,
				byHierId);

		rs.model.ODataHelper.read('TrendDataByHierarchyNodes', paramMng
				.getParams(), this._trendDataLoadSuccCB,
				this._trendDataLoadFailCB, this, key);
	},

	/**
	 * 
	 * @param {}
	 *            data
	 * @param {}
	 *            resoponse
	 * @param {}
	 *            key: the key by combine the hierId and byHierId
	 */
	_trendDataLoadSuccCB : function(data, resoponse, key) {

		var tree = rs.model.TendData.createJSONDataFromArray(data.results, key);

		this._mData.trendData[key] = tree;

		var trendInfo = this._mTrendInfor[key];

		trendInfo.setModel(this._oTrendDataJSONModel);
		trendInfo.setRowInfo("/" + key);

		// notify the caller
		this._mTrendInfor[key].onSucc();
	},

	_trendDataLoadFailCB : function(error, key) {
		this._mTrendInfor[key].onFail();
	},

	/**
	 * 
	 */
	_initData : function() {
		/**
		 * data structure store the user profile key: userid value: user profile
		 */
		if (!this._mUserProfile) {
			this._mUserProfile = {};
		}

		/**
		 * The model information for the TrendData key: the combination of
		 * hierId and byHierId
		 * 
		 * @type
		 */
		if (!this._mTrendInfor) {
			this._mTrendInfor = {
				'Detail4Top' : {}
			};
		}

		/**
		 * key: Hier Id, value: rs.model.ModelInfo
		 */
		this._mLineItems = {};

		// key:hierId
		// value:{
		// odata:{}
		// modelInfo:{}
		// }
		this._overviewSpendData = {};

		// key:hierId
		// value:{
		// odata:{}
		// modelInfo:{}
		// }
		this._detailSpendData = {};

		if (!this._mData) {
			// ==the overall json data for all the model, put all the Spend data
			// , line
			// item under one data, so it can easily reuse one json model
			this._mData = {
				trendData : {},
				lineItemData : {}
			};
		} else {
			this._mData.lineItemData = {};
		}

		/**
		 * data structure to store the attachment list and attachment content
		 * key : bindPath value : attachment list (array)
		 */
		this._mAttachmentList = {};

		/**
		 * attachment content cache attachmentId:{ loadStatus: content: }
		 */
		this._mAttachmentContent = {};

		this._bindPaths = {};
		this._pieData = {};
		this._oSpendDataOverViewJSONModel = new sap.ui.model.json.JSONModel();
		this._oSpendDataDetailJSONModel = new sap.ui.model.json.JSONModel();
		this._oGenericLineItemsJSONModel = new sap.ui.model.json.JSONModel();
		if (!this._oTrendDataJSONModel) {
			this._oTrendDataJSONModel = new sap.ui.model.json.JSONModel();
			this._oTrendDataJSONModel.setData(this._mData.trendData);
		}

		this._oGenericLineItemsJSONModel.setData(this._mData.lineItemData);

		// for performance, only one way is enough
		this._oSpendDataOverViewJSONModel
				.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
		this._oSpendDataDetailJSONModel
				.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
		this._oGenericLineItemsJSONModel
				.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

		var that = this;
		var aNodes = rs.model.HierMng.getAllHierIdAsArray();
		// $.each(aNodes, function(idx, node) {
		// that._mSpentInfor[node] = new rs.model.ModelInfo();
		// });
	}

};
