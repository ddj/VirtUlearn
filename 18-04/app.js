// Including libraries

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	static = require('node-static'); // for serving files

	// include the node-azure dependency
var azure = require('azure');

var storageAccount = "virtulearnstudents";
var accessKey = "jhutvBox2zXUGleDgW7deY56tqi0wjn8uT09+fw/GYomk5pHWfF1XxT9JwpZRG2RzOXlGqGX7GPEB3EVN32swA==";

var blobService = azure.createBlobService(storageAccount, accessKey);

var storageAccountT = "virtulearnstudents";
var accessKeyT = "jhutvBox2zXUGleDgW7deY56tqi0wjn8uT09+fw/GYomk5pHWfF1XxT9JwpZRG2RzOXlGqGX7GPEB3EVN32swA==";
var tableService = azure.createTableService(storageAccountT,accessKeyT);

// This will make all the files in the current folder
// accessible from the web
var fileServer = new static.Server('./');
	
// This is the port for our web server.
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
io.sockets.on('connection', function (socket){
              
              socket.on( 'prevSlide', function() {
                        console.log('in the server now for prev');
                        io.sockets.emit('slidePrev');
                        });
              
              socket.on( 'nextSlide', function() {
                        console.log('in the server now for next');
                        io.sockets.emit('slideNext');
                        });
              socket.on( 'loadSlide', function(data) {
                        console.log('in the server now for load'+data);
                        io.sockets.emit('slideLoad',data);
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
	
	
  socket.on( 'messages', function(user,fn) {
            /*console.log("in server for messages");
              tableService.createTableIfNotExists('messages', function(error){
                                                  if(!error){
                                                  console.log('messages created');
                                                  }
                                                  else{
                                                    console.log(error);
                                                  }
                                                  });*/
              var query = azure.TableQuery
              .select()
              .from('messages')
              .where('To eq ?', user);
              tableService.queryEntities(query, function(error, entities){
                                         if(!error){
                                         var titles = new Array();
                                         var froms = new Array();
                                         var number = entities.length;
                                         for(i=0;i<entities.length;i++){
                                         titles[i]=entities[i].Title;
                                         //console.log(descriptions[i]);
                                         froms[i]=entities[i].From;
                                         //console.log(duedates[i]);
                                         }
                                         fn(titles,froms,number);
                                         }
                                         else{
                                         console.log('ERROR QUERYING '+error);
                                         }
                                         });
              /*tableService.deleteTable('messages', function(error){
    if(!error){
        console.log('table deleted');
    }
});*/
              
              });

socket.on( 'sent', function(user,fn) {
            //console.log("in server for messages");
              /*tableService.createTableIfNotExists('messages', function(error){
                                                  if(!error){
                                                  console.log('messages created');
                                                  }
                                                  else{
                                                    console.log(error);
                                                  }
                                                  });*/
              var query = azure.TableQuery
              .select()
              .from('messages')
              .where('From eq ?', user);
              tableService.queryEntities(query, function(error, entities){
                                         if(!error){
                                         var titles = new Array();
                                         var tos = new Array();
                                         var number = entities.length;
                                         for(i=0;i<entities.length;i++){
                                         titles[i]=entities[i].Title;
                                         //console.log(descriptions[i]);
                                         tos[i]=entities[i].To;
                                         //console.log(duedates[i]);
                                         }
                                         fn(titles,tos,number);
                                         }
                                         else{
                                         console.log('ERROR QUERYING '+error);
                                         }
                                         });
              /*tableService.deleteTable('todos', function(error){
    if(!error){
        // Table deleted
    }
});*/
              
              });

socket.on( 'displayMessage', function(user,title,from,fn) {
  console.log('in server to display');
  var query = azure.TableQuery
              .select()
              .from('messages')
              .where('To eq ?', user);
              tableService.queryEntities(query, function(error, entities){
                                         if(!error){
                                         for(i=0;i<entities.length;i++){
                                          if(entities[i].Title.match(title)){
                                            if(entities[i].From.match(from)){
                                              fn(entities[i].Content,entities[i].MDate);
                                            }
                                          }
                                         }
                                         }
                                         else{
                                         console.log('ERROR QUERYING '+error);
                                         }
                                         });
});

socket.on( 'displaySent', function(user,title,to,fn) {
  console.log('in server to display');
  var query = azure.TableQuery
              .select()
              .from('messages')
              .where('To eq ?', to);
              tableService.queryEntities(query, function(error, entities){
                                         if(!error){
                                         for(i=0;i<entities.length;i++){
                                          if(entities[i].Title.match(title)){
                                            if(entities[i].From.match(user)){
                                              fn(entities[i].Content,entities[i].MDate);
                                            }
                                          }
                                         }
                                         }
                                         else{
                                         console.log('ERROR QUERYING '+error);
                                         }
                                         });
});

socket.on( 'deleteMessage', function(title,from,to,date,text,fn) {
          console.log("deleting message");
          tableService.deleteEntity('messages'
          , {
              PartitionKey : title.replace(/\s+/g, '')+to+text.replace(/\s+/g, '')
              , RowKey : '1'
              , Title : title
              , Content : text
              , To : to
              , From : from
              , MDate : date
            }
          , function(error){
              if(!error){
                console.log('deleted todo'+ title);
            }
            else{
              console.log(error);
            }
          });
          fn();
              });

socket.on( 'addmessage', function(title,text,to,from,date,fn) {
            console.log('in server to add message');
            var message = {
              PartitionKey : title.replace(/\s+/g, '')+to+text.replace(/\s+/g, '')
              ,RowKey : '1'
              , Title : title
              , Content : text
              , To : to
              , From : from
              , MDate : date
              };
                                        tableService.insertEntity('messages', message, function(error){
                                        if(!error){
                                          console.log('added message!');
                                        fn();
                                        }else{
                                          console.log(error);
                                        }
                                        });
              
              });

    socket.on( 'todos', function(user,fn) {
            console.log("in server for todos");
              /*tableService.createTableIfNotExists('todos', function(error){
                                                  if(!error){
                                                  console.log('todos created');
                                                  }
                                                  else{
                                                    console.log(error);
                                                  }
                                                  });*/
              /*var todo = {
              PartitionKey : 'todo'
              , RowKey : '1'
              , Username : 'david.johnson'
              , Description : 'todo'
              , Duedate : 'November 16 2013'
              };
              tableService.insertEntity('todos', todo, function(error){
                                        if(!error){
                                        console.log(todo.Description);
                                        }
                                        });*/
              var query = azure.TableQuery
              .select()
              .from('todos')
              .where('Username eq ?', user);
              tableService.queryEntities(query, function(error, entities){
                                         if(!error){
                                         var descriptions = new Array();
                                         var duedates = new Array();
                                         var number = entities.length;
                                         for(i=0;i<entities.length;i++){
                                         descriptions[i]=entities[i].Description;
                                         //console.log(descriptions[i]);
                                         duedates[i]=entities[i].Duedate;
                                         //console.log(duedates[i]);
                                         }
                                         fn(descriptions,duedates,number);
                                         }
                                         else{
                                         console.log('ERROR QUERYING '+error);
                                         }
                                         });
              /*tableService.deleteTable('todos', function(error){
    if(!error){
        // Table deleted
    }
});*/
              
              });

socket.on( 'deletetodo', function(user,duedate,title,fn) {
          console.log(title+duedate+user);
          tableService.deleteEntity('todos'
          , {
              PartitionKey : title.replace(/\s+/g, '')
              , RowKey : '1'
              , Username : user
              , Description : title
              , Duedate : duedate
            }
          , function(error){
              if(!error){
                console.log('deleted todo'+ title);
            }
            else{
              console.log(error + "**" + title);
            }
          });
          fn();
              });

socket.on( 'addtodo', function(user,title,duedate,fn) {
                                        console.log("in server to add todo");
                                         var todo = {
              PartitionKey : title.replace(/\s+/g, '')
              ,RowKey : '1'
              , Username : user
              , Description : title
              , Duedate : duedate
              };
                                        tableService.insertEntity('todos', todo, function(error){
                                        if(!error){
                                        fn(true);
                                        }else{
                                          fn(false);
                                        }
                                        });
              
              });

             
              socket.on('modules', function(user,fn){
                        /*tableService.createTableIfNotExists('modules', function(error){
                         if(!error){
                         console.log('modules created');
                         }
                         });*/
                        /*var module = {
                         PartitionKey : 'module'
                         , RowKey : '8'
                         , Name : 'Computer'
                         , Username : 'david.johnson'
                         , Description : 'Computer science or computing science (abbreviated CS or CompSci) is the scientific and practical approach to computation and its applications. A computer scientist specializes in the theory of computation and the design of computational systems.'
                         };
                         tableService.insertEntity('modules', module, function(error){
                         if(!error){
                         console.log(module.Name);
                         }
                         });*/
                        var query = azure.TableQuery
                        .select()
                        .from('modules')
                        .where('Username eq ?', user);
                        tableService.queryEntities(query, function(error, entities){
                                                   if(!error){
                                                   var names = new Array();
                                                   var descriptions = new Array();
                                                   for(i=0;i<entities.length;i++){
                                                   descriptions[i]=entities[i].Description;
                                                   //console.log(descriptions[i]);
                                                   names[i]=entities[i].Name;
                                                   //console.log(names[i]);
                                                   }
                                                   fn(names,descriptions);
                                                   }
                                                   else{
                                                   console.log('ERROR QUERYING '+error);
                                                   }
                                                   });
                        });

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
	
	/*
	  blobService.createContainerIfNotExists(containerName, function(error){
             if(!error){
                   console.log("no error :D");
                   }
                else{
                 console.log(error, "yei we are in");
                  }
              });
     */        

	socket.on('save', function(data,name, contName){
		 
		 blobService.createContainerIfNotExists(contName, function(error){
    if(!error){
		blobService.createBlockBlobFromText(contName
    , name
    , data
    , function(error){
        if(!error){
			console.log('Success');
        }
		else{
			console.log(error);}
    });    }
	});
	});
	
	 socket.on('load', function (name, fn){
		 console.log('log');
		blobService.listBlobs(name, function(error, blobs){
    if(!error){		
	fn(blobs);
    }
	});
	});
	
	socket.on('getPic', function (contName, name, fn){
		 console.log('log');
	blobService.getBlobToText(contName, name, null, function(error, serverBlob){
    if(!error){
		fn(serverBlob);
	    }
	else{
		console.log(error)
	}
});
	});
	 
	     
       //creating blobs WORKS!!!!! (and not written by nicola :D )
        /*blobService.createBlockBlobFromText(containerName
                                                      , 'sample'
                                                      , 'sample'
                                                      , function(error){
                                                      if(!error){
                                                      console.log("done");
                                                      }
                                                      else{
                                                      console.log("nope",error);
                                                      }
                                                      });*/
                  
                  
                  /*blobService.listBlobs(containerName, function(error, blobs){
                                        if(!error){
                                        for(var index in blobs){
                                        res.end("Hello Node.js and Windows Azure Website!\n"+blobs[index].name);
                                        }
                                        }
                                        });*/
                  
                  /*blobService.getBlobToStream(containerName
                                              , 'test1'
                                              , fs.createWriteStream('output.txt')
                                              , function(error){
                                              if(!error){
                                              // Wrote blob to stream
                                              }
                                              });*/
                  
	
	socket.on( 'login', function(user,pass,fn) {
              console.log('trying to log in with: '+user+" "+pass);
            
              /*tableService.createTableIfNotExists('users', function(error){
                                                  if(!error){
                                                  console.log('users created');
                                                  }
                                                  });*/
              /*var user = {
              PartitionKey : 'user'
              , RowKey : '4'
              , Username : 'seojin.lee'
              , Password : 'password'
              , DoB : new Date(2012, 6, 20)
              , Name : 'Seojin'
              , Surname : 'Lee'
              , Type : 'Student'
              };
              tableService.insertEntity('users', user, function(error){
                                        if(!error){
                                        console.log(user.Username);
                                        }
                                        });*/
              
              var query = azure.TableQuery
              .select()
              .from('users')
              .where('Username eq ?', user);
              tableService.queryEntities(query, function(error, entities){
                                         if(!error){
                                            if(entities.length==0){
                                                fn('BOO1',user,'None','None','None');
                                            }
                                            else{
                                                if(pass.match(entities[0].Password)){
                                                    //console.log('LOGED IN');
                                                    fn('LOGIN',user,entities[0].Type,entities[0].Name,entities[0].Surname);
                                                }
                                                else{
                                                    //console.log('BOO');
                                                    fn('BOO2',user,entities[0].Type,entities[0].Name,entities[0].Surname);
                                                }
                                            }
                                         }
                                         else{
                                            console.log('ERROR QUERYING '+error);
                                         }
                                         });
    
              });
});
