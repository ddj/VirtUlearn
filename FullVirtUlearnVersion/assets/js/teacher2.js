var anim = (function() {
    var i = 0;
    var step = 10;
    var up = true;
    var timer = null;

    var next = function() {
        if (up) {
            i += step;
        }
        else {
            i -= step;
        }
        if(i<0){i=0; up=true;}
        if(i>255){i=255; up=false;}
        update(i);
    };

    var update = function(i) {
        $(".back").css("border-color", 'rgb(' + i + ',' + i + ',' + 200 + ')');
    };

    var go = function() {
        next();
        timer = window.setTimeout(anim.go, 30);
    };

    var stop = function() {
        if (timer) {
            window.clearTimeout(timer);
            timer = null;
        }
    };

    var addClickHandler = function() {
        $("div").click(function() {
            window.clearTimeout(timer);
            update(0);

        });
    };

    return {
        go: go,
        stop: stop,
        addClickHandler: addClickHandler 
    };
}());

anim.addClickHandler();
anim.go();