//TODO - it would be nice to have this in mootools
function isOrIsChild(el, parent) {
	while(el !== null && el !== undefined) {
		if(el == parent) {
			return true;
		}
		el = el.parentNode;
	}
	return false;
}
var SCROLLBAR_WIDTH = 13;
var TimesTable = new Class({
	Extends: HtmlTable,
	cols: null,
	headers: null,
	initialize: function(id, server, scrambleStuff) {
	//TODO - select multiple times for deletion
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
				return HtmlTable.Parsers.number.convert.call(this);
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
			this.emptyRow[i] = '';
		}
		
		//we create the add time row
		this.addRow = this.push(this.emptyRow).tr.dispose();
		this.addRow.refresh = function() {
			this.getChildren()[1].set('html', '<u>A</u>dd time');
		};
		this.addRow.refresh();
		this.addRow.select = this.createRowSelector(this.addRow, null);
		this.addRow.deselect = function() {
			this.getChildren()[1].setStyle('padding', '');
			this.refresh();
		};
		this.addRow.addClass('addTime');
		this.addRow.addEvent('click', function() {
			this.rowClicked(null, this.addRow);
		}.bind(this));
		
		//there needs to be some dummy content in this row so it gets sized correctly
		//only vertical sizing matters though
		this.infoRow = this.set('footers', this.emptyRow).tr;
		this.emptyRow[1] = '';

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
		
		var defaultCols = [ 'index', 'centis', 'ra5', 'ra12', 'ra100' ]; //TODO - read from configuration!
		var initing = true;
		var refreshCols = function() {
			if(initing) {
				return;
			}
			this.refreshData();
		}.bind(this);
		for(var i = 0; i < this.cols.length; i++) {
			var col = this.cols[i];
			var desc = this.headers[i];
			columnOptions.div.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'table.' + col, desc, defaultCols.contains(col), refreshCols));
		}
		initing = false;
		
		window.addEvent('click', this.deselectRow.bind(this));
		window.addEvent('keydown', function(e) {
			if(e.key == 'esc') {
				this.deselectRow();
			}
		}.bind(this));
	},
	freshSession: false,
	setSession: function(session) {
		this.freshSession = true;
		this.session = session;
		this.addRow.dispose(); //if we don't remove this row before calling empty(), it's children will get disposed
		this.empty();
		this.session.times.each(function(time) {
			this.add(time);
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
		this.add(time);
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
	promptTime: function() {
		//TODO - implement!
		this.rowClicked(null, this.addRow);
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
	selectedRow: null,
	rowClicked: function(e, row) {
		//TODO - click to delete as well
		//TODO - add whitespace between times table and scramble
		if(row == this.selectedRow) {
			return;
		}
		row.select();
		this.selectedRow = row;
		
//		if(e) {
//			//don't want this to be treated as an unfocus event until we know which row was clicked
//			e.stop();
//		}
//		if(row == this.selectedRow) {
//			return;
//		}
//		if(this.selectedRow !== null) {
//			this.deselectRow();
//		}
//
//		this.attachSorts(false); //sorting doesn't work well with a selected row
//		this.selectedRow = row;
//		
//		this.editRow = new Element('tr');
//		this.editRow.setStyle('width', this.selectedRow.getSize().x);
//		this.editRow.addClass('editRow');
//		this.editRow.addEvent('click', function(e) { e.stop(); }); //we don't want this to propagate up to the current function
//		
//		var deleteTimeFunc = function(e) {
//			this.session.disposeTime(time); //remove time
//			this.deselectRow().dispose(); //deselect and remove current row
//		}.bind(this);
//		var deleteTime = new Element('td');
//		deleteTime.inject(this.editRow);
//		if(time) {
//			deleteTime.set('html', 'X');
//			deleteTime.addClass('deleteTime'); //TODO - pretty picture
//			deleteTime.addEvent('click', deleteTimeFunc);
//		}
//		
//		var textField = new Element('input');
//		var timeChanged = function(e) {
//			try {
//				var test = new this.server.Time(textField.value);
//				errorField.set('html', '');
//			} catch(error) {
//				errorField.set('html', error);
//			}
//		}.bind(this);
//		//TODO - how do you listen for input in mootools?
//		xAddListener(textField, 'input', timeChanged, false);
//		
//		textField.setAttribute('type', 'text');
//		textField.value = time === null ? "" : time.format();
//		//TODO - do something that doesn't depend on %
//		textField.setStyle('width', '90%');
//		
//		function onBlur(e) {
//			if(time) { //we try to accept the time if we were editing
//				acceptTime();
//			}
//		}
//		var acceptTime = function() {
//			//if successful, this function may cause blur, which causes double adding of timess
//			textField.removeEvent('blur', onBlur);
//			try {
//				if(time === null) {
//					this.addTime(textField.value);
//				} else {
//					time.parse(textField.value);
//					penalties[String(time.getPenalty())].checked = true;
//					this.session.reindex();
//				}
//				return true;
//			} catch(error) {
//				return false;
//			} finally {
//				textField.addEvent('blur', onBlur);
//			}
//		}.bind(this);
//		textField.addEvent('keydown', function(e) {
//			if(e.key == 'esc') {
//				//calling deselectRow() will cause a blur, which would cause acceptance of the time
//				textField.removeEvent('blur', onBlur);
//				this.deselectRow();
//			}
//			if(e.key == 'enter') {
//				if(acceptTime()) {
//					this.deselectRow();
//				}
//			}
//		}.bind(this));
//		textField.addEvent('blur', onBlur);
//		var col2 = new Element('td').adopt(textField);
//		col2.inject(this.editRow);
//
//		var errorField = new Element('div', { 'class': 'errorField' });
//		var col3 = new Element('td', { colspan: 5 }).adopt(errorField);
//		col3.inject(this.editRow);
//
//		//sizing up w/ previous row, i don't know why this doesn't just work when adding a time
//		if(!time) {
//			deleteTime.setStyle('width', this.selectedRow.getChildren()[0].getStyle('width'));
//			col2.setStyle('width', this.selectedRow.getChildren()[1].getStyle('width'));
//			var remainder = this.tbody.getSize().x - this.selectedRow.getChildren()[2].getPosition(this.tbody).x - 1; //subtract 1 for the border
//			col3.setStyle('width', remainder);
//		}
//		
//		this.editRow.replaces(this.selectedRow);
//		
//		if(time) {
//			var makeLabel = function(el) {
//				var label = new Element('label', {'for': el.id, html: el.value});
//				el.inject(label, 'top');
//				return label;
//			};
//			
//			var fieldSet = new Element('fieldset');
//			fieldSet.adopt(new Element('legend', {html: "Penalty"}));
//			var noPenalty = new Element('input', { type: 'radio', name: 'penalty', value: 'No penalty', id: 'noPenalty' });
//			fieldSet.adopt(makeLabel(noPenalty));
//			var dnf = new Element('input', { type: 'radio', name: 'penalty', value: 'DNF', id: 'dnf' });
//			fieldSet.adopt(makeLabel(dnf));
//			var plusTwo = new Element('input', { type: 'radio', name: 'penalty', value: '+2', id: 'plusTwo' });
//			
//			//select the correct penalty
//			var penalties = { "null": noPenalty, "DNF": dnf, "+2": plusTwo };
//			penalties[String(time.getPenalty())].checked = true;
//			
//			fieldSet.adopt(makeLabel(plusTwo));
//			var form = new Element('form');
//			form.adopt(fieldSet);
//			fieldSet.addEvent('change', function(e) {
//				if(noPenalty.checked) {
//					time.setPenalty(null);
//				} else if(dnf.checked) {
//					time.setPenalty("DNF");
//				} else if(plusTwo.checked) {
//					time.setPenalty("+2");
//				} else {
//					//this shouldn't happen
//				}
//				this.session.reindex();
//				textField.value = time.format();
//				timeChanged();
//			}.bind(this));
//			
//			var optionsButton = new Element('div', { html: '^', 'class': 'optionsButton' });
//			optionsButton.setStyle('position', 'relative'); //so hacky
//			optionsButton.setStyle('left', '5px');
//			optionsButton.setStyle('background-color', '#A0A0FF');
//			
//			var optionsDiv = new Element('div', { 'class': 'options' });
//			optionsDiv.setStyle('width', '200px'); //TODO - compute width dynamically
//			optionsDiv.show = function() {
//				optionsDiv.setStyle('display', '');
//				optionsDiv.position({relativeTo: optionsButton, position: 'topLeft', edge: 'bottomLeft'});
//				optionsDiv.fade('in');
//				optionsButton.morph('.optionsButtonHover');
//			};
//			optionsDiv.hide = function() {
//				optionsDiv.fade('out');
//				optionsButton.morph({ 'background-color': '#A0A0FF', color: '#000' }); //this is awful
//			};
//			optionsDiv.setStyle('display', 'none'); //for some reason, setting visiblity: none doesn't seem to work here
//			optionsDiv.hide(); //this allows the first show() to animate
//			
//			optionsButton.addEvent('mouseover', optionsDiv.show);
//			optionsButton.addEvent('mouseout', optionsDiv.hide);
//			optionsDiv.addEvent('mouseover', optionsDiv.show);
//			optionsDiv.addEvent('mouseout', optionsDiv.hide);
//			
//			optionsDiv.refresh = function() {
//				function tagged(e) {
//					if(this.checked) {
//						time.addTag(this.id);
//					} else {
//						time.removeTag(this.id);
//					}
//				}
//				var tags = this.server.getTags(this.session.getPuzzle());
//				for(var i = 0; i < tags.length; i++) {
//					var tag = tags[i];
//					var checked = time.hasTag(tags[i]);
//					var checkbox = new Element('input', { id: tag, type: 'checkbox' });
//					checkbox.checked = checked;
//					checkbox.addEvent('change', tagged);
//					checkbox.addEvent('focus', checkbox.blur);
//					optionsDiv.adopt(new Element('div').adopt(checkbox).adopt(new Element('label', { 'html': tag, 'for': tag })));
//				}
//				
//				// all of this tagging code is some of the worst code i've written for tnt,
//				// probably because it's 7:30 am, and i want to go to sleep
//				// TODO - but it's important that there eventually is a better dialog for editing tags 
//				// that doesn't cause the current row to lose focus
//				var addTagLink = new Element('span', { 'class': 'link', html: 'Add tag' });
//				addTagLink.addEvent('click', function(e) {
//					var tag = prompt("Enter name of new tag (I promise this will become a not-crappy gui someday)");
//					if(tag) {
//						this.server.createTag(this.session.getPuzzle(), tag);
//						optionsDiv.refresh();
//					}
//				}.bind(this));
//				optionsDiv.adopt(addTagLink);
//			}.bind(this);
//			optionsDiv.refresh();
//
//			this.penaltyRow = new Element('tr', {'class': 'penaltyRow' });
//			var extraDelete = new Element('td', {'class': 'extendedDeleteTime'});
//			extraDelete.addEvent('click', deleteTimeFunc);
//			this.penaltyRow.adopt(extraDelete);
//			this.penaltyRow.adopt(new Element('td', { colspan: 4}).adopt(form));
//			this.penaltyRow.adopt(new Element('td', { colspan: 2}).adopt(optionsButton));
//			optionsDiv.inject(this.penaltyRow);
//			this.penaltyRow.inject(this.editRow, 'after');
//			this.scrollToRow(this.penaltyRow);
//		} else {
//			this.penaltyRow = null;
//		}
//
//		timeChanged();
//		textField.focus(); //this has the added benefit of making the row visible
//		textField.select();
	},
	deselectRow: function(e) {
		if(e) {
			if(e.rightClick) {
				return null; //we don't let right clicking deselect a row
			}
			if(isOrIsChild(e.target, this.selectedRow)) {
				return null;
			}
		}
		
		var row = this.selectedRow;
		if(row !== null) {
			this.selectedRow = null;
			row.deselect();
		}
		return row;
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
		
		$(this).toggle(); //prevent flickering?
		this.deselectRow();
		this.tbody.getChildren('tr').each(function(tr) {
			tr.refresh();
			refreshCols(tr);
		});
		this.thead.getChildren('tr').each(refreshCols);
		this.tfoot.getChildren('tr').each(refreshCols);
		refreshCols(this.addRow); //addRow is not a part of the table at this point
		this.resort(true);
		this.infoRow.refresh();
		$(this).toggle(); //prevent flickering?
		this.resizeCols();
	},
	createRowSelector: function(tr, time) {
		return function() {
			if(this.selectedRow) {
				this.selectedRow.deselect();
			}
			tr.selected = true;
			var editCol = tr.getChildren()[1];
			var width = editCol.getStyle('width').toInt() + editCol.getStyle('padding-left').toInt() + editCol.getStyle('padding-right').toInt();
			var height = editCol.getStyle('height').toInt() + editCol.getStyle('padding-top').toInt() + editCol.getStyle('padding-bottom').toInt();
			editCol.setStyle('padding', 0);
			var textField = new Element('input');
			textField.value = editCol.get('text');
			textField.setStyle('border', 'none');
			textField.setStyle('width', width);
			textField.setStyle('height', height);
			textField.setStyle('text-align', 'right'); //not sure this is a good idea, left align might make a good visual indicator
			textField.setStyle('padding', 0);

			textField.addEvent('keydown', function(e) {
				if(e.key == 'esc') {
					this.deselectRow();
				}
				if(e.key == 'enter') {
					try {
						if(time) {
							time.parse(textField.value);
//							penalties[String(time.getPenalty())].checked = true;
						} else {
							this.addTime(textField.value);
						}
						this.session.reindex();
						this.deselectRow();
					} catch(error) {
						alert(error);
					}
				}
			}.bind(this));
			
			editCol.empty();
			editCol.adopt(textField);
			
			textField.focus(); //this has the added benefit of making the row visible
			textField.select();
		}.bind(this);
	},
	lastAddedRow: null,
	add: function(time) {
		var tr = this.push(this.emptyRow).tr;
		this.lastAddedRow = tr;
		tr.addEvent('click', function(e) { this.rowClicked(e, tr); }.bind(this));
		var server = this.server;
		var session = this.session;
		var cols = this.cols;
		var table = this;
		tr.refresh = function() {
			var cells = this.getChildren();
			for(var col = 0; col < table.cols.length; col++) {
				var key = table.cols[col];
				if(key == 'index') {
					cells[col].set('html', time.index + 1);
				} else if(key == 'centis') {
					cells[col].set('html', time.format());
					cells[col].timeCentis = time.centis;
					cells[col].removeClass('bestRA');
					cells[col].removeClass('currentRA');
					cells[col].removeClass('topCurrentRA');
					cells[col].removeClass('bottomCurrentRA');
					cells[col].removeClass('bestTime');
					cells[col].removeClass('worstTime');
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
				} else {
					cells[col].set('html', time.format(key));
					var bestIndex = session.bestWorst(key).best.index;
					cells[col].removeClass('bestRA');
					if(bestIndex == time.index) {
						cells[col].addClass('bestRA');
					}
				}
			}
		};
		var deleteTimeFunc = function(e) {
			this.session.disposeTime(time); //remove time
			
			this.selectedRow = null;
			//TODO - implement deleting multiple times!
			tr.dispose();
			
			//changing the time could very well affect more than this row
			//maybe someday we could be more efficient about the changes
			this.refreshData();
			this.resizeCols(); //changing the time may change the size of a column
//			this.scrollToRow(editedRow);
		}.bind(this);
		var deleteCol = tr.getChildren()[0];
		deleteCol.addEvent('click', deleteTimeFunc);
		tr.hover = function() {
			deleteCol.set('html', 'X');
			deleteCol.addClass('deleteTime'); //TODO - pretty picture
		}.bind(this);
		tr.unhover = function() {
			if(!tr.selected) {
				tr.getChildren()[0].removeClass('deleteTime');
				tr.refresh();
			}
		}.bind(this);
		tr.select = this.createRowSelector(tr, time);
		tr.deselect = function() {
			tr.selected = false;
			tr.unhover();
			var editCol = tr.getChildren()[1];
			editCol.setStyle('padding', '');
			//changing the time could very well affect more than this row
			//maybe someday we could be more efficient about the changes
			this.refreshData();
			this.resizeCols(); //changing the time may change the size of a column
//			this.scrollToRow(editedRow);
		}.bind(this);
		tr.addEvent('mouseover', tr.hover);
		tr.addEvent('mouseout', tr.unhover);
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
		
//		//upon resizing, we first deselect any selected rows!
//		if(this.selectedRow) {
//			this.deselectRow();
//			return; //the previous line will cause a resize
//		}

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
