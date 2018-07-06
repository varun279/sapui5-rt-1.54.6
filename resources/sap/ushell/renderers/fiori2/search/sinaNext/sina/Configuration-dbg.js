/* global define */
sinaDefine(['../core/core', './SinaObject'], function (core, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                personalizedSearch: {
                    required: true,
                    setter: true
                },
                isPersonalizedSearchEditable: {
                    required: true
                }
            }
        },

        resetPersonalizedSearchDataAsync: function () {
            return this.sina.provider.resetPersonalizedSearchDataAsync(this);
        },

        saveAsync: function () {
            return this.sina.provider.saveConfigurationAsync(this);
        }

    });

});