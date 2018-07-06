/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2018 SAP SE. All rights reserved
    
 */
sap.ui.predefine('sap/me/library',['jquery.sap.global','sap/ui/core/Core','sap/ui/core/library'],function(q,C,l){"use strict";sap.ui.getCore().initLibrary({name:"sap.me",version:"1.54.6",dependencies:["sap.ui.core"],types:["sap.me.CalendarDesign","sap.me.CalendarEventType","sap.me.CalendarSelectionMode"],interfaces:[],controls:["sap.me.Calendar","sap.me.CalendarLegend","sap.me.OverlapCalendar","sap.me.ProgressIndicator","sap.me.TabContainer"],elements:["sap.me.OverlapCalendarEvent"]});sap.me.CalendarDesign={Action:"Action",Approval:"Approval"};sap.me.CalendarEventType={Type00:"Type00",Type01:"Type01",Type04:"Type04",Type06:"Type06",Type07:"Type07",Type10:"Type10"};sap.me.CalendarSelectionMode={SINGLE:"SINGLE",MULTIPLE:"MULTIPLE",RANGE:"RANGE"};return sap.me;},true);
jQuery.sap.registerPreloadedModules({
"name":"sap/me/library-h2-preload",
"version":"2.0",
"modules":{
	"sap/me/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.me","type":"library","embeds":[],"applicationVersion":{"version":"1.54.6"},"title":"SAPUI5 library with controls specialized for mobile devices (extension).","description":"SAPUI5 library with controls specialized for mobile devices (extension).","ach":"MOB-UIA-LIB-CC","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":["base","sap_belize","sap_belize_plus","sap_bluecrystal","sap_hcb"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.54","libs":{"sap.ui.core":{"minVersion":"1.54.6"}}},"library":{"i18n":false,"content":{"controls":["sap.me.Calendar","sap.me.CalendarLegend","sap.me.OverlapCalendar","sap.me.ProgressIndicator","sap.me.TabContainer"],"elements":["sap.me.OverlapCalendarEvent"],"types":["sap.me.CalendarDesign","sap.me.CalendarEventType","sap.me.CalendarSelectionMode"],"interfaces":[]}}}}'
}});
/* Bundle format 'h2' not supported (requires ui5loader)
"sap/me/Calendar.js":["jquery.sap.global.js","sap/me/CalendarDate.js","sap/me/library.js","sap/ui/core/Control.js","sap/ui/core/IconPool.js","sap/ui/core/LocaleData.js","sap/ui/core/date/UniversalDate.js"],
"sap/me/CalendarDate.js":["jquery.sap.global.js","sap/ui/core/date/UniversalDate.js"],
"sap/me/CalendarLegend.js":["jquery.sap.global.js","sap/me/library.js","sap/ui/core/Control.js","sap/ui/core/IconPool.js","sap/ui/core/theming/Parameters.js"],
"sap/me/CalendarLegendRenderer.js":["jquery.sap.global.js"],
"sap/me/CalendarRenderer.js":["jquery.sap.global.js","sap/me/CalendarDate.js","sap/ui/core/LocaleData.js","sap/ui/core/date/UniversalDate.js","sap/ui/core/format/DateFormat.js"],
"sap/me/OverlapCalendar.js":["jquery.sap.global.js","sap/me/Calendar.js","sap/me/CalendarDate.js","sap/me/library.js","sap/ui/core/Control.js","sap/ui/core/date/UniversalDate.js","sap/ui/core/theming/Parameters.js"],
"sap/me/OverlapCalendarEvent.js":["jquery.sap.global.js","sap/me/library.js","sap/ui/core/Element.js"],
"sap/me/OverlapCalendarRenderer.js":["jquery.sap.global.js"],
"sap/me/ProgressIndicator.js":["jquery.sap.global.js","sap/me/library.js","sap/ui/core/Control.js"],
"sap/me/ProgressIndicatorRenderer.js":["jquery.sap.global.js"],
"sap/me/TabContainer.js":["jquery.sap.global.js","sap/me/library.js","sap/ui/core/Control.js","sap/ui/core/IconPool.js","sap/ui/core/theming/Parameters.js"],
"sap/me/TabContainerRenderer.js":["jquery.sap.global.js"],
"sap/me/library.js":["jquery.sap.global.js","sap/ui/core/Core.js","sap/ui/core/library.js"]
*/
//# sourceMappingURL=library-h2-preload.js.map