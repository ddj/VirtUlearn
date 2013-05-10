$(function(){
  var url = 'http://192.168.0.17:8080';
  //var socket = io.connect(url);
  var user = sessionStorage.getItem("user");
  var type = sessionStorage.getItem("type");
  var name = sessionStorage.getItem("name");
  var surname = sessionStorage.getItem("surname");

  document.getElementById('teacherName').innerHTML=name+" "+surname;

  var cdate = new Date();
  var  dd = cdate.getDate();
  var mm = cdate.getMonth();
  var months = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
  var calendar =  months[mm] + " \n\ " + dd;
  document.getElementById("calenDate").innerText = calendar;
  
});
$(document).ready(function(){ 
 

//$('.swiper-wrapper').css('height',$(window).height());
//$('.swiper-wrapper').css('width',$(window).width());

 $(window).resize(function(){
  $('.row').css({
    height: $(window).height()/2
  });
  
  var middleHeight = ($('.row').height() - $('.threecol').outerHeight())/2
  $('.threecol').css('margin-top',middleHeight);
  
  var middleContainerHeight = $(window).height()/2
  $('.container').css('margin-top', middleContainerHeight += 'px');
  
  //var middleRow = 0
  //$('.row').css('padding-left', middleRow += 'px');

 });
 // To initially run the function:
 
 $(window).resize();

// Create swiper slides
 swiper = new Swiper('.teacherSwiper', {
loop:true,
keyboardControl:true,
preventLinks:false,
simulateTouch:false
});
 
 // Hide Initially
 $('#rowFlipOne').css('display','none');
 $('#rowFlipTwo').css('display','none');
 
 function loadAnim() {
   setTimeout(function() {$('#rowFlipOne').addClass('animated flipInX');}, 1400);
   setTimeout(function() {$('#rowFlipOne').css('display','block');}, 1400);
   setTimeout(function() {$('#rowFlipTwo').addClass('animated flipInX');}, 2000);
   setTimeout(function() {$('#rowFlipTwo').css('display','block');}, 2000);
 }
 loadAnim();
 
 $('#1b').click(function() {
    $(".scene3D:not(#1)").addClass('animated flipOutX');
 });
 $('#2b').click(function() {
    $(".scene3D:not(#2)").addClass('animated flipOutX');
 });
 $('#3b').click(function() {
    $(".scene3D:not(#3)").addClass('animated flipOutX');
 });
 $('#4b').click(function() {
    window.location.href = "index.html";
 });
 $('#5b').click(function() {
    $(".scene3D:not(#5)").addClass('animated flipOutX');
 });
 $('#6b').click(function() {
    $(".scene3D:not(#6)").addClass('animated flipOutX');
 });
 $('#7b').click(function() {
    $(".scene3D:not(#7)").addClass('animated flipOutX');
 });
 $('#8b').click(function() {
    $(".scene3D:not(#8)").addClass('animated flipOutX');
 });
 
 /* Teacher Sliders */
$('.resources-thumb').click(function(){
$('a#sectionText').text('Resources')
swiper.swipeTo(0);
});

$(".modules-thumb").click(function(){
$('a#sectionText').text('Modules')
swiper.swipeTo(1);
});

$(".messages-thumb").click(function(){
$('a#sectionText').text('Messages')
swiper.swipeTo(2);
});

$(".settings-thumb").click(function(){
$('a#sectionText').text('Settings')
swiper.swipeTo(3);
});

$(".live-thumb").click(function(){
$('a#sectionText').text('Live Lectures')
setTimeout(function() {open_win();}, 930)
});

$('.thumb').click(function(){ 
var checkID = this.id;
if (checkID == "4b") {
setTimeout(function() {
window.open("index.html",'_self');
}, 1250 );  
}
else {
callback();
}
});

function callback() {
setTimeout(function() {
$('.container').addClass('animated fadeOutRightBig');
}, 1000 );
setTimeout(function() {
$('.container').css('display','none');
$('.startHide').css('display','inline'); 
$('.startHide').addClass('animated fadeInLeftBig');
}, 1350 );
};

});

/* Go to live lectures */
function open_win() 
{
if(typeof(Storage)!=="undefined")
  {
  var message = "Teacher";
  sessionStorage.setItem("key", message)
  sessionStorage.setItem("type", message);

  window.open("live.html",'_self');
  }
else
  {
  alert('storage not support');
  }

}