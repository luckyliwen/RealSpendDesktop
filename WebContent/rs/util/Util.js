rs = rs || {};
rs.util = rs.util || {};
rs.util.Util = rs.util.Util || {};

/**
 * 
 */
rs.util.Util.isFinishedLoad = function (sStatus) {
	return sStatus == rs.LoadStatus.Succ   ||  sStatus ==rs.LoadStatus.Fail;
};
/**
 * get current operation system
 */
rs.util.Util.detectOS = function() {    
	var sUserAgent = navigator.userAgent;   
	var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");    
	if (isMac) return "Mac OS";    
	var isUnix = (navigator.platform == "X11") && !isWin && !isMac;    
	if (isUnix) return "Unix";    
	var isLinux = (String(navigator.platform).indexOf("Linux") > -1);    
	if (isLinux) return "Linux";    
	var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows"); 
	if (isWin) {    
		var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;    
		if (isWin2K) return "Windows 2000";    
		var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 ||   
		sUserAgent.indexOf("Windows XP") > -1;    
		if (isWinXP) return "Windows XP";    
		var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;    
		if (isWin2003) return "Windows 2003";    
		var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;    
		if (isWinVista) return "Windows Vista";    
		var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;    
		if (isWin7) return "Windows 7";    
	}    
	return "other";    
};    
/**
 * get browser type
 */
rs.util.Util.detectBrowser = function() 
{ 
	if($.browser.chrome){
		return "Chrome";
	}
	if($.browser.opera){
		return "Opera";
	}
	if($.browser.msie) { 
		return "Internet Explorer";
	} 
	if($.browser.mozilla){ 
		return "Firefox";
	} 
	if($.browser.safari) { 
		return "Safari";
	} 
	return "others";
} ;
/**
 * support placeholder for IE9
 *  @param domObj		: the dom element textarea 
 */
rs.util.Util.addPlaceHolder = function(domObj){
		if(!domObj){
			return;
		}
		var placeholder = domObj.attr("placeholder");
		if(domObj.attr("value") == "" || domObj.attr("value") == placeholder){
			domObj.attr("value",placeholder);
			domObj.addClass("placeholder");
		}
	
		var onFocus = function(obj){
			if(obj.data.attr("class").indexOf("placeholder")!=-1)
			{
				obj.data.removeClass("placeholder");
				if(obj.data.attr("value") == obj.data.attr("placeholder")){
					obj.data.attr("value","");
				}
			}
		};
		
		var onBlur = function(obj){
			if(obj.data.attr("value") == ""){
				obj.data.attr("value", obj.data.attr("placeholder"));
				obj.data.addClass("placeholder");
			}
		};
	
		domObj.bind("focus",domObj,onFocus);
		domObj.bind("blur",domObj,onBlur);
};


/**
 * Some utils used to judge the type
 */
rs.util.Util.isSimpeJSType = function( v ) {
	var t= typeof(v);
	return t =='string' || t == 'number' || t== 'boolean';
};



/**
 * call the destroyContent if it already have content. As when call the destroyContent for an empty layout it still
 * trigger the invalidate 
 * @param {} ctrl
 */
rs.util.Util.destroyContentEffectively = function ( ctrl ) {
	if ( ctrl.getContent() && ctrl.getContent().length > 0 )
		ctrl.destroyContent();
};


/**
 * Add a value with the key to the data under the parentKey safely:
 *           If the parentKey exists,then add it directly
 *           Otherwise, first create the parentkey
 * For example:
 *          data is {},  parentKey=member  key=name value=jack,
 *        After called:
 *                   data = { 'member': { 'name': 'jack'}}
 *                   
 * @param {} data
 * @param {} parentKey
 * @param {} key
 * @param {} value
 */
rs.util.Util.addKeyValueSafely = function(data, parentKey, key, value) {
	if ( !(parentKey in data) ) {
		data[parentKey] = {};
	}
	
	data[parentKey][key] = value;
};


/**
 * Here the error normally is the error return from OData
 */
rs.util.Util.getInforFromError =  function (error) {
	if ( 'message' in error) {
		return error.message;
	} else {
		return error.toString();
	}
};




/**
 * Get the last month by the quarter
 * @param quarter {rs.cfg.Quarter}
 * @return Format is 3 letter (as now the backend format need three digital like '007'
 */
rs.util.Util.getLastMonthForQuarter = function (quarter) {
	var ret = "";
	switch (quarter) {
		case rs.cfg.Quarter.Q1: ret='003'; break;
		case rs.cfg.Quarter.Q2: ret='006'; break;
		case rs.cfg.Quarter.Q3: ret='009'; break;
		case rs.cfg.Quarter.Q4: ret='012'; break;
		default:
			rs.assert(false, 'Quarter ' + quarter + ' wrong, must be {rs.cfg.Quarter}');
	}
	return ret;
};


/**
 * Get the natual index (menas start from 1, as human being call it q1/q2/q3/q4) from the quarter enum 
 * @param {} quarter
 * @return {}
 */
rs.util.Util.getNaturalIndexForQuarter = function (quarter) {
	var ret = -1;
	switch (quarter) {
		case rs.cfg.Quarter.Q1: ret=1; break;
		case rs.cfg.Quarter.Q2: ret=2; break;
		case rs.cfg.Quarter.Q3: ret=3; break;
		case rs.cfg.Quarter.Q4: ret=4; break;
		default:
			rs.assert(false, 'Quarter ' + quarter + ' wrong, must be {rs.cfg.Quarter}');
	}
	return ret;
};
	
/**
 * Format the time period for the Trend data,
 * @param {} period
 * @param {} forAbbreviation :  if true, then the month and quarter use the abbreviation
 */
rs.util.Util.formatPeriod = function( period, forAbbreviation)  {
	/*the period has three type: 
	 1: only year,  like '2012', 
	 2: year and month, like  2012:Month1
	 3: year and quarter, like 2012:Q1
	 */
	if ( period == undefined || period==null ) {
		return "";
	}
	
	var arr = period.split(':');
	if (arr.length == 1) 
		return period;  //Only the year, so just number enough.
		
	//
	var year= arr[0];
	var key = arr[1];
	
	if (forAbbreviation) {
		key += 'Abbr';
	}
	
	//As the month and year need support international, so just get from text
	var format = rs.getText('PeriodFormat');
	//for format like {0}{1} or {1}{0} so we can get the order for different country
	return format.sapFormat( year, rs.getText(key));
};


/**
 * 
 * @param {rs.cfg.Month} month
 */
rs.util.Util.getMonthText = function(month) {
	//??need depend the current language return like 一�? or January
	return month;
};

/**
 * 
 * @param {rs.cfg.Quarter} quarter
 */
rs.util.Util.getQuarterText = function(quarter) {
	//??Later need depend the current language return like 第一季度   or Q1
	return quarter;
};





