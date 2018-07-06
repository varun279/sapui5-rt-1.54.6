sinaDefine(['../../core/core', '../../core/ajax',], function (core, ajax) {

    var module = {};

    module.Exception = core.Exception.derive({
        _init: function (properties) {
            core.Exception.prototype._init.apply(this, [properties]);
        }
    });

    var addErrorHandlingDecorator = function (originalFunction) {
        return function () {
            return originalFunction.apply(this, arguments).then(function (response) {
                return response; // just forward success response
            }.bind(this), function (error) {
                if (!(error instanceof ajax.Exception)) {
                    return core.Promise.reject(error); // just forward error response
                }
                return parseError(error);
            }.bind(this));
        };
    };

    var parseError = function (error) {
        try {
            return core.Promise.reject(new module.Exception({
                message: 'Error by hana odata ajax call',
                description: 'Error by hana odata ajax call',
                previous: error
            }));

        } catch (e) {
            return core.Promise.reject(error);
        }
    };

    module.createAjaxClient = function () {
        var client = new ajax.Client({
            csrf: false
            //csrfByPassCache: true
        });
        client.postJson = addErrorHandlingDecorator(client.postJson);
        client.getJson = addErrorHandlingDecorator(client.getJson);
        return client;
    };

    return module;

});
