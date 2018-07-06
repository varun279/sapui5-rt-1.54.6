/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","./library","sap/ui/core/Control","sap/ui/Device","sap/m/FlexBox"],function(q,l,C,D,F){"use strict";var A=C.extend("sap.suite.ui.microchart.AreaMicroChart",{metadata:{library:"sap.suite.ui.microchart",properties:{width:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null},height:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null},maxXValue:{type:"float",group:"Misc",defaultValue:null},minXValue:{type:"float",group:"Misc",defaultValue:null},maxYValue:{type:"float",group:"Misc",defaultValue:null},minYValue:{type:"float",group:"Misc",defaultValue:null},view:{type:"sap.suite.ui.microchart.AreaMicroChartViewType",group:"Appearance",defaultValue:"Normal"},colorPalette:{type:"string[]",group:"Appearance",defaultValue:[]},showLabel:{type:"boolean",group:"Misc",defaultValue:true},isResponsive:{type:"boolean",group:"Appearance",defaultValue:false}},events:{press:{}},defaultAggregation:"lines",aggregations:{chart:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartItem",bindable:"bindable"},maxThreshold:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartItem"},innerMaxThreshold:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartItem"},innerMinThreshold:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartItem"},minThreshold:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartItem"},target:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartItem",bindable:"bindable"},firstXLabel:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartLabel"},firstYLabel:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartLabel"},lastXLabel:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartLabel"},lastYLabel:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartLabel"},maxLabel:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartLabel"},minLabel:{multiple:false,type:"sap.suite.ui.microchart.AreaMicroChartLabel"},lines:{multiple:true,type:"sap.suite.ui.microchart.AreaMicroChartItem",bindable:"bindable"}}}});A.EDGE_CASE_WIDTH_SHOWCHART=32;A.EDGE_CASE_HEIGHT_WIDE_VIEW_SHOWCHART=27;A.EDGE_CASE_HEIGHT_SHOWCANVAS=16;A.EDGE_CASE_HEIGHT_SHOWBOTTOMLABEL=16;A.EDGE_CASE_HEIGHT_SHOWTOPLABEL=32;A.EDGE_CASE_HEIGHT_SHOWLABEL=16;A.EDGE_CASE_WIDTH_RESIZEFONT=168;A.EDGE_CASE_HEIGHT_RESIZEFONT=72;A.WIDE_MODE_LABEL_PADDING=8;A.ITEM_NEUTRAL_COLOR="sapSuiteAMCSemanticColorNeutral";A.ITEM_NEUTRAL_NOTHRESHOLD_CSSCLASS="sapSuiteAMCNeutralNoThreshold";A.prototype.init=function(){this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");this.setAggregation("tooltip","{AltText}",true);this._bThemeApplied=true;if(!sap.ui.getCore().isInitialized()){this._bThemeApplied=false;sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));}else{this._handleCoreInitialized();}if(D.system.tablet||D.system.phone){D.orientation.attachHandler(this._onOrientationChange,this);}};A.prototype._handleCoreInitialized=function(){this._bThemeApplied=sap.ui.getCore().isThemeApplied();sap.ui.getCore().attachThemeChanged(this._handleThemeApplied,this);};A.prototype._handleThemeApplied=function(){this._bThemeApplied=true;this.invalidate();};A.prototype._getCssValues=function(){this._$CssHelper.className=Array.prototype.slice.call(arguments).join(" ");var s=window.getComputedStyle(this._$CssHelper);if(!s.backgroundColor){s.backgroundColor=s["background-color"];}if(!s.outlineStyle){s.outlineStyle=s["outline-style"];}if(!s.outlineWidth){s.outlineWidth=s["outline-width"];}return s;};A.prototype.__fillThresholdArea=function(c,p,a,b){c.beginPath();c.moveTo(p[0].x,p[0].y);for(var i=1,d=p.length;i<d;i++){c.lineTo(p[i].x,p[i].y);}for(var j=a.length-1;j>=0;j--){c.lineTo(a[j].x,a[j].y);}c.closePath();c.fillStyle="white";c.fill();c.fillStyle=b;c.fill();c.lineWidth=1;c.strokeStyle="white";c.stroke();c.strokeStyle=b;c.stroke();};A.prototype._renderDashedLine=function(c,p,d){if(c.setLineDash){c.setLineDash(d);this._renderLine(c,p);c.setLineDash([]);}else{c.beginPath();for(var i=0,a=p.length-1;i<a;i++){c._dashedLine(p[i].x,p[i].y,p[i+1].x,p[i+1].y,d);}c.stroke();}};A.prototype._renderLine=function(c,p){c.beginPath();c.moveTo(p[0].x,p[0].y);for(var i=1,a=p.length;i<a;i++){c.lineTo(p[i].x,p[i].y);}c.stroke();};A.prototype._getItemColor=function(c,t){var i;if(t&&this.getTarget()){i="sapSuiteAMCSemanticColor"+this.getTarget().getColor();}else if(!t&&this.getChart()){i="sapSuiteAMCSemanticColor"+this.getChart().getColor();}if((i===A.ITEM_NEUTRAL_COLOR)&&!this._isThresholdPresent(c)){return A.ITEM_NEUTRAL_NOTHRESHOLD_CSSCLASS;}else{return i;}};A.prototype._isThresholdPresent=function(c){var t=[c.minThreshold.length,c.maxThreshold.length,c.innerMinThreshold.length,c.innerMaxThreshold.length];for(var i=0;i<t.length;i++){if(t[i]>1){return true;}}return false;};A.prototype._renderTarget=function(c,d){if(d.target.length>1){var s=this._getItemColor(d,true);var S=this._getCssValues("sapSuiteAMCTarget",s);c.strokeStyle=S.color;c.lineWidth=parseFloat(S.width);if(S.outlineStyle=="dotted"){this._renderDashedLine(c,d.target,[parseFloat(S.outlineWidth),3]);}else{this._renderLine(c,d.target,d);}}else if(d.target.length==1){q.sap.log.warning("Target is not rendered because only 1 point was given");}};A.prototype._renderThresholdLine=function(c,p){if(p&&p.length){var s=this._getCssValues("sapSuiteAMCThreshold");c.strokeStyle=s.color;c.lineWidth=s.width;this._renderLine(c,p);}};A.prototype._fillMaxThreshold=function(c,d){if(d.maxThreshold.length>1){var s=this._getCssValues("sapSuiteAMCThreshold","sapSuiteAMCSemanticColor"+this.getMaxThreshold().getColor());this.__fillThresholdArea(c,d.maxThreshold,[{x:d.maxThreshold[0].x,y:d.minY},{x:d.maxThreshold[d.maxThreshold.length-1].x,y:d.minY}],s.backgroundColor);this._renderThresholdLine(c,d.maxThreshold,d);}else if(d.maxThreshold.length==1){q.sap.log.warning("Max Threshold is not rendered because only 1 point was given");}};A.prototype._fillMinThreshold=function(c,d){if(d.minThreshold.length>1){var s=this._getCssValues("sapSuiteAMCThreshold","sapSuiteAMCSemanticColor"+this.getMinThreshold().getColor());this.__fillThresholdArea(c,d.minThreshold,[{x:d.minThreshold[0].x,y:d.maxY},{x:d.minThreshold[d.minThreshold.length-1].x,y:d.maxY}],s.backgroundColor);}else if(d.minThreshold.length==1){q.sap.log.warning("Min Threshold is not rendered because only 1 point was given");}};A.prototype._fillThresholdArea=function(c,d){if(d.minThreshold.length>1&&d.maxThreshold.length>1){var s=this._getCssValues("sapSuiteAMCThreshold","sapSuiteAMCSemanticColorCritical");this.__fillThresholdArea(c,d.maxThreshold,d.minThreshold,s.backgroundColor);}};A.prototype._fillInnerThresholdArea=function(c,d){if(d.innerMinThreshold.length>1&&d.innerMaxThreshold.length>1){var s=this._getCssValues("sapSuiteAMCThreshold","sapSuiteAMCSemanticColor"+this.getInnerMaxThreshold().getColor());this.__fillThresholdArea(c,d.innerMaxThreshold,d.innerMinThreshold,s.backgroundColor);}else if(d.innerMinThreshold.length||d.innerMaxThreshold.length){q.sap.log.warning("Inner threshold area is not rendered because inner min and max threshold were not correctly set");}};A.prototype._renderChart=function(c,d){if(d.chart.length>1){var s=this._getItemColor(d);var S=this._getCssValues("sapSuiteAMCChart",s);c.strokeStyle=S.color;c.lineWidth=parseFloat(S.width);this._renderLine(c,d.chart,d);}else if(d.chart.length==1){q.sap.log.warning("Actual values are not rendered because only 1 point was given");}};A.prototype._renderLines=function(c,d){var a=this.getColorPalette().length;var b=0;var t=this;var n=function(){if(a){if(b==a){b=0;}return t.getColorPalette()[b++];}};var s=this._getCssValues("sapSuiteAMCLine");c.lineWidth=parseFloat(s.width);var L=d.lines.length;for(var i=0;i<L;i++){if(d.lines[i].length>1){if(a){c.strokeStyle=n();}else{s=this._getCssValues("sapSuiteAMCLine","sapSuiteAMCSemanticColor"+this.getLines()[i].getColor());c.strokeStyle=s.color;}this._renderLine(c,d.lines[i],d);}}};A.prototype._renderCanvas=function(){this._$CssHelper=this.getDomRef("css-helper");var $=this.$();var L=$.find(".sapSuiteAMCSideLabels").css("width");$.find(".sapSuiteAMCCanvas, .sapSuiteAMCLabels").css("right",L).css("left",L);var c=this.getDomRef("canvas");var o=window.getComputedStyle(c);var w=parseFloat(o.width);c.setAttribute("width",w||360);var h=parseFloat(o.height);c.setAttribute("height",h||242);var r=c.getContext("2d");r.lineJoin="round";r._dashedLine=this._drawDashedLine;var d=this._calculateDimensions(c.width,c.height);if(this._isThresholdPresent(d)){$.find(".sapSuiteAMCCanvas").addClass("sapSuiteAMCWithThreshold");}this._fillMaxThreshold(r,d);this._fillMinThreshold(r,d);this._fillThresholdArea(r,d);this._renderThresholdLine(r,d.minThreshold,d);this._renderThresholdLine(r,d.maxThreshold,d);this._fillInnerThresholdArea(r,d);this._renderThresholdLine(r,d.innerMinThreshold,d);this._renderThresholdLine(r,d.innerMaxThreshold,d);this._renderTarget(r,d);this._renderChart(r,d);this._renderLines(r,d);};A.prototype._drawDashedLine=function(x,y,a,b,d){var c=d.length;this.moveTo(x,y);var f=(a-x),e=(b-y),s=f?e/f:1e15,r=Math.sqrt(f*f+e*e),i=0,g=true;while(r>=0.1){var h=d[i++%c];if(h>r){h=r;}var S=Math.sqrt(h*h/(1+s*s));if(f<0){S=-S;}x+=S;y+=s*S;this[g?"lineTo":"moveTo"](x,y);r-=h;g=!g;}};A.prototype._calculateDimensions=function(w,h){var m,M,f,b;function c(){if(!this._isMinXValue||!this._isMaxXValue||!this._isMinYValue||!this._isMaxYValue){var o=this.getLines();if(this.getMaxThreshold()){o.push(this.getMaxThreshold());}if(this.getMinThreshold()){o.push(this.getMinThreshold());}if(this.getChart()){o.push(this.getChart());}if(this.getTarget()){o.push(this.getTarget());}if(this.getInnerMaxThreshold()){o.push(this.getInnerMaxThreshold());}if(this.getInnerMinThreshold()){o.push(this.getInnerMinThreshold());}for(var i=0,p=o.length;i<p;i++){var P=o[i].getPoints();for(var k=0,a=P.length;k<a;k++){var v=P[k].getXValue();if(v>m||m===undefined){m=v;}if(v<f||f===undefined){f=v;}var V=P[k].getYValue();if(V>M||M===undefined){M=V;}if(V<b||b===undefined){b=V;}}}}if(this._isMinXValue){f=this.getMinXValue();}if(this._isMaxXValue){m=this.getMaxXValue();}if(this._isMinYValue){b=this.getMinYValue();}if(this._isMaxYValue){M=this.getMaxYValue();}}c.call(this);var r={minY:0,minX:0,maxY:h,maxX:w,lines:[]};var d;var e=m-f;if(e>0){d=w/e;}else if(e==0){d=0;r.maxX/=2;}else{q.sap.log.warning("Min X is greater than max X.");}var g;var j=M-b;if(j>0){g=h/(M-b);}else if(j==0){g=0;r.maxY/=2;}else{q.sap.log.warning("Min Y is greater than max Y.");}function n(a){var R=sap.ui.getCore().getConfiguration().getRTL();var k=function(V){var x=d*(V-f);if(R){x=r.maxX-x;}return x;};var o=function(V){return r.maxY-g*(V-b);};var p=[];if(a&&d!==undefined&&g!==undefined){var P=a.getPoints();var L=P.length;var s,y,t,u;if(L==1){t=P[0].getXValue();u=P[0].getYValue();if(t==undefined^u==undefined){var v,z;if(t==undefined){z=y=o(u);s=r.minX;v=r.maxX;}else{v=s=k(t);y=r.minY;z=r.maxY;}p.push({x:s,y:y},{x:v,y:z});}else{q.sap.log.warning("Point with coordinates ["+t+" "+u+"] ignored");}}else{for(var i=0;i<L;i++){t=P[i].getXValue();u=P[i].getYValue();if(t!=undefined&&u!=undefined){s=k(t);y=o(u);p.push({x:s,y:y});}else{q.sap.log.warning("Point with coordinates ["+t+" "+u+"] ignored");}}}}return p;}r.maxThreshold=n(this.getMaxThreshold());r.minThreshold=n(this.getMinThreshold());r.chart=n(this.getChart());r.target=n(this.getTarget());r.innerMaxThreshold=n(this.getInnerMaxThreshold());r.innerMinThreshold=n(this.getInnerMinThreshold());var L=this.getLines().length;for(var i=0;i<L;i++){r.lines.push(n(this.getLines()[i]));}return r;};A.prototype.setMinXValue=function(v,s){this._isMinXValue=this._isNumber(v);return this.setProperty("minXValue",this._isMinXValue?v:NaN,s);};A.prototype.setMaxXValue=function(v,s){this._isMaxXValue=this._isNumber(v);return this.setProperty("maxXValue",this._isMaxXValue?v:NaN,s);};A.prototype.setMinYValue=function(v,s){this._isMinYValue=this._isNumber(v);return this.setProperty("minYValue",this._isMinYValue?v:NaN,s);};A.prototype.setMaxYValue=function(v,s){this._isMaxYValue=this._isNumber(v);return this.setProperty("maxYValue",this._isMaxYValue?v:NaN,s);};A.prototype._isNumber=function(n){return typeof n==="number"&&!isNaN(n)&&isFinite(n);};A.prototype.onBeforeRendering=function(){if(this._bUseIndex){this._indexChartItems();}if(this.getIsResponsive()&&!this.data("_parentRenderingContext")&&q.isFunction(this.getParent)){this.data("_parentRenderingContext",this.getParent());}if(l._isInGenericTile(this)){this.setIsResponsive(true);l._removeStandardMargins(this);}this._unbindMouseEnterLeaveHandler();};A.prototype.onAfterRendering=function(){if(this.getIsResponsive()){this._adjustToParent();}l._checkControlIsVisible(this,this._onControlIsVisible);this._bindMouseEnterLeaveHandler();};A.prototype._onControlIsVisible=function(){this._adjustLabelWidth();if(this.getIsResponsive()){this._onResize();}else{this._renderCanvas();}};A._CHARTITEM_AGGREGATIONS=["chart","target","minThreshold","maxThreshold","innerMinThreshold","innerMaxThreshold"];A.prototype._indexChartItems=function(){var c,n=A._CHARTITEM_AGGREGATIONS.length;for(var i=0;i<n;i++){c=this.getAggregation(A._CHARTITEM_AGGREGATIONS[i]);if(c){this._indexChartItemPoints(c);}}};A.prototype._indexChartItemPoints=function(c){var p=c.getPoints();for(var i=0;i<p.length;i++){p[i].setProperty("x",i,true);}};A.prototype.enableXIndexing=function(u){this._bUseIndex=u;};A.prototype._onResize=function(){this.$().addClass("sapSuiteMicroChartsResponsive");this._resizeHorizontally();this._resizeVertically();};A.prototype._onOrientationChange=function(){this._renderCanvas(this.$());};A.prototype._adjustToParent=function(){if(this.data("_parentRenderingContext")&&this.data("_parentRenderingContext")instanceof F){var p=this.data("_parentRenderingContext").$();var P=parseFloat(p.width())-2;var f=parseFloat(p.height())-2;this.$().outerWidth(P).outerHeight(f);}};A.prototype._resizeVertically=function(){var $=this.$(),c=parseFloat($.css("height")),a=$.find(".sapSuiteAMCCanvas"),f=parseFloat(a.css("height"));if(f<=A.EDGE_CASE_HEIGHT_SHOWCANVAS){a.hide();}else{this._renderCanvas($);}if(c<=A.EDGE_CASE_HEIGHT_RESIZEFONT){$.addClass("sapSuiteAMCSmallFont");}if(this.getView()===l.AreaMicroChartViewType.Wide){if(this._hideWholeChartInWideMode(true)){$.hide();}}else{if(c<=A.EDGE_CASE_HEIGHT_SHOWTOPLABEL){$.find(".sapSuiteAMCPositionTop.sapSuiteAMCLabels").hide();}if(c<=A.EDGE_CASE_HEIGHT_SHOWBOTTOMLABEL){$.find(".sapSuiteAMCPositionBtm.sapSuiteAMCLabels").hide();}}};A.prototype._adjustLabelWidth=function(){var m=this.getMinLabel();var M=this.getMaxLabel();if(this.getView()!==l.AreaMicroChartViewType.Wide){if(m&&m.getLabel()){this._setValueLabelsWidth(".sapSuiteAMCLabels.sapSuiteAMCPositionBtm");}if(M&&M.getLabel()){this._setValueLabelsWidth(".sapSuiteAMCLabels.sapSuiteAMCPositionTop");}}};A.prototype._setValueLabelsWidth=function(s){var $=this.$();var L=$.find(s);var i,r,a,R,c;var f=parseFloat($.css("width"));L.children().css("width","auto");i=L.children(".sapSuiteAMCPositionLeft").width();r=L.children(".sapSuiteAMCPositionRight").width();a=Math.round(i/f*100)+1;R=Math.round(r/f*100)+1;c=100-(a+R);L.children(".sapSuiteAMCPositionLeft").css("width",a+"%");L.children(".sapSuiteAMCPositionRight").css("width",R+"%");L.children(".sapSuiteAMCPositionCenter").css("width",c+"%");};A.prototype._resizeHorizontally=function(){var $=this.$();var c=parseFloat($.css("width"));var t=$.find(".sapSuiteAMCPositionTop.sapSuiteAMCLabels");var b=$.find(".sapSuiteAMCPositionBtm.sapSuiteAMCLabels");var v=this.getView();if(c<=A.EDGE_CASE_WIDTH_SHOWCHART||this.getView()===l.AreaMicroChartViewType.Wide&&this._hideWholeChartInWideMode(false)){$.hide();}else{this._renderCanvas($);if(c<=A.EDGE_CASE_WIDTH_RESIZEFONT){$.addClass("sapSuiteAMCSmallFont");}var L=[];L.push(t,b);for(var i=0;i<L.length;i++){var a;if(v===l.AreaMicroChartViewType.Wide){a=L[i].find(".sapSuiteAMCPositionCenter");}else{a=L[i].find(".sapSuiteAMCLbl");}for(var j=0;j<a.size();j++){if(this._isLabelTruncated(a[j])){L[i].hide();if(q(a[j]).parent().is(t)){$.removeClass("sapSuiteAMCTopLbls");}else if(q(a[j]).parent().is(b)){$.removeClass("sapSuiteAMCBtmLbls");}break;}}}}};A.prototype._hideWholeChartInWideMode=function(v){var $=this.$();var r=this.$().find(".sapSuiteAMCPositionRight.sapSuiteAMCSideLabels");var L=this.$().find(".sapSuiteAMCPositionLeft.sapSuiteAMCSideLabels");if(v){return r.height()<A.EDGE_CASE_HEIGHT_WIDE_VIEW_SHOWCHART||L.height()<=A.EDGE_CASE_HEIGHT_WIDE_VIEW_SHOWCHART;}else{var R=r.width();var i=L.width();if(R+i>=$.width()){$.find(".sapSuiteAMCCanvas").hide();}R=R?R-A.WIDE_MODE_LABEL_PADDING:0;i=i?i-A.WIDE_MODE_LABEL_PADDING:0;return R+i>=this.$().width();}};A.prototype._isLabelTruncated=function(a){var s;if(D.browser.msie||D.browser.edge){s=1;}else{s=0;}return a.offsetWidth<a.scrollWidth-s;};A.prototype.ontap=function(e){if(D.browser.msie){this.$().focus();}this.firePress();};A.prototype.onkeydown=function(e){if(e.which==q.sap.KeyCodes.SPACE){e.preventDefault();}};A.prototype.onkeyup=function(e){if(e.which==q.sap.KeyCodes.ENTER||e.which==q.sap.KeyCodes.SPACE){this.firePress();e.preventDefault();}};A.prototype.attachEvent=function(){C.prototype.attachEvent.apply(this,arguments);if(this.hasListeners("press")){this.$().attr("tabindex",0).addClass("sapSuiteUiMicroChartPointer");}return this;};A.prototype.detachEvent=function(){C.prototype.detachEvent.apply(this,arguments);if(!this.hasListeners("press")){this.$().removeAttr("tabindex").removeClass("sapSuiteUiMicroChartPointer");}return this;};A.prototype._getLocalizedColorMeaning=function(c){return this._oRb.getText(("SEMANTIC_COLOR_"+c).toUpperCase());};A.prototype.getAltText=function(){var a="";var f=this.getFirstXLabel();var o=this.getFirstYLabel();var L=this.getLastXLabel();var b=this.getLastYLabel();var m=this.getMinLabel();var M=this.getMaxLabel();var c=this.getChart();var t=this.getTarget();var I=true;if(f&&f.getLabel()||o&&o.getLabel()){a+=(I?"":"\n")+this._oRb.getText(("AREAMICROCHART_START"))+": "+(f?f.getLabel():"")+" "+(o?o.getLabel()+" "+this._getLocalizedColorMeaning(o.getColor()):"");I=false;}if(L&&L.getLabel()||b&&b.getLabel()){a+=(I?"":"\n")+this._oRb.getText(("AREAMICROCHART_END"))+": "+(L?L.getLabel():"")+" "+(b?b.getLabel()+" "+this._getLocalizedColorMeaning(b.getColor()):"");I=false;}if(m&&m.getLabel()){a+=(I?"":"\n")+this._oRb.getText(("AREAMICROCHART_MINIMAL_VALUE"))+": "+m.getLabel()+" "+this._getLocalizedColorMeaning(m.getColor());I=false;}if(M&&M.getLabel()){a+=(I?"":"\n")+this._oRb.getText(("AREAMICROCHART_MAXIMAL_VALUE"))+": "+M.getLabel()+" "+this._getLocalizedColorMeaning(M.getColor());I=false;}if(c&&c.getPoints()&&c.getPoints().length>0){a+=(I?"":"\n")+this._oRb.getText(("AREAMICROCHART_ACTUAL_VALUES"))+":";I=false;var d=c.getPoints();for(var i=0;i<d.length;i++){a+=" "+d[i].getY();}}if(t&&t.getPoints()&&t.getPoints().length>0){a+=(I?"":"\n")+this._oRb.getText(("AREAMICROCHART_TARGET_VALUES"))+":";var T=t.getPoints();for(var j=0;j<T.length;j++){a+=" "+T[j].getY();}}for(var k=0;k<this.getLines().length;k++){var e=this.getLines()[k];if(e.getPoints()&&e.getPoints().length>0){a+=(I?"":"\n")+e.getTitle()+":";var g=e.getPoints();for(var y=0;y<g.length;y++){a+=" "+g[y].getY();}if(this.getColorPalette().length==0){a+=" "+this._getLocalizedColorMeaning(e.getColor());}}}return a;};A.prototype.getTooltip_AsString=function(){var t=this.getTooltip();var T=this.getAltText();if(typeof t==="string"||t instanceof String){T=t.split("{AltText}").join(T).split("((AltText))").join(T);return T;}else if(this.isBound("tooltip")&&!t){return T;}return t?t:"";};A.prototype._getAccessibilityControlType=function(){return this._oRb.getText("ACC_CTR_TYPE_AREAMICROCHART");};A.prototype.clone=function(){var c=C.prototype.clone.apply(this,arguments);c._isMinXValue=this._isMinXValue;c._isMaxXValue=this._isMaxXValue;c._isMinYValue=this._isMinYValue;c._isMaxYValue=this._isMaxYValue;return c;};A.prototype.exit=function(){if(D.system.tablet||D.system.phone){D.orientation.detachHandler(this._onOrientationChange,this);}sap.ui.getCore().detachThemeChanged(this._handleThemeApplied,this);};A.prototype._addTitleAttribute=function(){if(!this.$().attr("title")){this.$().attr("title",this.getTooltip_AsString());}};A.prototype._removeTitleAttribute=function(){if(this.$().attr("title")){this.$().removeAttr("title");}};A.prototype._bindMouseEnterLeaveHandler=function(){if(!this._oMouseEnterLeaveHandler){this._oMouseEnterLeaveHandler={mouseEnterChart:this._addTitleAttribute.bind(this),mouseLeaveChart:this._removeTitleAttribute.bind(this)};}this.$().bind("mouseenter",this._oMouseEnterLeaveHandler.mouseEnterChart);this.$().bind("mouseleave",this._oMouseEnterLeaveHandler.mouseLeaveChart);};A.prototype._unbindMouseEnterLeaveHandler=function(){if(this._oMouseEnterLeaveHandler){this.$().unbind("mouseenter",this._oMouseEnterLeaveHandler.mouseEnterChart);this.$().unbind("mouseleave",this._oMouseEnterLeaveHandler.mouseLeaveChart);}};l._overrideGetAccessibilityInfo(A.prototype);return A;});
