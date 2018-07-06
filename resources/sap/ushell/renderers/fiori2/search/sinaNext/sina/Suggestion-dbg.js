/* global define */
sinaDefine(['../core/core', './ResultSetItem'], function (core, ResultSetItem) {

    return ResultSetItem.derive({

        _meta: {
            properties: {
                calculationMode:{
                    required:true
                },
                label:{
                    required:true
                }
            }
        }
    
    });

});
