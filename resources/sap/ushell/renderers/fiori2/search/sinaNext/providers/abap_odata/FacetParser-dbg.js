sinaDefine(['../../core/core', '../../sina/SearchQuery', './typeConverter'], function (core, SearchQuery, typeConverter) {

    return core.defineClass({

        _init: function (provider) {
            this.provider = provider;
            this.sina = provider.sina;
        },

        parse: function (query, data) {
            if (data.ValueHelp) {
                this.prepareValueHelpFacet(query, data);
            }

            var facets = [];
            if (!data.Facets || !data.Facets.results) {
                return facets;
            }
            for (var i = 0; i < data.Facets.results.length; i++) {
                var facetData = data.Facets.results[i];
                var dimension = facetData.Type;
                if (dimension === 'DataSource') {
                    facets.push(this.parseDataSourceFacet(query, facetData));
                } else {
                    if (query.filter.dataSource.type === query.sina.DataSourceType.Category) {
                        continue; // ignore common attributes facets
                    }
                    facets.push(this.parseChartFacet(query, facetData));
                }
            }
            return facets;
        },

        prepareValueHelpFacet: function (query, data) {
            var sourceFacetItems = data.ValueHelp.results;
            var dataSource = this.sina.getDataSource(query.filter.dataSource.id);
            var attributeId = data.ValueHelpAttribute;
            var metadata = dataSource.getAttributeMetadata(attributeId);
            var targetFacet = {
                Id: data.ValueHelpAttribute,
                Name: metadata.label,
                Type: "AttributeValue",
                Values: {
                    results: []
                }
            };
            var results = [];
            for (var i = 0; i < sourceFacetItems.length; i++) {
                var item = sourceFacetItems[i];
                results.push({
                    Description: item.ValueFormatted,
                    NumberOfObjects: item.NumberOfInstances,
                    Type: "AttributeValue",
                    ValueLow: item.Value,
                    ValueLowFormatted: item.ValueFormatted,
                    ValueHigh: "",
                    ValueHighFormatted: ""
                })
            }
            targetFacet.Values.results = results;

            data.Facets = {};
            data.Facets.results = [];
            data.Facets.results[0] = targetFacet;
        },

        parseDataSourceFacet: function (query, facetData) {
            // for search query with datasource facet: create corresponding datasource query 
            var dataSourceQuery = query;
            if (query instanceof SearchQuery) {
                dataSourceQuery = this.sina.createDataSourceQuery({
                    dataSource: query.filter.dataSource,
                    filter: query.filter.clone()
                });
            }

            // assemble results set items
            var items = [];
            for (var i = 0; i < facetData.Values.results.length; i++) {
                var cell = facetData.Values.results[i];

                // create filter (used when clicking on the item)
                var dataSource = this.sina.getDataSource(cell.ValueLow);
                if (!dataSource) {
                    dataSource = this.sina._createDataSource({
                        type: this.sina.DataSourceType.Category,
                        id: cell.ValueLow,
                        label: cell.Description
                    });
                }

                // create item
                items.push(this.sina._createDataSourceResultSetItem({
                    dataSource: dataSource,
                    dimensionValueFormatted: dataSource.labelPlural,
                    measureValue: cell.NumberOfObjects,
                    measureValueFormatted: (cell.NumberOfObjects).toString()
                }));
            }

            // create result set
            var resultSet = this.sina._createDataSourceResultSet({
                title: query.filter.dataSource.label,
                items: items,
                query: dataSourceQuery
            });

            // init query with result set
            if (query instanceof SearchQuery) {
                dataSourceQuery._setResultSet(resultSet);
            }

            return resultSet;
        },

        createAttributeFilterCondition: function (attributeId, metadata, cell) {
            if(cell.Type === "AttributeRange"){
                // Between Condition
                return this.sina.createComplexCondition({
                    attributeLabel: metadata.label,
                    valueLabel: cell.Description,
                    operator: this.sina.LogicalOperator.And,
                    conditions: [
                            this.sina.createSimpleCondition({
                            attribute: attributeId,
                            operator: this.sina.ComparisonOperator.Ge,
                            value: typeConverter.odata2Sina(metadata.type, cell.ValueLow),
                        }),
                            this.sina.createSimpleCondition({
                            attribute: attributeId,
                            operator: this.sina.ComparisonOperator.Le,
                            value: typeConverter.odata2Sina(metadata.type, cell.ValueHigh),
                        })
                        ]
                });
                
            }else{
                // Single Condition
                return this.sina.createSimpleCondition({
                    attributeLabel: metadata.label,
                    attribute: attributeId,
                    value: typeConverter.odata2Sina(metadata.type, cell.ValueLow),
                    valueLabel: cell.Description
                });
            }
            
//            if (cell.ValueHigh === "") {
//                // Single Condition
//                return this.sina.createSimpleCondition({
//                    attributeLabel: metadata.label,
//                    attribute: attributeId,
//                    value: typeConverter.odata2Sina(metadata.type, cell.ValueLow),
//                    valueLabel: cell.Description
//                });
//            } else {
//                // Between Condition
//                return this.sina.createComplexCondition({
//                    attributeLabel: metadata.label,
//                    valueLabel: cell.Description,
//                    operator: this.sina.LogicalOperator.And,
//                    conditions: [
//                            this.sina.createSimpleCondition({
//                            attribute: attributeId,
//                            operator: this.sina.ComparisonOperator.Ge,
//                            value: typeConverter.odata2Sina(metadata.type, cell.ValueLow),
//                        }),
//                            this.sina.createSimpleCondition({
//                            attribute: attributeId,
//                            operator: this.sina.ComparisonOperator.Le,
//                            value: typeConverter.odata2Sina(metadata.type, cell.ValueHigh),
//                        })
//                        ]
//                });
//            }
        },

        parseChartFacet: function (query, facetData) {
            var dataSource = this.sina.getDataSource(query.filter.dataSource.id);
            var attributeId = facetData.Id;
            var metadata = dataSource.getAttributeMetadata(attributeId);

            // for search query with attribute facet: create corresponding chart query 
            var filter, chartQuery = query;
            if (query instanceof SearchQuery) {
                filter = query.filter.clone();
                filter.setDataSource(dataSource); // relevant only for common attribute facets
                filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
                chartQuery = this.sina.createChartQuery({
                    filter: filter,
                    dimension: facetData.Id,
                });
            }

            // create result set items
            var items = [];
            for (var i = 0; i < facetData.Values.results.length; i++) {
                var cell = facetData.Values.results[i];
                items.push(this.sina._createChartResultSetItem({
                    filterCondition: this.createAttributeFilterCondition(attributeId, metadata, cell),
                    dimensionValueFormatted: cell.Description,
                    measureValue: cell.NumberOfObjects,
                    measureValueFormatted: cell.ValueLowFormatted,
                }));
            }

            // create result set
            var resultSet = this.sina._createChartResultSet({
                title: metadata.label,
                items: items,
                query: chartQuery
            });

            // init query with result set
            if (query instanceof SearchQuery) {
                chartQuery._setResultSet(resultSet);
            }

            return resultSet;
        }
    });

});