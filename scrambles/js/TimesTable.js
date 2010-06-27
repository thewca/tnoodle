var TimesTable = new Class({
	Extends: HtmlTable,
	initialize: function(id, configuration) {
	//TODO - add footers
	//TODO - delete times, reset session
	//TODO - add time
	//TODO - edit time
	//TODO - tag time
		this.configuration = configuration;
		this.parent(id, {
			headers: [ '', 'Time' ],
			parsers: [ HtmlTable.Parsers.number, HtmlTable.Parsers.float ],
			rows: [],
			sortable: true,
			zebra: false,
		});
		this.addEvent('onSort', function(tbody, index) {
			configuration.set('times.sort', this.sorted);
		});
		//this.set('footers', [ '', '###' ]);
	},
	setSession: function(session) {
		this.session = session;
		
		//TODO remove from dom first to increase speed of operations?
		
		this.empty();
		session.times.each(function(time, index) {
			this.add(index+1, time);
		}.bind(this));
		var sort = this.configuration.get('times.sort', { index: 0, reverse: false });
		this.sort(sort.index, sort.reverse);
		this.refreshFooters();
		this.resize();
	},
	addTime: function(centis) {
		var time = this.session.addTime(centis);
		this.add(this.session.times.length, time);
		this.refreshFooters();
		this.resize();
		this.scrollBottom();
	},
	scrollBottom: function() {
		var tbody = $(this).getChildren('tbody')[0];
		var scrollable = tbody.getScrollSize();
		tbody.scrollTo(scrollable.x, scrollable.y);
	},
	//private!
	add: function(index, time) {
		this.push([index, time.format()]);
	},
	refreshFooters: function() {
		//TODO - this doesn't copy the formatting of the previous footers
		this.set('footers', [ this.session.solveCount()+"/"+this.session.attemptCount(), this.session.bestTime().format() ]);
	},
	resize: function() {
		//TODO - this is getting called twice upon startup
		var maxSize = $(this).getParent().getSize();
		var offset = $(this).getPosition($(this).getParent());
		maxSize.y -= offset.y;
		
		var thead = $(this).getChildren('thead')[0];
		var tbody = $(this).getChildren('tbody')[0];
		var tfoot = $(this).getChildren('tfoot')[0];
		
		maxSize.y -= $(this).getStyle('margin-bottom').toInt();
		maxSize.y -= thead.getSize().y;
		maxSize.y -= tfoot.getSize().y;
		tbody.setStyle('height', maxSize.y);
		
		var preferredWidth = 18; //18 is enough for the vert scrollbar
		
		var footers = tfoot.getChildren('tr')[0].getChildren('td');
		var headers = thead.getChildren('tr')[0].getChildren('th');
		var tds = null;
		if(tbody.getChildren('tr').length > 0)
			tds = tbody.getChildren('tr')[0].getChildren('td');
		
		var resizeme = [headers, footers, tds];
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
				if(j == maxWidthIndex || !resizeme[j]) continue;
				resizeme[j][i].setStyle('width', maxWidth - padding);
			}
		}
		console.log("resizing");
		
		tbody.setStyle('width', Math.min(preferredWidth, maxSize.x));
		
		this.scrollBottom();
	}
});
