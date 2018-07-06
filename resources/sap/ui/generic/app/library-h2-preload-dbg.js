/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.predefine('sap/ui/generic/app/library',['jquery.sap.global','sap/ui/core/library'],function(q,l){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.generic.app",version:"1.54.6",dependencies:["sap.ui.core"],types:["sap.ui.generic.app.navigation.service.NavType","sap.ui.generic.app.navigation.service.ParamHandlingMode","sap.ui.generic.app.navigation.service.SuppressionBehavior"],interfaces:[],controls:[],elements:[],noLibraryCSS:true});sap.ui.generic.app.navigation.service.ParamHandlingMode={SelVarWins:"SelVarWins",URLParamWins:"URLParamWins",InsertInSelOpt:"InsertInSelOpt"};sap.ui.generic.app.navigation.service.NavType={initial:"initial",URLParams:"URLParams",xAppState:"xAppState",iAppState:"iAppState"};sap.ui.generic.app.navigation.service.SuppressionBehavior={standard:0,ignoreEmptyString:1,raiseErrorOnNull:2,raiseErrorOnUndefined:4};sap.ui.lazyRequire("sap.ui.generic.app.AppComponent","new extend getMetadata");return sap.ui.generic.app;},false);
jQuery.sap.registerPreloadedModules({
"name":"sap/ui/generic/app/library-h2-preload",
"version":"2.0",
"modules":{
	"sap/ui/generic/app/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ui.generic.app","type":"library","embeds":[],"applicationVersion":{"version":"1.54.6"},"title":"The SAPUI5 library contains classes that are mainly used in smart template applications, but can also be used in any Fiori/UI5 application that uses the OData protocol to communicate with an application server.","description":"The SAPUI5 library contains classes that are mainly used in smart template applications, but can also be used in any Fiori/UI5 application\\n                   that uses the OData protocol to communicate with an application server.","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"minUI5Version":"1.54","libs":{"sap.ui.core":{"minVersion":"1.54.6"},"sap.ui.comp":{"minVersion":"1.54.6","lazy":true},"sap.m":{"minVersion":"1.54.6","lazy":true}}},"library":{"i18n":"messagebundle.properties","css":false,"content":{"controls":[],"elements":[],"types":["sap.ui.generic.app.navigation.service.NavType","sap.ui.generic.app.navigation.service.ParamHandlingMode","sap.ui.generic.app.navigation.service.SuppressionBehavior"],"interfaces":[]}}}}'
}});
/* Bundle format 'h2' not supported (requires ui5loader)
"sap/ui/generic/app/AppComponent.js":["sap/suite/ui/generic/template/lib/AppComponent.js"],
"sap/ui/generic/app/ApplicationController.js":["jquery.sap.global.js","sap/ui/generic/app/transaction/BaseController.js","sap/ui/generic/app/transaction/TransactionController.js","sap/ui/generic/app/util/ModelUtil.js"],
"sap/ui/generic/app/fragments/MessageDialog.fragment.xml":["sap/m/Bar.js","sap/m/Button.js","sap/m/Dialog.js","sap/m/MessageItem.js","sap/m/MessageView.js","sap/m/Text.js","sap/ui/core/Fragment.js"],
"sap/ui/generic/app/library.js":["jquery.sap.global.js","sap/ui/core/library.js"],
"sap/ui/generic/app/navigation/service/NavError.js":["jquery.sap.global.js","sap/ui/base/Object.js"],
"sap/ui/generic/app/navigation/service/NavigationHandler.js":["jquery.sap.global.js","sap/ui/base/Object.js","sap/ui/core/UIComponent.js","sap/ui/core/routing/HashChanger.js","sap/ui/generic/app/library.js","sap/ui/generic/app/navigation/service/NavError.js","sap/ui/generic/app/navigation/service/SelectionVariant.js","sap/ui/model/resource/ResourceModel.js"],
"sap/ui/generic/app/navigation/service/PresentationVariant.js":["jquery.sap.global.js","sap/ui/base/Object.js","sap/ui/generic/app/navigation/service/NavError.js"],
"sap/ui/generic/app/navigation/service/SelectionVariant.js":["jquery.sap.global.js","sap/ui/base/Object.js","sap/ui/generic/app/navigation/service/NavError.js"],
"sap/ui/generic/app/transaction/BaseController.js":["jquery.sap.global.js","sap/ui/base/EventProvider.js","sap/ui/generic/app/util/DraftUtil.js","sap/ui/generic/app/util/ModelUtil.js","sap/ui/generic/app/util/Queue.js"],
"sap/ui/generic/app/transaction/DraftContext.js":["jquery.sap.global.js","sap/ui/base/Object.js","sap/ui/generic/app/util/ModelUtil.js"],
"sap/ui/generic/app/transaction/DraftController.js":["jquery.sap.global.js","sap/ui/generic/app/transaction/BaseController.js","sap/ui/generic/app/transaction/DraftContext.js"],
"sap/ui/generic/app/transaction/TransactionController.js":["jquery.sap.global.js","sap/ui/generic/app/transaction/BaseController.js","sap/ui/generic/app/transaction/DraftController.js","sap/ui/generic/app/util/ModelUtil.js"],
"sap/ui/generic/app/util/ActionUtil.js":["jquery.sap.global.js","sap/m/Dialog.js","sap/m/MessageBox.js","sap/m/Text.js","sap/m/VBox.js","sap/ui/base/ManagedObject.js","sap/ui/comp/smartfield/SmartField.js","sap/ui/comp/smartfield/SmartLabel.js","sap/ui/generic/app/util/ModelUtil.js","sap/ui/layout/form/SimpleForm.js"],
"sap/ui/generic/app/util/DraftUtil.js":["jquery.sap.global.js"],
"sap/ui/generic/app/util/MessageUtil.js":["sap/m/MessageToast.js","sap/ui/core/ValueState.js","sap/ui/model/Filter.js","sap/ui/model/FilterOperator.js"],
"sap/ui/generic/app/util/ModelUtil.js":["jquery.sap.global.js"],
"sap/ui/generic/app/util/Queue.js":["jquery.sap.global.js"]
*/
//# sourceMappingURL=library-h2-preload.js.map