/**
 * Get the current fiscal quarter
 * @return  {rs.cfg.Quarter}
 */
rs.util.Util.getCurrentQuarter  = function() {
	return rs.util.Util.getQuarterFromPeriod( rs.model.GeneralParam.getPeriod());
};

/**
 * From the Period calculate the current quarter
 * @param period:  like '007'
 * @return  {rs.cfg.OtherTimePeriod.Quarter}
 */
rs.util.Util.getQuarterFromPeriod = function(period) {
	var m = parseFloat(period);
	if ( m<=3) {
		return rs.cfg.Quarter.Q1;
	} else if ( m<=6) {
		return rs.cfg.Quarter.Q2;
	} else if ( m<=9) {
		return rs.cfg.Quarter.Q3;
	} else if (m<=12){
		return rs.cfg.Quarter.Q4;
	} else {
		rs.assert(false);
	}
},


/**
 * Get international text for a month value
 * @param {rs.cfg.Month} month
 */
rs.util.Util.getMonthText = function(month) {
	/*From the month value (m1: '001') we can easily get the key (Month1), so just by a mapping we can get the value
	 */
	
	//here must use parseFloat as otherwise '008' will treat as 0
	var key = "Month" + parseFloat( month);
	return rs.getText(key);
};

/**
 * Add a format for the String, when it is more clear to call format instead of do the pure +, then call this
 
 For example, when you need create a string like  " $1M ( 5%) Left"  or  " $1M ( 5%) Over", without the String.format() function, you code like following:
 
    	leftOver = "$" + amount + "(" + variancePercentage + "%)";
 		if ( remain  >= 0) {
			leftOver += " Left";
		} else {
			leftOver += " Over";
		}
With the format function, it is more easy:
       amount = 1000;
       variancePercentage = 5;
       remain = 995;
	   leftOver = "${0} ({1}% {2})".sapFormat(amount, variancePercentage, remain ? "left" : "Over");   

		printf("%s like eat %s", lucky, apple);
		printf("%s and %s's son like eat %s", lucky, lucky, apple);
		
		"{0} and {0}'s son like eat {1}".sapFormat('lucky', 'apple')

 	here use the name sapFormat instead of normally format is to avoid name conflict.  Otherwise, if some others use the format then it will have conflict
 * @returns
 */
String.prototype.sapFormat = function() {
	  var args = arguments;
	  return this.replace(/{(\d+)}/g, function(match, number) { 
	    return typeof args[number] != 'undefined'
	      ? args[number]
	      : match
	    ;
	  });
};




	
/*************** Hijacking for Gold Reflection *************/
sap.ui.core.BusyIndicator.attachOpen(function(oEvent) {
	if (sap.ui.getCore().getConfiguration().getTheme() == "sap_goldreflection") { // this line is a hack, the rest of this coding is what a BusyIndicator hijacker could do
		rs.util.Util.BusyIndicator.$Busy = oEvent.getParameter("$Busy");
		rs.util.Util.BusyIndicator.iBusyPageWidth = jQuery(document.body).width();
		rs.util.Util.BusyIndicator.$Busy.css("top", "0").css("width", rs.util.Util.BusyIndicator.iBusyPageWidth + "px");
		rs.util.Util.BusyIndicator.bBusyAnimate = true;
		iBusyLeft = rs.util.Util.BusyIndicator.$Busy[0].offsetLeft;
		window.setTimeout(animationStep, rs.util.Util.BusyIndicator.iBusyTimeStep);
	}
});
sap.ui.core.BusyIndicator.attachClose(function(oEvent) {
	rs.util.Util.BusyIndicator.bBusyAnimate = false;
});

rs.util.Util.BusyIndicator = {
	bBusyAnimate : false,
	iBusyLeft : 0,
	iBusyDelta : 60,
	iBusyTimeStep : 50,
	iBusyWidth : 500,
	iBusyPageWidth: 0,
	$Busy:null		
};


function animationStep() {
	if (rs.util.Util.BusyIndicator.bBusyAnimate) {
		rs.util.Util.BusyIndicator.iBusyLeft += rs.util.Util.BusyIndicator.iBusyDelta;
		if (rs.util.Util.BusyIndicator.iBusyLeft > rs.util.Util.BusyIndicator.iBusyPageWidth) {
			rs.util.Util.BusyIndicator.iBusyLeft = -rs.util.Util.BusyIndicator.iBusyWidth;
		}
		rs.util.Util.BusyIndicator.$Busy.css("background-position", rs.util.Util.BusyIndicator.iBusyLeft + "px 0px");
		window.setTimeout(animationStep, rs.util.Util.BusyIndicator.iBusyTimeStep);
	}
}
/*************** END of Hijacking for Gold Reflection *************/

//As now three view will call this by consequence, so need use a count to avoid the shortest overwrite the longest time (just like the reference count)
rs.util.Util.gBusyCount = 0;

rs.util.Util.hideBusyIndicator = function() {
	rs.util.Util.gBusyCount --;
	if (rs.util.Util.gBusyCount == 0) {
		sap.ui.core.BusyIndicator.hide();
	}
},

rs.util.Util.showBusyIndicator = function() {
	if (rs.util.Util.gBusyCount == 0) {
		sap.ui.core.BusyIndicator.show(0);
	}
	rs.util.Util.gBusyCount ++;
},

rs.util.Util.showLoadingIndicator = function(parentId) {
	var div =document.createElement("div");
	div.id = parentId + "--loadingId";
	var ima = document.createElement("img");	
	ima.src="images/loading.gif";
	ima.alt = "loading data";
	div.appendChild(ima);
	
	var parentElement = document.getElementById(parentId);

	var popup = new sap.ui.core.Popup(div, false, false, false);	
	popup.open(0, sap.ui.core.Popup.Dock.CenterCenter, sap.ui.core.Popup.Dock.CenterCenter, parentElement, "-100 -100");
		
	return popup;
},

rs.util.Util.hideLoadingIndicator = function(popup) {	
	/*var parent = document.getElementById("data-view");	
	var div = document.getElementById(parentId + "--loadingId");

	document.getElementById(id).parentNode
	
	if(div != null)
		parent.removeChild(div);*/	
	if(popup)
	{
		popup.close();	
		popup = null;
	}		
	
},

rs.util.Util.commaSplit= function (num) {

    num = num || '',
    formatNum = '';

    formatNum = $.formatNumber(num.toString(), {
            format: '#,##0',
     });
    
    return formatNum;
},


rs.util.Util.toMenoyFormat = function(value) {
	return  rs.cfg.Cfg.getCurrency()+ rs.util.Util.numericPrecisonFormat(value);
},

