sinaDefine(['./core'], function(core) {

    var module = {};

    module.refuseOutdatedResponsesDecorator = function(originalFunction) {
        var maxRequestId = 0;
        var decoratedFunction = function() {
            var requestId = ++maxRequestId;
            return originalFunction.apply(this, arguments).then(function(response) {
                // success
                return new core.Promise(function(resolve, reject) {
                    if (requestId !== maxRequestId) {
                        return; // --> ignore
                    }
                    resolve(response); // --> forward
                });
            }, function(error) {
                // error
                return new core.Promise(function(resolve, reject) {
                    if (requestId !== maxRequestId) {
                        return; // --> ignore
                    }
                    reject(error); // --> forward
                });
            });
        };
        decoratedFunction.abort = function() {
            ++maxRequestId;
        };
        return decoratedFunction;
    };

    module.getUrlParameter = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    module.filterString = function(text, removeStrings) {
        for (var i = 0; i < removeStrings.length; ++i) {
            var removeString = removeStrings[i];
            while (true) {
                var index = text.indexOf(removeString);
                if (index < 0) {
                    break;
                }
                text = text.slice(0, index) + text.slice(index + removeString.length);
            }
        }
        return text;
    };

    module.generateTimestamp = function() {
        var pad = function pad(num, size) {
            var s = "000000000" + num;
            return s.substr(s.length - size);
        };
        var d = new Date();
        return '' +
            d.getUTCFullYear() +
            pad(d.getUTCMonth() + 1, 2) +
            pad(d.getUTCDate(), 2) +
            pad(d.getUTCHours(), 2) +
            pad(d.getUTCMinutes(), 2) +
            pad(d.getUTCSeconds(), 2) +
            pad(d.getUTCMilliseconds(), 3);
    };

    module.DelayedConsumer = core.defineClass({
        _init: function(properties) {
            properties = properties || {};
            this.timeDelay = properties.timeDelay || 1000;
            this.consumer = properties.consumer || function() {};
            this.consumerContext = properties.consumerContext || null;
            this.objects = [];
        },
        add: function(obj) {
            this.objects.push(obj);
            if (this.objects.length === 1) {
                setTimeout(this.consume.bind(this), this.timeDelay);
            }
        },
        consume: function() {
            this.consumer.apply(this.consumerContext, [this.objects]);
            this.objects = [];
        }
    });

    module.dateToJson = function(date) {
        return {
            type: 'Timestamp',
            value: date.toJSON()
        };
    };

    module.dateFromJson = function(jsonDate) {
        if (jsonDate.type !== 'Timestamp') {
            throw new core.Exception('Not a timestampe ' + jsonDate);
        }
        return new Date(jsonDate.value);
    };

    module.getBaseUrl = function(url) {
        url = url || '/sap/ushell/renderers/fiori2/search/container/';
        var baseUrl = '';
        var indexOfStandalonePath = window.location.pathname.indexOf(url);
        if (indexOfStandalonePath > -1) {
            baseUrl = window.location.pathname.slice(0, indexOfStandalonePath);
        }
        return baseUrl;
    };

    module.addPotentialNavTargetsToAttribute = function(sina, attribute) {
        var value = attribute.value;
        var metadata = attribute.metadata;
        if (typeof value === 'string') {
            var emails = value.match(/[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)/g);
            var fonenrs = value.match(/\+[\d| ]+/g);
            if (metadata.isEmailAddress) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                    label: value,
                    targetUrl: 'mailto:' + value
                });
            } else if (metadata.isPhoneNr) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                    label: value,
                    targetUrl: 'tel:' + value
                });
            } else if (emails !== null && emails.length === 1) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                    label: emails[0],
                    targetUrl: 'mailto:' + emails[0]
                });
            } else if (fonenrs !== null && fonenrs[0].match(/\d\d\d/) !== null) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                    label: fonenrs[0],
                    targetUrl: 'tel:' + fonenrs[0]
                });
            }
        }
        return attribute;
    };

    return module;

});