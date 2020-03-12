'use strict';

window.addEventListener('load', function () {
  console.log("Hello World!");

  let iframe = document.getElementById('pdf-viewer');
  let pdfViewer = iframe.contentWindow.document.getElementById('viewer');
  let numPages = iframe.contentWindow.document.getElementById('numPages');

  numPages.addEventListener('DOMSubtreeModified', () => {
    console.log('change ' + numPages.textContent);
    const pageMatch = numPages.textContent.match(/(\d+) /);
    if (pageMatch) {
      const currentPageNum = pageMatch[1];
      const currentPage = pdfViewer.querySelector(`.page[data-page-number='${currentPageNum}']`);
      if (currentPage) {
        fetchEntities(currentPage.textContent);
      }
    }
  });
});

var vm = new Vue({
  el: '#docent',
  data: {
    entities: [
      { name: 'Loading...' },
    ]
  }
})

function fetchEntities(text) {
  fetch('/api/entities?text=' + text)
    .then(resp => resp.json())
    .then(jsonData => {
      vm.entities = jsonData.data
      for (let i = 0; i < vm.entities.length; i++) {
        fetch('/api/summary/' + vm.entities[i].full_name)
          .then(resp => resp.json())
          .then(jsonData => {
            const summary = jsonData.data;
            const entity = vm.entities.find(e => e.full_name === summary.name);
            vm.$set(entity, 'text', summary.text);
            vm.$set(entity, 'image', summary.image_url);
          });
      }
    });
}