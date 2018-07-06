/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ovp/cards/AppSettingsUtils"],function(A){"use strict";var r=A&&A.oOvpResourceBundle;r=r||sap.ui.getCore().getLibraryResourceBundle("sap.ovp");return{actions:{settings:function(){return{isEnabled:false,handler:function(e,g){A.getDialogBox(e).then(function(d){d.open();});return Promise.resolve([]);}};}},aggregations:{DynamicPage:{domRef:".sapUiComponentContainer",actions:{move:"moveControls",changeOnRelevantContainer:true},propagateMetadata:function(e){var t=e.getMetadata().getName();if(t!=="sap.ovp.ui.EasyScanLayout"&&t!=="sap.ui.core.ComponentContainer"){return{actions:null};}},propagateRelevantContainer:false}},name:{singular:r&&r.getText("Card"),plural:r&&r.getText("Cards")}};},false);
