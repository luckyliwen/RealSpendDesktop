sap.ui.core.Control.extend("Slider", {
	
	metadata : {
		properties : {
			"id"       : "string",
			"title"    : "string",
			"comment1" : "string",
			"comment2" : "string",
			"comment3" : "string",
			"max"      : {type: "int", defaultValue: 200},
			"min"      : {type: "int", defaultValue: 0},
		},
		events: {
			"sliderChange" : {},
		}
	},
	
	renderer : function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.write(">");
		oRm.write("</div>");
	},
  /**
   * change the color mode 
   * @param oMode
   */
	changeMode : function(oMode) {
		if(oMode === rs.cfg.ColorScheme.GYR) {
			$("#SliderLeftColor").removeClass("blueButton");
			$("#SliderRightColor").removeClass("greyButton");
			$("#SliderLeftColor").addClass("greenButton");
			$("#SliderRightColor").addClass("redButton");
		} else if(oMode === rs.cfg.ColorScheme.BYG) {
			$("#SliderLeftColor").removeClass("greenButton");
			$("#SliderRightColor").removeClass("redButton");
			$("#SliderLeftColor").addClass("blueButton");
			$("#SliderRightColor").addClass("greyButton");
		}
	},
  
	onBeforeRendering: function() {
		var Slider = window.Slider || {};
		Slider.modules = Slider.modules || {};
	},
	/**
	 * define the color slider
	 */
	_defineSlider:function(){
		Slider.modules.slider = function(cfg) {
			if ((typeof cfg)!="object") {
				throw new Error("config argument is not a object, err raise from slider constructor");
			}
			
			this.targetId   = cfg.targetId;
			this.hints      = cfg.hints ? cfg.hints : "";
			this.min        = cfg.min ? cfg.min : 0;
			this.max        = cfg.max ? cfg.max : 100;
			this._valueLab  = this.min;
			this._valueLab2 = this.max;
			this.title      = cfg.title ? cfg.title : "";
			this.comment1   = cfg.comment1 ? cfg.comment1 : "";
			this.comment2   = cfg.comment2 ? cfg.comment2 : "";
			this.comment3   = cfg.comment3 ? cfg.comment3 : "";
			this._defaultInitializer.apply(this);
			return this;
		};
    
		Slider.modules.slider.prototype = {
				//init the slider
				_defaultInitializer : function() {
					this._bar         = null;
					this._bar2        = null;
					this._slider      = null;
					this._wrapper     = null;
					this._backColor   = null;
					this._backColor2  = null;
					this._title       = null;
					this._label       = null;
					this._value       = 0;
					this._value2      = 0;
					this._labelChild1 = null;
					this._labelChild2 = null;
					this._comment1    = null;
					this._comment2    = null;
					this._comment3    = null;
					this._target      = document.getElementById(this.targetId);
					if(this.min > this.max) {
						var x = this.min;
						this.min = this.max;
						this.max = x;
					}
				},
                //set the slider value
				setValue: function (value, flagInit, barFlag1) {
					with(this) {
						if(!_bar && !_bar2) {
							return;
						}    
						var barValue = Number(value),
						valueStr,
						//TODO :: width should be replace by the offsetWidth width
						sliderWidth = 400,
						barWidth    = 10,
						labelWidth  = 40;
						// if the flag is true, then it is the first time set value, and the value is the show value
						if(flagInit){
							valueStr = barValue;
							barValue    = (barValue-min)*sliderWidth/(max-min);
							if(valueStr == max){
								barValue = barValue - barWidth;
							} else if(valueStr == min) {
								barValue = barValue + barWidth;
							}
						} else {
							valueStr = Math.round(barValue*(max-min)/sliderWidth) + min;
							if(barValue === barWidth) {
								valueStr = min;
							}
							if(barValue + barWidth === sliderWidth) {
								valueStr = max;
							}
						}
						if(barFlag1) {
							_labelChild1.innerText  = valueStr + "%";
							_labelChild1.style.left = (barValue - labelWidth) + "px";
							_backColor.style.width = barValue + "px";
							_bar.style.left = (barValue - barWidth) + "px";
							_value = barValue;
							_valueLab = valueStr;
						} else {
							_labelChild2.innerText  = valueStr + "%";
							_labelChild2.style.right = (sliderWidth - barValue - labelWidth) + "px";
							_backColor2.style.width = (sliderWidth - barValue) + "px";
							_bar2.style.right = (sliderWidth - barValue - barWidth) + "px";
							_value2 = barValue;
							_valueLab2 = valueStr;
						}
					}
				},
                //create the slider part
				create: function() {
					with(this) {
						_target.style.position = "relative";
						_title = document.createElement("DIV");
						_title.className  = "TitleSlider";
						_title.innerText = title;
						_target.appendChild(_title);         
          
						_wrapper = document.createElement("DIV");
						_wrapper.id = targetId + "_wrapper";
						_wrapper.style.position = "relative";
						_wrapper.style.left = "100px";
						_target.appendChild(_wrapper);     
          
						_label = document.createElement("DIV");
						_label.className = "LabelSlider";
						_label.style.position  = "absolute";
						_wrapper.appendChild(_label);
          
						_labelChild1    = document.createElement("DIV");
						_labelChild2    = document.createElement("DIV");
						_labelChild1.id = "slider_label1";
						_labelChild2.id = "slider_label2";
						_labelChild1.style.position = "absolute";
						_labelChild2.style.position = "absolute";
						_labelChild1.style.width  = "40px";
						_labelChild2.style.width  = "40px";
						_labelChild1.style.height = "20px";
						_labelChild2.style.height = "20px";
						_labelChild1.style.lineHeight = "20px";
						_labelChild2.style.lineHeight = "20px";
						_labelChild1.style["text-align"] = "right";
						_label.appendChild(_labelChild1);
						_label.appendChild(_labelChild2);         
          
						_slider = document.createElement("DIV");
						_slider.id = targetId + "_slider";
						_slider.className = "ColorSlider";
						_slider.style.position  = "absolute";
						_wrapper.appendChild(_slider);
          
						_backColor = document.createElement("DIV");
						_backColor2 = document.createElement("DIV");
						_backColor.className="Part1 SliderPart";
						_backColor2.className="Part2 SliderPart";
						_backColor.id="SliderLeftColor";
						_backColor2.id="SliderRightColor";
						_slider.appendChild(_backColor);
						_slider.appendChild(_backColor2);
          
						this.createBar();
          
						_comment1 = document.createElement("DIV");
						_comment2 = document.createElement("DIV");
						_comment3 = document.createElement("DIV");
						_comment1.className = "CommentSlider1 CommentStyle";
						_comment2.className = "CommentSlider2 CommentStyle";
						_comment3.className = "CommentSlider3 CommentStyle";
						_comment1.innerText = comment1;
						_comment2.innerText = comment2;
						_comment3.innerText = comment3;
						_wrapper.appendChild(_comment1);
						_wrapper.appendChild(_comment2);
						_wrapper.appendChild(_comment3);
          
					}
				},
                //create two bars 
				createBar: function(type) { 
					with(this) {
						var _self = this;
						_bar = document.createElement("DIV");
						_slider.appendChild(_bar);
						_bar.title = hints;
						_bar.id = targetId + "-leftBar";
						_bar.className = "ColorBar";
						_bar.style.position  = "absolute";
						_bar.onmousedown = function(event) {
							_self._initHandle(event);
						};
						_bar2 = document.createElement("DIV");
						_slider.appendChild(_bar2);
						_bar2.title = hints;
						_bar2.id = targetId + "-rightBar";
						_bar2.className = "ColorBar";
						_bar2.style.position  = "absolute";
						_bar2.onmousedown = function(event) {
							_self._initHandle2(event);
						};
					}
				},
                //init left handle 
				_initHandle : function(evt) {
					with(this) {
						var evtLeft  = evt ? evt : window.event;
						_bar.slider_x = evtLeft.clientX - _bar.offsetLeft;
						
						document.onmousemove = function(evtx) {
							var evtLeftx = evtx ? evtx : window.event,
									x = evtLeftx.clientX-_bar.slider_x;
							x = x <= _slider.offsetLeft ? _slider.offsetLeft : x >= _slider.offsetLeft + _slider.offsetWidth - 2*_bar.offsetWidth ? _slider.offsetLeft + _slider.offsetWidth - 2*_bar.offsetWidth : x;
							if(x + _bar.offsetWidth >= _value2){
								setValue(x + _bar.offsetWidth, false, false);
								setValue(x + _bar.offsetWidth, false, true);
								return;
							}
							setValue(x + _bar.offsetWidth, false, true);
						};
						document.onmousedown = function(event){
							
						};
						document.onmouseup = function(event) {
							with(this) {								
								rs.cfg.g_settingDialog.cfgData.GoodThreshold = _valueLab;
								rs.cfg.g_settingDialog.cfgData.BadThreshold  = _valueLab2;
								document.onmousemove = null;
								document.onmouseup = null;
							}
						};
					}
				},
                //init right handle
				_initHandle2: function(evt) {
					with(this) {
						var evtRight  = evt ? evt : window.event;
						_bar2.slider_x = evtRight.clientX - _bar2.offsetLeft;      
						document.onmousemove = function(evtx) {
							var evtRightx = evtx ? evtx : window.event,
									x = evtRightx.clientX-_bar2.slider_x;
							x = x <= _slider.offsetLeft+_bar2.offsetWidth ? _slider.offsetLeft+_bar2.offsetWidth : x >= _slider.offsetLeft + _slider.offsetWidth - _bar2.offsetWidth ? _slider.offsetLeft + _slider.offsetWidth - _bar2.offsetWidth : x;
							if(x <= _value){
								setValue(x, false, true);
								setValue(x, false, false);
								return;
							}
							setValue(x, false, false);						
						};
						document.onmouseup = function(event) {
							with(this) {
								rs.cfg.g_settingDialog.cfgData.GoodThreshold = _valueLab;
								rs.cfg.g_settingDialog.cfgData.BadThreshold  = _valueLab2;
								document.onmousemove = null;
								document.onmouseup = null;
							}
						};
					}
				},				
		};
	},
	onAfterRendering : function() {
		var title = this.getTitle(),
		comment1  = this.getComment1(),
		comment2  = this.getComment2(),
        comment3  = this.getComment3(),
        max       = this.getMax(),
        min       = this.getMin();
        
		this._defineSlider();
		
		var ColorSlider = new Slider.modules.slider({
			targetId : this.getId(),
			min      : min,
			max      : max,
			hints    : "move the slider",
			title    : title,
			comment1 : comment1,
			comment2 : comment2,
			comment3 : comment3,
		});
    
		ColorSlider.create();
		ColorSlider.setValue(rs.cfg.CfgValue.GoodThreshold, true, true);
		ColorSlider.setValue(rs.cfg.CfgValue.BadThreshold, true, false);
		this.changeMode(rs.cfg.g_settingDialog.cfgData.ColorScheme);
	},
  
});
