jQuery.sap.registerPreloadedModules({
"name":"Component-preload",
"version":"2.0",
"modules":{
	"sap/ushell_abap/plugins/fcc-transport-ui/Component.js":function(){sap.ui
		.define(
				[ "sap/ui/core/Component", "sap/ui/Device", "./model/models",
						"sap/ui/fl/transport/TransportDialog" ],
				function(Component, Device, models, TransportDialog) {
					"use strict";

					var bInitialized = false;

					return sap.ui.core.Component
							.extend(
									"sap.ushell_abap.plugins.fcc-transport-ui.Component",
									{

										metadata: {
											manifest: "json"
										},

										/**
										 * The component is initialized by UI5
										 * automatically during the startup of
										 * the app and calls the init method
										 * once.
										 * 
										 * @public
										 * @override
										 */
										init: function() {
											// prevent duplicate instantiation
											if (bInitialized) {
												return;
											}
											bInitialized = true;

											// set the device model
											this.setModel(models
													.createDeviceModel(),
													"device");

											// Create a resource bundle for
											// language specific texts
											var oResourceModel = new sap.ui.model.resource.ResourceModel(
													{
														bundleName: "sap.ushell_abap.plugins.fcc-transport-ui.i18n.i18n"
													});

											// Assign the model object to the
											// SAPUI5 core using the name "i18n"
											sap.ui.getCore().setModel(
													oResourceModel, "i18n");

											// register this with FCC
											var eventBus = sap.ui.getCore()
													.getEventBus();
											eventBus
													.subscribe(
															"sap.fcc.services.siteService",
															"beforeSave",
															function(
																	sChannelId,
																	sEventId,
																	siteService) {
																siteService
																		.doBeforeSave(
																				this.onBeforeSave,
																				this);
															}.bind(this));

										},

										openDialog: function(aMetadata) {
											var def = jQuery.Deferred();
											var result = aMetadata;
											var initPackage = aMetadata.package;
											var initTransport = aMetadata.transport;
											// package label
											var oLabelPackage = new sap.m.Label(
													{
														text: "{i18n>LABEL_TITLE_PACKAGE}",
														layoutData: new sap.ui.layout.form.GridElementData(
																{
																	hCells: "2"
																})
													});
											// package input
											var oInputPackage = new sap.m.Input(
													{
														maxLength: 30,
														layoutData: new sap.ui.layout.form.GridElementData(
																{
																	hCells: "auto"
																}),
														change: function(oEvent) {
															// change package
															// name to uppercase
															aMetadata.package = oEvent
																	.getSource()
																	.getValue()
																	.toUpperCase();
															oEvent
																	.getSource()
																	.setValue(
																			aMetadata.package);

															if (aMetadata.package) {
																if (aMetadata.package === "$TMP") { // local
																	// object
																	aMetadata.transport = "";
																	oButtonOK
																			.setEnabled(false);
																	oComboTransport
																			.setEnabled(false);
																	oComboTransport
																			.setSelectedKey("");
																	return;
																} else { // not
																	// local
																	// object
																	// make
																	// startsWith
																	// work in
																	// IE
																	/*
																	 * eslint
																	 * no-extend-native:
																	 * ["error", {
																	 * "exceptions":
																	 * ["String"] }]
																	 */
																	if (!String.prototype.startsWith) {
																		String.prototype.startsWith = function(
																				searchString,
																				position) {
																			position = position || 0;
																			return this
																					.indexOf(
																							searchString,
																							position) === position;
																		};
																	}
//																	BCP msg: 1770320590: remove all namespace checks
//																 	if entity id has a namespace, package should also have the same namespace
//																	if (aMetadata.id.startsWith("/")) {
//																		var aId = aMetadata.id.split("/");
//																		if (aId.length == 3) {
//																			var sNamespace = "/" + aId[1].toUpperCase() + "/";
//																			if ( !aMetadata.package.startsWith( sNamespace ) ) {
//																				oInputPackage.setValueState(sap.ui.core.ValueState.Error);
//																		        oInputPackage.setValueStateText(sap.ui.getCore().getModel("i18n").getProperty("ERROR_WRONGNAMESPACE"));
//																		        oInputPackage.setEnabled(true);
//																		        oButtonOK.setEnabled(false);
//																		        return;
//																			} // else everything OK
//																			
//																		} else {
//																			//ID already wrong -> may never happen, FCC in charge
//																		}
//																	} else {
//																		// if entity id has no namespace also package must not have one
//																		if (aMetadata.package.indexOf("/") >= 0) {
//																			oInputPackage.setValueState(sap.ui.core.ValueState.Error);
//																	        oInputPackage.setValueStateText(sap.ui.getCore().getModel("i18n").getResourceBundle().getText("ERROR_NAMESPACENOTALLOWED", [aMetadata.id]));
//																	        oInputPackage.setEnabled(true);
//																	        oButtonOK.setEnabled(false);
//																	        return;
//																		}
//																	}	
																	var sRelativeUrl = "/sap/bc/ui2/cdm_fcc/vhtr";
																	var sMethod = "GET";
																	var options = "package="
																			+ aMetadata.package; // /UI2/CDM_DPS//sap-client=010&
																	var oLrepConnector = sap.ui.fl.LrepConnector
																			.createConnector();
																	oLrepConnector
																			.send(
																					sRelativeUrl,
																					sMethod,
																					options,
																					null)
																			.then(
																					function(
																							aMetadata) {
																						var aTransports = [];
																						if (Array
																								.isArray(aMetadata.response.transports)) {
																							for ( var j in aMetadata.response.transports) {
																								var item = aMetadata.response.transports[j];
																								aTransports
																										.push({
																											"transportId": item.transportid,
																											"description": item.description
																										});
																							}
																						} else {
																							var item = aMetadata.response.transports;
																							aTransports
																									.push({
																										"transportId": item.transportid,
																										"description": item.description
																									});
																						}
																						var oModel = new sap.ui.model.json.JSONModel();
																						oModel
																								.setData(aTransports);
																						sap.ui
																								.getCore()
																								.setModel(
																										oModel);
																						oComboTransport
																								.bindItems(
																										"/",
																										new sap.ui.core.ListItem(
																												{
																													key: "{transportId}",
																													text: "{transportId}",
																													additionalText: "{description}"
																												}));
																						aMetadata.transport = oComboTransport
																								.getFirstItem();
																						oComboTransport
																								.setSelectedItem(aMetadata.transport);
																						oComboTransport
																								.fireChangeEvent(aMetadata.transport);
																						oInputPackage
																								.setValueState(sap.ui.core.ValueState.None);
																						oButtonOK
																								.setEnabled(true);
																						oComboTransport
																								.setEnabled(true);
																					},
																					function(
																							error) {
																						jQuery.sap.log
																								.info(JSON
																										.stringify(error));
																						oInputPackage
																								.setEnabled(true);
																						oInputPackage
																								.setValueState(sap.ui.core.ValueState.Error);
																						if (error.code === 500){
																							oInputPackage
																					        .setValueStateText(sap.ui.getCore().getModel("i18n").getProperty("ERROR_HTTP500"));
																						} else if (error.code === 404){
																							oInputPackage
																					        .setValueStateText(sap.ui.getCore().getModel("i18n").getProperty("ERROR_HTTP404"));
																						} else {
																							oInputPackage
																					        .setValueStateText(sap.ui.getCore().getModel("i18n").getProperty("ERROR_REQUESTFAILED"));
																						}
																						oButtonOK
																								.setEnabled(false);
																						oComboTransport
																								.setEnabled(false);
																						oComboTransport
																								.setSelectedKey("");
																					});
																}
															} else { // null,
																// undefinied,
																// ...
																aMetadata.transport = "";
																oComboTransport
																		.setEnabled(false);
																oComboTransport
																		.setSelectedKey("");
															}
														} // input change
													// event handler
													}); // sap.m.input

											// Transport label
											var oLabelTransport = new sap.m.Label(
													{
														text: "{i18n>LABEL_TITLE_TRANSPORT}",
														layoutData: new sap.ui.layout.form.GridElementData(
																{
																	hCells: "2"
																})
													});
											// Transport combobox
											var oComboTransport = new sap.m.ComboBox(
													{
														layoutData: new sap.ui.layout.form.GridElementData(
																{
																	hCells: "auto"
																}),
														showSecondaryValues: true,
														enabled: false,
														items: {
															path: "/",
															template: new sap.ui.core.ListItem(
																	{
																		key: "{transportId}",
																		text: "{transportId}",
																		additionalText: "{description}"
																	})
														},
														change: function(oEvent) {
															aMetadata.transport = oEvent
																	.getSource()
																	.getValue();
															if (aMetadata.transport) {
																oButtonOK
																		.setEnabled(true);
															}
														}
													});

											// batch checkbox
											var oCheckbox = new sap.m.CheckBox(
													{
														selected: false,
														layoutData: new sap.ui.layout.form.GridElementData(
																{
																	hCells: "1"
																}),
														select: function() {
															if (oCheckbox
																	.getSelected()) {
																result.checkboxFlag = true;
															} else {
																result.checkboxFlag = false;
															}
														}
													});

											// checkbox text - used instead of
											// standard checkbox text to enable
											// text wrapping
											var oText = new sap.m.Text(
													{
														text: "{i18n>CHKBOX_TXT_BATCHOBJECTS}",
														tooltip: "{i18n>CHKBOX_TXT_BATCHOBJECTS}",
														wrapping: true,
														layoutData: new sap.ui.layout.form.GridElementData(
																{
																	hCells: "auto"
																})
													});

											var oButtonLO = new sap.m.Button({
												text: "{i18n>BTN_TITLE_LOCALOBJECT}",
												tooltip: "{i18n>BTN_TITLE_LOCALOBJECT}",
												press: function() {
													result.package = "$tmp";
													result.transport = "";
													oDialog.close();
												}
											});

											var oButtonOK = new sap.m.Button({
												text: "{i18n>BTN_TITLE_OK}",
												tooltip: "{i18n>BTN_TITLE_OK}",
												enabled: false,
												press: function() {
													oDialog.close();
												}
											});

											var oButtonCancel = new sap.m.Button(
													{
														text: "{i18n>BTN_TITLE_CANCEL}",
														tooltip: "{i18n>BTN_TITLE_CANCEL}",
														press: function() {
															result.package = initPackage;
															result.transport = initTransport;
															result.cancelClickedFlag = true;
															oDialog.close();
															if (result.operation === "CREATE") {
																var eventBus = sap.ui.getCore().getEventBus();
																eventBus.publish("sap.fcc.services.siteService", "onCancelCreation");
															}
														}
													});

											// fire change event if package
											// provided initially
											if (aMetadata.package) {
												oInputPackage
														.setValue(aMetadata.package);
												oInputPackage.setEnabled(false);
												oButtonLO.setEnabled(false);
												oInputPackage
														.fireChangeEvent(aMetadata.package);
											}

											// // fire change event if package
											// provided initially
											// if(aMetadata.id.startsWith("/"))
											// {
											// oButtonLO.setEnabled(false);
											// }
											// ;

											// Dialog title
											var sDialogTitle = "";
											if (aMetadata.id === ""
													|| aMetadata.type === "") {
												sDialogTitle = "{i18n>DLG_TITLE_DEFAULTNAME}";
											} else {
												// read msg from i18n model
												var oBundle = sap.ui.getCore()
														.getModel("i18n")
														.getResourceBundle();
												
												sDialogTitle = oBundle.getText("DLG_TITLE_" + aMetadata.type.toUpperCase(), [aMetadata.id]);
											}

											// transport dialog
											var oDialog = new sap.m.Dialog(
													{
														title: sDialogTitle,
														resizable: true,
														draggable: true,
														content: [ new sap.ui.layout.form.Form(
																{
																	width: "400px",
																	editable: true,
																	layout: new sap.ui.layout.form.GridLayout(
																			{
																				singleColumn: true
																			}),
																	formContainers: [ new sap.ui.layout.form.FormContainer(
																			{
																				formElements: [
																						new sap.ui.layout.form.FormElement(
																								{
																									label: oLabelPackage,
																									fields: [ oInputPackage ]
																								}),
																						new sap.ui.layout.form.FormElement(
																								{
																									label: oLabelTransport,
																									fields: [ oComboTransport ]
																								}),
																						new sap.ui.layout.form.FormElement(
																								{
																									fields: [
																											oCheckbox,
																											oText ]
																								}) ]
																			}) ]
																}) ], // end
														// of
														// dialog
														// content
														buttons: [ oButtonLO,
																oButtonOK,
																oButtonCancel ],
														afterClose: function() {
															oDialog.destroy();
															def.resolve(result);
														}
													});

											oDialog.open();
											return def.promise();
										},

										onBeforeSave: function(oContent) {

											var that = this;
											return new jQuery.Deferred(
													function(oDeferred) {
														try {
															var oResult = oContent;
															var aMetadata = [];
															// var flags = {
															// "openDialogFlag":
															// false,
															// "checkboxFlag":
															// false,
															// "cancelClickedFlag":false
															// };
															// loop through
															// items in the
															// BATCH array
															for ( var i in oContent.BATCH) {
																var item = oContent.BATCH[i];
																// jQuery.extend(flags,
																// item.metadata);
																aMetadata[i] = {
																	"operation": item.metadata.operation,
																	"id": item.metadata.id,
																	"type": item.metadata.entityType,
																	"package": item.metadata.package,
																	"transport": item.metadata.transportId,
																	"openDialogFlag": false,
																	"checkboxFlag": false,
																	"cancelClickedFlag": false
																};
															} // end of
															// Request
															// payload JSON
															// BATCH loop

															for (var i = 0; i < aMetadata.length; i++) {
																if (aMetadata[i].operation === "CREATE") { // if
																	// operation
																	// =
																	// create,
																	// open
																	// popup
																	// to
																	// get
																	// missing
																	// data
																	aMetadata[i].openDialogFlag = true;
																} else { // if
																	// operation
																	// =
																	// Update/Delete/...
																	if (!aMetadata[i].package) { // if
																		// package
																		// is
																		// empty,
																		// open
																		// transport
																		// popup
																		aMetadata[i].openDialogFlag = true;
																	} else if (aMetadata[i].package
																			.toUpperCase() === "$TMP") { // donot
																		// open
																		// popup
																		// in
																		// case
																		// of
																		// local
																		// object
																		aMetadata[i].openDialogFlag = false;
																	} else if (aMetadata[i].package
																			&& !aMetadata[i].transport) { // if
																		// package
																		// is
																		// not
																		// empty
																		// and
																		// transport
																		// ID
																		// is
																		// empty,
																		// search
																		// for
																		// same
																		// package
																		// name
																		for (var j = 0; j < aMetadata.length; j++) {
																			if (i != j
																					&& aMetadata[i].package === aMetadata[j].package
																					&& aMetadata[j].transport) { // compare
																				// package
																				// with
																				// all
																				// other
																				// packages
																				// in
																				// the
																				// batch,
																				// if
																				// match
																				// found
																				// then
																				// copy
																				// the
																				// corresponding
																				// transport
																				// id
																				aMetadata[i].transport = aMetadata[j].transport;
																				oResult.BATCH[i].metadata.transportId = aMetadata[j].transport;
																				break;
																			} else { // else
																				// open
																				// popup
																				// to
																				// get
																				// missing
																				// data
																				aMetadata[i].openDialogFlag = true;
																			}
																		}
																	} // no
																	// popup
																	// if
																	// both
																	// package
																	// and
																	// transport
																	// id
																	// are
																	// known
																}
															}
															that.processEntry(
																	that,
																	oResult,
																	oDeferred,
																	aMetadata,
																	0);
														} catch (err) {
															oDeferred
																	.reject(err);
														}
													}).promise();

										},
										processEntry: function(that, oResult,
												oDeferred, aMetadata, i) {
											var length = aMetadata.length;
											while (aMetadata[i].openDialogFlag === false) {
												if (i < length - 1) {
													i++;
												} else {
													break;
												}
											}

											if (aMetadata[i].openDialogFlag === true) { // if
												// openDialogFlag
												// is
												// true
												that
														.openDialog(
																aMetadata[i])
														.done(
																function(result) {
																	oResult.BATCH[i].metadata.package = result.package;
																	oResult.BATCH[i].metadata.transportId = result.transport;
																	if (result.checkboxFlag === true
																			&& result.package
																			&& result.cancelClickedFlag === false) { // if
																		// checkbox
																		// checked,
																		// package
																		// is
																		// not
																		// empty,
																		// and
																		// cancel
																		// button
																		// not
																		// clicked
																		if (result.operation === "CREATE"
																				&& result.package
																						.toUpperCase() !== "$TMP") { // if
																			// operation=create
																			// and
																			// package
																			// non
																			// $tmp,
																			// assign
																			// given
																			// package
																			// and
																			// transport
																			// ID
																			// to
																			// all
																			// following
																			// objects
																			// of
																			// same
																			// type
																			// (catalog,
																			// group,
																			// etc.)
																			for (var j = i + 1; j < aMetadata.length; j++) {
																				if (aMetadata[j].type === result.type) {
																					oResult.BATCH[j].metadata.package = result.package;
																					oResult.BATCH[j].metadata.transportId = result.transport;
																					aMetadata[j].openDialogFlag = false;
																				}
																			}
																		} else { // if
																			// operation=update/delete/...,
																			// apply
																			// transport
																			// ID
																			// to
																			// all
																			// objects
																			// in
																			// same
																			// package
																			for (var j = i + 1; j < aMetadata.length; j++) {
																				if (aMetadata[j].package === result.package) {
																					oResult.BATCH[j].metadata.transportId = result.transport;
																					aMetadata[j].openDialogFlag = false;
																				}
																			}
																		}
																	}
																	if (aMetadata[i].cancelClickedFlag === true
																			&& aMetadata.length === 1) {
																		oDeferred
																				.reject(sap.ui
																						.getCore()
																						.getModel(
																								"i18n")
																						.getProperty(
																								"MSG_SINGLECANCEL"));
																	} else if (++i < aMetadata.length) {
																		that
																				.processEntry(
																						that,
																						oResult,
																						oDeferred,
																						aMetadata,
																						i);
																	} else {
																		// fail
																		// promise
																		// in
																		// case
																		// all
																		// popups
																		// were
																		// cancelled
																		var cancelCounter = 0, dialogCounter = 0;
																		for (var j = 0; j < aMetadata.length; j++) {
																			if (aMetadata[j].openDialogFlag === true) {
																				dialogCounter++;
																			}
																			if (aMetadata[j].cancelClickedFlag === true) {
																				cancelCounter++;
																			}
																		}
																		if (dialogCounter === cancelCounter) {
																			oDeferred
																					.reject(sap.ui
																							.getCore()
																							.getModel(
																									"i18n")
																							.getProperty(
																									"MSG_ALLPOPUPSCANCELLED"));
																		} else {
																			oDeferred
																					.resolve(oResult);
																		}

																	}
																}).fail(
																function() {
																});
											}
										}
									});
				});
},
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#__ldi.translation.uuid = b188ed20-2c0c-11e7-9598-0800200c9a66\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE = Package\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT = Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS = Put all subsequent objects of the same package into the selected transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT = Local Object\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK = OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL = Cancel\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME= Transport Content\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE = Package name needs to start with the same namespace as the ID shown in dialog title\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED= Package for entity {0} must not have a namespace.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL = Operation has been cancelled.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED= Operation has been cancelled.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT = Transport App: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG = Transport Catalog: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP = Transport Group: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE = Transport Role: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED = Sorry we could not connect to the server. Please try again later.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500 = Internal server error\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404 = Package not found',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ar.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u0627\\u0644\\u062D\\u0632\\u0645\\u0629\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u0646\\u0642\\u0644\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u0648\\u0636\\u0639 \\u0643\\u0644 \\u0627\\u0644\\u0643\\u0627\\u0626\\u0646\\u0627\\u062A \\u0627\\u0644\\u0644\\u0627\\u062D\\u0642\\u0629 \\u0645\\u0646 \\u0646\\u0641\\u0633 \\u0627\\u0644\\u062D\\u0632\\u0645\\u0629 \\u0641\\u064A \\u0627\\u0644\\u0646\\u0642\\u0644 \\u0627\\u0644\\u0645\\u062D\\u062F\\u062F\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u0627\\u0644\\u0643\\u0627\\u0626\\u0646 \\u0627\\u0644\\u0645\\u062D\\u0644\\u064A\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u0645\\u0648\\u0627\\u0641\\u0642\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0625\\u0644\\u063A\\u0627\\u0621\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u0645\\u062D\\u062A\\u0648\\u0649 \\u0627\\u0644\\u0646\\u0642\\u0644\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u064A\\u062C\\u0628 \\u0623\\u0646 \\u064A\\u0628\\u062F\\u0623 \\u0627\\u0633\\u0645 \\u0627\\u0644\\u062D\\u0632\\u0645\\u0629 \\u0628\\u0646\\u0641\\u0633 \\u0645\\u0633\\u0627\\u062D\\u0629 \\u0627\\u0644\\u0627\\u0633\\u0645 \\u0645\\u062B\\u0644 \\u0627\\u0644\\u0645\\u0639\\u0631\\u0641 \\u0627\\u0644\\u0645\\u0648\\u062C\\u0648\\u062F \\u0641\\u064A \\u0639\\u0646\\u0648\\u0627\\u0646 \\u0645\\u0631\\u0628\\u0639 \\u0627\\u0644\\u062D\\u0648\\u0627\\u0631\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u064A\\u062C\\u0628 \\u0623\\u0644\\u0627 \\u062A\\u062D\\u062A\\u0648\\u064A \\u062D\\u0632\\u0645\\u0629 \\u0627\\u0644\\u0643\\u064A\\u0627\\u0646 {0} \\u0639\\u0644\\u0649 \\u0645\\u0633\\u0627\\u062D\\u0629 \\u0627\\u0633\\u0645.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0639\\u0645\\u0644\\u064A\\u0629.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0639\\u0645\\u0644\\u064A\\u0629.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u062A\\u0637\\u0628\\u064A\\u0642 \\u0627\\u0644\\u0646\\u0642\\u0644\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u062F\\u0644\\u064A\\u0644 \\u0627\\u0644\\u0646\\u0642\\u0644\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u0645\\u062C\\u0645\\u0648\\u0639\\u0629 \\u0627\\u0644\\u0646\\u0642\\u0644\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u062F\\u0648\\u0631 \\u0627\\u0644\\u0646\\u0642\\u0644\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0639\\u0630\\u0631\\u064B\\u0627\\u060C \\u062A\\u0639\\u0630\\u0631 \\u0627\\u0644\\u0627\\u062A\\u0635\\u0627\\u0644 \\u0628\\u0627\\u0644\\u062E\\u0627\\u062F\\u0645. \\u0627\\u0644\\u0631\\u062C\\u0627\\u0621 \\u0625\\u0639\\u0627\\u062F\\u0629 \\u0627\\u0644\\u0645\\u062D\\u0627\\u0648\\u0644\\u0629 \\u0644\\u0627\\u062D\\u0642\\u064B\\u0627.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u062D\\u062F\\u062B \\u062E\\u0637\\u0623 \\u0641\\u064A \\u0627\\u0644\\u062E\\u0627\\u062F\\u0645 \\u0627\\u0644\\u062F\\u0627\\u062E\\u0644\\u064A\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u0644\\u0645 \\u064A\\u062A\\u0645 \\u0627\\u0644\\u0639\\u062B\\u0648\\u0631 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u062D\\u0632\\u0645\\u0629\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_bg.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u041F\\u0430\\u043A\\u0435\\u0442\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u0422\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u041F\\u043E\\u0441\\u0442\\u0430\\u0432\\u0435\\u0442\\u0435 \\u0432\\u0441\\u0438\\u0447\\u043A\\u0438 \\u043F\\u043E\\u0441\\u043B\\u0435\\u0434\\u0432\\u0430\\u0449\\u0438 \\u043E\\u0431\\u0435\\u043A\\u0442\\u0438 \\u043E\\u0442 \\u0441\\u044A\\u0449\\u0438\\u044F \\u043F\\u0430\\u043A\\u0435\\u0442 \\u0432 \\u0438\\u0437\\u0431\\u0440\\u0430\\u043D\\u0438\\u044F \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u041B\\u043E\\u043A\\u0430\\u043B\\u0435\\u043D \\u043E\\u0431\\u0435\\u043A\\u0442\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u041E\\u0442\\u043A\\u0430\\u0437\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u0421\\u044A\\u0434\\u044A\\u0440\\u0436\\u0430\\u043D\\u0438\\u0435 \\u043D\\u0430 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u0418\\u043C\\u0435 \\u043D\\u0430 \\u043F\\u0430\\u043A\\u0435\\u0442 \\u0442\\u0440\\u044F\\u0431\\u0432\\u0430 \\u0434\\u0430 \\u0437\\u0430\\u043F\\u043E\\u0447\\u0432\\u0430 \\u0441\\u044A\\u0441 \\u0441\\u044A\\u0449\\u0430\\u0442\\u0430 \\u043E\\u0431\\u043B\\u0430\\u0441\\u0442 \\u043D\\u0430 \\u0438\\u043C\\u0435\\u043D\\u0430 \\u043A\\u0430\\u0442\\u043E \\u0418\\u0414, \\u043F\\u043E\\u043A\\u0430\\u0437\\u0430\\u043D \\u0432 \\u0437\\u0430\\u0433\\u043B\\u0430\\u0432\\u0438\\u0435\\u0442\\u043E \\u043D\\u0430 \\u0434\\u0438\\u0430\\u043B\\u043E\\u0433\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u041F\\u0430\\u043A\\u0435\\u0442 \\u0437\\u0430 \\u0435\\u0434\\u0438\\u043D\\u0438\\u0446\\u0430 {0} \\u043D\\u0435 \\u0442\\u0440\\u044F\\u0431\\u0432\\u0430 \\u0434\\u0430 \\u0438\\u043C\\u0430 \\u043E\\u0431\\u043B\\u0430\\u0441\\u0442 \\u0438\\u043C\\u0435\\u043D\\u0430.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0438\\u044F\\u0442\\u0430 \\u0435 \\u043E\\u0442\\u043A\\u0430\\u0437\\u0430\\u043D\\u0430.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0438\\u044F\\u0442\\u0430 \\u0435 \\u043E\\u0442\\u043A\\u0430\\u0437\\u0430\\u043D\\u0430.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u0422\\u0440\\u0430\\u043D\\u0441\\u043F. \\u043F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u041A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433 \\u043D\\u0430 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u0413\\u0440\\u0443\\u043F\\u0430 \\u043D\\u0430 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u0420\\u043E\\u043B\\u044F \\u043D\\u0430 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u041D\\u044F\\u043C\\u0430 \\u0432\\u0440\\u044A\\u0437\\u043A\\u0430 \\u0441\\u044A\\u0441 \\u0441\\u044A\\u0440\\u0432\\u044A\\u0440\\u0430. \\u041C\\u043E\\u043B\\u044F, \\u043E\\u043F\\u0438\\u0442\\u0430\\u0439\\u0442\\u0435 \\u043E\\u0442\\u043D\\u043E\\u0432\\u043E \\u043F\\u043E-\\u043A\\u044A\\u0441\\u043D\\u043E.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0412\\u044A\\u0442\\u0440\\u0435\\u0448\\u043D\\u0430 \\u0433\\u0440\\u0435\\u0448\\u043A\\u0430 \\u043D\\u0430 \\u0441\\u044A\\u0440\\u0432\\u044A\\u0440\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u041F\\u0430\\u043A\\u0435\\u0442\\u044A\\u0442 \\u043D\\u0435 \\u0435 \\u043D\\u0430\\u043C\\u0435\\u0440\\u0435\\u043D\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ca.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paquet\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Col\\u00B7locar els objectes seg\\u00FCents del mateix paquet en el transport seleccionat\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Objecte local\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=D\'acord\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Cancel\\u00B7lar\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Contingut de transport\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=El nom del paquet ha de comen\\u00E7ar per la mateixa \\u00E0rea de noms que l\'ID visualitzat en el t\\u00EDtol del di\\u00E0leg\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=El paquet de l\'\'entitat {0} no pot tenir cap \\u00E0rea de noms.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operaci\\u00F3 cancel\\u00B7lada\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operaci\\u00F3 cancel\\u00B7lada\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplicaci\\u00F3 de transport\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Cat\\u00E0leg de transport\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Grup de transport\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Rol de transport\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=No es pot establir cap connexi\\u00F3 amb el servidor. Torneu a intentar-ho m\\u00E9s tard\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Error de servidor intern\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=No s\\u2019ha trobat el paquet\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_cs.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=V\\u0161echny n\\u00E1sledn\\u00E9 objekty stejn\\u00E9ho paketu p\\u0159evz\\u00EDt do zvolen\\u00E9ho transportu\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lok\\u00E1ln\\u00ED objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Zru\\u0161en\\u00ED\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Obsah transportu\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=N\\u00E1zev paketu mus\\u00ED za\\u010D\\u00EDnat stejn\\u00FDm rozsahem n\\u00E1zv\\u016F jako ID zobrazen\\u00E9 v titulku dialogu\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket pro entitu {0} nesm\\u00ED m\\u00EDt \\u017E\\u00E1dn\\u00FD rozsah n\\u00E1zv\\u016F.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operace byla zru\\u0161ena.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operace byla zru\\u0161ena.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transport-aplikace\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Katalog transportu\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transportn\\u00ED skupina\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transportn\\u00ED role\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Spojen\\u00ED se serverem nen\\u00ED mo\\u017En\\u00E9. Pokuste se znovu pozd\\u011Bji.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Intern\\u00ED chyba serveru\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket nenalezen\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_da.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakke\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Optag alle f\\u00F8lgende objekter for samme pakke i valgt transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokalt objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Afbryd\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transportindhold\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Pakkenavn skal starte med samme navneomr\\u00E5de som i den viste ID i dialogtitlen\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Pakke for entitet {0} m\\u00E5 ikke have noget navneomr\\u00E5de.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operation afbrudt\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operation afbrudt\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transportapp\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transportkatalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transportgruppe\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transportrolle\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Ikke muligt at oprette forbindelse til serveren. Fors\\u00F8g igen senere.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Intern serverfejl\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pakke ikke fundet\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_de.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Alle folgenden Objekte desselben Pakets in den ausgew\\u00E4hlten Transport aufnehmen\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokales Objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Abbrechen\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transportinhalt\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Paketname muss mit demselben Namensraum beginnen wie die im Dialogtitel angezeigte ID\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket f\\u00FCr Entit\\u00E4t {0} darf keinen Namensraum haben.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Vorgang wurde abgebrochen.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Vorgang wurde abgebrochen.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transport-App\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transportkatalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transportgruppe\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transportrolle\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Leider konnte keine Verbindung zum Server hergestellt werden. Bitte versuchen Sie es sp\\u00E4ter erneut.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Interner Server-Fehler\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket nicht gefunden\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_el.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u03A0\\u03B1\\u03BA\\u03AD\\u03C4\\u03BF\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u03A4\\u03BF\\u03C0\\u03BF\\u03B8\\u03B5\\u03C4\\u03AE\\u03C3\\u03C4\\u03B5 \\u03CC\\u03BB\\u03B1 \\u03C4\\u03B1 \\u03B5\\u03C0\\u03CC\\u03BC\\u03B5\\u03BD\\u03B1 \\u03B1\\u03BD\\u03C4\\u03B9\\u03BA\\u03B5\\u03AF\\u03BC\\u03B5\\u03BD\\u03B1 \\u03C4\\u03BF\\u03C5 \\u03AF\\u03B4\\u03B9\\u03BF\\u03C5 \\u03C0\\u03B1\\u03BA\\u03AD\\u03C4\\u03BF\\u03C5 \\u03C3\\u03C4\\u03B7\\u03BD \\u03B5\\u03C0\\u03B9\\u03BB\\u03B5\\u03B3\\u03BC\\u03AD\\u03BD\\u03B7 \\u03BC\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u03A4\\u03BF\\u03C0\\u03B9\\u03BA\\u03CC \\u0391\\u03BD\\u03C4\\u03B9\\u03BA\\u03B5\\u03AF\\u03BC\\u03B5\\u03BD\\u03BF\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u039F\\u039A\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0391\\u03BA\\u03CD\\u03C1\\u03C9\\u03C3\\u03B7\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u03A0\\u03B5\\u03C1\\u03B9\\u03B5\\u03C7\\u03CC\\u03BC\\u03B5\\u03BD\\u03BF \\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC\\u03C2\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u03A4\\u03BF \\u03CC\\u03BD\\u03BF\\u03BC\\u03B1 \\u03C0\\u03B1\\u03BA\\u03AD\\u03C4\\u03BF\\u03C5 \\u03C0\\u03C1\\u03AD\\u03C0\\u03B5\\u03B9 \\u03BD\\u03B1 \\u03BE\\u03B5\\u03BA\\u03B9\\u03BD\\u03AC \\u03BC\\u03B5 \\u03B4\\u03B9\\u03AC\\u03C3\\u03C4\\u03B7\\u03BC\\u03B1 \\u03BF\\u03BD\\u03BF\\u03BC\\u03AC\\u03C4\\u03C9\\u03BD \\u03AF\\u03B4\\u03B9\\u03BF \\u03BC\\u03B5 \\u03B1\\u03C5\\u03C4\\u03CC \\u03C4\\u03BF\\u03C5 ID \\u03C0\\u03BF\\u03C5 \\u03B5\\u03BC\\u03C6\\u03B1\\u03BD\\u03AF\\u03B6\\u03B5\\u03C4\\u03B1\\u03B9 \\u03C3\\u03C4\\u03BF\\u03BD \\u03C4\\u03AF\\u03C4\\u03BB\\u03BF \\u03B4\\u03B9\\u03B1\\u03BB\\u03CC\\u03B3\\u03BF\\u03C5\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u03A4\\u03BF \\u03C0\\u03B1\\u03BA\\u03AD\\u03C4\\u03BF \\u03B3\\u03B9\\u03B1 \\u03C4\\u03B7\\u03BD \\u03B5\\u03BD\\u03CC\\u03C4\\u03B7\\u03C4\\u03B1 {0} \\u03B4\\u03B5\\u03BD \\u03C0\\u03C1\\u03AD\\u03C0\\u03B5\\u03B9 \\u03BD\\u03B1 \\u03AD\\u03C7\\u03B5\\u03B9 \\u03C7\\u03CE\\u03C1\\u03BF \\u03BF\\u03BD\\u03BF\\u03BC\\u03AC\\u03C4\\u03C9\\u03BD.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u0397 \\u03BB\\u03B5\\u03B9\\u03C4\\u03BF\\u03C5\\u03C1\\u03B3\\u03AF\\u03B1 \\u03B1\\u03BA\\u03C5\\u03C1\\u03CE\\u03B8\\u03B7\\u03BA\\u03B5.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u0397 \\u03BB\\u03B5\\u03B9\\u03C4\\u03BF\\u03C5\\u03C1\\u03B3\\u03AF\\u03B1 \\u03B1\\u03BA\\u03C5\\u03C1\\u03CE\\u03B8\\u03B7\\u03BA\\u03B5.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u0395\\u03C6\\u03B1\\u03C1\\u03BC\\u03BF\\u03B3\\u03AE \\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC\\u03C2\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u039A\\u03B1\\u03C4\\u03AC\\u03BB\\u03BF\\u03B3\\u03BF\\u03C2 \\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03CE\\u03BD\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u039F\\u03BC\\u03AC\\u03B4\\u03B1 \\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03CE\\u03BD\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u03A1\\u03CC\\u03BB\\u03BF\\u03C2 \\u039C\\u03B5\\u03C4\\u03B1\\u03C6\\u03BF\\u03C1\\u03AC\\u03C2\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0394\\u03B5\\u03BD \\u03C0\\u03C1\\u03B1\\u03B3\\u03BC\\u03B1\\u03C4\\u03BF\\u03C0\\u03BF\\u03B9\\u03AE\\u03B8\\u03B7\\u03BA\\u03B5 \\u03C3\\u03CD\\u03BD\\u03B4\\u03B5\\u03C3\\u03B7 \\u03BC\\u03B5 \\u03C4\\u03BF \\u03B4\\u03B9\\u03B1\\u03BA\\u03BF\\u03BC\\u03B9\\u03C3\\u03C4\\u03AE. \\u03A0\\u03C1\\u03BF\\u03C3\\u03C0\\u03B1\\u03B8\\u03AE\\u03C3\\u03C4\\u03B5 \\u03BE\\u03B1\\u03BD\\u03AC \\u03B1\\u03C1\\u03B3\\u03CC\\u03C4\\u03B5\\u03C1\\u03B1.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0395\\u03C3\\u03C9\\u03C4\\u03B5\\u03C1\\u03B9\\u03BA\\u03CC \\u03C3\\u03C6\\u03AC\\u03BB\\u03BC\\u03B1 \\u03B4\\u03B9\\u03B1\\u03BA\\u03BF\\u03BC\\u03B9\\u03C3\\u03C4\\u03AE\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u03A4\\u03BF \\u03C0\\u03B1\\u03BA\\u03AD\\u03C4\\u03BF \\u03B4\\u03B5\\u03BD \\u03B2\\u03C1\\u03AD\\u03B8\\u03B7\\u03BA\\u03B5\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_en.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Package\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Put all subsequent objects of the same package into the selected transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Local Object\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Cancel\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transport Content\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Package name must start with the same namespace as the ID shown in the dialog title\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Package for entity {0} must not have a namespace.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operation has been cancelled.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operation has been cancelled.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transport App\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transport Catalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transport Group\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transport Role\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Sorry, we could not connect to the server. Please try again later.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Internal server error\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Package not found\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_en_US_sappsd.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=[[[\\u01A4\\u0105\\u010B\\u0137\\u0105\\u011F\\u0113\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=[[[\\u0162\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=[[[\\u01A4\\u0171\\u0163 \\u0105\\u013A\\u013A \\u015F\\u0171\\u0183\\u015F\\u0113\\u01A3\\u0171\\u0113\\u014B\\u0163 \\u014F\\u0183\\u0135\\u0113\\u010B\\u0163\\u015F \\u014F\\u0192 \\u0163\\u0125\\u0113 \\u015F\\u0105\\u0271\\u0113 \\u03C1\\u0105\\u010B\\u0137\\u0105\\u011F\\u0113 \\u012F\\u014B\\u0163\\u014F \\u0163\\u0125\\u0113 \\u015F\\u0113\\u013A\\u0113\\u010B\\u0163\\u0113\\u018C \\u0163\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=[[[\\u013B\\u014F\\u010B\\u0105\\u013A \\u014E\\u0183\\u0135\\u0113\\u010B\\u0163\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=[[[\\u014E\\u0136\\u2219\\u2219]]]\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=[[[\\u0108\\u0105\\u014B\\u010B\\u0113\\u013A\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=[[[\\u0162\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163 \\u0108\\u014F\\u014B\\u0163\\u0113\\u014B\\u0163\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=[[[\\u01A4\\u0105\\u010B\\u0137\\u0105\\u011F\\u0113 \\u014B\\u0105\\u0271\\u0113 \\u014B\\u0113\\u0113\\u018C\\u015F \\u0163\\u014F \\u015F\\u0163\\u0105\\u0157\\u0163 \\u0175\\u012F\\u0163\\u0125 \\u0163\\u0125\\u0113 \\u015F\\u0105\\u0271\\u0113 \\u014B\\u0105\\u0271\\u0113\\u015F\\u03C1\\u0105\\u010B\\u0113 \\u0105\\u015F \\u0163\\u0125\\u0113 \\u012C\\u010E \\u015F\\u0125\\u014F\\u0175\\u014B \\u012F\\u014B \\u018C\\u012F\\u0105\\u013A\\u014F\\u011F \\u0163\\u012F\\u0163\\u013A\\u0113\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=[[[\\u01A4\\u0105\\u010B\\u0137\\u0105\\u011F\\u0113 \\u0192\\u014F\\u0157 \\u0113\\u014B\\u0163\\u012F\\u0163\\u0177 {0} \\u0271\\u0171\\u015F\\u0163 \\u014B\\u014F\\u0163 \\u0125\\u0105\\u028B\\u0113 \\u0105 \\u014B\\u0105\\u0271\\u0113\\u015F\\u03C1\\u0105\\u010B\\u0113.]]]\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=[[[\\u014E\\u03C1\\u0113\\u0157\\u0105\\u0163\\u012F\\u014F\\u014B \\u0125\\u0105\\u015F \\u0183\\u0113\\u0113\\u014B \\u010B\\u0105\\u014B\\u010B\\u0113\\u013A\\u013A\\u0113\\u018C.\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=[[[\\u014E\\u03C1\\u0113\\u0157\\u0105\\u0163\\u012F\\u014F\\u014B \\u0125\\u0105\\u015F \\u0183\\u0113\\u0113\\u014B \\u010B\\u0105\\u014B\\u010B\\u0113\\u013A\\u013A\\u0113\\u018C.\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=[[[\\u0162\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163 \\u0100\\u03C1\\u03C1\\: {0}]]]\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=[[[\\u0162\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163 \\u0108\\u0105\\u0163\\u0105\\u013A\\u014F\\u011F\\: {0}]]]\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=[[[\\u0162\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163 \\u0122\\u0157\\u014F\\u0171\\u03C1\\: {0}]]]\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=[[[\\u0162\\u0157\\u0105\\u014B\\u015F\\u03C1\\u014F\\u0157\\u0163 \\u0158\\u014F\\u013A\\u0113\\: {0}]]]\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=[[[\\u015C\\u014F\\u0157\\u0157\\u0177 \\u0175\\u0113 \\u010B\\u014F\\u0171\\u013A\\u018C \\u014B\\u014F\\u0163 \\u010B\\u014F\\u014B\\u014B\\u0113\\u010B\\u0163 \\u0163\\u014F \\u0163\\u0125\\u0113 \\u015F\\u0113\\u0157\\u028B\\u0113\\u0157. \\u01A4\\u013A\\u0113\\u0105\\u015F\\u0113 \\u0163\\u0157\\u0177 \\u0105\\u011F\\u0105\\u012F\\u014B \\u013A\\u0105\\u0163\\u0113\\u0157.\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=[[[\\u012C\\u014B\\u0163\\u0113\\u0157\\u014B\\u0105\\u013A \\u015F\\u0113\\u0157\\u028B\\u0113\\u0157 \\u0113\\u0157\\u0157\\u014F\\u0157\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=[[[\\u01A4\\u0105\\u010B\\u0137\\u0105\\u011F\\u0113 \\u014B\\u014F\\u0163 \\u0192\\u014F\\u0171\\u014B\\u018C\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_en_US_saptrc.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=ydklXkfN72kjL/RKaId8EQ_Package\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Q9f2o4sOvsUhKQQSmPlkbg_Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=DJSEZj1F/URm6xNgEYlw7A_Put all subsequent objects of the same package into the selected transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=+ZOTHKLjDAZnhlvGMMC4lQ_Local Object\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=oCT0G8nIrxNYz7Za1Y2jjA_OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=zw16mmO/tfT2FiQFVvl3qg_Cancel\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=mjHwdbnVSsfuA9UuEF0kfw_Transport Content\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=nGvC8uKYuqa+Iiw2+pJF7Q_Package name needs to start with the same namespace as the ID shown in dialog title\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=jzl8CMdhi7PzAiUQrAdcJA_Package for entity {0} must not have a namespace.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=tFXrgqyoRLaOLHBH+BD0KQ_Operation has been cancelled.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=pbS2yciMNf2l00XNBv9vDg_Operation has been cancelled.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=zyYfhWmEV3jPdbsh5uPUuQ_Transport App\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=j5GIhou2C4xhqe6jihuiyg_Transport Catalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=RGtMf/3KALQNR6OLvUmOYA_Transport Group\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=ERJJJH/J2AXGhyc/SaOkmQ_Transport Role\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=FxqF8vN6YPC4d2SeBHG5FA_Sorry we could not connect to the server. Please try again later.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=kGb+bQ4M1BYB2DhneqSrxA_Internal server error\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=fy+ywBSOnj44tCuJZQX5CQ_Package not found\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_es.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paquete\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transporte\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Colocar los siguientes objetos del mismo paquete en el transporte seleccionado\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Objeto local\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Cancelar\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Contenido de transporte\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=El nombre del paquete debe empezar por la misma \\u00E1rea de nombres que el ID visualizado en el t\\u00EDtulo del di\\u00E1logo\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=El paquete de la entidad {0} no puede tener ning\\u00FAn \\u00E1rea de nombres.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operaci\\u00F3n cancelada\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operaci\\u00F3n cancelada\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplicaci\\u00F3n de transporte\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Cat\\u00E1logo de transporte\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Grupo de transporte\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Rol de transporte\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=No se puede establecer ninguna conexi\\u00F3n con el servidor. Vuelva a intentarlo m\\u00E1s tarde\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Error interno del servidor\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=No se ha encontrado el paquete\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_et.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakett\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transpordi\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Paigutage k\\u00F5ik sama paketi j\\u00E4rjestikused objektid valitud transporti\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Kohalik objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=T\\u00FChista\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transpordi sisu\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Paketi nimi peab algama sama nimeruumiga, mis on dialoogi tiitlis kuvatud ID-l\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Olemi {0} paketil ei tohi olla nimeruumi.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Toiming on t\\u00FChistatud.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Toiming on t\\u00FChistatud.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transpordi rakendus\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transpordi kataloog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transpordi grupp\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transpordi roll\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Me ei saanud kahjuks serveriga \\u00FChendust luua. Proovige hiljem uuesti.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Sisemine serverit\\u00F5rge\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paketti ei leitud\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_fi.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paketti\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Siirto\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Sis\\u00E4llyt\\u00E4 kaikki seuraavat saman paketin objektit valittuun siirtoon\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Paikallinen objekti\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Keskeyt\\u00E4\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Siirron sis\\u00E4lt\\u00F6\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Paketin nimen t\\u00E4ytyy alkaa samalla nimialueella kuin dialogin otsikossa n\\u00E4ytetty tunnus\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paketilla oliolle {0} ei saa olla nimialuetta.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Tapahtuma keskeytettiin.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Tapahtuma keskeytettiin.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Siirtosovellus\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Siirtoluettelo\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Siirtoryhm\\u00E4\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Siirtorooli\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Palvelimeen ei voida muodostaa yhteytt\\u00E4. Yrit\\u00E4 my\\u00F6hemmin uudelleen.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Sis\\u00E4inen palvelimen virhe\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pakettia ei l\\u00F6ytynyt\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_fr.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Package\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Enregistrer tous les objets suivants du m\\u00EAme package dans le transport s\\u00E9lectionn\\u00E9\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Objet local\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Interrompre\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Contenu du transport\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Le nom du package doit commencer par le m\\u00EAme espace nom que celui de l\'ID affich\\u00E9e dans le titre du dialogue.\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Le package pour l\'\'entit\\u00E9 {0} ne doit avoir aucun espace nom.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=L\'op\\u00E9ration a \\u00E9t\\u00E9 interrompue.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=L\'op\\u00E9ration a \\u00E9t\\u00E9 interrompue.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Application de transport\\u00A0\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Catalogue de transport\\u00A0\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Groupe de transports\\u00A0\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=R\\u00F4le de transport\\u00A0\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Connexion impossible avec le serveur. R\\u00E9essayez ult\\u00E9rieurement.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Erreur de serveur interne\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Package non trouv\\u00E9\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_hi.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u092A\\u0948\\u0915\\u0947\\u091C\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u091A\\u092F\\u0928\\u093F\\u0924 \\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u092E\\u0947\\u0902 \\u0938\\u092E\\u093E\\u0928 \\u092A\\u0948\\u0915\\u0947\\u091C \\u0915\\u0947 \\u0938\\u092D\\u0940 \\u0905\\u0928\\u0941\\u0935\\u0930\\u094D\\u0924\\u0940 \\u0911\\u092C\\u094D\\u091C\\u0947\\u0915\\u094D\\u091F \\u0930\\u0916\\u0947\\u0902\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u0938\\u094D\\u0925\\u093E\\u0928\\u0940\\u092F \\u0911\\u092C\\u094D\\u091C\\u0947\\u0915\\u094D\\u091F\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u0920\\u0940\\u0915\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0930\\u0926\\u094D\\u0926 \\u0915\\u0930\\u0947\\u0902\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u0938\\u093E\\u092E\\u0917\\u094D\\u0930\\u0940\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u092A\\u0948\\u0915\\u0947\\u091C \\u0928\\u093E\\u092E \\u0938\\u0902\\u0935\\u093E\\u0926 \\u0936\\u0940\\u0930\\u094D\\u0937\\u0915 \\u092E\\u0947\\u0902 ID \\u0926\\u093F\\u0916\\u093E\\u0928\\u0947 \\u0915\\u0947 \\u0930\\u0942\\u092A \\u092E\\u0947\\u0902 \\u0938\\u092E\\u093E\\u0928 \\u0928\\u093E\\u092E \\u0938\\u094D\\u0925\\u093E\\u0928 \\u0915\\u0947 \\u0938\\u093E\\u0925 \\u0906\\u0930\\u0902\\u092D \\u0915\\u0930\\u0928\\u093E \\u091A\\u093E\\u0939\\u093F\\u090F\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u0928\\u093F\\u0915\\u093E\\u092F {0} \\u0915\\u0947 \\u0932\\u093F\\u090F \\u092A\\u0948\\u0915\\u0947\\u091C \\u0915\\u093E \\u0928\\u093E\\u092E \\u0938\\u094D\\u0925\\u093E\\u0928 \\u0928\\u0939\\u0940\\u0902 \\u0939\\u094B\\u0928\\u093E \\u091A\\u093E\\u0939\\u093F\\u090F.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u0938\\u0902\\u091A\\u093E\\u0932\\u0928 \\u0930\\u0926\\u094D\\u0926 \\u0915\\u093F\\u092F\\u093E \\u0917\\u092F\\u093E.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u0938\\u0902\\u091A\\u093E\\u0932\\u0928 \\u0930\\u0926\\u094D\\u0926 \\u0915\\u093F\\u092F\\u093E \\u0917\\u092F\\u093E.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u090F\\u092A\\u094D\\u0932\\u093F\\u0915\\u0947\\u0936\\u0928\\u0903 {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u0915\\u0948\\u091F\\u0932\\u0949\\u0917\\u0903 {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u0938\\u092E\\u0942\\u0939\\u0903 {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u092A\\u0930\\u093F\\u0935\\u0939\\u0928 \\u092D\\u0942\\u092E\\u093F\\u0915\\u093E\\u0903 {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0915\\u094D\\u0937\\u092E\\u093E \\u0915\\u0930\\u0947\\u0902. \\u0939\\u092E \\u0938\\u0930\\u094D\\u0935\\u0930 \\u0915\\u0947 \\u0932\\u093F\\u090F \\u0915\\u0928\\u0947\\u0915\\u094D\\u091F \\u0928\\u0939\\u0940\\u0902 \\u0915\\u0930 \\u0938\\u0915\\u0924\\u0947. \\u0915\\u0943\\u092A\\u092F\\u093E \\u092C\\u093E\\u0926 \\u092E\\u0947\\u0902 \\u092A\\u0941\\u0928\\u0903\\u092A\\u094D\\u0930\\u092F\\u093E\\u0938 \\u0915\\u0930\\u0947\\u0902.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0906\\u0902\\u0924\\u0930\\u093F\\u0915 \\u0938\\u0930\\u094D\\u0935\\u0930 \\u0924\\u094D\\u0930\\u0941\\u091F\\u093F\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u092A\\u0948\\u0915\\u0947\\u091C \\u0928\\u0939\\u0940\\u0902 \\u092E\\u093F\\u0932\\u093E\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_hr.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Stavite sve sljede\\u0107e objekte istog paketa u odabrani transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokalni objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Otka\\u017Ei\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Sadr\\u017Eaj transporta\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Naziv paketa mora zapo\\u010Deti s istim prostorom za naziv kao ID prikazan u naslovu dijaloga\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket za entitet {0} ne smije imati prostor za naziv.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operacija je otkazana.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operacija je otkazana.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplikacija transporta\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Katalog transporta\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Grupa transporta\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Uloga transporta\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Oprostite, nije mogu\\u0107e povezivanje s poslu\\u017Eiteljem. Poku\\u0161ajte ponovno kasnije.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Interna gre\\u0161ka poslu\\u017Eitelja\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket nije na\\u0111en\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_hu.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Csomag\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transzport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Egyazon csomag \\u00F6sszes al\\u00E1bbi objektum\\u00E1nak felv\\u00E9tele a kiv\\u00E1lasztott transzportba\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Helyi objektum\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Megszak\\u00EDt\\u00E1s\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transzporttartalom\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=A csomagn\\u00E9vnek ugyanazzal a n\\u00E9vk\\u00E9szlettel kell kezd\\u0151dnie, mint a dial\\u00F3gusc\\u00EDmben megjelen\\u0151 azonos\\u00EDt\\u00F3\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED={0} entit\\u00E1s csomagj\\u00E1nak nem lehet n\\u00E9vk\\u00E9szlete.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=A m\\u0171velet megszakadt.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=A m\\u0171velet megszakadt.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transzportalkalmaz\\u00E1s\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transzportkatal\\u00F3gus\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transzportcsoport\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transzportszerep\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Nem lehet kapcsol\\u00F3dni a szerverhez. Pr\\u00F3b\\u00E1lkozzon \\u00FAjra k\\u00E9s\\u0151bb.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Bels\\u0151 szerverhiba\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=A csomag nem tal\\u00E1lhat\\u00F3\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_it.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pacchetto\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Trasporto\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Rileva tutti gli oggetti seguenti dello stesso pacchetto nel trasporto selezionato\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Oggetto locale\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Annulla\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Contenuto del trasporto\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Il nome del pacchetto deve iniziare con lo stesso spazio nome di quello dell\'ID visualizzato nel titolo del dialogo\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Il pacchetto per l\'\'entit\\u00E0 {0} non pu\\u00F2 avere spazio nomi.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operazione annullata.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operazione annullata.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=App trasporto\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Catalogo trasporto\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Gruppo di trasporto\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Ruolo di trasporto\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Nessun collegamento possibile al server; riprova pi\\u00F9 tardi.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Errore server interno\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pacchetto non trovato\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_iw.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u05D7\\u05D1\\u05D9\\u05DC\\u05D4\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u05D4\\u05E6\\u05D1 \\u05D0\\u05EA \\u05DB\\u05DC \\u05D4\\u05D0\\u05D5\\u05D1\\u05D9\\u05D9\\u05E7\\u05D8\\u05D9\\u05DD \\u05D4\\u05E2\\u05D5\\u05E7\\u05D1\\u05D9\\u05DD \\u05E9\\u05DC \\u05D0\\u05D5\\u05EA\\u05D4 \\u05D4\\u05D7\\u05D1\\u05D9\\u05DC\\u05D4 \\u05D1\\u05EA\\u05D5\\u05DA \\u05D4\\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8 \\u05D4\\u05E0\\u05D1\\u05D7\\u05E8\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u05D0\\u05D5\\u05D1\\u05D9\\u05D9\\u05E7\\u05D8 \\u05DE\\u05E7\\u05D5\\u05DE\\u05D9\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u05D1\\u05D8\\u05DC\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u05EA\\u05D5\\u05DB\\u05DF \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u05E9\\u05DD \\u05D7\\u05D1\\u05D9\\u05DC\\u05D4 \\u05D7\\u05D9\\u05D9\\u05D1 \\u05DC\\u05D4\\u05EA\\u05D7\\u05D9\\u05DC \\u05D1\\u05D0\\u05D5\\u05EA\\u05D5 \\u05DE\\u05E8\\u05D7\\u05D1 \\u05E9\\u05DE\\u05D5\\u05EA \\u05DB\\u05DE\\u05D5 \\u05D4\\u05D6\\u05D9\\u05D4\\u05D5\\u05D9 \\u05E9\\u05D4\\u05D5\\u05E6\\u05D2 \\u05D1\\u05DB\\u05D5\\u05EA\\u05E8\\u05EA \\u05D4\\u05D3\\u05D9\\u05D0\\u05DC\\u05D5\\u05D2\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u05D0\\u05E1\\u05D5\\u05E8 \\u05E9\\u05D9\\u05D4\\u05D9\\u05D4 \\u05DE\\u05E8\\u05D7\\u05D1 \\u05E9\\u05DE\\u05D5\\u05EA \\u05DC\\u05D7\\u05D1\\u05D9\\u05DC\\u05D4 \\u05E2\\u05D1\\u05D5\\u05E8 \\u05D9\\u05E9\\u05D5\\u05EA {0}.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u05D4\\u05E4\\u05E2\\u05D5\\u05DC\\u05D4 \\u05D1\\u05D5\\u05D8\\u05DC\\u05D4.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u05D4\\u05E4\\u05E2\\u05D5\\u05DC\\u05D4 \\u05D1\\u05D5\\u05D8\\u05DC\\u05D4.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u05D9\\u05D9\\u05E9\\u05D5\\u05DD \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u05E7\\u05D8\\u05DC\\u05D5\\u05D2 \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\\u05D9\\u05DD\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u05E7\\u05D1\\u05D5\\u05E6\\u05EA \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\\u05D9\\u05DD\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u05EA\\u05E4\\u05E7\\u05D9\\u05D3 \\u05D8\\u05E8\\u05E0\\u05E1\\u05E4\\u05D5\\u05E8\\u05D8\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u05DE\\u05E6\\u05D8\\u05E2\\u05E8\\u05D9\\u05DD, \\u05DC\\u05D0 \\u05E0\\u05D9\\u05EA\\u05DF \\u05D4\\u05D9\\u05D4 \\u05DC\\u05D4\\u05EA\\u05D7\\u05D1\\u05E8 \\u05DC\\u05E9\\u05E8\\u05EA. \\u05E0\\u05E1\\u05D4 \\u05E9\\u05D5\\u05D1 \\u05DE\\u05D0\\u05D5\\u05D7\\u05E8 \\u05D9\\u05D5\\u05EA\\u05E8.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u05E9\\u05D2\\u05D9\\u05D0\\u05EA \\u05E9\\u05E8\\u05EA \\u05E4\\u05E0\\u05D9\\u05DE\\u05D9\\u05EA\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u05DC\\u05D0 \\u05E0\\u05DE\\u05E6\\u05D0\\u05D4 \\u05D7\\u05D1\\u05D9\\u05DC\\u05D4\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ja.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u79FB\\u9001\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u540C\\u3058\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\\u306E\\u5F8C\\u7D9A\\u30AA\\u30D6\\u30B8\\u30A7\\u30AF\\u30C8\\u3092\\u9078\\u629E\\u3057\\u305F\\u79FB\\u9001\\u306B\\u8FFD\\u52A0\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u30ED\\u30FC\\u30AB\\u30EB\\u30AA\\u30D6\\u30B8\\u30A7\\u30AF\\u30C8\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u53D6\\u6D88\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u30B3\\u30F3\\u30C6\\u30F3\\u30C4\\u3092\\u79FB\\u9001\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\\u540D\\u306F\\u30C0\\u30A4\\u30A2\\u30ED\\u30B0\\u30BF\\u30A4\\u30C8\\u30EB\\u306B\\u8868\\u793A\\u3055\\u308C\\u308B ID \\u3068\\u540C\\u3058\\u540D\\u79F0\\u9818\\u57DF\\u3067\\u958B\\u59CB\\u3059\\u308B\\u5FC5\\u8981\\u304C\\u3042\\u308A\\u307E\\u3059\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u30A8\\u30F3\\u30C6\\u30A3\\u30C6\\u30A3 {0} \\u306E\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\\u306B\\u306F\\u540D\\u79F0\\u9818\\u57DF\\u3092\\u6307\\u5B9A\\u3067\\u304D\\u307E\\u305B\\u3093\\u3002\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u64CD\\u4F5C\\u304C\\u53D6\\u308A\\u6D88\\u3055\\u308C\\u307E\\u3057\\u305F\\u3002\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u64CD\\u4F5C\\u304C\\u53D6\\u308A\\u6D88\\u3055\\u308C\\u307E\\u3057\\u305F\\u3002\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u30A2\\u30D7\\u30EA\\u306E\\u79FB\\u9001\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u30AB\\u30BF\\u30ED\\u30B0\\u306E\\u79FB\\u9001\\:  {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u30B0\\u30EB\\u30FC\\u30D7\\u306E\\u79FB\\u9001\\:  {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u30ED\\u30FC\\u30EB\\u306E\\u79FB\\u9001\\:  {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u30B5\\u30FC\\u30D0\\u306B\\u63A5\\u7D9A\\u3067\\u304D\\u307E\\u305B\\u3093\\u3067\\u3057\\u305F\\u3002\\u5F8C\\u3067\\u518D\\u8A66\\u884C\\u3057\\u3066\\u304F\\u3060\\u3055\\u3044\\u3002\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u5185\\u90E8\\u30B5\\u30FC\\u30D0\\u30A8\\u30E9\\u30FC\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u30D1\\u30C3\\u30B1\\u30FC\\u30B8\\u304C\\u898B\\u3064\\u304B\\u308A\\u307E\\u305B\\u3093\\u3067\\u3057\\u305F\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_kk.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u0411\\u0443\\u043C\\u0430\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B\\u0434\\u0430\\u0443\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u0411\\u0456\\u0440 \\u0431\\u0443\\u043C\\u0430\\u043D\\u044B\\u04A3 \\u0431\\u0430\\u0440\\u043B\\u044B\\u049B \\u043A\\u0435\\u043B\\u0435\\u0441\\u0456 \\u044D\\u043B\\u0435\\u043C\\u0435\\u043D\\u0442\\u0442\\u0435\\u0440\\u0456\\u043D \\u0442\\u0430\\u04A3\\u0434\\u0430\\u043B\\u0493\\u0430\\u043D \\u0442\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B\\u0493\\u0430 \\u049B\\u043E\\u0441\\u0443\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u0416\\u0435\\u0440\\u0433\\u0456\\u043B\\u0456\\u043A\\u0442\\u0456 \\u043D\\u044B\\u0441\\u0430\\u043D\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0411\\u043E\\u043B\\u0434\\u044B\\u0440\\u043C\\u0430\\u0443\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B \\u043C\\u0430\\u0437\\u043C\\u04B1\\u043D\\u044B\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u0411\\u0443\\u043C\\u0430 \\u0430\\u0442\\u0430\\u0443\\u044B \\u0434\\u0438\\u0430\\u043B\\u043E\\u0433 \\u0442\\u0430\\u049B\\u044B\\u0440\\u044B\\u0431\\u044B\\u043D\\u0434\\u0430 \\u043A\\u04E9\\u0440\\u0441\\u0435\\u0442\\u0456\\u043B\\u0433\\u0435\\u043D \\u0438\\u0434-\\u043C\\u0435\\u043D \\u0431\\u0456\\u0440\\u0434\\u0435\\u0439 \\u0430\\u0442\\u0430\\u0443 \\u0430\\u0443\\u043C\\u0430\\u0493\\u044B\\u043D \\u0431\\u0430\\u0441\\u0442\\u0430\\u043B\\u0443\\u044B \\u0442\\u0438\\u0456\\u0441\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED={0} \\u044D\\u043B\\u0435\\u043C\\u0435\\u043D\\u0442\\u0456\\u043D\\u0456\\u04A3 \\u0431\\u0443\\u043C\\u0430\\u0441\\u044B\\u043D\\u0434\\u0430 \\u0430\\u0442\\u0430\\u0443 \\u0430\\u0439\\u043C\\u0430\\u0493\\u044B \\u0431\\u043E\\u043B\\u043C\\u0430\\u0443 \\u043A\\u0435\\u0440\\u0435\\u043A.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0438\\u044F\\u0434\\u0430\\u043D \\u0431\\u0430\\u0441 \\u0442\\u0430\\u0440\\u0442\\u044B\\u043B\\u0434\\u044B.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0438\\u044F\\u0434\\u0430\\u043D \\u0431\\u0430\\u0441 \\u0442\\u0430\\u0440\\u0442\\u044B\\u043B\\u0434\\u044B.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B \\u049B\\u043E\\u043B\\u0434\\u0430\\u043D\\u0431\\u0430\\u0441\\u044B\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\u0456\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B \\u0442\\u043E\\u0431\\u044B\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u0422\\u0430\\u0441\\u044B\\u043C\\u0430\\u043B \\u0440\\u04E9\\u043B\\u0456 {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0421\\u0435\\u0440\\u0432\\u0435\\u0440\\u0433\\u0435 \\u049B\\u043E\\u0441\\u044B\\u043B\\u0443 \\u043C\\u04AF\\u043C\\u043A\\u0456\\u043D \\u0431\\u043E\\u043B\\u043C\\u0430\\u0434\\u044B. \\u04D8\\u0440\\u0435\\u043A\\u0435\\u0442\\u0442\\u0456 \\u043A\\u0435\\u0439\\u0456\\u043D \\u049B\\u0430\\u0439\\u0442\\u0430\\u043B\\u0430\\u04A3\\u044B\\u0437.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0406\\u0448\\u043A\\u0456 \\u0441\\u0435\\u0440\\u0432\\u0435\\u0440 \\u049B\\u0430\\u0442\\u0435\\u0441\\u0456\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u0411\\u0443\\u043C\\u0430 \\u0442\\u0430\\u0431\\u044B\\u043B\\u043C\\u0430\\u0434\\u044B\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ko.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\uD328\\uD0A4\\uC9C0\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\uC804\\uC1A1\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\uB3D9\\uC77C\\uD55C \\uD328\\uD0A4\\uC9C0\\uC758 \\uBAA8\\uB4E0 \\uD6C4\\uC18D \\uC624\\uBE0C\\uC81D\\uD2B8\\uB97C \\uC120\\uD0DD\\uD55C \\uC804\\uC1A1\\uC5D0 \\uBC30\\uCE58\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\uB85C\\uCEEC \\uC624\\uBE0C\\uC81D\\uD2B8\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\uD655\\uC778\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\uCDE8\\uC18C\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\uCEE8\\uD150\\uD2B8 \\uC804\\uC1A1\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\uD328\\uD0A4\\uC9C0 \\uC774\\uB984\\uC740 \\uB2E4\\uC774\\uC5BC\\uB85C\\uADF8 \\uC81C\\uBAA9\\uC5D0 \\uD45C\\uC2DC\\uB41C ID\\uC640 \\uB3D9\\uC77C\\uD55C \\uB124\\uC784\\uC2A4\\uD398\\uC774\\uC2A4\\uB85C \\uC2DC\\uC791\\uD574\\uC57C \\uD569\\uB2C8\\uB2E4.\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\uC5D4\\uD2F0\\uD2F0 {0}\\uC5D0 \\uB300\\uD55C \\uD328\\uD0A4\\uC9C0\\uC5D0\\uB294 \\uB124\\uC784\\uC2A4\\uD398\\uC774\\uC2A4\\uAC00 \\uC5C6\\uC5B4\\uC57C \\uD569\\uB2C8\\uB2E4.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\uC791\\uC5C5\\uC774 \\uCDE8\\uC18C\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\uC791\\uC5C5\\uC774 \\uCDE8\\uC18C\\uB418\\uC5C8\\uC2B5\\uB2C8\\uB2E4.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\uC571 \\uC804\\uC1A1\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\uCE74\\uD0C8\\uB85C\\uADF8 \\uC804\\uC1A1\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\uADF8\\uB8F9 \\uC804\\uC1A1\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\uC5ED\\uD560 \\uC804\\uC1A1\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\uC8C4\\uC1A1\\uD569\\uB2C8\\uB2E4. \\uC11C\\uBC84\\uC5D0 \\uC5F0\\uACB0\\uD560 \\uC218 \\uC5C6\\uC2B5\\uB2C8\\uB2E4. \\uB098\\uC911\\uC5D0 \\uB2E4\\uC2DC \\uC2DC\\uB3C4\\uD558\\uC2ED\\uC2DC\\uC624.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\uB0B4\\uBD80 \\uC11C\\uBC84 \\uC624\\uB958\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\uD328\\uD0A4\\uC9C0\\uAC00 \\uC5C6\\uC2B5\\uB2C8\\uB2E4.\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_lt.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paketas\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Perk\\u0117limas\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Pekelkite visus to paties paketo paskesnius objektus \\u012F pasirinkt\\u0105 perk\\u0117lim\\u0105\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Vietinis objektas\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=Gerai\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=At\\u0161aukti\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Perk\\u0117limo turinys\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Paketas turi prasid\\u0117ti tokia pa\\u010Dia vard\\u0173 sritimi kaip ID, rodomas dialogo lango antra\\u0161t\\u0117je\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Elemento {0} paketas negali tur\\u0117ti vard\\u0173 srities.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operacija at\\u0161aukta.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operacija at\\u0161aukta.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Perk\\u0117limo programa\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Perk\\u0117limo katalogas\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Perk\\u0117limo grup\\u0117\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Perk\\u0117limo vaidmuo\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Deja, prie serverio prisijungti nepavyko. Pabandykite dar kart\\u0105 v\\u0117liau.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Vidin\\u0117 serverio klaida\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paketas nerastas\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_lv.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakotne\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\\u0113t\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Ielikt visus vienas pakotnes n\\u0101kamos objektus atlas\\u012Btaj\\u0101 transport\\u0113\\u0161an\\u0101\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lok\\u0101lais objekts\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=Labi\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Atcelt\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transport\\u0113\\u0161anas saturs\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Pakotnes nosaukumam ir j\\u0101s\\u0101kas ar to pa\\u0161u nosaukumvietu k\\u0101 ID, kas par\\u0101d\\u012Bts dialogloga virsrakst\\u0101\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Ent\\u012Btijas {0} pakotnei nedr\\u012Bkst b\\u016Bt nosaukumvietas.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Darb\\u012Bba tika atcelta.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Darb\\u012Bba tika atcelta.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transport\\u0113\\u0161anas lietojumprogramma\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transport\\u0113\\u0161anas katalogs\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transport\\u0113\\u0161anas grupa\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transport\\u0113\\u0161anas loma\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Diem\\u017E\\u0113l nevar\\u0113ja izveidot savienojumu ar serveri. L\\u016Bdzu, v\\u0113l\\u0101k m\\u0113\\u0123iniet v\\u0113lreiz.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Iek\\u0161\\u0113ja servera k\\u013C\\u016Bda\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pakotne nav atrasta\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ms.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakej\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Pindahan\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Letkkan semua objek dari pakej sama berikutan ke dalam pemindahan dipilih\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Objek Setempat\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Batal\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Kandungan Pemindahan\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Nama pakej mesti bermula dengan ruang nama sama seperti ID yang ditunjukkan dalam tajuk dialog\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Pakej untuk entiti {0} mesti tidak mempunyai ruang nama.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operasi telah dibatalkan.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operasi telah dibatalkan.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Pindahkan Aplikasi\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Pindahkan Katalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Pindahkan Kumpulan\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Pindahkan Fungsi\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Maaf, kami tidak dapat sambung ke pelayan. Sila cuba sebentar lagi.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Ralat pelayan dalaman\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pakej tidak ditemui\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_nl.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Alle volgende objecten van zelfde pakket in geselecteerd transport opnemen\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokaal object\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Afbreken\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transportcontent\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Pakketnaam moet met zelfde namengebied beginnen als in dialoogtitel weergegeven ID\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Pakket voor entiteit {0} mag geen namengebied hebben.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operatie is afgebroken\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operatie is afgebroken\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transport-app\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transportcatalogus\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transportgroep\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transportrol\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Geen verbinding met server mogelijk; probeer later opnieuw\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Internal Server Error\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pakket niet gevonden\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_no.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakke\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Overf\\u00F8ring\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Inkluder alle f\\u00F8lgende objekter for samme pakke i valgt overf\\u00F8ring\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokalt objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Avbryt\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Overf\\u00F8ringsinnhold\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Pakkenavn m\\u00E5 starte med samme navneomr\\u00E5de som ID-en vist i dialogtittel\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Pakke for entitet {0} kan ikke ha noe navneomr\\u00E5de.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operasjon er avbrutt\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operasjon er avbrutt\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Overf\\u00F8ringsapp\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Overf\\u00F8ringskatalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Overf\\u00F8ringsgruppe\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Overf\\u00F8ringsrolle\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Ingen forbindelse til serveren mulig. Fors\\u00F8k igjen senere.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Intern serverfeil\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Finner ikke pakken\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_pl.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pakiet\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Do\\u0142\\u0105czanie wszystkich nast\\u0119puj\\u0105cych obiekt\\u00F3w z tego samego pakietu do wybranego transportu\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Obiekt lokalny\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Zaniechanie\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Zawarto\\u015B\\u0107 transportu\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Nazwa pakietu musi si\\u0119 rozpoczyna\\u0107 od tej samej przestrzeni nazw co ID wy\\u015Bwietlony w tytule okna dialogowego\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Pakiet dla encji {0} nie mo\\u017Ce zawiera\\u0107 przestrzeni nazw.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Przerwano operacj\\u0119.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Przerwano operacj\\u0119.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplikacja transportowa\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Katalog transportowy\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Grupa transportowa\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Rola transportowa\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Po\\u0142\\u0105czenie z serwerem nie jest mo\\u017Cliwe. Prosz\\u0119 spr\\u00F3bowa\\u0107 ponownie p\\u00F3\\u017Aniej.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Wewn\\u0119trzny b\\u0142\\u0105d serwera\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Nie znaleziono pakietu\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_pt.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pacote\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transporte\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Transferir todos os objetos seguintes do mesmo pacote para o transporte selecionado\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Objeto local\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Cancelar\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Conte\\u00FAdo de transporte\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=O nome do pacote deve iniciar com o mesmo espa\\u00E7o de nomes que o ID exibido no t\\u00EDtulo do di\\u00E1logo\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=O pacote para a entidade {0} n\\u00E3o pode ter nenhum espa\\u00E7o de nomes.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=A opera\\u00E7\\u00E3o foi cancelada.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=A opera\\u00E7\\u00E3o foi cancelada.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=App de transporte\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Cat\\u00E1logo de transporte\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Grupo de transporte\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Fun\\u00E7\\u00E3o de transporte\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=N\\u00E3o \\u00E9 poss\\u00EDvel efetuar conex\\u00E3o com o servidor. Tentar de novo mais tarde.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Internal server error\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pacote n\\u00E3o encontrado\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ro.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Pachet\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Pune\\u0163i toate obiecte succesive din acela\\u015Fi pachet \\u00EEn transport selectat\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Obiect local\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Anulare\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Con\\u0163inut transport\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Nume pachet trebuie s\\u0103 \\u00EEnceap\\u0103 cu acela\\u015Fi spa\\u0163iu de nume ca ID afi\\u015Fat \\u00EEn titlu dialog\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Pachetul pt. entitatea {0} nu trebuie s\\u0103 aib\\u0103 un spa\\u021Biu de nume.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Opera\\u0163ie a fost anulat\\u0103.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Opera\\u0163ie a fost anulat\\u0103.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transport aplic.\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transport catalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transport grup\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transport rol\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Ne pare r\\u0103u, nu ne-am putut conecta la server. Re\\u00EEncerca\\u0163i mai t\\u00E2rziu.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Eroare server intern\\u0103\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Pachet neg\\u0103sit\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_ru.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u041F\\u0430\\u043A\\u0435\\u0442\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u041F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u0412\\u043A\\u043B\\u044E\\u0447\\u0438\\u0442\\u044C \\u0432\\u0441\\u0435 \\u0441\\u043B\\u0435\\u0434\\u0443\\u044E\\u0449\\u0438\\u0435 \\u043E\\u0431\\u044A\\u0435\\u043A\\u0442\\u044B \\u043F\\u0430\\u043A\\u0435\\u0442\\u0430 \\u0432 \\u0432\\u044B\\u0431\\u0440\\u0430\\u043D\\u043D\\u044B\\u0439 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441.\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u041B\\u043E\\u043A\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u043E\\u0431\\u044A\\u0435\\u043A\\u0442\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u041E\\u041A\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u041E\\u0442\\u043C\\u0435\\u043D\\u0438\\u0442\\u044C\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u0421\\u043E\\u0434\\u0435\\u0440\\u0436\\u0438\\u043C\\u043E\\u0435 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\\u0430\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u0418\\u043C\\u044F \\u043F\\u0430\\u043A\\u0435\\u0442\\u0430 \\u0434\\u043E\\u043B\\u0436\\u043D\\u043E \\u043D\\u0430\\u0447\\u0438\\u043D\\u0430\\u0442\\u044C\\u0441\\u044F \\u0441 \\u043E\\u0431\\u043B\\u0430\\u0441\\u0442\\u0438 \\u0438\\u043C\\u0435\\u043D, \\u043A\\u0430\\u043A \\u0432 \\u0438\\u0434\\u0435\\u043D\\u0442\\u0438\\u0444\\u0438\\u043A\\u0430\\u0442\\u043E\\u0440\\u0435 \\u0432 \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043A\\u0435 \\u0434\\u0438\\u0430\\u043B\\u043E\\u0433\\u0430\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u041F\\u0430\\u043A\\u0435\\u0442 \\u0434\\u043B\\u044F \\u0441\\u0443\\u0449\\u043D\\u043E\\u0441\\u0442\\u0438 {0} \\u043D\\u0435 \\u043C\\u043E\\u0436\\u0435\\u0442 \\u0438\\u043C\\u0435\\u0442\\u044C \\u043E\\u0431\\u043B\\u0430\\u0441\\u0442\\u0438 \\u0438\\u043C\\u0435\\u043D.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0438\\u044F \\u043E\\u0442\\u043C\\u0435\\u043D\\u0435\\u043D\\u0430.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0438\\u044F \\u043E\\u0442\\u043C\\u0435\\u043D\\u0435\\u043D\\u0430.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u041F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\\u0430\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u041A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\\u0430\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u0413\\u0440\\u0443\\u043F\\u043F\\u0430 \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\\u0430\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u0420\\u043E\\u043B\\u044C \\u043F\\u0435\\u0440\\u0435\\u043D\\u043E\\u0441\\u0430\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0421\\u043E\\u0435\\u0434\\u0438\\u043D\\u0435\\u043D\\u0438\\u0435 \\u0441 \\u0441\\u0435\\u0440\\u0432\\u0435\\u0440\\u043E\\u043C \\u043D\\u0435\\u0432\\u043E\\u0437\\u043C\\u043E\\u0436\\u043D\\u043E. \\u041F\\u043E\\u0432\\u0442\\u043E\\u0440\\u0438\\u0442\\u0435 \\u043F\\u043E\\u043F\\u044B\\u0442\\u043A\\u0443 \\u043F\\u043E\\u0437\\u0434\\u043D\\u0435\\u0435.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0412\\u043D\\u0443\\u0442\\u0440\\u0435\\u043D\\u043D\\u044F\\u044F \\u043E\\u0448\\u0438\\u0431\\u043A\\u0430 \\u0441\\u0435\\u0440\\u0432\\u0435\\u0440\\u0430\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u041F\\u0430\\u043A\\u0435\\u0442 \\u043D\\u0435 \\u043D\\u0430\\u0439\\u0434\\u0435\\u043D\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_sh.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Postavite sve slede\\u0107e objekte istog paketa u odabrani transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokalni objekat\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Odustani\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Sadr\\u017Eaj transporta\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Naziv paketa mora po\\u010Dinjati istim prostorom za ime kao ID prikazan u naslovu dijaloga\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket za entitet {0} ne sme da ima prostor za ime.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Operacija je otkazana.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Operacija je otkazana.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplikacija transporta\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Katalog transporta\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Grupa transporta\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Uloga transporta\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Na\\u017Ealost, povezivanje sa serverom nije mogu\\u0107e. Poku\\u0161ajte ponovo kasnije.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Interna gre\\u0161ka servera\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket nije na\\u0111en\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_sk.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=V\\u0161etky nasleduj\\u00FAce objekty z rovnak\\u00E9ho paketu zahrn\\u00FA\\u0165 do zvolen\\u00E9ho transportu\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lok\\u00E1lny objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Zru\\u0161i\\u0165\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Obsah transportu\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=N\\u00E1zov paketu mus\\u00ED za\\u010D\\u00EDna\\u0165 rovnak\\u00FDm rozsahom n\\u00E1zvov ako ID zobrazen\\u00E9 v nadpise dial\\u00F3gov\\u00E9ho okna\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket pre entitu {0} nesmie ma\\u0165 rozsah n\\u00E1zvov.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Oper\\u00E1cia bola zru\\u0161en\\u00E1.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Oper\\u00E1cia bola zru\\u0161en\\u00E1.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplik\\u00E1cia transportu\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Katal\\u00F3g transportu\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Skupina transportu\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Rola transportu\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Spojenie so serverom nie je mo\\u017En\\u00E9. Sk\\u00FAste to znova nesk\\u00F4r.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Intern\\u00E1 chyba servera \n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket nebol n\\u00E1jden\\u00FD\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_sl.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Prevzem vseh naslednjih objektov istega paketa v izbrani transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokalni objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Prekinitev\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Vsebina transporta\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Ime paketa se mora za\\u010Deti z istim imenskim prostorom kot ID, prikazan v naslovu pogovornega okna\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket za entiteto {0} ne sme imeti imenskega prostora.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Postopek je bil prekinjen.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Postopek je bil prekinjen.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Aplikacija za transport\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Katalog za transport\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Skupina transportov\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Vloga transporta\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Povezava s stre\\u017Enika ni mogo\\u010Da. Prosim, poskusite znova pozneje.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Interna napaka stre\\u017Enika\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket ni najden\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_sv.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Transport\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Inkludera alla f\\u00F6ljande objekt i samma paket i vald transport\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Lokalt objekt\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Avbryt\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Transportinneh\\u00E5ll\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Paketnamn m\\u00E5ste b\\u00F6rja med samma namnomr\\u00E5de som ID som visas i dialogtitel\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Paket f\\u00F6r entitet {0} f\\u00E5r inte ha n\\u00E5got namnomr\\u00E5de.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Transaktion avbr\\u00F6ts.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Transaktion avbr\\u00F6ts.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Transportapp\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Transportkatalog\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Transportgrupp\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Transportroll\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Anslutning till servern ej m\\u00F6jlig. F\\u00F6rs\\u00F6k igen senare.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Internt serverfel\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket hittades ej\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_th.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u0E41\\u0E1E\\u0E04\\u0E40\\u0E01\\u0E08\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u0E40\\u0E1E\\u0E34\\u0E48\\u0E21\\u0E2D\\u0E2D\\u0E1A\\u0E40\\u0E08\\u0E04\\u0E17\\u0E35\\u0E48\\u0E15\\u0E32\\u0E21\\u0E21\\u0E32\\u0E17\\u0E31\\u0E49\\u0E07\\u0E2B\\u0E21\\u0E14\\u0E02\\u0E2D\\u0E07\\u0E41\\u0E1E\\u0E04\\u0E40\\u0E01\\u0E08\\u0E40\\u0E14\\u0E35\\u0E22\\u0E27\\u0E01\\u0E31\\u0E19\\u0E43\\u0E19\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\u0E17\\u0E35\\u0E48\\u0E40\\u0E25\\u0E37\\u0E2D\\u0E01\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u0E2D\\u0E2D\\u0E1A\\u0E40\\u0E08\\u0E04\\u0E20\\u0E32\\u0E22\\u0E43\\u0E19\\u0E40\\u0E04\\u0E23\\u0E37\\u0E48\\u0E2D\\u0E07\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u0E15\\u0E01\\u0E25\\u0E07\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0E22\\u0E01\\u0E40\\u0E25\\u0E34\\u0E01\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u0E40\\u0E19\\u0E37\\u0E49\\u0E2D\\u0E2B\\u0E32\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E41\\u0E1E\\u0E04\\u0E40\\u0E01\\u0E08\\u0E15\\u0E49\\u0E2D\\u0E07\\u0E40\\u0E23\\u0E34\\u0E48\\u0E21\\u0E15\\u0E49\\u0E19\\u0E14\\u0E49\\u0E27\\u0E22 Namespace \\u0E40\\u0E14\\u0E35\\u0E22\\u0E27\\u0E01\\u0E31\\u0E19\\u0E01\\u0E31\\u0E1A ID \\u0E17\\u0E35\\u0E48\\u0E41\\u0E2A\\u0E14\\u0E07\\u0E43\\u0E19\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E44\\u0E14\\u0E2D\\u0E30\\u0E25\\u0E2D\\u0E01\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u0E41\\u0E1E\\u0E04\\u0E40\\u0E01\\u0E08\\u0E2A\\u0E33\\u0E2B\\u0E23\\u0E31\\u0E1A\\u0E40\\u0E2D\\u0E19\\u0E17\\u0E34\\u0E15\\u0E35\\u0E49 {0} \\u0E15\\u0E49\\u0E2D\\u0E07\\u0E44\\u0E21\\u0E48\\u0E21\\u0E35 Namespace\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u0E22\\u0E01\\u0E40\\u0E25\\u0E34\\u0E01\\u0E01\\u0E32\\u0E23\\u0E14\\u0E33\\u0E40\\u0E19\\u0E34\\u0E19\\u0E01\\u0E32\\u0E23\\u0E41\\u0E25\\u0E49\\u0E27\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u0E22\\u0E01\\u0E40\\u0E25\\u0E34\\u0E01\\u0E01\\u0E32\\u0E23\\u0E14\\u0E33\\u0E40\\u0E19\\u0E34\\u0E19\\u0E01\\u0E32\\u0E23\\u0E41\\u0E25\\u0E49\\u0E27\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u0E41\\u0E2D\\u0E1E\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u0E41\\u0E04\\u0E15\\u0E15\\u0E32\\u0E25\\u0E47\\u0E2D\\u0E01\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u0E01\\u0E25\\u0E38\\u0E48\\u0E21\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u0E1A\\u0E17\\u0E1A\\u0E32\\u0E17\\u0E01\\u0E32\\u0E23\\u0E17\\u0E23\\u0E32\\u0E19\\u0E2A\\u0E1B\\u0E2D\\u0E23\\u0E4C\\u0E15\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0E02\\u0E2D\\u0E2D\\u0E20\\u0E31\\u0E22 \\u0E44\\u0E21\\u0E48\\u0E2A\\u0E32\\u0E21\\u0E32\\u0E23\\u0E16\\u0E40\\u0E0A\\u0E37\\u0E48\\u0E2D\\u0E21\\u0E15\\u0E48\\u0E2D\\u0E01\\u0E31\\u0E1A\\u0E40\\u0E0B\\u0E34\\u0E23\\u0E4C\\u0E1F\\u0E40\\u0E27\\u0E2D\\u0E23\\u0E4C\\u0E44\\u0E14\\u0E49 \\u0E01\\u0E23\\u0E38\\u0E13\\u0E32\\u0E25\\u0E2D\\u0E07\\u0E2D\\u0E35\\u0E01\\u0E04\\u0E23\\u0E31\\u0E49\\u0E07\\u0E20\\u0E32\\u0E22\\u0E2B\\u0E25\\u0E31\\u0E07\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0E02\\u0E49\\u0E2D\\u0E1C\\u0E34\\u0E14\\u0E1E\\u0E25\\u0E32\\u0E14\\u0E20\\u0E32\\u0E22\\u0E43\\u0E19\\u0E02\\u0E2D\\u0E07\\u0E40\\u0E0B\\u0E34\\u0E23\\u0E4C\\u0E1F\\u0E40\\u0E27\\u0E2D\\u0E23\\u0E4C\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u0E44\\u0E21\\u0E48\\u0E1E\\u0E1A\\u0E41\\u0E1E\\u0E04\\u0E40\\u0E01\\u0E08\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_tr.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=Paket\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=Ta\\u015F\\u0131ma\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=Ayn\\u0131 paketin t\\u00FCm sonraki nesnelerini se\\u00E7ilen ta\\u015F\\u0131maya dahil et\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=Yerel nesne\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=Tamam\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0130ptal et\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=Ta\\u015F\\u0131ma i\\u00E7eri\\u011Fi\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=Pket ad\\u0131, diyalog ba\\u015Fl\\u0131\\u011F\\u0131nda g\\u00F6r\\u00FCnt\\u00FClenen tan\\u0131t\\u0131c\\u0131 ile ayn\\u0131 ad alan\\u0131 ile ba\\u015Flamal\\u0131d\\u0131r\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED={0} birimi i\\u00E7in paket, ad alan\\u0131na sahip olamaz.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u0130\\u015Flem iptal edildi.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u0130\\u015Flem iptal edildi.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=Ta\\u015F\\u0131ma uygulamas\\u0131\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Ta\\u015F\\u0131ma katalo\\u011Fu\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Ta\\u015F\\u0131ma grubu\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Ta\\u015F\\u0131ma rol\\u00FC\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=Sunucu ile ba\\u011Flant\\u0131 olanakl\\u0131 de\\u011Fil. Daha sonra tekrar deneyin.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=Dahili sunucu hatas\\u0131\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Paket bulunamad\\u0131\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_uk.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u041F\\u0430\\u043A\\u0435\\u0442\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u0422\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\\u0443\\u0432\\u0430\\u043D\\u043D\\u044F\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u0420\\u043E\\u0437\\u043C\\u0456\\u0441\\u0442\\u0438\\u0442\\u0438 \\u0432\\u0441\\u0456 \\u043F\\u043E\\u0441\\u043B\\u0456\\u0434\\u043E\\u0432\\u043D\\u0456 \\u043E\\u0431\'\\u0454\\u043A\\u0442\\u0438 \\u043E\\u0434\\u043D\\u043E\\u0433\\u043E \\u043F\\u0430\\u043A\\u0435\\u0442\\u0430 \\u0443 \\u0432\\u0438\\u0431\\u0440\\u0430\\u043D\\u043E\\u043C\\u0443 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\\u0456\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u041B\\u043E\\u043A\\u0430\\u043B\\u044C\\u043D\\u0438\\u0439 \\u043E\\u0431\'\\u0454\\u043A\\u0442\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u0421\\u043A\\u0430\\u0441\\u0443\\u0432\\u0430\\u0442\\u0438\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u0412\\u043C\\u0456\\u0441\\u0442 \\u0442\\u0440\\u0430\\u043D\\u0441\\u043F\\u043E\\u0440\\u0442\\u0443\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u0406\\u043C\'\\u044F \\u043F\\u0430\\u043A\\u0435\\u0442\\u0430 \\u043C\\u0430\\u0454 \\u043F\\u043E\\u0447\\u0438\\u043D\\u0430\\u0442\\u0438\\u0441\\u044C \\u0437 \\u0442\\u043E\\u0433\\u043E \\u0436 \\u043F\\u0440\\u043E\\u0441\\u0442\\u043E\\u0440\\u0443 \\u0456\\u043C\\u0435\\u043D, \\u0449\\u043E \\u0439 \\u0406\\u0414, \\u0432\\u043A\\u0430\\u0437\\u0430\\u043D\\u0438\\u0439 \\u0443 \\u0437\\u0430\\u0433\\u043E\\u043B\\u043E\\u0432\\u043A\\u0443 \\u0434\\u0456\\u0430\\u043B\\u043E\\u0433\\u0443\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u041F\\u0430\\u043A\\u0435\\u0442 \\u0441\\u0443\\u0442\\u043D\\u043E\\u0441\\u0442\\u0456 {0} \\u043D\\u0435 \\u043C\\u043E\\u0436\\u0435 \\u043C\\u0430\\u0442\\u0438 \\u043F\\u0440\\u043E\\u0441\\u0442\\u043E\\u0440\\u0443 \\u0456\\u043C\\u0435\\u043D.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0456\\u0457 \\u0441\\u043A\\u0430\\u0441\\u043E\\u0432\\u0430\\u043D\\u043E.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u041E\\u043F\\u0435\\u0440\\u0430\\u0446\\u0456\\u0457 \\u0441\\u043A\\u0430\\u0441\\u043E\\u0432\\u0430\\u043D\\u043E.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u041F\\u0435\\u0440\\u0435\\u043D\\u0435\\u0441\\u0442\\u0438 \\u0437\\u0430\\u0441\\u0442\\u043E\\u0441\\u0443\\u043D\\u043E\\u043A\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u041F\\u0435\\u0440\\u0435\\u043D\\u0435\\u0441\\u0442\\u0438 \\u043A\\u0430\\u0442\\u0430\\u043B\\u043E\\u0433\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u041F\\u0435\\u0440\\u0435\\u043D\\u0435\\u0441\\u0442\\u0438 \\u0433\\u0440\\u0443\\u043F\\u0443\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u041F\\u0435\\u0440\\u0435\\u043D\\u0435\\u0441\\u0442\\u0438 \\u0440\\u043E\\u043B\\u044C\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u0412\\u0438\\u0431\\u0430\\u0447\\u0442\\u0435, \\u043D\\u0435 \\u0432\\u0434\\u0430\\u043B\\u043E\\u0441\\u044F \\u0437\\u0432\'\\u044F\\u0437\\u0430\\u0442\\u0438\\u0441\\u044C \\u0437 \\u0441\\u0435\\u0440\\u0432\\u0435\\u0440\\u043E\\u043C. \\u0421\\u043F\\u0440\\u043E\\u0431\\u0443\\u0439\\u0442\\u0435 \\u0437\\u043D\\u043E\\u0432\\u0443 \\u043F\\u0456\\u0437\\u043D\\u0456\\u0448\\u0435.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u0412\\u043D\\u0443\\u0442\\u0440\\u0456\\u0448\\u043D\\u044F \\u043F\\u043E\\u043C\\u0438\\u043B\\u043A\\u0430 \\u0441\\u0435\\u0440\\u0432\\u0435\\u0440\\u0430\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u041F\\u0430\\u043A\\u0435\\u0442 \\u043D\\u0435 \\u0437\\u043D\\u0430\\u0439\\u0434\\u0435\\u043D\\u043E\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_vi.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=G\\u00F3i\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=V\\u1EADn chuy\\u1EC3n\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u0110\\u0103\\u0323t t\\u00E2\\u0301t ca\\u0309 \\u0111\\u00F4\\u0301i t\\u01B0\\u01A1\\u0323ng k\\u00EA\\u0301 ti\\u00EA\\u0301p cu\\u0309a cu\\u0300ng go\\u0301i va\\u0300o chuy\\u00EA\\u0309n ta\\u0309i \\u0111a\\u0303 cho\\u0323n\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u0110\\u00F4\\u0301i t\\u01B0\\u01A1\\u0323ng cu\\u0323c b\\u00F4\\u0323\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=OK\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=Hu\\u0309y\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=N\\u00F4\\u0323i dung chuy\\u00EA\\u0309n ta\\u0309i\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=T\\u00EAn go\\u0301i pha\\u0309i b\\u0103\\u0301t \\u0111\\u00E2\\u0300u b\\u0103\\u0300ng cu\\u0300ng vu\\u0300ng t\\u00EAn nh\\u01B0 ID \\u0111\\u01B0\\u01A1\\u0323c hi\\u00EA\\u0309n thi\\u0323 trong ti\\u00EAu \\u0111\\u00EA\\u0300 h\\u00F4\\u0323i thoa\\u0323i\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=Go\\u0301i cho th\\u01B0\\u0323c th\\u00EA\\u0309 {0} pha\\u0309i kh\\u00F4ng co\\u0301 vu\\u0300ng t\\u00EAn.\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=Hoa\\u0323t \\u0111\\u00F4\\u0323ng \\u0111a\\u0303 bi\\u0323 hu\\u0309y.\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=Hoa\\u0323t \\u0111\\u00F4\\u0323ng \\u0111a\\u0303 bi\\u0323 hu\\u0309y.\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u01AF\\u0301ng du\\u0323ng chuy\\u00EA\\u0309n ta\\u0309i\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=Danh mu\\u0323c chuy\\u00EA\\u0309n ta\\u0309i\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=Nho\\u0301m chuy\\u00EA\\u0309n ta\\u0309i\\: {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=Vai tro\\u0300 chuy\\u00EA\\u0309n ta\\u0309i\\: {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=R\\u00E2\\u0301t ti\\u00EA\\u0301c, chu\\u0301ng t\\u00F4i kh\\u00F4ng th\\u00EA\\u0309 k\\u00EA\\u0301t n\\u00F4\\u0301i \\u0111\\u00EA\\u0301n ma\\u0301y chu\\u0309. Vui lo\\u0300ng th\\u01B0\\u0309 la\\u0323i sau.\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=L\\u00F4\\u0303i n\\u00F4\\u0323i ta\\u0323i cu\\u0309a ma\\u0301y chu\\u0309\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=Kh\\u00F4ng ti\\u0300m th\\u00E2\\u0301y go\\u0301i\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_zh_CN.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u5305\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u4F20\\u8F93\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u5C06\\u540C\\u4E00\\u4E2A\\u5305\\u7684\\u6240\\u6709\\u540E\\u7EED\\u5BF9\\u8C61\\u7F6E\\u5165\\u6240\\u9009\\u4F20\\u8F93\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u672C\\u5730\\u5BF9\\u8C61\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u786E\\u5B9A\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u53D6\\u6D88\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u4F20\\u8F93\\u5185\\u5BB9\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u5305\\u540D\\u79F0\\u5FC5\\u987B\\u4EE5\\u4E0E\\u5BF9\\u8BDD\\u6846\\u6807\\u9898\\u4E2D\\u6240\\u793A\\u6807\\u8BC6\\u76F8\\u540C\\u7684\\u547D\\u540D\\u7A7A\\u95F4\\u5F00\\u5934\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u5B9E\\u4F53 {0} \\u7684\\u5305\\u4E0D\\u5F97\\u5177\\u6709\\u547D\\u540D\\u7A7A\\u95F4\\u3002\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u64CD\\u4F5C\\u5DF2\\u53D6\\u6D88\\u3002\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u64CD\\u4F5C\\u5DF2\\u53D6\\u6D88\\u3002\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u4F20\\u8F93\\u5E94\\u7528\\u7A0B\\u5E8F\\uFF1A {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u4F20\\u8F93\\u76EE\\u5F55\\uFF1A {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u4F20\\u8F93\\u7EC4\\uFF1A {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u4F20\\u8F93\\u89D2\\u8272\\uFF1A {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u62B1\\u6B49\\uFF0C\\u65E0\\u6CD5\\u8FDE\\u63A5\\u5230\\u670D\\u52A1\\u5668\\u3002\\u8BF7\\u7A0D\\u540E\\u91CD\\u8BD5\\u3002\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u5185\\u90E8\\u670D\\u52A1\\u5668\\u9519\\u8BEF\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u672A\\u627E\\u5230\\u5305\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/i18n/i18n_zh_TW.properties":'#Resource bundle of diagnostic plugin for UI adaptation at runtime\n#\n\n#XFLD: Text for Label: Package\nLABEL_TITLE_PACKAGE=\\u5957\\u4EF6\n\n#XFLD: Text for Label: Transport\nLABEL_TITLE_TRANSPORT=\\u50B3\\u8F38\n\n#XFLD: Text for CheckBox\nCHKBOX_TXT_BATCHOBJECTS=\\u5C07\\u76F8\\u540C\\u5957\\u4EF6\\u7684\\u6240\\u6709\\u5F8C\\u7E8C\\u7269\\u4EF6\\u7F6E\\u65BC\\u6240\\u9078\\u50B3\\u8F38\\u4E2D\n\n#XBUT: Text for Button: Local Object\nBTN_TITLE_LOCALOBJECT=\\u672C\\u6A5F\\u7269\\u4EF6\n\n#XBUT: Text for Button: OK\nBTN_TITLE_OK=\\u78BA\\u5B9A\n\n#XBUT: Text for Button: Cancel\nBTN_TITLE_CANCEL=\\u53D6\\u6D88\n\n#XTIT: Text for Transport Dialog Title\nDLG_TITLE_DEFAULTNAME=\\u50B3\\u8F38\\u5167\\u5BB9\n\n#YMSG: Text for Error Message\nERROR_WRONGNAMESPACE=\\u5957\\u4EF6\\u540D\\u7A31\\u5FC5\\u9808\\u4F7F\\u7528\\u8207\\u5C0D\\u8A71\\u6A19\\u984C\\u4E2D\\u986F\\u793A\\u7684 ID \\u76F8\\u540C\\u7684\\u540D\\u7A31\\u7A7A\\u9593\\u70BA\\u958B\\u982D\n\n#YMSG: Text for Error Message\nERROR_NAMESPACENOTALLOWED=\\u5BE6\\u9AD4 {0} \\u7684\\u5957\\u4EF6\\u4E0D\\u53EF\\u6709\\u540D\\u7A31\\u7A7A\\u9593\\u3002\n\n#YMSG: Text Message when promise is rejected\nMSG_SINGLECANCEL=\\u5DF2\\u53D6\\u6D88\\u4F5C\\u696D\n\n#YMSG: Text Message when promise is rejected\nMSG_ALLPOPUPSCANCELLED=\\u5DF2\\u53D6\\u6D88\\u4F5C\\u696D\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_APPDESCR_VARIANT=\\u50B3\\u8F38\\u61C9\\u7528\\u7A0B\\u5F0F\\uFF1A {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_CATALOG=\\u50B3\\u8F38\\u76EE\\u9304\\uFF1A {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_GROUP=\\u50B3\\u8F38\\u7FA4\\u7D44\\uFF1A {0}\n\n#XTIT: Text for Transport Dialog\nDLG_TITLE_ROLE=\\u50B3\\u8F38\\u898F\\u5247\\uFF1A {0}\n\n#YMSG: Text for Error Message\nERROR_REQUESTFAILED=\\u62B1\\u6B49\\uFF0C\\u7121\\u6CD5\\u9023\\u7DDA\\u5230\\u4F3A\\u670D\\u5668\\uFF1B\\u8ACB\\u518D\\u8A66\\u4E00\\u6B21\n\n#YMSG: Text for Error Message HTTP500\nERROR_HTTP500=\\u5167\\u90E8\\u4F3A\\u670D\\u5668\\u932F\\u8AA4\n\n#YMSG: Text for Error Message HTTP404\nERROR_HTTP404=\\u627E\\u4E0D\\u5230\\u5957\\u4EF6\n',
	"sap/ushell_abap/plugins/fcc-transport-ui/manifest.json":'{\n  "_version": "1.5.0",\n  "sap.app": {\n    "id": "sap.ushell_abap.plugins.fcc-transport-ui",\n    "type": "application",\n    "i18n": "i18n/i18n.properties",\n    "applicationVersion": {\n      "version": "1.0.0"\n    },\n    "title": "Transport UI",\n    "description": "Transport Popup for FCC",\n    "resources": "resources.json",\n    "ach": "CA-UI2-INT-BE"\n  },\n\n  "sap.ui": {\n    "technology": "UI5",\n    "deviceTypes": {\n      "desktop": true,\n      "tablet": true,\n      "phone": true\n    },\n    "supportedThemes": [\n      "sap_hcb",\n      "sap_belize"\n    ]\n  },\n\n  "sap.flp": {\n    "type": "plugin"\n  },\n\n\n  "sap.ui5": {\n    "dependencies": {\n      "minUI5Version": "1.44.0",\n      "libs": {\n        "sap.ui.core": {},\n        "sap.m": {},\n        "sap.ui.layout": {}\n      }\n    },\n    "contentDensities": {\n      "compact": true,\n      "cozy": true\n    },\n    "models": {\n      "i18n": {\n        "type": "sap.ui.model.resource.ResourceModel",\n        "settings": {\n          "bundleName": "sap.ushell_abap.plugins.fcc-transport-ui.i18n.i18n"\n        }\n      }\n    },\n    "resources": {\n      "css": [{\n        "uri": "css/style.css"\n      }]\n    }\n  }\n}',
	"sap/ushell_abap/plugins/fcc-transport-ui/model/models.js":function(){sap.ui.define([ "sap/ui/model/json/JSONModel", "sap/ui/Device" ], function(
		JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});
}
}});