rs.util.Util.numericPrecisonFormat = function(value) {

	var sValue = "";
	switch(rs.cfg.Cfg.getNumPrecision())
	{
		case rs.cfg.NumPrecision.Full:
			sValue = rs.util.Util.commaSplit(value);
			break;
		case rs.cfg.NumPrecision.Thousand:
			sValue = rs.util.Util.commaSplit(Math.round(value/1000)) ;
			break;
		
		case rs.cfg.NumPrecision.Million:
			sValue = rs.util.Util.commaSplit(Math.round(value/1000000)) ;
			break;
			
		default:
			rs.assert(false);
	}
	return sValue;
},

/*
 * convert "/Date1380000000/" and "2012-09-24T08:00:00" to date object
 */
rs.util.Util.getDateObjectByString = function(strDate) {

	var oDate = null;
	if(strDate)
	{
		var reg1 = /^\/date\(/i;
		var reg2 = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/gi;
		
		if(strDate.match(reg1))   //match "/Date1380000000/"
		{
			var nMilliSecond = parseInt(strDate.match(/[\d]+/));
			oDate = new Date;
			oDate.setTime(nMilliSecond);
		}
		else if(strDate.match(reg2))  //match "2012-09-24T08:00:00"
		{
			var dateArr = strDate.split(/[\-T:]/);
			oDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3], dateArr[4], dateArr[5]);
		}
	}
	return oDate;
},

/*
 * convert "PT09H28M44S" to "09:28:44".  
*/
rs.util.Util.getTimeStringByString = function(strTime) {

	var sTime = "";
	var reg = /^pt\d/i;
	if(strTime.match(reg))
	{
		var reg1 = /(h|m)/gi, reg2 = /(pt|s)/gi;
		sTime = (strTime.replace(reg1, ":")).replace(reg2, "");
	}
	return sTime;
},

/*
 * get MIME type by file extension.
 * will return  undefined if on corresponding MIME type for the  file extension
*/
rs.util.Util.getMimeByFileExtension = function(ext) {
	
    var extToMimes = 
    {
		'png': 'image/png',
		'bmp':	'image/bmp',
		'jpeg':	'image/jpeg',
		'jpg':	'image/jpeg',
		'gif':	'image/gif',
		
		'doc':	'application/msword',
		'docx':	'application/msword',
		'xls':	'application/excel',
		'xlsx':	'application/excel',
		'ppt':	'application/powerpoint',
		'pptx':	'application/powerpoint',
		
		'txt':	'text/plain',
		'mpeg':	'video/mpeg',
		'mpg':	'video/mpeg',
		
		'pdf':	'application/pdf'		       
       
    };		

	if (extToMimes.hasOwnProperty(ext)) 
	{
		return extToMimes[ext];
	}
	else
	{
		return undefined;
	}
	
	
	
},


sap.ui.model.SimpleType.extend("rs.util.numberFormat", {
    formatValue: function(oValue) {
    	
        return rs.util.Util.numericPrecisonFormat(oValue);
    },

});



/***** SAVE TO TEXT FILE help functions******************/
/****doesn't work in IE and safai*****/
var saveAs = saveAs||(function(h){"use strict";var r=h.document,l=function(){return h.URL||h.webkitURL||h;},e=h.URL||h.webkitURL||h,n=r.createElementNS("http://www.w3.org/1999/xhtml","a"),g="download" in n,j=function(t){var s=r.createEvent("MouseEvents");s.initMouseEvent("click",true,false,h,0,0,0,0,0,false,false,false,false,0,null);return t.dispatchEvent(s);},o=h.webkitRequestFileSystem,p=h.requestFileSystem||o||h.mozRequestFileSystem,m=function(s){(h.setImmediate||h.setTimeout)(function(){throw s;},0);},c="application/octet-stream",k=0,b=[],i=function(){var t=b.length;while(t--){var s=b[t];if(typeof s==="string"){e.revokeObjectURL(s);}else{s.remove();}}b.length=0;},q=function(t,s,w){s=[].concat(s);var v=s.length;while(v--){var x=t["on"+s[v]];if(typeof x==="function"){try{x.call(t,w||t);}catch(u){m(u);}}}},f=function(t,u){var v=this,B=t.type,E=false,x,w,s=function(){var F=l().createObjectURL(t);b.push(F);return F;},A=function(){q(v,"writestart progress write writeend".split(" "));},D=function(){if(E||!x){x=s(t);}w.location.href=x;v.readyState=v.DONE;A();},z=function(F){return function(){if(v.readyState!==v.DONE){return F.apply(this,arguments);}};},y={create:true,exclusive:false},C;v.readyState=v.INIT;if(!u){u="download";}if(g){x=s(t);n.href=x;n.download=u;if(j(n)){v.readyState=v.DONE;A();return;}}if(h.chrome&&B&&B!==c){C=t.slice||t.webkitSlice;t=C.call(t,0,t.size,c);E=true;}if(o&&u!=="download"){u+=".download";}if(B===c||o){w=h;}else{w=h.open();}if(!p){D();return;}k+=t.size;p(h.TEMPORARY,k,z(function(F){F.root.getDirectory("saved",y,z(function(G){var H=function(){G.getFile(u,y,z(function(I){I.createWriter(z(function(J){J.onwriteend=function(K){w.location.href=I.toURL();b.push(I);v.readyState=v.DONE;q(v,"writeend",K);};J.onerror=function(){var K=J.error;if(K.code!==K.ABORT_ERR){D();}};"writestart progress write abort".split(" ").forEach(function(K){J["on"+K]=v["on"+K];});J.write(t);v.abort=function(){J.abort();v.readyState=v.DONE;};v.readyState=v.WRITING;}),D);}),D);};G.getFile(u,{create:false},z(function(I){I.remove();H();}),z(function(I){if(I.code===I.NOT_FOUND_ERR){H();}else{D();}}));}),D);}),D);},d=f.prototype,a=function(s,t){return new f(s,t);};d.abort=function(){var s=this;s.readyState=s.DONE;q(s,"abort");};d.readyState=d.INIT=0;d.WRITING=1;d.DONE=2;d.error=d.onwritestart=d.onprogress=d.onwrite=d.onabort=d.onerror=d.onwriteend=null;h.addEventListener("unload",i,false);return a;}(self));

//for IE
var saveInIE = function(data, fileName) {
	if (document.execCommand) {
        var oWin = window.open("about:blank", "_blank");
        oWin.document.write(data);
        oWin.document.close();
        var success = oWin.document.execCommand('SaveAs', true, fileName);
        oWin.close();
        if (!success)
            alert("Sorry, your browser does not support this feature");
    } else {
    	alert("Sorry, your browser does not support save as command");
    }
};

//for Safari, the problem is fileName doesn't work
var saveInSafari = function(data, fileName) {
	//text/plain
	//application/octet-stream
	var uriContent = "data:application/octet-stream;filename=" + fileName + "," + encodeURIComponent(data);
	window.open(uriContent, fileName);
	//alert(newWindow);
};

