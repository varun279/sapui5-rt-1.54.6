/* global define */
sinaDefine(['../core/core', './ResultSet'], function (core, ResultSet) {

    return ResultSet.derive({

        _meta: {
            properties: {
                facets: {
                    required: false,
                    default: function () { return []; }
                },
                totalCount: {
                    required: true
                },
                nlqSuccess: {
                    required: false,
                    default: false
                }
            }
        },

        toString: function () {
            var result = [];
            result.push(ResultSet.prototype.toString.apply(this, arguments));
            for (var i = 0; i < this.facets.length; ++i) {
                var facet = this.facets[i];
                result.push(facet.toString());
            }
            return result.join('\n');
        }

    });

});