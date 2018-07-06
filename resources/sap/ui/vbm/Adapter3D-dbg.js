/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.vbm.Adapter3D
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Element", "sap/ui/base/ManagedObjectObserver",
	"sap/ui/unified/Menu", "sap/ui/unified/MenuItem", "sap/m/ResponsivePopover",
	"sap/ui/vbm/Viewport", "./adapter3d/ObjectFactory", "./adapter3d/VBIJSONParser",
	"./adapter3d/SceneBuilder", "./adapter3d/Utilities", "sap/m/HBox", "sap/m/VBox", "sap/m/Link",
	"sap/m/Button", "sap/m/Text", "sap/m/Image", "./adapter3d/thirdparty/three"
], function(jQuery, library, Element, Observer, Menu, MenuItem, Popover, Viewport,
	ObjectFactory, Parser, SceneBuilder, Utilities, HBox, VBox, Link, Button, Text, Image, THREE) {
	"use strict";

	var thisModule = "sap.ui.vbm.adapter3d.Adapter3D";
	var log        = jQuery.sap.log;
	var toBoolean  = Utilities.toBoolean;
	var applyColor = Utilities.applyColor;

	// Forward declaration;
	var viewportEventDelegate;

	/**
	 * Constructor for a new Visual Business Adapter 3D.
	 *
	 * @class
	 * Provides the ability to load VBI JSON into {@link sap.ui.vbm.Viewport sap.ui.vbm.Viewport} control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @author SAP SE
	 * @version 1.54.4
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Adapter3D
	 */
	var Adapter3D = Element.extend("sap.ui.vbm.Adapter3D", /** @lends sap.ui.vbm.Adapter3D.prototype */ {
		metadata: {
			library: "sap.ui.vbm",

			associations: {
				/**
				 * The {@link sap.ui.vbm.Viewport Viewport} control associated with the Adapter3D.
				 * The Adapter3D would invoke methods and subscribe to events on this {@link sap.ui.vbm.Viewport Viewport} instance.
				 */
				viewport: {
					type: "sap.ui.vbm.Viewport"
				}
			},

			events: {
				/**
				 * This event is fired when interactions in the viewport happen.
				 */
				submit: {
					parameters: {
						/**
						 * A string in the VBI JSON format.
						 */
						data: {
							type: "string"
						}
					}
				}
			}
		}
	});

	var basePrototype = Adapter3D.getMetadata().getParent().getClass().prototype;

	Adapter3D.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		// A strong reference to the associated viewport. It is used to track if the viewport association changed.
		// The viewport association will be checked in each call to the Adapter3D.load() method and updated properly.
		this._viewport = null;

		// The structure that contains all VBI JSON data fully resolved.
		// This structure is shared between VBIJSONParser and SceneBuilder.
		this._context = {
			// A map with resource names as keys and resource content as values.
			// Resource content is a strinh that can be a Collada xml or base64 encoded image.
			// This map is shared between VBIJSONParser and SceneBuilder.
			// It is populated by VBIJSONParser and consumed by SceneBuilder.
			resources: new Map(),

			// An array of data types. See dataTypePrototype and dataTypeAttributePrototype in ObjectFactory.js.
			dataTypes: [],

			// A set of data node objects. The property names in this object are data node names. The data structure is recursive.
			// Data nodes are implemented as arrays of data instances. Data instances are simple JSON-like objects.
			// Data instances have properties of the string type. Properties of the array type are child data nodes.
			// E.g.:
			// {
			//     "DetailData": [                            // node
			//         {                                      //   instance
			//             "Column": [                        //     node
			//                 { "Text": "Height" },          //       instance
			//                 { "Text": "Width" },           //       instance
			//                 ...                            //       instances
			//             ]
			//         },
			//         {                                      //   instance
			//             "Column": [                        //      node
			//                 ...                            //        instances
			//             ]
			//         }
			//     ],
			//     "Boxes": [                                 // node
			//         {                                      //   instance
			//             "Color": "ARGB(255,153,209,1)",
			//             "GeoPosition": "-3.375;0.0;1.2E0",
			//             ...
			//         },
			//         ...                                    //   instances
			//     ],
			//     ...                                        // nodes
			// }
			data: {},

			// An array of window objects. A window object can be 3D Window or Detail Window.
			windows: [],

			// An array of scene objects. There are two types of scenes supported in Adapter3D - 3D scene and Detail Window scene.
			scenes: [],

			// An array of actions. The elements of this array are references to the original actions in VBI JSON.
			actions: [],

			// Each queue contains per scene list of visual object to process.
			// The scenes are identified by their ID. IDs are used as property names in toAdd, toUpdate and toRemove.
			voQueues: {
				toAdd:    new Map(), // scene -> array of visual objects to add
				toUpdate: new Map(), // scene -> array of visual objects to update.
				toRemove: new Map()  // scene -> array of visual objects to remove.
			},

			// Each queue contains a list of scenes to add, update or remove.
			sceneQueues: {
				toAdd:    [],
				toUpdate: [],
				toRemove: []
			},

			// Each queue contains a list of windows to add, update or remove.
			windowQueues: {
				toAdd:    [],
				toUpdate: [],
				toRemove: []
			},

			// true when most recent payload contains 3d scene with camera setup instructions
			setupView: false
		};

		// An instance of VBIJSONParser.
		this._parser = null;

		// An instance of SceneBuilder.
		this._sceneBuilder = null;

		// The last instance that mouse hovered over.
		this._lastHoverInstance = null;

		// The pending hover handler call timer
		this._hoverTimeOutId = null;

		// The timer ID to clear the first click to prevent two clicks instead of double click.
		this._clickTimerId = null;

		this._mouseDown = false;
		this._lastXY = { x: 0, y: 0 };

		// We will the observer to disconnect from destroyed viewports.
		this._viewportObserver = new Observer(this._observeChanges.bind(this));

		// active detail window context
		this._detail = {
			popover: undefined, // UI5 responsive popover control
			anchor: undefined, // anchor DOM element to display responsive popover
			pending: undefined // pending popover, if viewport hasnot been rendered yet
		};
	};

	Adapter3D.prototype.exit = function() {
		if (this._clickTimerId) {
			jQuery.sap.clearDelayedCall(this._clickTimerId);
			this._clickTimerId = null;
		}

		if (this._hoverTimeOutId) {
			clearTimeout(this._hoverTimeOutId);
			this._hoverTimeOutId = null;
		}

		this._disconnectViewport();

		this._viewportObserver.disconnect();
		this._viewportObserver = null;

		if (this._sceneBuilder) {
			this._sceneBuilder.destroy();
			this._sceneBuilder = null;
		}

		if (this._parser) {
			this._parser.destroy();
			this._parser = null;
		}

		// The content connector will be destroyed automatically by the base class of this adapter
		// as part of the 'dependent' aggregation.
		this._context = null;

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	/**
	 * Gets the scene's root node.
	 *
	 * @returns {Promise} A Promise object that resolves with the scene's root node.
	 * @private
	 */
	Adapter3D.prototype._getSceneRoot = function() {
		return this._viewport.getRoot();
	};

	// Override the auto-generated setter to suppress invalidation and to connect to the associated viewport.
	Adapter3D.prototype.setViewport = function(viewport) {
		this.setAssociation("viewport", viewport, true);
		this._configureViewport();
		return this;
	};

	/**
	 * Updates the connection to the associated viewport.
	 *
	 * @returns {sap.ui.vbm.Adapter3D} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter3D.prototype._configureViewport = function() {
		// sap.ui.getCore().byId() does not define what it returns when it cannot find an element by ID,
		// the current implementation returns undefined, so coalesce the return value with null for predictable results.
		var associatedViewport = sap.ui.getCore().byId(this.getViewport()) || null;
		if (associatedViewport !== this._viewport) {
			this._disconnectViewport();
			this._viewport = associatedViewport;
			this._connectViewport();
		}
		return this;
	};

	/**
	 * Connects the associated viewport to the adapter's content connector and view state manager.
	 * Subscribes to events from the associated viewport.
	 *
	 * @returns {sap.ui.vbm.Adapter3D} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter3D.prototype._connectViewport = function() {
		if (this._viewport) {
			this._viewportObserver.observe(this._viewport, { destroy: true });
			this._viewport.addEventDelegate(viewportEventDelegate, this);
		}
		return this;
	};

	/**
	 * Unsubscribes from events from the associated viewport.
	 * Disconnects the associated viewport from the adapter's content connector and view state manager.
	 *
	 * @returns {sap.ui.vbm.Adapter3D} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter3D.prototype._disconnectViewport = function() {
		if (this._viewport) {
			this._viewport.removeEventDelegate(viewportEventDelegate);
			// onBeforeRendering unsubscribes from DOM events.
			viewportEventDelegate.onBeforeRendering.call(this);
			this._viewportObserver.unobserve(this._viewport, { destroy: true });
			this._viewport = null;
		}
		return this;
	};

	/**
	 * Observes changes in the viewport associated with the adapter.
	 * If the viewport is about to be destroyed the adapter disconnects from the viewport.
	 *
	 * @param {object} change The changes that caused this call.
	 * @private
	 */
	Adapter3D.prototype._observeChanges = function(change) {
		if (change.type === 'destroy' && change.object === this._viewport) {
			this._disconnectViewport();
		}
	};

	/**
	 * Processes the various sections from the VBI JSON.
	 *
	 * The Resources, DataTypes, Scenes and Data sections from the VBI JSON are sequentially processed.
	 * Processing of the Data section would eventually lead to change in the content resources.
	 *
	 * @param {object|string} data The VBI JSON.
	 * @returns {Promise} A Promise object that is resolved when the VBI JSON is processed.
	 * @public
	 */
	Adapter3D.prototype.load = function(data) {
		var that = this;
		// If the adapter was created before the associated viewport then the adapter might not be connected to the viewport.
		// In case if the associated viewport is destroyed that call will disconnect from the viewport.
		that._configureViewport();
		// no viewport available -> nothing to do
		if (!that._viewport) {
			return Promise.reject();
		}

		var payload = null;
		var root = that._getSceneRoot();

		if (!that._parser) {
			that._parser = new Parser(that._context);
		}

		if (!that._sceneBuilder) {
			that._sceneBuilder = new SceneBuilder(that._context, root, that._viewport.getCameraController());
		}

		if (typeof data === "string") {
			try {
				payload = JSON.parse(data);
			} catch (ex) {
				log.error("sap.ui.vbm.Adapter: attempt to load invalid JSON string.");
				return Promise.resolve();
			}
		} else if (typeof data === "object") {
			payload = data;
		}

		if (!(payload && payload.SAPVB)) {
			log.error("sap.ui.vbm.Adapter3D: attempt to load null.");
			return Promise.resolve();
		}

		that._parser.loadVBIJSON(payload);

		return that._sceneBuilder.synchronize().then(function() {
			// further processing after scenes has been updated
			that._processAutomation(payload);
			that._processDetailWindow();
			// clear before next update
			that._context.voQueues.toAdd.clear();
			that._context.voQueues.toUpdate.clear();
			that._context.voQueues.toRemove.clear();
			that._context.sceneQueues.toAdd.splice(0);
			that._context.sceneQueues.toUpdate.splice(0);
			that._context.sceneQueues.toRemove.splice(0);
			that._context.windowQueues.toAdd.splice(0);
			that._context.windowQueues.toUpdate.splice(0);
			that._context.windowQueues.toRemove.splice(0);
		});
	};

	Adapter3D.prototype._processDetailWindow = function(payload) {
		// show first only detail window from toAdd queue
		// ignore all other detail windows as we can show only one at a time in compare to ActiveX implementation
		var window = sap.ui.vbm.findInArray(this._context.windowQueues.toAdd, function(window) {
			return window.type === "callout";
		});

		var scene = window && sap.ui.vbm.findInArray(this._context.scenes, function(scene) {
			return scene.id === window.refScene;
		});

		if (window && scene) {
			this._closeDetailWindow(); // close active detail window first if any
			var popover = this._createDetailWindow(window);
			this._fillDetailWindow(popover, scene);
			this._openDetailWindow(popover, window);
		}
	};

	Adapter3D.prototype._closeDetailWindow = function() {
		if (this._detail.popover) {
			this._detail.popover.close();
			this._detail.popover.destroy();
			this._detail.popover = undefined;
		}
		if (this._detail.anchor) {
			this._detail.anchor.style.visibility = "hidden"; // hide anchor element
		}
	};

	Adapter3D.prototype._createDetailWindow = function(window) {
		var customHeader;

		if (window.caption !== "") {
			var customHeaderText = new sap.m.Text({
				width: "100%",
				textAlign: sap.ui.core.TextAlign.Center,
				text: window.caption,
				tooltip: window.caption
			});

			customHeader = new sap.m.Bar({
				contentLeft: [customHeaderText]
			});
		}

		var popover = new sap.m.ResponsivePopover({
			placement: sap.m.PlacementType.Auto,
			showCloseButton: true,
			verticalScrolling: true,
			contentWidth: window.width + "px" //,
			//contentHeight: window.height + "px"
		});

		popover.addStyleClass("sapUiVbmDetailWindow");

		if (customHeader) {
			popover.setCustomHeader(customHeader);
		}
		return popover;
	};

	Adapter3D.prototype._getAnchor = function(x,y) {
		if (!this._detail.anchor) {
			var anchor = document.createElement("div");
			anchor.classList.add("sapUiVbmDetailWindowAnchor");
			this._viewport.getDomRef().appendChild(anchor);
			this._detail.anchor = anchor;
		}
		this._detail.anchor.style.left = x + "px";
		this._detail.anchor.style.top = y + "px";

		return this._detail.anchor;
	};

	Adapter3D.prototype._openDetailWindow = function(popover, definition) {
		var pos = definition.pos.split(";");
		var world = new THREE.Vector3(parseFloat(pos[0]), parseFloat(pos[1]), parseFloat(pos[2]));

		if (!this._viewport.getDomRef()) {
			if (this._detail.pending) {
				this._detail.pending.popover.destroy();
			}
			this._detail.pending = {
				world: world,
				popover: popover
			};
		} else {
			// make sure anchor point is always within viewport boundaries
			var rect = this._viewport.getDomRef().getBoundingClientRect();
			var screen = this._viewport.worldToScreen(Utilities.vbToThreeJs(world));

			screen.x = Utilities.clamp(screen.x, 5, rect.width - 5);
			screen.y = Utilities.clamp(screen.y, 5, rect.height - 5);

			popover.openBy(this._getAnchor(screen.x, screen.y));
			popover.attachAfterClose(function() {
				this._closeDetailWindow();
			}.bind(this));
			this._detail.popover = popover;
		}
	};

	Adapter3D.prototype._openDetailPending = function() {
		if (this._detail.pending && this._viewport.getDomRef()) {
			var screen = this._viewport.worldToScreen(Utilities.vbToThreeJs(this._detail.pending.world));
			this._detail.pending.popover.openBy(this._getAnchor(screen.x, screen.y));
			this._detail.popover = this._detail.pending.popover;
			this._detail.pending = undefined;
		}
	};

	Adapter3D.prototype._fillDetailWindow = function(popover, scene) {
		var alignToFlexJustify = function(align) {
			var alignment;
            switch (align) {
                case "1":
                alignment = sap.m.FlexJustifyContent.Start;
                break;

                case "2":
                alignment = sap.m.FlexJustifyContent.Center;
                break;

                case "4":
                alignment = sap.m.FlexJustifyContent.End;
                break;

                default:
                alignment = sap.m.FlexJustifyContent.Inherit;
                break;
			}
			return alignment;
		};

		var processItem = function(item) {
            var obj;
            switch (item.type) {
                case "{00100000-2013-1000-1100-50059A6A47FA}": // Sub Caption
                    obj = new Text({
                        text: item.vo.text,
                        tooltip: item.vo.tooltip
                    });
                    obj.addStyleClass("sapUiVbmDetailWindowBase sapUiVbmDetailWindowCaption");

                    if (item.vo.level === "3") {
                        obj.addStyleClass("sapUiVbmDetailWindowCaption3");
                    }
                    break;
                case "{00100000-2013-1000-3700-AD84DDBBB31B}": // Label
                    obj = new Text({
                        text: item.vo.text,
                        tooltip: item.vo.tooltip
                    });
                    obj.addStyleClass("sapUiVbmDetailwindowBase");
                    break;
                case "{00100000-2013-1000-2400-D305F7942B98}": // Link
                    obj = new Link({
                        text: item.vo.text,
                        tooltip: item.vo.tooltip,
                        href: item.vo.autoexecute ? item.vo.reference : ""
                    });
                    obj.addStyleClass("sapUiVbmDetailWindowBase");
                    break;
                case "{00100000-2013-1000-1200-855B919BB0E9}": // Button
                    obj = new Button({
                        text: item.vo.text,
						tooltip: item.vo.tooltip
                    });
                    break;
                case "{00100000-2013-1000-2200-6B060A330B2C}": // Image
                    if (item.vo.image && item.vo.image !== "") {
                        obj = new Image({
                            src: this._context.resources.get(item.vo.image),
                            tooltip: item.vo.tooltip
                        });
                    }
                    break;
                default:
                    log.error("sap.ui.vbm.Adapter3D: attempt to create unknown element of detail window: " + item.type);
            }
            return obj;
        };

		//flatten vos & group by rows
		var itemsByRow = scene.voGroups.map(function(vog) { return vog.vos.map(function(v) { return { type: vog.type, vo: v }; }); })
						.reduce(function(a, b) { return a.concat(b); })
						.sort(function(a, b) { //sort vertically from top to bottom to preserve order
							return parseInt(a.vo.top, 10) - parseInt(b.vo.top, 10);
						}).reduce(function(g, a) {
							var group = a.vo.top ? a.vo.top : "0";
							g[group] = g[group] || [];
							g[group].push(a);
							return g;
						}, {});

		var content = new VBox();

		for (var row in itemsByRow) {
			if (itemsByRow.hasOwnProperty(row)) {
				var box = new HBox({
					width : Math.max.apply(null, itemsByRow[row].map(function(i) { return parseInt(i.vo.right, 10); })) + "px"
                });

				var previousRight = 0;
				itemsByRow[row].sort(function(a, b) {
					return parseInt(a.vo.left, 10) - parseInt(b.vo.left, 10); // sort horizontally from left to right to preserve order
				}).map(function(i) {
					var rowResult = [];
					if ((parseInt(i.vo.left, 10) - previousRight) > 1) {
						rowResult.push(new HBox({
							width: (parseInt(i.vo.left, 10) - previousRight) + "px"
						}));
					}
                    var pBox = new HBox({
                        width: (parseInt(i.vo.right, 10) - parseInt(i.vo.left, 10)) + "px",
                        justifyContent: alignToFlexJustify(i.vo.align)
                    });

					previousRight = parseInt(i.vo.right, 10);
					pBox.addItem(processItem.bind(this)(i));
					rowResult.push(pBox);
                    return rowResult;
				}, this).reduce(function(a,b) { return a.concat(b); })
						.forEach(box.addItem, box);

				content.addItem(box);
			}
		}

		popover.addContent(content);
	};

	// ZUTUN: Move parsing automation to VBIJSONParser. Use parsed data in Adapter3D.
	/**
	 * Processes the automation and Menus sections from the VBI JSON.
	 *
	 * The CONTEXTMENUHANDLER refers to a menu with its ID from the Menus section
	 * of the VBI JSON. This parsed to create a sap.ui.unified.MenuItem with appropriate
	 * event handler attached to each menu item.
	 *
	 * @param {object} payload The VBI JSON.
	 * @returns {sap.ui.vbm.Adapter3D} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter3D.prototype._processAutomation = function(payload) {
		var that = this;

		var processMenuItem = function(menu, currentItem, call, name, separated) {
			var menuItem = new MenuItem({
				text: currentItem.text,
				enabled: currentItem.disabled === "X" ? false : true,
				startsSection: separated,
				select: that._menuItemSelectionHandler.bind(that, currentItem.id, call.instance, name, call.object)
			});

			if (currentItem.MenuItem) {
				var subMenu = new Menu();
				separated = false;
				[].concat(currentItem.MenuItem).forEach(function(mi) {
					if (mi.hasOwnProperty("Separator")) {
						separated = true;
					} else {
						processMenuItem(subMenu, mi, call, name, separated);
						separated = false;
					}
				});
				menuItem.setSubmenu(subMenu);
			}

			menu.addItem(menuItem);
		};

		if (payload && payload.SAPVB && payload.SAPVB.Automation
			&& payload.SAPVB.Automation.Call && payload.SAPVB.Automation.Call) {

			if (payload.SAPVB.Automation.Call.handler
				&& payload.SAPVB.Automation.Call.handler === "CONTEXTMENUHANDLER") {

				var xOffset = [].concat(payload.SAPVB.Automation.Call.Param).filter(function(p) { return p.name === "x"; });
				var yOffset = [].concat(payload.SAPVB.Automation.Call.Param).filter(function(p) { return p.name === "y"; });

				var offset;
				if (xOffset.length > 0 && yOffset.length > 0) {
					offset = xOffset[0]["#"] + " " + yOffset[0]["#"];
				}


				if (payload.SAPVB && payload.SAPVB.Menus
					&& payload.SAPVB.Menus.Set) {

					var menuPayloads = [].concat(payload.SAPVB.Menus.Set).filter(function(m) {
						return m.Menu.id === payload.SAPVB.Automation.Call.refID;
					});

					if (menuPayloads.length > 0) {
						var contextMenu = new Menu();
						var separated = false;
						[].concat(menuPayloads[0].Menu.MenuItem).forEach(function(mi) {
							if (mi.hasOwnProperty("Separator")) {
								separated = true;
							} else {
								processMenuItem(contextMenu, mi, payload.SAPVB.Automation.Call, menuPayloads[0].Menu.action, separated);
								separated = false;
							}
						});

						var dock = sap.ui.core.Popup.Dock;
						contextMenu.open(false, this._viewport, dock.BeginTop, dock.BeginTop, this._viewport, offset);
					}
				}
			}
		}
		return this;
	};

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: Event propagation.

	Adapter3D.prototype._menuItemSelectionHandler = function(id, instance, name, voGroupId) {
		var payload = {
			version    : "2.0",
			"xmlns:VB" : "VB",
			Action     : {
				id        : id,
				instance  : instance,
				name      : name,
				object    : voGroupId
			}
		};
		this.fireSubmit({data: JSON.stringify(payload)});
	};

	Adapter3D.prototype._genericEventHandler = function(name, event) {
		var instance = event.instance;
		var groupId = instance ? instance.voGroup.id : event.voGroupId;
		var actionDefinition = sap.ui.vbm.findInArray(this._context.actions, function(action) { return action.refVO === groupId && action.refEvent === name; });
		if (actionDefinition) {
			var param = [];
			var payload = {
				version: "2.0",
				"xmlns:VB": "VB",
				Action: {
					id: actionDefinition.id,
					name: actionDefinition.name,
					object: actionDefinition.refVO, // The same as groupId.
					instance: instance && instance.id ? instance.voGroup.datasource + "." + instance.id : "",
					Params: {
						Param: param
					}
				}
			};

			if (actionDefinition.name === "KEY_PRESS") {
				if (event.key == "Shift" || event.code == 16 ||
					event.key == "Control" || event.code == 17 ||
					event.key == "Alt" || event.code == 18 ||
					event.key == "Meta" || event.code == 91) {
						return this;
					} else {
						param.push(
							{
								"name": "code",
								"#": event.keyCode
							},
							{
								"name": "shift",
								"#": event.shiftKey
							},
							{
								"name": "ctrl",
								"#": event.ctrlKey
							},
							{
								"name": "alt",
								"#": event.altKey
							},
							{
								"name": "meta",
								"#": event.metaKey
							}
						);
					}
			} else if (event && event.cursor) {
				param.push(
					{
						name: "x",
						"#":  event.cursor.x
					},
					{
						name: "y",
						"#":  event.cursor.y
					}
				);
			}


			if (actionDefinition.AddActionProperty) {
				var actionProperties = [];
				[].concat(actionDefinition.AddActionProperty).forEach(function(actionProperty) {
					switch (actionProperty.name) {
						case "pos":
							if (event.hitPoint) {
								var pos = Utilities.threeJsToVb(event.hitPoint);
								actionProperties.push({
									name: actionProperty.name,
									"#": pos.x + ";" + pos.y + ";" + pos.z
								});
							}
							break;
						default:
							break; // no other additional params are supported yet
					}
				}, this);
				if (actionProperties.length > 0) {
					payload.Action.AddActionProperties = {
						AddActionProperty: actionProperties
					};
				}
			}

			if (instance && name === "Click" && event.selectionChanges) {
				payload.Data = {
					Merge: {
						N: [
							{
								name: instance.voGroup.datasource,
								E: event.selectionChanges.selected.map(function(instance) {
										return {
											K: instance ? instance.id : "",
											"VB:s": "true"
										};
									}).concat(event.selectionChanges.deselected.map(function(instance) {
										return {
											K: instance ? instance.id : "",
											"VB:s": "false"
										};
									}))
							}
						]
					}
				};
			}
			this.fireSubmit({
				data: JSON.stringify(payload)
			});
		}
	};

	Adapter3D.prototype._propagateClick = function(event) {
		this._genericEventHandler("Click", event);
	};

	Adapter3D.prototype._propagateDoubleClick = function(event) {
		this._genericEventHandler("DoubleClick", event);
	};

	Adapter3D.prototype._propagateContextMenu = function(event) {
		this._genericEventHandler("ContextMenu", event);
	};

	Adapter3D.prototype._propagateKeyPress = function(event) {
		// There are no instance and cursor properties in the event parameter as for the keyboard they are irrelevant. (?)
		this._genericEventHandler("KeyPress", event);
	};

	Adapter3D.prototype._propogateHoverChange = function(event) {
		this._genericEventHandler("HoverChange", event);
	};

	Adapter3D.prototype._handleClick = function(event) {
		var instance = event.instance;
		log.info("click", "x: " + event.cursor.x + ", y: " + event.cursor.y + ", instance: " + (instance ? instance.id : "") + ", tooltip: " + (instance ? instance.tooltip : ""), thisModule);

		this._extendEventWithSelection(event);
		if (event.selectionChanges) {
			this._applySelectionChangesToScene3D(event.selectionChanges.selected, event.selectionChanges.deselected);
		}
		this._propagateClick(event);
	};

	Adapter3D.prototype._handleDoubleClick = function(event) {
		var instance = event.instance;
		log.info("double click", "x: " + event.cursor.x + ", y: " + event.cursor.y + ", instance: " + (instance ? instance.id : "") + ", tooltip: " + (instance ? instance.tooltip : ""), thisModule);
		this._propagateDoubleClick(event);
	};

	Adapter3D.prototype._handleContextMenu = function(event) {
		var instance = event.instance;
		if (!instance) {
			// If right-click was on empty space, there is no visual object.
			// But there might be an action defined for an artificial refVO with name 'Scene'.
			event.voGroupId = "Scene";
		}
		log.info("context menu", "x: " + event.cursor.x + ", y: " + event.cursor.y + ", instance: " + (instance ? instance.id : "") + ", tooltip: " + (instance ? instance.tooltip : ""), thisModule);
		this._propagateContextMenu(event);
	};

	Adapter3D.prototype._handleHover = function(event) {
		var tooltip;
		var instance = event.instance;
		log.info("hover", "x: " + event.cursor.x + ", y: " + event.cursor.y + ", instance: " + (instance ? instance.id : "") + ", tooltip: " + (instance ? instance.tooltip : ""), thisModule);
		if (instance) {
			tooltip = instance.tooltip;
			if (!tooltip) {
				tooltip = instance.text;
			}
		}
		var domRef = this._viewport.getDomRef();
		if (domRef) {
			if (tooltip) {
				domRef.setAttribute("title", tooltip);
			} else {
				domRef.removeAttribute("title");
			}
		}

		if (this._lastHoverInstance !== event.instance) {
			clearTimeout(this._hoverTimeOutId);
			var queueHover = function() {
				this._propogateHoverChange(event);
				this._hoverTimeOutId = undefined;
			}.bind(this);
			this._hoverTimeOutId = setTimeout(queueHover, 500);
		}

		this._applyHoverChangesToScene3D(instance);
	};

	Adapter3D.prototype._handleKeyPress = function(event) {
		log.info("keypress", event.key, thisModule);
		this._propagateKeyPress(event);
	};

	Adapter3D.prototype._getXY = function(event) {
		var rect = this._viewport.getDomRef().getBoundingClientRect();
		return {
			x: (event.pageX || event.originalEvent.pageX) - window.pageXOffset - rect.left,
			y: (event.pageY || event.originalEvent.pageY) - window.pageYOffset - rect.top
		};
	};

	Adapter3D.prototype._hitTest = function(event) {
		var sceneRef = this._viewport.getScene();
		var cameraRef = this._viewport.getCamera();
		var p = event.cursor || this._getXY(event);

		var rect = this._viewport.getDomRef().getBoundingClientRect();
		var normalizedXY = new THREE.Vector2(p.x / rect.width * 2 - 1, -p.y / rect.height * 2 + 1);
		var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(normalizedXY, cameraRef);
		var intersects = raycaster.intersectObjects(sceneRef.children, true);
		if (intersects && intersects.length > 0) {
			var info = intersects[0];
			return {
				instance: info.object && info.object._sapInstance,
				point: info.point
			};
		} else {
			return undefined;
		}
	};

	Adapter3D.prototype._extendEventWithInstanceAndCursor = function(event) {
		event.cursor = this._getXY(event);
		var hitInfo = this._hitTest(event);
		if (hitInfo) {
			event.instance = hitInfo.instance;
			event.hitPoint = hitInfo.point;
		}
		return this;
	};

	// The 'this' object in all methods is an Adapter3D instance.
	viewportEventDelegate = {
		onkeydown: function(event) {
			if (!event.originalEvent.repeat) {
				this._handleKeyPress(event);
			}
		},

		oncontextmenu: function(event) {
			this._extendEventWithInstanceAndCursor(event);
			// event.buttons is zero when event is raised from keyboard special context menu key,
			// but this is true only for Chrome & Firefox as IE & Edge mimics keyboard key as mouse key
			// so, distinguish from where this event was originated, from keyboard or mouse is not possible
			if (event.button === 0 ||
				Math.abs(event.cursor.x - this._lastXY.x) < 5 &&
				Math.abs(event.cursor.y - this._lastXY.y) < 5) {
				this._handleContextMenu(event);
			}
		},

		onmousedown: function(event) {
			// reset any pending hover call
			if (this._hoverTimeOutId) {
				clearTimeout(this._hoverTimeOutId);
				this._hoverTimeOutId = null;
			}

			this._mouseDown = true;
			this._extendEventWithInstanceAndCursor(event);
			log.info("mousedown", "x: " + event.cursor.x + ", y: " + event.cursor.y, thisModule);
			this._lastXY.x = event.cursor.x;
			this._lastXY.y = event.cursor.y;
		},

		onmouseup: function(event) {
			this._mouseDown = false;
		},

		onhover: function(event) {
			this._extendEventWithInstanceAndCursor(event);
			log.info("hover", "x: " + event.cursor.x + ", y: " + event.cursor.y, thisModule);
			if (this._mouseDown) {
				if (this._lastXY.x !== event.cursor.x || this._lastXY.y !== event.cursor.y) {
					this._skipClick = true;
				}
				return;
			}
			this._handleHover(event);
		},

		onmouseout: function(event) {
			this._extendEventWithInstanceAndCursor(event);
			delete event.instance;
			this._handleHover(event);
		},

		onBeforeRendering: function(event) {
			if (this._onhoverProxy) {
				this._viewport.$().off(sap.ui.Device.browser.msie || sap.ui.Device.browser.edge ? "pointermove" : "mousemove", this._onhoverProxy);
			}
			if (this._onpointerdownProxy) {
				this._viewport.$().off("pointerdown", this._onpointerdownProxy);
			}
			if (this._onpointeronProxy) {
				this._viewport.$().off("pointerup", this._onpointerupProxy);
			}
		},

		onAfterRendering: function(event) {
			if (!this._onhoverProxy) {
				this._onhoverProxy = viewportEventDelegate.onhover.bind(this);
			}
			this._viewport.$().on(sap.ui.Device.browser.msie || sap.ui.Device.browser.edge ? "pointermove" : "mousemove", this._onhoverProxy);
			if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
				if (!this._onpointerdownProxy) {
					this._onpointerdownProxy = viewportEventDelegate.onmousedown.bind(this);
				}
				this._viewport.$().on("pointerdown", this._onpointerdownProxy);
				if (!this._onpointerupProxy) {
					this._onpointerupProxy = viewportEventDelegate.onmouseup.bind(this);
				}
				this._viewport.$().on("pointerup", this._onpointerupProxy);
			}

			if (this._detail.anchor) { // restore DOM hierarchy by adding anchor element under viewport DOM element
				this._viewport.getDomRef().appendChild(this._detail.anchor);
			}

			this._openDetailPending(); // open any pending detail window
		}
	};


	viewportEventDelegate[sap.ui.Device.browser.msie || sap.ui.Device.browser.edge ? "onclick" : "ontap"] = function(event) {
		log.info("onclick", "", thisModule);
		this._extendEventWithInstanceAndCursor(event);
		if (this._skipClick) {
			this._skipClick = false;
			this._handleHover(event);
			return;
		}
		if (this._clickTimerId) {
			jQuery.sap.clearDelayedCall(this._clickTimerId);
			this._clickTimerId = null;
			this._handleDoubleClick(event);
		} else {
			this._clickTimerId = jQuery.sap.delayedCall(200, this, function() {
				 this._clickTimerId = null;
				 this._handleClick(event);
			});
		}
	};

	// END: Gesture handling.
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: Selection handling.

	var controlKeyName = sap.ui.Device.os.macintosh ? "metaKey" : "ctrlKey";

	/**
	 * Extends the event with selection changes if any.
	 *
	 * @param {jQuery.Event} event The event to extend with new properties
	 * @returns {sap.ui.vbm.Adapter3D} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter3D.prototype._extendEventWithSelection = function(event) {
		var instance = event.instance;
		if (instance) {
			if (event.originalEvent.type === "click") {
				// When both the Control (Command in macOS) and Shift keys are pressed do not change the selection.
				if (!(event[controlKeyName] && event.shiftKey)) {
					var action;
					var exclusive;
					if (event[controlKeyName]) {
						action = "toggle";
						exclusive = false;
					} else if (event.shiftKey) {
						action = "select";
						exclusive = false;
					} else {
						action = "select";
						exclusive = true;
					}
					event.selectionChanges = this._changeSelection(instance, action, exclusive);
				}
			} else {
				event.selectionChanges = this._changeSelection(instance, "toggle", false);
			}
		}
		return this;
	};

	/**
	 * Changes the current selection list.
	 *
	 * The selection is controlled by the selection cardinality properties of the DataType node.
	 *
	 * @param {object}  instance The VO instance.
	 * @param {string}  action   If <code>'toggle'</code> then toggle the selection state of the VO instance,
	 *                           if <code>'select'</code> then add the VO instance to the selection list.
	 * @param {boolean} exclusive If <code>true</code> then deselect other selected VO instances,
	 *                            if <code>false</code> then add to the selection list.
	 * @returns {object} An object with two arrays of VO instances: <code>selected</code> and <code>deselected</code>.
	 * @private
	 */
	Adapter3D.prototype._changeSelection = function(instance, action, exclusive) {
		var selected = [];
		var deselected = [];
		var group = instance.voGroup;
		var wasSelected = toBoolean(instance["VB:s"]);
		var selectedIndex;

		if (action === "select") {
			if (group.maxSel !== "0") {
				if (wasSelected) {
					if (exclusive) {
						// Deselect other selected instances in the group.
						selectedIndex = group.selected.indexOf(instance);
						deselected = group.selected.splice(selectedIndex + 1).concat(group.selected.splice(0, selectedIndex));
					}
				} else {
					if (exclusive || group.maxSel === "1") {
						// Deselect all selected instances in the group.
						deselected = group.selected.splice(0);
					}
					group.selected.push(instance);
					selected = [ instance ];
				}
			}
		} else if (action === "toggle") {
			if (wasSelected) {
				if (group.minSel === "0" || group.selected.length > 1) {
					// Deselect instance
					selectedIndex = group.selected.indexOf(instance);
					deselected = group.selected.splice(selectedIndex, 1);
				}
			} else if (group.maxSel !== "0") {
				if (group.maxSel === "1") {
					// Deselect all
					deselected = group.selected.splice(0);
				}
				// Select instance
				group.selected.push(instance);
				selected = [ instance ];
			}
		}

		selected.forEach(function(instance) {
			instance["VB:s"] = "true";
		});

		deselected.forEach(function(instance) {
			instance["VB:s"] = "false";
		});

		return {
			selected: selected,
			deselected: deselected
		};
	};

	/**
	 * Applies selection changes to the three.js scene.
	 *
	 * @param {object[]} selected   The visual instance objects to select.
	 * @param {object[]} deselected The visual instance objects to deselect.
	 * @returns {sap.ui.vbm.Adapter3D} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter3D.prototype._applySelectionChangesToScene3D = function(selected, deselected) {
		deselected.forEach(function(instance) {
			applyColor(instance, instance.color);
		});
		selected.forEach(function(instance) {
			applyColor(instance, instance.selectColor);
		});
		return this;
	};

	Adapter3D.prototype._applyHoverChangesToScene3D = function(instance) {
		if (this._lastHoverInstance !== instance) {
			if (this._lastHoverInstance) {
				applyColor(this._lastHoverInstance, this._lastHoverInstance[toBoolean(this._lastHoverInstance["VB:s"]) ? "selectColor" : "color"]);
			}
			this._lastHoverInstance = instance;
			if (this._lastHoverInstance) {
				applyColor(this._lastHoverInstance, this._lastHoverInstance.hotDeltaColor);
			}
		}
		return this;
	};

	return Adapter3D;
});
