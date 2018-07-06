/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/UIComponent","sap/m/NavContainer","sap/fe/core/BusyHelper","sap/ui/core/ComponentContainer","sap/fe/core/internal/testableHelper","sap/fe/model/DraftModel","sap/fe/model/NamedBindingModel","sap/fe/controller/NavigationController","sap/fe/viewFactory","sap/ui/model/resource/ResourceModel","sap/fe/core/TemplateUtils"],function(q,U,N,B,C,t,D,a,b,v,R,T){"use strict";t.testableStatic(function(){},"suppressPageCreation");function g(A,o){var o={oAppComponent:A,oBusyHelper:null,oMessageUtils:null,oActionController:null,oCommonUtils:null,aAppStateChangedListener:[],getNavigationController:function(){return new b(o);}};var c=new T(o);function d(i){var r=sap.ui.getCore().getLibraryResourceBundle("sap.fe");return r.getText(i);}function u(e,f){var h=f.getData();if(h&&(JSON.stringify(h)!==JSON.stringify(e.getProperty("/")))&&e){e.setProperty("/",h);return true;}return false;}return{init:function(){var s=sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.ShellUIService");o.oShellServicePromise=(s&&s.createInstance())||Promise.reject();o.oShellServicePromise.catch(function(){q.sap.log.warning("No ShellService available");});o.oInnerAppStatePromise=new q.Deferred();o.oAppStateModel=new sap.ui.model.json.JSONModel();var m=A.getModel();if(m){a.upgrade(m).then(function(){(U.prototype.init||q.noop).apply(A,arguments);o.oBusyHelper.setBusy(o.oShellServicePromise);o.oBusyHelper.setBusyReason("initAppComponent",false);D.isDraftModel(m).then(function(I){if(I){D.upgrade(m).then(function(){A.setModel(m.getDraftAccessModel(),"$draft");});}});});m.getMetaModel().requestObject("/$EntityContainer/").catch(function(e){o.getNavigationController().navigateToMessagePage({text:d("SAPFE_APPSTART_TECHNICAL_ISSUES"),description:e.message});});}var i=new R({bundleName:"sap/fe/messagebundle",async:true});i.getResourceBundle().then(function(r){i.getResourceBundle=function(){return r;};});A.setModel(i,"sap.fe.i18n");},exit:function(){if(o.oNavContainer){o.oNavContainer.destroy();}},createContent:function(){if(o.oNavContainer){return"";}var r=A.getRouter();var m=A.getMetadata();var e=m.getManifestEntry("sap.ui5");var f=e&&e.routing&&e.routing.targets;var V={},h;for(var i=0;i<e.routing.routes.length;i++){h=e.routing.routes[i];if(h.pattern.indexOf("?")===-1){r.addRoute({name:h.name+"$sap.fe.params",pattern:h.pattern+"?{parameters}",target:h.target});}}r._oViews._getViewWithGlobalId=function(P){if(P.id.indexOf("---")){P.id=P.id.split("---")[1];}var j;var k=function(){if(!V[P.id]){V[P.id]=v.create({viewId:P.id,viewName:P.viewName,appComponent:A,entitySet:j.entitySet,viewData:j.viewData,model:A.getModel()});}return V[P.id];};for(var p in f){j=f[p];if(j.viewId===P.id){return{loaded:k};}}};r.attachRouteMatched(function(E){var s;if(E.getParameters().name==="root"){o.oInnerAppStatePromise.resolve();if(o.oAppState){o.oAppState=null;o.oAppStateModel.setData({});for(var i=0;i<o.aAppStateChangedListener.length;i++){o.aAppStateChangedListener[i]();}}}else if(E.getParameters().name.endsWith("$sap.fe.params")){var p=E.getParameters().arguments.parameters;var P=p.split("&"),j,I;for(var i=0;i<P.length;i++){j=P[i];if(p.indexOf("iAppState=")===0){I=j.replace("iAppState=","");if(o.oAppState&&I===o.oAppState.getKey()){o.oInnerAppStatePromise.resolve();return;}}}if(I){sap.ushell.Container.getService("CrossApplicationNavigation").getAppState(A,I).done(function(S){o.oAppState=S;u(o.oAppStateModel,S);o.oInnerAppStatePromise.resolve();for(var i=0;i<o.aAppStateChangedListener.length;i++){o.aAppStateChangedListener[i]();}});}}else{var k=E.getParameters().arguments&&E.getParameters().arguments.key;if(k){s="/"+E.getParameters().config.pattern.replace("{key}",k);var l=V[e.routing.targets[E.getParameter("config").target].viewId];if(l){l.then(function(n){n.bindElement(s);});}}}});o.oNavContainer=new N({id:"appContent"});o.oBusyHelper=new B(o);o.oBusyHelper.setBusyReason("initAppComponent",true,true);r.initialize();return o.oNavContainer;},getTemplateUtils:function(){return c;}};}return U.extend("sap.fe.AppComponent",{metadata:{config:{fullWidth:true},routing:{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","viewPath":"sap.fe.templates","controlId":"appContent","controlAggregation":"pages","async":true}},library:"sap.fe"},constructor:function(){var A=t.startApp();q.extend(this,g(this,A));(U.prototype.constructor||q.noop).apply(this,arguments);}});});