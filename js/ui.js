/*
 * Mark 2 Javascript Code
 *
 * Lucas Garron, November/December 2011
 *
 */

"use strict";

// Offline Caching
if (typeof window.applicationCache !== "undefined") {
	window.applicationCache.addEventListener('updateready', function() {
		window.applicationCache.swapCache();
		setTimeout(function() {location.reload(true)}, 1000); // Function.prototype.bind doesn't work for this, anyhow... :-(
	}, false);

	window.applicationCache.addEventListener('downloading', function() {
		document.body.innerHTML="<br><br><h1>Updating cache...<br><br>Page will reload in a moment.</h1>";
		document.body.style.setProperty("background", "#00C0C0");
		scramble.terminateWebWorkers(); // Call this last in case it's not defined yet.
	}, false);
}



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
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}



// Prevent errors if console.log doesn't exist (e.g. in IE when the console is not open).
if (typeof console === "undefined") {
	console = {};
}
if (typeof console.log === "undefined") {
	console.log = function() {};
}

if(typeof assert === "undefined") {
	var assert = function(bool) {
		if(!bool) {
			throw "Assertion!";
		}
	};
}



var mark2 = {};


/*

DOM Convenience Methods

These methods are a bit brittle and awkward, but they save us the issues of including all of jQuery into a project that is not highly DOM-focused.

*/

mark2.dom = (function() {

	/*
	 * DOM Manipulation
	 */

	var appendElement = function(elementToAppendTo, type, className, id, content) {

		var newElement = document.createElement(type);
		if (className) {
			newElement.setAttribute("class", className);
		}
		if (content) {
			newElement.innerHTML = content
		}
		if (id) {
			newElement.setAttribute("id", id);
		}
		if (elementToAppendTo) {
			elementToAppendTo.appendChild(newElement);
		}
		return newElement;
	};

	var currentAutoID = "0";

	var nextAutoID = function() {
		return "auto_id_" + (currentAutoID++);
	}

	var addClass = function(el, className) {
		if (typeof el.classList !== "undefined") {
			el.classList.add(className);
		}
	}

	var removeClass = function(el, className) {
		if (typeof el.classList !== "undefined") {
			el.classList.remove(className);
		}
		
	}

	var showElement = function(el) {
		el.style.display = "block";
	}

	var hideElement = function(el) {
		el.style.display = "none";
	}



	/*
	 * Public Interface
	 */

	return {
		appendElement: appendElement,
		nextAutoID: nextAutoID,
		addClass: addClass,
		removeClass: removeClass,
		showElement: showElement,
		hideElement: hideElement
	};
})();

mark2.settings = (function() {

	var events = {
		// Official WCA events as of November 24, 2011
		"333":    {name: "Rubik's Cube", default_round: {type: "avg",  num_scrambles: 5 } },
		"444":    {name: "4x4 Cube", default_round: {type: "avg",  num_scrambles: 5 } },
		"555":    {name: "5x5 Cube", default_round: {type: "avg",  num_scrambles: 5 } },
		"222":    {name: "2x2 Cube", default_round: {type: "avg",  num_scrambles: 5 } },
		"333bf":  {name: "3x3 blindfolded", default_round: {type: "best", num_scrambles: 3 } },
		"333oh":  {name: "3x3 one-handed", default_round: {type: "avg",  num_scrambles: 5 } },
		"333fm":  {name: "3x3 fewest moves", default_round: {type: "best", num_scrambles: 2 } },
		"333ft":  {name: "3x3 with feet", default_round: {type: "avg",  num_scrambles: 5 } },
		"minx":   {name: "Megaminx", default_round: {type: "avg",  num_scrambles: 5 } },
		"pyram":  {name: "Pyraminx", default_round: {type: "avg",  num_scrambles: 5 } },
		"sq1":    {name: "Square-1", default_round: {type: "avg",  num_scrambles: 5 } },
		"clock":  {name: "Rubik's Clock", default_round: {type: "avg",  num_scrambles: 5 } }, 
		"666":    {name: "6x6 Cube", default_round: {type: "mean", num_scrambles: 3 } },
		"777":    {name: "7x7 Cube", default_round: {type: "mean", num_scrambles: 3 } },
		//"magic" 
		//"mmagic"
		"444bf":  {name: "4x4 blindfolded", default_round: {type: "best", num_scrambles: 3 } },
		"555bf":  {name: "5x5 blindfolded", default_round: {type: "best", num_scrambles: 3 } },
		"333mbf": {name: "3x3 multi blind", default_round: {type: "mbf",  num_scrambles: 28} }
		
		// Unofficial events
		//"skewb"
	}

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
		//"magic",
		//"mmagic",
		"444bf",
		"555bf",
		"333mbf"
		//"skewb"
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
			"555bf" : "444",
			"333mbf" : "333"
		};
		return puzzByEvent[eventID] || eventID;
	}

	var defaultRounds = [
		{ eventID: "333",
		  roundName: "Round 1",
		  groupCount: 1,
		  scrambleCount: events["333"].default_round.num_scrambles }
	];

	// Round types are not currently used.
	/*
	var roundTypeNames = {
		"avg": "Average of",
		"best": "Best of",
		"combined": "Combined Round of",
		"mean": "Mean of",
		"mbf": "Multi Blind of"
	}
	*/

	var defaultNumGroups = 1;

	return {
		events: events,
		eventToPuzzle: eventToPuzzle,
		isFmc: isFmc,
		event_order: eventOrder,
		default_rounds: defaultRounds,
		
		default_num_groups: defaultNumGroups,
	};
})();

