/*!
 * (c) Copyright 2010-2018 SAP SE or an SAP affiliate company.
 */
sap.ui.predefine('sap/zen/commons/library',['jquery.sap.global','sap/ui/base/DataType','sap/ui/core/library','sap/ui/layout/library'],function(q,D){"use strict";sap.ui.getCore().initLibrary({name:"sap.zen.commons",version:"1.54.6",dependencies:["sap.ui.core","sap.ui.layout"],types:["sap.zen.commons.layout.BackgroundDesign","sap.zen.commons.layout.HAlign","sap.zen.commons.layout.Padding","sap.zen.commons.layout.Separation","sap.zen.commons.layout.VAlign"],interfaces:[],controls:["sap.zen.commons.layout.AbsoluteLayout","sap.zen.commons.layout.MatrixLayout",],elements:["sap.zen.commons.layout.MatrixLayoutCell","sap.zen.commons.layout.MatrixLayoutRow","sap.zen.commons.layout.PositionContainer"]});sap.zen.commons.layout=sap.zen.commons.layout||{};sap.zen.commons.layout.BackgroundDesign={Border:"Border",Fill1:"Fill1",Fill2:"Fill2",Fill3:"Fill3",Header:"Header",Plain:"Plain",Transparent:"Transparent"};sap.zen.commons.layout.HAlign={Begin:"Begin",Center:"Center",End:"End",Left:"Left",Right:"Right"};sap.zen.commons.layout.Padding={None:"None",Begin:"Begin",End:"End",Both:"Both",Neither:"Neither"};sap.zen.commons.layout.Separation={None:"None",Small:"Small",SmallWithLine:"SmallWithLine",Medium:"Medium",MediumWithLine:"MediumWithLine",Large:"Large",LargeWithLine:"LargeWithLine"};sap.zen.commons.layout.VAlign={Bottom:"Bottom",Middle:"Middle",Top:"Top"};return sap.zen.commons;});
jQuery.sap.registerPreloadedModules({
"name":"sap/zen/commons/library-h2-preload",
"version":"2.0",
"modules":{
	"sap/zen/commons/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.zen.commons","type":"library","embeds":[],"applicationVersion":{"version":"1.54.6"},"title":"Layout components used by Design Studio.","description":"Layout components used by Design Studio.  NOT INTENDED FOR STANDALONE USAGE.","ach":"BI-RA-AD-EA","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":["base","sap_belize","sap_belize_hcb","sap_belize_hcw","sap_belize_plus","sap_bluecrystal","sap_hcb"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.54","libs":{"sap.ui.core":{"minVersion":"1.54.0"},"sap.ui.layout":{"minVersion":"1.54.0"}}},"library":{"i18n":false,"content":{"controls":["sap.zen.commons.layout.AbsoluteLayout","sap.zen.commons.layout.MatrixLayout"],"elements":["sap.zen.commons.layout.MatrixLayoutCell","sap.zen.commons.layout.MatrixLayoutRow","sap.zen.commons.layout.PositionContainer"],"types":["sap.zen.commons.layout.BackgroundDesign","sap.zen.commons.layout.HAlign","sap.zen.commons.layout.Padding","sap.zen.commons.layout.Separation","sap.zen.commons.layout.VAlign"],"interfaces":[]}}}}'
}});
/* Bundle format 'h2' not supported (requires ui5loader)
"sap/zen/commons/layout/AbsoluteLayout.js":["jquery.sap.global.js","sap/ui/core/Control.js","sap/zen/commons/layout/PositionContainer.js","sap/zen/commons/library.js"],
"sap/zen/commons/layout/AbsoluteLayoutRenderer.js":["jquery.sap.global.js"],
"sap/zen/commons/layout/MatrixLayout.js":["jquery.sap.global.js","sap/ui/core/Control.js","sap/ui/core/EnabledPropagator.js","sap/zen/commons/layout/MatrixLayoutCell.js","sap/zen/commons/layout/MatrixLayoutRow.js","sap/zen/commons/library.js"],
"sap/zen/commons/layout/MatrixLayoutCell.js":["jquery.sap.global.js","sap/ui/core/CustomStyleClassSupport.js","sap/ui/core/Element.js","sap/zen/commons/library.js"],
"sap/zen/commons/layout/MatrixLayoutRenderer.js":["jquery.sap.global.js"],
"sap/zen/commons/layout/MatrixLayoutRow.js":["jquery.sap.global.js","sap/ui/core/CustomStyleClassSupport.js","sap/ui/core/Element.js","sap/zen/commons/library.js"],
"sap/zen/commons/layout/PositionContainer.js":["jquery.sap.global.js","sap/ui/core/Element.js","sap/zen/commons/library.js"],
"sap/zen/commons/library.js":["jquery.sap.global.js","sap/ui/base/DataType.js","sap/ui/core/library.js","sap/ui/layout/library.js"]
*/
//# sourceMappingURL=library-h2-preload.js.map