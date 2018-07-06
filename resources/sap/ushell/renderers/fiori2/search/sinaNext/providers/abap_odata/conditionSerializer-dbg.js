/* global define */

sinaDefine(['../../core/core', '../../sina/ComplexCondition', '../../sina/ComparisonOperator', './typeConverter'], function (core, ComplexCondition, ComparisonOperator, typeConverter) {

    var ConditionSerializer = core.defineClass({

        _init: function (dataSource) {
            this.dataSource = dataSource;
        },

        convertSinaToOdataOperator: function (sinaOperator) {
            switch (sinaOperator) {
            case ComparisonOperator.Eq:
                return 'EQ';
            case ComparisonOperator.Lt:
                return 'LT';
            case ComparisonOperator.Gt:
                return 'GT';
            case ComparisonOperator.Le:
                return 'LE';
            case ComparisonOperator.Ge:
                return 'GE';
            case 'And':
                return "AND";
                break;
            case 'Or':
                return "OR";
                break;
            default:
                throw new core.Exception('unknow comparison operator ' + sinaOperator);
            }
        },

        serializeComplexCondition: function (condition) {
            var result = {
                "Id": 1,
                "OperatorType": this.convertSinaToOdataOperator(condition.operator),
                "SubFilters": []
            };
            var subConditions = condition.conditions;
            for (var i = 0; i < subConditions.length; ++i) {
                var subCondition = subConditions[i];
                result.SubFilters.push(this.serialize(subCondition));
            }
            return result;
        },

        serializeSimpleCondition: function (condition) {
            var metadata;
            var type;
            var conditionObj;

            metadata = this.dataSource.getAttributeMetadata(condition.attribute);
            type = metadata.type;
            conditionObj = {
                "ConditionAttribute": condition.attribute,
                "ConditionOperator": this.convertSinaToOdataOperator(condition.operator),
                "ConditionValue": typeConverter.sina2Odata(type, condition.value)
            };

            return conditionObj;
        },

        serializeBetweenCondition: function (condition) {
            var metadata;
            var type;
            var conditionObj;
            var valueLow;
            var valueHigh;
            
            metadata = this.dataSource.getAttributeMetadata(condition.conditions[0].attribute);
            type = metadata.type;

            if (condition.conditions[0].operator === "Ge") {
                valueLow = condition.conditions[0].value;
                valueHigh = condition.conditions[1].value;
            } else {
                valueLow = condition.conditions[1].value;
                valueHigh = condition.conditions[0].value;
            }
            conditionObj = {
                "ConditionAttribute": condition.conditions[0].attribute,
                "ConditionOperator": "BT",
                "ConditionValue": typeConverter.sina2Odata(type, valueLow),
                "ConditionValueHigh": typeConverter.sina2Odata(type, valueHigh)
            };

            return conditionObj;
        },

        serialize: function (condition) {
            if (condition instanceof ComplexCondition) {
                if (condition.operator === "And" && condition.conditions[0] && (condition.conditions[0].operator === "Ge" || condition.conditions[0].operator === "Gt" || condition.conditions[0].operator === "Le" || condition.conditions[0].operator === "Lt")) {
                    return this.serializeBetweenCondition(condition);
                } else {
                    return this.serializeComplexCondition(condition);
                }
            } else {
                return this.serializeSimpleCondition(condition);
            }
        }

    });

    return {
        serialize: function (dataSource, condition) {
            var serializer = new ConditionSerializer(dataSource);
            return serializer.serialize(condition);
        }
    };

});