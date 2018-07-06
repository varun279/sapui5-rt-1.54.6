/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/ux3/library','sap/ui/ux3/NavigationBar','sap/ui/commons/library','sap/ui/commons/RichTooltip'],function(q,l,U,N,C,R){"use strict";var V=N.extend("sap.suite.ui.commons.VerticalNavigationBar",{metadata:{deprecated:true,library:"sap.suite.ui.commons"}});V.prototype.init=function(){N.prototype.init.apply(this);if(!this._oResBundle){this._oResBundle=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");}};V.prototype._handleActivation=function(e){if(e.target.tagName==="SPAN"){e.target=e.target.parentElement;}N.prototype._handleActivation.call(this,e);};V.prototype.onAfterRendering=function(){N.prototype.onAfterRendering.apply(this);if(!this._oBarItemsMap){this._oBarItemsMap={};}var t=this;q(".sapSuiteTvNavBarItemLink").mousemove(function(){t._showTooltip(q(this).attr("id"));}).mouseleave(function(e){t._hideTooltip(q(this).attr("id"));});};V.prototype.exit=function(){this._oBarItemsMap=null;N.prototype.exit.apply(this);};V.prototype._handleScroll=function(){};V.prototype._showTooltip=function(t){var i=this._oBarItemsMap[t];if(!i){i=sap.ui.getCore().byId(t);if(i){this._oBarItemsMap[t]=i;var T=new R({text:i.getTooltip_AsString()||i.getText()});T.addStyleClass("sapSuiteTvNavBarItemTltp");T._currentControl=i;i.addDelegate(T);i.setAggregation("tooltip",T,true);}}if(i&&!i.doOpen){i.doOpen=true;i.openTimer=setTimeout(function(){i.getTooltip().openPopup(i);i.closeTimer=setTimeout(function(){i.getTooltip().closePopup();i.doOpen=false;},10000);},2000);}};V.prototype._hideTooltip=function(t){var i=this._oBarItemsMap[t];if(i){i.doOpen=false;clearTimeout(i.openTimer);clearTimeout(i.closeTimer);i.getTooltip().closePopup();}};return V;});