/*! @source https://github.com/eligrey/Blob.js */
var BlobBuilder=BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||(function(j){"use strict";var c=function(v){return Object.prototype.toString.call(v).match(/^\[object\s(.*)\]$/)[1];},u=function(){this.data=[];},t=function(x,v,w){this.data=x;this.size=x.length;this.type=v;this.encoding=w;},k=u.prototype,s=t.prototype,n=j.FileReaderSync,a=function(v){this.code=this[this.name=v];},l=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),r=l.length,o=j.URL||j.webkitURL||j,p=o.createObjectURL,b=o.revokeObjectURL,e=o,i=j.btoa,f=j.atob,m=false,h=function(v){m=!v;},d=j.ArrayBuffer,g=j.Uint8Array;u.fake=s.fake=true;while(r--){a.prototype[l[r]]=r+1;}try{if(g){h.apply(0,new g(1));}}catch(q){}if(!o.createObjectURL){e=j.URL={};}e.createObjectURL=function(w){var x=w.type,v;if(x===null){x="application/octet-stream";}if(w instanceof t){v="data:"+x;if(w.encoding==="base64"){return v+";base64,"+w.data;}else{if(w.encoding==="URI"){return v+","+decodeURIComponent(w.data);}}if(i){return v+";base64,"+i(w.data);}else{return v+","+encodeURIComponent(w.data);}}else{if(real_create_object_url){return real_create_object_url.call(o,w);}}};e.revokeObjectURL=function(v){if(v.substring(0,5)!=="data:"&&real_revoke_object_url){real_revoke_object_url.call(o,v);}};k.append=function(z){var B=this.data;if(g&&z instanceof d){if(m){B.push(String.fromCharCode.apply(String,new g(z)));}else{var A="",w=new g(z),x=0,y=w.length;for(;x<y;x++){A+=String.fromCharCode(w[x]);}}}else{if(c(z)==="Blob"||c(z)==="File"){if(n){var v=new n;B.push(v.readAsBinaryString(z));}else{throw new a("NOT_READABLE_ERR");}}else{if(z instanceof t){if(z.encoding==="base64"&&f){B.push(f(z.data));}else{if(z.encoding==="URI"){B.push(decodeURIComponent(z.data));}else{if(z.encoding==="raw"){B.push(z.data);}}}}else{if(typeof z!=="string"){z+="";}B.push(unescape(encodeURIComponent(z)));}}}};k.getBlob=function(v){if(!arguments.length){v=null;}return new t(this.data.join(""),v,"raw");};k.toString=function(){return"[object BlobBuilder]";};s.slice=function(y,v,x){var w=arguments.length;if(w<3){x=null;}return new t(this.data.slice(y,w>1?v:this.data.length),x,this.encoding);};s.toString=function(){return"[object Blob]";};return u;}(self));

rs.util.Util.saveTable2CSV = function(table, indent) {
	var vIndent = indent || "    ";
	var targetTable = table;
	//build text
	var csv = "";
	var fileName = targetTable.getId();
	
	var bindingPath = targetTable.mBindingInfos.rows.path;
	if(bindingPath == null || bindingPath == "") {
		//do nothing without binding path
		return;
	}
	
	//get table data from model using binding path
	var tableData = targetTable.getModel().getData();
	$.each(bindingPath.split("/"), function(i, path) {
		//ignore empty string, split will return empty string if the Regx is the first or last char
		if(path != "") {
			tableData = tableData[path];
		}
	});
	
	
	//check columns from table
	var colBindingInfo = [];
	$.each(targetTable.getColumns(), function(i, col) {
		var bindingInfo = {};
		//only handle TextView
		bindingInfo.label = col.getLabel() instanceof sap.ui.commons.Label ? col.getLabel().getText() : col.getLabel().toString();
		var template = col.getTemplate();
		
		if(template instanceof sap.ui.commons.TextView){
			//Normal TextView
			bindingInfo.path = template.mBindingInfos.text.binding.sPath;
			bindingInfo.formatter = template.mBindingInfos.text.formatter;
			bindingInfo.context = template;
			
		} else if (template instanceof rs.uilib.AttachmentNumber  || template instanceof rs.uilib.NoteNumber) {
			//For the NoteNumber and AttachmentNumber also need support
			bindingInfo.path = template.mBindingInfos.count.binding.sPath;
			bindingInfo.formatter = template.mBindingInfos.count.formatter;
			bindingInfo.context = template;
			
		} else if(typeof template.getContent == "function") {
			//assume this is an container controller, like layout, then try to call getContent() to handle the first TextView
			var subControls = template.getContent();
			for(var j = 0; j < subControls.length; j++) {
				if(subControls[j] instanceof sap.ui.commons.TextView) {
					bindingInfo.path = subControls[j].mBindingInfos.text.binding.sPath;
					bindingInfo.formatter = subControls[j].mBindingInfos.text.formatter;
					bindingInfo.context = subControls[j];
					break;
				}
			}
		} else {
			//can't handle now
		}
		
		colBindingInfo[i] = bindingInfo;
	});
	
	//record column label
	for(var i = 0; i < colBindingInfo.length; i++) {
		var bf = colBindingInfo[i];
		if(i != 0) {
			//append an comma if this is not the first column
			csv += ","; 
		}
		csv += bf.label;
	}
	
	/**
	 * Get the correct value by path: if the path is "" then it means the data object itself, otherwise use the path as key
	 */
	function getValueByPath(data, path) {
		if (path == "")
			return data;
		else {
			if (path == 'NoteCount')  {
				//!!For the Notes count, as now it use -1 for the grouping, so need a special handle for this, it is not good but is the most effect way here
				var value = data[path];
				if (value == -1)
					return "";
				else 
					return value;
			} else {
				return data[path];
			}
		}
	}
	
	//scan tableData and get corresponding value
	function scanValue(level, data) {
		//for level 0 row, still try to save it's properties, this may result in a empty line in scv.
		//if need to skip level 0 row, it depends, can support this on demand.
		
		//start in a new line
		csv += "\n";
		
		//retrieve values according to column binding info
		for(var i = 0; i < colBindingInfo.length; i++) {
			var bf = colBindingInfo[i];
			if(i == 0) {
				//column value will be put in a pair of quotes
				csv += "\""; 
				//put preceeding space to indicate level
				for(var k = 0; k < level; k++) {csv += vIndent;}
			} else {
				//append an comma if this is not the first column
				csv += ",\""; 
			}
			var value;
			if(bf.formatter == null) {
				value = getValueByPath(data, bf.path);
				//here need use the === to check with "", otherwise the correct value 0 will == ""
				csv += ( value == null || value === "") ? "NA" : value;
			} else {
				//use context to call the formatter
				value = getValueByPath(data, bf.path);
				var raw_v = bf.formatter.call(bf.context, value);
				csv += (raw_v == null || raw_v === "") ?  "NA" : raw_v;
			}
			csv += "\"";
		}
		
		if(data.children && data.children.length)
		{
			for(var j =0; j<data.children.length; j++)
			{
				scanValue(level + 1, data.children[j]);
			}
		}
	}
	
	scanValue(1, tableData);
	
	if($.browser.msie) {
		saveInIE(csv, fileName+".csv");
	} else if($.browser.safari) {
		//there is a length limitation in URL
		saveInSafari(csv, fileName+".csv");
	} else {
		//try to save to text file
		var bb = new BlobBuilder();
		bb.append(csv);
		saveAs(bb.getBlob("text/plain;charset=utf-8"), fileName + ".csv");
	}
	
};


