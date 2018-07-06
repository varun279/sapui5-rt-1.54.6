/* global define */
sinaDefine(['../core/core', './SinaObject'], function(core, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                type: {
                    required: true
                },
                id: {
                    required: true
                },
                label: {
                    required: true
                },
                usage: {
                    required: true
                },
                isSortable: {
                    required: true
                },
                isKey: {
                    required: true
                },
                hasDescription: {
                    required: false
                },
                isQuantity: {
                    required: false
                },
                isUnitOfMeasure: {
                    required: false
                },
                isPhoneNr: {
                    required: false
                },
                isEmailAddress: {
                    required: false
                },
                isCurrency: {
                    required: false
                },
                matchingStrategy: {
                    required: true
                },
                displayOrder: {
                    required: false
                }
            }
        }

    });

});