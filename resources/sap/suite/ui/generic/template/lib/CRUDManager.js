sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/m/MessageToast","sap/ui/generic/app/util/ModelUtil","sap/ui/generic/app/util/ActionUtil","sap/suite/ui/generic/template/lib/MessageUtils","sap/m/MessageBox","sap/suite/ui/generic/template/lib/CRUDHelper","sap/suite/ui/generic/template/lib/testableHelper"],function(q,B,M,a,A,b,c,C,t){"use strict";var r=Promise.reject();r.catch(q.noop);function g(o,d,s,e,f){function h(O,i,j,P){b.handleError(O,o,s,j,P);return(i||q.noop)(j);}function l(){b.handleTransientMessages(s.oApplication.getDialogFragmentForView.bind(null,null));}var E;function m(i){return new Promise(function(j,k){var I=o.getOwnerComponent();var J=I.getBindingContext();var K=I.getModel();K.read(J.getPath(),{urlParameters:{"$expand":"DraftAdministrativeData"},success:function(R){if(!R.DraftAdministrativeData){if(i){return h(b.operations.editEntity,k,i);}return j({});}if(R.DraftAdministrativeData.InProcessByUser){var U=R.DraftAdministrativeData.InProcessByUserDescription||R.DraftAdministrativeData.InProcessByUser;i=i||new Error(e.getText("ST_GENERIC_DRAFT_LOCKED_BY_USER",[" ",U]));return h(b.operations.editEntity,k,i,i);}return j({draftAdministrativeData:R.DraftAdministrativeData});},error:h.bind(null,b.operations.editEntity,k)});});}function n(i,U,P){if(P.draftAdministrativeData){return Promise.resolve(P);}return new Promise(function(j,k){s.oTransactionController.editEntity(o.getView().getBindingContext(),!U).then(function(R){l(R);return j({context:R.context});},function(R){if(R&&R.response&&R.response.statusCode==="409"&&i&&!U){b.removeTransientMessages();return m(R).then(j,k);}else{h(b.operations.editEntity,k,R,R);}});});}E=function(U){var i=d.isDraftEnabled();var R;var j=o.getOwnerComponent();var k=j.getBindingContext();if(i&&!U){var I=s.oDraftController.getDraftContext();var P=I.hasPreserveChanges(k);if(!P){R=m().then(n.bind(null,true,true));}}R=R||n(i,U,{});if(i){s.oApplication.editingStarted(k,R);}return R;};function p(U){if(f.isBusy()){return r;}var R=E(U);f.setBusy(R);return R;}function u(i,j,k,I,S){var R=new Promise(function(J,K){var L=function(N){o.getOwnerComponent().getComponentContainer().bindElement(k.getPath());return h(b.operations.deleteEntity,K,N);};if(i&&I){s.oDraftController.getDraftForActiveEntity(k).then(function(N){s.oTransactionController.deleteEntity(N.context).then(function(){if(!S){s.oApplication.showMessageToast(e.getText("ST_GENERIC_DRAFT_WITH_ACTIVE_DOCUMENT_DELETED"));}return J();});},L);}else{s.oTransactionController.deleteEntity(k).then(function(){var N=a.getEntitySetFromContext(k);var O=s.oDraftController.getDraftContext();var P=O.isDraftRoot(N);var Q=e.getText("ST_GENERIC_OBJECT_DELETED");if(!i&&P){Q=e.getText(j?"ST_GENERIC_DRAFT_WITH_ACTIVE_DOCUMENT_DELETED":"ST_GENERIC_DRAFT_WITHOUT_ACTIVE_DOCUMENT_DELETED");}if(!S){s.oApplication.showMessageToast(Q);}return J();},L);}});return R;}function v(i,S){var R=new Promise(function(j,k){var I=o.getView().getBindingContext();var J=s.oDraftController.isActiveEntity(I);var K=s.oDraftController.hasActiveEntity(I);var L;if(i){L=Promise.resolve(I);}else if(K&&!J){L=s.oApplication.getDraftSiblingPromise(I);}else{L=Promise.resolve();}L.then(function(N){var O=u(J,K,I,i,S);O.then(j,k);if(!J){var T=function(){return{context:N};};var P=O.then(T);s.oApplication.cancellationStarted(I,P);}},k);});return R;}function w(P){var R=Object.create(null);var I=new Promise(function(J,K){var O=Object.create(null);var L=function(N,i,j){R[N]={resolve:i,reject:j};};for(var k=0;k<P.length;k++){var N=P[k];O[N]=new Promise(L.bind(null,N));}s.oApplication.prepareDeletion(O);s.oTransactionController.deleteEntities(P).then(function(Q){var S=[];var T=sap.ui.getCore().getMessageManager().getMessageModel().getData();for(var i=0;i<T.length;i++){var U=T[i].getTarget();for(var j=0;j<P.length;j++){var V=T[i].getType()||"";if(U.indexOf(P[j])>-1&&(V!=="Information"&&V!=="Success")){S.push(U);break;}}}return J(S);},function(i){return K(i);});});I.then(function(j){var k=[];for(var i=0;i<P.length;i++){var J=R[P[i]];if(j.indexOf(P[i])===-1){k.push(P[i]);J.resolve();}else{J.reject();}}});return I;}function x(i,j){if(f.isBusy()){j();return;}s.oTransactionController.triggerSubmitChanges().then(function(R){l();i(R.context);},h.bind(null,b.operations.saveEntity,j));}function y(){var R=new Promise(function(i,j){s.oApplication.performAfterSideEffectExecution(x.bind(null,i,j));});f.setBusy(R);return R;}function z(){if(f.isBusy()){return r;}var R=new Promise(function(i,j){var k=o.getView().getBindingContext();s.oApplication.getDraftSiblingPromise(k).then(function(S){if(S){o.getOwnerComponent().getModel().invalidateEntry(S);}var I=s.oDraftController.activateDraftEntity(k);s.oApplication.activationStarted(k,I);I.then(function(J){var P=J.context.getPath();function K(){l();i(J);}var L=d.getPreprocessorsData().rootContextExpand;if(L){var N=L.join(",");o.getView().getModel().read(P,{urlParameters:{"$select":N,"$expand":N},success:K,error:K});}else{K();}},h.bind(null,b.operations.activateDraftEntity,j));});});f.setBusy(R);return R;}function D(P){return new A(P);}function F(P,S,R,j){if(f.isBusy()){j();return;}var k=P.functionImportPath;var I=P.contexts;var J=P.sourceControl;var K=P.label;var N=P.navigationProperty;var O=P.operationGrouping;var L=D({controller:o,contexts:I,applicationController:s.oApplicationController,operationGrouping:O});var Q=function(Y,Z){if(Y.pages){for(var i in Y.pages){var $=Y.pages[i];if($.component.list!=true&&$.entitySet===Z){return true;}else{var _=Q($,Z);if(_){return true;}}}}return false;};var T=function(i,Y){var Z=i.getAppComponent().getConfig();if(Y&&Y.sPath){var $=Y.sPath.split("(")[0].replace("/","");return Q(Z.pages[0],$);}return false;};var U=function(i){var Y,Z,$,_;if(q.isArray(i)&&i.length===1){Y=i[0];}else{Y={response:{context:i.context}};}Z=Y.response&&Y.response.context;$=o.getOwnerComponent();_=T($,Z);if(_&&Z&&Z!==Y.actionContext&&Z.getPath()!=="/undefined"){if(J){e.navigateFromListItem(Z,J);}else{s.oNavigationController.navigateToContext(Z,N,false);}}if(i.length>0){var a1=e.getTableBindingInfo(J);var b1=a1&&a1.binding;if(b1&&b1.oEntityType){e.setEnabledToolbarButtons(J);if(d.isListReportTemplate()){e.setEnabledFooterButtons(J);}}}R(i);};var V=function(){if(I&&I[0]){var i=I[0].oModel;if(i&&i.hasPendingChanges()){i.resetChanges();}}};var W=function(i){V();j(i);};var X=function(i){if(q.isArray(i)){if(i.length===1){i=i[0].error;}else{i=null;}}var Y={context:I};V();h(b.operations.callAction,null,i,Y);j(i);};L.call(k,K).then(function(i){var Y={};Y.actionLabel=K;f.setBusy(i.executionPromise,null,Y);i.executionPromise.then(U,X);},W);}function G(P,S){var R=new Promise(function(i,j){s.oApplication.performAfterSideEffectExecution(F.bind(null,P,S,i,j));});return R;}function H(T,P){if(!T){throw new Error("Unknown Table");}var i="";var j="";var k=o.getOwnerComponent();var I=(k.getCreationEntitySet&&k.getCreationEntitySet())||k.getEntitySet();var J,K,N,L;var V=o.getView();var O=V.getModel();var Q=V.getBindingContext();if(Q){j=e.getTableBindingInfo(T).path;L=O.getMetaModel();K=L.getODataEntitySet(I);J=L.getODataEntityType(K.entityType);N=L.getODataAssociationSetEnd(J,j);if(N){I=N.entitySet;}j="/"+j;i=Q.getPath()+j;}else{i="/"+I;}var R=C.create(s.oDraftController,I,i,O,s.oApplication.setEditableNDC,P);s.oApplication.getBusyHelper().setBusy(R);return R.then(function(S){return{newContext:S,tableBindingPath:j};},h.bind(null,b.operations.addEntry,function(S){throw S;}));}var h=t.testable(h,"handleError");var D=t.testable(D,"getActionUtil");return{editEntity:p,deleteEntity:v,deleteEntities:w,saveEntity:y,activateDraftEntity:z,callAction:G,addEntry:H};}return B.extend("sap.suite.ui.generic.template.lib.CRUDManager",{constructor:function(o,d,s,e,f){q.extend(this,g(o,d,s,e,f));}});});
