$(function(){

	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

	// The URL of your web server (the port is set in app.js)
    //the right url must be typed in here, for my computer it's 192.168.1.2
	var url = 'http://192.168.1.2:8080';

	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
  prevButton = $('#prev'),
  nextButton = $('#next'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');
	
	// Generate an unique ID
	var id = Math.round($.now()*Math.random());
	
	// A flag for drawing activity
	var drawing = false;

	var clients = {};
	var cursors = {};

	var socket = io.connect(url);
	
	socket.on('moving', function (data) {
		
		if(! (data.id in clients)){
			// a new user has come online. create a cursor for them
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}
		
		// Move the mouse pointer
		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});
		
		// Is the user drawing?
		if(data.drawing && clients[data.id]){
			
			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
			
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
		
		// Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	});

  socket.on('slidePrev', function() {
            prevPage();
            });
  
  socket.on('slideNext', function() {
            nextPage();
            });
  
	var prev = {};
	
	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;
		
		// Hide the instructions
		instructions.fadeOut();
	});
	
  prevButton.on('click',function(){
                socket.emit('prevSlide');
                });
  
  nextButton.on('click',function(){
                socket.emit('nextSlide');
                });
  
	doc.bind('mouseup mouseleave',function(){
		drawing = false;
	});

	var lastEmit = $.now();

	doc.on('mousemove',function(e){
		if($.now() - lastEmit > 30){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
		
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		
		if(drawing){
			
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
			
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});
	
		var lastEmit = $.now();

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){
		
		for(ident in clients){
			if($.now() - clients[ident].updated > 10000){
				
				// Last update was more than 10 seconds ago. 
				// This user has probably closed the page
				
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
		
	},10000);

	function drawLine(fromx, fromy, tox, toy){
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}
	
	// create a drawer which tracks touch movements
		var drawer = {
			isDrawing: false,
			touchstart: function(coors){
				ctx.beginPath();
				ctx.moveTo(coors.x, coors.y);
				this.isDrawing = true;
				// Hide the instructions
				instructions.fadeOut();

			},
			touchmove: function(coors){
				if (this.isDrawing) {
			        ctx.lineTo(coors.x, coors.y);
			        ctx.stroke();
				}
			},
			touchend: function(coors){
				if (this.isDrawing) {
			        this.touchmove(coors);
			        this.isDrawing = false;
				}
			}
		};
		// create a function to pass touch events and coordinates to drawer
		function draw(event){
			// get the touch coordinates
			var coors = {
				x: event.targetTouches[0].pageX,
				y: event.targetTouches[0].pageY
			};
			// pass the coordinates to the appropriate handler
			drawer[event.type](coors);
		}
		
		// attach the touchstart, touchmove, touchend event listeners.
	    document.addEventListener('touchstart',draw, false);
	    document.addEventListener('touchmove',draw, false);
	    document.addEventListener('touchend',draw, false);
		
		// prevent elastic scrolling
		document.body.addEventListener('touchmove',function(event){
			event.preventDefault();
		},false);	// end body.onTouchMove
});

function openPDF(file)
{
windows.open(file, 'resizable,scrollbars');
}

var pageNum;
var numPages;

function displayPage(num){
    document.getElementById("pageNum").innerHTML = num;
    pageNum=num;
    PDFJS.getDocument('helloworld.pdf').then(function(pdf) {
                                             pdf.getPage(num).then(function(page) {
                                                                   var scale = 1.5;
                                                                   var viewport = page.getViewport(scale);
                                                                   document.getElementById("pageNum").innerHTML = pageNum.toString();
                                                                   var canvas = document.getElementById('paper');
                                                                   var context = canvas.getContext('2d');
                                                                   canvas.height = viewport.height;
                                                                   canvas.width = viewport.width;
                                                                   var renderContext = {
                                                                   canvasContext: context,
                                                                   viewport: viewport
                                                                   };
                                                                   page.render(renderContext);
                                                                   });
                                             numPages= pdf.numPages;
                                             document.getElementById("numPages").innerHTML = numPages.toString();
                                             });
}

function prevPage() {
    pageNum = parseInt(document.getElementById("pageNum").innerHTML);
    if(pageNum > 1) {
        displayPage(pageNum - 1);
    }
}

function nextPage() {
    pageNum = parseInt(document.getElementById("pageNum").innerHTML);
    if(pageNum < numPages) {
        displayPage(pageNum + 1);
    }
}