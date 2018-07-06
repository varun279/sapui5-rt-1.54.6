/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([],function(){"use strict";var s=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.stack","sap.ovp.cards.linklist","sap.ovp.cards.charts.analytical","sap.ovp.cards.charts.bubble","sap.ovp.cards.charts.donut","sap.ovp.cards.charts.line"];function g(){return s;}function e(m,b,E){var d={};d.message=m;if(E){d._oError=E;d.getActualError=function(){return d._oError;};}jQuery.sap.log.error(d.message);b(d);}function c(C){var b=false;var O=C.getOwnerComponent();if(!!O){var d=O.getComponentData();if(!!d&&d.ovpCardsAsApi){b=true;}}return b;}function r(C,b){var m=b.manifest;var d;for(var f in m.cards){d=f;}var h=m.cards[d];if(h.template==="sap.ovp.cards.charts.analytical"){h.settings.chartAnnotationPath=C.chartAnnotationPath;h.settings.navigation=C.navigation;}h.settings.annotationPath=C.annotationPath;h.settings.dynamicSubtitleAnnotationPath=C.dynamicSubtitleAnnotationPath;h.settings.presentationAnnotationPath=C.presentationAnnotationPath;h.settings.selectionAnnotationPath=C.selectionAnnotationPath;h.settings.selectionPresentationAnnotationPath=C.selectionPresentationAnnotationPath;h.settings.kpiAnnotationPath=C.kpiAnnotationPath;h.settings.dataPointAnnotationPath=C.dataPointAnnotationPath;h.settings.identificationAnnotationPath=C.identificationAnnotationPath;h.settings.headerAnnotationPath=C.headerAnnotationPath;h.settings.selectedKey=C.selectedKey;if(h){m.cards[d]=h;a(b.parentView,m,b.containerId,b.selectionVariant);}}function _(C,S){var f=[],p=[],i,j;var b=S.getSelectOptionsPropertyNames();for(i=0;i<b.length;i++){var d=S.getSelectOption(b[i]);if(d&&d.length>0){for(j=0;j<d.length;j++){if(d[j]){var F={path:b[i],operator:d[j].Option,value1:d[j].Low,sign:d[j].Sign};if(d[j].High){F.value2=d[j].High;}f.push(F);}}}}var P=S.getParameterNames();for(i=0;i<P.length;i++){var h={path:P[i],value:S.getParameter(P[i])};p.push(h);}C.settings.filters=f;C.settings.parameters=p;return C;}function a(v,m,C,S){return new Promise(function(b,d){var f,h,M="";if(!!m){for(var i in m.cards){if(m.cards.hasOwnProperty(i)){f=m.cards[i];h=i;}}if(!!f&&!!h){if(!!f.template&&!!f.model&&!!f.settings){if(s.indexOf(f.template)!==-1){if(!!C&&typeof C==='string'){if(!!v){var j=v.getModel(f.model);var k=j.getMetaModel().loaded();k.then(function(){var I=false;if(S){f=_(f,S);I=true;}f.settings.ignoreSelectionVariant=I;var l={async:true,name:f.template,componentData:{model:j,ovpCardsAsApi:true,parentView:v,manifest:m,containerId:C,selectionVariant:S,showDateInRelativeFormat:m.showDateInRelativeFormat,disableTableCardFlexibility:m.disableTableCardFlexibility,template:f.template,i18n:null,cardId:h,settings:f.settings,appComponent:null,mainComponent:null}};sap.ui.component(l).then(function(n){var p=v.byId(C);if(!!p){var O=p.getComponentInstance();n.setModel(j);p.setComponent(n);if(O){setTimeout(function(){O.destroy();},0);}b(true);}else{M="Component Container '"+C+"' is not present in the current View";e(M,d);}},function(E){M="Component creation failed";e(M,d,E);});},function(E){M="MetaModel was not loaded";e(M,d,E);});}else{M="First argument oView is null";e(M,d);}}else{M="ContainerId should be of type string and not null";e(M,d);}}else{M=f.template+" card type is not supported in the API";e(M,d);}}else{M="Cards template or model or settings are not defined";e(M,d);}}else{M="Cards manifest entry or cardId is null";e(M,d);}}else{M="Second argument oManifest is null";e(M,d);}});}var o={createCardComponent:a,recreateCard:r,checkIfAPIIsUsed:c,getSupportedCardTypes:g};return o;},true);
