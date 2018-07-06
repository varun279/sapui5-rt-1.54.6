/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/XMLComposite'],function(q,X){"use strict";var P=X.extend("sap.ui.mdc.base.linkinfo.Panel",{metadata:{library:"sap.ui.mdc",defaultAggregation:"items",properties:{enablePersonalization:{type:"boolean",defaultValue:true}},aggregations:{mainItem:{type:"sap.ui.mdc.base.linkinfo.Item",multiple:false},items:{type:"sap.ui.mdc.base.linkinfo.Item",multiple:true,singularName:"item"},extraContent:{type:"sap.ui.core.Control",multiple:false,forwardTo:{targetIdSuffix:"--IDExtraContent",targetAggregation:"items",forwardBinding:false}}}}});P.prototype.init=function(){this.setModel(new sap.ui.model.resource.ResourceModel({bundleUrl:sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").oUrlInfo.url}),"i18n");};return P;},true);
