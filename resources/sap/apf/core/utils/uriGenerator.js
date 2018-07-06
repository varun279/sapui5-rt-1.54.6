/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.utils.uriGenerator");jQuery.sap.require("sap.apf.core.messageObject");(function(){'use strict';sap.apf.core.utils.uriGenerator={};sap.apf.core.utils.uriGenerator.getAbsolutePath=function(p){if(p.slice(-1)==='/'){return p;}return p+"/";};sap.apf.core.utils.uriGenerator.getODataPath=function(p){var s=p.split('/');var i;var S=[];for(i=0;i<s.length;i++){if(s[i]!==""){S.push(s[i]);}}var r='';var l=S.length-1;for(i=0;i<l;i++){r=r+'/'+S[i];}return r+'/';};sap.apf.core.utils.uriGenerator.addRelativeToAbsoluteURL=function(a,r){var b=a.split('/');var c=r.split('/');c.forEach(function(p){if(p==='..'){b.pop();}else if(p!='.'){b.push(p);}});return b.join('/');};sap.apf.core.utils.uriGenerator.getBaseURLOfComponent=function(c){var b=c.split('.');b.pop();var a=b.join('.');return jQuery.sap.getModulePath(a);};sap.apf.core.utils.uriGenerator.getApfLocation=function(){return jQuery.sap.getModulePath("sap.apf")+'/';};sap.apf.core.utils.uriGenerator.generateOdataPath=function(m,a,e,f,n){var p=d(a,f);var r=e;var b=false;var c;for(c in p){if(!b){r+='(';b=true;}else{r+=',';}r+=c.toString()+'='+p[c];}if(b){r+=')/';}r+=n||'';return r;function d(){var r={};var g;var h;var t;var i;var j;g=a.getParameterEntitySetKeyProperties(e);if(g!==undefined){h=g.length;}else{h=0;}if(h>0){for(i=0;i<h;i++){if(f&&f instanceof sap.apf.core.utils.Filter){t=f.getFilterTermsForProperty(g[i].name);j=t[t.length-1];}if(j instanceof sap.apf.core.utils.FilterTerm){k(i,j.getValue());}else if(g[i].defaultValue){k(i,g[i].defaultValue);}else if(g[i].parameter!=='optional'){m.putMessage(m.createMessageObject({code:'5016',aParameters:[g[i].name]}));}}}return r;function k(l,v){var o;if(g[l].dataType.type==='Edm.String'){o=sap.apf.utils.formatValue(v,g[l]);r[g[l].name]=(jQuery.sap.encodeURL(o));}else if(g[l].dataType.type){o=sap.apf.utils.formatValue(v,g[l]);if(typeof o==='string'){r[g[l].name]=jQuery.sap.encodeURL(o);}else{r[g[l].name]=o;}}else if(typeof v==='string'){r[g[l].name]=jQuery.sap.encodeURL(sap.apf.utils.escapeOdata(v));}else{r[g[l].name]=v;}}}};sap.apf.core.utils.uriGenerator.getSelectString=function(s){var r="";s.forEach(function(a,i){r+=jQuery.sap.encodeURL(sap.apf.utils.escapeOdata(a));if(i<s.length-1){r+=",";}});return r;};sap.apf.core.utils.uriGenerator.buildUri=function(m,e,s,f,F,a,p,b,c,n,M){var r="";r+=sap.apf.core.utils.uriGenerator.generateOdataPath(m,M,e,F,n);r=r+"?";r+=d(s);r+=g(f,c);r+=h(a,s);r+=j(p);r+=k(b);return r;function d(s){if(!s[0]){return'';}var R="$select=";R+=sap.apf.core.utils.uriGenerator.getSelectString(s);return R;}function g(F,c){if(!(F&&F instanceof sap.apf.core.utils.Filter)||F.isEmpty()){return'';}var i=F.toUrlParam({formatValue:c});if(i===""||i==='()'){return'';}return'&$filter='+i;}function h(a,s){var o='';var S='';var i;if(!a){return'';}switch(true){case jQuery.isArray(a):for(i=0;i<a.length;i++){S=l(a[i],s);if(o.length>0&&S.length>0){o+=',';}o+=S;}break;case jQuery.isPlainObject(a):o+=l(a,s);break;case typeof a==='string':o+=l({property:a},s);break;}if(o.length>0){return"&$orderby="+o;}return'';function l(O,s){var v='';if(jQuery.inArray(O.property,s)>-1){v+=O.property;if(O.ascending===false){v+=' desc';}else{v+=' asc';}}else{m.putMessage(m.createMessageObject({code:'5019',aParameters:[e,O.property]}));}return jQuery.sap.encodeURL(v);}}function j(p){function l(p){var P,i;P=Object.getOwnPropertyNames(p);for(i=0;i<P.length;i++){if(P[i]!=='top'&&P[i]!=='skip'&&P[i]!=='inlineCount'){m.putMessage(m.createMessageObject({code:'5032',aParameters:[e,P[i]]}));}}}var r='';if(!p){return r;}l(p);if(p.top){r+='&$top='+p.top;}if(p.skip){r+='&$skip='+p.skip;}if(p.inlineCount===true){r+='&$inlinecount=allpages';}return r;}function k(b){if(!b){b='json';}return'&$format='+b;}};}());
