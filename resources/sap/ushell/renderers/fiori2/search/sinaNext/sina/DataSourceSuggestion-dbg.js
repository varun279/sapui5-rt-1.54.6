/* global define */
sinaDefine(['../core/core', './Suggestion', './SuggestionType'], function (core, Suggestion, SuggestionType) {

    return Suggestion.derive({

        type: SuggestionType.DataSource,

        _meta: {
            properties: {
                dataSource: {
                    required: true
                }
            }
        }

    });

});
