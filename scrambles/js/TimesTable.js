var TimesTable = new Class({
	Extends: HtmlTable,
	initialize: function(id, server) {
	//TODO - select multiple times for deletion
	//TODO - tag time
		this.server = server;
		this.configuration = server.configuration;
		this.parent(id, {
			headers: [ '', 'Time', 'Mean 3', 'Ra 5', 'Ra 12', 'Ave 100', 'Session Ave' ],
			parsers: [ HtmlTable.Parsers.number, HtmlTable.Parsers.float ],
			rows: [],
			sortable: true,
			zebra: false,
		});
		this.addEvent('onSort', function(tbody, index) {
			this.configuration.set('times.sort', this.sorted);
			this.scrollToLastTime();
		});
		
		this.tbody = $(this).getChildren('tbody')[0];
		
		//we create the add time row
		this.addRow = this.push([ '', '<u>A</u>dd time', '', '', '', '', '' ]).tr.dispose();
		this.addRow.addClass('addTime');
		this.addRow.addEvent('click', function(e) {
			this.rowClicked(e, this.addRow, null);
		}.bind(this));
		
		//there needs to be some dummy content in this row so it gets sized correctly
		//only vertical sizing matters though
		this.infoRow = this.set('footers', [ 'J', '', '', '', '', '', '' ]).tr;
		this.infoRow.refresh = function() {
			var cells = this.infoRow.getChildren();
			cells[0].set('html', this.session.solveCount()+"/"+this.session.attemptCount());
			cells[1].set('html', this.session.bestTime().format());
		}.bind(this);
		this.addRow.inject(this.infoRow, 'before'); //place the add row in the footer
		
		window.addEvent('click', this.deselectRow.bind(this));
		window.addEvent('keydown', function(e) {
			if(e.key == 'esc')
				this.deselectRow();
		}.bind(this));
	},
	freshSession: false,
	setSession: function(session) {
		this.freshSession = true;
		this.session = session;
		this.empty();
		this.session.times.each(function(time) {
			this.add(time);
		}.bind(this));

		this.resort();
		this.infoRow.refresh();
		this.resize();
	},
	reset: function() {
		this.session.reset();
		this.tbody.empty();
		this.refreshData();
	},
	addTime: function(centis) {
		var time = this.session.addTime(centis);
		this.add(time);
		this.resort();
		this.infoRow.refresh();
		this.resize();
	},
	scrollToLastTime: function() {
		this.scrollToRow(this.lastAddedRow);
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
			this.tbody.scrollTo(0, scrollTop + delta);
		} else {
			//the element's on screen!
		}
		
	},
	promptTime: function() {
		this.rowClicked(null, this.addRow, null);
	},
	
	//private!
	resort: function(preserveScrollbar) {
		var scrollTop = this.tbody.scrollTop; //save scroll amount
		var sort = this.configuration.get('times.sort', { index: 0, reverse: false });
		this.sort(sort.index, sort.reverse);
		if(preserveScrollbar)
			this.tbody.scrollTo(0, scrollTop); //restore scroll amount
	},
	selectedRow: null,
	editRow: null,
	rowClicked: function(e, row, time) {
		if(e) e.stop(); //don't want this to be treated as an unfocus event until we know which row was clicked
		if(row == this.selectedRow) {
			return;
		}
		if(this.selectedRow != null) {
			this.deselectRow();
		}

		this.attachSorts(false); //sorting doesn't work well with a selected row
		this.selectedRow = row;
		
		this.editRow = new Element('tr');
		this.editRow.setStyle('width', this.selectedRow.getSize().x);
		this.editRow.addClass('editRow');
		var stopEvent = function(e) { e.stop(); };
		this.editRow.addEvent('click', stopEvent); //we don't want this to propagate up to the current function
		
		var deleteTime = new Element('td');
		deleteTime.inject(this.editRow);
		if(time) {
			deleteTime.set('html', 'X');
			deleteTime.addClass('deleteTime'); //TODO - pretty picture
			deleteTime.addEvent('click', function(e) {
				this.session.disposeTime(time); //remove time
				this.deselectRow().dispose(); //deselect and remove current row
			}.bind(this));
		}
		
		var textField = new Element('input');
		var timeChanged = function(e) {
			try {
				new this.server.Time(textField.value);
				errorField.set('html', '');
			} catch(error) {
				errorField.set('html', error);
			}
		}.bind(this);
		//TODO - how do you listen for input in mootools?
		xAddListener(textField, 'input', timeChanged, false);
		
		textField.setAttribute('type', 'text');
		textField.value = time == null ? "" : time.format();
		//TODO - do something that doesn't depend on %
		textField.setStyle('width', '90%');
		
		function onBlur(e) {
			//accept time if at all possible
			acceptTime();
		}
		var acceptTime = function() {
			//if successful, this function may cause blur, which causes double adding of timess
			textField.removeEvent('blur', onBlur);
			try {
				if(time == null) {
					this.addTime(textField.value);
				} else {
					time.parse(textField.value);
					penalties[String(time.getPenalty())].checked = true;
				}
				return true;
			} catch(error) {
				console.log(error);
				return false;
			} finally {
				textField.addEvent('blur', onBlur);
			}
		}.bind(this);
		textField.addEvent('keydown', function(e) {
			if(e.key == 'esc') {
				//calling deselectRow() will cause a blur, which would cause acceptance of the time
				textField.removeEvent('blur', onBlur);
				this.deselectRow();
			}
			if(e.key == 'enter')
				if(acceptTime())
					this.deselectRow();
		}.bind(this));
		textField.addEvent('blur', onBlur);
		var col2 = new Element('td').adopt(textField);
		col2.inject(this.editRow);

		var errorField = new Element('div', { 'class': 'errorField' });
		var col3 = new Element('td', { colspan: 5 }).adopt(errorField);
		col3.inject(this.editRow);

		//sizing up w/ previous row
		deleteTime.setStyle('width', this.selectedRow.getChildren()[0].getStyle('width'));
		col2.setStyle('width', this.selectedRow.getChildren()[1].getStyle('width'));
		var remainder = this.tbody.getSize().x - this.selectedRow.getChildren()[2].getPosition(this.tbody).x - 1; //subtract 1 for the border
		col3.setStyle('width', remainder);
		
		this.editRow.replaces(this.selectedRow);
		
		if(time) {
			function makeLabel(el) {
				var label = new Element('label', {'for': el.id, html: el.value});
				el.inject(label, 'top');
				return label;
			}
			
			var fieldSet = new Element('fieldset');
			fieldSet.adopt(new Element('legend', {html: "Penalty"}));
			var noPenalty = new Element('input', { type: 'radio', name: 'penalty', value: 'No penalty', id: 'noPenalty' });
			fieldSet.adopt(makeLabel(noPenalty));
			var dnf = new Element('input', { type: 'radio', name: 'penalty', value: 'DNF', id: 'dnf' });
			fieldSet.adopt(makeLabel(dnf));
			var plusTwo = new Element('input', { type: 'radio', name: 'penalty', value: '+2', id: 'plusTwo' });
			
			//select the correct penalty
			var penalties = { "null": noPenalty, "DNF": dnf, "+2": plusTwo };
			penalties[String(time.getPenalty())].checked = true;
			
			fieldSet.adopt(makeLabel(plusTwo));
			var form = new Element('form');
			form.adopt(fieldSet);
			fieldSet.addEvent('change', function(e) {
				if(noPenalty.checked) {
					time.setPenalty(null);
				} else if(dnf.checked) {
					time.setPenalty("DNF");
				} else if(plusTwo.checked) {
					time.setPenalty("+2");
				} else {
					//this shouldn't happen
				}
				textField.value = time.format();
				timeChanged();
			});
			
			this.penaltyRow = new Element('tr', {'class': 'penaltyRow'}).adopt(new Element('td', { colspan: this.options.headers.length}).adopt(form));
			this.penaltyRow.inject(this.editRow, 'after');
			this.scrollToRow(this.penaltyRow);
		} else
			this.penaltyRow = null;

		timeChanged();
		textField.focus(); //this has the added benefit of making the row visible
		textField.select();
	},
	deselectRow: function(e) {
		if(e) {
			//TODO - would be nice to have this in mootools
			function isOrIsChild(el, parent) {
				while(el != null) {
					if(el == parent)
						return true;
					el = el.parentNode;
				}
				return false;
			}
			if(e.rightClick) return null; //we don't let right clicking deselect a row
			if(isOrIsChild(e.target, this.penaltyRow))
				return null;
		}
		
		var row = this.selectedRow;
		if(this.selectedRow != null) {
			this.attachSorts(true); //sorting doesn't work well with a selected row
			
			var addTime = this.selectedRow == this.addRow;
			var editedRow = addTime ? this.lastAddedRow : this.selectedRow;
			if(this.editRow)
				this.selectedRow.replaces(this.editRow);
			if(this.penaltyRow)
				this.penaltyRow.dispose();
			this.selectedRow = this.editRow = this.penaltyRow = null;
			
			//changing the time could very well affect more than this row
			//maybe someday we could be more efficient about the changes
			this.refreshData();
			this.resort(true);
			
			this.resize(); //changing the time may change the size of a column
			this.scrollToRow(editedRow);
		}
		return row;
	},
	refreshData: function() {
		this.deselectRow();
		this.tbody.getChildren('tr').each(function(tr) {
			tr.refresh();
		});
		this.resort(true);
		this.infoRow.refresh();
		this.resize();
	},
	lastAddedRow: null,
	add: function(time) {
		var tr = this.push(['', '', '', '', '', '', '']).tr;
		this.lastAddedRow = tr;
		tr.addEvent('click', function(e) { this.rowClicked(e, tr, time); }.bind(this));
		tr.refresh = function() {
			this.getChildren()[0].set('html', time.index);
			this.getChildren()[1].set('html', time.format());
			this.getChildren()[2].set('html', time.mean3);
			this.getChildren()[3].set('html', time.ra5);
			this.getChildren()[4].set('html', time.ra12);
			this.getChildren()[5].set('html', time.ave100);
			this.getChildren()[6].set('html', time.sessionAve);
		};
		tr.refresh();
	},
	resize: function() {
		if(!this.session) return; //we're not ready to size this until we have a session
		
		//upon resizing, we first deselect any selected rows!
		if(this.selectedRow) {
			this.deselectRow();
			return; //the previous line will cause a resize
		}
		var maxSize = $(this).getParent().getSize();
		var offset = $(this).getPosition($(this).getParent());
		maxSize.y -= offset.y;
		
		var thead = $(this).getChildren('thead')[0];
		var tbody = $(this).getChildren('tbody')[0];
		var tfoot = $(this).getChildren('tfoot')[0];

		var infoCells = this.infoRow.getChildren('td');
		var addTimeCells = this.addRow.getChildren('td');
		var headers = thead.getChildren('tr')[0].getChildren('th');
		var tds = null;
		if(tbody.getChildren('tr').length > 0) {
			tds = tbody.getChildren('tr')[0].getChildren('td');
			//clearing all column widths
			tds.each(function(td) {
				td.setStyle('width', null);
			});
		}
		//clearing all column widths

		tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', null);
		});
		tbody.setStyle('width', null); //we want everything to size itself as if there's enough space
		infoCells.each(function(td) {
			td.setStyle('width', null);
		});
		addTimeCells.each(function(td) {
			td.setStyle('width', null);
		});
		headers.each(function(td) {
			td.setStyle('width', null);
		});
		
		maxSize.y -= $(this).getStyle('margin-bottom').toInt();
		maxSize.y -= thead.getSize().y;
		maxSize.y -= tfoot.getSize().y;
		tbody.setStyle('height', maxSize.y);
		
		var preferredWidth = 0;
		
		var resizeme = [headers, infoCells, addTimeCells, tds];
		for(var i = 0; i < headers.length; i++) {
			var maxWidth = 0;
			var maxWidthIndex = 0;
			var padding = 0;
			for(var j = 0; j < resizeme.length; j++) {
				if(!resizeme[j]) continue;
				var newWidth = resizeme[j][i].getSize().x;
				if(newWidth >= maxWidth) {
					maxWidth = newWidth;
					maxWidthIndex = j;

					padding = resizeme[j][i].getStyle('padding-left').toInt() + resizeme[j][i].getStyle('padding-right').toInt() + 1; //add one for border
				}
			}
			preferredWidth += maxWidth;
			for(var j = 0; j < resizeme.length; j++) {
				//setting everyone to the max width
				if(!resizeme[j]) continue;
				resizeme[j][i].setStyle('width', maxWidth - padding);
			}
		}
		tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', preferredWidth+1); //add 1 for border?
		});

		//preferredWidth += 18; //this accounts for the vert scrollbar
		var width = tbody.getSize().x;
		if(tbody.clientHeight < tbody.scrollHeight) {
			//if there are vertical scrollbars
			width += 18;
		} 
		width = Math.min(width, maxSize.x);
		tbody.setStyle('width', width);
		
		if(this.freshSession) {
			this.freshSession = false;
			this.scrollToLastTime();
		}
	}
});
