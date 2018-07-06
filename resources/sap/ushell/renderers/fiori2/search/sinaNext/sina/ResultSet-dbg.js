/* global define */
sinaDefine(['../core/core', './SinaObject'], function (core, SinaObject) {

    return SinaObject.derive({

        _meta: {
            properties: {
                title: {
                    required: true
                },
                items: {
                    required: false,
                    default: function () { return []; }
                },
                query: {
                    required: true
                }
            }
        },

        toString: function () {
            var result = [];
            for (var i = 0; i < this.items.length; ++i) {
                var item = this.items[i];
                result.push(item.toString());
            }
            return result.join('\n');
        }

    });

});