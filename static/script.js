'use strict';

window.addEventListener('load', function () {

  console.log("Hello World!");

});

var app = new Vue({
  el: '#docent',
  data: {
    entities: [
      { name: 'dummy1' },
      { name: 'dummy2' },
    ]
  }
})

function fetchEntities() {
  let iframe = document.getElementById('pdf-viewer');
  let pdfViewer = iframe.contentWindow.document.getElementById('viewer');
  fetch('/api/entities?text=' + pdfViewer.textContent)
    .then(resp => resp.json())
    .then(data => console.log(data));
}