/*** group rows in table, experimental***/
rs.util.Util.groupRow = function(table) {
	var tableId = table.getId();
	var rows = table.getRows();
	$.each(rows, function(i, row) {
		var cells = row.getCells();
		//if all cells except the first cell are all empty, consider this row as a group title row.
		var groupTitle = true;
		if(cells[0] != null &&  cells[0].mProperties.text == "") {
			groupTitle = false;
		}
		for(var j = 1; j < cells.length; j++) {
			if(cells[j] != null && cells[j].mProperties.text != "") {
				console.log("row: " + i + " cell: " +  j + "-", cells[j]);
				groupTitle = false;
				}
		}
		if(groupTitle) {
			console.log("this row is group title row : " + i, row);
			//do what have to do to customize this row
			var $row = row.$();
			$row.addClass("group-title");
			$row.hide();
			//console.log("jquery rolw", $row);
		}
	});
};


/**
 * show tooltip for pie
 *  
 * @param {object} data  Spending data
 * @param {object} position  Where to put popup
 * @param {object} mouseOverTooltipCallback  Callback function when mouse hover tooltip
 * @param {object} mouseOutTooltipCallback  Callback function when mouse move out tooltip
 * @param {object} cbContext  
 * 
 * @return {object}  reference for popup
 * 
 */
rs.util.Util.showPieTooltip = function(data, position, mouseOverTooltipCallback, mouseOutTooltipCallback, cbContext)
{
	var varianceColor = rs.view.getColorByVariancePercentage(data.VariancePercentage, data.Total);
	var variancePercentageFormat = rs.view.Help.formatVariancePercentage(data.VariancePercentage);
	var leftOver = data.Variance >= 0 ? rs.getText("Left") : rs.getText("Over");
	var varianceFormat = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(Math.abs(data.Variance)) + variancePercentageFormat + leftOver; 		
	
	var strDom = '<div class="pie_tooltip">';
	strDom += '<div class="tri1"></div>';
	strDom += '<div class="tri2">';
	strDom += '<span style = "font-weight:bold;">' + data.label + '</span></br>';

	strDom += '<span style =\"color:' +  varianceColor + '\">' + varianceFormat + '</span></br>'; 
	
	strDom += '<span>' + rs.getText("Actual") + ': ' + rs.cfg.Cfg.getCurrency()	+ rs.util.Util.commaSplit(data.Actual) + '</span> </br>';
	strDom += '<span>' + rs.getText("Committed") + ': ' + rs.cfg.Cfg.getCurrency()	+ rs.util.Util.commaSplit(data.Commited) + '</span> </br>';
	strDom += '<span>' + rs.getText("Budget") + ': ' + rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(data.Budget)+ '</span>';
	strDom += '</div>';
	strDom += '</div>';
		
	var oHTML = new sap.ui.core.HTML();	
	oHTML.setContent(strDom);			

	var popup = new sap.ui.core.Popup(oHTML, false, true, true);	
	var oAt = 
	{
		"left": position[0] + 'px',
		"top":  position[1] + 'px'
	};
	 
	popup.open(0, sap.ui.core.Popup.Dock.CenterCenter , oAt , null, "0, 0");
			
	var tooltip = $('.pie_tooltip');
	tooltip.hover(function(){
		mouseOverTooltipCallback.call(cbContext);
	}, function() {
		mouseOutTooltipCallback.call(cbContext);
	});
			
	return popup;	
};

/*
 *  used to generate expense dom
 * 
 * @param {object} data  Spending data
 * @param {boolean} bShowTrend  Whether to show trend button
 * 
 * @return {string}  string for DOM
 * 
 */
rs.util.Util.composeExpenseDom = function(data, bShowTrend)
{
	var varianceColor = rs.view.getColorByVariancePercentage(data.VariancePercentage,data.Total);
    var leftOver = data.Variance >= 0 ? rs.getText("Left") : rs.getText("Over");
	
    var variancePercentageFormat = rs.view.Help.formatVariancePercentage(data.VariancePercentage);	
    var varianceFormat = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(Math.abs(data.Variance))
    												+variancePercentageFormat + leftOver; 		

	var strDom = '<div class="expenseTip">';
    
	strDom += '<p class="title">' + data.Name + '</p>';
	strDom += '<div class="variance">' + varianceFormat + '</div>';
	strDom += '<div id="details">';
	strDom += '<div class="first-row"><label>' + rs.getText("Actual")+ ':</label><span>' +rs.cfg.Cfg.getCurrency()+ rs.util.Util.numericPrecisonFormat(data.Actual) + '</span></div>';
	strDom += '<div class="second-row"><label>' + rs.getText("Committed") + ':</label><span>' +rs.cfg.Cfg.getCurrency()+ rs.util.Util.numericPrecisonFormat(data.Commited) + '</span></div>';
	strDom += '<div class="third-row"><label>' + rs.getText("Budget") + ':</label><span>' + rs.cfg.Cfg.getCurrency()+rs.util.Util.numericPrecisonFormat(data.Budget) + '</span></div>';
	strDom += '</div>';
	strDom += '<div><button id="detailButtonId" class="ToolTipButton">'+ rs.getText("DetailBtnText") + '</button></div>';
	
	if(bShowTrend)
	{
		strDom += '<div><button id="trendButtonId"  class="ToolTipButton">' + rs.getText("TrendBtnText") + '</button></div>';
	}
	
	strDom += '</div>';
	
	return strDom;
	};
	
/*
 * used to caculate the exact position for popup and decide put the arrow at which direction
 * 
 * @param {object} position  Mouse position when click event or mouseover event fired. 
 * @param {boolean} bHorizontalArrowOnly  Only show arrow on left or right. it's useful for treetable. 
 * @param {object} oAt  Put css styled popup position in it
 * 
 */	
