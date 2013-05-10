var fileNameP='';
var type='';
$(function(){

	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}
	
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

	Parse.initialize("gAWomM0rkBO0iTwhujztAIMN8Dwfo93rXxNBAcHR", "yvPZpTfRleqO3hXyv2kVm4ZX9RySDouUH0H2H3FW");

	// The URL of your web server (the port is set in app.js)
    //the right url must be typed in here, for my computer it's 192.168.1.2
	//Connected to nexus4 192.168.43.102
 	var url = 'http://192.168.0.17:8080';

	var doc = $(document),
	win = $(window),
	canvas = $('#paper'),
    left=$('#left'),
  		prevButton = $('#prev'),
  		nextButton = $('#next'),
        inputFile = $('#inputFile'),
		redBtn = $('#redBtn'),
		yelBtn = $('#yelBtn'),
		greenBtn = $('#greenBtn'),
		blueBtn = $('#blueBtn'),
		blackBtn = $('#blackBtn'),
		widthoneBtn = $('#widthoneBtn'),
		widthtwoBtn = $('#widthtwoBtn'),
		widththreeBtn = $('#widththreeBtn'),
		dataTextInput = $('#submitField'),
		dataTextButton = $('#datasend'),
		ctx = canvas[0].getContext('2d'),		
		instructions = $('#instructions');


	var canvasPosition = {
    x: canvas.offset().left,
    y: canvas.offset().top
};

	    //Generate a random color
    var color = '#0000ff';
	var width = 1;

	// Generate an unique ID
	var id = sessionStorage.getItem("user");
	var userType = sessionStorage.getItem("type");
	type = userType;
	//alert("type "+userType);
	//alert("username "+id);
	//var id = Math.round($.now()*Math.random());

	if(userType.match("Teacher")){
		$('#studentF').hide();
	}
	else{ 
		$('#teacherF').hide();
	}


	if(userType.match("Teacher")){
		prevButton.on('click',function(){
                socket.emit('prevSlide');
                });
  
  		nextButton.on('click',function(){
                socket.emit('nextSlide');
                });
        document.getElementById('inputFile').onchange = function () {
                var split = (this.value).split('fakepath\\');
                fileNameP = split[1];
                ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
                socket.emit('loadSlide', fileNameP);
        };
	}
	else{
		$('#conversation').hide();
	}

	redBtn.on('click touchstart',function(){
		color='#FF0000';
    });	
	yelBtn.on('click touchstart',function(){
		color='#FFFF00';
    });	
	greenBtn.on('click touchstart',function(){
		color='#00FF00';
    });	
	blueBtn.on('click touchstart',function(){
		color='#0000FF';
    });	
	blackBtn.on('click touchstart',function(){
		color='#000000';
    });	
	widthoneBtn.on('click touchstart',function(){
		width=1;
    });
	widthtwoBtn.on('click touchstart',function(){
		width=3;
    });
	widththreeBtn.on('click touchstart',function(){
		width=5;
    });
	
	$('#backButton').on('click touchstart',function(){
	if(userType.match("Teacher")){
		window.open("dashboardT.html",'_self');
	}
	else{ 
		window.open("dashboardS.html",'_self');
	}
    });	
	
	$('#saveButton').on('click touchstart',function(){
 	var canvas = document.getElementById("paper");
	var dataURI = canvas.toDataURL("image/png");
	var data = ""+dataURI;
	var containerName= id.replace(/\./g,'');
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var hours = today.getHours();
	var minutes = today.getMinutes();
	var seconds = today.getSeconds();

	var yyyy = today.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} if(minutes<10){minutes= '0'+minutes} if(seconds<10){seconds= '0'+seconds} if(hours<10){hours= '0'+hours}
	today = mm+''+dd+''+yyyy+'_'+hours+minutes+seconds;
	//alert(today);
	socket.emit('save',""+dataURI,seconds+"",containerName);
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
	var count = 0;
	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<h4 class="message">'+username + ': ' +'<small>'+ data +'</small>'+ '</br>'+'</h4>');
		count=count+1;
		document.getElementById("chatcount").innerHTML=count;
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
	dataTextInput.on('click touchstart',function(){
			dataTextInput.focus();
    });	
		dataTextButton.on('click touchstart',function(){
			var message = dataTextInput.val();
			dataTextInput.val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		dataTextInput.keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				dataTextButton.focus().click();
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
			ctx.lineWidth = data.width;
			//alert(data.x);
			drawLine(clients[data.id].x*ctx.canvas.width, clients[data.id].y*ctx.canvas.height, data.x*ctx.canvas.width, data.y*ctx.canvas.height);
		}

		// Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now()
		;
	});
  
	var prev = {};

  socket.on('slideLoad', function(file) {
            fileNameP = file;
            canvas.width = left.clientWidth;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            displayPage(1);
            });
  
	socket.on('slidePrev', function() {
        prevPage();
    });
  
  	socket.on('slideNext', function() {
       nextPage();
    });

	

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
				'x': (e.pageX - canvasPosition.x)/ctx.canvas.width,
				'y': (e.pageY - canvasPosition.y)/ctx.canvas.height,
				'width' : width,
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
			ctx.lineWidth = width;
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

var pageNum;
var numPages;

function displayPage(num){
	var canvas = document.getElementById('paper');
	var context = canvas.getContext('2d');
	context.clearRect(0,0,context.canvas.width,context.canvas.height);

    document.getElementById("pageNum").innerHTML = num;
    pageNum=num;
    PDFJS.getDocument(fileNameP).then(function(pdf) {
        pdf.getPage(num).then(function(page) {
        var scale = 1;
        var viewport = page.getViewport(scale);

		var scaleX = (canvas.width)/viewport.width;
		var scaleY = canvas.height/viewport.height;
		if(scaleX>scaleY){
			scale=scaleY;
		}
		else
		{
			scale=scaleX;
		}
        viewport = page.getViewport(scale);	
        document.getElementById("pageNum").innerHTML = pageNum.toString();
        var renderContext = {
                canvasContext: context,
                viewport: viewport,
				scaleX:scaleX,
				scaleY:scaleX
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

function onLoadF(){
    var left = document.getElementById('left');
    var canvas = document.getElementById('paper');
	canvas.width = left.clientWidth;
    canvas.height = left.clientHeight;

	if(type.match('Student')){
		canvas.width = (document.width*0.99);
		var context = canvas.getContext("2d");
   		context.moveTo(0.7*canvas.width, 0);
   		context.lineTo(0.7*canvas.width, canvas.height);
   		context.strokeStyle = "black";
   		context.stroke();
	}
}