// converted to data uri with http://dataurl.net/#dataurlmaker
mark2.logo = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB2ZXJzaW9uPSIxLjAiCiAgIHdpZHRoPSI4MC4wMDAwMTUiCiAgIGhlaWdodD0iODAuMTI3OTc1IgogICBpZD0ic3ZnMiIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC40OC4wIHI5NjU0IgogICBzb2RpcG9kaTpkb2NuYW1lPSJ3Y2FfbG9nby5zdmciPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTI4MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI2ODMiCiAgICAgaWQ9Im5hbWVkdmlldzE1IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIxLjc4NzIxNTkiCiAgICAgaW5rc2NhcGU6Y3g9IjEwNy44NDcyIgogICAgIGlua3NjYXBlOmN5PSI0MC42MDk0MTQiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmcyIgogICAgIGZpdC1tYXJnaW4tdG9wPSIwIgogICAgIGZpdC1tYXJnaW4tbGVmdD0iMCIKICAgICBmaXQtbWFyZ2luLXJpZ2h0PSIwIgogICAgIGZpdC1tYXJnaW4tYm90dG9tPSIwIj4KICAgIDxpbmtzY2FwZTpncmlkCiAgICAgICBlbXBzcGFjaW5nPSI1IgogICAgICAgdmlzaWJsZT0idHJ1ZSIKICAgICAgIGVuYWJsZWQ9InRydWUiCiAgICAgICBzbmFwdmlzaWJsZWdyaWRsaW5lc29ubHk9InRydWUiCiAgICAgICB0eXBlPSJ4eWdyaWQiCiAgICAgICBpZD0iZ3JpZDI5OTIiIC8+CiAgPC9zb2RpcG9kaTpuYW1lZHZpZXc+CiAgPGRlZnMKICAgICBpZD0iZGVmczQiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGUgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjI3MzI5Mzg4LDAsMCwwLjI3MzI5Mzg4LC0xMjAuNDk2OTQsMTMzLjQ1MTQ2KSIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjQ5OTk4OSwwLDAsMC40OTk5ODksMzAxLjYxOCwtMjQ0Ljg1NCkiCiAgICAgICBpZD0iZzMzMTIiPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDU3MS4yNjk4MiwtNDg2LjY4NDcgYyAtMTYxLjk4NDAyLDAgLTI5Mi42ODc1LDEzMS4wMjk0IC0yOTIuNjg3NSwyOTMuMDEzNSAwLDE2MS45ODM5IDEzMC4wNzE0OCwyOTIuMjQ5MyAyOTIuMDU1NSwyOTIuMjQ5MyAxNjEuOTg0MDMsMCAyOTMuMTg0OTgsLTEyOS43NjAzIDI5My4xODQ5OCwtMjkxLjc0NDIgMCwtMTYxLjk4NDEgLTEzMC4zMjM0MSwtMjkzLjU2MzIgLTI5Mi4zMDc0NCwtMjkzLjU2MzIgbCAtMC4yNDU1NCwwLjA0NSAwLC00ZS00IDAsMCAwLDAgMCwwIDAsMCB6IG0gLTAuMDIyMyw2Ni41NDc5IGMgMTI1LjE4MjE2LDAgMjI2LjE0OTk4LDEwMS4yODM0IDIyNi4xNDk5OCwyMjYuNDY1NiAwLDEyNS4xODIgLTEwMC45Njc4MiwyMjYuNTI4NyAtMjI2LjE0OTk4LDIyNi41Mjg3IC0xMjUuMTgyMTQsMCAtMjI2Ljc4MTI1LC0xMDEuMzQ2NyAtMjI2Ljc4MTI1LC0yMjYuNTI4NyAwLC0xMjUuMTgyMiAxMDEuNTk5MTEsLTIyNi40NjU2IDIyNi43ODEyNSwtMjI2LjQ2NTYgbCAwLDAgeiIKICAgICAgICAgaWQ9InBhdGgzMjczIgogICAgICAgICBzdHlsZT0iZmlsbDojZWVlZWVjO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lIgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDM3OS4wNTk1MiwtMzA0LjUyMzQgYyAwLDAgMTkyLjIwMDkyLC0xMTAuNjExMyAxOTIuMjAwOTIsLTExMC42MTEzIDAsMCAxOTEuNDc4NDgsMTEwLjcxNiAxOTEuNDc4NDgsMTEwLjcxNiBMIDc2Mi40MTI0MSwtODIuNTQyMyA1NzAuNzM1OTcsMjguMzIxOSAzNzguODA2OTksLTgyLjU0MjQgbCAwLjI1MjUzLC0yMjEuOTgxIDAsMCB6IgogICAgICAgICBpZD0icmVjdDI4MDQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZWVlZWM7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmUiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gNDcyLjk4Nzk1LC0yOC4wNjEyIC05NC4wMzk3NCwtNTQuMzUyNyAtMC4yMTEyNSwtMTA5LjMwMjIgYyAtMC4xMTYwOSwtNjAuMTE2MyAwLjA3MTEsLTEwOS41NjI0IDAuNDE2MDksLTEwOS44ODAzIDAuNDU0NjUsLTAuNDE5IDE1Ny42NzIyNyw4OS43NjU4IDE4Ni44NjUyMSwxMDcuMTkxNSBsIDMuMDg5OSwxLjg0NDQgMCwxMDkuNDYzNyBjIDAsODcuMDM2NCAtMC4yMTMwOSwxMDkuNDU2MSAtMS4wNDAyOCwxMDkuNDI2IC0wLjU3MjE1LC0wLjAyMiAtNDMuMzU4MTUsLTI0LjQ5NjQgLTk1LjA4MDAyLC01NC4zOTA0IGwgOWUtNSwwIDAsMCAwLDAgeiBtIDUyLjg0NTM2LC0yNi4zMDYgYyAwLC0xMi44Nzk0IC0wLjE4Nzg1LC0xNS4wMDQ3IC0xLjQ1NjM3LC0xNi40ODQ4IC0wLjgwMDk5LC0wLjkzNDYgLTE3Ljc0Njg3LC0xMC41ODA0IC0zNy42NTc1MSwtMjEuNDM1MiAtMzkuNDI4ODQsLTIxLjQ5NTcgLTQzLjExNzM0LC0yMy43MDA4IC00OC4zNDU3NywtMjguOTAyNSAtNi4zNTY2OCwtNi4zMjQxIC02LjM4NDk4LC02LjQ4NzQgLTYuNzA5LC0zOC43MTYgLTAuMjc4MzcsLTI3LjY4NzYgLTAuMjM2NDksLTI4LjYwNjEgMS4zNjEwMSwtMjkuNzc1NSAzLjMzNjcxLC0yLjQ0MjggMi43NzQyOSwtMi43MDY4IDUxLjAxNDg0LDIzLjk0MjMgNDIuMjE0MjEsMjMuMzE5OSA0MC4wMDQ0LDIyLjIwODYgNDEuMDA3NDYsMjAuNjIzMiAwLjQxNzksLTAuNjYwNSAwLjc2NTYsLTcuODA2OCAwLjc3MjYyLC0xNS44ODA1IDAuMDEyMywtMTIuODA2IC0wLjE3MzA2LC0xNC44OTEgLTEuNDQzNjUsLTE2LjMzNjYgLTEuNjk3NjIsLTEuOTMxNyAtNzkuNDI4MTQsLTQ1LjA2ODcgLTg1LjU0MzIxLC00Ny40NzI3IC0xNC4xNTk2MSwtNS41NjY3IC0yMy4wODcwMSwtMy4yMDU0IC0yNy43NDk5NCw3LjMzOTkgLTIuODc3NTEsNi41MDc1IC0zLjQxMjA2LDEzLjUwMTEgLTMuNDAyOCw0NC41MTgyIDAuMDEyMyw0MC41MzA1IDEuNjcyNjEsNTEuMjg4NyAxMC4xNDc1Miw2NS43NDQ2IDQuMTI1NzYsNy4wMzc1IDE1LjU1MDYxLDE4LjY4NTggMjMuMjIwNzIsMjMuNjc1IDMuMDMwOSwxLjk3MTUgMjIuODc5MTIsMTMuMDUyNyA0NC4xMDcxNiwyNC42MjQ4IDI4LjE5NTMsMTUuMzcwMiAzOC44NzY3MywyMC44MDg2IDM5LjYzNjY2LDIwLjE4MDkgMC43NjA5MiwtMC42Mjg2IDEuMDQwMjYsLTQuODI5NSAxLjA0MDI2LC0xNS42NDUxIGwgMCwwIDAsMCAwLDAgeiBNIDc2MS4yMjMyLC0zMTYuMzE0OSBjIC0xNS4wMDYzNiwtMjMuMTc0MyAtMzIuODYzMjgsLTQyLjIxOTQgLTU1LjIxNjM1LC01OC44OTA4IC0zNS4zNTk5OSwtMjYuMzcyMSAtNzcuOTY1NiwtNDEuODE0MyAtMTIyLjMzNDk0LC00NC4zMzk3IGwgLTkuOTg2NTIsLTAuNTY4NSAtMC4yMTc3MiwtMzMuMTAyNyBjIC0wLjE4MjYxLC0yNy43ODE5IC0wLjAzMDgsLTMzLjE3NDkgMC45NDk3OCwtMzMuNTUwOCAxLjg0MDUsLTAuNzA2MyAyNi4zODkwMiwxLjIwNCAzOS4yMTM5NiwzLjA1MTUgMTcuMTQ0MDEsMi40Njk2IDMyLjE0NTA0LDYuMDc3NCA0OS45MzI2NCwxMi4wMDkgMTcuOTAyOTksNS45NyAyOC4zNzc3NiwxMC40MDE3IDQ0LjQwODE0LDE4Ljc4ODMgMzguMTU4MDYsMTkuOTYzMyA3MS40NzMzMSw0OC40MDM1IDk3Ljk0MDcxLDgzLjYwOSA3LjU5NjQsMTAuMTA0MiAxOC4wMTE5LDI2LjExOTMgMTcuNjU5MiwyNy4xNTMyIC0wLjIzOSwwLjcwMDUgLTU2LjE5MTYxLDMzLjE1NTggLTU3LjEwNDQ3LDMzLjEyMzQgLTAuMjk3NzgsLTAuMDEgLTIuNjU4MDcsLTMuMjg3NCAtNS4yNDQ1MywtNy4yODE5IGwgMTBlLTUsMCAwLDAgeiIKICAgICAgICAgaWQ9InBhdGgyNzMwIgogICAgICAgICBzdHlsZT0iZmlsbDojZGRkYTQ1IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDc5Ny4xMzM5LC02NS4yMDAzIGMgLTE0Ljg3NTgsLTguNjQzNCAtMjcuMzcwMSwtMTYuMjE1IC0yNy43NjUxNiwtMTYuODI1OCAtMC40NzUwMywtMC43MzQ1IDAuODI4NTYsLTQuMTk5OSAzLjg0ODM2LC0xMC4yMzA3IDMxLjk0NjgsLTYzLjgwMDEgMzEuOTYxOCwtMTM5LjE1OTkgMC4wNDEsLTIwMi45MDk4IC0yLjQ4OTQsLTQuOTcxNCAtNC4zNTc2OSwtOS40Nzc5IC00LjE1MTgzLC0xMC4wMTQyIDAuNDUzNjksLTEuMTgyNSA1NC4zNjQ5MywtMzIuMzEzNiA1Ni4xOTI1MywtMzIuNDQ4NSAzLjc5LC0wLjI3OTkgMjEuNDA1MSw0MC4wMDg2IDI4LjA1OSw2NC4xNzUxIDcuNzU1NywyOC4xNjg1IDEwLjY3MDMsNDkuOTAzMSAxMC42ODc4LDc5LjcwMTkgMC4wMTgsMjkuNjYxMiAtMi44OTk5LDUxLjQxNjQgLTEwLjY4NzgsNzkuNzAxOSAtNi40NDkzLDIzLjQyNCAtMjQuMDE0NSw2My45MTI1IC0yNy45NDI1LDY0LjQwOTIgLTAuNjc4OSwwLjA4NiAtMTMuNDA1NSwtNi45MTU4IC0yOC4yODEyLC0xNS41NTkxIGwgMTBlLTUsMCAwLDAgLTNlLTQsMCB6IgogICAgICAgICBpZD0icGF0aDI3MjYiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlNzc2MmEiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gNTczLjI2OTMsLTgyLjk5MTggMCwtMTA5LjM1OTEgOC41MzAxNSwtNC45NzQ4IGMgNDYuMTIwMjMsLTI2Ljg5NzMgMTgwLjY3MDQ0LC0xMDQuMTg2MyAxODAuOTI3NTEsLTEwMy45MjkyIDAuMTgyNjEsMC4xODI1IDAuMzUxNyw0OS4zMDU3IDAuMzc1ODEsMTA5LjE2MjcgMC4wMzU0LDg5LjUyNzUgLTAuMTUyNDMsMTA5LjAxNzIgLTEuMDYzMDQsMTA5Ljg4MSAtMC42MDg4MywwLjU3NzYgLTM4LjkzMDk5LDIyLjg2NTUgLTg1LjE2MDI1LDQ5LjUyODggLTQ2LjIyOTMsMjYuNjYzMyAtODguMTYyOTIsNTAuODU3MiAtOTMuMTg1ODYsNTMuNzY0MiAtNS4wMjI5NiwyLjkwNzEgLTkuNDIzMyw1LjI4NTYgLTkuNzc4NDgsNS4yODU2IC0wLjM1NTI0LDAgLTAuNjQ1ODQsLTQ5LjIxMTYgLTAuNjQ1ODQsLTEwOS4zNTkyIGwgMCwwIHogbSA1Ny44Mzg2LDM2LjE5MDkgNC45OTMyNSwtMy4wMDUgNy40ODk5NCwtMjEuNjI0NCA3LjQ4OTg3LC0yMS42MjQ1IDI2LjYxMzQ4LC0xNC43NzE4IGMgMTQuNjM3NDEsLTguMTI0NCAyNi44Nzg1OCwtMTQuNzcxNyAyNy4yMDI1NywtMTQuNzcxNyAwLjMyMzk1LDAgMy4yODA1NSw0Ljg4NDQgNi41NzAxNSwxMC44NTQxIDMuMjg5NjMsNS45Njk3IDYuNjMyMjksMTEuNjU4MyA3LjQyODI4LDEyLjY0MTMgbCAxLjQ0NzIzLDEuNzg3MiA5LjQ2ODA4LC01LjM3NTcgYyA1LjIwNzM2LC0yLjk1NjcgOS41ODY0MiwtNS45OTEyIDkuNzMxMzQsLTYuNzQzMyAwLjE0NDczLC0wLjc1MjEgLTguMTIzNjUsLTE3LjIyMjYgLTE4LjM3NDQ1LC0zNi42MDEgLTEwLjI1MDc3LC0xOS4zNzg0IC0yMS45NDQ4MywtNDEuNTI5NSAtMjUuOTg2ODUsLTQ5LjIyNDYgLTcuOTUzNzYsLTE1LjE0MjQgLTkuNjk5ODcsLTE3LjAzNTEgLTE0LjcwMTgsLTE1LjkzNjQgLTMuMjMyNzksMC43MSAtOC4xNzUxNyw1LjY1NDYgLTEwLjQwMTA1LDEwLjQwNTcgLTAuOTU1OTQsMi4wNDA1IC05Ljk5NTUyLDI3LjExNTggLTIwLjA4NzkyLDU1LjcyMyAtMTAuMDkyNCwyOC42MDcyIC0yMi42OTU5Miw2NC4yOTIyIC0yOC4wMDc4Myw3OS4yOTk4IC01LjMxMTkxLDE1LjAwNzYgLTkuNDI1MzQsMjcuNjYzMSAtOS4xNDEwMiwyOC4xMjMyIDAuNTA1MzMsMC44MTc2IDcuNjE3OTUsLTIuNzQ3NSAxOC4yNjY3MywtOS4xNTU5IGwgMCwwIDAsMCAwLDAgeiBtIDM5LjMzODg5LC0xMDIuNzUyNSBjIDMuOTk1NjgsLTExLjcxMjEgNy41ODcyOCwtMjEuMTkxNCA3Ljk4MTI5LC0yMS4wNjUyIDEuMTcyMzIsMC4zNzU4IDE0Ljc5NDAyLDI1LjUyNDMgMTQuMjc3NjEsMjYuMzU5OCAtMC40NjQwMSwwLjc1MDggLTI1LjIzNjUzLDE0LjM4NjEgLTI4LjA4NDMyLDE1LjQ1ODIgLTEuMTI0NzYsMC40MjM0IDAuMTQ4NzMsLTQuMTEzOCA1LjgyNTQyLC0yMC43NTI4IGwgMCwwIHogTSAzMDkuNjYzMDQsLTYyLjA1NSBjIC0xMy42MDM4NywtMjcuMzY2NSAtMjIuMzE3NDcsLTU0LjAyMjcgLTI3LjIwOTkzLC04My4yMzk1IC0yLjgwMzcsLTE2Ljc0MzEgLTMuNzg2MjUsLTI5LjUyMzMgLTMuNzg2MjUsLTQ5LjI0ODggMCwtMzguNTk2MSA3LjAwMjU5LC03NC42MzA1IDIxLjM1NTYyLC0xMDkuODkzIDMuNjU2NzYsLTguOTgzOSAxNC42OTE2MSwtMzEuNzk0MSAxNi4wMzI0NCwtMzMuMTQwOCAwLjU0MzYxLC0wLjU0NTkgNTQuMjQyNDUsMjkuNTg1MyA1Ni45NjMxNiwzMS45NjI5IDAuNDAwMTcsMC4zNDk3IC0xLjMzNTc4LDQuNjkgLTMuODU3NzIsOS42NDUxIC0xMS44Njc3OSwyMy4zMTc5IC0xOS42NzA1LDQ5LjMyODggLTIzLjE3MzU0LDc3LjI1MDUgLTEuNTAzNDUsMTEuOTgzNSAtMS4yODc0OSw0MC4xODE4IDAuNDAzNjUsNTIuNzA5NiAzLjY5ODg5LDI3LjQwMDUgMTEuNjA2NzMsNTMuMDQyOCAyMy4zMTAzMyw3NS41ODcyIDIuOTk0NDEsNS43NjggMy41ODYzNiw3LjUzOTMgMi43ODA4NSw4LjMyMDkgLTEuNzUxMzEsMS42OTk1IC01NC41NTA2LDMxLjkwNDkgLTU1Ljc2OTkyLDMxLjkwNDkgLTAuNjUzNTgsMCAtMy43MDg5NiwtNS4xNDA1IC03LjA0ODY5LC0xMS44NTkgbCAwLDAgMCwwIDAsMCB6IgogICAgICAgICBpZD0icGF0aDI3MjQiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlMDI4MjYiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gMzQ4LjE3NzI5LC0zMjQuODEzNCBjIC0xNS4wNzU4OCwtOC42OTU3IC0yNy45MDI2LC0xNi4zMDIyIC0yOC41MDM4MywtMTYuOTAzNSAtMC45MDI2OSwtMC45MDI2IC0wLjEzNzM0LC0yLjYwMDQgNC4zOTMwMiwtOS43NDU4IDM5Ljg5NTM2LC02Mi45MjI2IDEwNC4yNzczNiwtMTA5LjA0ODEgMTc3LjA3NjIyLC0xMjYuODYzNiAyMC4zOTQzNSwtNC45OTA5IDM5LjY0NTgxLC03LjY1NjMgNTguODExMjMsLTguMTQyNCBsIDguNzM4MjEsLTAuMjIxNiAwLDMzLjI4ODQgMCwzMy4yODg0IC05Ljk4NjUzLDAuNTc2OCBjIC00MC40NzE3NywyLjMzNzMgLTc4LjgyNjQ1LDE1LjA4NDMgLTExMi4wOTcyMywzNy4yNTUgLTE0LjgzMjQ2LDkuODgzOSAtMjMuMjY3LDE2Ljc2MDYgLTM1LjIyNzczLDI4LjcyMTMgLTExLjYzNjYsMTEuNjM2NiAtMTguNzAyNTMsMjAuMjQ3NiAtMjguMDE3OTksMzQuMTQ0NCAtMy42ODE4Niw1LjQ5MjYgLTYuOTM3MzcsMTAuMDgyNSAtNy4yMzQ0NCwxMC4xOTk4IC0wLjI5NzE2LDAuMTE3MiAtMTIuODc1MDEsLTYuOTAxNCAtMjcuOTUwOTMsLTE1LjU5NzEgbCAwLC0xMGUtNSAwLDAgMCwwIHoiCiAgICAgICAgIGlkPSJwYXRoMjcyMiIKICAgICAgICAgc3R5bGU9ImZpbGw6IzNkOWM0NiIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAzNDcuMDE2NDYsLTYyLjg1MzggYyAxNC45MjMzLC04LjU2MTIgMjcuNzI3NjUsLTE1LjU5NTcgMjguNDU0MTUsLTE1LjYzMjUgMC44NzM2MSwtMC4wNDQgMy4yMjI5NCwyLjgxNzUgNi45MzU4Niw4LjQ0ODIgMzkuMjc5MTIsNTkuNTY2NyAxMDQuNTM1MTIsOTcuMjU5NiAxNzUuNzA0NTIsMTAxLjQ5MDQgNS41NTAxLDAuMzI5OCAxMC4zODcsMC45NjUgMTAuNzQ4NSwxLjQxMTUgMC43OTcyLDAuOTg0MSAwLjgwMTksNjMuMjM4MiAwLDY0Ljg4ODQgLTEuNjUyNiwzLjQyMjIgLTQ1LjM1MTEsLTEuNDY3IC02OS42MDY4LC03Ljc4NzggLTI4LjI3MjUsLTcuMzY3NiAtNDguNTUyNSwtMTUuNzEwOCAtNzQuMzY3OCwtMzAuNTk1IC0yNS42OTYzNCwtMTQuODE1IC00My4wNzc5NCwtMjguMjE5NiAtNjMuNjc5OTYsLTQ5LjEwNjkgLTE3LjA2MTEyLC0xNy4yOTcyIC00My4zNDI1OSwtNTIuNzUzNCAtNDEuODA4NzUsLTU2LjQwMzUgMC4yNjQ5NywtMC42MzA5IDEyLjY5MjAxLC04LjE1MTYgMjcuNjE1MTgsLTE2LjcxMjcgbCAtNWUtNSwxZS00IDAsMCAwLjAwNSwtMmUtNCB6IgogICAgICAgICBpZD0icGF0aDI4MDIiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlZWVlZWMiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gNTczLjY4NCw5OC42NSBjIC0wLjIzODk2LC0wLjYyMjkgLTAuMzM2NTUsLTE1LjczNyAtMC4yMTY0OCwtMzMuNTg2OSBsIDAuMjE4MDIsLTMyLjQ1NDIgOS45ODY1MywtMC41NzY3IGMgNDAuNDM5MTYsLTIuMzM1NSA3OC44NjQyOSwtMTUuMTA5MiAxMTIuMTI1OTUsLTM3LjI3NCAxNC43MTg1NiwtOS44MDgxIDIzLjE4ODU3LC0xNi43MjEyIDM1LjE4NDM4LC0yOC43MTcxIDExLjY3NTAzLC0xMS42NzUxIDE4Ljc3NTU0LC0yMC4zMTk5IDI4LjAzMjY4LC0zNC4xMjk2IDMuNjgxODMsLTUuNDkyNiA2Ljk0ODkyLC0xMC4wODY0IDcuMjYwMjgsLTEwLjIwODQgMC42ODM1NiwtMC4yNjc5IDU0Ljg2Mzg0LDMwLjk0NDIgNTYuNDI0ODQsMzIuNTA1MSAwLjkwODEsMC45MDgxIDAuMTg0NCwyLjUzNjkgLTQuMiw5LjQ1MTggLTI3LjgzMjEsNDMuODk2NyAtNjguNzU3NjYsODAuOTM4OSAtMTE1LjA2NzQyLDEwNC4xNDkgLTM4LjA0NDk1LDE5LjA2OCAtNzUuMTY3MDcsMjguNzkyMyAtMTE5Ljk2MDIsMzEuNDI0IC03LjUwMzQyLDAuNDQxIC05LjQzOTc4LDAuMzI1NiAtOS43ODg0MywtMC41ODMgbCAtMS41ZS00LDAgMCwwIDAsMCB6IG0gLTk3Ljk3OTE5LC0zNDkuNjY2NSBjIC01MS42MDA3NSwtMjkuODM4NiAtOTMuODE5NjUsLTU0LjYyNjUgLTkzLjgxOTc3LC01NS4wODQyIC0zLjRlLTQsLTEuMjAyIDE4Ny4yMDY1OSwtMTA5LjAxOTUgMTg5LjI5Mzk5LC0xMDkuMDE5NSAyLjMzMTQxLDAgMTkwLjQ2MDU2LDEwOC42NDk0IDE4OS41OTU4MSwxMDkuNDk2NSAtMS44ODA2OSwxLjg0MjUgLTE4OC41MjYxMiwxMDguOTUxNSAtMTg5Ljc4MTg0LDEwOC45MDg5IC0wLjgwNzc5LC0wLjAyOCAtNDMuNjg3NDMsLTI0LjQ2MzEgLTk1LjI4ODE5LC01NC4zMDE3IGwgMCwwIHogbSA2Mi4zMDA5Nyw0LjU3NzQgYyAxLjg2MTksLTAuOTQ5OSAzLjk0NTA1LC0yLjU5MTMgNC42MjkyMywtMy42NDc1IDAuNjg0MTgsLTEuMDU2MiA3LjE0MjQ2LC0xMy4yNDg5IDE0LjM1MTgzLC0yNy4wOTQ4IDcuMjA5MjgsLTEzLjg0NTkgMTMuMzY4NTQsLTI1LjE3NDMgMTMuNjg3MiwtMjUuMTc0MyAwLjMxODYyLDAgNi41NTY2OSwxMS42NDIzIDEzLjg2MjM5LDI1Ljg3MTcgOS4xMjQyMywxNy43NzE2IDE0LjEyNjQ3LDI2LjYxOTYgMTUuOTc2ODIsMjguMjYwMiA1LjUyMzU1LDQuODk3MyAxNS45NTcsNS4zODQ3IDIyLjIyNzE4LDEuMDM4MyAzLjExMzI0LC0yLjE1ODEgNS4xNjUyNywtNS45MDA0IDI2LjUyOTc1LC00OC4zODI4IDEyLjczNTU0LC0yNS4zMjQxIDIyLjk1MjI2LC00Ni41NzM1IDIyLjcwMzg0LC00Ny4yMjA5IC0wLjM2NDAyLC0wLjk0ODYgLTMuMDgwOTcsLTEuMTc0NiAtMTQuMDAxMjEsLTEuMTY0MyAtNy40NTIyNywwLjAxIC0xMy45NzI5LDAuMjg3OSAtMTQuNDkwMzYsMC42MjQyIC0wLjUxNzUsMC4zMzYyIC03Ljc1MjE1LDE0LjIzNjEgLTE2LjA3NzA2LDMwLjg4ODQgLTguNDE5NzcsMTYuODQyMiAtMTUuNDQ4MzQsMjkuOTUxNiAtMTUuODM5NjQsMjkuNTQzNSAtMC4zODY5MywtMC40MDM1IC02LjQwOTEzLC0xMS43ODEyIC0xMy4zODI3NywtMjUuMjgzOCAtNi45NzM2NSwtMTMuNTAyNiAtMTMuNjA5NzMsLTI1LjgwODEgLTE0Ljc0NjkyLC0yNy4zNDU1IC01LjU4NjQ5LC03LjU1MjcgLTE4Ljk5NzcyLC03Ljc3NDMgLTI1LjE4MDk3LC0wLjQxNiAtMS4xMjUzNCwxLjMzOTIgLTguMDM4MDEsMTMuOTM0MyAtMTUuMzYxNDcsMjcuOTg5IC03LjMyMzQzLDE0LjA1NDggLTEzLjUxNjM4LDI1LjU1NzkgLTEzLjc2MjA5LDI1LjU2MjYgLTAuMjQ1NzQsMC4wMSAtNi45NzI0NywtMTMuMTkyNSAtMTQuOTQ4NCwtMjkuMzI3IC03Ljk3NTg5LC0xNi4xMzQ1IC0xNS4wNDE5NSwtMjkuOTkwOCAtMTUuNzAyMywtMzAuNzkxOCAtMS4wNTA3MiwtMS4yNzQ1IC0yLjgyMTE2LC0xLjQ1NDcgLTE0LjE3ODk0LC0xLjQ0MzYgLTcuMTM4MDksMC4wMSAtMTMuNTA0MzgsMC4zNDU4IC0xNC4xNDczLDAuNzUyOCAtMS4yODI3NSwwLjgxMjEgNS4yNDk0NiwxNS4wNzc2IDMwLjEzNTMsNjUuODExMyAxMy4zODg1NiwyNy4yOTQ2IDE1LjA5MjI0LDI5Ljg5MDYgMjEuMDgwNSwzMi4xMjA0IDQuMjk2OTEsMS42MDAxIDEyLjMxMDIyLDEuMDM2NCAxNi42MzUzOSwtMS4xNzAxIGwgMCwwIDAsMCB6IgogICAgICAgICBpZD0icGF0aDI3MjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMDRhOTYiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K";

