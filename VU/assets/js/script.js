$(function(){

	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

	// The URL of your web server (the port is set in app.js)
    //the right url must be typed in here, for my computer it's 192.168.1.2
	var url = 'http://10.111.71.169:8080';

	var doc = $(document),
	win = $(window),
	canvas = $('#paper'),
  		prevButton = $('#prev'),
  		nextButton = $('#next'),
		redBtn = $('#redBtn'),
		yelBtn = $('#yelBtn'),
		greenBtn = $('#greenBtn'),
		blueBtn = $('#blueBtn'),
		blackBtn = $('#blackBtn'),
		ctx = canvas[0].getContext('2d'),		
		instructions = $('#instructions');
		
	var canvasPosition = {
    x: canvas.offset().left,
    y: canvas.offset().top
};
		
	    //Generate a random color
	var Teachercolor = '#00ff00';
    var color = '#0000ff';
	
	// Generate an unique ID
	var id = sessionStorage.getItem("key");
	var userType = sessionStorage.getItem("type");
	//var id = Math.round($.now()*Math.random());
	
	
		
	if(userType.match("Teacher")){
		prevButton.on('click',function(){
                socket.emit('prevSlide');
                });
  
  		nextButton.on('click',function(){
                socket.emit('nextSlide');
                });		
	}
	else{
		$('#conversation').hide();
	}
	
	redBtn.on('click',function(){
		color='#FF0000';
    });	
	yelBtn.on('click',function(){
		color='#FFFF00';
    });	
	greenBtn.on('click',function(){
		color='#00FF00';
    });	
	blueBtn.on('click',function(){
		color='#0000FF';
    });	
	blackBtn.on('click',function(){
		color='#000000';
    });	

	
	// A flag for drawing activity
	var drawing = false;

	var clients = {};
	var cursors = {};

	var socket = io.connect(url);
	
	// on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		socket.emit('adduser', id);
	});

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
	});

	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		/*$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});*/
	});
		// when the client clicks SEND
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});
	
	
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
			
			ctx.strokeStyle = data.color;

			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
		
		// Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	});
  
	var prev = {};
	
	socket.on('slidePrev', function() {
        prevPage();
    });
  
  	socket.on('slideNext', function() {
       nextPage();
    });
	
	document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);

    function touchHandler(event)
    {
        var touches = event.changedTouches,
            first = touches[0],
            type = '';
        switch(event.type)
        {
            case "touchstart":
                type = "mousedown";
                break;
            case "touchmove":
                type = "mousemove";
                break;
            case "touchend":
                type = "mouseup";
                break;
            case "touchcancel":
                type = "mouseup";
                break;
            default:
                return;
        }

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);

        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }
	
	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX - canvasPosition.x;
		prev.y = e.pageY - canvasPosition.y;
		
		// Hide the instructions
		instructions.fadeOut();
	});
  
	doc.bind('mouseleave',function(){
		drawing = false;
	});
	
	doc.bind('mouseup',function(){
		drawing = false;
		ctx.closePath();
	});


	var lastEmit = $.now();

	doc.on('mousemove',function(e){
		if(userType.match("Teacher")){
		if($.now() - lastEmit > 30){
			socket.emit('mousemove',{
				'x': e.pageX - canvasPosition.x,
				'y': e.pageY - canvasPosition.y,
				'color': color,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
		}
		
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		
		if(drawing){
			ctx.strokeStyle = color;
			drawLine(prev.x, prev.y, e.pageX - canvasPosition.x,e.pageY - canvasPosition.y);
			
			prev.x = e.pageX - canvasPosition.x;
			prev.y = e.pageY - canvasPosition.y;
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
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	} 
	// create a drawer which tracks touch movements
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
                                                                   canvas.height = viewport.height + 200;
                                                                   canvas.width = viewport.height + 200;
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
