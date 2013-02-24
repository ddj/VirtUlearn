// Including libraries

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	static = require('node-static'); // for serving files

// This will make all the files in the current folder
// accessible from the web
var fileServer = new static.Server('./');
	
// This is the port for our web server.
// you will need to go to http://localhost:8080 to see it
app.listen(8080);

// If the URL of the socket server is opened in a browser
function handler (request, response) {

	request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}

// Delete this row if you want to see debug messages
io.set('log level', 1);

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1'];

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
              socket.on( 'prevSlide', function() {
                        console.log('in the server now for prev');
                        io.sockets.emit('slidePrev');
                        });
              
              socket.on( 'nextSlide', function() {
                        console.log('in the server now for next');
                        io.sockets.emit('slideNext');
                        });
	// Start listening for mouse move events
	socket.on('mousemove', function (data) {
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		socket.username = username;
		socket.room = 'room1';
		usernames[username] = username;
		socket.join('room1');
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		//socket.emit('updaterooms', rooms, 'room1');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
	
});