/* global define */
sinaDefine(['../core/core', './ResultSetItem'], function (core, ResultSetItem) {

    return ResultSetItem.derive({

        _meta: {
            properties: {                
                dimensionValueFormatted: { required: true },
                measureValue: { required: true },
                measureValueFormatted: { required: true }
            }
        },

        toString: function () {
            return this.dimensionValueFormatted + ':' + this.measureValueFormatted;
        }

    });

});