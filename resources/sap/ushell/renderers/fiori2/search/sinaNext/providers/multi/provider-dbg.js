/* global define */

sinaDefine(['../../core/core', '../../sina/sinaFactory'], function(core, sinaFactory) {

    "use strict";

    return core.defineClass({
        id: 'multi',
        _initAsync: function(properties) {

            this.sina = properties.sina;
            this.parentSina = properties.sina;
            this.multiSina = [properties.sina];
            this.sina.dataSourceMap[this.sina.allDataSource.multiId] = this.sina.allDataSource;
            var doCreate = function(index) {
                if (index >= properties.subProviders.length) {
                    if (this.multiSina.length < 1) {
                        return core.Promise.reject(new core.Exception('sina creation by trial failed'));
                    } else {
                        return;
                    }
                }
                var configuration = properties.subProviders[index];
                return sinaFactory.createAsync(configuration).then(function(sina) {
                    sina.allDataSource.multiId = sina.provider.id + '_' + sina.allDataSource.id;
                    sina.allDataSource.label = sina.allDataSource.label + ' (' + sina.provider.id + ')';
                    sina.allDataSource.labelPlural = sina.allDataSource.labelPlural + ' (' + sina.provider.id + ')';
                    sina.provider.parentSina = this.sina;
                    this.sina.dataSources = this.sina.dataSources.concat(sina.dataSources);
                    for (var i = 0; i < sina.dataSources.length; i++) {
                        this.sina.dataSourceMap[sina.dataSources[i].multiId] = sina.dataSources[i];
                    }
                    this.multiSina.push(sina);
                    return doCreate(index + 1);
                }.bind(this), function() {
                    return doCreate(index + 1);
                }.bind(this));
            }.bind(this);
            return doCreate(0);

        },

        executeSearchQuery: function (query) {

            var that = this;
            var mergeIndex = 1;
            that.searchResultSet = this.sina._createSearchResultSet({
                title: 'Search Multi Result List',
                query: query,
                items: [],
                totalCount: 0,
                facets: [this.sina._createDataSourceResultSet({
                            title: query.filter.dataSource.label,
                            items: [],
                            query: query
                        })]
            });

            var doCall = function(index) {
                if (index >= that.multiSina.length) {
                    that.searchResultSet.items = that.searchResultSet.items.slice(0, query.top);
                    return that.searchResultSet;
                }
                if (that.multiSina[index].provider.id === "multi") {
                    return doCall(index + 1);
                }
                var childQuery = that.multiSina[index].createSearchQuery({
                    dataSource: that.multiSina[index].allDataSource,
                    searchTerm: query.searchTerm,
                    top: query.top
                });
                return childQuery.getResultSetAsync().then(function(searchResultSet) {
                    that.searchResultSet.items = that.mergeMultiResults(that.searchResultSet.items, searchResultSet.items, mergeIndex);
                    that.searchResultSet.totalCount += searchResultSet.totalCount;
                    that.searchResultSet.facets[0].items.push(that.sina._createDataSourceResultSetItem({
                        dataSource: searchResultSet.query.filter.dataSource,
                        dimensionValueFormatted: searchResultSet.query.filter.dataSource.label,
                        measureValue: searchResultSet.totalCount,
                        measureValueFormatted: searchResultSet.totalCount
                    }));
                    mergeIndex++;
                    return doCall(index + 1);
                });
            };

            return doCall(0);
        },

        mergeMultiResults: function(firstResults, secondResults, mergeIndex) {
            if (mergeIndex < 1) {
                return [];
            }
            if (mergeIndex === 1) {
                return secondResults;
            }
            var firstLength = firstResults.length;
            var secondLength = secondResults.length;
            for (var i = 0; i < firstLength; i++) {
                if (i >= secondLength) {
                    break;
                }
                firstResults.splice(mergeIndex * (i + 1) - 1, 0, secondResults[i]);
            }
            if (secondLength > firstLength) {
                firstResults = firstResults.concat(secondResults.slice(firstLength - secondLength));
            }
            return firstResults;
        },
        
        buildMultiDataSourceMap: function() {
            this.multiDataSourceMap = {};
            for (var i = 0; i < this.multiSina.length; i++) {
                var dataSources = this.multiSina[i].dataSources;
                for (var j = 0; j < dataSources.length; j++) {
                    var dataSource = dataSources[j];
                    this.multiDataSourceMap[dataSource.multiId] = dataSource;
                }
            }
        }
    });

});
