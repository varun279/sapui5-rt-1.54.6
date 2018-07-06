sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/suite/ui/generic/template/ListReport/controller/MultipleViewsSingleTableModeHelper","sap/suite/ui/generic/template/ListReport/controller/MultipleViewsMultipleTablesModeHelper","sap/suite/ui/generic/template/lib/BusyHelper","sap/ui/model/Filter"],function(q,B,M,a,b,F){"use strict";var P="/listReport/multipleViews";var c=P+"/selectedKey";var d=P+"/mode";var e=P+"/items";function g(s,C,t){var I;var m;var S;var D;var T=t.oComponentUtils.getTemplatePrivateModel();var f;var h=t.oServices.oApplication.getBusyHelper().getBusyDelay();function r(){if(I&&I.fnRegisterToChartEvents){return I.fnRegisterToChartEvents.apply(null,arguments);}}function o(){if(I&&I.onDetailsActionPress){return I.onDetailsActionPress.apply(null,arguments);}}function k(){if(!I){return;}var i=w();return i.templateSortOrder;}function l(i){var j;if(!i){return"";}if(i.state==="error"){return t.oCommonUtils.getText("SEG_BUTTON_ERROR",i.text);}if(i.state===""||i.state==="busy"){var O=sap.ui.core.format.NumberFormat.getIntegerInstance({groupingEnabled:true});j=O.format(i.count);}return t.oCommonUtils.getText("SEG_BUTTON_TEXT",[i.text,i.state==="busyLong"?"...":j]);}function n(){if(I){var i=T.getProperty(c);var j=I.getContentForIappState(i);return{mode:m,state:j};}}function R(i){if(I){var j=I.getSelectedKeyAndRestoreFromIappState(i);T.setProperty(c,j);}}function p(){return T.getProperty(c);}function u(i){if(!I){return;}var j=function(O,Q,V){var W=t.oCommonUtils.getElementCustomData(Q);var X=f[O]||Object.create(null);X.selectionVariantFilters=V;X.templateSortOrder=W.TemplateSortOrder;X.implementingControl=Q;if(!!D){X.entitySet=Q.getEntitySet&&Q.getEntitySet();X.properties=K(Q);}f[O]=X;if(S){var Y=e+"/"+O;var Z=function(_,a1,b1){if(X.numberOfUpdates!==a1){return;}var $=q.extend({},T.getProperty(Y));if(!$.state&&_=="busy"){setTimeout(function(){if(T.getProperty(Y).state==="busy"){$=q.extend({},T.getProperty(Y));$.state="busyLong";T.setProperty(Y,$);}},h);}$.state=_;if(!_){$.count=b1;}T.setProperty(Y,$);};X.numberOfUpdates=0;X.updateStartFunction=Z.bind(null,"busy");X.updateSuccessFunction=Z.bind(null,"");X.errorFunction=Z.bind(null,"error");var $={text:W.text,count:0,state:""};T.setProperty(Y,$);}};I.init(i,j);}function v(){return m;}function w(){return f[T.getProperty(c)];}function x(i){if(!I){return;}var j=i.getParameter("bindingParams");s.oFiltersWithoutSmartFilterBar=q.extend(true,{},j);if(v()==="multi"){var O=s.oSmartFilterbar.getFilters();s.oFiltersForCounts=y(j);z(s.oSmartTable,j);L(s.oSmartTable,O,j);}else if(v()==="single"){s.oFiltersForCounts=q.extend(true,{},j);}A(j);}function A(j){var O=w();var Q=O.selectionVariantFilters;for(var i in Q){j.filters.push(Q[i]);}}function y(i){var j=q.extend(true,{},i);E(j.filters,s.oMultipleViewsHandler.aTableFilters);return j;}function z(i,j){if(!!D){N(i,j.filters);}}function E(O,Q){for(var i in Q){var V=Q[i];for(var j=O.length;j--;j>=0){if(JSON.stringify(O[j])===JSON.stringify(V)){O.splice(j,1);break;}}}}function U(){var i=s.oSmartTable.getModel();var j=[],O;var Q=s.oSmartFilterbar.getBasicSearchValue();var V={};var W;W=s.oSmartFilterbar.getFilters();if(Q){V={search:Q};}var X;for(var Y in f){X=q.extend(true,{},s.oFiltersForCounts);var Z=f[Y];O=Z.entitySet;if(!O){O=s.oSmartTable.getEntitySet();}Z.numberOfUpdates++;Z.updateStartFunction(Z.numberOfUpdates);if(v()==="multi"){L(Z.implementingControl,W,X);}if(Z.selectionVariantFilters&&Z.selectionVariantFilters.length>0){j=X.filters.concat(Z.selectionVariantFilters);}else{j=X.filters;}i.read("/"+O+"/$count",{urlParameters:V,filters:j,groupId:"updateMultipleViewsItemsCounts",success:Z.updateSuccessFunction.bind(null,Z.numberOfUpdates),error:Z.errorFunction.bind(null,Z.numberOfUpdates)});}}function G(){if(S){U();}}function H(){return S;}function J(){return I;}function K(i){var j,O,Q,V;j=i.getEntitySet();O=i.getModel().getMetaModel();Q=O.getODataEntitySet(j);V=O.getODataEntityType(Q.entityType);return V.property;}function L(i,j,O){var Q=[],V;if(j.length<1){return;}if(!!D){Q=N(i,j);}else{Q=j;}if(Q&&Q[0]&&Q[0].aFilters&&Q[0].aFilters.length>0){if(O.filters[0]&&O.filters[0].aFilters&&O.filters[0].aFilters.length>0){V=O.filters[0];O.filters[0]=new F([V,Q[0]],true);}else{O.filters.push(Q[0]);}}}function N(i,O){var Q,V,W,X,j,Y;if(!O||O.length<1){return;}for(W in f){if(f[W].implementingControl===i){Q=f[W].properties;break;}}var Z=q.extend(true,[],O);if(Z[0]&&Z[0].aFilters instanceof Array){Y=Z[0].aFilters;}else{Y=Z;}if(!Y){return;}for(j=Y.length-1;j>=0;j--){V=false;if(Y[j].aFilters instanceof Array){X=Y[j].aFilters[0].sPath;}else{X=Y[j].sPath;}Q.some(function($){if($.name===X){V=true;return V;}});if(!V){Y.splice(j,1);}}return Z;}(function(){var j,O,Q,V;j=C.getOwnerComponent().getAppComponent().getConfig();O=j&&j.pages[0]&&j.pages[0].component&&j.pages[0].component.settings;if(!O){return;}Q=O.quickVariantSelectionX;V=O.quickVariantSelection;if(Q&&V){throw new Error("Defining both QuickVariantSelection and QuickVariantSelectionX in the manifest is not allowed.");}var W=Q||V;if(!W){return;}S=W.showCounts;f=Object.create(null);T.setProperty(P,Object.create(null));var X=true;var Y=function(_){if(X){X=false;T.setProperty(c,_);}};if(V){I=new M(V,s,C,t,Y,f);m="single";q.sap.log.info("This list supports multiple views with single table");}else{I=new a(Q,s,C,t,Y,f);m="multi";q.sap.log.info("This list supports multiple views with multiple tables/charts");for(var i in Q.variants){if(!!Q.variants[i].entitySet){D=true;break;}else{D=false;break;}}}T.setProperty(d,m);T.setProperty(e,Object.create(null));var Z=T.bindProperty(c);var $=C.byId("page");Z.attachChange(function(_){if($){$.setPreserveHeaderStateOnScroll(true);}if(I.onSelectedKeyChanged){var a1=_.getSource().getValue();I.onSelectedKeyChanged(a1);}var b1=s.oIappStateHandler.areDataShownInTable();var c1=true;if(typeof I.isTableDirty==='function'){c1=I.isTableDirty(s.oSmartTable);}if(s.oWorklistData.bWorkListEnabled){b1=true;c1=true;}if(b1&&c1){if(t.oCommonUtils.isSmartChart(s.oSmartTable)){s.oSmartTable.rebindChart();if(typeof I.setTableDirty==='function'){I.setTableDirty(s.oSmartTable,false);}}else if(t.oCommonUtils.isSmartTable(s.oSmartTable)){s.oSmartTable.rebindTable();t.oCommonUtils.refreshSmartTable(s.oSmartTable);}}else{t.oCommonUtils.setEnabledToolbarButtons(s.oSmartTable);}s.oIappStateHandler.changeIappState(true,b1);if(t.oCommonUtils.isSmartTable(s.oSmartTable)){if($&&$.getPreserveHeaderStateOnScroll()){$.setPreserveHeaderStateOnScroll(false);}}});})();return{fnRegisterToChartEvents:r,onDetailsActionPress:o,determineSortOrder:k,onDataRequested:G,formatItemTextForMultipleView:l,getContentForIappState:n,restoreFromIappState:R,getVariantSelectionKey:p,init:u,getMode:v,onRebindContentControl:x,getShowCounts:H,getImplementingHelper:J};}return B.extend("sap.suite.ui.generic.template.ListReport.controller.MultipleViewsHandler",{constructor:function(s,C,t){q.extend(this,g(s,C,t));}});});
