/*!
 * SAP APF Analysis Path Framework 
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function(){"use strict";jQuery.sap.require("sap.suite.ui.commons.ChartContainer");sap.ui.jsview("sap.apf.ui.reuse.view.stepContainer",{getControllerName:function(){return"sap.apf.ui.reuse.controller.stepContainer";},createContent:function(c){if(sap.ui.Device.system.desktop){c.getView().addStyleClass("sapUiSizeCompact");}var a=new sap.suite.ui.commons.ChartContainer({id:c.createId("idChartContainer"),showFullScreen:true}).addStyleClass("chartContainer ChartArea");this.stepLayout=new sap.ui.layout.VerticalLayout({id:c.createId("idStepLayout"),content:[a],width:"100%"});this.stepLayout.setBusy(true);return this.stepLayout;}});}());
