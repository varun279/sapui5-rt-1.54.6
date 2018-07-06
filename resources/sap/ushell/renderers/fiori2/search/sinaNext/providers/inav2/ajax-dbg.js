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
            errorObject = JSON.parse(error.responseText);

            // parse main error code
            var message = errorObject.Error.Code + ': ' + errorObject.Error.Message;

            // parse error details
            var description = []
            if (errorObject.ErrorDetails) {
                for (var i = 0; i < errorObject.ErrorDetails.length; ++i) {
                    var errorDetail = errorObject.ErrorDetails[i];
                    description.push(errorDetail.Code + ': ' + errorDetail.Message);
                }
            }

            // parse additional messages
            if (errorObject.Messages) {
                for (var j = 0; j < errorObject.Messages.length; ++j) {
                    var errorMessage = errorObject.Messages[j];
                    description.push(errorMessage.Number + ': ' + errorMessage.Text + ' (' + errorMessage.Type + ')');
                }
            }

            // create new error
            description = description.join('\n');
            return core.Promise.reject(new module.Exception({
                message: message,
                description: description,
                previous: error
            }));

        } catch (e) {
            return core.Promise.reject(error);
        }
    };

    module.createAjaxClient = function () {
        var client = new ajax.Client({
            csrf: true,
            csrfByPassCache: true
        });
        client.postJson = addErrorHandlingDecorator(client.postJson);
        client.getJson = addErrorHandlingDecorator(client.getJson);
        return client;
    };

    return module;

});