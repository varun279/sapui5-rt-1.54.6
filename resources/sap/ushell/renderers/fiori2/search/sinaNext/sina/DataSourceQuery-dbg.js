/* global define */
sinaDefine(['../core/core', './FacetQuery'], function (core, FacetQuery) {

    return FacetQuery.derive({

        _meta: {
            properties: {
                dataSource: { required: true }
            }
        }

    });

});
