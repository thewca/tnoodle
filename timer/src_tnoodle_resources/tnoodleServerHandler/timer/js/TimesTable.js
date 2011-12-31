var SCROLLBAR_WIDTH = 16;
var TimesTable = new Class({
	Extends: HtmlTable,
	cols: null,
	headers: null,
	selectedRASize: 12,
	initialize: function(id, server, scrambleStuff) {
		this.server = server;
		this.configuration = server.configuration;
		this.scrambleStuff = scrambleStuff;
		this.cols = tnoodle.Time.timeKeys;
		this.headers = tnoodle.Time.timeKeyNames;
		
		var table = this;
		HtmlTable.Parsers.time = {
			match: /^.*$/,
			convert: function(a, b, c) {
				if(this.isOrIsChild(table.addRow)) {
					return Infinity;
				}
				return this.getParent().time[this.key];
			},
			number: true
		};
		//this parser will ignore our sizer tr
		HtmlTable.Parsers.num = {
			match: HtmlTable.Parsers.number.match,
			convert: function() {
				if(this.isOrIsChild(table.addRow)) {
					return Infinity;
				}
				//We can't just look at the html because of the delete thingy
				var val = this.getParent().time.format(this.key).toInt();
				return val;
			},
			number: HtmlTable.Parsers.number.number
		};
		var time = HtmlTable.Parsers.time;
		var num = HtmlTable.Parsers.num;
		var parsers = tnoodle.Time.timeKeyTypes.map(function(type) {
			if(type == Number) {
				return num;
			} else if(type == tnoodle.Time) {
				return time;
			} else {
				return null;
			}
		});
		this.parent(id, {
			headers: this.headers,
			parsers: parsers,
			rows: [],
			sortable: true,
			zebra: false
		});
		this.addEvent('onSort', function(tbody, index) {
			//TODO - this code gets calls when resort() is called, which is kind of inefficient
			
			this.configuration.set('times.sort', this.sorted);
			this.scrollToLastTime();
			
			//sorting can change the box around the best ra
			this.tbody.getChildren('tr').each(function(tr) {
				tr.refresh();
			});
		});
		
		this.emptyRow = [];
		for(var i = 0; i < this.cols.length; i++) {
			this.emptyRow.push('');
		}
		
		//we create the add time row
		this.addRow = this.createRow(null);
		this.addRow.addClass('addTime');
		
		//there needs to be some dummy content in this row so it gets sized correctly
		//only vertical sizing matters though
		this.infoRow = this.set('footers', this.emptyRow).tr;

		var format = server.formatTime;
		this.infoRow.refresh = function() {
			var cells = this.infoRow.getChildren();
			for(var col = 0; col < this.cols.length; col++) {
				var key = this.cols[col];
				var cell = cells[col];
				if(key == 'index') {
					cell.set('html', this.session.solveCount()+"/"+this.session.attemptCount());
					if(this.session.attemptCount() > 0) {
						cell.setStyle('cursor', 'pointer');
						cell.title = 'Click to show stats for session';
						cell.addEvent('click', table.raBoxClicked);
					} else {
						cell.setStyle('cursor', '');
						cell.title = '';
						cell.removeEvent('click', table.raBoxClicked);
					}
				} else if(key == 'sessionAve') {
					cell.set('html', '&sigma; = ' + format(this.session.stdDev()));	
					cell.title = 'This is the standard deviation of all times that count toward your average';
				} else {
					var best = this.session.bestWorst(key).best;
					cell.set('html', format(best.centis));
					cell.removeClass('bestRA');
					if(best.index !== null) {
						cell.addClass('bestTime');
						cell.addClass('bestRA');

						cell.setStyle('cursor', 'pointer');
						if(key != 'centis') {
							cell.title = 'Click to show stats for best ' + key;
							cell.addEvent('click', table.raBoxClicked);
						} else {
							cell.title = 'Click to select best time';
						}
					} else {
						cell.setStyle('cursor', '');
						cell.title = '';
						if(key != 'centis') {
							// We only set the popup event for RAs
							cell.removeEvent('click', table.raBoxClicked);
						}
					}
				}
			}
		}.bind(this);

		var statsArea = document.createElement('textarea');
		statsArea.setStyle('border', 'none');
		statsArea.setStyle('resize', 'none');
		statsArea.setAttribute('wrap', 'off');

		function onHide() {
			// When closing the the stats popup by pressing escape, the textarea
			// retains focus. Here we force it to give up focus.
			statsArea.blur();
		}
		var statsPopup = tnoodle.tnt.createPopup(null, onHide, 0.7);
		statsPopup.resize = function() {
			var size = statsPopup.getSize();
			var height = size.y - 5*2 - statsTabs.getSize().y;
			var width = size.x - 2; // 2 for border
			tabArea.setStyle('width', width);
			tabArea.setStyle('height', height);
			height -= legend.getSize().y;// + resetFormatButton.getSize().y + 10;
			statsArea.setStyle('width', width-4);
			statsArea.setStyle('height', height-4);
		};

		var statsTabs = document.createElement('ul');
		statsTabs.addClass('tabs');
		var statsTab = document.createElement('li');
		statsTab.appendText('Stats');
		function activateStats() {
			statsArea.removeEvent('click', saveFormat);
			statsArea.removeEvent('keyup', saveFormat);
			statsTab.addClass('active');
			statsTab.addClass('white');
			configureTab.removeClass('active');
			legend.setStyle('display', 'none');
			resetFormatButton.setStyle('display', 'none');
			statsPopup.resize();

			statsArea.value = table.session.formatTimes(statsPopup.lastTimeIndex, statsPopup.raSize, getFormat());
			statsArea.focus();
		}
		statsTab.addEvent('click', activateStats);

		var configureTab = document.createElement('li');
		function getFormat() {
			return table.configuration.get('times.statsFormat', table.session.defaultFormatStr);
		}
		function saveFormat() {
			table.configuration.set('times.statsFormat', statsArea.value);
		}
		function resetFormat() {
			if(confirm('Are you sure you want to reset the format string?')) {
				table.configuration.set('times.statsFormat', null);
				statsArea.value = getFormat();
			}
		}
		function activateConfigure() {
			statsTab.removeClass('active');
			configureTab.addClass('active');
			legend.setStyle('display', '');
			resetFormatButton.setStyle('display', '');
			statsPopup.resize();
			statsArea.value = getFormat();
			statsArea.addEvent('click', saveFormat);
			statsArea.addEvent('keyup', saveFormat);
			statsArea.focus();
		}
		configureTab.addEvent('click', activateConfigure);

		configureTab.appendText('Format');
		statsTabs.appendChild(statsTab);
		statsTabs.appendChild(configureTab);
		statsPopup.appendChild(statsTabs);

		var legend = new Element('div');
		legend.setStyle('border-bottom', '1px solid black');
		var resetFormatButton = document.createElement('input');
		resetFormatButton.type = 'button';
		resetFormatButton.addEvent('click', resetFormat);
		resetFormatButton.value = "Reset";
		var tabArea = new Element('div');
		tabArea.setStyle('border', '1px solid black');
		tabArea.setStyle('margin-top', '3px');
		statsPopup.appendChild(tabArea);
		tabArea.appendChild(legend);
		tabArea.appendChild(statsArea);

		this.raBoxClicked = function(e) {
			statsPopup.raSize = this.raSize();
			statsPopup.lastTimeIndex = this.lastTimeIndex();

			legend.empty();
			var ul = new Element('ul');
			ul.setStyle('padding-left', '30px');
			ul.setStyle('margin', '0px');
			legend.adopt(ul);
			for(var key in tnoodle.Session.formatLegend) {
				if(tnoodle.Session.formatLegend.hasOwnProperty(key)) {
					var desc = tnoodle.Session.formatLegend[key][0];
					ul.adopt(new Element('li', {html: "<b>" + key + "</b>: " + desc}));
				}
			}
			legend.appendChild(resetFormatButton);
			
			statsPopup.show();
			activateStats();
		};

		var oldRASize = null;
		var selectedRA_TD = null;
		function applyCurr(td) {
			td.addClass('currentRA');
			td.addClass('topCurrentRA');
			td.addClass('bottomCurrentRA');
		}
		function removeCurr(td) {
			td.removeClass('currentRA');
			td.removeClass('topCurrentRA');
			td.removeClass('bottomCurrentRA');
		}
		this.infoRow.getChildren().each(function(td, index) {
			// Note that the cursor css and html title
			// are set in infoRow.refresh.
			var key = table.cols[index];
			if(key.match(/^ra[0-9]+$/)) {
				td.raSize = function() { return key.substring(2).toInt(); };
				td.lastTimeIndex = function() { return table.session.bestWorst(key).best.index; };
				// The click listener will get set/unset whenever
				// we refresh the info row. This is because we don't
				// always want to enable clicking.
			} else if(key == "index") {
				td.raSize = function() { return null; };
				td.lastTimeIndex = function() { return null; };
				// The click listener will get set/unset whenever
				// we refresh the info row. This is because we don't
				// always want to enable clicking.
			} else if(key == "centis") {
				td.addEvent('click', function(e) {
					var bestIndex = table.session.bestWorst(key).best.index;
					var rows = table.tbody.getChildren();
					for(var i = 0; i < rows.length; i++) {
						if(rows[i] == addRow) {
							continue;
						}
						if(rows[i].time.index == bestIndex) {
							deselectRows();
							rows[i].hover(); //hovering is necessary to get the timeHoverDiv to show up
							selectRow(rows[i]);
							table.scrollToRow(rows[i]);
							e.stop(); // If we don't stop the event, it will clear our selection!
							return;
						}
					}
				});
				return;
			} else {
				// We have nothing useful to do when this cell is clicked
				return;
			}
			/*
			if(raSize == table.selectedRASize) {
				selectedRA_TD = td;
				applyCurr(td);
			}

			td.addEvent('dblclick', function(e) {
				if(selectedRA_TD == td) {
					return;
				}
				removeCurr(selectedRA_TD);
				selectedRA_TD = td;
				oldRASize = null;
			});
			td.addEvent('mouseover', function(e) {
				oldRASize = table.selectedRASize;
				table.selectedRASize = raSize;
				table.refreshData();
				applyCurr(td);
			});
			td.addEvent('mouseout', function(e) {
				if(oldRASize && oldRASize != table.selectedRASize) {
					table.selectedRASize = oldRASize;
					removeCurr(td);
					table.refreshData();
				}
			});
			*/
		});
		
		this.thead = $(this).getChildren('thead')[0];
		this.thead.getChildren('tr')[0].getChildren('th').each(function(th, index) {
			var title = tnoodle.Time.timeKeyDescriptions[index];
			if(title) {
				th.title = title;
			}
		});
		this.tbody = $(this).getChildren('tbody')[0];
		this.tfoot = $(this).getChildren('tfoot')[0];
		this.parent = $(this).getParent();
		
		var columnOptions = tnoodle.tnt.createOptions();
		var columnOptionsHeader = document.createElement('th');
		this.thead.getChildren()[0].adopt(columnOptionsHeader.adopt(columnOptions.button));
		columnOptionsHeader.setStyles({
			cursor: 'default',
			padding: 0,
			borderRight: 'none',
			borderBottom: '1px'
		});
		columnOptions.button.setStyle('width', SCROLLBAR_WIDTH);
		
		var defaultCols = [ 'index', 'centis', 'ra5', 'ra12', 'ra100', 'sessionAve' ];
		var initing = true;
		var refreshCols = function() {
			if(initing) {
				return;
			}
			this.refreshData();
		}.bind(this);
		for(i = 0; i < this.cols.length; i++) {
			var col = this.cols[i];
			// We need at least these three columns to always be present
			// in order to impose a minimum size on the times table.
			if(col == 'centis') {// || col == 'index' || col == 'sessionAve') {
				// We set these columns to be visible, just in case they weren't
				// This can happen in an old version of tnt.
				server.configuration.set('table.' + col, true);
				continue;
			}
			var desc = this.headers[i];
			var opt = tnoodle.tnt.createOptionBox(server.configuration, 'table.' + col, desc, defaultCols.contains(col), refreshCols);
			columnOptions.div.adopt(opt);
		}
		initing = false;
		
		var selectedRows = [];
		var mostRecentRow = null;
		var addRow = this.addRow;
		function selectRow(row) {
			if(selectedRows.contains(row)) {
				return;
			}
			row.select();
			selectedRows.push(row);
		}
		function deselectRows(ignoreRow) {
			var ignorePresent = selectedRows.contains(ignoreRow);
			for(var i = selectedRows.length-1; i >= 0; i--) {
				var row = selectedRows[i];
				if(!ignoreRow || row != ignoreRow) {
					row.deselect();
				}
			}
			if(ignoreRow) {
				if(!ignorePresent) {
					selectRow(ignoreRow);
					selectedRows = [ ignoreRow ];
				}
			} else {
				selectedRows = [];
			}

			// This gets ride of the errorField if we were editing a time
			// This gets rid of the hover if we're hovering over times,
			// but I guess that's ok behavior
			if(timeHoverDiv.tr) {
				timeHoverDiv.commentArea.blur();
				setTimeout(timeHoverDiv.tr.unhover.bind(timeHoverDiv.tr, null, true), 0);
			}
			// Unfortunately, the call to unhover() doesn't result in
			// hiding the timeHoverDiv, so we do so explicitly.
			timeHoverDiv.hide(true);
		}
		this.deselectRows = deselectRows;
		this.promptTime = function() {
			deselectRows();
			this.addRow.hover(); //hovering is necessary to get the timeHoverDiv to show up
			selectRow(this.addRow);
		}.bind(this);
		window.addEvent('click', function(e) {
			var timeHoverChild = e.target.findAncestor(function(e) {
				return e == timeHoverDiv;
			});
			if(e.rightClick || timeHoverChild) {
				// We don't let right clicking or clicking on the timeHover deselect a row
				return;
			}
			//TODO - is there a better way of checking nodeName?
			var row = e.target.findAncestor(function(el) { return el.nodeName == 'TR'; });
			if(row) {
				if(!row.isOrIsChild(table.tbody)) {
					return;
				}
				if(e.control) {
					if(table.addRow.selected || row === table.addRow) {
						return;
					}

					// Deselecting and reselecting all of the current rows
					// ensures that none of the rows are currently editing
					selectedRows.each(function(row) { row.deselect(); row.select(); });

					if(selectedRows.contains(row)) {
						// NOTE: We don't bother updating mostRecentRow
						// This behavior may seem a little odd, but this
						// will happen so infrequently, I can't imagine it'll
						// matter.
						row.deselect();
						selectedRows.erase(row);
					} else {
						selectRow(row);
						mostRecentRow = row;
					}
				} else if(e.shift && mostRecentRow.isOrIsChild($(table))) {
					if(row === table.addRow) {
						return;
					}
					deselectRows();
					selectRow(mostRecentRow);
					var start = mostRecentRow;
					var between = [];
					// Try going forward from mostRecentRow to find row
					while(start !== null && start !== row) {
						between.push(start);
						start = start.getNext();
					}
					if(start === null) {
						// That didn't work, row must be behind mostRecentRow!
						start = mostRecentRow;
						between.length = 0;
						while(start !== null && start != row) {
							between.push(start);
							start = start.getPrevious();
						}
					}
					between.each(function(row) {
						selectRow(row);
					});
					selectRow(row);
				} else {
					// This is a little tricky. The table cell has a key attribute
					// that we use to ensure that times are only edited by clicking on
					// the 'centis' column. However, if the row is already being edited,
					// then the target is a text field that does not have a "key"
					// attribute.
					var edit = selectedRows.contains(row) && (row.editing || e.target.key == 'centis');
					// This poorly named function ensures that row gets selected,
					// which enables it for editing the next time it is clicked on.
					deselectRows(row);
					if(edit != row.editing) {
						row.editing = edit;
						row.refresh();
					}
					if(row === table.addRow) {
						mostRecentRow = null;
					} else {
						mostRecentRow = row;
					}
				}
			} else {
				// Something other than a row of our table was clicked,
				// so we clear the current selection
				// If the user is holding down ctrl or shift, we give them a chance
				// to keep selecting rows.
				if(e.control || e.shift) {
					return;
				}
				deselectRows();
			}
		});
		window.addEvent('keydown', function(e) {
			if(e.key == 'delete') {
				var times = "";
				for(var i = 0; i < selectedRows.length; i++) {
					var row = selectedRows[i];
					// check to make sure the time is even in the session
					if(this.session.times.contains(row.time)) {
						times += "," + row.time.format();
					}
				}
				if(times.length === 0) {
					return;
				} else {
					times = times.substring(1);
					if(confirm('Are you sure you want to delete these times?\n' + times)) {
						this.deleteRows(selectedRows);
					}
				}
			}
		}.bind(this));

		
		var timeHoverDiv = new Element('div');
		timeHoverDiv.fade('hide');
		timeHoverDiv.setStyles({
			position: 'absolute',
			backgroundColor: 'white',
			zIndex: 4
		});
		var makeLabelAndSettable = function(el) {
			var label = new Element('label', {'for': el.id});
			label.setStyle('display', 'block');
			el.setText = function(text) {
				label.set('html', text);
				el.inject(label, 'top');
			};
			return label;
		};
		
		var fieldSet = new Element('fieldset');
		fieldSet.setStyle('display', 'inline');
		fieldSet.setStyle('padding', 0);
		fieldSet.setStyle('border', 'none');
		fieldSet.setStyle('vertical-align', 'top');

		var noPenalty = new Element('input', { type: 'radio', name: 'penalty', id: 'noPenalty', value: 'noPenalty' });
		fieldSet.adopt(makeLabelAndSettable(noPenalty));
		var plusTwo = new Element('input', { type: 'radio', name: 'penalty', id: 'plusTwo', value: 'plusTwo' });
		fieldSet.adopt(makeLabelAndSettable(plusTwo));
		var dnf = new Element('input', { type: 'radio', name: 'penalty', id: 'dnf', value: 'dnf' });
		fieldSet.adopt(makeLabelAndSettable(dnf));
		
		var form = new Element('form');
		var commentArea = new Element('textarea');
		timeHoverDiv.commentArea = commentArea;
		form.adopt(commentArea);
		var height = 75;
		var margin = 4;
		var padding = 2;
		commentArea.setStyle('height', height);
		commentArea.setStyle('margin', margin);
		commentArea.setStyle('padding', padding);
		commentArea.setStyle('border', '1px solid black');
		commentArea.setStyle('resize', 'none');
		form.setStyle('height', height+2*(margin+padding+1));
		commentArea.setText = function(text) {
			if(text === "") {
				commentArea.setStyle('color', 'gray');
				commentArea.value = "Enter comment here";
			} else {
				commentArea.setStyle('color', 'black');
				commentArea.value = text;
			}
		};
		commentArea.saveComment = function() {
			// Nastyness to save the comment
			if(timeHoverDiv.time !== null && commentArea.getStyle('color') == 'black') {
				timeHoverDiv.time.setComment(commentArea.value);
				commentArea.blur();
			}
		};
		commentArea.addEvent('focus', function() {
			if(commentArea.getStyle('color') == 'gray') {
				commentArea.value = '';
				commentArea.setStyle('color', 'black');
			}
			setTimeout(function() {
				commentArea.select();
			}, 0);
		});

		form.setStyle('border', '2px solid black');
		form.adopt(fieldSet);
		var importScramble = document.createElement('span');
		importScramble.addClass('link');
		importScramble.title = 'Click to load scramble';
		var scrambledCube = document.createElement('img');
		scrambledCube.src = 'media/cube_scrambled.png';
		scrambledCube.style.width=24+'px';
		scrambledCube.style.height=24+'px';
		importScramble.adopt(scrambledCube);
		importScramble.addEvent('click', function() {
			var src = timeHoverDiv.time.format() + 's solve';
			table.scrambleStuff.importScrambles([ timeHoverDiv.time.scramble ], src);
		});
		fieldSet.adopt(importScramble);
		fieldSet.addEvent('change', function(e) {
			if(noPenalty.checked) {
				timeHoverDiv.time.setPenalty(null);
			} else if(dnf.checked) {
				timeHoverDiv.time.setPenalty("DNF");
			} else if(plusTwo.checked) {
				timeHoverDiv.time.setPenalty("+2");
			} else {
				alert("ERROR"); //TODO - proper error system
			}
			table.session.reindex();
			table.refreshData();
		});
		

		timeHoverDiv.form = form;
		document.body.adopt(timeHoverDiv);
		timeHoverDiv.addEvent('mouseover', function(e) {
			timeHoverDiv.tr.hover();
			timeHoverDiv.show();
		});
		timeHoverDiv.addEvent('mouseout', function(e) {
			// This should help dampen the unexpected mouseout events
			if(timeHoverDiv.containsPoint(e.page)) {
				return;
			}
			timeHoverDiv.tr.unhover();	
		});
		var errorField = new Element('div', { 'class': 'errorField' });
		timeHoverDiv.errorField = errorField;
		timeHoverDiv.show = function(tr, time) {
			if(tr) {
				commentArea.saveComment();
				//TODO - comment AAAA
				if(!timeHoverDiv.tr || !timeHoverDiv.tr.editing) {
					timeHoverDiv.tr = tr;
					timeHoverDiv.time = time;
				}
				timeHoverDiv.form.dispose();
				timeHoverDiv.errorField.dispose();
				// if we don't dispose of the form and errorField first, it'll get destroyed
				timeHoverDiv.empty();
				if(timeHoverDiv.tr.editing) {
					timeHoverDiv.adopt(errorField);
				} else if(timeHoverDiv.time !== null) {
					timeHoverDiv.commentArea.setText(time.getComment());
					timeHoverDiv.adopt(timeHoverDiv.form);
					noPenalty.setText(server.formatTime(time.rawCentis));
					dnf.setText("DNF");
					plusTwo.setText(server.formatTime(time.rawCentis+2*100)+"+");

					// Select the correct penalty
					var penalties = { "null": noPenalty, "DNF": dnf, "+2": plusTwo };
					// Note that calling String(null) = "null". Some browsers
					// don't like null keys in dictionaries
					penalties[String(time.getPenalty())].checked = true;
				}
			}
			var el = timeHoverDiv.tr.getChildren()[1];
			if(el.isOrIsChild(this.tbody)) {
				timeHoverDiv.position({relativeTo: el.getParent(), position: 'left', edge: 'right'});
				timeHoverDiv.fade('show');
				timeHoverDiv.visible = true;
			} else {
				timeHoverDiv.fade('out');
				timeHoverDiv.visible = false;
			}
		}.bind(this);
		var fader = timeHoverDiv.fade;
		timeHoverDiv.fade = function(str) {
			timeHoverDiv.get('tween').cancel();
			fader.call(timeHoverDiv, str);
		};
		timeHoverDiv.hide = function(immediately) {
			//TODO - comment! SEE A
			if(!timeHoverDiv.visible) {
				return;
			}
			function hide() {
				commentArea.saveComment();
				timeHoverDiv.fade(immediately ? 'hide' : 'out');
				timeHoverDiv.visible = false;
			}
			if(!timeHoverDiv.tr || !timeHoverDiv.tr.editing) {
				if(immediately) {
					hide();
				} else {
					setTimeout(hide, 0);
				}
			}
		};
		this.timeHoverDiv = timeHoverDiv;
	},
	comment: function() {
		this.lastAddedRow.hover();
		this.timeHoverDiv.commentArea.focus();
	},
	penalize: function(penalty) {
		this.lastAddedRow.time.setPenalty(penalty);
		this.session.reindex();
		this.refreshData();
	},
	deleteRows: function(rows) {
		var times = [];
		rows.each(function(row) {
			times.push(row.time);
			row.dispose();
		}.bind(this));
		this.session.disposeTimes(times);
		//changing the time could very well affect more than this row
		//maybe someday we could be more efficient about the changes
		this.refreshData();
		this.resizeCols(); //changing the time may change the size of a column
		// timeHoverDiv.show will hide itself
		this.timeHoverDiv.show();
	},
	undo: function() {
		this.session.undo();
		this.setSession(this.session);
	},
	redo: function() {
		this.session.redo();
		this.setSession(this.session);
	},
	freshSession: false,
	setSession: function(session) {
		this.freshSession = true;
		this.session = session;
		this.addRow.dispose(); //if we don't remove this row before calling empty(), it's children will get disposed
		this.empty();
		this.addRow.inject(this.tbody); // adding the addRow back
		this.session.times.each(function(time) {
			this.createRow(time);
		}.bind(this));

		this.refreshData();
	},
	reset: function() {
		this.session.reset();
		this.setSession(this.session);

		// Reseting the table with a time hovered would leave the time hover visible.
		// This fixes that problem.
		this.timeHoverDiv.hide(true);
	},
	addTime: function(time) {
		this.session.addTime(time, this.scrambleStuff.scramble, this.scrambleStuff.unscramble);
		this.createRow(time);
		this.refreshData();
		this.scrollToLastTime();
	},
	scrollToLastTime: function() {
		if(this.lastAddedRow) {
			var row = this.lastAddedRow;
			if(row.nextSibling == this.addRow) {
				// this little hack will ensure that the addRow is visible
				// whenever we're near the bottom
				row = this.addRow;
			}
			this.scrollToRow(row);
		}
	},
	scrollToRow: function(tr) {
		var scrollTop = this.tbody.scrollTop;
		var scrollBottom = scrollTop + this.tbody.getSize().y;
		
		var elTop = this.tbody.scrollHeight + tr.getPosition(tr.getParent()).y;
		var elBottom = this.tbody.scrollHeight + tr.getSize().y + elTop;
		
		if(elTop < scrollTop) {
			//we scroll up just until the top of the row is visible
			this.tbody.scrollTo(0, elTop);
		} else if(elBottom > scrollBottom) {
			//we scroll down just until the bottom of the element is visible
			var delta = elBottom - scrollBottom;
			delta += 3; //add a couple for the border, TODO - compute border!
			this.tbody.scrollTo(0, scrollTop + delta);
		} else {
			//TODO - is there a better way to make jslint happy?
			var nop; //the element's on screen!
		}
	},
	
	//private!
	resort: function(preserveScrollbar) {
		var scrollTop = this.tbody.scrollTop; //save scroll amount
		var sort = this.configuration.get('times.sort', { index: 0, reverse: false });
		this.sort(sort.index, sort.reverse);
		
		if(preserveScrollbar) {
			this.tbody.scrollTo(0, scrollTop); //restore scroll amount
		}
	},
	refreshData: function() {
		var refreshCols = function(tr) {
			var cells = tr.getChildren('td');
			//nasty hack to get the headers of the thead
			if(cells.length === 0) {
				cells = tr.getChildren('th');
			}
			for(var i = 0; i < this.cols.length; i++) {
				var colEnabled = this.configuration.get('table.' + this.cols[i], true);
				if(colEnabled) {
					cells[i].setStyle('display', '');
				} else {
					cells[i].setStyle('display', 'none');
				}
			}
		}.bind(this);
		
		// The calls to toggle() seem to screw up scrolling to the edited time
		//$(this).toggle(); //prevent flickering?
		this.tbody.getChildren('tr').each(function(tr) {
			tr.refresh();
			refreshCols(tr);
		});
		this.thead.getChildren('tr').each(refreshCols);
		this.tfoot.getChildren('tr').each(refreshCols);
		this.resort(true);
		this.infoRow.refresh();
		//$(this).toggle(); //prevent flickering?
		this.resizeCols();
		this.fireEvent('tableChanged');
	},
	editCell: function(cell, time) {
		if(cell.textField && cell.textField.isOrIsChild(cell)) {
			// we must be editing currently
			// The above comment makes no sense --jfly
			return;
		}
		var width = cell.getStyle('width').toInt() + cell.getStyle('padding-left').toInt() + cell.getStyle('padding-right').toInt();
		var height = cell.getStyle('height').toInt() + cell.getStyle('padding-top').toInt() + cell.getStyle('padding-bottom').toInt();
		cell.setStyle('padding', 0);
		var textField = new Element('input');
		cell.textField = textField;
		textField.value = time ? time.format() : "";
		textField.setStyle('border', 'none');
		textField.setStyle('width', width);
		//TODO - the sizing isn't quite right on FF, be careful not to break this on chrome!
		textField.setStyle('height', height);
		textField.setStyle('text-align', 'right'); //not sure this is a good idea, left align might make a good visual indicator
		textField.setStyle('padding', 0);

		textField.addEvent('keydown', function(e) {
			if(e.key == 'esc') {
				this.deselectRows();
				e.stop(); // Without this, the timer will reset
			} else if(e.key == 'enter') {
				try {
					if(time) {
						time.parse(textField.value);
						this.session.reindex();
						this.refreshData();
					} else {
						var newTime = new tnoodle.Time(textField.value, this.scrambleStuff.getScramble());
						this.addTime(newTime);
						this.scrambleStuff.scramble();

						this.promptTime();
					}

					// We only deselect the row if we successfully added the new time
					this.deselectRows();
				} catch(error) {
					// No need for an alert
					//alert("Error entering time " + textField.value + "\n" + error);
				}
				e.stop(); // Without this, the timer will start
			}
		}.bind(this));
		
		var timeChanged = function(e) {
			try {
				var test = new tnoodle.Time(textField.value);
				this.timeHoverDiv.errorField.set('html', '');
			} catch(error) {
				this.timeHoverDiv.errorField.set('html', error);
			}
			this.timeHoverDiv.show();
		}.bind(this);
		textField.addEvent('input', timeChanged);
		timeChanged();

		cell.empty();
		cell.adopt(textField);
		
		textField.focus(); //this has the added benefit of making the row visible
		textField.select();

		//TODO - comment see AAAA
		this.timeHoverDiv.show(cell.getParent(), time);
	},
	timeHoverDiv: null,
	lastAddedRow: null,
	createRow: function(time) {
		var tr = this.push(this.emptyRow).tr;
		tr.time = time;
		this.lastAddedRow = tr;
		var server = this.server;
		var session = this.session;
		var cols = this.cols;
		var table = this;
		tr.refresh = function() {
			tr.editing = tr.editing && tr.selected;
			if(tr.selected) {
				tr.addClass('selected');
			} else {
				tr.removeClass('selected');
			}
			if(tr.hovered) {
				tr.addClass('hovered');
				setTimeout(function() {
					//This table may actually be hidden during this call...
					//so positioning the hoverDiv doesn't work until later.
					this.timeHoverDiv.show(tr, tr.time);
				}.bind(this), 0);
			} else {
				tr.removeClass('hovered');
			}
			var deleteTime = function() {
				this.deleteRows([tr]);
			}.bind(this);
			var cells = tr.getChildren();
			for(var col = 0; col < table.cols.length; col++) {
				var key = table.cols[col];
				cells[col].key = key;
				if(time === null) {
					if(key == 'centis') {
						if(tr.selected) {
							tr.editing = true;
							this.editCell(cells[col], null);
						} else {
							cells[col].setStyle('padding', '');
							cells[col].set('html', '<u>A</u>dd time');
						}
					}
					continue;
				}
				if(key == 'index') {
					cells[col].removeEvent('click');
					if(tr.hovered) {
						cells[col].set('html', 'X');
						cells[col].addClass('deleteTime');
						cells[col].addEvent('click', deleteTime);
					} else {
						cells[col].set('html', time.index + 1);
						cells[col].removeClass('deleteTime');
					}
				} else if(key == 'centis') {
					if(tr.editing) {
						this.editCell(cells[col], time);
					} else {
						cells[col].set('html', time.format());
						cells[col].removeClass('bestRA');
						cells[col].removeClass('currentRA');
						cells[col].removeClass('topCurrentRA');
						cells[col].removeClass('bottomCurrentRA');
						cells[col].removeClass('bestTime');
						cells[col].removeClass('worstTime');
						cells[col].setStyle('padding', '');
						var bw = session.bestWorst();
						if(time.index == bw.best.index) {
							cells[col].addClass('bestTime');
						} else if(time.index == bw.worst.index) {
							cells[col].addClass('worstTime');
						}
						var selectedRASize = this.selectedRASize;
						var bestRA = session.bestWorst('ra' + selectedRASize).best;
						var attemptCount = session.attemptCount();
						if(attemptCount >= selectedRASize) {
							if(bestRA.index - selectedRASize < time.index && time.index <= bestRA.index) {
								cells[col].addClass('bestRA');
							}
							if(table.sorted.index === 0) {
								var firstSolve = session.attemptCount()-selectedRASize;
								var lastTimeIndex = session.attemptCount()-1;
								if(firstSolve <= time.index && time.index <= lastTimeIndex) {
									cells[col].addClass('currentRA');
								}
								
								if(table.sorted.reverse) {
									//the top/bottom are switched
									var temp = lastTimeIndex;
									lastTimeIndex = firstSolve;
									firstSolve = temp;
								}
								
								if(time.index == firstSolve) {
									cells[col].addClass('topCurrentRA');
								} else if(time.index == lastTimeIndex) {
									cells[col].addClass('bottomCurrentRA');
								}
							}
						}
					}
				} else {
					var val = time.format(key);
					cells[col].set('html', time.format(key));
					var raSize = parseInt(key.substring(2), 10);
					var bestIndex = session.bestWorst(key).best.index;
					cells[col].raSize = Function.from(raSize);
					cells[col].lastTimeIndex = Function.from(tr.time.index);
					if(bestIndex !== null && val !== "") {
						cells[col].setStyle('cursor', 'pointer');
						cells[col].addEvent('click', this.raBoxClicked);
					}
					cells[col].removeClass('bestRA');
					if(bestIndex == time.index) {
						cells[col].addClass('bestRA');
					}
				}
			}
		}.bind(this);

		tr.hover = function() {
			table.tbody.getChildren('tr').each(function(row) {
				if(tr == row) {
					return;
				}
				//ridiculous...
				if(row.hovered) {
					table.timeHoverDiv.commentArea.blur();
					row.unhover();
				}
			});
			if(this.pendingUnhover) {
				clearTimeout(this.pendingUnhover);
				this.pendingUnhover = null;
			}
			if(this.hovered) {
				return;
			}
			this.hovered = true;
			this.refresh();
			table.timeHoverDiv.show(this, time);
		};
		tr.unhover = function(e, immediately) {
			if(this.pendingUnhover) {
				return;
			}
			if(document.activeElement == table.timeHoverDiv.commentArea) {
				return;
			}
			// If you place the cursor right on a vertical
			// line between cells, it's considered a mouse-out.
			// This prevents that.
			if(e && tr.containsPoint(e.page)) {
				return;
			}
			this.hovered = false;
			this.pendingUnhover = setTimeout(function() {
				this.refresh();
				this.pendingUnhover = null;
			}.bind(this), 100);
			table.timeHoverDiv.hide(immediately);
		};
		tr.select = function() {
			this.selected = true;
			this.refresh();
		};
		tr.deselect = function() {
			//TODO - remove yourself from the select array!
			this.selected = false;
			this.editing = false;
			this.unhover(null, true);
			this.refresh();
		};
		tr.addEvent('mouseover', tr.hover);
		tr.addEvent('mouseout', tr.unhover);
		return tr;
	},
	resizeCols: function() {
		var i, j;
		var infoCells = this.infoRow.getChildren('td');
		var addTimeCells = this.addRow.getChildren('td');
		var headerRow = this.thead.getChildren('tr')[0];
		var headers = headerRow.getChildren('th');
		var tds = [];
		
		// ok, this is way nasty, but it seems to be the only way
		// to free up the space necessary for this table to get sized correctly
		$(this).getParent().getParent().setStyle('width', null);
		
		//clearing all column widths
		this.tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', null);
		});
		this.tbody.setStyle('width', null); //we want everything to size itself as if there's enough space
		infoCells.each(function(td) {
			td.setStyle('width', null);
		});
		addTimeCells.each(function(td) {
			td.setStyle('width', null);
		});
		headers.each(function(td) {
			td.setStyle('width', null);
		});
		headerRow.setStyle('width', null);
		
		var preferredWidth = 0;
		
		var visibleColCount = 0;
		var resizeme = [headers, infoCells, addTimeCells];
		for(i = 0; i < this.headers.length; i++) {
			if(headers[i].getStyle('display') == 'none') {
				continue;
			}
			visibleColCount++;
			var maxWidth = 0;
			var maxWidthIndex = 0;
			var padding = 0;
			for(j = 0; j < resizeme.length; j++) {
				if(!resizeme[j]) {
					continue;
				}
				var newWidth = resizeme[j][i].getSize().x + 1; //add one for border
				
				if(newWidth >= maxWidth) {
					maxWidth = newWidth;
					maxWidthIndex = j;

					padding = resizeme[j][i].getStyle('padding-left').toInt() + resizeme[j][i].getStyle('padding-right').toInt() + 1; //add one for border
				}
			}
			preferredWidth += maxWidth;
			for(j = 0; j < resizeme.length; j++) {
				//setting everyone to the max width
				if(!resizeme[j]) {
					continue;
				}
				resizeme[j][i].setStyle('width', maxWidth - padding);
			}
		}

		preferredWidth += SCROLLBAR_WIDTH; //this accounts for the vert scrollbar
		var MIN_WIDTH = 0;
		if(preferredWidth < MIN_WIDTH) {
			var extra = (MIN_WIDTH-preferredWidth)/visibleColCount;
			preferredWidth = MIN_WIDTH;
			for(i = 0; i < this.headers.length; i++) {
				if(headers[i].getStyle('display') == 'none') {
					continue;
				}
				for(j = 0; j < resizeme.length; j++) {
					if(!resizeme[j]) {
						continue;
					}
					var cell = resizeme[j][i];
					var oldWidth = cell.getStyle('width').toInt();
					cell.setStyle('width', oldWidth+extra);
				}
			}
		}
		this.preferredWidth = preferredWidth;

		this.tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', preferredWidth-SCROLLBAR_WIDTH);
		});
		this.tbody.setStyle('width', preferredWidth);
		headerRow.setStyle('width', preferredWidth);
		headerRow.setStyle('border-bottom', '1px solid black');
		
		if(this.manager) {
			this.manager.position();
		}
	},
	getTableSpace: function() {
		var space = this.parent.getSize();
		var offset = $(this).getPosition($(this).getParent());
		space.y -= offset.y;
		return space;
	},
	resize: function(forceScrollToLatest) {
		if(!this.session) {
			return; //we're not ready to size this until we have a session
		}

		var maxSize = this.getTableSpace();
		maxSize.y -= $(this).getStyle('margin-bottom').toInt();
		maxSize.y -= this.thead.getSize().y;
		maxSize.y -= this.tfoot.getSize().y;
		this.tbody.setStyle('height', maxSize.y);

		if(this.freshSession) {
			this.freshSession = false;
			this.scrollToLastTime();
		} else if(forceScrollToLatest) {
			this.scrollToLastTime();
		}
	},
	getPreferredWidth: function() {
		return this.preferredWidth + 2; //i have no idea what this 2 is for...
	}
});
