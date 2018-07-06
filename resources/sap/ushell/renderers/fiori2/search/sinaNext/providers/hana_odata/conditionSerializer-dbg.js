/* global sinaDefine */

sinaDefine(['../../core/core', '../../sina/ComplexCondition', '../../sina/ComparisonOperator', './typeConverter'], function (core, ComplexCondition, ComparisonOperator, typeConverter) {
    "use strict";
    var ConditionSerializer = core.defineClass({

        _init: function (dataSource) {
            this.dataSource = dataSource;
        },

        convertSinaToOdataOperator: function (sinaOperator) {
            switch (sinaOperator) {
            case ComparisonOperator.Eq:
                return 'eq';
            case ComparisonOperator.Lt:
                return 'lt';
            case ComparisonOperator.Gt:
                return 'gt';
            case ComparisonOperator.Le:
                return 'le';
            case ComparisonOperator.Ge:
                return 'ge';
            case 'And':
                return "and";
            case 'Or':
                return "or";
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

            var resultStr = result.SubFilters.join(' ' + result.OperatorType + ' ');
            if (result.SubFilters.length > 1) {
                resultStr = '(' + resultStr + ')';
            }
            return resultStr;
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

            return conditionObj.ConditionAttribute + " " + conditionObj.ConditionOperator + " '" + conditionObj.ConditionValue + "'";
        },

        serializeBetweenCondition: function (condition) {
            var metadata;
            var type;
            // var conditionObj;
            // var valueLow;
            // var valueHigh;
            
            metadata = this.dataSource.getAttributeMetadata(condition.conditions[0].attribute);
            type = metadata.type;

            // if (condition.conditions[0].operator === "Ge") {
            //     valueLow = condition.conditions[0].value;
            //     valueHigh = condition.conditions[1].value;
            // } else {
            //     valueLow = condition.conditions[1].value;
            //     valueHigh = condition.conditions[0].value;
            // }
            // conditionObj = {
            //     "ConditionAttribute": condition.conditions[0].attribute,
            //     "ConditionOperator": "BT",
            //     "ConditionValue": typeConverter.sina2Odata(type, valueLow),
            //     "ConditionValueHigh": typeConverter.sina2Odata(type, valueHigh)
            // };

            var result = condition.conditions[0].attribute + " " + this.convertSinaToOdataOperator(condition.conditions[0].operator) + " " + typeConverter.sina2Odata(type, condition.conditions[0].value);
            result += " and ";
            result += condition.conditions[1].attribute + " " + this.convertSinaToOdataOperator(condition.conditions[1].operator) + " " + typeConverter.sina2Odata(type, condition.conditions[1].value);
            result = "(" + result + ")";
            return result;
        },

        serialize: function (condition) {
            if (condition instanceof ComplexCondition) {
                if (condition.operator === "And" && condition.conditions.length > 1 && condition.conditions[0] && (condition.conditions[0].operator === "Ge" || condition.conditions[0].operator === "Gt" || condition.conditions[0].operator === "Le" || condition.conditions[0].operator === "Lt")) {
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