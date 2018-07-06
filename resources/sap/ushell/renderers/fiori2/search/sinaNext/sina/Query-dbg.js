/* global define */
sinaDefine(['../core/core', '../core/util', './SinaObject'], function (core, util, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                fuzzy: {
                    required: false,
                    default: false,
                    setter: true
                },
                filter: {
                    required: false,
                    default: function () { return this.sina.createFilter(); }
                },
                top: {
                    required: false,
                    default: 10,
                    setter: true
                },
                skip: {
                    required: false,
                    default: 0,
                    setter: true
                },
                sortOrder: {
                    required: false,
                    default: function () { return []; },
                    setter: true
                },
                valueHelp: {
                    required: false,
                    default: false,
                    setter: true
                }
            }
        },

        _afterInitProperties: function (properties) {
            if (properties.dataSource) {
                this.filter.setDataSource(properties.dataSource);
            }
            if (properties.searchTerm) {
                this.filter.setSearchTerm(properties.searchTerm);
            }
            if (properties.rootCondition) {
                this.filter.setRootCondition(properties.rootCondition);
            }
            this.getResultSetAsync = util.refuseOutdatedResponsesDecorator(this.getResultSetAsync);
        },

        _initClone: function (other) {
            this.fuzzy = other.fuzzy;
            this.top = other.top;
            this.skip = other.skip;
            this.filter = other.filter.clone();
            this.sortOrder = core.clone(other.sortOrder);
            this.valueHelp = other.valueHelp;
        },

        _equals: function (other) {
            return this.fuzzy === other.fuzzy &&
                this.top === other.top &&
                this.skip === other.skip &&
                this.filter.equals(other.filter) &&
                core.equals(this.sortOrder, other.sortOrder) &&
                this.valueHelp === other.valueHelp;
        },

        abort: function () {
            this.getResultSetAsync.abort(); // call abort on decorator
        },

        getResultSetAsync: function () {

            // if query has not changed -> return existing result set
            if (this.equals(this._lastQuery, this.sina.EqualsMode.CheckFireQuery)) {
                return this._resultSetPromise;
            }

            // filter changed -> set skip=0
            if (this._lastQuery && !this.filter.equals(this._lastQuery.filter)) {
                this.setSkip(0);
            }

            // create a read only clone 
            this._lastQuery = this._createReadOnlyClone();

            // delegate to subclass implementation
            this._resultSetPromise = this._execute(this._lastQuery);
            return this._resultSetPromise;
        },

        _setResultSet: function (resultSet) {
            this._lastQuery = this._createReadOnlyClone();
            this._resultSetPromise = Promise.resolve(resultSet);
            resultSet.query = this._lastQuery;
        },

        _createReadOnlyClone: function () {
            var query = this.clone();
            query.getResultSetAsync = function () {
                throw new core.Exception('this query is readonly');
            };
            return query;
        },

        resetResultSet: function () {
            this._lastQuery = null;
            this._resultSetPromise = null;
        },

        getSearchTerm: function () {
            return this.filter.searchTerm;
        },

        getDataSource: function () {
            return this.filter.dataSource;
        },

        getRootCondition: function () {
            return this.filter.rootCondition;
        },

        setSearchTerm: function (searchTerm) {
            this.filter.setSearchTerm(searchTerm);
        },

        setDataSource: function (dataSource) {
            this.filter.setDataSource(dataSource);
        },

        setRootCondition: function (rootCondition) {
            this.filter.setRootCondition(rootCondition);
        },

        resetConditions: function () {
            this.filter.resetConditions();
        },

        autoInsertCondition: function (condition) {
            this.filter.autoInsertCondition(condition);
        },

        autoRemoveCondition: function (condition) {
            this.filter.autoRemoveCondition(condition);
        },

        setFilter: function (filter) {
            if (!this.filter.equals(filter)) {
                this.setSkip(0);
            }
            this.filter = filter;
        }

    });

});
