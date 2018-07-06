/* global define */
sinaDefine(['../core/core', './FacetResultSet','./FacetType'], function (core, FacetResultSet, FacetType) {

    return FacetResultSet.derive({
        
        type: FacetType.DataSource

    });

});
