var TimesTable = new Class({
	Extends: HtmlTable,
	initialize: function(id, configuration) {
	//TODO - select multiple times for deletion
	//TODO - tag time
		this.configuration = configuration;
		this.parent(id, {
			headers: [ '', 'Time', 'Mean 3', 'Ra 5', 'Ra 12', 'Ave 100', 'Session Ave' ],
			parsers: [ HtmlTable.Parsers.number, HtmlTable.Parsers.float ],
			rows: [],
			sortable: true,
			zebra: false,
		});
		this.addEvent('onSort', function(tbody, index) {
			configuration.set('times.sort', this.sorted);
			this.scrollBottom();
		});
		
		//we create the add time row
		this.addRow = this.push([ '', '<u>A</u>dd time', '', '', '', '', '' ]).tr.dispose();
		this.addRow.addClass('addTime');
		this.addRow.addEvent('click', function(e) {
			this.rowClicked(e, this.addRow, null);
		}.bind(this));
		
		this.infoRow = this.set('footers', [ '', '', '', '', '', '', '' ]).tr;
		this.infoRow.refresh = function() {
			var cells = this.infoRow.getChildren();
			cells[0].set('html', this.session.solveCount()+"/"+this.session.attemptCount());
			cells[1].set('html', this.session.bestTime().format());
		}.bind(this);
		this.addRow.inject(this.infoRow, 'before'); //place the add row in the footer
		
		//TODO - format penatly row
		//TODO - enable deselection of selected row
		//TODO - select newest row by default?
		//TODO - enable penalties!
		//window.addEvent('click', this.deselectRow.bind(this));
	},
	setSession: function(session) {
		this.session = session;
		this.refreshData();
	},
	reset: function() {
		this.session.reset();
		this.refreshData();
	},
	addTime: function(centis) {
		var time = this.session.addTime(centis);
		this.add(this.session.times.length, time);
		this.resort();
		this.infoRow.refresh();
		this.resize();
		this.scrollBottom();
	},
	scrollBottom: function() {
		//TODO - scroll to most recent time instead
		
		var tbody = $(this).getChildren('tbody')[0];
		var scrollable = tbody.getScrollSize();
		tbody.scrollTo(scrollable.x, scrollable.y);
	},
	promptTime: function() {
		this.rowClicked(null, this.addRow, null);
	},
	
	//private!
	resort: function() {
		var sort = this.configuration.get('times.sort', { index: 0, reverse: false });
		this.sort(sort.index, sort.reverse);
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
		this.selectedRow = row;
		
		this.editRow = new Element('tr');
		var stopEvent = function(e) { e.stop(); };
		this.editRow.addEvent('click', stopEvent); //we don't want this to propagate up to the current function
		if(time) {
			var deleteTime = new Element('td', {'html': 'X'}); //TODO - pretty picture
			deleteTime.addClass('deleteTime'); //TODO - pretty picture
			deleteTime.addEvent('click', function(e) {
				this.session.disposeTime(time); //remove time
				this.refreshData();
			}.bind(this));
			deleteTime.inject(this.editRow);
		}
		
		var textField = new Element('input');
		textField.setAttribute('type', 'text');
		textField.value = time == null ? "" : time.format();
		//TODO - do something that doesn't depend on %
		//TODO - in non ff, the table expands when adding/editing times?
		textField.setStyle('width', '90%');
		textField.addEvent('keydown', function(e) {
			if(e.key == 'esc')
				this.deselectRow();
			if(e.key == 'enter') {
				try {
					if(time == null)
						this.addTime(textField.value);
					else
						time.parse(textField.value);
					this.deselectRow();
				} catch(error) {
					//TODO - notify user of why the time is invalid
					console.log(error);
				}
			}
		}.bind(this));
		
		this.editRow.adopt(textField);
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
			fieldSet.adopt(makeLabel(plusTwo));
			var form = new Element('form');
			form.adopt(fieldSet);
			
			this.penaltyRow = new Element('tr').adopt(new Element('td', { colspan: this.options.headers.length}).adopt(form));
			this.penaltyRow.inject(this.editRow, 'after');
		} else
			this.penatlyRow = null;
		textField.focus();
		textField.select();
	},
	deselectRow: function(e) {
		if(e && e.rightClick) return null; //we don't let right clicking deselect a row
		var row = this.selectedRow;
		if(this.selectedRow != null) {
			var addTime = this.selectedRow == this.addRow;
			if(this.editRow)
				this.selectedRow.replaces(this.editRow);
			if(this.penaltyRow)
				this.penaltyRow.dispose();
			if(addTime)
				this.resort();
			else
				this.selectedRow.refresh();
			this.editRow = this.selectedRow = null;
			
			this.resize(); //changing the time may change the size of a column
			if(addTime)
				this.scrollBottom();
		}
		return row;
	},
	refreshData: function() {
		//TODO remove from dom first to increase speed of operations?
		this.empty();
		this.editRow = this.selectedRow = null;
		this.session.times.each(function(time, index) {
			this.add(index+1, time);
		}.bind(this));
		this.resort();
		this.infoRow.refresh();
		this.resize();
	},
	add: function(index, time) {
		var tr = this.push([index, time.format(), time.mean3, time.ra5, time.ra12, time.ave100, time.sessionAve]).tr;
		tr.addEvent('click', function(e) { this.rowClicked(e, tr, time); }.bind(this));
		tr.refresh = function() {
			this.getChildren()[1].set('html', time.format());
		};
	},
	firstResize: true,
	resize: function() {
		if(!this.session) return; //we're not ready to size this until we have a session
		//TODO - this is getting called twice upon startup
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
		tbody.setStyle('width', maxSize.x); //we want everything to size itself as if there's enough space
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
				//setting everyone else to the max width
				if(!resizeme[j]) continue;
				resizeme[j][i].setStyle('width', maxWidth - padding);
			}
		}
		tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', preferredWidth+1); //add 1 for border?
		});
		
		preferredWidth += 18; //this accounts for the vert scrollbar
		tbody.setStyle('width', Math.min(preferredWidth, maxSize.x));
		
		if(this.firstResize) {
			this.firstResize = false;
			//TODO this feels kinda hacky, and doesn't work all the time =(
			setTimeout(this.scrollBottom.bind(this), 100);
		}
	}
});
