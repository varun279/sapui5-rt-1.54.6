sinaDefine(['../../core/core', './typeConverter'], function(core, typeConverter) {

    return core.defineClass({

        _init: function(provider) {
            this.provider = provider;
            this.sina = provider.sina;
        },

        fillMetadataBuffer: function(dataSource, attributes) {
            if (dataSource.attributesMetadata[0].id !== 'dummy') { // check if buffer already filled
                return;
            }
            dataSource.attributesMetadata = [];
            dataSource.attributeMetadataMap = {};
            for (var i = 0; i < attributes.length; ++i) {
                var attributeMetadata = attributes[i];
                this.fillPublicMetadataBuffer(dataSource, attributeMetadata);
            }
        },

        fillPublicMetadataBuffer: function(dataSource, attributeMetadata) {
            var displayOrderIndex = attributeMetadata.Displayed && attributeMetadata.DisplayOrder ? attributeMetadata.DisplayOrder : -1; // oliver

            var publicAttributeMetadata = this.sina._createAttributeMetadata({
                id: attributeMetadata.Id,
                label: attributeMetadata.Name !== "" ? attributeMetadata.Name : attributeMetadata.Id,
                isKey: attributeMetadata.Key,
                isSortable: attributeMetadata.Sortable,
                usage: attributeMetadata.UIAreas ? this.parseUsage(attributeMetadata, displayOrderIndex) : {},
                type: this.parseAttributeType(attributeMetadata),
                matchingStrategy: this.parseMatchingStrategy(attributeMetadata),
                isEmailAddress: (attributeMetadata.Semantics == "EMAIL.ADDRESS"),
                isPhoneNr: (attributeMetadata.Semantics == "TELEPHONE.TYPE"),
                isCurrency: (attributeMetadata.Semantics == "CURRENCYCODE"),
                isUnitOfMeasure: (attributeMetadata.Semantics == "UNITOFMEASURE"),
                isQuantity: (attributeMetadata.Semantics == "QUANTITY.UNITOFMEASURE")
            });

            if (attributeMetadata.Semantics == "QUANTITY.UNITOFMEASURE" || attributeMetadata.Semantics == "AMOUNT.CURRENCYCODE") {
                publicAttributeMetadata.unitOfMeasureAttribute = attributeMetadata.UnitAttribute;
            }

            publicAttributeMetadata.semanticObjectType = attributeMetadata.SemanticObjectTypeId;
            dataSource.attributesMetadata.push(publicAttributeMetadata);
            dataSource.attributeMetadataMap[publicAttributeMetadata.id] = publicAttributeMetadata;
        },

        parseIsSortable: function(attributeMetadata) {
            if (typeof attributeMetadata.IsSortable === 'undefined') {
                return false;
            }
            return attributeMetadata.IsSortable;
        },

        parseMatchingStrategy: function(attributeMetadata) {
            if (attributeMetadata.TextIndexed) {
                return this.sina.MatchingStrategy.Text;
            } else {
                return this.sina.MatchingStrategy.Exact;
            }
        },

        parseAttributeType: function(attributeMetadata) {

            for (var i = 0; i < attributeMetadata.UIAreas.results.length; i++) {
                var presentationUsage = attributeMetadata.UIAreas.results[i];
                var id = presentationUsage.Id;
                switch (id) {
                    case 'SUMMARY':
                        continue;
                    case 'DETAILS':
                        continue;
                    case 'TITLE':
                        continue;
                    case '#HIDDEN':
                        continue;
                    case 'FACTSHEET':
                        continue;
                    case 'DETAILIMAGE':
                    case 'PREVIEWIMAGE':
                        return this.sina.AttributeType.ImageUrl;
                    case 'LONGTEXT':
                        return this.sina.AttributeType.Longtext;
                    default:
                        throw new core.Exception('Unknown presentation usage ' + presentationUsage);
                }
            }

            switch (attributeMetadata.EDMType) {
                case 'Edm.String':
                case 'Edm.Binary':
                case 'Edm.Boolean':
                case 'Edm.Byte':
                case 'Edm.Guid':
                    return this.sina.AttributeType.String;

                case 'Edm.Double':
                case 'Edm.Decimal':
                case 'Edm.Float':
                    return this.sina.AttributeType.Double;

                case 'Edm.Int16':
                case 'Edm.Int32':
                case 'Edm.Int64':
                    return this.sina.AttributeType.Integer;

                case 'Edm.Time':
                    return this.sina.AttributeType.Time;

                case 'Edm.DateTime':
                    if (attributeMetadata.TypeLength > 8) {
                        return this.sina.AttributeType.Timestamp;
                    } else {
                        return this.sina.AttributeType.Date;
                    }
                case 'GeoJson':
                    return this.sina.AttributeType.GeoJson;
                default:
                    throw new core.Exception('Unknown data type ' + attributeMetadata.EDMType);
            }
        },

        parseUsage: function(attributeMetadata, displayOrderIndex) {
            var usagesInResponse = attributeMetadata.UIAreas.results;
            var advancedSearch = attributeMetadata.Facet;
            var usage = {};
            usagesInResponse.forEach(function(elem) {
                var id = elem.Id;
                if (id === "TITLE") {
                    usage.Title = {
                        displayOrder: displayOrderIndex
                    };
                }

                if (id === "SUMMARY" ||
                    id === "DETAILS" ||
                    id === "FACTSHEET" ||
                    id === "DETAILIMAGE" ||
                    id === "PREVIEWIMAGE" ||
                    id === "LONGTEXT"
                    //||id === "#HIDDEN"
                ) {
                    usage.Detail = {
                        displayOrder: displayOrderIndex
                    };
                }
            });

            if (advancedSearch) {
                usage.AdvancedSearch = { displayOrder: displayOrderIndex };
            }

            return usage;
        }

    });

});