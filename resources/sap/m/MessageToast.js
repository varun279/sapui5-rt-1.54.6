/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./InstanceManager','sap/ui/core/Popup','sap/ui/core/library','sap/ui/core/Control','sap/ui/Device'],function(q,I,P,c,C,D){"use strict";var a=c.Dock;var d=c.CSSSize;var M={};var O="0 -64",e="sapMMessageToast",E="sapUiSelectable",B="sapContrast",f="sapContrastPlus";M._mSettings={duration:3000,width:"15em",my:"center bottom",at:"center bottom",of:document.defaultView,offset:"0 0",collision:"fit fit",onClose:null,animationTimingFunction:"ease",animationDuration:1000,autoClose:true,closeOnBrowserNavigation:true};M._aPopups=[];M._iOpenedPopups=0;M._bBoundedEvents=false;M._validateSettings=function(s){this._isFiniteInteger(s.duration);this._validateWidth(s.width);this._validateDockPosition(s.my);this._validateDockPosition(s.at);this._validateOf(s.of);this._validateOffset(s.offset);this._validateCollision(s.collision);this._validateOnClose(s.onClose);this._validateAutoClose(s.autoClose);this._validateAnimationTimingFunction(s.animationTimingFunction);this._isFiniteInteger(s.animationDuration);};M._isFiniteInteger=function(N){if(typeof N!=="number"||!isFinite(N)||!(Math.floor(N)===N)||N<=0){q.sap.log.error('"iNumber" needs to be a finite positive nonzero integer on '+this+"._isFiniteInteger");}};M._validateWidth=function(w){if(!d.isValid(w)){q.sap.log.error(w+' is not of type '+'"sap.ui.core.CSSSize" for property "width" on '+this+"._validateWidth");}};M._validateDockPosition=function(s){if(!a.isValid(s)){q.sap.log.error('"'+s+'"'+' is not of type '+'"sap.ui.core.Popup.Dock" on '+this+"._validateDockPosition");}};M._validateOf=function(v){if(!(v instanceof q)&&!(v&&v.nodeType===1)&&!(v instanceof C)&&v!==window){q.sap.log.error('"of" needs to be an instance of sap.ui.core.Control or an Element or a jQuery object or the window on '+this+"._validateOf");}};M._validateOffset=function(o){if(typeof o!=="string"){q.sap.log.error(o+' is of type '+typeof o+', expected "string" for property "offset" on '+this+"._validateOffset");}};M._validateCollision=function(s){var r=/^(fit|flip|none|flipfit|flipflip|flip flip|flip fit|fitflip|fitfit|fit fit|fit flip)$/i;if(!r.test(s)){q.sap.log.error('"collision" needs to be a single value “fit”, “flip”, or “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none", "flipfit" on '+this+"._validateOffset");}};M._validateOnClose=function(b){if(typeof b!=="function"&&b!==null){q.sap.log.error('"onClose" should be a function or null on '+this+"._validateOnClose");}};M._validateAutoClose=function(b){if(typeof b!=="boolean"){q.sap.log.error('"autoClose" should be a boolean on '+this+"._validateAutoClose");}};M._validateAnimationTimingFunction=function(t){var r=/^(ease|linear|ease-in|ease-out|ease-in-out)$/i;if(!r.test(t)){q.sap.log.error('"animationTimingFunction" should be a string, expected values: '+"ease, linear, ease-in, ease-out, ease-in-out on "+this+"._validateAnimationTimingFunction");}};function h(o){for(var p=["my","at","of","offset"],i=0;i<p.length;i++){if(o[p[i]]!==undefined){return false;}}return true;}function g(s){var m=document.createElement("div");m.className=e+" "+E+" "+B+" "+f;if(sap.ui.getCore().getConfiguration().getAccessibility()){m.setAttribute("role","alert");m.setAttribute("aria-label"," ");}m.style.width=s.width;m.appendChild(document.createTextNode(s.message));return m;}function n(o){if(o){if(h(o)){o.offset=O;}if(o.of&&o.of.nodeType===9){o.of=document.defaultView;}}else{o={offset:O};}return o;}M._handleResizeEvent=function(){if(D.system.phone||D.system.tablet){this._resetPosition(this._aPopups);}q.sap.delayedCall(0,this,"_applyPositions",[this._aPopups]);};M._handleMouseDownEvent=function(o){var i=o.target.hasAttribute("class")&&o.target.getAttribute("class").indexOf(e)!==-1;if(i||o.isMarked("delayedMouseEvent")){return;}this._aPopups.forEach(function(p){p&&p.__bAutoClose&&p.close();});};M._resetPosition=function(p){for(var i=0,m;i<p.length;i++){m=p[i]&&p[i].getContent();if(m){m.style.visibility="hidden";m.style.left=0;}}};M._applyPositions=function(p){for(var i=0,o,m;i<p.length;i++){o=p[i];if(o){m=o._oPosition;if(D.system.phone||D.system.tablet){q.sap.delayedCall(0,this,"_applyPosition",[o,m]);}else{o.setPosition(m.my,m.at,m.of,m.offset);}}}};M._applyPosition=function(p,m){var m=m||p._oPosition,o=p.getContent();p.setPosition(m.my,m.at,m.of,m.offset);o.style.visibility="visible";};M._setCloseAnimation=function(m,i,b,s){var j="opacity "+s.animationTimingFunction+" "+s.animationDuration+"ms",t="webkitTransitionEnd."+e+" transitionend."+e;if(sap.ui.getCore().getConfiguration().getAnimation()&&s.animationDuration>0){m[0].style.webkitTransition=j;m[0].style.transition=j;m[0].style.opacity=0;m.on(t,function handleMTTransitionEnd(){m.off(t);b();});}else{b();}};M.show=function(m,o){var t=this,s=q.extend({},this._mSettings,{message:m}),p=new P(),i,b,j="mousedown."+e+" touchstart."+e,k,l;o=n(o);q.extend(s,o);this._validateSettings(s);b=g(s);i=this._aPopups.push(p)-1;p.setContent(b);p.setPosition(s.my,s.at,s.of,s.offset,s.collision);if(q.support.cssTransitions){p.setAnimations(function fnMessageToastOpen($,v,w){w();},function fnMessageToastClose($,v,w){t._setCloseAnimation($,v,w,s);});}p.setShadow(false);p.__bAutoClose=s.autoClose;if(s.closeOnBrowserNavigation){I.addPopoverInstance(p);}if(!this._bBoundedEvents){q(window).on("resize."+e,this._handleResizeEvent.bind(this));q(document).on(j,this._handleMouseDownEvent.bind(this));this._bBoundedEvents=true;}p.open();this._iOpenedPopups++;function r(){I.removePopoverInstance(t._aPopups[i]);q(t._aPopups[i].getContent()).remove();t._aPopups[i].detachClosed(r);t._aPopups[i].destroy();t._aPopups[i]=null;t._iOpenedPopups--;if(t._iOpenedPopups===0){t._aPopups=[];q(window).off("resize."+e);q(document).off(j);t._bBoundedEvents=false;}if(typeof s.onClose==="function"){s.onClose.call(t);}}p.attachClosed(r);k=q.sap.delayedCall(s.duration,p,"close");function u(){q.sap.clearDelayedCall(k);k=null;function v(){l=q.sap.delayedCall(s.duration,p,"close");p.getContent().removeEventListener("mouseleave",v);}p.getContent().addEventListener("mouseleave",v);q.sap.clearDelayedCall(l);l=null;}p.getContent().addEventListener("touchstart",u);p.getContent().addEventListener("mouseover",u);if(D.system.desktop){p.getContent().addEventListener("mouseleave",function(){k=q.sap.delayedCall(s.duration,p,"close");});}};M.toString=function(){return"sap.m.MessageToast";};return M;},true);
