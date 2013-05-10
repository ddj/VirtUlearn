(function() {

function runHideEffect() {
      // get effect type from
      var selectedEffect = $( "#effectTypes" ).val();
 
      // most effect types need no options passed by default
      var options = {};
      // some effects have required parameters
      if ( selectedEffect === "scale" ) {
        options = { percent: 0 };
      } else if ( selectedEffect === "size" ) {
        options = { to: { width: 200, height: 60 } };
      }
      // run the effect

    //$('.navContainer').css('display','');
    //$('.col1').css('display','none'); 
    //$('.col2').css('display','none');  
        for(var i = 1; i <= 2; i++) {
        $('.col'+i).each(function(){
            $(this).hide( "fold", {horizFirst: false, size: "26%"}, 900, callback );
        });
        }
        
      //$( ".navContainer" ).hide( "fold", {horizFirst: false, size: "25%"}, 1000, callback );
    };
  
  function callback() {
      setTimeout(function() {
    /*$(".swiper-container").show( "fold", {horizFirst: false, size: "25%"}, 2200, callback );*/
        $( ".swiper-container" ).show( "blind", {direction: "down"}, 1200, callback2 );
      }, 0 );
    };
  
  function callback2() {
      setTimeout(function() {
    /*$(".swiper-container").show( "fold", {horizFirst: false, size: "25%"}, 2200, callback );*/
        $( ".headerContainer" ).show( "blind", {direction: "vertical"}, 1000 );
    //function callback3() {
      $('.swiper-container').css('margin-top','37px');  
    //}
      }, 0 );
    };
  
  /* Go to live lectures */
  function open_win() {
    if(typeof(Storage)!=="undefined") {
      var message = "Student";
      sessionStorage.setItem("key", message)
      sessionStorage.setItem("type", message);
      window.open("live.html",'_self');
      }
    else
      {
      alert('storage not support');
      }
  }

  function open_res() {
    if(typeof(Storage)!=="undefined") {
      sessionStorage.setItem("user", user);
      window.open("resources.html",'_self');
      }
    else
      {
      alert('storage not support');
      }
  }
  
  function logout() {   
    var r=confirm("You sure, just checking?");
      if (r==true) {
          for(var i = 1; i <= 2; i++) {
          $('.col'+i).each(function(){
            $(this).hide("clip", { direction: "vertical" }, 800, callback );
          });
        $('body').css('background','black');
        document.getElementById("bgImg").src="assets/images/bgFade.png";  
        }
        function callback() {
          setTimeout(function() { window.location.href = "index.html"; }, 500 );
        };
      }
      else {
        alert("Now there's a good student!");
      }   
  }
  
  $('.organizer-thumb').click(function(){
    $('a#sectionText').text('Profile')
    swiper.swipeTo(0);
    });
  
  $(".todos-thumb").click(function(){
    $('a#sectionText').text('My Work')
    swiper.swipeTo(1);
  });

  $(".calendar-thumb").click(function(){
    //nothing
  });
  
  $(".paint-thumb").click(function(){
    $('a#sectionText').text('Messages')
    swiper.swipeTo(2);
  });
  
  $(".calculator-thumb").click(function(){
    $('a#sectionText').text('Modules')
    swiper.swipeTo(3);
  });
  
    $(".lock-thumb").click(function(){
      //nothing  
    });

  $(".cpanel-thumb").click(function(){
    $('a#sectionText').text('Settings')
    swiper.swipeTo(4);
  });
  
  // FIX TRANSITION... TEMP FIX WITH 900TH OF A SECOND TIMING
  $(".live-thumb").click(function(){
    $('a#sectionText').text('Live Lectures')
    setTimeout(function() {open_win();}, 930)
    //swiper.swipeTo(5);
  });
  
  $('.notes-thumb').click(function(){
    $('a#sectionText').text('Notes')
    swiper.swipeTo(6);
    });
  
  $('.weather-thumb').click(function(){
    $('a#sectionText').text('Live Lectures')
    setTimeout(function() {open_res();}, 930)
    });
  
  
  $('.big, .small').click(function(){ 
  var checkID = this.id;
  if (checkID == "logout") {
    logout();
  }
  else {  
    $('.startHide').css('display','inline');
    runHideEffect();
  }
  });
  

})();