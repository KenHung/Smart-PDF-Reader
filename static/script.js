'use strict';

window.addEventListener('load', function () {

  console.log("Hello World!");

});

function updateInfo() {
  let iframe = document.getElementById('pdf-viewer');
  let pdfViewer = iframe.contentWindow.document.getElementById('viewer');
  fetch('/api/info?text=' + pdfViewer.textContent)
    .then(resp => {
      console.log(resp);
    })
}