rs.util.Util.calculateExpensePosition = function(position, bHorizontalArrowOnly, oAt)
{
	var nBottomGap = window.innerHeight -  position[1];
	var nLeftGap = window.innerWidth - position[0];
	var nPopupWidth = Math.round($(".expenseTip").width()) + 35;  // padding 10. border 7 . 
	var nPopupHeight = Math.round($(".expenseTip").height()) + 35; // padding 10. border 7.
	var arrow_width = 20;
	var left = 0, top = 0;
	if(bHorizontalArrowOnly)
	{
		if(nLeftGap < nPopupWidth)
		{
			$(".expenseTip").addClass('arrow_box_right');
			left = (position[0] + window.pageXOffset - nPopupWidth -arrow_width);
			top = (position[1] + window.pageYOffset - Math.round(nPopupHeight/2));
		}
		else
		{
			$(".expenseTip").addClass('arrow_box_left');
			left = (position[0] + window.pageXOffset + arrow_width);
			top = (position[1] + window.pageYOffset - Math.round(nPopupHeight/2));			
		}
	}
	else
	{
		if((nLeftGap < nPopupWidth) || (position[0] < nPopupWidth))
		{
			if(position[0] < nPopupWidth)
			{
				$(".expenseTip").addClass('arrow_box_left');
				left = (position[0] + window.pageXOffset + arrow_width);
				top = (position[1] - Math.round(nPopupHeight/2));
			}
			else
			{
				$(".expenseTip").addClass('arrow_box_right');
				left = (position[0] + window.pageXOffset - nPopupWidth - arrow_width);
				top = (position[1] - Math.round(nPopupHeight/2));				
			}
		}
		else
		{
			if(nBottomGap < nPopupHeight)
			{
				$(".expenseTip").addClass('arrow_box_bottom');
				left = (position[0] + window.pageXOffset - Math.round(nPopupWidth/2));
				top = (position[1] + window.pageYOffset - nPopupHeight - arrow_width);				
			}
			else
			{
				$(".expenseTip").addClass('arrow_box_top');
				left = (position[0] + window.pageXOffset -Math.round(nPopupWidth/2));
				top = (position[1] + window.pageYOffset + arrow_width);	
			}			
		}					
	}
	
	if(top < 0)
	{
		top = 0;
	}
	if(top > window.innerHeight - nPopupHeight)
	{
		top = window.innerHeight - nPopupHeight;
	}	
	
	if(left < 0)
	{
		left = 0;
	}
	if(left > window.innerWidth - nPopupWidth)
	{
		left = window.innerWidth - nPopupWidth;
	}	
	
	
	oAt.left = left + "px";
	oAt.top = top + "px";			
}; 

/*
 * used for view to show expense related popup or tooltip
 * 
 * @param {object} data Spending data 
 * @param {object} position  Mouse position for click or mouseover event
 * @param {object} option  option.bShowTrend  Whether to show "trend" button, option.bHorizontalArrowOnly Only show arrow on left or right. it's useful for treetable.
 * @param {object} callback callback.detailCallback Callback function when detail button clicked.  callback.trendCallback  Callback function when trend button clicked.
 * @param {object} argument  arguments for callback function 
 * @param {object} cbContext Context
 * 
 * @return {object}  popup reference
 * 
 */
rs.util.Util.showExpensePopup= function(data, position, option, callback, argument, cbContext)
{

	var strDom = rs.util.Util.composeExpenseDom(data, option.bShowTrend); 
	
	var oHTML = new sap.ui.core.HTML();	
	oHTML.setContent(strDom);			
	
	function popupClosed()
	{
		$("#detailButtonId").unbind('click');
		if((option) && (option.bShowTrend))
		{
			$("#trendButtonId").unbind('click');	
		}
		
		oHTML.destroy();
	}
	
	var popup = new sap.ui.core.Popup(oHTML, false, true, true);	
	
	popup.attachClosed(popupClosed);

	var oAt = 
	{
		"left": '0px',
		"top": '0px'
	};
	 
	popup.open(0, sap.ui.core.Popup.Dock.CenterCenter , oAt , null, "0, 0");
	
	//caculate the popup position and set corresponding arrow 
	rs.util.Util.calculateExpensePosition(position, option.bHorizontalArrowOnly, oAt);
	popup.setPosition(sap.ui.core.Popup.Dock.CenterCenter , oAt , null, "0, 0");
		
	var varianceColor = rs.view.getColorByVariancePercentage(data.VariancePercentage,data.Total);
	$(".variance").css({  color: varianceColor });

	$('#detailButtonId').click(function(eventObj){
		if(callback && callback.detailCallback)
		{
			callback.detailCallback.apply(cbContext, argument);	
			popup.close();
		}
	});
	
	if((option) && (option.bShowTrend))
	{
		$('#trendButtonId').click(function(eventObj){
			if(callback && callback.trendCallback)
			{
				callback.trendCallback.apply(cbContext, argument); 
			}	
		});		
	}
	
	return popup;
};


rs.util.Util.createExpensePopover = function()
{
	var oHTML = new sap.ui.core.HTML();	

	var oDetailBtn = new sap.m.Button({
		text: rs.getText('DetailBtnText'),
		width: '80%',
	}).addStyleClass('pop-button');

	var oTrendBtn = new sap.m.Button({
		text: rs.getText('TrendBtnText'),
		width: '80%',
	}).addStyleClass('pop-button');

	var oScrollContainer = new sap.m.ScrollContainer({
		horizontal: false,
		width: '250px',
		height: '200px',
		vertical: true,
		content: [oHTML, oDetailBtn, oTrendBtn]
	});

	var oPopover = new sap.m.Popover({
		placement: sap.m.PlacementType.Top,
		showHeader: false,
		contentHeight: '200px',
		content: [oScrollContainer]
	});
	
	oPopover.oHTML = oHTML;
	oPopover.oDetailBtn = oDetailBtn;
	oPopover.oTrendBtn = oTrendBtn;
	
	oPopover.isOpen = false;
	
	return 	oPopover;
};

