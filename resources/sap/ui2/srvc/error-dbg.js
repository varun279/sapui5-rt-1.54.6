// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview An error object which logs the error message immediately.
 */

this.sap = this.sap || {};

(function () {
  "use strict";
  /*global jQuery, sap */

  // namespace "sap.ui2.srvc" **************************************************
  sap.ui2 = sap.ui2 || {};
  sap.ui2.srvc = sap.ui2.srvc || {};

  // Only declare the module if jQuery.sap exists. Otherwise we do not even try to require assuming
  // that the script has been loaded manually (before SAPUI5).
  if (typeof jQuery === "function" && jQuery.sap) {
    jQuery.sap.declare("sap.ui2.srvc.error");
    jQuery.sap.require("sap.ui2.srvc.utils");
  }

  /**
   * Creates an <code>Error</code> object and logs the error message immediately.
   *
   * @param {string} sMessage
   *   the error message
   * @param {string} [sComponent]
   *   the error component to log
   *
   * @class
   * @constructor
   * @since 1.2.0
   */
  sap.ui2.srvc.Error = function (sMessage, sComponent) {
    // see also redundant declaration in utils.js which has to be in sync
    var oError = new Error(sMessage); // reuse Error constructor to benefit from it (e.g. stack)
    oError.name = "sap.ui2.srvc.Error";
    sap.ui2.srvc.log.error(sMessage, null, sComponent);
    return oError;
  };
  // to avoid (new Error()) instanceof sap.ui2.srvc.Error === true we do not set the prototype,
  // we also tolerate that (new sap.ui2.srvc.Error()) instanceof sap.ui2.srvc.Error === false now
  // sap.ui2.srvc.Error.prototype = Error.prototype;

}());
