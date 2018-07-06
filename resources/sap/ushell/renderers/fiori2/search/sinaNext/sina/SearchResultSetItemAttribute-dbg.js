/* global define */
sinaDefine(['../core/core', './SinaObject'], function (core, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                id: { required: true },
                label: { required: true },
                value: { required: true },
                valueFormatted: { required: true },
                valueHighlighted: { required: true },
                isHighlighted: { required: true },
                unitOfMeasure: { required: false },
                describedby: { required: false },
                defaultNavigationTarget: {
                    required: false
                },
                navigationTargets: {
                    required: false
                },
                metadata: { required: true }
            }
        },

        toString: function () {
            return this.label + ':' + this.valueFormatted;
        }

    });

});
