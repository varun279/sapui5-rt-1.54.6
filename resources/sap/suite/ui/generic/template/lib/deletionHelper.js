sap.ui.define([],function(){"use strict";function g(t){var A=t.oNavigationControllerProxy.getActiveComponents();var r=[];for(var i=0;i<A.length;i++){var c=A[i];var R=t.componentRegistry[c];var v=R.viewLevel;if(v>0){var C=R.oComponent.getBindingContext();if(C){r[v]=C.getPath();}}}return r;}function a(t,T){var A=t.oNavigationControllerProxy.getActiveComponents();for(var i=0;i<A.length;i++){var c=A[i];var r=t.componentRegistry[c];var v=r.viewLevel;if(v===T){return r;}}}function d(t,o){var r=a(t,0);if(r&&r.methods.displayNextObject){return r.methods.displayNextObject(o);}return Promise.reject();}function G(t,i){var I=t.oFlexibleColumnLayoutHandler&&t.oFlexibleColumnLayoutHandler.isNextObjectLoadedAfterDelete();if(I){var r=a(t,0);if(r){if(i){return[t.oApplicationProxy.getPathOfLastShownDraftRoot()];}return r.methods.getItems&&r.methods.getItems();}}return null;}function n(t,k){if(k===0){t.oNavigationControllerProxy.navigateToRoot(true);}else{var r=a(t,k+1);if(r&&r.methods.navigateUp){r.methods.navigateUp();}else{t.oNavigationControllerProxy.navigateToRoot(true);}}}function p(t,s,i,o){var O=[];var b;var c=[];var C;for(var k=0;k<i.length;k++){C=i[k].getBindingContextPath();c.push(C);}for(var j=0;j<c.length;j++){if(c[j]===s){O.push(c[j]);b=j;break;}}if(b>=0){var I=c.slice(b+1,c.length);var e;if(b>0){e=c.slice(0,b);e.reverse();}O=O.concat(I,e);}else{O=c;}o.then(function(){var N=d(t,O);N.catch(function(){n(t,0);});});}function P(t,o){o.then(function(){var F=t.oTemplatePrivateGlobalModel.getProperty("/generic/forceFullscreenCreate");if(F){t.oNavigationControllerProxy.navigateBack();}else{var O=G(t,true);if(O){d(t,O);}else{n(t,0);}}});}function f(t,o){var c=g(t);var D=[];var s=null;var I;var h=function(j,i){return{deleted:i,position:j};};for(var b in o){var e=o[b];t.oApplicationProxy.prepareDeletion(b,e);var j=c.indexOf(b);if(j===1){I=G(t);if(I){s=b;}}var k=e.then(h.bind(null,j,true),h.bind(null,j,false));D.push(k);}if(s){p(t,s,I,o[s]);}else{Promise.all(D).then(function(r){var K=-1;for(var i=0;i<r.length;i++){var R=r[i];if(R.deleted&&R.position>0){if(K<0||K>=R.position){K=R.position-1;}}}if(K>=0){n(t,K);}});}Promise.all(D).then(function(r){t.oViewDependencyHelper.setRootPageToDirty();});}return{prepareDeletion:f,prepareDeletionOfCreateDraft:P};});
