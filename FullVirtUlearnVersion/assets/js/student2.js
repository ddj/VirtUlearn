var user;
var url = 'http://192.168.0.17:8080';
var socket = io.connect(url);
function displayMessage(title,from,user){
  socket.emit('displayMessage',user,title,from,function(text,date){
    document.getElementById("messageSender").innerHTML = "From: " + from;
        document.getElementById("messageTitle").innerHTML = title;
        document.getElementById("messageDate").innerHTML = date;
        document.getElementById("messageText").innerHTML = text;
  });
}
function displaySent(title,to,user){
  socket.emit('displaySent',user,title,to,function(text,date){
    document.getElementById("messageSender").innerHTML = "To: " + to;
        document.getElementById("messageTitle").innerHTML = title;
        document.getElementById("messageDate").innerHTML = date;
        document.getElementById("messageText").innerHTML = text;
  });
}

function deleteTodo(title,date,user){
      //var url = 'http://10.129.190.93:8080';
          //var socket = io.connect(url);
          socket.emit('deletetodo',user,date,title,function(){
            alert(title+date+user);
            //refresh the page and recall the click function
          });
          var list = document.getElementById('TodoList');

          jQuery("#TodoList").empty();

          socket.emit('todos',user,function(descriptions,duedates,number){
                  
                  for(i=0;i<descriptions.length;i++){
                  newLI = document.createElementNS(null,"li");
                  var todo=document.getElementById("TodoList");
                  newLI = document.createElement("li");
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","main-image");
                  //p.setAttribute("onClick","deleteTodo(\""+descriptions[i]+"\",\""+duedates[i]+"\",\""+user+"\");");
                  newLI.appendChild(p);
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","link-title");
                  newText = document.createTextNode(descriptions[i]);
                  p.appendChild(newText);
                  newLI.appendChild(p);
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","link-excerpt");
                  newText = document.createTextNode(duedates[i]);
                  p.appendChild(newText);
                  newLI.appendChild(p);
                  
                  todo.appendChild(newLI);
                  
                  document.getElementById("TodosNumber").innerHTML = "You have "+number+" more tasks to do!";
                  document.getElementById("todoNo").innerHTML = (number-1)+"";
                  //alert('DONE');

                  }

                  jQuery('.main-image').on('click',function(event){
                    
                    var title = jQuery(event.target).parent().find('.link-title').text();
                    var date = jQuery(event.target).parent().find('.link-excerpt').text();
                    deleteTodo(title,date,user);
                  });

                  });

    }
