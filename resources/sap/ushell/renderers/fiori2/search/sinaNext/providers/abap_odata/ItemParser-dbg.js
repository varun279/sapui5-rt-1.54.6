sinaDefine(['../../core/core', '../../core/util', './typeConverter', '../../sina/fiori/FioriIntentsResolver', '../../sina/NavigationTarget'], function(core, util, typeConverter, IntentsResolver, NavigationTarget) {


    return core.defineClass({

        _init: function(provider) {
            this.provider = provider;
            this.sina = provider.sina;
            this.intentsResolver = this.sina._createFioriIntentsResolver();
        },

        parse: function(searchQuery, data) {
            if (data.ResultList.SearchResults === null) {
                return Promise.resolve([]);
            }
            var itemsData = data.ResultList.SearchResults.results;
            var itemProms = [];
            for (var i = 0; i < itemsData.length; ++i) {
                var itemData = itemsData[i];
                var itemProm = this.parseItem(itemData);
                itemProms.push(itemProm);
            }
            return Promise.all(itemProms);
        },
        parseItem: function(itemData) {
            var titleAttributes = [];
            var detailAttributes = [];
            var unitOfMeasureAttributes = {}; // includes currency attributes
            var whyFoundAttributes = [];
            var semanticObjectTypeAttributes = [];
            var j;
            var semanticObjectType;

            var dataSource = this.sina.getDataSource(itemData.DataSourceId);

            // parse unit of measure and currency attributes
            for (j = 0; j < itemData.Attributes.results.length; ++j) {
                var attributeData = itemData.Attributes.results[j];
                var metadata = dataSource.getAttributeMetadata(attributeData.Id);

                if (metadata.isUnitOfMeasure || metadata.isCurrency) {
                    var attribute = this.sina._createSearchResultSetItemAttribute({
                        id: attributeData.Id,
                        label: metadata.label,
                        value: typeConverter.odata2Sina(metadata.type, attributeData.Value),
                        valueFormatted: attributeData.ValueFormatted || attributeData.Value,
                        valueHighlighted: attributeData.Snippet || attributeData.ValueFormatted || attributeData.Value,
                        isHighlighted: attributeData.Snippet.indexOf("<b>") > -1 && attributeData.Snippet.indexOf("</b>") > -1,
                        metadata: metadata
                    });

                    unitOfMeasureAttributes[attributeData.Id] = attribute;
                }
            }

            // parse attributes
            for (j = 0; j < itemData.Attributes.results.length; ++j) {

                var attributeData = itemData.Attributes.results[j];
                var metadata = dataSource.getAttributeMetadata(attributeData.Id);

                if (metadata.isUnitOfMeasure || metadata.isCurrency) {
                    continue;
                }

                var attribute = this.sina._createSearchResultSetItemAttribute({
                    id: attributeData.Id,
                    label: metadata.label,
                    value: typeConverter.odata2Sina(metadata.type, attributeData.Value),
                    valueFormatted: attributeData.ValueFormatted || attributeData.Value,
                    valueHighlighted: attributeData.Snippet || attributeData.ValueFormatted || attributeData.Value,
                    isHighlighted: attributeData.Snippet.indexOf("<b>") > -1 && attributeData.Snippet.indexOf("</b>") > -1,
                    metadata: metadata
                });

                if (metadata.unitOfMeasureAttribute) {
                    var unitOfMeasureAttribute = unitOfMeasureAttributes[metadata.unitOfMeasureAttribute];
                    if (unitOfMeasureAttribute) {
                        attribute.unitOfMeasure = unitOfMeasureAttribute;
                    }
                }

                attribute = util.addPotentialNavTargetsToAttribute(this.sina, attribute); //find emails phone nrs etc and augment attribute if required

                if (metadata.usage.Title) {
                    titleAttributes.push(attribute);
                }
                if (metadata.usage.Detail) {
                    detailAttributes.push(attribute);
                }
                if (!metadata.usage.Title && !metadata.usage.Detail && attribute.isHighlighted) {
                    whyFoundAttributes.push(attribute);
                }

                semanticObjectType = dataSource.attributeMetadataMap[attribute.id].semanticObjectType;

                if (semanticObjectType.length > 0) {
                    semanticObjectTypeAttributes.push({
                        name: semanticObjectType,
                        value: attribute.value,
                        type: attribute.metadata.type
                    });
                }
            }


            titleAttributes.sort(function(a1, a2) {
                return a1.metadata.usage.Title.displayOrder - a2.metadata.usage.Title.displayOrder;
            });

            detailAttributes.sort(function(a1, a2) {
                return a1.metadata.usage.Detail.displayOrder - a2.metadata.usage.Detail.displayOrder;
            });


            // parse HitAttributes
            if (itemData.HitAttributes !== null) {
                for (var i = 0; i < itemData.HitAttributes.results.length; ++i) {

                    var attributeData = itemData.HitAttributes.results[i];
                    var metadata = dataSource.getAttributeMetadata(attributeData.Id);
                    var attribute = this.sina._createSearchResultSetItemAttribute({
                        id: attributeData.Id,
                        label: metadata.label,
                        //TODO: abap_odata2Sina
                        value: typeConverter.odata2Sina(metadata.type, util.filterString(attributeData.Snippet, ['<b>', '</b>'])),
                        valueFormatted: attributeData.Snippet,
                        valueHighlighted: attributeData.Snippet,
                        isHighlighted: attributeData.Snippet.indexOf("<b>") > -1 && attributeData.Snippet.indexOf("</b>") > -1,
                        metadata: metadata
                    });

                    whyFoundAttributes.push(attribute);
                }
            }

            // concatinate whyFound attributes to detail attributes
            detailAttributes = detailAttributes.concat(whyFoundAttributes);

            var title = [];
            var titleHighlighted = [];
            for (var i = 0; i < titleAttributes.length; ++i) {
                var titleAttribute = titleAttributes[i];
                title.push(titleAttribute.valueFormatted);
                titleHighlighted.push(titleAttribute.valueHighlighted);
            }
            title = title.join(' ');
            titleHighlighted = titleHighlighted.join(' ');

            semanticObjectType = dataSource.sematicObjectType;
            var systemId = dataSource.system;
            var client = dataSource.client;
            var fallbackDefaultNavigationTarget;
            //fallbackDefaultNavigationTarget = this.sina._createNavigationTarget({
            //    label: "",
            //    targetUrl: ""
            //});

            return this.intentsResolver.resolveIntents({
                semanticObjectType: semanticObjectType,
                semanticObjectTypeAttributes: semanticObjectTypeAttributes,
                systemId: systemId,
                client: client,
                fallbackDefaultNavigationTarget: fallbackDefaultNavigationTarget
            }).then(function(intents) {
                var defaultNavigationTarget = intents && intents.defaultNavigationTarget;
                var navigationTargets = intents && intents.navigationTargets;
                return this.sina._createSearchResultSetItem({
                    dataSource: dataSource,
                    title: title,
                    titleHighlighted: titleHighlighted,
                    titleAttributes: titleAttributes,
                    detailAttributes: detailAttributes,
                    defaultNavigationTarget: defaultNavigationTarget,
                    navigationTargets: navigationTargets
                });
            }.bind(this));
        }

    });

});
