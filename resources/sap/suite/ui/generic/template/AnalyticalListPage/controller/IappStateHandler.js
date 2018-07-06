sap.ui.define(["jquery.sap.global","sap/ui/base/Object","sap/ui/generic/app/navigation/service/SelectionVariant","sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil","sap/ui/Device","sap/ui/comp/state/UIState"],function(q,B,S,F,D,U){"use strict";function g(s,c,n){var a="sap.suite.ui.generic.template.customData";var b="sap.suite.ui.generic.template.genericData";var d="visual";var e="compact";var p;var I=false,f=false,_=null;var o=null;var A=null;var r={appStateKey:"",urlParams:{}};function h(){return p.then(function(){if(r.appStateKey){return{"sap-iapp-state":[r.appStateKey]};}return r.urlParams;});}function R(i){if(i&&i.editStateFilter!==undefined){var M=c.byId("editStateFilter");if(M){M.setSelectedKey((i.editStateFilter===null)?0:i.editStateFilter);}}var T=s.oController.getOwnerComponent().getModel("_templPriv");if(i.chartVariantId&&s.oSmartChart){s.oSmartChart.setCurrentVariantId(i.chartVariantId);}if(i.filterMode){T.setProperty('/alp/filterMode',i.filterMode);s.filterBarController.handleFilterSwitch(i.filterMode);}else{k();}if(i.contentView){((D.system.phone||D.system.tablet&&!D.system.desktop)&&i.contentView==="charttable")?T.setProperty('/alp/contentView',"chart"):T.setProperty('/alp/contentView',i.contentView);}if(i.autoHide){T.setProperty('/alp/autoHide',i.autoHide);}}function j(i){i=i||{};if(i.hasOwnProperty(a)&&i.hasOwnProperty(b)){R(i[b]);v(i[a]);}else{if(i._editStateFilter!==undefined){R({editStateFilter:i._editStateFilter});delete i._editStateFilter;}k();v(i);}}function k(){var T=s.oController.getOwnerComponent().getModel("_templPriv"),i=s.oSmartFilterbar.isCurrentVariantStandard()?s.oController.getOwnerComponent().getDefaultFilterMode():T.getProperty('/alp/filterMode');if(!(i===d||i===e)){q.sap.log.error("Defaulting to Visual filter due to incorrect value of defaultFilterMode in App descriptor");i=d;}if(i===d&&s.hideVisualFilter){q.sap.log.error("Visual filter is hidden defaulting to compact");i=e;}s.filterBarController.setDefaultFilter(i);}function l(i,M,N){s.oSmartFilterbar.setSuppressSelection(false);var O=i.appStateKey||"";if(I){return;}A=O;I=true;var P=(!O&&M)||{};if(N!==sap.ui.generic.app.navigation.service.NavType.initial){var Q=i&&i.bNavSelVarHasDefaultsOnly;var T=new S(i.selectionVariant);if((T.getSelectOptionsPropertyNames().indexOf("DisplayCurrency")===-1)&&(T.getSelectOptionsPropertyNames().indexOf("P_DisplayCurrency")===-1)&&(T.getParameterNames().indexOf("P_DisplayCurrency")===-1)){m(T,i);}y(T);if(!Q||s.oSmartFilterbar.isCurrentVariantStandard()){x(T);}if(i.tableVariantId&&s.oSmartTable){s.oSmartTable.setCurrentVariantId(i.tableVariantId);}var V=s.oController.getOwnerComponent().getModel("_templPriv");if(N===sap.ui.generic.app.navigation.service.NavType.xAppState&&V.getProperty('/alp/filterMode')===d){w();}if(i.customData){j(i.customData);}else{k();}if(!Q){s.oSmartFilterbar.checkSearchAllowed(s);var V=s.oController.getView().getModel("_templPriv"),W=V.getProperty("/alp/searchable");if(W){f=true;s.oSmartFilterbar.search();}}r={appStateKey:O,urlParams:P};}else{if(s.oSmartFilterbar.isLiveMode()){s.oSmartFilterbar.checkSearchAllowed(s);if(s.oController.getView().getModel("_templPriv").getProperty("/alp/searchable")){f=true;}}k();}G();o=null;if(!f){L();}else{I=false;}}function m(i,M){var N=s.oSmartFilterbar.determineMandatoryFilterItems(),O;for(var P=0;P<N.length;P++){if(N[P].getName().indexOf("P_DisplayCurrency")!==-1){if(M.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")&&M.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")[0].Low){O=M.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")[0].Low;}if(O){i.addParameter("P_DisplayCurrency",O);}if(s.alr_visualFilterBar&&O){s.alr_visualFilterBar.setDisplayCurrency(O);}break;}}}function t(){var i={};i[a]={};var T=s.oController.getOwnerComponent().getModel("_templPriv");i[b]={chartVariantId:s.oSmartChart&&s.oSmartChart.getCurrentVariantId(),filterMode:T.getProperty('/alp/filterMode'),contentView:T.getProperty('/alp/contentView'),autoHide:T.getProperty('/alp/autoHide')};var M=c.byId("editStateFilter");if(M){i[b].editStateFilter=M.getSelectedKey();}c.getCustomAppStateDataExtension(i[a]);return i;}function u(){var M=s.oSmartFilterbar.getUiState({allFilters:false}).getSelectionVariant();var V=c.getVisibleSelectionsWithDefaults();for(var i=0;i<V.length;i++){if(!M.getValue(V[i])){M.addSelectOption(V[i],"I","EQ","");}}if(s.oController.byId('template::PageVariant').currentVariantGetModified()&&M.SelectionVariantID){M.SelectionVariantID="";}return{selectionVariant:JSON.stringify(M),tableVariantId:s.oSmartTable&&s.oSmartTable.getCurrentVariantId(),customData:t()};}function v(i){c.restoreCustomAppStateDataExtension(i||{});}function w(){var i=q.extend(true,{},s.oSmartFilterbar.getFilterData(true)),M=s.oController.getOwnerComponent().getModel("_filter");M.setData(i);s.filterBarController._updateFilterLink();}function x(i){s.oSmartFilterbar.clearVariantSelection();s.oSmartFilterbar.clear();H(i.toJSONObject(),true,false);}function y(M){var N=M.getParameterNames().concat(M.getSelectOptionsPropertyNames());for(var i=0;i<N.length;i++){s.oSmartFilterbar.addFieldToAdvancedArea(N[i]);}if(s.alr_visualFilterBar){s.alr_visualFilterBar.addVisualFiltersToBasicArea(N);}}function z(){if(I){return;}var i=u();try{o=n.storeInnerAppStateWithImmediateReturn(i);}catch(M){q.sap.log.error("AnalyticalListPage.fnStoreCurrentAppStateAndAdjustURL: "+M);}if(o instanceof sap.ui.generic.app.navigation.service.NavError){o=null;return;}if(o&&A!==o.appStateKey){r.appStateKey=o.appStateKey;}}function C(){var T=s.oController.getOwnerComponent().getModel("_templPriv");if(T.getProperty('/alp/filterMode')===d){if(!T.getProperty("/alp/searchable")){s.oSmartFilterbar.showFilterDialog();}}}function E(){if(s.oSmartFilterbar.isInitialised()){s.oSmartFilterbar.checkSearchAllowed(s);}}function G(){E();C();var i=s.oController.getOwnerComponent().getModel("_filter");i.setData(q.extend(true,{},s.oSmartFilterbar.getFilterData(true)));s.filterBarController._updateFilterLink();if(s.alr_visualFilterBar&&s.alr_visualFilterBar.updateVisualFilterBindings){s.alr_visualFilterBar.updateVisualFilterBindings(true);}}function H(i,M,N){var O=new U({selectionVariant:i});s.oSmartFilterbar.setUiState(O,{replace:M,strictMode:N});}function J(i){p=n.parseNavigation();}function K(){try{var i=new Promise(function(N,O){_=N;p.done(l);p.fail(O);});return i;}catch(M){k();G();}}function L(){I=false;_();}return{getFilterState:t,fnCheckMandatory:E,getCurrentAppState:u,fnUpdateSVFB:G,fnSetDefaultFilter:k,fnRestoreFilterState:j,getUrlParameterInfo:h,onSmartFilterBarInitialise:J,onSmartFilterBarInitialized:K,fnStoreCurrentAppStateAndAdjustURL:z,fnSetFiltersUsingUIState:H,fnResolveStartUpPromise:L};}return B.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.IappStateHandler",{constructor:function(s,c,n){q.extend(this,g(s,c,n));}});});
