/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.require("sap.m.MessageBox");(function(){'use strict';var v;function _(m){var t=m.getMessage();while(m.getPrevious()){m=m.getPrevious();t=t+'\n'+m.getMessage();}return t;}function a(){window.history.go(-1);}function b(C,m){sap.m.MessageBox.information(m.getMessage(),{styleClass:sap.ui.Device.system.desktop?"sapUiSizeCompact":""});}function c(C,m){sap.m.MessageToast.show(m.getMessage(),{width:"20em"});}function d(C){var l=v.oCoreApi.getLogMessages();var s=false;for(var i=0;i<l.length;i++){if(l[i].search(5021)!==-1){s=true;break;}}return s;}function e(C,m){var D=new sap.m.Dialog(C.createId("idShowDetailsDialog"),{contentWidth:jQuery(window).height()*0.6+"px",contentHeight:jQuery(window).height()*0.6+"px",title:v.oCoreApi.getTextNotHtmlEncoded("error"),type:sap.m.DialogType.Message,state:sap.ui.core.ValueState.Error,content:new sap.ui.core.HTML({content:['<div><p> '+jQuery.sap.encodeHTML(_(m))+'</p></div>'].join(""),sanitizeContent:true}),beginButton:new sap.m.Button({text:v.oCoreApi.getTextNotHtmlEncoded("close"),press:function(){D.close();}}),afterClose:function(){D.destroy();}});D.setInitialFocus(D);D.open();}function f(C,m){var s=d(C);var D=new sap.m.Dialog(C.createId("idFatalDialog"),{title:v.oCoreApi.getTextNotHtmlEncoded("error"),type:sap.m.DialogType.Message,state:sap.ui.core.ValueState.Error,content:[new sap.m.Text({text:s?v.oCoreApi.getTextNotHtmlEncoded("application-reload"):v.oCoreApi.getTextNotHtmlEncoded("fatalErrorMessage")}),new sap.m.VBox({alignItems:sap.m.FlexAlignItems.End,items:[new sap.m.Link({text:v.oCoreApi.getTextNotHtmlEncoded("showDetails"),press:function(){e(C,m);}})]})],beginButton:new sap.m.Button({text:v.oCoreApi.getTextNotHtmlEncoded("close"),press:function(){a();}}),afterClose:function(){D.destroy();}});D.setInitialFocus(D);D.open();}function g(C,m){var o=v.oCoreApi;var u=v.uiApi;var D=new sap.m.Dialog(C.createId("idShowValidStateDialog"),{title:o.getTextNotHtmlEncoded("error"),type:sap.m.DialogType.Message,state:sap.ui.core.ValueState.Error,content:[new sap.m.Text({text:o.getTextNotHtmlEncoded("lastValidStateMessage")}),new sap.m.VBox({alignItems:sap.m.FlexAlignItems.End,items:[new sap.m.Link({text:o.getTextNotHtmlEncoded("showDetails"),press:function(){e(C,m);}})]})],beginButton:new sap.m.Button({text:o.getTextNotHtmlEncoded("gobackToValidState"),press:function(){var p=o.restoreApfState();p.then(function(){u.getAnalysisPath().getController().bLastValidState=true;u.getAnalysisPath().getCarousel().getController().removeAllSteps();o.updatePath(u.getAnalysisPath().getController().callBackForUpdatePath.bind(u.getAnalysisPath().getController()));u.getAnalysisPath().getController().setPathTitle();D.close();u.getAnalysisPath().getCarousel().rerender();u.getLayoutView().setBusy(false);},function(){D.close();});}}),endButton:new sap.m.Button({text:o.getTextNotHtmlEncoded("startNewAnalysis"),press:function(){u.getAnalysisPath().getToolbar().getController().resetAnalysisPath();D.close();}}),afterClose:function(){D.destroy();}});D.setInitialFocus(D);D.open();}function h(C,m){var i=v.oCoreApi.isApfStateAvailable();if(i){g(C,m);}else{f(C,m);}}sap.ui.controller("sap.apf.ui.reuse.controller.messageHandler",{onInit:function(){var C=this;if(sap.ui.Device.system.desktop){C.getView().addStyleClass("sapUiSizeCompact");}v=C.getView().getViewData();},showMessage:function(m){var C=this;var s=m.getSeverity();var S=sap.apf.core.constants.message.severity;switch(s){case S.fatal:v.uiApi.getLayoutView().setBusy(false);h(C,m);break;case S.error:v.uiApi.getLayoutView().setBusy(false);break;case S.information:b(C,m);break;case S.success:c(C,m);break;default:jQuery.sap.log.error("Error type not defined");break;}if(s===S.warning||s===S.error){sap.m.MessageToast.show(m.getMessage(),{width:"40%",offset:"0 -50",animationDuration:2000});}}});}());
