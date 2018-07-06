/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(['sap/ui/Device','sap/ui/core/Core'],function(D,C){var t=sap.ui.getCore().initLibrary({name:"sap.ovp",dependencies:["sap.ui.core","sap.ui.layout","sap.ui.generic.app","sap.m","sap.f","sap.ui.comp","sap.ui.rta"],types:[],interfaces:[],controls:[],elements:[],version:"1.54.4",extensions:{flChangeHandlers:{"sap.ovp.ui.EasyScanLayout":"sap/ovp/flexibility/EasyScanLayout","sap.ovp.ui.DashboardLayout":"sap/ovp/flexibility/DashboardLayout"}}});if(D.browser.firefox){jQuery.sap.log.warning("Loading library 'sap.viz' and 'sap.suite.ui.microchart' to avoid issues with Firefox sync XHR support");sap.ui.getCore().loadLibrary("sap.viz");sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");}return t;});
