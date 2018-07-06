/* global define */
sinaDefine(['../core/core', './ResultSet'], function (core, ResultSet) {

    return ResultSet.derive({

        toString: function () {
            result = [];
            result.push('--Facet');
            result.push(ResultSet.prototype.toString.apply(this, arguments));
            return result.join('\n');
        }

    });

});