rs.util.Util.setPopoverPosition = function(position, element, bHorizontalArrowOnly)
{
	var POPOVER_WIDTH = 265, POPOVER_HEIGHT = 215;
	var nBottomGap = window.innerHeight -  position[1];
	var nLeftGap = window.innerWidth - position[0];
	var nLeft = element.offset().left, nTop = element.offset().top, nWidth = element.width(), nHeight = element.height();
	var offset = [], placement = null;
	
	if(bHorizontalArrowOnly)
	{
		if(nLeftGap < POPOVER_WIDTH)
		{
			placement = sap.m.PlacementType.Left;
			offset[0] = Math.floor(position[0] - nLeft);
			offset[1] = Math.floor(position[1] - (nTop + nHeight/2));
					
		}
		else
		{
			placement = sap.m.PlacementType.Right;
			offset[0] = Math.floor(position[0] - (nLeft + nWidth));
			offset[1] = Math.floor(position[1] - (nTop + nHeight/2));	
		}
	}
	else	
	{
		if((nLeftGap < POPOVER_WIDTH) || (position[0] < POPOVER_WIDTH))
		{
				if(position[0] < POPOVER_WIDTH)
				{
					placement = sap.m.PlacementType.Right;
					offset[0] = Math.floor(position[0] - (nLeft + nWidth));
					offset[1] = Math.floor(position[1] - (nTop + nHeight/2));
				}
				else
				{
					placement = sap.m.PlacementType.Left;
					offset[0] = Math.floor(position[0] - nLeft);
					offset[1] = Math.floor(position[1] - (nTop + nHeight/2));
					
				}		
		}
		else
		{
			if(nBottomGap > POPOVER_HEIGHT)
			{
				placement = sap.m.PlacementType.Bottom;
				offset[0] = Math.floor(position[0] - (nLeft + nWidth/2));
				offset[1] = Math.floor(position[1] - (nHeight + nTop));			
			}
			else
			{
				placement = sap.m.PlacementType.Top;
				offset[0] = Math.floor(position[0] - (nLeft + nWidth/2));
				offset[1] = Math.floor(position[1] - nTop);			
	
			}			
		}			
	}
	
	rs.util.Util.expensePopover.setPlacement(placement);
	rs.util.Util.expensePopover.setOffsetX(offset[0]);
	rs.util.Util.expensePopover.setOffsetY(offset[1]);	
};

rs.util.Util.showExpensePopover= function(data, position, element, control, option, callback, argument, cbContext)
{
	if(!rs.util.Util.expensePopover)
	{
		rs.util.Util.expensePopover = rs.util.Util.createExpensePopover();
		rs.util.Util.expensePopover.attachAfterClose(popoverClosed);
		rs.util.Util.expensePopover.attachAfterOpen(popoverOpened);
	}
	
	if(rs.util.Util.expensePopover.isOpen)
	{
		rs.util.Util.expensePopover.close();
		return;
	}
	
	var varianceColor = rs.view.getColorByVariancePercentage(data.VariancePercentage,data.Total);
    var leftOver = data.Variance >= 0 ? rs.getText("Left") : rs.getText("Over");
	
    var variancePercentageFormat = rs.view.Help.formatVariancePercentage(data.VariancePercentage);	
    var varianceFormat = rs.cfg.Cfg.getCurrency() + rs.util.Util.commaSplit(Math.abs(data.Variance))+variancePercentageFormat + leftOver; 		
	
	if(option)
	{
		rs.util.Util.expensePopover.oTrendBtn.setVisible(option.bShowTrend);
	}

	var strDom = '<div>';
	strDom += '<p class="title">' + data.Name + '</p>';
	strDom += '<div class="variance" style = "color:' + varianceColor + ';">' + varianceFormat + '</div>';
	strDom += '<div id="details">';
	strDom += '<div class="first-row"><label>' + rs.getText("Actual")+ ':</label><span>' +rs.cfg.Cfg.getCurrency()+ rs.util.Util.numericPrecisonFormat(data.Actual) + '</span></div>';
	strDom += '<div class="second-row"><label>' + rs.getText("Committed") + ':</label><span>' +rs.cfg.Cfg.getCurrency()+ rs.util.Util.numericPrecisonFormat(data.Commited) + '</span></div>';
	strDom += '<div class="third-row"><label>' + rs.getText("Budget") + ':</label><span>' + rs.cfg.Cfg.getCurrency()+rs.util.Util.numericPrecisonFormat(data.Budget) + '</span></div>';
	strDom += '</div>';
	strDom += '</div>';

	rs.util.Util.expensePopover.oHTML.setContent(strDom);
	rs.util.Util.setPopoverPosition(position, element, option.bHorizontalArrowOnly);
	
	rs.util.Util.expensePopover.openBy(control);


	$('#' + rs.util.Util.expensePopover.oDetailBtn.getId()).tap(function(eventObj){
			rs.util.Util.expensePopover.close();
			if(callback && callback.detailCallback)
			{
				callback.detailCallback.apply(cbContext, argument); 
			}	
	});

	if(option && option.bShowTrend)
	{
		$('#' + rs.util.Util.expensePopover.oTrendBtn.getId()).tap(function(eventObj){
			rs.util.Util.expensePopover.close();
			if(callback && callback.trendCallback)
			{
				callback.trendCallback.apply(cbContext, argument); 
			}	
		});
	}


	function popoverClosed()
	{
		rs.util.Util.expensePopover.isOpen = false;
		
		$('#' + rs.util.Util.expensePopover.oDetailBtn.getId()).unbind('tap');
		if(option && option.bShowTrend)
		{
			$('#' + rs.util.Util.expensePopover.oTrendBtn.getId()).unbind('tap');	
		}		
		
	}
	
	function popoverOpened()
	{
		rs.util.Util.expensePopover.isOpen = true;
	}
	
	
};

/**
 * used for view to show odata related error message.
 * 
 * @param {string} title Title information.
 * @param {object} oError  Odata error object.
 * @param {object} closeCallback  Callback function when popup closed.
 * @param {object} cbContext  Context
 * 
 */
rs.util.Util.showErrorMessage= function(title, oError, closeCallback, cbContext)
{
	var strMessage = "";
	if(oError.response)
	{
		if(oError.response.body)
		{
			strMessage +=  oError.response.body;
		}
		else
		{
			strMessage += rs.getText("oDataStatusCode") + oError.response.statusCode + '&nbsp; &nbsp;' + oError.response.statusText +  '</br> </br>';
			strMessage +=  oError.message;
		}
	}
	else
	{
		strMessage +=  oError.message;
	}

	rs.util.Util.showPopup(title, strMessage, closeCallback, cbContext);
};

/**
 * used to save error message context when document isn't ready.
 */

rs.util.Util.errorObject = {
		title     : null,
		message : null,
		closeCallback  : null,
		cbContext : null,
		popupShowed: false
};

/**
 *  check whether have pending popup need to show
 */
rs.util.Util.checkPopup = function()
{
	if(rs.util.Util.errorObject.message)
	{
		var oError = rs.util.Util.errorObject;
		rs.util.Util.showPopup(oError.title, oError.message,oError.closeCallback, oError.cbContext);
	}	
};

/**
 * show popup for error scenario.
 * 
 * @param {string} title  Title information, if null, will use "error" as default
 * @param {string} message  Error message.
 * @param {object} closeCallback  Callback function when popup closed.
 * @param {object} cbContext  Context
 * 
 */
