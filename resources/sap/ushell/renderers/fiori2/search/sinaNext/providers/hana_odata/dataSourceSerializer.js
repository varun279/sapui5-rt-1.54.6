sinaDefine(['../../core/core','../../sina/ComplexCondition','../../sina/ComparisonOperator'],function(c,C,a){return{serialize:function(d){if(d===d.sina.getAllDataSource()){return{Id:'<All>',Type:'Category'};}var t;switch(d.type){case d.sina.DataSourceType.Category:t='Category';break;case d.sina.DataSourceType.BusinessObject:t='View';break;}return{Id:d.id,Type:t};}};});
