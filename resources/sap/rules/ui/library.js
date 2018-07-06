/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/library"],function(q,l){"use strict";sap.ui.getCore().initLibrary({name:"sap.rules.ui",dependencies:["sap.ui.core","sap.ui.comp"],types:["sap.rules.ui.ValidationStatus","sap.rules.ui.ExpressionType","sap.rules.ui.Tokens","sap.rules.ui.RuleType","sap.rules.ui.RuleFormat","sap.rules.ui.RuleHitPolicy","sap.rules.ui.DecisionTableCellFormat","sap.rules.ui.DecisionTableFormat",],interfaces:[],controls:["sap.rules.ui.RuleBuilder","sap.rules.ui.BaseRule","sap.rules.ui.DecisionTable","sap.rules.ui.DecisionTableSettings","sap.rules.ui.ExpressionAdvanced","sap.rules.ui.ExpressionBase","sap.rules.ui.DecisionTableCellExpressionAdvanced","sap.rules.ui.BindingSpy","sap.rules.ui.DecisionTableCell","sap.rules.ui.TextRule","sap.rules.ui.TextRuleSettings","sap.rules.ui.type.ExpressionAbs","sap.rules.ui.type.DecisionTableCell","sap.rules.ui.type.DecisionTableHeader","sap.rules.ui.type.Expression"],elements:["sap.rules.ui.services.ExpressionLanguage","sap.rules.ui.DecisionTableConfiguration","sap.rules.ui.TextRuleConfiguration"],noLibraryCSS:false,version:"1.54.8"});sap.rules.ui.DecisionTableColumn={Condition:"CONDITION",Result:"RESULT"};sap.rules.ui.ChangeId={NewRule:"newRule",DecisionTable:"decisionTable",DecisionTableColumns:"decisionTableColumns",DecisionTableRows:"decisionTableRows"};sap.rules.ui.RuleType={DecisionTable:"DT",Ruleset:"RS",TextRule:"TextRule"};sap.rules.ui.DecisionTableCellFormat={Both:"BOTH",Guided:"GUIDED",Text:"TEXT"};sap.rules.ui.RuleFormat={Both:"BOTH",Basic:"BASIC",Advanced:"ADVANCED"};sap.rules.ui.DecisionTableFormat={CellFormat:"CELLFORMAT",RuleFormat:"RULEFORMAT"};sap.rules.ui.RuleHitPolicy={FirstMatch:"FM",AllMatch:"AM"};sap.rules.ui.ValidationStatus={Success:"Success",Error:"Error"};sap.rules.ui.ExpressionTokenType={alias:"alias",parameter:"parameter",reservedWord:"reservedword",vocabulary:"vocabulary",constant:"constant",whitespace:"whitespace",valueList:"valueList",unknown:"unknown"};sap.rules.ui.ExpressionCategory={fixed:"fixed",dynamic:"dynamic",value:"value",conjunctionOp:"conjunctionOp",comparisonOp:"comparisonOp",comparisonBetweenOp:"comparisonBetweenOp",comparisonExistOp:"comparisonExistOp",UOM:"UOM",func:"function",funcAdvances:"functionAdvanced",arithmeticOp:"arithmeticOp",filterOp:"filterOp",selectionOp:"selectionOp",groupOp:"groupOp",sortingOp:"sortingOp",structuredCond:"structuredCond",unknown:"unknown"};sap.rules.ui.SuggestionsPart={all:"all",leftPart:"leftPart",compPart:"compPart",rightPart:"rightPart"};sap.rules.ui.ExpressionType={All:"All",Number:"Number",Timestamp:"Timestamp",Boolean:"Boolean",TimeSpan:"TimeSpan",Date:"Date",Time:"Time",String:"String",NonComparison:"NonComparison",BooleanEnhanced:"BooleanEnhanced"};sap.rules.ui.BackendParserRequest={Validate:"validate",Suggests:"autocomplete",GetMetadata:"tokens"};return sap.rules.ui;});
