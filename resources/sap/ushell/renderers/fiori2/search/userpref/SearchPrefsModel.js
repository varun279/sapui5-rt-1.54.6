sap.ui.define(['sap/ui/model/json/JSONModel','sap/ushell/renderers/fiori2/search/SearchModel','sap/ushell/renderers/fiori2/search/SearchConfiguration','sap/ushell/renderers/fiori2/search/SearchHelper'],function(J,S,a,b){"use strict";var p='sap.ushell.renderers.fiori2.search.userpref.SearchPrefsModel';return sap.ui.model.json.JSONModel.extend(p,{asyncInit:function(){var t=this;if(t.initializedDeferred){return t.initializedDeferred;}t.searchModel=sap.ushell.renderers.fiori2.search.getModelSingleton();t.initializedDeferred=t.searchModel.initBusinessObjSearch().then(function(){if(!t.searchModel.config.searchBusinessObjects){t.setProperty('/searchPrefsActive',false);t.setProperty('/personalizedSearch',false);t.setProperty('/resetButtonWasClicked',false);return;}var s=t.searchModel.sinaNext;return b.convertPromiseTojQueryDeferred(s.getConfigurationAsync({forceReload:true})).then(function(c){t.configuration=c;t.setProperty('/searchPrefsActive',c.isPersonalizedSearchEditable);t.setProperty('/personalizedSearch',c.personalizedSearch);t.setProperty('/resetButtonWasClicked',false);});});return t.initializedDeferred;},reload:function(){this.initializedDeferred=false;return this.asyncInit();},shortStatus:function(){return this.asyncInit().then(function(){return this.getProperty('/personalizedSearch')?sap.ushell.resources.i18n.getText('sp.on'):sap.ushell.resources.i18n.getText('sp.off');}.bind(this));},isSearchPrefsActive:function(){return this.asyncInit().then(function(){return this.getProperty('/searchPrefsActive');}.bind(this));},savePreferences:function(){this.configuration.setPersonalizedSearch(this.getProperty('/personalizedSearch'));return b.convertPromiseTojQueryDeferred(this.configuration.saveAsync()).then(function(){this.setProperty('/resetButtonWasClicked',false);}.bind(this));},cancelPreferences:function(){this.setProperty('/personalizedSearch',this.configuration.personalizedSearch);this.setProperty('/resetButtonWasClicked',false);},resetProfile:function(){return b.convertPromiseTojQueryDeferred(this.configuration.resetPersonalizedSearchDataAsync()).then(function(){this.setProperty('/resetButtonWasClicked',true);}.bind(this));}});});