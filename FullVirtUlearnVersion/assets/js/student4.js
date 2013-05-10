function slideMenu() {
    
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
    $( ".swiper-container" ).hide( "fold", {horizFirst: false, size: "26%"}, 1500, callback);
    $( ".headerContainer" ).hide( "blind", {direction: "vertical"}, 1200 );
    
    function callback() {
    setTimeout(function() {
      $('.navContainer').css('display','');
      $('.col1').css('display','none'); 
      $('.col2').css('display','none');  
      for(var i = 1; i <= 2; i++) {
        $('.col'+i).each(function(){
        $(this).show( "fold", {horizFirst: false, size: "26%"}, 1500 );
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
        });
      }
      }, 0);
    };
    };