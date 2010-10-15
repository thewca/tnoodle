//TODO - it would be nice to have this in mootools
function findAncestor(el, cond) {
	while(el !== null && el !== undefined) {
		if(cond(el)) {
			return el;
		}
		el = el.parentNode;
	}
	return null;
}
function isOrIsChild(el, parent) {
	return findAncestor(el, function(e) { return e == parent; }) !== null;
}
var SCROLLBAR_WIDTH = 13;
var TimesTable = new Class({
	Extends: HtmlTable,
	cols: null,
	headers: null,
	initialize: function(id, server, scrambleStuff) {
		this.server = server;
		this.configuration = server.configuration;
		this.scrambleStuff = scrambleStuff;
		this.cols = server.timeKeys;
		this.headers = server.timeKeyNames;
		
		var table = this;
		HtmlTable.Parsers.time = {
			match: /^.*$/,
			convert: function() {
				if(isOrIsChild(this, table.addRow)) {
					return Infinity;
				}
				return this.timeCentis;
			},
			number: true
		};
		//this parser will ignore our sizer tr
		HtmlTable.Parsers.num = {
			match: HtmlTable.Parsers.number.match,
			convert: function() {
				if(isOrIsChild(this, table.addRow)) {
					return Infinity;
				}
				//We can't just look at the html because of the delete thingy
				var val = this.getParent().time.format(this.key).toInt();
				return val;
			},
			number: HtmlTable.Parsers.number.number
		};
		this.parent(id, {
			headers: this.headers,
			parsers: [ HtmlTable.Parsers.num, HtmlTable.Parsers.time ],
			rows: [],
			sortable: true,
			zebra: false
		});
		this.addEvent('onSort', function(tbody, index) {
			//TODO - this code gets calls when resort() is called, which is kind of inefficient
			
			this.configuration.set('times.sort', this.sorted);
			this.scrollToLastTime();
			this.addRow.inject(this.tbody);
			
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
				if(key == 'index') {
					cells[col].set('html', this.session.solveCount()+"/"+this.session.attemptCount());
				} else if(key == 'sessionAve') {
					cells[col].set('html', '&sigma; = ' + format(this.session.stdDev()));	
				} else {
					//cells[col].set('html', format(this.session.bestWorst().best.centis));
					var best = this.session.bestWorst(key).best;
					cells[col].set('html', format(best.centis));
					cells[col].removeClass('bestRA');
					if(best.index !== null) {
						cells[col].addClass('bestTime');
						cells[col].addClass('bestRA');
					}
				}
			}
		}.bind(this);
		
		this.thead = $(this).getChildren('thead')[0];
		this.thead.getChildren('tr')[0].getChildren('th').each(function(th, index) {
			var title = server.timeKeyDescriptions[index];
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
		columnOptions.button.setStyle('width', SCROLLBAR_WIDTH+4);
		
		var defaultCols = [ 'index', 'centis', 'ra5', 'ra12', 'ra100' ];
		var initing = true;
		var refreshCols = function() {
			if(initing) {
				return;
			}
			this.refreshData();
		}.bind(this);
		for(i = 0; i < this.cols.length; i++) {
			var col = this.cols[i];
			var desc = this.headers[i];
			var opt = tnoodle.tnt.createOptionBox(server.configuration, 'table.' + col, desc, defaultCols.contains(col), refreshCols);
			//TODO - disable disabling the times column!
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
				}
				selectedRows = [ ignoreRow ];
			} else {
				selectedRows = [];
			}

			//This gets ride of the errorField if we were editing a time
			//TODO - this gets rid of the hover if no times are selected!
			timeHoverDiv.hide();
		}
		this.deselectRows = deselectRows;
		this.promptTime = function() {
			deselectRows();
			selectRow(this.addRow);
		}.bind(this);
		window.addEvent('click', function(e) {
			var timeHoverChild = findAncestor(e.target, function(e) {
				return e == timeHoverDiv;
			});
			if(e.rightClick || timeHoverChild) {
				// We don't let right clicking or tagging a time deselect a row
				return;
			}
			//TODO - is there a better way of checking nodeName?
			var row = findAncestor(e.target, function(el) { return el.nodeName == 'TR'; });
			if(!isOrIsChild(row, table.tbody)) {
				row = null;
			}
			if(row) {
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
				} else if(e.shift && isOrIsChild(mostRecentRow, $(table))) {
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
					var edit = selectedRows.contains(row);
					deselectRows(row);
					if(edit) {
						row.editing = true;
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
			if(e.key == 'esc') {
				deselectRows();
			} else if(e.key == 'delete') {
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
						selectedRows.each(function(row) {
							row.deleteTime();
						});
					}
				}
			}
		}.bind(this));

		
		var timeHoverDiv = new Element('div');
		timeHoverDiv.fade('hide');
		timeHoverDiv.setStyles({
			position: 'absolute',
			//border: '1px solid',
			backgroundColor: 'white',
			zIndex: 1
		});
		var makeLabel = function(el) {
			var label = new Element('label', {'for': el.id, html: el.value});
			el.inject(label, 'top');
			return label;
		};
		
		var fieldSet = new Element('fieldset');
		timeHoverDiv.legend = new Element('legend');
		fieldSet.adopt(timeHoverDiv.legend);
		var noPenalty = new Element('input', { type: 'radio', name: 'penalty', value: 'No penalty', id: 'noPenalty' });
		fieldSet.adopt(makeLabel(noPenalty));
		var dnf = new Element('input', { type: 'radio', name: 'penalty', value: 'DNF', id: 'dnf' });
		fieldSet.adopt(makeLabel(dnf));
		var plusTwo = new Element('input', { type: 'radio', name: 'penalty', value: '+2', id: 'plusTwo' });
		
		//select the correct penalty
		timeHoverDiv.penalties = { "null": noPenalty, "DNF": dnf, "+2": plusTwo };
		
		fieldSet.adopt(makeLabel(plusTwo));
		var form = new Element('form');
		form.adopt(fieldSet);
		fieldSet.addEvent('change', function(e) {
			if(noPenalty.checked) {
				timeHoverDiv.time.setPenalty(null);
			} else if(dnf.checked) {
				timeHoverDiv.time.setPenalty("DNF");
			} else if(plusTwo.checked) {
				timeHoverDiv.time.setPenalty("+2");
			} else {
				//this shouldn't happen
			}
			table.session.reindex();
			table.refreshData();
		});
		
		var options = tnoodle.tnt.createOptions();
		var optionsButton = options.button;
		var optionsDiv = options.div;
		
		optionsDiv.refresh = function() {
			function tagged(e) {
				if(this.checked) {
					time.addTag(this.id);
				} else {
					time.removeTag(this.id);
				}
			}
			var tags = table.server.getTags(table.session.getPuzzle());
			for(var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				var checked = timeHoverDiv.time.hasTag(tags[i]);
				var checkbox = new Element('input', { id: tag, type: 'checkbox' });
				checkbox.checked = checked;
				checkbox.addEvent('change', tagged);
				checkbox.addEvent('focus', checkbox.blur);
				optionsDiv.adopt(new Element('div').adopt(checkbox).adopt(new Element('label', { 'html': tag, 'for': tag })));
			}
			
			// all of this tagging code is some of the worst code i've written for tnt,
			// probably because it's 7:30 am, and i want to go to sleep
			// TODO - but it's important that there eventually is a better dialog for editing tags 
			// that doesn't cause the current row to lose focus
			var addTagLink = new Element('span', { 'class': 'link', html: 'Add tag' });
			addTagLink.addEvent('click', function(e) {
				var tag = prompt("Enter name of new tag (I promise this will become a not-crappy gui someday)");
				if(tag) {
					table.server.createTag(table.session.getPuzzle(), tag);
					optionsDiv.refresh();
				}
			});
			optionsDiv.adopt(addTagLink);
		};

		timeHoverDiv.form = form;
		//TODO - implement tagging properly!
		//timeHoverDiv.adopt(optionsButton);
		timeHoverDiv.adopt(timeHoverDiv.form);
		document.body.adopt(timeHoverDiv);
		timeHoverDiv.addEvent('mouseover', function(e) {
			timeHoverDiv.tr.hover();	
			timeHoverDiv.show();
		});
		timeHoverDiv.addEvent('mouseout', function(e) {
			timeHoverDiv.tr.unhover();	
			timeHoverDiv.hide();
		});
		var errorField = new Element('div', { 'class': 'errorField' });
		timeHoverDiv.errorField = errorField;
		timeHoverDiv.show = function(tr, time) {
			if(tr) {
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
					timeHoverDiv.adopt(timeHoverDiv.form);

					timeHoverDiv.legend.set('html', 'Penalty (time: ' + timeHoverDiv.time.format('rawCentis') + ')');
					timeHoverDiv.penalties[String(timeHoverDiv.time.getPenalty())].checked = true;
					optionsDiv.refresh();
				}
			}
			var el = timeHoverDiv.tr.getChildren()[1];
			if(isOrIsChild(el, this.tbody)) {
				timeHoverDiv.position({relativeTo: el, position: 'bottomLeft', edge: 'topRight'});
				//make sure this doesn't fall off the end of the world
				if(timeHoverDiv.getPosition().y + timeHoverDiv.getSize().y > window.getSize().y) {
					timeHoverDiv.position({relativeTo: el, position: 'topLeft', edge: 'bottomRight'});
				}
				timeHoverDiv.fade('in');
			} else {
				timeHoverDiv.fade('hide');
			}
		}.bind(this);
		timeHoverDiv.hide = function() {
			//TODO - comment! SEE A
			if(!timeHoverDiv.tr || !timeHoverDiv.tr.editing) {
				timeHoverDiv.fade('out');
			}
		};
		this.timeHoverDiv = timeHoverDiv;
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
		this.session.times.each(function(time) {
			this.createRow(time);
		}.bind(this));

		this.refreshData();
	},
	reset: function() {
		this.session.reset();
		this.setSession(this.session);
	},
	addTime: function(centis, oldScramble) {
		if(!oldScramble) {
			oldScramble = this.scrambleStuff.getScramble();
			this.scrambleStuff.scramble();
		}
		var time = this.session.addTime(centis, oldScramble);
		this.createRow(time);
		this.refreshData();
		this.scrollToLastTime();
	},
	scrollToLastTime: function() {
		if(this.lastAddedRow) {
			this.scrollToRow(this.lastAddedRow);
		}
	},
	scrollToRow: function(tr) {
		var scrollTop = this.tbody.scrollTop;
		var scrollBottom = scrollTop + this.tbody.getSize().y;
		
		var elTop = tr.getPosition(tr.getParent()).y;
		var elBottom = tr.getSize().y + elTop;
		
		if(elTop < scrollTop) {
			//we scroll up just until the top of the row is visible
			this.tbody.scrollTo(0, elTop);
		} else if(elBottom > scrollBottom) {
			//we scroll down just until the bottom of the element is visible
			var delta = elBottom - scrollBottom;
			delta += 3; //add a couple for the border, TODO - compute border!
			this.tbody.scrollTo(0, scrollTop + delta);
		} else {
			//the element's on screen!
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
		refreshCols(this.addRow); //addRow is not a part of the table at this point
		this.resort(true);
		this.infoRow.refresh();
		//$(this).toggle(); //prevent flickering?
		this.resizeCols();
	},
	editCell: function(cell, time) {
		if(isOrIsChild(cell.textField, cell)) {
			// we must be editing currently
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
			if(e.key == 'enter') {
				try {
				//TODO SHOW STATE
					this.deselectRows();
					if(time) {
						time.parse(textField.value);
//							penalties[String(time.getPenalty())].checked = true;
						this.session.reindex();
						this.refreshData();
					} else {
						this.addTime(textField.value);
					}
				} catch(error) {
					// No need for an alert
					//alert("Error entering time " + textField.value + "\n" + error);
				}
			}
		}.bind(this));
		
		var timeChanged = function(e) {
			try {
				var test = new this.server.Time(textField.value);
				this.timeHoverDiv.errorField.set('html', '');
			} catch(error) {
				this.timeHoverDiv.errorField.set('html', error);
			}
			this.timeHoverDiv.show();
		}.bind(this);
		//TODO - how do you listen for input in mootools?
		xAddListener(textField, 'input', timeChanged, false);
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
		tr.deleteTime = function(e) {
			this.session.disposeTime(time); //remove time
			
			//TODO - implement deleting multiple times!
			tr.dispose();
			
			//changing the time could very well affect more than this row
			//maybe someday we could be more efficient about the changes
			this.refreshData();
			this.resizeCols(); //changing the time may change the size of a column

			// timeHoverDiv will get hidden by its next refresh
		}.bind(this);
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
					//TODO OMG WTF LOL, if there's only 1 call to show(), the
					//hover is sized incorrectly when esc is pressed
					this.timeHoverDiv.show(tr, tr.time);
					this.timeHoverDiv.show(tr, tr.time);
				}.bind(this), 0);
			} else {
				tr.removeClass('hovered');
			}
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
					if(tr.selected || tr.hovered) {
						cells[col].set('html', 'X');
						cells[col].addClass('deleteTime'); //TODO - pretty picture
						cells[col].addEvent('click', tr.deleteTime);
					} else {
						cells[col].set('html', time.index + 1);
						cells[col].removeClass('deleteTime');
					}
				} else if(key == 'centis') {
					if(tr.editing) {
						this.editCell(cells[col], time);
					} else {
						cells[col].set('html', time.format());
						cells[col].timeCentis = time.centis;
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
						var selectedRASize = 12;
						var bestRA = session.bestWorst('ra' + selectedRASize).best;
						var attemptCount = session.attemptCount();
						if(attemptCount >= selectedRASize) {
							if(bestRA.index - selectedRASize < time.index && time.index <= bestRA.index) {
								cells[col].addClass('bestRA');
							}
							if(table.sorted.index === 0) {
								var firstSolve = session.attemptCount()-selectedRASize;
								var lastSolve = session.attemptCount()-1;
								if(firstSolve <= time.index && time.index <= lastSolve) {
									cells[col].addClass('currentRA');
								}
								
								if(table.sorted.reverse) {
									//the top/bottom are switched
									var temp = lastSolve;
									lastSolve = firstSolve;
									firstSolve = temp;
								}
								
								if(time.index == firstSolve) {
									cells[col].addClass('topCurrentRA');
								} else if(time.index == lastSolve) {
									cells[col].addClass('bottomCurrentRA');
								}
							}
						}
					}
				} else {
					cells[col].set('html', time.format(key));
					var bestIndex = session.bestWorst(key).best.index;
					cells[col].removeClass('bestRA');
					if(bestIndex == time.index) {
						cells[col].addClass('bestRA');
					}
				}
			}
		}.bind(this);

		tr.hover = function() {
			this.hovered = true;
			this.refresh();
			table.timeHoverDiv.show(this, time);
		};
		tr.unhover = function(e) {
			this.hovered = false;
			this.refresh();
			table.timeHoverDiv.hide();
		};
		tr.select = function() {
			this.selected = true;
			this.refresh();
		};
		tr.deselect = function() {
			//TODO - remove yourself from the select array!
			this.selected = false;
			this.editing = false;
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
		var headers = this.thead.getChildren('tr')[0].getChildren('th');
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
		
		var preferredWidth = 0;
		
		var resizeme = [headers, infoCells, addTimeCells];
		for(i = 0; i < this.headers.length; i++) {
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
		this.tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', preferredWidth);
		});

		preferredWidth += SCROLLBAR_WIDTH; //this accounts for the vert scrollbar
		this.preferredWidth = preferredWidth;
		this.tbody.setStyle('width', preferredWidth);
		
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
