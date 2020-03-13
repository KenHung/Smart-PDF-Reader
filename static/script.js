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
  fetch('/api/analyzeEntities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text })
  })
    .then(resp => resp.json())
    .then(jsonData => {
      vm.entities = jsonData.data
      for (let i = 0; i < vm.entities.length; i++) {
        fetchSummary(vm.entities[i]);
      }
    });
}

function fetchSummary(entity) {
  fetch('/api/summary/' + entity.full_name)
    .then(resp => resp.json())
    .then(jsonData => {
      const summary = jsonData.data;
      vm.$set(entity, 'text', summary.text);
      vm.$set(entity, 'image', summary.image_url);
      vm.$set(entity, 'wiki', summary.wiki);
    });
}