/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

//
// See README for overview
//

'use strict';


var pageNum, numPages;


//
// Fetch the PDF document from the URL using promices
//
PDFJS.getDocument('helloworld.pdf').then(function(pdf) {
  // Using promise to fetch the page
  pdf.getPage(1).then(function(page) {
    var scale = 1.5;
    var viewport = page.getViewport(scale);
    pageNum = 1;
    document.getElementById("pageNum").innerHTML = pageNum.toString();
    //
    // Prepare canvas using PDF page dimensions
    //
    var canvas = document.getElementById('paper');
    var context = canvas.getContext('2d');
   	canvas.height = viewport.height;
    canvas.width = viewport.width;

    //
    // Render PDF page into canvas context
    //
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);
  });
    //Assigning numPages and pageNum
    
    numPages= pdf.numPages;
    document.getElementById("numPages").innerHTML = numPages.toString();
});

function displayPage(num){
    if(pageNum!=num){
        //alert(num+" this page should show up");
        document.getElementById("pageNum").innerHTML = num;
        pageNum=num;
        
        PDFJS.getDocument('helloworld.pdf').then(function(pdf) {
        // Using promise to fetch the page
            pdf.getPage(num).then(function(page) {
            var scale = 1.5;
            var viewport = page.getViewport(scale);
            document.getElementById("pageNum").innerHTML = pageNum.toString();
            var canvas = document.getElementById('paper');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
        });
    }
}

function prevPage() {
	if(pageNum > 1) {
		displayPage(pageNum - 1);
	}
}

function nextPage() {
	if(pageNum < numPages) {
		displayPage(pageNum + 1);
	}
}
