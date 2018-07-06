/* global define */
sinaDefine(['../core/core', './SinaObject'], function (core, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                type: {
                    required: true
                },
                id: {
                    required: true
                },
                label: {
                    required: true
                },
                multiId: {
                    required: false
                },
                labelPlural: {
                    required: false
                },
                hidden: {
                    required: false,
                    default: false
                },
                attributesMetadata: {
                    required: false,
                    default: function () { return []; }
                },
                attributeMetadataMap: {
                    required: false,
                    default: function () { return {}; }
                }
            }
        },

        equals: function () {
            throw new core.Exception('use === operator for comparison of datasources');
        },

        _afterInitProperties: function () {
            if (!this.multiId || this.multiId.length === 0) {
                this.multiId = this.sina.provider.id + "_" + this.id;
            }
            if (!this.labelPlural || this.labelPlural.length === 0) {
                this.labelPlural = this.label;
            }
            if (this.type === this.sina.DataSourceType.BusinessObject && this.attributesMetadata.length === 0) {
                throw 'attributes of datasource are missing';
            }
            this.attributeMetadataMap = this.createAttributeMetadataMap(this.attributesMetadata);
        },

        createAttributeMetadataMap: function (attributesMetadata) {
            var map = {};
            for (var i = 0; i < attributesMetadata.length; ++i) {
                var attributeMetadata = attributesMetadata[i];
                map[attributeMetadata.id] = attributeMetadata;
            }
            return map;
        },

        getAttributeMetadata: function (id) {
            return this.attributeMetadataMap[id];
        },

        toJson: function () {
            return {
                type: this.type,
                id: this.sina.provider.parentSina ? this.multiId : this.id,
//                providerId: this.sina.provider.id,
                label: this.label,
                labelPlural: this.labelPlural
            };
        }

    });

});