mark2.ui = (function() {
		
	/*
	 * Configuration Section
	 */

	var settings;

	var eventsPerRow = 5;
	
	/*
	 * Mark 2 Initialization
	 */

	var div;
	var eventsTable, competitionNameInput, roundsTbody;
	var scrambleButton, zipButton, progress;
	var callbacks;
	var initialize = function(name, canZip, callbacks_) {
		settings = mark2.settings;
		callbacks = callbacks_;

		if(canZip) {
			assert(callbacks.showZip);
		}
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
		logo.classList.add('wca_logo_top');
		logo.src = mark2.logo;

		var mark2Title = document.createElement('span');
		title.appendChild(mark2Title);
		mark2Title.classList.add('mark2_title');

		mark2Title.appendChild(document.createTextNode('Mark 2'));

		var betaText = document.createElement('span');
		mark2Title.appendChild(betaText);
		betaText.classList.add('beta');
		betaText.appendChild(document.createTextNode('BETA 0.1b'));

		if(name) {
			mark2Title.appendChild(document.createTextNode(' / ' + name));
		}


		var spacerDiv = document.createElement('div');
		topInterface.appendChild(spacerDiv);
		
		competitionNameInput = document.createElement('input');
		spacerDiv.appendChild(competitionNameInput);
		competitionNameInput.id = 'competitionName';
		competitionNameInput.placeholder = "Competition Name";

		scrambleButton = document.createElement('button');
		topInterface.appendChild(scrambleButton);
		scrambleButton.classList.add('scrambleButton');
		scrambleButton.appendChild(document.createTextNode("Scramble!"));

		zipButton = document.createElement('button');
		if(canZip) {
			topInterface.appendChild(zipButton);
		}
		zipButton.classList.add('scrambleButton');
		zipButton.appendChild(document.createTextNode("Zip!"));

		progress = document.createElement('progress');
		topInterface.appendChild(progress);

		var eventsRoundsInterface = document.createElement('div');
		div.appendChild(eventsRoundsInterface);
		eventsRoundsInterface.id = "events_rounds_interface";
		eventsRoundsInterface.classList.add('interface');

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
		var roundsTable = document.createElement('table');
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
		td.appendChild(document.createTextNode('Remove'));

		roundsTbody = document.createElement('tbody');
		roundsTable.appendChild(roundsTbody);
		
		competitionNameInput.addEventListener('change', updateHash, false);

		scrambleButton.addEventListener('click', callbacks.showScrambles, false);
		if(canZip) {
			zipButton.addEventListener('click', callbacks.showZip, false);
		}

		initializeEvents();
		initializeEventsTable();

		window.addEventListener('hashchange', function() {
			initializeEvents();
			updateEventAmountValues();
		}, false);

		updateHash();
		return div;
	};

    // Converts 1, 2, ... to A, B, ..., Z, AA, AB, ..., ZZ, AAA, AAB, ...
    // A bit complicated right now, but should work fine.
	function intToLetters(int) {

      var numDigits;
      var maxForDigits = 1;
      var numWithThisManyDigits = 1;
    
      for (numDigits = 0; maxForDigits <= int; numDigits++) {
        numWithThisManyDigits *= 26;
        maxForDigits += numWithThisManyDigits;
      }
    
      var adjustedInt = int - (maxForDigits - numWithThisManyDigits);
    
      var out = "";
      for (var i = 0; i < numDigits; i++) {
        out = String.fromCharCode(65 + (adjustedInt % 26)) + out;
        adjustedInt = Math.floor(adjustedInt / 26);
      }
      return out;
    }

	var getScrambleSheets = function() {
		var rounds = getRoundsJSON();
		var sheets = [];
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
					scrambleCount: round.scrambleCount
				};
				sheets.push(sheet);
			}
		}
		return sheets;
	};

	/*
	 * Events
	 */

	var initializeEventsTable = function() {

		var currentEventsTR;

		for (var i = 0; i < settings.event_order.length; i++) {
			var eventID = settings.event_order[i]

			settings.events[eventID].initialized = false;

			if (i % eventsPerRow === 0) {
				currentEventsTR = mark2.dom.appendElement(eventsTable, "tr");
			}

			var eventTD = mark2.dom.appendElement(currentEventsTR, "td", "event_amount_label", null, "" + eventID + ":");

			var val = mark2.dom.appendElement(currentEventsTR, "td", "event_amount_value_td", "");
			var valInput = mark2.dom.appendElement(val, "input", "event_amount_value");
			valInput.setAttribute("id", "event_amount_value_" + eventID);
			valInput.setAttribute("type", "number");
			valInput.setAttribute("min", "0");

			var changeNumRoundsListener = function(eventID, el) {
				changeNumRounds(eventID, parseInt(el.value));
			}.bind(null, eventID, valInput);

			valInput.addEventListener("change", changeNumRoundsListener, false);
		}
		updateEventAmountValues();
	};

	function updateEventAmountValues() {
		var eventInputs = eventsTable.getElementsByClassName("event_amount_value");
		for(var i = 0; i < eventInputs.length; i++) {
			var eventID = eventInputs[i].id.split("_")[3];
			eventInputs[i].value = numCurrentRounds(eventID);
		}
	}


	function getHashParameter(name, alt) {
		var results = RegExp( "[#&]"+name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")+"=([^&#<]*)" ).exec( window.location.href );
		if (results == null) {
			return alt;
		}
		else {
			return decodeURIComponent(results[1]);
		}
	}


	var initializeEvents = function() {
		var competitionNameHash = getHashParameter("competition_name", null);

		if (competitionNameHash !== null) {
			competitionNameInput.value = competitionNameHash;
		}

		var roundsHash = getHashParameter("rounds", null);

		if (roundsHash === null) {
			addRounds(settings.default_rounds);
		}
		else if(roundsHash != JSON.stringify(getRoundsJSON())) {
			var rounds = JSON.parse(roundsHash);
			resetRounds();
			addRounds(rounds);
		}
	};

	var getCompetitionName = function() {
		return competitionNameInput.value;
	};

	var updateHash = function() {
		var competitionName = encodeURIComponent(getCompetitionName());
		var roundsHash = encodeURIComponent(JSON.stringify(getRoundsJSON()));
		location.hash = "#competition_name=" + competitionName + "&rounds=" + roundsHash;

		maybeEnableScrambleButton();
		callbacks.competitionChanged();
	};



	/*
	 * Rounds
	 */

	var addRound = function(eventID, roundNameOpt, numGroupsOpt, numSolvesOpt) {

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

		var newEventTR_ID = mark2.dom.nextAutoID();
		var newEventTR = mark2.dom.appendElement(roundsTbody, "tr", "event_tr_" + eventID, newEventTR_ID);
			newEventTR.setAttribute("data-event-id", eventID);

		var nameTD = mark2.dom.appendElement(newEventTR, "td", "event_name", null, settings.events[eventID].name);
		
		var roundNameTD = mark2.dom.appendElement(newEventTR, "td");
		var roundNameInput = mark2.dom.appendElement(roundNameTD, "input", "round_name");
			roundNameInput.setAttribute("value", roundName);

		var numGroupsTD = mark2.dom.appendElement(newEventTR, "td", null);
		var numGroupsInput = mark2.dom.appendElement(numGroupsTD, "input", "num_groups");
			numGroupsInput.setAttribute("type", "number");
			numGroupsInput.setAttribute("value", numGroups);
			numGroupsInput.setAttribute("min", "1");

		var numSolvesTD = mark2.dom.appendElement(newEventTR, "td", null);
		var numSolvesInput = mark2.dom.appendElement(numSolvesTD, "input", "num_solves");
			numSolvesInput.setAttribute("type", "number");
			numSolvesInput.setAttribute("value", numSolves);
			numSolvesInput.setAttribute("min", "1");

		var removeTD = mark2.dom.appendElement(newEventTR, "td", "round_remove");
		var removeButton = mark2.dom.appendElement(removeTD, "button", null, null, "&nbsp;&nbsp;X&nbsp;&nbsp;");
			removeButton.addEventListener("click", removeRound.bind(null, eventID, newEventTR_ID), false);

		roundNameInput.addEventListener("change", updateHash, false);
		numSolvesInput.addEventListener("change", updateHash, false);
		numGroupsInput.addEventListener("change", updateHash, false);
	};

    var addRounds = function(rounds) {
    	for (var i = 0; i < rounds.length; i++) {
	    	addRound(rounds[i].eventID, rounds[i].roundName, rounds[i].groupCount, rounds[i].scrambleCount);
	    }
    };

	var removeRound = function(eventID, scrambleID) {
		roundsTbody.removeChild(document.getElementById(scrambleID));
		document.getElementById("event_amount_value_" + eventID).value = numCurrentRounds(eventID);

		updateHash();
	};

	var removeLastRound = function(eventID) {
		var rounds = roundsTbody.getElementsByClassName("event_tr_" + eventID);
		var lastRound = rounds[rounds.length - 1];
		roundsTbody.removeChild(lastRound);
	};

	var numCurrentRounds = function(eventID) {
		return roundsTbody.getElementsByClassName("event_tr_" + eventID).length;
	};

	var changeNumRounds = function(eventID, newNum) {
		if (isNaN(newNum)) {
			return;
		}

		var currentNum = numCurrentRounds(eventID);

		if (currentNum < newNum) {
			for (var i = 0; i < newNum - currentNum; i++) {
				addRound(eventID);
			}
		}
		else if (newNum < currentNum) {
			for (var i = 0; i < currentNum - newNum; i++) {
				removeLastRound(eventID);
			}
		}

		if (parseInt(document.getElementById("event_amount_value_" + eventID).value) !== newNum) {
			document.getElementById("event_amount_value_" + eventID).value = newNum;
		}

		updateHash();
	};

	var resetRounds = function() {
		roundsTbody.innerHTML = "";
	};

    var getRoundsJSON = function() {
		var rounds = [];
		var eventsTBody = roundsTbody.children;

		for (var i = 0; i < eventsTBody.length; i++) {
			var tr = eventsTBody[i];

			var eventID = tr.getAttribute("data-event-id");

			var roundName = tr.getElementsByClassName("round_name")[0].value;
			var numSolves = parseInt(tr.getElementsByClassName("num_solves")[0].value);

			var numGroups = parseInt(tr.getElementsByClassName("num_groups")[0].value);

			rounds.push({
				eventID: eventID,
				roundName: roundName,
				groupCount: numGroups,
				scrambleCount: numSolves
			});
		}

		return rounds;
    };

	var scrambleCountByPuzzle = {};
	var scramblesGenerated = function(scrambleCountByPuzzle_) {
		scrambleCountByPuzzle = scrambleCountByPuzzle_;
		maybeEnableScrambleButton();
	};

	function getRequiredScrambleCountByPuzzle() {
		var requiredScrambleCountByPuzzle = {};
		var sheets = getScrambleSheets();
		for(var i = 0; i < sheets.length; i++) {
			var sheet = sheets[i];
			requiredScrambleCountByPuzzle[sheet.puzzle] = (requiredScrambleCountByPuzzle[sheet.puzzle] || 0) + sheet.scrambleCount;
		}
		return requiredScrambleCountByPuzzle;
	}
	function getRequiredScrambleCount() {
		var requiredCount = 0;
		var required = getRequiredScrambleCountByPuzzle();
		for(var puzzle in required) {
			requiredCount += required[puzzle];
		}
		return requiredCount;
	}

	function getGeneratedScrambleCount() {
		var required = getRequiredScrambleCountByPuzzle();
		var count = 0;
		for(var puzzle in required) {
			if(required.hasOwnProperty(puzzle)) {
				// There may be more scrambles generated for this puzzle than we need.
				count += Math.min(required[puzzle], scrambleCountByPuzzle[puzzle] || 0);
			}
		}
		return count;
	}
	
	function maybeEnableScrambleButton() {
		var generatedCount = getGeneratedScrambleCount();
		var requiredCount = getRequiredScrambleCount();

		var disableScrambleButton = false;
		if(requiredCount === 0) {
			disableScrambleButton = true;
		} else {
			disableScrambleButton = generatedCount < requiredCount;
		}
		progress.value = generatedCount;
		progress.max = requiredCount;
		if(disableScrambleButton && requiredCount > 0) {
			scrambleButton.style.visibility = 'hidden';
			zipButton.style.visibility = 'hidden';
			progress.style.display = '';
		} else {
			scrambleButton.style.visibility = '';
			zipButton.style.visibility = '';
			progress.style.display = 'none';
		}
		scrambleButton.disabled = disableScrambleButton;
		zipButton.disabled = disableScrambleButton;
	}

	/*
	 * Public Interface
	 */

	return {
		initialize: initialize,
		updateHash: updateHash,
		getScrambleSheets: getScrambleSheets,
		getRequiredScrambleCountByPuzzle: getRequiredScrambleCountByPuzzle,
		getTitle: getCompetitionName,
		scramblesGenerated: scramblesGenerated
	};
})();
