/**
 * rs.view.PageMng  Used to manage several pages which will can switch to active by index  
 */

/**
 * @param parentId  the ID of dom, so all the pages will display as the child for this id
 * @param pages (optional) 
 * @returns {rs.view.PageMng}
 */
rs.view.PageMng = function(parentId, pages) {
	this.parentId = parentId;
	this.aPages = [];
	this.activePageIdx = -1;

	if (pages) {
		for ( var i = 0; i < pages.length; i++) {
			this.addPage(pages[i]);
		}
	}
};

rs.view.PageMng.prototype = {

	/**
	 * 
	 * @param {sap.ui.core.Control} page
	 */
	addPage : function(page) {
		rs.assertControl(page);
		this.aPages.push(page);

		var idx = this.aPages.length -1;
		
		//Just use static;
		var  id = 'sub' + idx;
		page.placeAt(id);

	},

	/**
	 * Remove the last page, and hide the corresponding div if it is show
	 */
	removeLastPage: function() {
		var idx = this.aPages.length -1;
		if ( activePageIdx == idx) {
			this.setActivePage(0);
		}
		
		this.aPages.pop();
	},
	
	/**
	 * 
	 * @param idx
	 */
	setActivePage : function(idx) {
		rs.assertIdxInArray(idx, this.aPages);

		if (this.activePageIdx == idx) {
			return;
		}
		var id;
		//first hide the old, then show the new
		if(this.activePageIdx != -1){
			id = '#sub' + this.activePageIdx;
			$(id).hide('slow');
		}
		
		id = '#sub' + idx;
		$(id).show('slow');

		this.activePageIdx = idx;
	},
	
	/**
	 * Get the current active page
	 * @returns
	 */
	getActivePage: function() {
		return this.aPages[ this.activePageIdx ];
	},

	/**
	 * 
	 * @param {sap.ui.core.Control} page
	 */
	isPageActive : function(page) {
		return this.aPages[this.activePageIdx] == page;
	}
};
