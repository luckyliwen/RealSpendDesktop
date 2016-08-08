//==now jsut use a vertical Layout to show the navigation bar and real content
//now for simple, one anchor will continue with one seperator ( > ). 
rs.view.NaviBar = function(naviMng, hierType) {
    this._oMainControl = null;
    this._naviMng = naviMng;
    this._links = [];
    this._hierType = hierType;
    this.init();
};


rs.view.NaviBar.prototype = {
    
    /**
     * Create the control frame, later need adjust the content by call push/pop 
     */
    init: function() {
        
        if(rs.cfg.Cfg.mobile())
        {
            this._oMainControl = new sap.ui.commons.layout.AbsoluteLayout({height : "50px"});
            
            this._oMainControl.addStyleClass("naviHeader");
            
            this._oAppName = new sap.ui.commons.TextView(this._naviMng.getId() + "appNameText", {text: "{i18n>AboutLabel}"});
            this._oAppName.setTextAlign(sap.ui.core.TextAlign.Left);
            this._oAppName.setDesign(sap.ui.commons.TextViewDesign.H2);     
            
            if(rs.HierType.Dep == this._hierType)
            {
                this._oAppDescription = new sap.m.Text(this._naviMng.getId() + "appDescription", {text: "{i18n>SpendingByDepartments}"});
            }
            else if(rs.HierType.Exp == this._hierType)
            {
                this._oAppDescription = new sap.m.Text(this._naviMng.getId() + "appDescription", {text: "{i18n>SpendingByExpenseTypes}"});
            }
            else if(rs.HierType.Prj == this._hierType)
            {
                this._oAppDescription = new sap.m.Text(this._naviMng.getId() + "appDescription", {text: "{i18n>SpendingByProjects}"});
            }
            
            this._oAppDescription.setTextAlign(sap.ui.core.TextAlign.Right);
            this._oAppDescription.addStyleClass('appDescription');
            
            this._oMainControl.addContent(this._oAppName, {
                    left : "0px",
                    top : "5px"
                });
            this._oMainControl.addContent(this._oAppDescription,  {
                right : "0px",
                top : "15px"
            });     
            
        }
        else
        {
            this._oMainControl = new sap.ui.commons.layout.HorizontalLayout().addStyleClass('rsNaviBar');
        }
        
    },
    
    reset: function(){
        this._links = [];
        this.displayContent();
    },
    
    displayContent: function(){
        
        this._oMainControl.removeAllContent();
        if(rs.cfg.Cfg.mobile())
        {
            if(this._links.length)
            {
                var oButton = new sap.m.Button({text:this._links[this._links.length -1].naviItem, type:sap.m.ButtonType.Back});
                oButton.attachTap( this.onNaviItemPressed, this);
                
                var oDescription = new sap.m.Text({text: this._links[this._links.length -1].description});
                oDescription.setTextAlign(sap.ui.core.TextAlign.Right);
                oDescription.addStyleClass('appDescription');               
                
                this._oMainControl.addContent(oButton, {
                        left : "10px",
                        top : "0px"
                    });
                    
                this._oMainControl.addContent(oDescription,  {
                    right : "0px",
                    top : "15px"
                });                         
            }
            else
            {
                this._oMainControl.addContent(this._oAppName, {
                        left : "0px",
                        top : "5px"
                    });
                this._oMainControl.addContent(this._oAppDescription,  {
                    right : "0px",
                    top : "15px"
                });             
            }
        }       
        else
        {
            if(this._links.length)
            {
                for(var i=0; i<this._links.length; i++)
                {
                    //for the first time, just add a link, otherwise, first the >, then add the link
                    if(i >= 1)
                    {
                        this._oMainControl.addContent( this._createSeparator());
                    }
                    var link = new sap.ui.commons.Link();
                    link.setText(this._links[i].naviItem);
                    link.addStyleClass("rsNaviMng");
                    link.attachPress( this.onNaviItemPressed, this);
            
                    this._oMainControl.addContent(link);                        
                }
            }
        }       
    },
    
    /**
     * Return the real bar control
     */ 
    getControl: function() {
        return this._oMainControl;
    },
    
    /**
     * Push a new navigation back Item
     * @param mSetting
     */
    push: function(mSetting) {
        this._createNewItem(mSetting);
    },
    
    /**
     * Pop the current navigation item 
     */
    pop: function() {
        
    },
    
    /**
     * Remove all the added navi item
     */
    removeAll: function() {
        this._oMainControl.removeAllContent();
    },
    
    
    onNaviItemPressed: function(oEvent) {

        if(rs.cfg.Cfg.mobile())
        {
            var idx = this._links.length -1;
            this._links.pop();
            this._naviMng.showPageByIdx(idx);   
        }       
        else
        {
            var idx = this._oMainControl.indexOfContent(oEvent.oSource) / 2;
            this._links.splice(idx, this._links.length - idx);
            this._naviMng.showPageByIdx(idx);           
        }
        this.displayContent();    

    },
    
    _createNewItem: function(mSetting) {

        //not the first one then add teh separator
        this._links.push(mSetting);
        this.displayContent();
    },
    
    _createSeparator: function() {
        //use the label is not good, so try image
        //return new sap.ui.commons.Label().setText('>').setWidth('30px');
        return new sap.ui.commons.Image().setSrc('images/arrow_right.png');
    },

};


