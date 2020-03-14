'use strict';

var vm = new Vue({
  el: '#docent',
  data: {
    entities: []
  }
});

var pdfViewer;
var numPages;

window.addEventListener('load', function () {
  var iframe = document.getElementById('pdf-viewer');
  pdfViewer = iframe.contentWindow.document.getElementById('viewer');
  numPages = iframe.contentWindow.document.getElementById('numPages');
  numPages.addEventListener('DOMSubtreeModified', updateDocent);

  // workaround for first time loading, may be improved later
  window.setInterval(() => {
    if (vm.entities.length === 0) {
      updateDocent();
    }
  }, 1000);
});

function updateDocent() {
  const pageMatch = numPages.textContent.match(/(\d+) /);
  if (pageMatch) {
    const currentPageNum = pageMatch[1];
    const prevPage = pdfViewer.querySelector(`.page[data-page-number='${currentPageNum - 1}']`);
    const currPage = pdfViewer.querySelector(`.page[data-page-number='${currentPageNum}']`);
    let pageText = '';
    if (prevPage) {
      pageText += prevPage.textContent;
    }
    if (currPage) {
      pageText += currPage.textContent;
    }
    if (pageText !== '') {
      fetchEntities(pageText);
    }
  }
}

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
      const newEntities = jsonData.data;
      const brandNew = [];
      for (let i = 0; i < newEntities.length; i++) {
        const newEntity = newEntities[i];
        const oldMatch = vm.entities.find(e => e.full_name == newEntity.full_name);
        if (oldMatch) {
          newEntities[i] = oldMatch;
        }
        else {
          brandNew.push(newEntity);
        }
      }
      vm.entities = newEntities;
      for (const newEntity of brandNew) {
        fetchSummary(newEntity);
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