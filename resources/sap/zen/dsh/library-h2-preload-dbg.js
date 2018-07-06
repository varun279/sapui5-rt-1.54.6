jQuery.sap.registerPreloadedModules({
"name":"sap/zen/dsh/library-h2-preload",
"version":"2.0",
"modules":{
	"sap/zen/dsh/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.zen.dsh","type":"library","embeds":["fioriwrapper"],"applicationVersion":{"version":"1.54.6"},"title":"Design Studio Runtime Library.","description":"Design Studio Runtime Library.  Intended only to be used within S/4 HANA Fiori applications.","ach":"BI-RA-AD-EA","resources":"resources.json","offline":true,"openSourceComponents":[{"name":"underscore","packagedWithMySelf":true,"version":"0.0.0"},{"name":"xlsx","packagedWithMySelf":true,"version":"0.0.0"},{"name":"jszip","packagedWithMySelf":true,"version":"0.0.0"}]},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"minUI5Version":"1.54","libs":{"sap.ui.core":{"minVersion":"1.54.0"},"sap.ui.table":{"minVersion":"1.54.0"},"sap.ui.layout":{"minVersion":"1.54.0"},"sap.m":{"minVersion":"1.54.0"},"sap.viz":{"minVersion":"1.54.0","lazy":true},"sap.zen.commons":{"minVersion":"1.54.6"},"sap.zen.crosstab":{"minVersion":"1.54.6"}}},"library":{"i18n":false}}}',
/*!
 * (c) Copyright 2010-2018 SAP SE or an SAP affiliate company.
 */
	"sap/zen/dsh/library.js":function(){jQuery.sap.declare("sap.zen.dsh.library");jQuery.sap.require("sap.ui.core.Core");jQuery.sap.require("sap.ui.core.library");jQuery.sap.require("sap.ui.table.library");jQuery.sap.require("sap.ui.layout.library");jQuery.sap.require("sap.m.library");jQuery.sap.require("sap.zen.commons.library");jQuery.sap.require("sap.zen.crosstab.library");sap.ui.getCore().initLibrary({name:"sap.zen.dsh",dependencies:["sap.ui.core","sap.ui.table","sap.ui.layout","sap.m","sap.zen.commons","sap.zen.crosstab"],types:[],interfaces:[],controls:["sap.zen.dsh.AnalyticGrid","sap.zen.dsh.Dsh"],elements:[],noLibraryCSS:true,version:"1.54.6"});
}
}});
/* Bundle format 'h2' not supported (requires ui5loader)
"sap/zen/dsh/AnalyticGrid.js":["sap/ui/core/Control.js","sap/ui/thirdparty/URI.js","sap/zen/dsh/library.js"],
"sap/zen/dsh/AnalyticGridRenderer.js":["sap/zen/dsh/DshRenderer.js"],
"sap/zen/dsh/Dsh.js":["sap/ui/core/Control.js","sap/zen/dsh/library.js"],
"sap/zen/dsh/fioriwrapper/Component.js":["sap/ui/core/UIComponent.js"],
"sap/zen/dsh/library.js":["sap/m/library.js","sap/ui/core/Core.js","sap/ui/core/library.js","sap/ui/layout/library.js","sap/ui/table/library.js","sap/zen/commons/library.js","sap/zen/crosstab/library.js"]
*/
//# sourceMappingURL=library-h2-preload.js.map