rs.util.Util.showPopup= function(title, message, closeCallback, cbContext)
{
	/* save the context and show popup later if document isn't ready */
	if (document.readyState != "complete")
	{
		rs.util.Util.errorObject.title = title;
		rs.util.Util.errorObject.message = message;
		rs.util.Util.errorObject.closeCallback = closeCallback;
		rs.util.Util.errorObject.cbContext = cbContext;
		setTimeout(function() {
				rs.util.Util.checkPopup();
			}, 1000);		
		return;
	}
	
	rs.util.Util.errorObject.message = null;
	
	if(rs.util.Util.popupShowed)
	{
		return;
	}
	else
	{
		rs.util.Util.popupShowed = true;
	}
	
	var strDom = "";
	
	var strTitle = "";
	if(title)
	{
		strTitle = title;
	}
	else
	{
		strTitle = rs.getText("oDataError");
	}

	strDom += '<div class = "error_title"> <div class = "text"> ' +  strTitle + '</div></div>';

	if(message)
	{
		strDom += '<div class = "error_message">' +  message + '</div>';
	}
	
	var strClose = rs.getText("Close");
	strDom += '<div class = "error_button"> <button id = "error_popup_close" class = "ToolTipButton">' + strClose + '</button> </div>';
	
	strDom = '<div class = "error_popup">' + strDom + '</div>';

	var oHTML = new sap.ui.core.HTML();	
	oHTML.setContent(strDom);	
	
	var popup = new sap.ui.core.Popup(oHTML, true, true, false);
	
	function popupClosed()
	{
		rs.util.Util.popupShowed = false;
		if(closeCallback && cbContext)
		{
			closeCallback.call(cbContext);
		}
		
	}	
	
	popup.attachClosed(popupClosed);
	
	popup.open(0, sap.ui.core.Popup.Dock.CenterCenter , sap.ui.core.Popup.Dock.CenterCenter , document.body, "0, 0");
	
	var nOffset = Math.max(0, Math.round(($(".error_button").width() - 200)/2)); // button width 200, set in css. 
	
	$("#error_popup_close").css("margin-left",  nOffset + "px");
	
	$("#error_popup_close").click(function(){
						rs.util.Util.popupShowed = false;
						popup.close();
						oHTML.destroy();
					});
};

/**
 * rs.util.Util.mousePosition used to store last mouse position
*/
rs.util.Util.mousePosition = [];

/*
 * store last mouse position
 * 
 * @param {int} x
 * @param {int} y
 * 
 */
rs.util.Util.setMousePosition = function(x, y){
	rs.util.Util.mousePosition[0] = x;
	rs.util.Util.mousePosition[1] = y; 
};

/**
 * get last mouse position. because mozilla firefox don't support window.event. 
 * for some event we can use this function to get last mouse position.
 * 
 * @return {rs.util.Util.mousePosition}  the last x and y coordinate
 * 
 */
rs.util.Util.getMousePosition = function(){
	return rs.util.Util.mousePosition;
};

/**
 * this function is used to show badge number, obj parameter refer to Jquery dom which need to show badge, set badgeNumber to 0 will delete badge.
 * 
 * @param {Object} obj  Jquery object.
 * @param {int} badgeNumber  If it's 0, delete badge. 
 * 
 */
rs.util.Util.showBadge = function(obj, badgeNumber)
{
	var badgeExist = obj.find('#badge').html();
	if(badgeExist)
	{
		obj.find('#badge').remove();
	}
	
	if(badgeNumber > 0)
	{
		obj.append('<div class="badge_outter" id="badge"><div class="badge_inner"><p class="badge_number">'+ badgeNumber + '</p></div></div>');
	}
};


rs.util.Util.getHAlign = function(oHAlign, bRTL) 
{
	switch (oHAlign) 
	{
		case sap.ui.commons.layout.HAlign.Center:
		return "center";
		
		case sap.ui.commons.layout.HAlign.End:
		case sap.ui.commons.layout.HAlign.Right:
		return bRTL ? "left" : "right";
	}
	// case sap.ui.commons.layout.HAlign.Left:
	// case sap.ui.commons.layout.HAlign.Begin:
	return bRTL ? "right" : "left";
};
	
rs.util.Util.date2str = function(date, format) 
{
	var o = {M:date.getMonth()+1, d:date.getDate(),h:date.getHours(),m:date.getMinutes(),s:date.getSeconds()};
	
	format = format.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
					return ((v.length>1 ? "0" : "") + eval('o.'+ v.slice(-1))).slice(-2)
				});
				
	return format.replace(/(y+)/g,function(v) {
				return date.getFullYear().toString().slice(-v.length)
			});
};

rs.util.Util.expandTreeNodes = function(oTreeTable, expand, maxLevel) 
{
	var i = 0;
	if (expand == true )
	{
		var slash = new RegExp("/","g"); // "g" for global search, str.match then yields an array of all occurrences
		while (oTreeTable.getContextByIndex(i) != null )
		{
			// count the number of slashes in the path (root node starting with "/root", level 0 top node "/root/0")\
			var level = (oTreeTable.getContextByIndex(i).toString().match(slash).length - 4)/2;
			if ( maxLevel == -1 || level < maxLevel ){
				oTreeTable.getBinding().expandContext(oTreeTable.getContextByIndex(i));
			};
			i++;
		};
	};
	if ( !expand)
	{
		while ( oTreeTable.getContextByIndex(i) != null )
		{
			 i++ 
		};
		while ( i >= 0 )
		{ 
			if ( oTreeTable.getContextByIndex(i) != null )
			{
				oTreeTable.getBinding().collapseContext(oTreeTable.getContextByIndex(i));
			};
			i--;
		};
	};
}

rs.util.Util.getTimePeriodInfo= function() {
		var ret;
		var timePeriod = rs.cfg.Cfg.getTimePeriod();
		switch( timePeriod) {
			case rs.cfg.TimePeriod.M2D :
				ret = "Month 2 Date";  
				break;
			case rs.cfg.TimePeriod.Q2D : 
				ret = "Quarter 2 Date";  
				break;
			case rs.cfg.TimePeriod.Y2D : 
				ret = "Year 2 Date";
				break;
			case rs.cfg.TimePeriod.OTH :
				ret = "Other: ";
				
				var otherType = rs.cfg.Cfg.getOtherTimePeriodType();
				var otherValue = rs.cfg.Cfg.getOtherTimePeriodValue(); 
				switch (otherType) {
					case rs.cfg.OtherTimePeriod.Year:
						if ( otherValue == rs.cfg.Year.ThisYear) {
							ret += "Year: This Year";  
						} else if ( otherValue == rs.cfg.Year.LastYear) {
							ret += "Year: Last Year";
						}
						break;
					case rs.cfg.OtherTimePeriod.Quarter:
						ret += "Quarter: " + otherValue;
						break;
					case rs.cfg.OtherTimePeriod.Period:
						ret += "Month: " + otherValue;
						break;
				}
				break;
		}
		return ret;
};
