sinaDefine(['../../../sina/sinaFactory'], function (sinaFactory) {


    QUnit.test('Configuration', function (assert) {
        var done = assert.async();

        sinaFactory.createAsync('../Provider').then(function (sina) {
            sina.getConfigurationAsync().then(function (configuration) {
                configuration.setPersonalizedSearch(false);
                configuration.saveAsync().then(function () {
                    configuration.resetPersonalizedSearchDataAsync().then(function () {
                        assert.equal(1, 1);
                        done();
                    });
                });
            });
        });
    });

});

