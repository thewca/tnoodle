/*
 * Mark 2 Javascript Code
 *
 * Lucas Garron, November/December 2011
 *
 */

var mark2 = {};


(function() {
    "use strict";

    // Implementation of bind() for Safari.
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP ? this : oThis || window,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    // IE <9 doesn't have an addEventListener method, so we simulate one here.
    if(!document.createElement('a').addEventListener) {
        var addEventListener = function(type, listener, useCapture) {
            this.attachEvent('on' + type, listener);
        };
        Element.prototype.addEventListener = addEventListener;
        window.addEventListener = addEventListener;
    }

    // IE <9 doesn't have a getElementsByClassName method, so we simulate one here.
    // http://code.google.com/p/getelementsbyclassname/
    /*
       Developed by Robert Nyman, http://www.robertnyman.com
       Code/licensing: http://code.google.com/p/getelementsbyclassname/
       */
    if(!document.createElement('a').getElementsByClassName) {
        var getElementsByClassName = function (className, tag, elm){
            if (document.getElementsByClassName) {
                getElementsByClassName = function (className, tag, elm) {
                    elm = elm || document;
                    var elements = elm.getElementsByClassName(className),
                        nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                        returnElements = [],
                        current;
                    for(var i=0, il=elements.length; i<il; i+=1){
                        current = elements[i];
                        if(!nodeName || nodeName.test(current.nodeName)) {
                            returnElements.push(current);
                        }
                    }
                    return returnElements;
                };
            }
            else if (document.evaluate) {
                getElementsByClassName = function (className, tag, elm) {
                    tag = tag || "*";
                    elm = elm || document;
                    var classes = className.split(" "),
                        classesToCheck = "",
                        xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                        namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                        returnElements = [],
                        elements,
                        node;
                    for(var j=0, jl=classes.length; j<jl; j+=1){
                        classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
                    }
                    try     {
                        elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
                    }
                    catch (e) {
                        elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
                    }
                    while ((node = elements.iterateNext())) {
                        returnElements.push(node);
                    }
                    return returnElements;
                };
            }
            else {
                getElementsByClassName = function (className, tag, elm) {
                    tag = tag || "*";
                    elm = elm || document;
                    var classes = className.split(" "),
                        classesToCheck = [],
                        elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                        current,
                        returnElements = [],
                        match;
                    for(var k=0, kl=classes.length; k<kl; k+=1){
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
                    }
                    for(var l=0, ll=elements.length; l<ll; l+=1){
                        current = elements[l];
                        match = false;
                        for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                            match = classesToCheck[m].test(current.className);
                            if (!match) {
                                break;
                            }
                        }
                        if (match) {
                            returnElements.push(current);
                        }
                    }
                    return returnElements;
                };
            }
            return getElementsByClassName(className, tag, elm);
        };

        Element.prototype.getElementsByClassName = function(className) {
            return getElementsByClassName(className, null, this);
        };
    }

    // Copied from https://developer.mozilla.org/en/DOM/element.classList
    /*
     * classList.js: Cross-browser full element.classList implementation.
     * 2011-06-15
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */

    /*global self, document, DOMException */

    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

    if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

        (function (view) {

            var classListProp = "classList",
                protoProp = "prototype",
                elemCtrProto = (view.HTMLElement || view.Element)[protoProp],
                objCtr = Object,
                strTrim = String[protoProp].trim || function () {
                    return this.replace(/^\s+|\s+$/g, "");
                },
                arrIndexOf = Array[protoProp].indexOf || function (item) {
                    var i = 0, len = this.length;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                },
                // Vendors: please allow content code to instantiate DOMExceptions
                DOMEx = function (type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                },
                checkTokenAndGetIndex = function (classList, token) {
                    if (token === "") {
                        throw new DOMEx( "SYNTAX_ERR", "An invalid or illegal string was specified");
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
                    }
                    return arrIndexOf.call(classList, token);
                },
                ClassList = function (elem) {
                    var trimmedClasses = strTrim.call(elem.className);
                    var classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];
                    var i = 0;
                    var len = classes.length;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function () {
                        elem.className = this.toString();
                    };
                },
                classListProto = ClassList[protoProp] = [],
                classListGetter = function () {
                    return new ClassList(this);
                };
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
                return this[i] || null;
            };
            classListProto.contains = function (token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function (token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    this._updateClassName();
                }
            };
            classListProto.remove = function (token) {
                token += "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    this._updateClassName();
                }
            };
            classListProto.toggle = function (token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.add(token);
                } else {
                    this.remove(token);
                }
            };
            classListProto.toString = function () {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    }


    /*

       DOM Convenience Methods

       These methods are a bit brittle and awkward, but they save us the issues of including all of jQuery into a project that is not highly DOM-focused.

*/

    mark2.dom = (function() {

        /*
         * DOM Manipulation
         */

        var appendElement = function(elementToAppendTo, tag, attrs, content) {
            var newElement = document.createElement(tag);
            if (content) {
                newElement.innerHTML = content;
            }
            if(attrs) {
                for(var attr in attrs) {
                    if(attrs.hasOwnProperty(attr)) {
                        newElement.setAttribute(attr, attrs[attr]);
                    }
                }
            }
            if (elementToAppendTo) {
                elementToAppendTo.appendChild(newElement);
            }
            return newElement;
        };

        var currentAutoID = "0";

        var nextAutoID = function() {
            return "auto_id_" + (currentAutoID++);
        };

        var addClass = function(el, className) {
            if (typeof el.classList !== "undefined") {
                el.classList.add(className);
            }
        };

        var removeClass = function(el, className) {
            if (typeof el.classList !== "undefined") {
                el.classList.remove(className);
            }

        };

        var showElement = function(el) {
            el.style.display = "block";
        };

        var hideElement = function(el) {
            el.style.display = "none";
        };

        var emptyElement = function(el) {
            while(el.hasChildNodes()) {
                el.removeChild(el.firstChild);
            }
        };


        /*
         * Public Interface
         */

        return {
            appendElement: appendElement,
            nextAutoID: nextAutoID,
            addClass: addClass,
            removeClass: removeClass,
            showElement: showElement,
            hideElement: hideElement,
            emptyElement: emptyElement
        };
    })();

    mark2.settings = (function() {

        var extraScrambles = 2;
        var events = {
            // Official WCA events as of October 06, 2013
            // Names match https://www.worldcubeassociation.org/regulations/#article-9-events
            // - Exception: "Rubik's Cube" is replaced with "3x3x3" for brevity and consistency.
            "333":    {name: "3x3x3", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "444":    {name: "4x4x4 Cube", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "555":    {name: "5x5x4 Cube", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "222":    {name: "2x2x2 Cube", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "333bf":  {name: "3x3x3: Blindfolded", default_round: {type: "best", num_scrambles: 3, num_extra_scrambles: extraScrambles } },
            "333oh":  {name: "3x3x3: One-Handed", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "333fm":  {name: "3x3x3: Fewest Moves", default_round: {type: "best", num_scrambles: 1 } },
            "333ft":  {name: "3x3x3: With Feet", default_round: {type: "avg",  num_scrambles: 3, num_extra_scrambles: extraScrambles } },
            "minx":   {name: "Megaminx", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "pyram":  {name: "Pyraminx", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "sq1":    {name: "Square-1", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "clock":  {name: "Rubik's Clock", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } },
            "666":    {name: "6x6x6 Cube", default_round: {type: "mean", num_scrambles: 3, num_extra_scrambles: extraScrambles } },
            "777":    {name: "7x7x7 Cube", default_round: {type: "mean", num_scrambles: 3, num_extra_scrambles: extraScrambles } },
            "444bf":  {name: "4x4x4 Cube: Blindfolded", default_round: {type: "best", num_scrambles: 3, num_extra_scrambles: extraScrambles } },
            "555bf":  {name: "5x5x5 Cube: Blindfolded", default_round: {type: "best", num_scrambles: 3, num_extra_scrambles: extraScrambles } },
            "333mbf": {name: "3x3x3: Multiple Blindfolded", default_round: {type: "mbf",  num_scrambles: 28 } },
            "skewb":  {name: "Skewb", default_round: {type: "avg",  num_scrambles: 5, num_extra_scrambles: extraScrambles } }
        };

        // Javascript objects don't retain key order in all browsers, so we create this list for iteration.
        var eventOrder = [
            "222",
            "333",
            "444",
            "555",
            "666",
            "777",
            "333bf",
            "333oh",
            "333fm",
            "333ft",
            "minx",
            "pyram",
            "sq1",
            "clock",
            "444bf",
            "555bf",
            "333mbf",
            "skewb"
        ];

        function isFmc(eventID) {
            // Does this eventID end in "fm"?
            return !!eventID.match(/.*fm$/);
        }
        function eventToPuzzle(eventID) {
            var puzzByEvent = {
                "333bf" : "333",
                "333oh" : "333",
                "333fm" : "333",
                "333ft" : "333",
                "444bf" : "444",
                "555bf" : "555",
                "333mbf" : "333"
            };
            return puzzByEvent[eventID] || eventID;
        }

        var defaultRounds = [
            { eventID: "333", roundName: "Round 1" }
        ];

        var defaultNumGroups = 1;

        return {
            events: events,
            eventToPuzzle: eventToPuzzle,
            isFmc: isFmc,
            event_order: eventOrder,
            default_rounds: defaultRounds,

            default_num_groups: defaultNumGroups
        };
    })();

    // converted to data uri with http://dataurl.net/#dataurlmaker
    mark2.logo = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB2ZXJzaW9uPSIxLjAiCiAgIHdpZHRoPSI4MC4wMDAwMTUiCiAgIGhlaWdodD0iODAuMTI3OTc1IgogICBpZD0ic3ZnMiIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC40OC4wIHI5NjU0IgogICBzb2RpcG9kaTpkb2NuYW1lPSJ3Y2FfbG9nby5zdmciPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTI4MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI2ODMiCiAgICAgaWQ9Im5hbWVkdmlldzE1IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIxLjc4NzIxNTkiCiAgICAgaW5rc2NhcGU6Y3g9IjEwNy44NDcyIgogICAgIGlua3NjYXBlOmN5PSI0MC42MDk0MTQiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmcyIgogICAgIGZpdC1tYXJnaW4tdG9wPSIwIgogICAgIGZpdC1tYXJnaW4tbGVmdD0iMCIKICAgICBmaXQtbWFyZ2luLXJpZ2h0PSIwIgogICAgIGZpdC1tYXJnaW4tYm90dG9tPSIwIj4KICAgIDxpbmtzY2FwZTpncmlkCiAgICAgICBlbXBzcGFjaW5nPSI1IgogICAgICAgdmlzaWJsZT0idHJ1ZSIKICAgICAgIGVuYWJsZWQ9InRydWUiCiAgICAgICBzbmFwdmlzaWJsZWdyaWRsaW5lc29ubHk9InRydWUiCiAgICAgICB0eXBlPSJ4eWdyaWQiCiAgICAgICBpZD0iZ3JpZDI5OTIiIC8+CiAgPC9zb2RpcG9kaTpuYW1lZHZpZXc+CiAgPGRlZnMKICAgICBpZD0iZGVmczQiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGUgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjI3MzI5Mzg4LDAsMCwwLjI3MzI5Mzg4LC0xMjAuNDk2OTQsMTMzLjQ1MTQ2KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQ5OTk4OSwwLDAsMC40OTk5ODksMzAxLjYxOCwtMjQ0Ljg1NCkiCiAgICAgICBpZD0iZzMzMTIiPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDU3MS4yNjk4MiwtNDg2LjY4NDcgYyAtMTYxLjk4NDAyLDAgLTI5Mi42ODc1LDEzMS4wMjk0IC0yOTIuNjg3NSwyOTMuMDEzNSAwLDE2MS45ODM5IDEzMC4wNzE0OCwyOTIuMjQ5MyAyOTIuMDU1NSwyOTIuMjQ5MyAxNjEuOTg0MDMsMCAyOTMuMTg0OTgsLTEyOS43NjAzIDI5My4xODQ5OCwtMjkxLjc0NDIgMCwtMTYxLjk4NDEgLTEzMC4zMjM0MSwtMjkzLjU2MzIgLTI5Mi4zMDc0NCwtMjkzLjU2MzIgbCAtMC4yNDU1NCwwLjA0NSAwLC00ZS00IDAsMCAwLDAgMCwwIDAsMCB6IG0gLTAuMDIyMyw2Ni41NDc5IGMgMTI1LjE4MjE2LDAgMjI2LjE0OTk4LDEwMS4yODM0IDIyNi4xNDk5OCwyMjYuNDY1NiAwLDEyNS4xODIgLTEwMC45Njc4MiwyMjYuNTI4NyAtMjI2LjE0OTk4LDIyNi41Mjg3IC0xMjUuMTgyMTQsMCAtMjI2Ljc4MTI1LC0xMDEuMzQ2NyAtMjI2Ljc4MTI1LC0yMjYuNTI4NyAwLC0xMjUuMTgyMiAxMDEuNTk5MTEsLTIyNi40NjU2IDIyNi43ODEyNSwtMjI2LjQ2NTYgbCAwLDAgeiIKICAgICAgICAgaWQ9InBhdGgzMjczIgogICAgICAgICBzdHlsZT0iZmlsbDojZWVlZWVjO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lIgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDM3OS4wNTk1MiwtMzA0LjUyMzQgYyAwLDAgMTkyLjIwMDkyLC0xMTAuNjExMyAxOTIuMjAwOTIsLTExMC42MTEzIDAsMCAxOTEuNDc4NDgsMTEwLjcxNiAxOTEuNDc4NDgsMTEwLjcxNiBMIDc2Mi40MTI0MSwtODIuNTQyMyA1NzAuNzM1OTcsMjguMzIxOSAzNzguODA2OTksLTgyLjU0MjQgbCAwLjI1MjUzLC0yMjEuOTgxIDAsMCB6IgogICAgICAgICBpZD0icmVjdDI4MDQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZWVlZWM7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmUiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gNDcyLjk4Nzk1LC0yOC4wNjEyIC05NC4wMzk3NCwtNTQuMzUyNyAtMC4yMTEyNSwtMTA5LjMwMjIgYyAtMC4xMTYwOSwtNjAuMTE2MyAwLjA3MTEsLTEwOS41NjI0IDAuNDE2MDksLTEwOS44ODAzIDAuNDU0NjUsLTAuNDE5IDE1Ny42NzIyNyw4OS43NjU4IDE4Ni44NjUyMSwxMDcuMTkxNSBsIDMuMDg5OSwxLjg0NDQgMCwxMDkuNDYzNyBjIDAsODcuMDM2NCAtMC4yMTMwOSwxMDkuNDU2MSAtMS4wNDAyOCwxMDkuNDI2IC0wLjU3MjE1LC0wLjAyMiAtNDMuMzU4MTUsLTI0LjQ5NjQgLTk1LjA4MDAyLC01NC4zOTA0IGwgOWUtNSwwIDAsMCAwLDAgeiBtIDUyLjg0NTM2LC0yNi4zMDYgYyAwLC0xMi44Nzk0IC0wLjE4Nzg1LC0xNS4wMDQ3IC0xLjQ1NjM3LC0xNi40ODQ4IC0wLjgwMDk5LC0wLjkzNDYgLTE3Ljc0Njg3LC0xMC41ODA0IC0zNy42NTc1MSwtMjEuNDM1MiAtMzkuNDI4ODQsLTIxLjQ5NTcgLTQzLjExNzM0LC0yMy43MDA4IC00OC4zNDU3NywtMjguOTAyNSAtNi4zNTY2OCwtNi4zMjQxIC02LjM4NDk4LC02LjQ4NzQgLTYuNzA5LC0zOC43MTYgLTAuMjc4MzcsLTI3LjY4NzYgLTAuMjM2NDksLTI4LjYwNjEgMS4zNjEwMSwtMjkuNzc1NSAzLjMzNjcxLC0yLjQ0MjggMi43NzQyOSwtMi43MDY4IDUxLjAxNDg0LDIzLjk0MjMgNDIuMjE0MjEsMjMuMzE5OSA0MC4wMDQ0LDIyLjIwODYgNDEuMDA3NDYsMjAuNjIzMiAwLjQxNzksLTAuNjYwNSAwLjc2NTYsLTcuODA2OCAwLjc3MjYyLC0xNS44ODA1IDAuMDEyMywtMTIuODA2IC0wLjE3MzA2LC0xNC44OTEgLTEuNDQzNjUsLTE2LjMzNjYgLTEuNjk3NjIsLTEuOTMxNyAtNzkuNDI4MTQsLTQ1LjA2ODcgLTg1LjU0MzIxLC00Ny40NzI3IC0xNC4xNTk2MSwtNS41NjY3IC0yMy4wODcwMSwtMy4yMDU0IC0yNy43NDk5NCw3LjMzOTkgLTIuODc3NTEsNi41MDc1IC0zLjQxMjA2LDEzLjUwMTEgLTMuNDAyOCw0NC41MTgyIDAuMDEyMyw0MC41MzA1IDEuNjcyNjEsNTEuMjg4NyAxMC4xNDc1Miw2NS43NDQ2IDQuMTI1NzYsNy4wMzc1IDE1LjU1MDYxLDE4LjY4NTggMjMuMjIwNzIsMjMuNjc1IDMuMDMwOSwxLjk3MTUgMjIuODc5MTIsMTMuMDUyNyA0NC4xMDcxNiwyNC42MjQ4IDI4LjE5NTMsMTUuMzcwMiAzOC44NzY3MywyMC44MDg2IDM5LjYzNjY2LDIwLjE4MDkgMC43NjA5MiwtMC42Mjg2IDEuMDQwMjYsLTQuODI5NSAxLjA0MDI2LC0xNS42NDUxIGwgMCwwIDAsMCAwLDAgeiBNIDc2MS4yMjMyLC0zMTYuMzE0OSBjIC0xNS4wMDYzNiwtMjMuMTc0MyAtMzIuODYzMjgsLTQyLjIxOTQgLTU1LjIxNjM1LC01OC44OTA4IC0zNS4zNTk5OSwtMjYuMzcyMSAtNzcuOTY1NiwtNDEuODE0MyAtMTIyLjMzNDk0LC00NC4zMzk3IGwgLTkuOTg2NTIsLTAuNTY4NSAtMC4yMTc3MiwtMzMuMTAyNyBjIC0wLjE4MjYxLC0yNy43ODE5IC0wLjAzMDgsLTMzLjE3NDkgMC45NDk3OCwtMzMuNTUwOCAxLjg0MDUsLTAuNzA2MyAyNi4zODkwMiwxLjIwNCAzOS4yMTM5NiwzLjA1MTUgMTcuMTQ0MDEsMi40Njk2IDMyLjE0NTA0LDYuMDc3NCA0OS45MzI2NCwxMi4wMDkgMTcuOTAyOTksNS45NyAyOC4zNzc3NiwxMC40MDE3IDQ0LjQwODE0LDE4Ljc4ODMgMzguMTU4MDYsMTkuOTYzMyA3MS40NzMzMSw0OC40MDM1IDk3Ljk0MDcxLDgzLjYwOSA3LjU5NjQsMTAuMTA0MiAxOC4wMTE5LDI2LjExOTMgMTcuNjU5MiwyNy4xNTMyIC0wLjIzOSwwLjcwMDUgLTU2LjE5MTYxLDMzLjE1NTggLTU3LjEwNDQ3LDMzLjEyMzQgLTAuMjk3NzgsLTAuMDEgLTIuNjU4MDcsLTMuMjg3NCAtNS4yNDQ1MywtNy4yODE5IGwgMTBlLTUsMCAwLDAgeiIKICAgICAgICAgaWQ9InBhdGgyNzMwIgogICAgICAgICBzdHlsZT0iZmlsbDojZGRkYTQ1IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDc5Ny4xMzM5LC02NS4yMDAzIGMgLTE0Ljg3NTgsLTguNjQzNCAtMjcuMzcwMSwtMTYuMjE1IC0yNy43NjUxNiwtMTYuODI1OCAtMC40NzUwMywtMC43MzQ1IDAuODI4NTYsLTQuMTk5OSAzLjg0ODM2LC0xMC4yMzA3IDMxLjk0NjgsLTYzLjgwMDEgMzEuOTYxOCwtMTM5LjE1OTkgMC4wNDEsLTIwMi45MDk4IC0yLjQ4OTQsLTQuOTcxNCAtNC4zNTc2OSwtOS40Nzc5IC00LjE1MTgzLC0xMC4wMTQyIDAuNDUzNjksLTEuMTgyNSA1NC4zNjQ5MywtMzIuMzEzNiA1Ni4xOTI1MywtMzIuNDQ4NSAzLjc5LC0wLjI3OTkgMjEuNDA1MSw0MC4wMDg2IDI4LjA1OSw2NC4xNzUxIDcuNzU1NywyOC4xNjg1IDEwLjY3MDMsNDkuOTAzMSAxMC42ODc4LDc5LjcwMTkgMC4wMTgsMjkuNjYxMiAtMi44OTk5LDUxLjQxNjQgLTEwLjY4NzgsNzkuNzAxOSAtNi40NDkzLDIzLjQyNCAtMjQuMDE0NSw2My45MTI1IC0yNy45NDI1LDY0LjQwOTIgLTAuNjc4OSwwLjA4NiAtMTMuNDA1NSwtNi45MTU4IC0yOC4yODEyLC0xNS41NTkxIGwgMTBlLTUsMCAwLDAgLTNlLTQsMCB6IgogICAgICAgICBpZD0icGF0aDI3MjYiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlNzc2MmEiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gNTczLjI2OTMsLTgyLjk5MTggMCwtMTA5LjM1OTEgOC41MzAxNSwtNC45NzQ4IGMgNDYuMTIwMjMsLTI2Ljg5NzMgMTgwLjY3MDQ0LC0xMDQuMTg2MyAxODAuOTI3NTEsLTEwMy45MjkyIDAuMTgyNjEsMC4xODI1IDAuMzUxNyw0OS4zMDU3IDAuMzc1ODEsMTA5LjE2MjcgMC4wMzU0LDg5LjUyNzUgLTAuMTUyNDMsMTA5LjAxNzIgLTEuMDYzMDQsMTA5Ljg4MSAtMC42MDg4MywwLjU3NzYgLTM4LjkzMDk5LDIyLjg2NTUgLTg1LjE2MDI1LDQ5LjUyODggLTQ2LjIyOTMsMjYuNjYzMyAtODguMTYyOTIsNTAuODU3MiAtOTMuMTg1ODYsNTMuNzY0MiAtNS4wMjI5NiwyLjkwNzEgLTkuNDIzMyw1LjI4NTYgLTkuNzc4NDgsNS4yODU2IC0wLjM1NTI0LDAgLTAuNjQ1ODQsLTQ5LjIxMTYgLTAuNjQ1ODQsLTEwOS4zNTkyIGwgMCwwIHogbSA1Ny44Mzg2LDM2LjE5MDkgNC45OTMyNSwtMy4wMDUgNy40ODk5NCwtMjEuNjI0NCA3LjQ4OTg3LC0yMS42MjQ1IDI2LjYxMzQ4LC0xNC43NzE4IGMgMTQuNjM3NDEsLTguMTI0NCAyNi44Nzg1OCwtMTQuNzcxNyAyNy4yMDI1NywtMTQuNzcxNyAwLjMyMzk1LDAgMy4yODA1NSw0Ljg4NDQgNi41NzAxNSwxMC44NTQxIDMuMjg5NjMsNS45Njk3IDYuNjMyMjksMTEuNjU4MyA3LjQyODI4LDEyLjY0MTMgbCAxLjQ0NzIzLDEuNzg3MiA5LjQ2ODA4LC01LjM3NTcgYyA1LjIwNzM2LC0yLjk1NjcgOS41ODY0MiwtNS45OTEyIDkuNzMxMzQsLTYuNzQzMyAwLjE0NDczLC0wLjc1MjEgLTguMTIzNjUsLTE3LjIyMjYgLTE4LjM3NDQ1LC0zNi42MDEgLTEwLjI1MDc3LC0xOS4zNzg0IC0yMS45NDQ4MywtNDEuNTI5NSAtMjUuOTg2ODUsLTQ5LjIyNDYgLTcuOTUzNzYsLTE1LjE0MjQgLTkuNjk5ODcsLTE3LjAzNTEgLTE0LjcwMTgsLTE1LjkzNjQgLTMuMjMyNzksMC43MSAtOC4xNzUxNyw1LjY1NDYgLTEwLjQwMTA1LDEwLjQwNTcgLTAuOTU1OTQsMi4wNDA1IC05Ljk5NTUyLDI3LjExNTggLTIwLjA4NzkyLDU1LjcyMyAtMTAuMDkyNCwyOC42MDcyIC0yMi42OTU5Miw2NC4yOTIyIC0yOC4wMDc4Myw3OS4yOTk4IC01LjMxMTkxLDE1LjAwNzYgLTkuNDI1MzQsMjcuNjYzMSAtOS4xNDEwMiwyOC4xMjMyIDAuNTA1MzMsMC44MTc2IDcuNjE3OTUsLTIuNzQ3NSAxOC4yNjY3MywtOS4xNTU5IGwgMCwwIDAsMCAwLDAgeiBtIDM5LjMzODg5LC0xMDIuNzUyNSBjIDMuOTk1NjgsLTExLjcxMjEgNy41ODcyOCwtMjEuMTkxNCA3Ljk4MTI5LC0yMS4wNjUyIDEuMTcyMzIsMC4zNzU4IDE0Ljc5NDAyLDI1LjUyNDMgMTQuMjc3NjEsMjYuMzU5OCAtMC40NjQwMSwwLjc1MDggLTI1LjIzNjUzLDE0LjM4NjEgLTI4LjA4NDMyLDE1LjQ1ODIgLTEuMTI0NzYsMC40MjM0IDAuMTQ4NzMsLTQuMTEzOCA1LjgyNTQyLC0yMC43NTI4IGwgMCwwIHogTSAzMDkuNjYzMDQsLTYyLjA1NSBjIC0xMy42MDM4NywtMjcuMzY2NSAtMjIuMzE3NDcsLTU0LjAyMjcgLTI3LjIwOTkzLC04My4yMzk1IC0yLjgwMzcsLTE2Ljc0MzEgLTMuNzg2MjUsLTI5LjUyMzMgLTMuNzg2MjUsLTQ5LjI0ODggMCwtMzguNTk2MSA3LjAwMjU5LC03NC42MzA1IDIxLjM1NTYyLC0xMDkuODkzIDMuNjU2NzYsLTguOTgzOSAxNC42OTE2MSwtMzEuNzk0MSAxNi4wMzI0NCwtMzMuMTQwOCAwLjU0MzYxLC0wLjU0NTkgNTQuMjQyNDUsMjkuNTg1MyA1Ni45NjMxNiwzMS45NjI5IDAuNDAwMTcsMC4zNDk3IC0xLjMzNTc4LDQuNjkgLTMuODU3NzIsOS42NDUxIC0xMS44Njc3OSwyMy4zMTc5IC0xOS42NzA1LDQ5LjMyODggLTIzLjE3MzU0LDc3LjI1MDUgLTEuNTAzNDUsMTEuOTgzNSAtMS4yODc0OSw0MC4xODE4IDAuNDAzNjUsNTIuNzA5NiAzLjY5ODg5LDI3LjQwMDUgMTEuNjA2NzMsNTMuMDQyOCAyMy4zMTAzMyw3NS41ODcyIDIuOTk0NDEsNS43NjggMy41ODYzNiw3LjUzOTMgMi43ODA4NSw4LjMyMDkgLTEuNzUxMzEsMS42OTk1IC01NC41NTA2LDMxLjkwNDkgLTU1Ljc2OTkyLDMxLjkwNDkgLTAuNjUzNTgsMCAtMy43MDg5NiwtNS4xNDA1IC03LjA0ODY5LC0xMS44NTkgbCAwLDAgMCwwIDAsMCB6IgogICAgICAgICBpZD0icGF0aDI3MjQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlMDI4MjYiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gMzQ4LjE3NzI5LC0zMjQuODEzNCBjIC0xNS4wNzU4OCwtOC42OTU3IC0yNy45MDI2LC0xNi4zMDIyIC0yOC41MDM4MywtMTYuOTAzNSAtMC45MDI2OSwtMC45MDI2IC0wLjEzNzM0LC0yLjYwMDQgNC4zOTMwMiwtOS43NDU4IDM5Ljg5NTM2LC02Mi45MjI2IDEwNC4yNzczNiwtMTA5LjA0ODEgMTc3LjA3NjIyLC0xMjYuODYzNiAyMC4zOTQzNSwtNC45OTA5IDM5LjY0NTgxLC03LjY1NjMgNTguODExMjMsLTguMTQyNCBsIDguNzM4MjEsLTAuMjIxNiAwLDMzLjI4ODQgMCwzMy4yODg0IC05Ljk4NjUzLDAuNTc2OCBjIC00MC40NzE3NywyLjMzNzMgLTc4LjgyNjQ1LDE1LjA4NDMgLTExMi4wOTcyMywzNy4yNTUgLTE0LjgzMjQ2LDkuODgzOSAtMjMuMjY3LDE2Ljc2MDYgLTM1LjIyNzczLDI4LjcyMTMgLTExLjYzNjYsMTEuNjM2NiAtMTguNzAyNTMsMjAuMjQ3NiAtMjguMDE3OTksMzQuMTQ0NCAtMy42ODE4Niw1LjQ5MjYgLTYuOTM3MzcsMTAuMDgyNSAtNy4yMzQ0NCwxMC4xOTk4IC0wLjI5NzE2LDAuMTE3MiAtMTIuODc1MDEsLTYuOTAxNCAtMjcuOTUwOTMsLTE1LjU5NzEgbCAwLC0xMGUtNSAwLDAgMCwwIHoiCiAgICAgICAgIGlkPSJwYXRoMjcyMiIKICAgICAgICAgc3R5bGU9ImZpbGw6IzNkOWM0NiIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAzNDcuMDE2NDYsLTYyLjg1MzggYyAxNC45MjMzLC04LjU2MTIgMjcuNzI3NjUsLTE1LjU5NTcgMjguNDU0MTUsLTE1LjYzMjUgMC44NzM2MSwtMC4wNDQgMy4yMjI5NCwyLjgxNzUgNi45MzU4Niw4LjQ0ODIgMzkuMjc5MTIsNTkuNTY2NyAxMDQuNTM1MTIsOTcuMjU5NiAxNzUuNzA0NTIsMTAxLjQ5MDQgNS41NTAxLDAuMzI5OCAxMC4zODcsMC45NjUgMTAuNzQ4NSwxLjQxMTUgMC43OTcyLDAuOTg0MSAwLjgwMTksNjMuMjM4MiAwLDY0Ljg4ODQgLTEuNjUyNiwzLjQyMjIgLTQ1LjM1MTEsLTEuNDY3IC02OS42MDY4LC03Ljc4NzggLTI4LjI3MjUsLTcuMzY3NiAtNDguNTUyNSwtMTUuNzEwOCAtNzQuMzY3OCwtMzAuNTk1IC0yNS42OTYzNCwtMTQuODE1IC00My4wNzc5NCwtMjguMjE5NiAtNjMuNjc5OTYsLTQ5LjEwNjkgLTE3LjA2MTEyLC0xNy4yOTcyIC00My4zNDI1OSwtNTIuNzUzNCAtNDEuODA4NzUsLTU2LjQwMzUgMC4yNjQ5NywtMC42MzA5IDEyLjY5MjAxLC04LjE1MTYgMjcuNjE1MTgsLTE2LjcxMjcgbCAtNWUtNSwxZS00IDAsMCAwLjAwNSwtMmUtNCB6IgogICAgICAgICBpZD0icGF0aDI4MDIiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZWVlZWMiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gNTczLjY4NCw5OC42NSBjIC0wLjIzODk2LC0wLjYyMjkgLTAuMzM2NTUsLTE1LjczNyAtMC4yMTY0OCwtMzMuNTg2OSBsIDAuMjE4MDIsLTMyLjQ1NDIgOS45ODY1MywtMC41NzY3IGMgNDAuNDM5MTYsLTIuMzM1NSA3OC44NjQyOSwtMTUuMTA5MiAxMTIuMTI1OTUsLTM3LjI3NCAxNC43MTg1NiwtOS44MDgxIDIzLjE4ODU3LC0xNi43MjEyIDM1LjE4NDM4LC0yOC43MTcxIDExLjY3NTAzLC0xMS42NzUxIDE4Ljc3NTU0LC0yMC4zMTk5IDI4LjAzMjY4LC0zNC4xMjk2IDMuNjgxODMsLTUuNDkyNiA2Ljk0ODkyLC0xMC4wODY0IDcuMjYwMjgsLTEwLjIwODQgMC42ODM1NiwtMC4yNjc5IDU0Ljg2Mzg0LDMwLjk0NDIgNTYuNDI0ODQsMzIuNTA1MSAwLjkwODEsMC45MDgxIDAuMTg0NCwyLjUzNjkgLTQuMiw5LjQ1MTggLTI3LjgzMjEsNDMuODk2NyAtNjguNzU3NjYsODAuOTM4OSAtMTE1LjA2NzQyLDEwNC4xNDkgLTM4LjA0NDk1LDE5LjA2OCAtNzUuMTY3MDcsMjguNzkyMyAtMTE5Ljk2MDIsMzEuNDI0IC03LjUwMzQyLDAuNDQxIC05LjQzOTc4LDAuMzI1NiAtOS43ODg0MywtMC41ODMgbCAtMS41ZS00LDAgMCwwIDAsMCB6IG0gLTk3Ljk3OTE5LC0zNDkuNjY2NSBjIC01MS42MDA3NSwtMjkuODM4NiAtOTMuODE5NjUsLTU0LjYyNjUgLTkzLjgxOTc3LC01NS4wODQyIC0zLjRlLTQsLTEuMjAyIDE4Ny4yMDY1OSwtMTA5LjAxOTUgMTg5LjI5Mzk5LC0xMDkuMDE5NSAyLjMzMTQxLDAgMTkwLjQ2MDU2LDEwOC42NDk0IDE4OS41OTU4MSwxMDkuNDk2NSAtMS44ODA2OSwxLjg0MjUgLTE4OC41MjYxMiwxMDguOTUxNSAtMTg5Ljc4MTg0LDEwOC45MDg5IC0wLjgwNzc5LC0wLjAyOCAtNDMuNjg3NDMsLTI0LjQ2MzEgLTk1LjI4ODE5LC01NC4zMDE3IGwgMCwwIHogbSA2Mi4zMDA5Nyw0LjU3NzQgYyAxLjg2MTksLTAuOTQ5OSAzLjk0NTA1LC0yLjU5MTMgNC42MjkyMywtMy42NDc1IDAuNjg0MTgsLTEuMDU2MiA3LjE0MjQ2LC0xMy4yNDg5IDE0LjM1MTgzLC0yNy4wOTQ4IDcuMjA5MjgsLTEzLjg0NTkgMTMuMzY4NTQsLTI1LjE3NDMgMTMuNjg3MiwtMjUuMTc0MyAwLjMxODYyLDAgNi41NTY2OSwxMS42NDIzIDEzLjg2MjM5LDI1Ljg3MTcgOS4xMjQyMywxNy43NzE2IDE0LjEyNjQ3LDI2LjYxOTYgMTUuOTc2ODIsMjguMjYwMiA1LjUyMzU1LDQuODk3MyAxNS45NTcsNS4zODQ3IDIyLjIyNzE4LDEuMDM4MyAzLjExMzI0LC0yLjE1ODEgNS4xNjUyNywtNS45MDA0IDI2LjUyOTc1LC00OC4zODI4IDEyLjczNTU0LC0yNS4zMjQxIDIyLjk1MjI2LC00Ni41NzM1IDIyLjcwMzg0LC00Ny4yMjA5IC0wLjM2NDAyLC0wLjk0ODYgLTMuMDgwOTcsLTEuMTc0NiAtMTQuMDAxMjEsLTEuMTY0MyAtNy40NTIyNywwLjAxIC0xMy45NzI5LDAuMjg3OSAtMTQuNDkwMzYsMC42MjQyIC0wLjUxNzUsMC4zMzYyIC03Ljc1MjE1LDE0LjIzNjEgLTE2LjA3NzA2LDMwLjg4ODQgLTguNDE5NzcsMTYuODQyMiAtMTUuNDQ4MzQsMjkuOTUxNiAtMTUuODM5NjQsMjkuNTQzNSAtMC4zODY5MywtMC40MDM1IC02LjQwOTEzLC0xMS43ODEyIC0xMy4zODI3NywtMjUuMjgzOCAtNi45NzM2NSwtMTMuNTAyNiAtMTMuNjA5NzMsLTI1LjgwODEgLTE0Ljc0NjkyLC0yNy4zNDU1IC01LjU4NjQ5LC03LjU1MjcgLTE4Ljk5NzcyLC03Ljc3NDMgLTI1LjE4MDk3LC0wLjQxNiAtMS4xMjUzNCwxLjMzOTIgLTguMDM4MDEsMTMuOTM0MyAtMTUuMzYxNDcsMjcuOTg5IC03LjMyMzQzLDE0LjA1NDggLTEzLjUxNjM4LDI1LjU1NzkgLTEzLjc2MjA5LDI1LjU2MjYgLTAuMjQ1NzQsMC4wMSAtNi45NzI0NywtMTMuMTkyNSAtMTQuOTQ4NCwtMjkuMzI3IC03Ljk3NTg5LC0xNi4xMzQ1IC0xNS4wNDE5NSwtMjkuOTkwOCAtMTUuNzAyMywtMzAuNzkxOCAtMS4wNTA3MiwtMS4yNzQ1IC0yLjgyMTE2LC0xLjQ1NDcgLTE0LjE3ODk0LC0xLjQ0MzYgLTcuMTM4MDksMC4wMSAtMTMuNTA0MzgsMC4zNDU4IC0xNC4xNDczLDAuNzUyOCAtMS4yODI3NSwwLjgxMjEgNS4yNDk0NiwxNS4wNzc2IDMwLjEzNTMsNjUuODExMyAxMy4zODg1NiwyNy4yOTQ2IDE1LjA5MjI0LDI5Ljg5MDYgMjEuMDgwNSwzMi4xMjA0IDQuMjk2OTEsMS42MDAxIDEyLjMxMDIyLDEuMDM2NCAxNi42MzUzOSwtMS4xNzAxIGwgMCwwIDAsMCB6IgogICAgICAgICBpZD0icGF0aDI3MjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMDRhOTYiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K";

    mark2.VERSION = '1.0';

    mark2.ui = (function() {

        // This is a workaround for a Chrome bug:
        // https://code.google.com/p/chromium/issues/detail?id=132014
        function newProgressBar(jobDescription) {
            var div = document.createElement('div');
            div.classList.add('progressBar');
            div.style.border = '1px solid #00C0C0';
            div.style.borderRadius = '15px';
            div.style.textAlign = 'right';

            // We must add some text so the height of this div is
            // computed correctly, but we set it's opacity to 0 so
            // it cannot be seen.
            div.style.color = 'transparent';
            div.appendChild(document.createTextNode('.'));

            var jobDescriptionSpan = null;
            if(jobDescription) {
                jobDescriptionSpan = document.createElement('span');
                jobDescriptionSpan.style.marginRight = '5px';
                jobDescriptionSpan.style.color = 'black';
                jobDescriptionSpan.style.position = 'relative';
                jobDescriptionSpan.style.bottom = '5px';
                div.appendChild(jobDescriptionSpan);
                jobDescriptionSpan.appendChild(document.createTextNode(jobDescription));
            }

            div.style.background = '#DEE';
            div.style.boxShadow = 'inset 0px 1px 2px 0px rgba(0, 0, 0, 0.5), 0px 0px 0px 0px #FFF';

            var progress = document.createElement('div');
            div.appendChild(progress);
            progress.style.position = 'absolute';
            progress.style.top = '0px';
            progress.style.bottom = '0px';
            progress.style.left = '0px';

            progress.classList.add('progressDiv');
            progress.style.webkitTransitionDuration = '0.5s';
            progress.style.webkitTransitionProperty = 'right, display';
            progress.style.color = 'black';

            function refresh() {
                var percent;
                if(div.max !== 0) {
                    percent = 100*(div.value / div.max);
                } else {
                    percent = 0;
                }

                mark2.dom.emptyElement(progress);
                progress.appendChild(document.createTextNode(percent.toFixed(0) + "%"));

                progress.style.right = (100 - percent) + "%";

                // TODO - it would be pretty sexy to compute fontSize as a function
                // of the available space.
                jobDescriptionSpan.style.fontSize = '12px';
            }

            var value_ = 0;
            Object.defineProperty(div, 'value', {
                get: function() {
                    return value_;
                },
                set: function(value) {
                    value_ = value;
                    refresh();
                }
            });
            var max_ = 10;
            Object.defineProperty(div, 'max', {
                get: function() {
                    return max_;
                },
                set: function(max) {
                    max_ = max;
                    refresh();
                }
            });
            return div;
        }

        /*
         * Configuration Section
         */

        var settings;

        var eventsPerRow = 5;

        /*
         * Mark 2 Initialization
         */

        var div;
        var sortables;
        var roundsTable, eventsTable, competitionNameInput, passwordInput, roundsTbody;
        var scrambleButton, scrambleProgress, initializationProgress;
        var callbacks;

        var getCompetitionName = function() {
            return competitionNameInput.value;
        };

        var getRounds = function(includeElement) {
            var rounds = [];
            var eventsTBody = roundsTbody.children;

            for (var i = 0; i < eventsTBody.length; i++) {
                var tr = eventsTBody[i];
                if(tr.style.position == 'absolute') {
                    // This row is a clone of another row, and exists purely to make
                    // clicking and dragging look pretty.
                    continue;
                }

                var eventID = tr.getAttribute("data-event-id");

                var roundName = tr.getElementsByClassName("round_name")[0].value;
                var numSolves = parseInt(tr.getElementsByClassName("num_solves")[0].value, 10);
                var numExtraSolves = parseInt(tr.getElementsByClassName("num_extra_solves")[0].value, 10);

                var numGroups = parseInt(tr.getElementsByClassName("num_groups")[0].value, 10);

                var round = {
                    eventID: eventID,
                    roundName: roundName,
                    groupCount: numGroups,
                    scrambleCount: numSolves,
                    extraScrambleCount: numExtraSolves
                };
                if(includeElement) {
                    round.element = tr;
                }
                rounds.push(round);
            }

            return rounds;
        };

        // Converts 1, 2, ... to A, B, ..., Z, AA, AB, ..., ZZ, AAA, AAB, ...
        // A bit complicated right now, but should work fine.
        function intToLetters(n) {
            var numDigits;
            var maxForDigits = 1;
            var numWithThisManyDigits = 1;

            for (numDigits = 0; maxForDigits <= n; numDigits++) {
                numWithThisManyDigits *= 26;
                maxForDigits += numWithThisManyDigits;
            }

            var adjustedInt = n - (maxForDigits - numWithThisManyDigits);

            var out = "";
            for (var i = 0; i < numDigits; i++) {
                out = String.fromCharCode(65 + (adjustedInt % 26)) + out;
                adjustedInt = Math.floor(adjustedInt / 26);
            }
            return out;
        }

        var getScrambleSheets = function() {
            var rounds = getRounds();
            var sheets = [];
            var sheetByGuid = {};
            for(var i = 0; i < rounds.length; i++) {
                var round = rounds[i];
                for(var groupN = 0; groupN < round.groupCount; groupN++) {
                    var title = round.roundName;
                    if(round.groupCount > 1) {
                        title += " Group " + intToLetters(groupN + 1);
                    }
                    var eventName = mark2.settings.events[round.eventID].name;
                    var sheet = {
                        puzzle: settings.eventToPuzzle(round.eventID),
                        fmc: settings.isFmc(round.eventID),
                        title: eventName + " " + title,
                        scrambleCount: round.scrambleCount,
                        extraScrambleCount: round.extraScrambleCount
                    };

                    // Unfortunately, there's no guarantee that rounds in a
                    // competition have unique names, so we must suffix with a
                    // unique number.
                    var baseGuid = getCompetitionName() + sheet.puzzle + sheet.title;
                    var guid = baseGuid;
                    var uniqueId = 0;
                    while(sheetByGuid[guid]) {
                        guid = baseGuid + (++uniqueId);
                    }
                    sheet.guid = guid;

                    sheets.push(sheet);
                }
            }
            return sheets;
        };

        function sum(arr) {
            var total = 0;
            for(var i = 0; i < arr.length; i++) {
                total += arr[i];
            }
            return total;
        }

        function values(obj) {
            var vals = [];
            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    vals.push(obj[key]);
                }
            }
            return vals;
        }

        function getRequiredScrambleCount() {
            var requiredCounts = values(getRequiredScrambleCountByPuzzle());
            return sum(requiredCounts);
        }

        var generatedScrambleCountByGuid = {};
        function getGeneratedScrambleCount() {
            var generatedCounts = values(getGeneratedScrambleCountByPuzzle());
            return sum(generatedCounts);
        }

        function getRequiredScrambleCountByPuzzle() {
            var requiredScrambleCountByPuzzle = {};
            var sheets = getScrambleSheets();
            for(var i = 0; i < sheets.length; i++) {
                var sheet = sheets[i];
                requiredScrambleCountByPuzzle[sheet.puzzle] = (requiredScrambleCountByPuzzle[sheet.puzzle] || 0) + sheet.scrambleCount + sheet.extraScrambleCount;
            }
            return requiredScrambleCountByPuzzle;
        }

        function getGeneratedScrambleCountByPuzzle() {
            var generatedScrambleCountByPuzzle = {};
            var sheets = getScrambleSheets();
            for(var i = 0; i < sheets.length; i++) {
                var sheet = sheets[i];
                // There may be more scrambles generated for this sheet than we need.
                var additionalScramblesCount = Math.min(
                    sheet.scrambleCount + sheet.extraScrambleCount,
                    (generatedScrambleCountByGuid[sheet.guid] || 0)
                );

                generatedScrambleCountByPuzzle[sheet.puzzle] = (
                    (generatedScrambleCountByPuzzle[sheet.puzzle] || 0) +
                    additionalScramblesCount
                );
                        
            }
            return generatedScrambleCountByPuzzle;
        }


        function getMissingScrambleCountByPuzzle() {
            var requiredScrambleCountByPuzzle = getRequiredScrambleCountByPuzzle();
            var generatedScrambleCountByPuzzle = getGeneratedScrambleCountByPuzzle();

            for(var puzzle in requiredScrambleCountByPuzzle) {
                if(requiredScrambleCountByPuzzle.hasOwnProperty(puzzle)) {
                    requiredScrambleCountByPuzzle[puzzle] -= generatedScrambleCountByPuzzle[puzzle];
                }
            }
            return requiredScrambleCountByPuzzle;
        }

        var initializationByPuzzle = {};
        function getInitializationAndPuzzleCount() {
            var puzzleCount = 0;
            var initializationCount = 0;

            var missingScrambleCountByPuzzle = getMissingScrambleCountByPuzzle();
            for(var puzzle in missingScrambleCountByPuzzle) {
                if(missingScrambleCountByPuzzle.hasOwnProperty(puzzle)) {
                    if(missingScrambleCountByPuzzle[puzzle] === 0 && (initializationByPuzzle[puzzle] || 0) === 0) {
                        // Note that if the server restarts, we may end up in a state where we have
                        // all the 4x4 scrambles we care about, but the 4x4 scrambler is not yet
                        // initialized. However, while we're waiting for two puzzles to initialize,
                        // we don't want to stop reporting one's status just because it's
                        // scrambles have been generated.
                        continue;
                    }
                    initializationCount += initializationByPuzzle[puzzle] || 0;
                    puzzleCount++;
                }
            }
            return [ initializationCount, puzzleCount ];
        }

        function maybeEnableScrambleButton() {
            var initializationAndPuzzleCount = getInitializationAndPuzzleCount();
            var initializationCount = initializationAndPuzzleCount[0];
            var puzzleCount = initializationAndPuzzleCount[1];

            var generatedCount = getGeneratedScrambleCount();
            var requiredCount = getRequiredScrambleCount();

            var disableScrambleButton = false;
            if(requiredCount === 0) {
                // If the user hasn't asked for any scrambles, then there's no
                // use letting them click the scramble button.
                disableScrambleButton = true;
            } else {
                disableScrambleButton = generatedCount < requiredCount;
            }
            if(getCompetitionName().length === 0) {
                disableScrambleButton = true;
            }
            scrambleButton.disabled = disableScrambleButton;

            initializationProgress.max = puzzleCount;
            initializationProgress.value = initializationCount;
            scrambleProgress.max = requiredCount;
            scrambleProgress.value = generatedCount;

            var initializing = initializationCount < puzzleCount;
            var scrambling = ( generatedCount < requiredCount ) && requiredCount > 0;

            initializationProgress.style.display = 'none';
            scrambleProgress.style.display = 'none';
            scrambleButton.style.visibility = 'hidden';
            if(initializing) {
                initializationProgress.style.display = '';
            } else if(scrambling) {
                scrambleProgress.style.display = '';
            } else {
                scrambleButton.style.visibility = '';
            }

        }

        function findStringsAndSurroundWith(str, encapsulator, newEncapsulator) {
            assert(encapsulator.length == 1);
            assert(newEncapsulator.length == 1);
            // Replace all strings in encapsulator with strings in newEncapsulator
            var stringRe = new RegExp(encapsulator + "([^" + encapsulator + "\\\\]|\\\\.)*" + encapsulator, "g");
            str = str.replace(stringRe, function(str) {
                // Remove beginning and ending encapsulator
                str = str.substring(1, str.length - 1);
                // Replace unescaped newEncapsulator with escaped
                // single quotes
                var escapedStr = "";
                for(var i = 0; i < str.length; i++) {
                    if(str[i] == '\\') {
                        // slurp up the escaped character as well
                        i++;
                        escapedStr += "\\" + str[i];
                        continue;
                    }
                    if(str[i] == newEncapsulator) {
                        // escape unescaped newEncapsulator
                        escapedStr += "\\" + newEncapsulator;
                    } else {
                        escapedStr += str[i];
                    }
                }
                return newEncapsulator + escapedStr + newEncapsulator;
            });
            return str;
        }

        function findNotInDoubleQuoteAndReplaceWith(str, findStr, replaceStr) {
            assert(findStr.length == 1);
            assert(replaceStr.length == 1);

            var inString = false;
            var newStr = "";
            for(var i = 0; i < str.length; i++) {
                if(inString) {
                    if(str[i] == '"') {
                        // this is the end, beautiful friend
                        inString = false;
                    } else if(str[i] == "\\") {
                        // skip over the next character, since it's escaped
                        newStr += "\\" + str[++i];
                        continue;
                    }
                    newStr += str[i];
                } else {
                    if(str[i] == '"') {
                        inString = true;
                    } else if(str[i] == findStr) {
                        newStr += replaceStr;
                        continue;
                    }
                    newStr += str[i];
                }
            }

            return newStr;
        }

        var parseUrlPretty = function(urlPretty) {
            // Replace all strings in single quotes with strings in double quotes
            var json = findStringsAndSurroundWith(urlPretty, "'", '"');
            json = findNotInDoubleQuoteAndReplaceWith(json, "(", "{");
            json = findNotInDoubleQuoteAndReplaceWith(json, ")", "}");
            json = findNotInDoubleQuoteAndReplaceWith(json, "-", ":");

            json = findNotInDoubleQuoteAndReplaceWith(json, "_", ",");
            json = findNotInDoubleQuoteAndReplaceWith(json, "i", "[");
            json = findNotInDoubleQuoteAndReplaceWith(json, "!", "]");

            return JSON.parse(json);
        };
        var toURLPretty = function(obj) {
            var json = JSON.stringify(obj);
            var urlPretty = findStringsAndSurroundWith(json, '"', "'");
            urlPretty = findNotInDoubleQuoteAndReplaceWith(urlPretty, "{", "(");
            urlPretty = findNotInDoubleQuoteAndReplaceWith(urlPretty, "}", ")");
            urlPretty = findNotInDoubleQuoteAndReplaceWith(urlPretty, ":", "-");

            urlPretty = findNotInDoubleQuoteAndReplaceWith(urlPretty, ",", "_");
            urlPretty = findNotInDoubleQuoteAndReplaceWith(urlPretty, "[", "i");
            urlPretty = findNotInDoubleQuoteAndReplaceWith(urlPretty, "]", "!");

            return urlPretty;
        };

        var updateHash = function() {
            var competitionName = encodeURIComponent(getCompetitionName());
            var roundsHash = encodeURIComponent(toURLPretty(getRounds()));
            try {
                location.hash = "#competitionName=" + competitionName + "&rounds=" + roundsHash + "&version=" + mark2.VERSION;
            } catch(e) {
                // Ideally, we'd only catch "Access is Denied" errors, but I don't know how to do that in js.
                alert("Error setting url hash: " + e + "\n" +
                        'An "Access is Denied" error occurs on Internet Explorer when you add more than ~25 rounds.' +
                        ' If you need support for more rounds, consider using a different browser.');
            }

            callbacks.competitionChanged();
            maybeEnableScrambleButton();
        };

        var numCurrentRounds = function(eventID) {
            var rounds = getRounds();
            var count = 0;
            for(var i = 0; i < rounds.length; i++) {
                if(rounds[i].eventID == eventID) {
                    count++;
                }
            }
            return count;
        };

        var removeRound = function(eventID, scrambleID) {
            roundsTbody.removeChild(document.getElementById(scrambleID));
            document.getElementById("event_amount_value_" + eventID).value = numCurrentRounds(eventID);

            updateHash();
        };

        var removeLastRound = function(eventID) {
            var rounds = getRounds(true);
            var lastRoundOfEvent = null;
            for(var i = 0; i < rounds.length; i++) {
                if(rounds[i].eventID == eventID) {
                    lastRoundOfEvent = rounds[i];
                }
            }
            roundsTbody.removeChild(lastRoundOfEvent.element);
        };


        var addRound = function(eventID, roundNameOpt, numGroupsOpt, numSolvesOpt, numExtraSolvesOpt) {
            var roundName = roundNameOpt;
            if (roundNameOpt === undefined) {
                roundName = "Round " + (numCurrentRounds(eventID)+1);
            }

            var numGroups = numGroupsOpt;
            if (numGroupsOpt === undefined) {
                numGroups = settings.default_num_groups;
            }

            var numSolves = numSolvesOpt;
            if (numSolvesOpt === undefined) {
                numSolves = settings.events[eventID].default_round.num_scrambles;
            }

            var numExtraSolves = numExtraSolvesOpt;
            if (numExtraSolvesOpt === undefined) {
                numExtraSolves = settings.events[eventID].default_round.num_extra_scrambles || 0;
            }

            var newEventTR_ID = mark2.dom.nextAutoID();
            var newEventTR = mark2.dom.appendElement(
                    null,
                    "tr",
                    { id: newEventTR_ID, "data-event-id": eventID }
                    );
            var rounds = getRounds(true);
            var lastRoundOfEvent = null;
            for(var i = 0; i < rounds.length; i++) {
                var round = rounds[i];
                if(round.eventID == eventID) {
                    lastRoundOfEvent = round.element;
                }
            }
            if(lastRoundOfEvent) {
                lastRoundOfEvent = lastRoundOfEvent.nextSibling;
            }
            roundsTbody.insertBefore(newEventTR, lastRoundOfEvent);

            var nameTD = mark2.dom.appendElement(
                    newEventTR,
                    "td",
                    {},
                    settings.events[eventID].name);
            nameTD.classList.add("event_name");

            var roundNameTD = mark2.dom.appendElement(newEventTR, "td");
            var roundNameInput = mark2.dom.appendElement(
                    roundNameTD,
                    "input",
                    { value: roundName }
                    );
            roundNameInput.classList.add("round_name");

            var numGroupsTD = mark2.dom.appendElement(newEventTR, "td");
            var numGroupsInput = mark2.dom.appendElement(
                    numGroupsTD,
                    "input",
                    { type: "number", value: numGroups, min: 1 }
                    );
            numGroupsInput.classList.add("num_groups");

            var numSolvesTD = mark2.dom.appendElement(newEventTR, "td");
            var numSolvesInput = mark2.dom.appendElement(
                    numSolvesTD,
                    "input",
                    { type: "number", value: numSolves, min: 1 }
                    );
            numSolvesInput.classList.add("num_solves");

            var numExtraSolvesTD = mark2.dom.appendElement(newEventTR, "td");
            var numExtraSolvesInput = mark2.dom.appendElement(
                    numExtraSolvesTD,
                    "input",
                    { type: "number", value: numExtraSolves, min: 0 }
                    );
            numExtraSolvesInput.classList.add("num_extra_solves");

            var removeTD = mark2.dom.appendElement(newEventTR, "td");
            removeTD.classList.add("round_remove");
            var removeButton = mark2.dom.appendElement(removeTD, "button", {}, "X");
            removeButton.addEventListener("click", removeRound.bind(null, eventID, newEventTR_ID), false);

            roundNameInput.addEventListener("change", updateHash, false);
            numSolvesInput.addEventListener("change", updateHash, false);
            numExtraSolvesInput.addEventListener("change", updateHash, false);
            numGroupsInput.addEventListener("change", updateHash, false);

            sortables.addItems(newEventTR);
        };


        var changeNumRounds = function(eventID, newNum) {
            if (isNaN(newNum)) {
                return;
            }

            var currentNum = numCurrentRounds(eventID);

            var i;
            if (currentNum < newNum) {
                for (i = 0; i < newNum - currentNum; i++) {
                    addRound(eventID);
                }
            }
            else if (newNum < currentNum) {
                for (i = 0; i < currentNum - newNum; i++) {
                    removeLastRound(eventID);
                }
            }

            if (parseInt(document.getElementById("event_amount_value_" + eventID).value, 10) !== newNum) {
                document.getElementById("event_amount_value_" + eventID).value = newNum;
            }

            updateHash();
        };

        var initializeEventsTable = function() {
            var changeNumRoundsListener = function(eventID, el) {
                changeNumRounds(eventID, parseInt(el.value, 10));
            };
            var currentEventsTR;
            for (var i = 0; i < settings.event_order.length; i++) {
                var eventID = settings.event_order[i];

                settings.events[eventID].initialized = false;

                if (i % eventsPerRow === 0) {
                    currentEventsTR = mark2.dom.appendElement(eventsTable, "tr");
                }

                var eventTD = mark2.dom.appendElement(currentEventsTR, "td", {}, "" + eventID + ":");
                eventTD.classList.add("event_amount_label");

                var val = mark2.dom.appendElement(currentEventsTR, "td");
                val.classList.add("event_amount_value_td");
                var valInput = mark2.dom.appendElement(
                        val,
                        "input",
                        { id: "event_amount_value_" + eventID, type: "number", min: 0 }
                        );
                valInput.classList.add("event_amount_value");

                valInput.addEventListener("change", changeNumRoundsListener.bind(null, eventID, valInput, false));
            }
        };

        function updateEventAmountValues() {
            var eventInputs = eventsTable.getElementsByClassName("event_amount_value");
            for(var i = 0; i < eventInputs.length; i++) {
                var eventID = eventInputs[i].id.split("_")[3];
                eventInputs[i].value = numCurrentRounds(eventID);
                if(eventInputs[i] == document.activeElement) {
                    // Setting the value of a focused input clears it's selection.
                    // We'd rather it stay (or become) selected.
                    eventInputs[i].select();
                }
            }
        }

        function getHashParameter(name, alt) {
            var results = new RegExp( "[#&]"+name.replace(/[\[]/,"\\\\[").replace(/[\]]/,"\\\\]")+"=([^&#<]*)" ).exec( window.location.href );
            if (results === null) {
                return alt;
            }
            else {
                return decodeURIComponent(results[1]);
            }
        }

        var resetRounds = function() {
            mark2.dom.emptyElement(roundsTbody);
        };

        var addRounds = function(rounds) {
            for (var i = 0; i < rounds.length; i++) {
                addRound(rounds[i].eventID, rounds[i].roundName, rounds[i].groupCount, rounds[i].scrambleCount, rounds[i].extraScrambleCount);
            }
        };


        var initializeEvents = function() {
            var competitionNameHash = getHashParameter("competitionName", null);

            if (competitionNameHash !== null) {
                competitionNameInput.value = competitionNameHash;
            } else {
                // TODO - this also uses mootools, even though we don't explicitly
                // depend on mootools.
                var prettyDate = new Date().format("%Y-%m-%d");
                competitionNameInput.value = "Scrambles for " + prettyDate;
            }

            var roundsHash = getHashParameter("rounds", null);

            if (roundsHash === null) {
                resetRounds();
                addRounds(settings.default_rounds);
            }
            else if(roundsHash != toURLPretty(getRounds())) {
                var rounds = parseUrlPretty(roundsHash);
                resetRounds();
                addRounds(rounds);
            }
        };

        var initialize = function(name, callbacks_) {
            settings = mark2.settings;
            callbacks = callbacks_;

            assert(callbacks.showScrambles);
            assert(callbacks.competitionChanged);

            div = document.createElement('div');

            var topInterface = document.createElement('div');
            div.appendChild(topInterface);
            topInterface.id = 'top_interface';
            topInterface.classList.add('interface');

            var title = document.createElement('h1');
            topInterface.appendChild(title);
            title.id = 'title';

            var logo = document.createElement('img');
            title.appendChild(logo);
            logo.id = 'logo_top';
            logo.src = mark2.logo;

            var mark2Title = document.createElement('span');
            title.appendChild(mark2Title);
            mark2Title.classList.add('mark2_title');

            if(name) {
                mark2Title.appendChild(name);
            }
            else {
                mark2Title.appendChild(document.createTextNode('Mark 2'));

                var betaText = document.createElement('span');
                mark2Title.appendChild(betaText);
                betaText.classList.add('beta');
                betaText.appendChild(document.createTextNode('BETA 0.1b'));
            }


            var spacerDiv = document.createElement('div');
            topInterface.appendChild(spacerDiv);

            competitionNameInput = document.createElement('input');
            spacerDiv.appendChild(competitionNameInput);
            competitionNameInput.id = 'competitionName';
            competitionNameInput.placeholder = "Competition Name";

            var passwordDiv = document.createElement('div');
            spacerDiv.appendChild(passwordDiv);

            var showPasswordCheckbox = document.createElement("input");
            // IE <9 doesn't let you change the type attribute of an input element
            // after you've added it to the dom.
            showPasswordCheckbox.setAttribute('type', 'checkbox');

            spacerDiv.appendChild(showPasswordCheckbox);
            showPasswordCheckbox.id = "showPassword";

            var showPasswordCheckboxLabel = document.createElement("label");
            spacerDiv.appendChild(showPasswordCheckboxLabel);
            showPasswordCheckboxLabel.setAttribute("for", showPasswordCheckbox.id);
            showPasswordCheckboxLabel.appendChild(document.createTextNode('Show password'));

            scrambleButton = document.createElement('button');
            topInterface.appendChild(scrambleButton);
            scrambleButton.classList.add('scrambleButton');
            scrambleButton.appendChild(document.createTextNode("Scramble!"));

            // TODO - revert to progress bar once
            // https://code.google.com/p/chromium/issues/detail?id=132014 is resolved.
            //scrambleProgress = document.createElement('progress');
            scrambleProgress = newProgressBar("Generating scrambles");
            scrambleProgress.id = 'scrambleProgress';
            topInterface.appendChild(scrambleProgress);

            initializationProgress = newProgressBar("Puzzles initializing");
            initializationProgress.id = 'initializationProgress';
            topInterface.appendChild(initializationProgress);

            var eventsRoundsInterface = document.createElement('div');
            div.appendChild(eventsRoundsInterface);
            eventsRoundsInterface.id = "events_rounds_interface";
            eventsRoundsInterface.classList.add('interface');

            var resetButton = document.createElement('button');
            eventsRoundsInterface.appendChild(resetButton);
            resetButton.appendChild(document.createTextNode("Reset"));
            resetButton.classList.add('resetButton');

            spacerDiv = document.createElement('div');
            eventsRoundsInterface.appendChild(spacerDiv);

            var adjustEvents = document.createElement('h1');
            spacerDiv.appendChild(adjustEvents);

            adjustEvents.appendChild(document.createTextNode('Adjust Events:'));

            eventsTable = document.createElement('table');
            spacerDiv.appendChild(eventsTable);
            eventsTable.id = "events_table";

            spacerDiv = document.createElement('div');
            eventsRoundsInterface.appendChild(spacerDiv);

            var adjustIndividualRounds = document.createElement('h1');
            adjustIndividualRounds.appendChild(document.createTextNode('Adjust Individual Rounds:'));
            spacerDiv.appendChild(adjustIndividualRounds);
            roundsTable = document.createElement('table');
            spacerDiv.appendChild(roundsTable);
            roundsTable.id = "rounds_table";

            var thead = document.createElement('thead');
            roundsTable.appendChild(thead);
            var tr = document.createElement('tr');
            thead.appendChild(tr);
            var td;
            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode('Event'));
            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode('Round Names'));
            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode('# Groups'));
            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode('# Scrambles'));
            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode('# Extra Scrambles'));
            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode('Remove'));

            roundsTbody = document.createElement('tbody');
            roundsTable.appendChild(roundsTbody);

            // TODO
            //  - dragging doesn't work when cursor is outside of the table
            //    - do we actually want to support that?
            //
            // This is pretty bad, as scrambler-interface doesn't actually include mootools.
            // Ideally, we'd either move mootools into scrambler-interface (yuck), or remove the
            // dependency of on scrambler-interface on mootools (yikes).
            sortables = new Sortables(roundsTbody, {
                clone: true,
                opacity: 0.7,
                revert: true
            });
            sortables.addEvent('complete', function(e) {
                // A row has just been dropped somewhere, so we
                // update our url hash.
                updateHash();
            });

            resetButton.addEventListener('click', function() {
                location.hash = "";
            }, false);

            function showPasswordChanged() {
                // IE <9 doesn't let you change an input's type after it has
                // been added to the dom, so we simply create a new one here
                // and clobber the old one.
                var oldPass = null;
                if(passwordInput) {
                    oldPass = passwordInput.value;
                }
                passwordInput = document.createElement('input');
                if(oldPass) {
                    passwordInput.value = oldPass;
                }
                if(showPasswordCheckbox.checked) {
                    passwordInput.setAttribute('type', '');
                } else {
                    passwordInput.setAttribute('type', 'password');
                }
                mark2.dom.emptyElement(passwordDiv);
                passwordDiv.appendChild(passwordInput);
                passwordInput.id = 'passwordInput';
                passwordInput.placeholder = "Password";
                passwordInput.addEventListener('change', callbacks.competitionChanged, false);
            }
            showPasswordChanged();
            showPasswordCheckbox.addEventListener('change', showPasswordChanged, false);
            // IE doesn't fire the event until the checkbox loses focus, this just makes it
            // behave nicer.
            showPasswordCheckbox.addEventListener('click', showPasswordChanged, false);

            competitionNameInput.addEventListener('change', updateHash, false);

            scrambleButton.addEventListener('click', callbacks.showScrambles, false);

            initializeEventsTable();

            function urlChanged() {
                initializeEvents();
                updateEventAmountValues();
                maybeEnableScrambleButton();
            }
            urlChanged();

            // Must populate the gui before updating the hash
            updateHash();

            window.addEventListener('hashchange', urlChanged, false);

            return div;
        };

        function addHelpLink(url) {
            var topInterface = document.getElementById("top_interface");

            var helpLinkDiv = document.createElement('div');
            topInterface.appendChild(helpLinkDiv);
            helpLinkDiv.id = 'helpLinkDiv';

            var helpLink = document.createElement('a');
            helpLink.appendChild(document.createTextNode("?"));
            helpLink.href = url;
            helpLinkDiv.appendChild(helpLink);
        }

        /*
         * Events
         */

        var getPassword = function() {
            return passwordInput.value;
        };


        /*
         * Rounds
         */

        function countNonNullAndNonUndefined(arr) {
            var n = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i] !== null && arr[i] !== undefined) {
                    n++;
                }
            }
            return n;
        }

        var scramblesGenerated = function(scramblesByGuid) {
            generatedScrambleCountByGuid = {};
            for(var guid in scramblesByGuid) {
                if(scramblesByGuid.hasOwnProperty(guid)) {
                    generatedScrambleCountByGuid[guid] = countNonNullAndNonUndefined(scramblesByGuid[guid]);
                }
            }
            maybeEnableScrambleButton();
        };

        var puzzlesInitializing = function(initializationByPuzzle_) {
            initializationByPuzzle = initializationByPuzzle_;
            maybeEnableScrambleButton();
            var initializationAndPuzzleCount = getInitializationAndPuzzleCount();
            var initializationCount = initializationAndPuzzleCount[0];
            var puzzleCount = initializationAndPuzzleCount[1];
            return initializationCount >= puzzleCount;
        };

        /*
         * Public Interface
         */

        return {
            initialize: initialize,
            addHelpLink: addHelpLink,
            updateHash: updateHash,
            getScrambleSheets: getScrambleSheets,
            getTitle: getCompetitionName,
            getPassword: getPassword,
            scramblesGenerated: scramblesGenerated,
            puzzlesInitializing: puzzlesInitializing
        };
    })();

})();
