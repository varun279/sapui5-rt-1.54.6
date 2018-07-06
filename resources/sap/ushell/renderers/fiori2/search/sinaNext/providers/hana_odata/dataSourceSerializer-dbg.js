/* global define */

sinaDefine(['../../core/core', '../../sina/ComplexCondition', '../../sina/ComparisonOperator'], function (core, ComplexCondition, ComparisonOperator) {

    return {

        serialize: function (dataSource) {

            // handle all ds
            if (dataSource === dataSource.sina.getAllDataSource()) {
                return {
                    Id: '<All>',
                    Type: 'Category'
                };
            }

            // convert sina type to abap_odata type
            var type;
            switch (dataSource.type) {
                case dataSource.sina.DataSourceType.Category:
                    type = 'Category';
                    break;
                case dataSource.sina.DataSourceType.BusinessObject:
                    type = 'View';
                    break;
            }

            return {
                Id: dataSource.id,
                Type: type
            };
        }
    };

});
