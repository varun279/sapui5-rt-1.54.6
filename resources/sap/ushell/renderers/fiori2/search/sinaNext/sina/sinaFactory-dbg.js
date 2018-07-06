// start sina init
window.sinaRequire = window.sinaRequire || (window.sap && window.sap.ui && window.sap.ui.require) || window.require;
window.sinaDefine = window.sinaDefine || (window.sap && window.sap.ui && window.sap.ui.define) || window.define;
// end sina init

var modules = ['../core/core', '../core/util', './Sina'];
var isSapRequire = window.sap && window.sap.ui && window.sap.ui.require && window.sap.ui.require === window.sinaRequire;
if (!isSapRequire) {
    modules.push('module'); // for standard require: load module with module meta information
}

sinaDefine(modules, function(core, util, Sina, module) {

    return {

        createAsync: function(configuration) {
            configuration = this.normalizeConfiguration(configuration);
            return new core.Promise(function(resolve, reject) {
                sinaRequire([configuration.provider], function(providerClass) {
                    var providerInstance = new providerClass();
                    var sina = new Sina(providerInstance);
                    return sina._initAsync.apply(sina, [configuration]).then(function() {
                        resolve(sina);
                    }, function(error) {
                        reject(error);
                    });
                }, function(err) {
                    console.log('require error', err);
                });
            });
        },

        normalizeConfiguration: function(configuration) {
            if (core.isString(configuration)) {
                configuration = {
                    provider: configuration
                };
            }
            if (configuration.provider.indexOf('/') < 0) {
                // no paths in the provider url ->
                // assume this is a shortcut like 'inav2' and calculate real url
                // we cannot use the relative url to sinaFactory.js because 'require' loads
                // using absolute path or using relative to html page
                if (isSapRequire) {
                    configuration.provider = this.calculateProviderUrlSap(configuration.provider);
                } else {
                    configuration.provider = this.calculateProviderUrl(configuration.provider);
                }
            }
            return configuration;
        },

        calculateProviderUrlSap: function(provider) {
            // do not use path /sap/ushell/renderers/fiori2/search/sinaNext/providers
            //
            // in core-ex-light-0     sap/ushell/renderers/fiori2/search/sinaNext is included
            // which is different to /sap/ushell/renderers/fiori2/search/sinaNext
            //
            // using /sap/ushell/renderers/fiori2/search/sinaNext/providers
            // seems to work but causes tmodules to be loaded twice causing strange effects
            var prefix = 'sap/ushell/renderers/fiori2/search/sinaNext/providers/';
            var suffix = '/Provider';
            return prefix + provider + suffix;
        },

        calculateProviderUrl: function(provider) {
            var prefix = module.uri.split('/').slice(0, -1).join('/') + '/../providers/';
            var suffix = '/Provider';
            return prefix + provider + suffix;
        },

        createByTrialAsync: function(configurations, checkSuccessCallback) {

            // set default for checkSuccesCallback
            checkSuccessCallback = checkSuccessCallback || function() {
                return true;
            };

            // normalize configurations
            configurations = core.map(configurations, this.normalizeConfiguration.bind(this));

            // URL parameters for sina configuration
            var sinaProvider = util.getUrlParameter('sinaProvider');
            var sinaConfiguration = util.getUrlParameter('sinaConfiguration');
            if (sinaProvider && !sinaConfiguration) {
                sinaConfiguration = '{ "provider": "' + sinaProvider + '"}';
            }
            if (sinaConfiguration) {
                sinaConfiguration = this.normalizeConfiguration(JSON.parse(sinaConfiguration));
                for (var i = 0; i < configurations.length; ++i) {
                    var configuration = configurations[i];
                    if (configuration.provider !== sinaConfiguration.provider) {
                        configurations.splice(i, 1);
                        i--;
                        continue;
                    }
                    this.mergeConfiguration(configuration, sinaConfiguration);
                }
                if (configurations.length === 0) {
                    configurations.push(sinaConfiguration);
                }
            }

            // recursive creation of sina
            var doCreate = function(index) {
                if (index >= configurations.length) {
                    return core.Promise.reject(new core.Exception('sina creation by trial failed'));
                }
                var configuration = configurations[index];
                return this.createAsync(configuration).then(function(sina) {
                    if (checkSuccessCallback(sina)) {
                        return sina;
                    }
                    return doCreate(index + 1);
                }.bind(this), function() {
                    return doCreate(index + 1);
                }.bind(this));
            }.bind(this);
            return doCreate(0);

        },

        mergeConfiguration: function(configuration1, configuration2) {
            // TODO deep merge
            for (var property in configuration2) {
                configuration1[property] = configuration2[property];
            }
        }

    };


});
