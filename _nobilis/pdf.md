---
title: Nobilis PDF
permalink: /nobilis/pdf/
layout: empty
---

<input id="choosePDF" type="file">
<p id="choosePDFDescription">
  If you want to view the page number you clicked on,
  you need to supply the PDF to use for viewing it.
  Click the button above to open a dialog box for navigating to where
  the Nobilis 3rd Edition PDF exists on your local computer.
</p>
<center>
  <a id="prevPage" href="#">Previous Page</a>
  ...
  <a id="nextPage" href="#">Next Page</a>
</center>

<canvas id="canvasPDF">

<script src="//code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.550/pdf.js"></script>

<script>
$(function() {
  const PDFJS = window['pdfjs-dist/build/pdf']

  const state = {};

  // Create a function to select the page number to view.
  // It will either be rendered now, or rendered when the PDF next loads.
  const setPagePDF = function(pageNum) {
    state.pageNum = pageNum;
    
    if(!state.pdf)
      return;
    
    state.pdf.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport(1.25); // scale
      const canvas   = document.getElementById('canvasPDF');
      const context  = canvas.getContext('2d');
      canvas.height  = viewport.height;
      canvas.width   = viewport.width;

      page.render({
        canvasContext: context,
        viewport:      viewport,
      });
    });
  };

  // When we receive a message, treat it as a page number to update the view.
  window.addEventListener("message", function(event) {
    // Ignore messages from other origins, for security reasons.
    if (event.origin !== window.location.origin)
      return;

    setPagePDF(parseInt(event.data) || 1);
  }, false);

  // Periodically "phone home" to the window that opened this window,
  // so that if it has changed pages or refreshed, it can have a reference
  // to our window and be able to send us a message with a new page number.
  setInterval(function() {
    window.opener.postMessage("nobilisPDF", window.location.origin);
  }, 500);

  // When a PDF is selected, remove that dialog box and open the PDF.
  $('#choosePDF').on('change', function(event) {
    $('#choosePDF').remove();
    $('#choosePDFDescription').remove();

    var file = event.target.files[0];
    var fileReader = new FileReader();

    fileReader.onload = function() {
      PDFJS.getDocument(new Uint8Array(this.result)).then(function(pdf) {
        state.pdf = pdf;

        // Now that the PDF is loaded, open the pending page number.
        if(state.pageNum)
          setPagePDF(state.pageNum);
      });
    };

    fileReader.readAsArrayBuffer(file);
  });
  
  $('#prevPage').click(function(event) {
    event.preventDefault();
    setPagePDF(state.pageNum - 1);
  });
  
  $('#nextPage').click(function(event) {
    event.preventDefault();
    setPagePDF(state.pageNum + 1);
  });
});
</script>
