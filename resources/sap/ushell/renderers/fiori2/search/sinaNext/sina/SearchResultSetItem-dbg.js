/* global define */
sinaDefine(['../core/core', './ResultSetItem'], function (core, ResultSetItem) {

    return ResultSetItem.derive({

        _meta: {
            properties: {
                dataSource: {
                    required: true
                },
                title: {
                    required: true
                },
                titleHighlighted: {
                    required: true
                },
                titleAttributes: {
                    required: true
                },
                detailAttributes: {
                    required: true
                },
                defaultNavigationTarget: {
                    required: false
                },
                navigationTargets: {
                    required: false
                }
            }
        },

        toString: function () {
            var result = [];
            result.push('--'+this.title);
            for (var i = 0; i < this.attributeAreaAttributes.length; ++i) {
                var attributeAreaAttribute = this.attributeAreaAttributes[i];
                result.push(attributeAreaAttribute.toString());
            }
            return result.join('\n');
        }

    });

});
