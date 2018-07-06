/* global define */

sinaDefine(['../../core/core'], function (core) {

    return core.defineClass({
        id: 'dummy',
        _initAsync: function (properties) {
            return Promise.resolve();
        }
    });

});