$(document).ready(function(){ 
  
  function resizing() {
    var rowHeight = $(".big").height();
    var minusRowHeight = rowHeight * -1;
    var textHeight = $(".textWrapper").height();
    var middleT = ((rowHeight - textHeight)/2)
    $('.textWrapper').css('margin-top',middleT);
    $('.specialWrapper').css('margin-top',middleT);
    
    
    $('.live-thumb-span').css('margin-top',rowHeight);
    $('.todos-thumb-span').css('margin-top',rowHeight);
    $(".specialHover").mouseover(function(){
      $('.specialWrapper').css('margin-top',minusRowHeight);
    });
    $(".specialHover").mouseout(function(){
      $('.specialWrapper').css('margin-top',rowHeight/3);
    });
    
    var rowHeight = $(".big").height();
    var iconHeight = $(".iconWrapper").height();
    var middleI = ((rowHeight - iconHeight)/2)
    $('.iconWrapper').css('margin-top',middleI);
  }
  
  $(window).resize(function(){
    resizing();
  });
  //$(window).resize();
  
  swiper = new Swiper('.studentSwiper', {
    loop:true,
    keyboardControl:true,
    preventLinks:false,
    simulateTouch:false,
    onSlideChangeStart: function() {
      var swipeNumber = swiper.activeSlide;
      var x;
      switch(swipeNumber) {
        case 0:
        x="Profile";
        break;
        case 1:
        x="My Todos";
        break;
        case 2:
        x="Messages";
        break;
        case 3:
        x="Modules";
        break;
        case 4:
        x="Settings";
        break;
        case 5:
        x="Live Lectures";
        break;
        case 6:
        x="Notes";
        break;
        case 7:
        x="Resources";
        break;
      }
      $( "#sectionText" ).hide( "fade", {direction: "left"}, 800, callback );
      function callback() {
        if (x == "Live Lectures") {
          // DIALOG BOX ASKING TO GO TO LIVE LECTURES
          var r=confirm("Enter Live Lectures?");
            if (r==true) {
            window.open("live.html",'_self');
            }
            else {
            alert("Maybe next time then!");
            }
        }
        $('a#sectionText').text(x);
        setTimeout(function() {
        $( "#sectionText" ).show( "fade", {direction: "left"}, 800);
        }, 0 );
      };
      
    }
  });
  $('.swiper-container').css('display','none');
  var h = $(window).height(); 
  var slidernormal = h-37;    
  /*var sliderpercent = ((h-37)/h)*100;*/
  document.getElementById('studentSwiper').style.height = slidernormal += "px";
  $('.headerContainer').css('display','none');
  //$('.swiper-container').css('left','-150%');
  //$('.navContainer').css('margin-top','0%');
  
  
    $(function() {
      user = sessionStorage.getItem("user");
      var type = sessionStorage.getItem("type");
      var name = sessionStorage.getItem("name");
      var surname = sessionStorage.getItem("surname");
      
      var cdate = new Date();
      var  dd = cdate.getDate();
      var mm = cdate.getMonth();
      var months = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
      var calendar =  months[mm] + " \n\ " + dd;
      document.getElementById("CalendarNumber").innerText = calendar;
      
    socket.emit('messages',user,function(titles,froms,number){
          $("#messageList").empty();
          for(i=0;i<number;i++){
              newLI = document.createElementNS(null,"li");
                  var messageList=document.getElementById("messageList");
                  newLI = document.createElement("li");
                  
                  var a = document.createElement("a");
                  a.setAttribute("class","message-link");
                  newLI.appendChild(a);
                  
                  var h1 = document.createElement("h1");
                  h1.setAttribute("class","message-from");
                  newText = document.createTextNode(froms[i]);
                  h1.appendChild(newText);
                  a.appendChild(h1);
                  
                  var h2 = document.createElement("h2");
                  h2.setAttribute("class","message-title");
                  newText = document.createTextNode(titles[i]);
                  h2.appendChild(newText);
                  a.appendChild(h2);
                  
                  messageList.appendChild(newLI);
              }
              document.getElementById("messageNo").innerHTML=number+"";
              $('.message-link').on('click',function(event){
                    
                    var title = $(event.target).parent().find('.message-title').text();
                    var from = $(event.target).parent().find('.message-from').text();
                    displayMessage(title,from,user);
                  });

             //$('head').append('<style>#inbox:before {content:\""+number+"\" !important;}</style>');
                   });

    socket.emit('usersetting',user,function(name,surname,dob){
      document.getElementById('nameP').value = name;
      document.getElementById('nameP').style['color'] ="#333333";
      document.getElementById('surname').value = surname;
      document.getElementById('surname').style['color'] ="#333333";
      document.getElementById('dob').value = dob.substring(0,16);
      document.getElementById('dob').style['color'] ="#333333";
      document.getElementById('contactno').value = 'Contact Number';
      document.getElementById('contactno').style['color'] ="#333333";
    });
    socket.emit('modulesetting',user,function(modules){
      document.getElementById('module1').value = modules[0].Name;
      document.getElementById('module1').style['color'] ="#333333";
      document.getElementById('module2').value = modules[1].Name;
      document.getElementById('module2').style['color'] ="#333333";
      document.getElementById('module3').value = modules[2].Name;
      document.getElementById('module3').style['color'] ="#333333";
      document.getElementById('module4').value = modules[3].Name;
      document.getElementById('module4').style['color'] ="#333333";
    });

    $('#compose').on('click',function(){
        var messageTitle=prompt("Enter message title","");
            var messageText=prompt("Enter message","");
            var messageReceiver=prompt("Enter message receiver","");
            var messageSender = user;
            var date = new Date();
      var n = date.toString();
      
      socket.emit('addmessage',messageTitle,messageText,messageReceiver,messageSender,n,function(){
        alert('done!');
      });
    });

    $('#delete').on('click',function(){
      var sender = document.getElementById("messageSender").innerHTML;
      var title = document.getElementById("messageTitle").innerHTML;
        var date = document.getElementById("messageDate").innerHTML;
        var text = document.getElementById("messageText").innerHTML;
      if(sender.substring(0,6).match("From: ")){
        socket.emit('deleteMessage',title,sender.slice(6),user,date,text,function(){
          alert("deleted inbox!");
        });
      }
      else if(sender.substring(0,4).match("To: ")){
        socket.emit('deleteMessage',title,user,sender.slice(4),date,text,function(){
          alert("deleted sent!");
        });
      }
      else{
        alert("No message to delete!");
      }
    });

      $('#inbox').on('click',function(){
          socket.emit('messages',user,function(titles,froms,number){
          $("#messageList").empty();
      for(i=0;i<number;i++){
              newLI = document.createElementNS(null,"li");
                  var messageList=document.getElementById("messageList");
                  newLI = document.createElement("li");
                  
                  var a = document.createElement("a");
                  a.setAttribute("class","message-link");
                  newLI.appendChild(a);
                  
                  var h1 = document.createElement("h1");
                  h1.setAttribute("class","message-from");
                  newText = document.createTextNode(froms[i]);
                  h1.appendChild(newText);
                  a.appendChild(h1);
                  
                  var h2 = document.createElement("h2");
                  h2.setAttribute("class","message-title");
                  newText = document.createTextNode(titles[i]);
                  h2.appendChild(newText);
                  a.appendChild(h2);
                  
                  messageList.appendChild(newLI);
              }

              document.getElementById("messageNo").innerHTML=number+"";

              $('.message-link').on('click',function(event){
                    
                    var title = $(event.target).parent().find('.message-title').text();
                    var from = $(event.target).parent().find('.message-from').text();
                    displayMessage(title,from,user);
                  });

             //$('head').append('<style>#inbox:before {content:\""+number+"\" !important;}</style>');
                   });
                  
      });

      $('#sent').on('click',function(){
        socket.emit('sent',user,function(titles,tos,number){
          $("#messageList").empty();
      for(i=0;i<number;i++){
              newLI = document.createElementNS(null,"li");
                  var messageList=document.getElementById("messageList");
                  newLI = document.createElement("li");
                  
                  var a = document.createElement("a");
                  a.setAttribute("class","sent-link");
                  newLI.appendChild(a);
                  
                  var h1 = document.createElement("h1");
                  h1.setAttribute("class","sent-to");
                  newText = document.createTextNode(tos[i]);
                  h1.appendChild(newText);
                  a.appendChild(h1);
                  
                  var h2 = document.createElement("h2");
                  h2.setAttribute("class","sent-title");
                  newText = document.createTextNode(titles[i]);
                  h2.appendChild(newText);
                  a.appendChild(h2);
                  
                  messageList.appendChild(newLI);
              }
              $('.sent-link').on('click',function(event){
                    
                    var title = $(event.target).parent().find('.sent-title').text();
                    var to = $(event.target).parent().find('.sent-to').text();
                    displaySent(title,to,user);
                  });

             //$('head').append('<style>#inbox:before {content:\""+number+"\" !important;}</style>');
                   });
      });

      socket.emit('todos',user,function(descriptions,duedates,number){
                  
                  for(i=0;i<descriptions.length;i++){
                  newLI = document.createElementNS(null,"li");
                  var todo=document.getElementById("TodoList");
                  newLI = document.createElement("li");
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","main-image");
                  //p.setAttribute("onClick","deleteTodo(\""+descriptions[i]+"\",\""+duedates[i]+"\",\""+user+"\");");
                  newLI.appendChild(p);
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","link-title");
                  newText = document.createTextNode(descriptions[i]);
                  p.appendChild(newText);
                  newLI.appendChild(p);
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","link-excerpt");
                  newText = document.createTextNode(duedates[i]);
                  p.appendChild(newText);
                  newLI.appendChild(p);
                  
                  todo.appendChild(newLI);
                  
                  document.getElementById("TodosNumber").innerHTML = "You have "+number+" more tasks to do!";
                  document.getElementById("todoNo").innerHTML = number+"";
                  //alert('DONE');

                  }

                  $('.main-image').on('click',function(event){
                    
                    var title = $(event.target).parent().find('.link-title').text();
                    var date = $(event.target).parent().find('.link-excerpt').text();
                    deleteTodo(title,date,user);
                  });

                  });

    $('#addTodoButton').on('click',function(){
            var todoTitle=prompt("Enter todo title(can't be repetitive)","");
            var dateDue=prompt("Todo date due","");
            socket.emit('addtodo',user,todoTitle, dateDue, function(value){
              if(value){
                newLI = document.createElementNS(null,"li");
                  var todo=document.getElementById("TodoList");
                  newLI = document.createElement("li");
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","main-image");
                  p.setAttribute("onClick","deleteTodo(\""+todoTitle+"\",\""+dateDue+"\",\""+user+"\");");
                  newLI.appendChild(p);
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","link-title");
                  newText = document.createTextNode(todoTitle);
                  p.appendChild(newText);
                  newLI.appendChild(p);
                  
                  var p = document.createElement("p");
                  p.setAttribute("class","link-excerpt");
                  newText = document.createTextNode(dateDue);
                  p.appendChild(newText);
                  newLI.appendChild(p);
                  
                  todo.appendChild(newLI);
                  
                  document.getElementById("TodosNumber").innerHTML = "You have "+(Number(document.getElementById("todoNo").innerText)+1)+" more tasks to do!";
                  document.getElementById("todoNo").innerHTML=(Number(document.getElementById("todoNo").innerText)+1)+"";
              }
              else{
                alert("This todo already exists!");
              }
            });
            //the page should be refreshed and recall the click function
              
            });

        
    /*SAVING/LOADING NOTES---------------LEEEEAVE IT*/
    
    var containerName= user.replace(/\./g,'')+"notes";
    //alert(containerName);
    socket.emit('getPic', containerName, "notes", function(data)
    {
      //alert(data);
      //$('#notesAlohoP').text(data.Replace("\n","<br/>")+"");
    });            
    
        $('#saveNote').on('click touchstart',function(){
      //alert($('#notesAlohoP').text());
    //socket.emit('save',$('#notesAlohoP').text(),"notes",containerName);
      });
    
      document.getElementById('UserName').innerHTML=name+" "+surname;
      document.getElementById('user').innerHTML=name+" "+surname;
  

  socket.emit('modules',user,function(names,descriptions){
                  for(i=0;i<names.length;i++){
                  var modulesAcc=document.getElementById("modulesAccordion");
                  
                  var h3 = document.createElement("h3");
                  h3.setAttribute("id","ModuleName");
                  newText = document.createTextNode(names[i]);
                  h3.appendChild(newText);
                  modulesAcc.appendChild(h3);
                  
                  var p = document.createElement("p");
                  p.setAttribute("id","ModuleDesc");
                  newText = document.createTextNode(descriptions[i]);
                  p.appendChild(newText);
                  modulesAcc.appendChild(p);
                  }

                  /* Accordion creation details ~~~~~~~~~~~~~~~~~~~~~*/
    var icons = {
      header: "ui-icon-folder-open",
      activeHeader: "ui-icon-folder-collapsed"
    };
$( ".accordionStyle" ).accordion({
    active: false,
    collapsible: true,
    animate: "bounceslide",
    clearStyle: true,
    icons: icons    
  });

                  });
  /* Accordion create END */
  
  /* START BROWSER DETECT */ 
  var BrowserDetect = {
  init: function () {
    this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent)
      || this.searchVersion(navigator.appVersion)
      || "an unknown version";
    this.OS = this.searchString(this.dataOS) || "an unknown OS";
  },
  searchString: function (data) {
    for (var i=0;i<data.length;i++) {
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1)
          return data[i].identity;
      }
      else if (dataProp)
        return data[i].identity;
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    },
    {   string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
    },
    {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    },
    {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    },
    {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    },
    {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    },
    {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    },
    {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    },
    {   // for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    },
    {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    },
    {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    },
    {     // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS : [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    },
    {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    },
    {
         string: navigator.userAgent,
         subString: "iPhone",
         identity: "iPhone/iPod"
      },
    {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ]



};
BrowserDetect.init();
/* END BROWSER DETECT */
  
    
  /* Get Device Size and Type  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/  
  function isSmall() {
    if ( (window.screen.width > 650) || (window.screen.height > 650) ) {
      return false;
    }
    else {
    return true;
    }
  }
  
  function touchDeviceTest() {
    var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    //var el = document.createElement('div');
    var detectedDevice;
    //el.setAttribute('ongesturestart', 'return;');
    if(supportsTouch){
      if (BrowserDetect.browser == "Chrome") {
      /* RESIZING */  
        var rowHeight = $(".big").height();
      var minusRowHeight = rowHeight * -1;
      var textHeight = $(".textWrapper").height();
      var middleT = ((rowHeight - textHeight)/2)
      $('.textWrapper').css('margin-top',middleT);
      $('.specialWrapper').css('margin-top',middleT);
      
      
      $('.live-thumb-span').css('margin-top',rowHeight);
      $('.todos-thumb-span').css('margin-top',rowHeight);
      $(".specialHover").mouseover(function(){
        $('.specialWrapper').css('margin-top',minusRowHeight);
      });
      $(".specialHover").mouseout(function(){
        $('.specialWrapper').css('margin-top',rowHeight/3);
      });
      
      var rowHeight = $(".big").height();
      var iconHeight = $(".iconWrapper").height();
      var middleI = ((rowHeight - iconHeight)/2)
      $('.iconWrapper').css('margin-top',middleI);
      /* RESIZING */
      } 
      document.getElementById('touchCSS').setAttribute('href', 'assets/css/touch.css'); 
      if (isSmall()) {
        detectedDevice = 'Mobile';
        //alert(detectedDevice + " mode");
      }
      else {                            
        detectedDevice = 'Tablet';
        //alert(detectedDevice + " mode");
      }
      return true;
    }
    else {
      resizing();
      detectedDevice = 'Desktop';
      //alert(detectedDevice + " mode");
      return false;
    }
  } 
  
  touchDeviceTest();
  /* Get Device type and size END */
  
  });
  
  $('#panel2').slidePanel({
    triggerName: '#trigger2',
    triggerTopPos: '40px',
    panelTopPos: '40px'
  });
  
});