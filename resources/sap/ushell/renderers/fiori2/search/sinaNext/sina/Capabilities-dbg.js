/* global define */
sinaDefine(['../core/core', './SinaObject'], function (core, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                fuzzy: {
                    required: false,
                    default: false
                }
            }
        }
        
    });

});
