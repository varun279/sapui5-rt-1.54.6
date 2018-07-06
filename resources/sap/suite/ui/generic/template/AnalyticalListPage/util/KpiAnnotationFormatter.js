// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
sap.ui.define(["sap/suite/ui/generic/template/AnalyticalListPage/util/KpiUtil","sap/suite/ui/generic/template/AnalyticalListPage/util/V4Terms","sap/suite/ui/generic/template/AnalyticalListPage/util/KpiAnnotationHelper"],function(K,V,a){"use strict";jQuery.sap.declare("sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter");sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter={};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions={count:0};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.NumberFormatFunctions={};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.criticalityConstants={StateValues:{None:"None",Negative:"Error",Critical:"Warning",Positive:"Success"},ColorValues:{None:"Neutral",Negative:"Error",Critical:"Critical",Positive:"Good"}};function c(i,C){var S;if(C){S=C.None;if(i&&i.EnumMember){var v=i.EnumMember;if(e(v,"Negative")){S=C.Negative;}else if(e(v,"Critical")){S=C.Critical;}else if(e(v,"Positive")){S=C.Positive;}}}return S;}function e(S,i){return S&&S.indexOf(i,S.length-i.length)!==-1;}function b(v,i,j,k,t,l,C){var o={};o.EnumMember="None";if(v!==undefined){v=Number(v);if(e(i,"Minimize")||e(i,"Minimizing")){o.EnumMember="None";if(l||k){if(v<=l){o.EnumMember="Positive";}else if(v>k){o.EnumMember="Negative";}else{o.EnumMember="Critical";}}}else if(e(i,"Maximize")||e(i,"Maximizing")){o.EnumMember="None";if(t||j){if(v>=t){o.EnumMember="Positive";}else if(v<j){o.EnumMember="Negative";}else{o.EnumMember="Critical";}}}else if(e(i,"Target")){o.EnumMember="None";if(t&&l){if(v>=t&&v<=l){o.EnumMember="Positive";}else if(v<j||v>k){o.EnumMember="Negative";}else{o.EnumMember="Critical";}}}}return c(o,C);}function d(i,r,u,j){if(!i||!r){return;}i=Number(i);if(!u&&(i-r>=0)){return"Up";}if(!j&&(i-r<=0)){return"Down";}if(r&&u&&(i-r>=u)){return"Up";}if(r&&j&&(i-r<=j)){return"Down";}}function f(v,r,i){if(!r){return;}r=Number(r);if(i){return r+"%";}return r;}sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.resolvePathForKpiReferenceValue=function(C,D){var v=K.getPathOrPrimitiveValue(D.Value);var r=K.getPathOrPrimitiveValue(D.TrendCalculation.ReferenceValue);var i=K.isRelative(D);var I=K.isBindingValue(r);var p="parts: ["+v;p+=I?","+r:"";p+="]";var j=function(){var k=1;return f(arguments[0],I?arguments[k++]:r,i);};var F=s(j,"formatReferenceValueCalculation");return"{"+p+", formatter: '"+F+"'}";};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.resolveKpiHeaderState=function(C,D){return g(C,D,sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.criticalityConstants.ColorValues);};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.resolvePathForTrendIcon=function(C,D){if(!D||!D.Value||!D.Value.Path||!D.TrendCalculation){return"";}if(D.Trend){var t=K.getPathOrPrimitiveValue(D.Trend);return t;}var v=K.getPathOrPrimitiveValue(D.Value);var r=K.getPathOrPrimitiveValue(D.TrendCalculation.ReferenceValue);var i=K.getPathOrPrimitiveValue(D.TrendCalculation.DownDifference);var u=K.getPathOrPrimitiveValue(D.TrendCalculation.UpDifference);var I=K.isBindingValue(r);var j=K.isBindingValue(i);var k=K.isBindingValue(u);var p="parts: ["+v;p+=I?","+r:"";p+=j?","+i:"";p+=k?","+u:"";p+="]";var l=function(){var m=1;return d(arguments[0],I?arguments[m++]:r,j?arguments[m++]:i,k?arguments[m++]:u);};var F=s(l,"formatTrendDirection");return"{"+p+", formatter: '"+F+"'}";};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatDPTitle=function(C,D){var S=C.getSetting("settings").getData();var m=C.getSetting("dataModel");var M=m.getMetaModel();var E=M.getODataEntitySet(S.entitySet);var o=M.getODataEntityType(E.entityType);var i=M.getODataProperty(o,D.Value.Path);var t=K.getPathOrPrimitiveValue(D.Title);var r="",u="";if(i["Org.OData.Measures.V1.Unit"]){var U=i["Org.OData.Measures.V1.Unit"];u=K.getPathOrPrimitiveValue(U);}else if(i["Org.OData.Measures.V1.ISOCurrency"]){var j=i["Org.OData.Measures.V1.ISOCurrency"];u=K.getPathOrPrimitiveValue(j);}var I=K.isBindingValue(u)&&!u.match(/{@i18n>.+}/gi),k=K.isBindingValue(t);var l=function(n,q){q=q||t;n=n||u;var v=(u==="%");if(n===undefined){return q;}else{if(!v){if(n.match(/{@i18n>.+}/gi)){return this.getModel('i18n').getResourceBundle().getText("KPI_CARD_TITLE_UNIT",[q,this.getModel('i18n').getResourceBundle().getText(n.substring(7,u.length-1))]);}else{return this.getModel('i18n').getResourceBundle().getText("KPI_CARD_TITLE_UNIT",[q,n]);}}else{return q;}}};var F=s(l,"formatTitleForDP");var p="["+(I?u:"{path:'DUMMY'}")+", "+(k?t:"{path: 'DUMMY'}")+"]";r="{parts: "+p+", formatter: '"+F+"'}";return r;};function g(C,D,o){var S=o.None;if(D.Criticality){var i=D.Criticality?D.Criticality.EnumMember.split("/")[1]:undefined;var I=K.isBindingValue(i);if(I){S=i;}else{S=c(D.Criticality,o);}}else if(D.CriticalityCalculation&&D.Value&&D.Value){S=h(C,D,o);}return S;}function h(C,D,o){var v=K.getPathOrPrimitiveValue(D.Value);var i=K.isBindingValue(v);var I=D.CriticalityCalculation.ImprovementDirection.EnumMember;var j=D.CriticalityCalculation.DeviationRangeLowValue?K.getPathOrPrimitiveValue(D.CriticalityCalculation.DeviationRangeLowValue):undefined;var k=D.CriticalityCalculation.DeviationRangeHighValue?K.getPathOrPrimitiveValue(D.CriticalityCalculation.DeviationRangeHighValue):undefined;var t=D.CriticalityCalculation.ToleranceRangeLowValue?K.getPathOrPrimitiveValue(D.CriticalityCalculation.ToleranceRangeLowValue):undefined;var l=D.CriticalityCalculation.ToleranceRangeHighValue?K.getPathOrPrimitiveValue(D.CriticalityCalculation.ToleranceRangeHighValue):undefined;var m=K.isBindingValue(j);var n=K.isBindingValue(k);var p=K.isBindingValue(t);var q=K.isBindingValue(l);var P="parts: ["+(i?v:"{path:'DUMMY'}");P+=m?","+j:"";P+=n?","+k:"";P+=p?","+t:"";P+=q?","+l:"";P+="]";var r=function(){var u=1;return b(i?arguments[0]:v,I,m?arguments[u++]:j,n?arguments[u++]:k,p?arguments[u++]:t,q?arguments[u++]:l,o);};var F=s(r,"formatCriticalityCalculation");return"{"+P+", formatter: '"+F+"'}";}function s(i,n){if(!sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions[n]){sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions[n]=0;}sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions[n]++;var F=n+sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions[n];sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions[F]=i;return"sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatFunctions."+F;}sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.getAggregateNumber=function(C,E,D,S,o){var i=S&&S.SelectOptions;var p;var j=",filters:";var k=[];if(i){i.forEach(function(w){p=w.PropertyName.PropertyPath;w[p].forEach(function(R){if(R.Sign.EnumMember===V.SelectionRangeSignType+"/I"||R.Sign.EnumMember===V.SelectionRangeSignType+"/E"){if(R.Low){k.push(K.getFilter(R,w));}}});});}var m=D&&D.Value&&D.Value.Path;var t=D&&D.TargetValue&&D.TargetValue.Path;var r="";j+=JSON.stringify(k);var P=a.resolveParameterizedEntitySet(C.getSetting("dataModel"),E,S);r+="{path: '"+P+"',length:1";var l=o.metaModel.getODataEntityType(E.entityType,false);var n=o.metaModel.getODataProperty(l,m);var u=n&&n[V.Unit]&&n[V.Unit].Path;var q=n&&n[V.ISOCurrency]&&n[V.ISOCurrency].Path;var v=[];v.push(m);if(u){v.push(u);}if(t){v.push(t);}if(q){v.push(q);}if(D.TrendCalculation&&D.TrendCalculation.ReferenceValue&&D.TrendCalculation.ReferenceValue.Path){v.push(D.TrendCalculation.ReferenceValue.Path);}return r+", parameters:{select:'"+v.join(",")+"'}"+j+"}";};sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.getAggregateNumber.requiresIContext=true;sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.resolveKpiHeaderState.requiresIContext=true;sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.resolvePathForTrendIcon.requiresIContext=true;sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter.formatDPTitle.requiresIContext=true;return sap.suite.ui.generic.template.AnalyticalListPage.util.KpiAnnotationFormatter;},true);