sap.ui.jsview("rs.view.NaviMng", {
    createContent: function(oController) {
        //do nothing as it don't have any information
    },
    
     getControllerName: function() {
         return null;
     },
     
    doInit: function() {
        //ensure only do it once
        if ( this.getContent().length == 0) {
            //just set the main page as the only content
            this.addContent( this._mainPage);
        }
        
        if ( this._naviBar == null) {
            rs.assert( this._aPages.length ==1 );
            this._naviBar = new rs.view.NaviBar(this, this.getViewData().type);
            
            //just insert it to the 0 position, so can reuse the following code         
            this.insertContent( this._naviBar.getControl(), 0);
        }       
        
    },

    /**
     * This is only called by NaviBar, so no need considerate the NaviBar itself
     * @param idx: 0 means the main page (lowest one), -1 means the topmost
     */
    showPageByIdx: function(idx) {
        /*now will not use -1 if ( idx == -1) {
            this.pop();
        } else 
        */
            
        if (idx ==0) {
            this.showMainPage();
        } else {
            
            //replace the last page
            this._replaceLastContent(this._aPages[idx]);
            
            //also reset the  _aPages:
            var howMany = this._aPages.length - 1 - idx ;
            this._aPages.splice(idx+1, howMany);
        }
        
        var view = rs.view.Help.getActiveView();
        rs.view.Legend.showLegend(view.getLegendMode());
        if( view.setSwtichToolBarButtonStyle != null){
            view.setSwtichToolBarButtonStyle();
        }       
        
        rs.view.Help.setActiveTableHeight();
        
    },
    
    /**
     *  
     */
    showMainPage: function() {
        
        rs.cfg.TimePeriods.reset();
        
        //if just the main view, no need do anything
        if (this._aPages.length>1) {
            
            //reset the content
            this._aPages = [ this._mainPage ];
            
            if (this._naviBar != null) {
                this._naviBar.reset();
            }
            
            
            this.removeAllContent();
            this.addContent(this._mainPage);
            this.insertContent( this._naviBar.getControl(), 0);
        }
    },

    /**
     * Get the current active page which is the topmost page)
     * @returns
     */
    getActivePage: function() {
        return this._aPages[ this._aPages.length -1 ];
    },
    
    getMainPage: function() {
        return this._mainPage;
    },
    
    setMainPage: function(page) {
        this._aPages= [ page ];
        this._mainPage = page;
    },
    
    /**
     * 
     * @param view
     * @param mSetting: if not null and has the .naviItem then use it, otherwise use the previous page's: getTitle()
     */
    push: function(view, mSetting) {
        
        //set the naviMng 
        view.setNaviMng(this);
        
        //first time need create the navi bar, otherwise just add to the bar
        if ( this._naviBar == null) {
            rs.assert( this._aPages.length ==1 );
            this._naviBar = new rs.view.NaviBar(this, this.getViewData().type);
            
            //just insert it to the 0 position, so can reuse the following code         
            this.insertContent( this._naviBar.getControl(), 0);
        } 
        
        //now push the navi itm to the bar
        this._naviBar.push( this._completeNaviSetting(mSetting));
        
        this._aPages.push(view);
        
        this._replaceLastContent(view);
        
        var view = rs.view.Help.getActiveView();
        rs.view.Legend.showLegend(view.getLegendMode());
        rs.cfg.TimePeriods.disable();
        
        rs.view.Help.setActiveTableHeight();        
    },
    
    //set the page to the last one content ( index is 1, as the 0 is the navi bar)
    _replaceLastContent: function(view) {
        //remove the last content
        var contents = this.getContent();
        this.removeContent(  contents[ contents.length -1] );
        rs.assert( this.getContent().length ==1 );
        
        //last one
        this.addContent( view );
    },
    
    /**
     * Complete the setting if it missed some parameter
     * @param mSetting
     */
    _completeNaviSetting: function( mSetting) {
        var ret = {};
        if ( mSetting) {
            ret = mSetting;
        }
        if ( !('naviItem' in ret )) {
            //use the previous's view title
            var lastView = this._aPages[ this._aPages.length -1 ];
            rs.assert( typeof(lastView.getTitle) == 'function');
            ret['naviItem'] = lastView.getTitle(); 
        }
        return ret;
    },

    
    _mainPage: null,
    _aPages: null,  //as all the instance will be be extending by the jQuery.extend(), so here can't set the init value to []
    
    //the navigation bar part, only when it called the push once it will show
    _naviBar: null, 
});