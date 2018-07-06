/* global jQuery, window, document, $, console, escape */
// iteration 0 s

(function(global) {
    "use strict";

    sap.ui.define([
        'sap/ushell/renderers/fiori2/search/SearchHelper',
        'sap/ushell/renderers/fiori2/search/SearchResultListFormatter',
        'sap/ushell/renderers/fiori2/search/SearchFacetsFormatter',
        'sap/ushell/renderers/fiori2/search/SearchTabStripsFormatter',
        'sap/ushell/renderers/fiori2/search/FacetItem',
        'sap/ushell/renderers/fiori2/search/suggestions/SuggestionHandler',
        'sap/ushell/renderers/fiori2/search/SearchConfiguration',
        'sap/ushell/renderers/fiori2/search/personalization/PersonalizationStorage',
        'sap/ushell/renderers/fiori2/search/SearchNavigationObject',
        'sap/ushell/renderers/fiori2/search/eventlogging/EventLogger',
        'sap/ushell/renderers/fiori2/search/SearchUrlParser'
        // 'sap/ushell/renderers/fiori2/search/SearchShellHelper'
    ], function(SearchHelper, SearchResultListFormatter, SearchFacetsFormatter,
        SearchTabStripsFormatter, FacetItem, SuggestionHandler,
        SearchConfiguration, PersonalizationStorage,
        SearchNavigationObject,
        /*NavigationTarget,*/
        EventLogger, SearchUrlParser /*, SearchShellHelper*/ ) {
        /* eslint no-warning-comments:0 */

        // =======================================================================
        // Global singleton method to get search model
        // ensure only one model instance available
        // =======================================================================
        sap.ushell.renderers.fiori2.search.getModelSingleton = function() {
            if (!sap.ushell.renderers.fiori2.search.oModel) {
                sap.ushell.renderers.fiori2.search.oModel =
                    new sap.ushell.renderers.fiori2.search.SearchModel();
            }
            return sap.ushell.renderers.fiori2.search.oModel;
        };

        var SearchShellHelper;

        // =======================================================================
        // search model
        // =======================================================================
        var SearchModel = sap.ui.model.json.JSONModel.extend("sap.ushell.renderers.fiori2.search.SearchModel", {

            constructor: function(properties) {
                /* eslint no-empty:0 */
                var that = this;
                properties = properties || {};

                // call base class constructor
                sap.ui.model.json.JSONModel.prototype.constructor.apply(that, []);

                // get search configuration
                that.config = SearchConfiguration.getInstance();

                // set size limit in order to allow drop down list boxes with more than 100 entries
                that.setSizeLimit(1000);

                // create suggestions handler
                that.suggestionHandler = new SuggestionHandler({
                    model: this
                });

                // decorate search methods (decorator prevents request overtaking)
                that.searchApplications = SearchHelper.refuseOutdatedRequests(that.searchApplications, 'search'); // app search

                // initial values for boTop and appTop
                that.pageSize = 10;
                that.appTopDefault = 20;
                that.boTopDefault = that.pageSize;

                //                that.oFacetFormatter = {};

                // init the properties
                // TODO always use main result list (also for pure app results)

                that.setProperty('/isQueryInvalidated', true); // force request if query did not change
                that.setProperty('/isBusy', false); //show a busy indicator?
                that.setProperty('/tableColumns', []); // columns of table design
                that.setProperty('/tableSortableColumns', []); // sort items of table design
                that.setProperty('/tableResults', []); // results suitable for table view
                that.setProperty('/results', []); // combined result list: apps + bos
                that.setProperty('/appResults', []); // applications result list
                that.setProperty('/boResults', []); // business object result list
                that.setProperty('/origBoResults', []); // business object result list
                that.setProperty('/count', 0);
                that.setProperty('/boCount', 0);
                that.setProperty('/appCount', 0);
                that.setProperty('/facets', []);
                that.setProperty('/dataSources', [that.allDataSource, that.appDataSource]);
                that.setProperty('/currentPersoServiceProvider', null); // current persoServiceProvider of table
                that.setProperty('/businessObjSearchEnabled', true);
                that.setProperty('/initializingObjSearch', false);
                that.setProperty('/suggestions', []);
                that.setProperty('/resultToDisplay', SearchHelper.loadResultViewType()); // type of search result to display
                that.setProperty('/displaySwitchVisibility', false); // visibility of display switch tap strip
                that.setProperty('/documentTitle', 'Search');
                that.setProperty('/top', that.boTopDefault);
                that.setProperty('/orderBy', {});
                that.setProperty('/facetVisibility', false); // visibility of facet panel
                that.setProperty('/focusIndex', 0);
                that.setProperty('/fuzzy', false);
                that.setProperty('/errors', []);
                that.setProperty('/isErrorPopovered', false);
                this.setProperty("/nlqSuccess", false);
                this.setProperty("/nlqDescription", "");
                this.setProperty("/firstSearchWasExecuted", false);

                that.setProperty('/multiSelectionAvailable', false); //
                that.setProperty('/multiSelectionEnabled', false); //
                that.setProperty('/multiSelection/actions', []); //

                // used for SearchFacetDialogModel: SearchFacetDialogModel is constructed with reference to original searchMode
                // the _initBusinessObjSearchProm is reused from original searchModel in order to avoid double initialization
                // in initBusinessObjSearch
                if (properties.searchModel && properties.searchModel._initBusinessObjSearchProm) {
                    that._initBusinessObjSearchProm = properties.searchModel._initBusinessObjSearchProm;
                    that.oFacetFormatter = new sap.ushell.renderers.fiori2.search.SearchFacetsFormatter(that);
                }

                // initialize enterprise search
                that.initBusinessObjSearch();

                that.searchUrlParser = new SearchUrlParser({
                    model: this
                });

            },

            // ################################################################################
            // Initialization:
            // ################################################################################

            createSina: function() {

                var sinaPromise = new jQuery.Deferred();

                // do not use path /sap/ushell/renderers/fiori2/search/sinaNext/sina/sinaFactory
                //
                // in core-ex-light-0     sap/ushell/renderers/fiori2/search/sinaNext/sina/sinaFactory is included
                // which is different to /sap/ushell/renderers/fiori2/search/sinaNext/sina/sinaFactory
                //
                // using /sap/ushell/renderers/fiori2/search/sinaNext/sina/sinaFactory
                // seems to work but cause the module to be loaded twice causing strange effects

                sap.ui.require(['sap/ushell/renderers/fiori2/search/sinaNext/sina/sinaFactory'], function(sinaFactory) {

                    // no enterprise search configured -> return dummy sina
                    if (!this.config.searchBusinessObjects) {
                        sinaFactory.createAsync('dummy').then(function(sina) {
                            sinaPromise.resolve(sina);
                        }, function(error) {
                            sinaPromise.reject(error);
                        });
                        return;
                    }

                    var trial = [];
                    if (window.location.href.indexOf("demo/FioriLaunchpad.html") !== -1) {
                        trial = ['sample'];
                    } else {
                        trial = [
                            //{provider: 'multi',
                            //subProviders: ['abap_odata', 'inav2', 'sample'],
                            //federationType: 'round-robin'},
                            'abap_odata', 'inav2', 'dummy'
                        ];
                    }
                    // try to create a sina by trying providers, first succesful provider wins
                    sinaFactory.createByTrialAsync(trial).then(function(sina) {
                        sinaPromise.resolve(sina);
                    }, function(error) {
                        sinaPromise.reject(error);
                    });
                }.bind(this));
                return sinaPromise;
            },

            initBusinessObjSearch: function() {

                // check cached promise
                var that = this;
                if (that._initBusinessObjSearchProm) {
                    return that._initBusinessObjSearchProm;
                }

                // set dummy datasource indicating the loading phase
                that.setProperty("/initializingObjSearch", true);
                that.setProperty("/isBusy", true);
                var dummyDataSourceForLoadingPhase = {
                    label: sap.ushell.resources.i18n.getText("genericLoading"),
                    labelPlural: sap.ushell.resources.i18n.getText("genericLoading"),
                    enabled: false,
                    id: '$$Loading$$'
                };
                that.setProperty("/dataSource", dummyDataSourceForLoadingPhase);
                that.setProperty("/dataSources", [dummyDataSourceForLoadingPhase]);

                // create sina async
                that._initBusinessObjSearchProm = this.createSina().then(function(sina) {
                    that.sinaNext = sina;
                    that.createAllAndAppDataSource();
                    that.setProperty('/defaultDataSource', that.allDataSource);
                    if (sina.provider.id === 'dummy') {
                        that.setProperty('/defaultDataSource', that.appDataSource);
                        that.setProperty('/businessObjSearchEnabled', false);
                        that.config.searchBusinessObjects = false;
                        that.setProperty('/facetVisibility', false);
                    }
                    if (sina.provider.id === 'inav2' && that.config.isLaunchpad()) {
                        // register enterprise search system
                        // this triggers a logoff request to the enteprise search backend in case of logoff from flp
                        // (this is not necessary for abap_odata because frontendserver system is registered by flp)
                        sap.ushell.Container.addRemoteSystem(
                            new sap.ushell.System({
                                alias: "ENTERPRISE_SEARCH",
                                platform: "abap",
                                baseUrl: "/ENTERPRISE_SEARCH"
                            })
                        );
                    }
                    that.setProperty('/uiFilter', that.sinaNext.createFilter());
                    that.loadDataSources();
                    that.resetDataSource(false);
                    that.resetFilterConditions(false);
                    //that.config.loadCustomModulesAsync();
                    that.query = that.sinaNext.createSearchQuery();
                    if (that.config.multiSelect) {
                        that.query.setMultiSelectFacets(true);
                    }
                    that.oFacetFormatter = new sap.ushell.renderers.fiori2.search.SearchFacetsFormatter(that);
                    that.tabStripFormatter = new SearchTabStripsFormatter.Formatter(that.allDataSource);
                    that.dataSourceTree = that.tabStripFormatter.tree;
                    that.eventLogger = EventLogger.newInstance({
                        sinaNext: that.sinaNext
                    });
                    that.eventLogger.logEvent({
                        type: that.eventLogger.SESSION_START
                    });
                    that.setProperty("/initializingObjSearch", false);
                    that.setProperty("/isBusy", false);
                }, function(error) {
                    var errorTitle = sap.ushell.resources.i18n.getText('searchError');
                    var errorText = sap.ushell.resources.i18n.getText('searchInitialError');
                    if (error.message) {
                        errorText = errorText + " " + error.message;
                    }
                    sap.m.MessageBox.error(errorText, {
                        icon: sap.m.MessageBox.Icon.NONE,
                        title: errorTitle,
                        actions: sap.m.MessageBox.Action.OK,
                        onClose: null,
                        styleClass: "",
                        initialFocus: null,
                        textDirection: sap.ui.core.TextDirection.Inherit
                    });
                });

                return that._initBusinessObjSearchProm;
            },

            initPersonalization: function() {
                var that = this;
                if (this.initPersonalizationPromise) {
                    return this.initPersonalizationPromise;
                }
                this.initPersonalizationPromise = PersonalizationStorage.getInstance().then(function(personalizationStorageInstance) {
                    var facetsVisible = false;
                    try {
                        facetsVisible = personalizationStorageInstance.getItem('search-facet-panel-button-state');
                    } catch (e) {}
                    that.setFacetVisibility(facetsVisible, false);
                }, function() {
                    return jQuery.Deferred().resolve(true);
                });
                return this.initPersonalizationPromise;
            },

            // ################################################################################
            // Get the state of things:
            // ################################################################################

            isBusinessObjSearchConfigured: function() {
                try {
                    var config = window['sap-ushell-config'].renderers.fiori2.componentData.config;
                    return config.searchBusinessObjects !== 'hidden';
                } catch (e) {
                    return true;
                }
            },

            isBusinessObjSearchEnabled: function() {
                // TODO: how does this differ from isBusinessObjSearchConfigured() above?
                return this.getProperty('/businessObjSearchEnabled');
            },

            // ################################################################################
            // Getter/Setter:
            // ################################################################################

            setProperty: function(name, values, oContext, bAsyncUpdate) {
                var that = this;
                var res = sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, arguments);
                switch (name) {
                    case '/boResults':
                    case '/appResults':
                        that.calculateResultList();
                        break;
                    case '/appCount':
                    case '/boCount':
                        res = that.setProperty('/count', that.getProperty('/appCount') + that.getProperty('/boCount'));
                        break;

                    default:
                        break;
                }
                return res;
            },

            setFuzzy: function(fuzzy) {
                this.query.setFuzzy(fuzzy);
                this.setProperty("/fuzzy", fuzzy);
            },

            getPersonalizationStorageInstance: function() {
                return PersonalizationStorage.getInstanceSync();
            },

            // TODO move to datasource
            getSearchBoxTerm: function() {
                return this.getProperty('/uiFilter/searchTerm');
            },

            setSearchBoxTerm: function(searchTerm, fireQuery) {
                var that = this;
                var searchTermTrimLeft = searchTerm.replace(/^\s+/, ""); // TODO rtl
                this.setProperty('/uiFilter/searchTerm', searchTermTrimLeft);
                this.calculateSearchButtonStatus();
                if (searchTermTrimLeft.length === 0) {
                    return; //TODO ??
                }
                if (fireQuery || fireQuery === undefined) {
                    that._firePerspectiveQuery();
                }
            },

            getLastSearchTerm: function() {
                return this.query.getSearchTerm();
            },

            setFacetVisibility: function(visibility, fireQuery) {

                if (sap.ui.Device.system.phone) {
                    visibility = false;
                }

                // set new value
                this.setProperty('/facetVisibility', visibility);

                // Set button status in sap storage
                try {
                    this.getPersonalizationStorageInstance().setItem('search-facet-panel-button-state', visibility);
                } catch (e) {}

                // fire query
                // "& visibility" removed in order to trigger search reqest when
                // (1) search term changed (but no enter)
                // (2) close facet panel
                if ((fireQuery || fireQuery === undefined) /*& visibility*/ ) {
                    this._firePerspectiveQuery({
                        preserveFormerResults: true
                    });
                }
            },

            getFacetVisibility: function() {
                return this.getProperty('/facetVisibility');
            },

            getTop: function() {
                return this.getProperty('/top');
            },

            setTop: function(top, fireQuery) {
                this.setProperty('/top', top);
                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery({
                        preserveFormerResults: true
                    });
                }
            },

            resetTop: function() {
                this.setProperty('/focusIndex', 0);
                if (this.isAppCategory()) {
                    this.setTop(this.appTopDefault, false);
                } else {
                    this.setTop(this.boTopDefault, false);
                }
            },

            getOrderBy: function() {
                return this.getProperty('/orderBy');
            },

            setOrderBy: function(orderBy, fireQuery) {
                this.setProperty('/orderBy', orderBy);
                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery({
                        preserveFormerResults: true
                    });
                }
            },

            resetOrderBy: function(fireQuery) {
                this.setProperty('/orderBy', {});
                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery({
                        preserveFormerResults: true
                    });
                }
            },

            isEqualOrderBy: function(modelOrderBy, queryOrderBy) {
                // 1) no sort order given
                if (!modelOrderBy.orderBy) {
                    return queryOrderBy.length === 0;
                }
                // 2) sort order given
                if (queryOrderBy.length !== 1) {
                    return false;
                }
                var queryOrderByElement = queryOrderBy[0];
                if (queryOrderByElement.id !== modelOrderBy.orderBy) {
                    return false;
                }
                if (modelOrderBy.sortOrder === 'ASC') {
                    return queryOrderByElement.order === this.sinaNext.SortOrder.Ascending;
                } else {
                    return queryOrderByElement.order === this.sinaNext.SortOrder.Descending;
                }
            },

            getDocumentTitle: function() {
                var searchTerm = this.getSearchBoxTerm();
                var dataSourceLabel = this.getDataSource().label;
                var title;
                if (this.getDataSource() === this.allDataSource) {
                    title = sap.ushell.resources.i18n.getText('searchTileTitleProposalAll', [searchTerm]);
                } else {
                    title = sap.ushell.resources.i18n.getText('searchTileTitleProposal', [searchTerm, dataSourceLabel]);
                }
                return title;
            },

            resetQuery: function() {
                SearchHelper.hasher.reset();
                this.resetTop();
                this.setSearchBoxTerm('');
                this.resetDataSource(false);
                this.resetFilterConditions(false);
                this.query.resetConditions();
                this.query.setSearchTerm('random-jgfhfdskjghrtekjhg');
                this.setProperty('/facets', []);
                this.setProperty('/results', []);
                this.setProperty('/appResults', []);
                this.setProperty('/boResults', []);
                this.setProperty('/origBoResults', []);
                this.setProperty('/count', 0);
                this.setProperty('/boCount', 0);
                this.setProperty('/appCount', 0);
            },

            // ################################################################################
            // Everything Datasource:
            // ################################################################################

            createAllAndAppDataSource: function() {

                // all data source
                this.allDataSource = this.sinaNext.getAllDataSource();
                this.allDataSource.label = sap.ushell.resources.i18n.getText("label_all");
                this.allDataSource.labelPlural = sap.ushell.resources.i18n.getText("label_all");

                // app datasource
                this.appDataSource = this.sinaNext._createDataSource({
                    id: '$$APPS$$',
                    label: sap.ushell.resources.i18n.getText("label_apps"),
                    labelPlural: sap.ushell.resources.i18n.getText("label_apps"),
                    type: this.sinaNext.DataSourceType.Category
                });

            },

            loadDataSources: function() {
                // get all datasources from sina
                var dataSources = this.sinaNext.getBusinessObjectDataSources();
                dataSources = dataSources.slice();
                // add app and all datasource
                if (!this.config.odataProvider && this.config.isLaunchpad()) {
                    dataSources.splice(0, 0, this.appDataSource);
                    dataSources.splice(0, 0, this.allDataSource);
                } else {
                    if (dataSources.length == 1) {
                        this.setDataSource(dataSources[0], false);
                    } else {
                        dataSources.splice(0, 0, this.allDataSource);
                    }
                }
                // set property
                this.setProperty("/dataSources", dataSources);
                this.setProperty("/searchTermPlaceholder", this.calculatePlaceholder());
                // workaround: force dropdown listbox to update
                //                var dsId = this.getProperty('/uiFilter/dataSource/multiId');
                //                this.setProperty('/uiFilter/dataSource/multiId', '');
                //                this.setProperty('/uiFilter/dataSource/multiId', dsId);
            },

            resetDataSource: function(fireQuery) {
                this.setDataSource(this.getDefaultDataSource(), fireQuery);
            },

            isAllCategory: function() {
                var ds = this.getProperty("/uiFilter/dataSource");
                return ds === this.allDataSource;
            },

            isOtherCategory: function() {
                var ds = this.getProperty("/uiFilter/dataSource");
                return ds.type === this.sinaNext.DataSourceType.Category && !this.isAllCategory();
            },

            isAppCategory: function() {
                var ds = this.getProperty("/uiFilter/dataSource");
                return ds === this.appDataSource;
            },

            getDataSource: function() {
                return this.getProperty("/uiFilter/dataSource");
            },

            getDefaultDataSource: function() {
                return this.getProperty("/defaultDataSource");
            },

            setDataSource: function(dataSource, fireQuery, resetTop) {
                if (this.sinaNext.provider.id !== dataSource.sina.provider.id) {
                    this.sinaNext = dataSource.sina;
                    var searchTerm = this.getProperty("/uiFilter/searchTerm");
                    this.setProperty("/uiFilter", this.sinaNext.createFilter({
                        dataSource: dataSource,
                        searchTerm: searchTerm
                    }));
                    this.query = this.sinaNext.createSearchQuery({
                        dataSource: dataSource,
                        searchTerm: searchTerm,
                        top: this.getTop()
                    });
                    this.oFacetFormatter = new sap.ushell.renderers.fiori2.search.SearchFacetsFormatter(this);
                }

                if (resetTop || resetTop === undefined) {
                    this.resetTop();
                }

                this.updateDataSourceList(dataSource);
                this.getProperty("/uiFilter").setDataSource(dataSource);
                this.setProperty("/searchTermPlaceholder", this.calculatePlaceholder());
                this.calculateSearchButtonStatus();

                // workaround: force dropdown listbox to update
                var dsId = this.getProperty('/uiFilter/dataSource/multiId');
                this.setProperty('/uiFilter/dataSource/multiId', '');
                this.setProperty('/uiFilter/dataSource/multiId', dsId);

                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery();
                }
                try {
                    this.eventLogger.logEvent({
                        type: this.eventLogger.DATASOURCE_CHANGE,
                        dataSourceId: dataSource.id
                    });
                } catch (e) { /* eslint no-empty:0 */ }
            },

            getServerDataSources: function() {
                var that = this;
                if (that.getDataSourcesDeffered) {
                    return that.getDataSourcesDeffered;
                }
                that.getDataSourcesDeffered = that.sina.getDataSources().then(function(dataSources) {
                    // filter out categories
                    return jQuery.grep(dataSources, function(dataSource) {
                        return dataSource.getType() !== 'Category';
                    });
                });
                return that.getDataSourcesDeffered;
            },

            // ################################################################################
            // Filter conditions:
            // ################################################################################

            notifyFilterChanged: function() {
                // notify ui about changed filter, data binding does not react on changes below
                // conditions, so this is done manually
                jQuery.each(this.aBindings, function(index, binding) {
                    if (binding.sPath === '/uiFilter/rootCondition') {
                        binding.checkUpdate(true);
                    }
                });
            },

            addFilterCondition: function(filterCondition, fireQuery) {
                if (filterCondition.attribute || filterCondition.conditions) {
                    this.getProperty("/uiFilter").autoInsertCondition(filterCondition);
                } else { //or a datasource?
                    this.setDataSource(filterCondition, false);
                }

                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery({
                        preserveFormerResults: false
                    });
                }

                this.notifyFilterChanged();
            },

            removeFilterCondition: function(filterCondition, fireQuery) {

                if (filterCondition.attribute || filterCondition.conditions) {
                    this.getProperty("/uiFilter").autoRemoveCondition(filterCondition);
                } else {
                    this.setDataSource(filterCondition, false);
                }

                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery({
                        preserveFormerResults: true
                    });
                }

                this.notifyFilterChanged();
            },

            resetFilterConditions: function(fireQuery) {
                this.getProperty("/uiFilter").resetConditions();
                if (fireQuery || fireQuery === undefined) {
                    this._firePerspectiveQuery();
                }
                this.notifyFilterChanged();
            },

            // ################################################################################
            // Suggestions:
            // ################################################################################

            doSuggestion: function() {
                this.suggestionHandler.doSuggestion(this.getProperty('/uiFilter').clone());
            },

            abortSuggestions: function() {
                this.suggestionHandler.abortSuggestions();
            },

            // ################################################################################
            // Perspective and App Search:
            // ################################################################################

            _firePerspectiveQuery: function(deserializationIn, preserveFormerResultsIn) {
                var that = this;

                this.initBusinessObjSearch().then(function() {
                    var doFirePerspectiveQueryWrapper = function() {
                        return that._doFirePerspectiveQuery(deserializationIn, preserveFormerResultsIn);
                    };
                    that.initPersonalization().then(doFirePerspectiveQueryWrapper);
                });
            },

            _doFirePerspectiveQuery: function(deserializationIn, preserveFormerResultsIn) {
                var that = this;

                var deserialization, preserveFormerResults;

                if (jQuery.isPlainObject(deserializationIn)) {
                    deserialization = deserializationIn.deserialization;
                    preserveFormerResults = deserializationIn.preserveFormerResults;
                } else {
                    deserialization = deserializationIn ? deserializationIn : undefined;
                    preserveFormerResults = preserveFormerResultsIn ? preserveFormerResultsIn : undefined;
                }

                // decide whether to fire the query
                var uiFilter = this.getProperty('/uiFilter');
                if (uiFilter.equals(this.query.filter) &&
                    this.getTop() === this.query.top &&
                    this.isEqualOrderBy(this.getOrderBy(), this.query.sortOrder) &&
                    this.getCalculateFacetsFlag() === this.query.calculateFacets &&
                    !this.getProperty('/isQueryInvalidated')) {
                    return (new jQuery.Deferred()).resolve();
                }

                // set natural language query flag (nlq)
                if (SearchHelper.getUrlParameter('nlq') === 'true') {
                    this.query.setNlq(true);
                }

                // reset orderby if search term changes or datasource
                if ((this.query.filter.dataSource && uiFilter.dataSource !== this.query.filter.dataSource) ||
                    (this.query.filter.searchTerm && uiFilter.searchTerm !== this.query.filter.searchTerm)) {
                    this.resetOrderBy(false);
                }

                // reset top if search term changes or filter condition or datasource
                if (!deserialization && !preserveFormerResults) {
                    if (!uiFilter.equals(this.query.filter)) {
                        this.resetTop();
                    }
                }

                // reset tabstrip formatter if search term changes or filter condition
                if (uiFilter.searchTerm !== this.query.filter.searchTerm ||
                    !uiFilter.rootCondition.equals(this.query.filter.rootCondition)) {
                    this.tabStripFormatter.invalidate(this.getDataSource());
                }

                // query invalidated by UI -> force to fire query by reseting result set
                if (this.getProperty('/isQueryInvalidated') === true) {
                    this.query.resetResultSet();
                    this.setProperty('/isQueryInvalidated', false);
                }

                // update query (app search also uses this.query despite search regest is not controlled by sina)
                this.query.setFilter(this.getProperty('/uiFilter').clone());
                this.query.setTop(this.getTop());
                this.query.setSortOrder(this.assembleSortOrder());
                this.query.setCalculateFacets(this.getCalculateFacetsFlag());
                this.cleanErrors();

                this.setProperty("/queryFilter", this.query.filter);

                // notify view
                sap.ui.getCore().getEventBus().publish("allSearchStarted");
                this.setProperty('/isBusy', true);

                // abort suggestions
                this.abortSuggestions();

                // calculate visibility flags for apps and combined result list
                this.calculateVisibility();

                // update url silently
                if (!deserialization) {
                    this.updateSearchURLSilently();
                }

                // log search request
                this.eventLogger.logEvent({
                    type: this.eventLogger.SEARCH_REQUEST,
                    searchTerm: this.getProperty('/uiFilter/searchTerm'),
                    dataSourceKey: this.getProperty('/uiFilter/dataSource').id
                });

                // wait for all subsearch queries
                return jQuery.when.apply(null, [this.normalSearch(preserveFormerResults), this.appSearch()])
                    .then(function() {
                        that.setProperty('/tabStrips', that.tabStripFormatter.format(that.getDataSource(), that.perspective, that));
                        return that.oFacetFormatter.getFacets(that.getDataSource(), that.perspective, that).then(function(facets) {
                            if (facets && facets.length > 0) {
                                facets[0].change = jQuery.sap.now(); //workaround to prevent earlier force update facet tree
                                that.setProperty('/facets', facets);
                            }
                        });
                    })
                    .always(function() {
                        document.title = that.getDocumentTitle();
                        sap.ui.getCore().getEventBus().publish("allSearchFinished");
                        that.setProperty('/isBusy', false);
                        that.setProperty("/firstSearchWasExecuted", true);
                    });
            },

            assembleSortOrder: function() {
                var orderBy = this.getOrderBy();
                if (!orderBy.orderBy) {
                    return [];
                }
                var order = this.sinaNext.SortOrder.Ascending;
                if (orderBy.sortOrder === 'DESC') {
                    order = this.sinaNext.SortOrder.Descending;
                }
                return [{
                    id: orderBy.orderBy,
                    order: order
                }];
            },

            getCalculateFacetsFlag: function() {
                if (this.getDataSource().type === this.sinaNext.DataSourceType.Category || this.getFacetVisibility()) {
                    // tab strip needs data from data source facet if a category is selected because
                    // then the tab strips show also siblings. If connector is selected, the tab strip
                    // only shows All and the connector.
                    return true;
                } else {
                    return false;
                }
            },

            appSearch: function() {
                var that = this;

                this.setProperty("/appResults", []);
                this.setProperty("/appCount", 0);

                if (!this.isAllCategory() && !this.isAppCategory()) {
                    // 1. do not search
                    return jQuery.when(true);
                }

                // calculate top
                var top = this.query.filter.dataSource === this.allDataSource ? this.appTopDefault : this.query.top;

                // 2. search
                return this.searchApplications(this.query.filter.searchTerm, top, 0).then(function(oResult) {
                    // 1.1 search call succeeded
                    that.setProperty("/appCount", oResult.totalResults);
                    that.setProperty("/appResults", oResult.getElements());
                }, function(error) {
                    // 1.2 search call failed
                    that.pushError({
                        type: "error",
                        title: error.name,
                        description: error,
                        keep: error.keep
                    });
                    return jQuery.when(true); // make deferred returned by "then" resolved
                });
            },

            searchApplications: function(searchTerm, top, skip) {
                return sap.ushell.Container.getService("Search").queryApplications({
                    searchTerm: searchTerm,
                    searchInKeywords: true,
                    top: top,
                    skip: skip
                });
            },

            normalSearch: function(preserveFormerResults) {
                var that = this;

                if (!preserveFormerResults) {
                    that.resetAndDisableMultiSelection();
                }

                if (!that.isBusinessObjSearchEnabled() || that.isAppCategory()) {
                    this.setProperty("/boResults", []);
                    this.setProperty("/origBoResults", []);
                    this.setProperty("/boCount", 0);
                    this.setProperty("/nlqSuccess", false);
                    this.setProperty("/nlqDescription", "");
                    return jQuery.when(true);
                }

                var jQueryDefferd = new jQuery.Deferred();

                var successHandler = function(searchResultSet) {
                    that.perspective = searchResultSet; // TODO sinaNext: rename perspective to resultSet
                    if (searchResultSet.nlqSuccess) {
                        that.setProperty("/nlqSuccess", true);
                        that.setProperty("/nlqDescription", searchResultSet.title);
                    }
                    that._afterSearchPrepareResultList(that.perspective, preserveFormerResults).then(function() {
                        jQueryDefferd.resolve();
                    });
                };

                var errorHandler = function(error) {
                    that.normalSearchErrorHandling(error);
                    that.perspective = null;
                    jQueryDefferd.resolve();
                };

                that.setFuzzy(false);
                that.setDataSource(that.getDataSource(), false, false);
                that.query.setCalculateFacets(that.getCalculateFacetsFlag());
                that.query.getResultSetAsync().then(function(searchResultSet) {
                    if (searchResultSet.totalCount < 1 && that.sinaNext.capabilities.fuzzy && that.query.filter.searchTerm !== '*') {
                        // 1) no results -> try again with fuzzy search
                        that.setProperty("/boResults", []);
                        that.setProperty('/origBoResults', []);
                        that.setProperty("/boCount", 0);
                        that.setFuzzy(true);
                        return that.query.getResultSetAsync().then(successHandler, errorHandler);
                    } else {
                        // 2) results -> success
                        return successHandler(searchResultSet);
                    }
                }, errorHandler);

                return jQueryDefferd;
            },

            _prepareTableResults: function(results) {
                var that = this;
                var tableResults = results;
                var i, j, index;
                // prepare attributes
                for (i = 0; i < tableResults.length; i++) {
                    var attributes = tableResults[i].itemattributes;
                    if (attributes.length > 0) {
                        index = 1;
                        // get first 12 attributes -> changed, show all attributes
                        // indexInTable from 1 to 12
                        for (j = 0; j < tableResults[i].itemattributes.length; j++) {
                            //if (j <= 11) {
                            tableResults[i].itemattributes[j].indexInTable = index;
                            index++;
                            //}
                        }
                        // insert title in the 0 position
                        if (!attributes[0].isTitle) {
                            // add only once
                            tableResults[i].itemattributes.unshift({
                                name: tableResults[i].dataSourceName,
                                value: tableResults[i].title,
                                key: "DATASOURCE_AS_COLUMN_KEY",
                                isTitle: true,
                                isSortable: false,
                                uri: tableResults[i].uri,
                                titleNavigation: tableResults[i].titleNavigation,
                                onlyUsedInTable: true,
                                indexInTable: 0
                            });
                        }
                        // insert navigation objects in the 13. position
                        if (tableResults[i].navigationObjects !== undefined && tableResults[i].navigationObjects.length > 0 && !attributes[attributes.length - 1].hasIntents) {
                            tableResults[i].itemattributes.splice(index, 0, {
                                name: sap.ushell.resources.i18n.getText("intents"),
                                navigationObjects: tableResults[i].navigationObjects,
                                key: "RELATED_OBJECTS",
                                isNavigationObjects: true,
                                isSortable: false,
                                onlyUsedInTable: true,
                                indexInTable: index
                            });
                        }
                    }
                }
                that.setProperty("/tableResults", tableResults);

                // prepare table columns and sort items
                var columns = [];
                var sortColumns = [];
                var firstResult = tableResults[0];
                var key = "";

                if (firstResult) {
                    var itemattributes = firstResult.itemattributes;
                    for (i = 0; i < itemattributes.length; i++) {
                        if (itemattributes[i].indexInTable !== undefined && itemattributes[i].key !== undefined) {
                            key = itemattributes[i].key;
                            // push table columns
                            columns.push({
                                "name": itemattributes[i].name,
                                "key": "columnKey" + i,
                                "originalKey": key,
                                "index": itemattributes[i].indexInTable,
                                "persoOrder": i // defaut personalized ordering, changed when updatePersoServiceAndController
                            });
                        }
                    }
                    that.setProperty("/tableColumns", columns);

                    var allAttributes = this.sinaNext.dataSourceMap[this.getDataSource().id].attributesMetadata;
                    for (var l = 0; l < allAttributes.length; l++) {
                        var attribute = allAttributes[l];
                        if (attribute.isSortable) {
                            sortColumns.push({
                                "name": attribute.label,
                                "key": "normalColumn" + l,
                                "originalKey": attribute.id,
                                "selected": that.getProperty("/orderBy").orderBy === attribute.id
                            });
                        }
                    }

                    sortColumns.unshift({
                        "name": sap.ushell.resources.i18n.getText("defaultRank"),
                        "key": "ushellSearchDefaultSortItem",
                        "originalKey": "ushellSearchDefaultSortItem",
                        "selected": jQuery.isEmptyObject(that.getProperty("/orderBy"))
                    });
                    that.setProperty("/tableSortableColumns", sortColumns);
                }
            },


            _afterSearchPrepareResultList: function(searchResultSet, preserveFormerResults) {
                var that = this;

                that.setProperty("/boCount", searchResultSet.totalCount);

                var i;
                var formerResults = [];
                if (false && preserveFormerResults) { // TODO sinaNext Holger
                    var _formerResults = that.getProperty("/boResults");
                    for (i = 0; i < _formerResults.length; i++) {
                        if (_formerResults[i].expanded || _formerResults[i].selected) {
                            formerResults.push(_formerResults[i]);
                        }
                    }
                }

                that.setProperty("/boResults", []);
                that.setProperty("/origBoResults", searchResultSet.items);
                that.setProperty("/boCount", 0);

                var formatter = new SearchResultListFormatter();
                var newResults = formatter.format(searchResultSet, that.query.filter.searchTerm);

                var newResult;
                var dataSources = [];
                var dataSourcesHints = [];

                for (i = 0; i < newResults.length; i++) {
                    newResult = newResults[i];

                    // for EventLogging.ITEM_NAVIGATE
                    newResult.positionInList = i;


                    ////////////////////////////////////////////////////////////
                    // handle Navigation URLs that come with the search response

                    // don't forget to uncomment the require statement for NavigationTarget above

                    if (!newResult.navigationTargets) {
                        newResult.navigationTargets = [];
                    }
                    if (newResult.suvlink && newResult.suvlink.value) {
                        var navigationTarget = new SearchNavigationObject({
                            text: newResult.suvlink.label,
                            href: newResult.suvlink.value,
                            target: "_blank"
                        });
                        newResult.navigationTargets.push(navigationTarget);
                    }


                    /////////////////////////////////////////////////////////////
                    // collect data sources to initiate loading of custom modules

                    dataSources.push(newResult.dataSource);
                    dataSourcesHints.push({
                        isDocumentConnector: newResult.isDocumentConnector
                    });
                }

                var loadCustomModulesProm = that.config.loadCustomModulesForDataSourcesAsync(dataSources, dataSourcesHints);

                //////////////////////////////////////////////////////////////////
                // restore expanded and selected state of former result list items
                if (false && formerResults && formerResults.length > 0) { //TODO sinaNext Holger
                    var ResultElementKeyStatus = that.sina.ResultElementKeyStatus;

                    var itemsWithErrors = [];

                    for (i = 0; i < newResults.length; i++) {
                        newResult = newResults[i];
                        if (newResult.keystatus === ResultElementKeyStatus.OK) {
                            for (var j = 0; j < formerResults.length; j++) {
                                var formerResult = formerResults[j];
                                if (formerResult.keystatus === ResultElementKeyStatus.OK && formerResult.key === newResult.key) {
                                    newResult.selected = formerResult.selected;
                                    newResult.expanded = formerResult.expanded;
                                    formerResults.splice(j, 1);
                                    break;
                                }
                            }
                        } else {
                            itemsWithErrors.push(newResult);
                        }
                    }
                    if (itemsWithErrors.length > 0) {
                        var listOfFaultyDatasources = [];
                        var listOfFaultyDatasourcesString = "";
                        for (i = 0; i < itemsWithErrors.length; i++) {
                            var dataSourceKey = itemsWithErrors[i].dataSource.key;
                            if (jQuery.inArray(dataSourceKey, listOfFaultyDatasources) < 0) {
                                listOfFaultyDatasources.push(dataSourceKey);
                                listOfFaultyDatasourcesString += dataSourceKey + "\n";
                            }
                        }
                        that.pushError({
                            type: "warning",
                            title: sap.ushell.resources.i18n.getText("preserveFormerResultErrorTitle"),
                            description: sap.ushell.resources.i18n.getText("preserveFormerResultErrorDetails", listOfFaultyDatasourcesString)
                        });
                    }
                }
                var temporaryAuxDeferred = $.Deferred();
                Promise.all([Promise.resolve(searchResultSet), loadCustomModulesProm]).then(function(params) { //TODO: error handling

                    var searchResultSet = params[0];

                    if (!that.isAllCategory() && !that.isOtherCategory() && !that.isAppCategory()) {
                        that._prepareTableResults(newResults);
                    }

                    that.setProperty("/boCount", searchResultSet.totalCount);
                    that.setProperty("/boResults", newResults);

                    that.enableOrDisableMultiSelection();

                    temporaryAuxDeferred.resolve();
                });

                return temporaryAuxDeferred.promise();
            },

            // ################################################################################
            // Helper functions:
            // ################################################################################

            // handle multi-selection availability
            // ===================================================================
            resetAndDisableMultiSelection: function() {
                this.setProperty("/multiSelectionAvailable", false);
                this.setProperty("/multiSelectionEnabled", false);
            },

            // handle multi-selection availability
            // ===================================================================
            enableOrDisableMultiSelection: function() {
                var dataSource = this.getDataSource();
                var dataSourceConfig = this.config.getDataSourceConfig(dataSource);
                /* eslint new-cap:0 */
                var selectionHandler = new dataSourceConfig.searchResultListSelectionHandlerControl();
                if (selectionHandler) {
                    this.setProperty("/multiSelectionAvailable", selectionHandler.isMultiSelectionAvailable());
                } else {
                    this.setProperty("/multiSelectionAvailable", false);
                }
            },

            _endWith: function(str, suffix) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            },

            calculatePlaceholder: function() {
                var that = this;
                if (that.isAllCategory()) {
                    return sap.ushell.resources.i18n.getText("search");
                } else {
                    return sap.ushell.resources.i18n.getText("searchInPlaceholder", that.getDataSource().labelPlural); //TODO plural?
                }
            },

            updateDataSourceList: function(newDataSource) {
                var dataSources = this.getProperty('/dataSources');
                // delete old categories, until all data source
                while (dataSources.length > 0 && dataSources[0] !== this.allDataSource) {
                    dataSources.shift();
                }
                // all and apps are surely included in existing list -> return
                if (newDataSource === this.allDataSource || newDataSource === this.appDataSource) {
                    return;
                }
                // all connectors (!=category) are included in existing list -> return
                if (newDataSource && newDataSource.id) {
                    if (newDataSource.id.indexOf('~') >= 0) {
                        return;
                    }
                }
                // check if newDataSource exists in existing list -> return
                for (var i = 0; i < dataSources.length; ++i) {
                    var dataSource = dataSources[i];
                    if (dataSource === newDataSource) {
                        return;
                    }
                }
                // add datasource
                dataSources.unshift(newDataSource);
                this.setProperty('/dataSources', dataSources);
            },

            invalidateQuery: function() { // TODO naming?
                this.setProperty('/isQueryInvalidated', true);
            },

            autoStartApp: function() {
                var that = this;
                if (that.getProperty("/appCount") && that.getProperty("/appCount") === 1 && that.getProperty("/count") && that.getProperty("/count") === 1) {
                    var aApps = that.getProperty("/appResults");
                    if (aApps && aApps.length > 0 && aApps[0] && aApps[0].url && that.getProperty('/uiFilter/searchTerm') && aApps[0].tooltip && that.getProperty('/uiFilter/searchTerm').toLowerCase().trim() === aApps[0].tooltip.toLowerCase().trim()) {
                        if (aApps[0].url[0] === '#') {
                            window.location.href = aApps[0].url;
                        } else {
                            window.open(aApps[0].url, '_blank');
                        }
                    }
                }
            },

            getResultToDisplay: function() {
                return this.getProperty('/resultToDisplay');
            },

            setResultToDisplay: function(type) {
                this.setProperty('/resultToDisplay', type);
                SearchHelper.saveResultViewType(type);
            },

            calculateVisibility: function() {
                var that = this;
                /* 3 types of resultToDisplay:
                 * "appSearchResult": app search result
                 * "searchResultList": all or Category search result
                 * "searchResultTable": connector search result
                 */
                if (that.isAppCategory()) {
                    // search in app
                    that.setResultToDisplay("appSearchResult");
                    that.setProperty('/displaySwitchVisibility', false);
                } else if (that.isAllCategory() || that.isOtherCategory()) {
                    // search in all or category
                    that.setResultToDisplay("searchResultList");
                    that.setProperty('/displaySwitchVisibility', false);
                } else {
                    // search in datasource
                    var resultToDisplay = that.getResultToDisplay();
                    if (!(resultToDisplay === "searchResultList" || resultToDisplay === "searchResultTable" || resultToDisplay === "searchResultMap")) {
                        that.setResultToDisplay("searchResultList");
                    }
                    that.setProperty('/displaySwitchVisibility', true);
                }
            },

            calculateSearchButtonStatus: function() {
                if (this.getDataSource() === this.getProperty('/defaultDataSource') &&
                    this.getSearchBoxTerm().length === 0) {
                    this.setProperty('/searchButtonStatus', 'close');
                } else {
                    this.setProperty('/searchButtonStatus', 'search');
                }
            },

            calculateResultList: function() {
                // init
                var that = this;
                var results = [];

                // add bo results
                var boResults = that.getProperty('/boResults');
                if (boResults && boResults.length) {
                    results.push.apply(results, boResults);
                }

                // add app results (tiles)
                var tiles = that.getProperty('/appResults');
                if (tiles && tiles.length > 0) {
                    var tilesItem = {
                        type: 'appcontainer',
                        tiles: tiles
                    };
                    if (results.length > 0) {
                        if (results.length > 3) {
                            results.splice(3, 0, tilesItem);
                        } else {
                            //results.splice(0, 0, tilesItem);
                            results.push(tilesItem);
                        }
                    } else {
                        results = [tilesItem];
                    }
                }

                // set property
                sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, ['/results', results]);
            },

            // ################################################################################
            // Error handling:
            // ################################################################################

            getDebugInfo: function() {
                var text = [this.sinaNext.getDebugInfo()];
                text.push('See also Enterprise Search Setup Documentation:');
                text.push('http://help.sap.com/saphelp_uiaddon10/helpdata/en/57/7d77c891954c21a19c242694e83177/frameset.htm');
                return text.join('\n');
            },

            getErrors: function() {
                return this.getProperty('/errors');
            },

            cleanErrors: function() {
                this.setProperty('/errors', jQuery.grep(this.getProperty('/errors'), function(error) {
                    return error.keep;
                }));
            },

            /**
             * push an error object to error array
             * @param {object} error object
             */
            pushError: function(error) {
                var that = this;
                error.title = error.title === "[object Object]" ? sap.ushell.resources.i18n.getText('searchError') : error.title;
                var errors = this.getProperty('/errors');
                errors.push(error);
                that.setProperty('/errors', errors);
            },

            normalSearchErrorHandling: function(error) {

                if (!error) {
                    return;
                }

                var stripUi5 = function(text) {
                    return text.replace(/<(?:.|\n)*?>|[{}]/gm, '');
                };

                // handle sina exception
                if (error instanceof this.sinaNext.core.Exception) {
                    this.pushError({
                        type: "error",
                        title: error.message,
                        description: stripUi5(error.description) + '\n' + this.getDebugInfo(),
                        keep: error.keep
                    });
                    return;
                }

                // fallback
                this.pushError({
                    type: "error",
                    title: error.toString(),
                    description: error.toString() + '\n' + this.getDebugInfo(),
                    keep: error.keep
                });

            },

            // ################################################################################
            // Functions related to the URL:
            // ################################################################################

            updateSearchURLSilently: function() {
                var sHash = this.renderSearchURL();
                SearchHelper.hasher.setHash(sHash);
            },

            renderSearchURL: function() {
                return this.searchUrlParser.render();
            },

            parseURL: function() {
                this.searchUrlParser.parse();
            }
        });

        // Helper method for injecting SearchShellHelper module from
        // SearchShellHelperAndModuleLoader
        SearchModel.injectSearchShellHelper = function(_SearchShellHelper) {
            SearchShellHelper = SearchShellHelper || _SearchShellHelper;
        };

        return SearchModel;
    });
})(window);
