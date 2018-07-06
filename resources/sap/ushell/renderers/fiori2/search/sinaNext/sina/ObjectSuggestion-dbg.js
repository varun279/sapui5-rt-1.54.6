/* global define */
sinaDefine(['../core/core', './Suggestion', './SuggestionType'], function (core, Suggestion, SuggestionType) {

    return Suggestion.derive({

        type: SuggestionType.Object,

        _meta: {
            properties: {
                object: {
                    required: true
                }
            }
        }

    });

});
