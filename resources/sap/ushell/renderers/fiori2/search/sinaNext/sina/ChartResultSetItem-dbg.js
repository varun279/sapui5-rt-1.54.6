/* global define */
sinaDefine(['../core/core', './FacetResultSetItem'], function (core, FacetResultSetItem) {

    return FacetResultSetItem.derive({
        _meta: {
            properties: {
                filterCondition: { required: true }
            }
        }
    });

});