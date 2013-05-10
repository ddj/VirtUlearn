$(window).resize(function(){
        
        var middleF = (($(window).height() - $('#poster').outerHeight())/3)
          $('#poster').css('margin-top',middleF);
        $('p').css('margin-top','-100px');
        
        
        var middleL = (($(window).height() - $('#loginForm').outerHeight())/3)-20
          $('#loginForm').css('margin-top',middleL);
        //$('#poster').css("margin-top","10%");
      });
      
    // DOM Ready
    $(function() {
        
            var url = 'http://192.168.0.17:8080';
            var socket = io.connect(url);
        
            //alert('woo');
            
            $('#loginButton').click(function() {
                var user = $('#user').val();
                var pass = $('#pass').val();
                //alert('trying to log in with '+user + " "+ pass);
                socket.emit('login',user,pass,function(data,user,type,name,surname){
                    if(data=="LOGIN"){
                        $('button').css("color","#0F0");
                        $('#pass').addClass('successPwd');
                        if(type=="Student"){
                            if(typeof(Storage)!=="undefined")
                            {
                                sessionStorage.setItem("user", user)
                                sessionStorage.setItem("type", type)
                                sessionStorage.setItem("name", name)
                                sessionStorage.setItem("surname", surname);
                                setTimeout(function() {window.location.href = "dashboardS.html";}, 1150);
                            }
                            else
                            {
                                alert('storage not supported');
                            }
                        }
                        else{
                            if(typeof(Storage)!=="undefined")
                            {
                                sessionStorage.setItem("user", user)
                                sessionStorage.setItem("type", type)
                                sessionStorage.setItem("name", name)
                                sessionStorage.setItem("surname", surname);
                                setTimeout(function() {window.location.href = "dashboardT.html";}, 1150);
                            }
                            else
                            {
                                alert('storage not supported');
                            }
                        }
                    }
                    else {
                        if(data=="BOO1") {
                            $('#user').removeClass('animated bounceInLeft').addClass('animated wobble errorPwd');
                            setTimeout(function() {$('#user').removeClass('animated wobble');}, 2000);
                            $('#user').focus();
                            $('button').css("color","#F00");
                        }
                        else {
                            if(data=="BOO2") {
                                $('#pass').removeClass('animated bounceInRight').addClass('animated wobble errorPwd');
                                setTimeout(function() {$('#pass').removeClass('animated wobble');}, 2000);
                                $('#pass').focus();
                                $('button').css("color","#F00");
                            }
                        }
                    }
                });
            });
        
      $('#pass').keydown(function() {
          $('#submit2').addClass('animated fadeIn');
        $('#submit2').addClass('show');
      });
      
      $(window).resize();     
      setTimeout(function() {$('h1').addClass('animated fadeIn');}, 2200);
      setTimeout(function() {$('h1').addClass('show');}, 2200);
      setTimeout(function() {$('p').addClass('animated tada');}, 3000);
      setTimeout(function() {$('p').addClass('show');}, 3000);
      setTimeout(function() {$('#poster').addClass('animated fadeOut');}, 5400);
      setTimeout(function() {$('#bg').addClass('animated fadeIn');}, 5400);
      setTimeout(function() {$('#bg').addClass('show');}, 5400);
      setTimeout(function() {$('#poster').css("display","none");}, 6000);
      setTimeout(function() {$('#loginForm').css("display","block");}, 6100);   
      setTimeout(function() {$('#user').addClass('animated bounceInLeft');}, 6501);
      setTimeout(function() {$('#user').addClass('show');}, 6501);
      setTimeout(function() {$('#pass').addClass('animated bounceInRight');}, 6501);
      setTimeout(function() {$('#pass').addClass('show');}, 6501);
      setTimeout(function() {$('#user').focus();}, 7531);
      setTimeout(function() {$('#loginButton').addClass('showDissolve');}, 9501);
        });