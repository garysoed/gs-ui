'use strict';

var base = 'torchred';
var accent = 'cerulean';
var contrast = 4.5;


var palettes = [];
gs.ui.DefaultPalettes.getNames().forEach(function(name) {
  palettes.push({name: name, palette: gs.ui.DefaultPalettes.get(name)});
});
var main = gs.ui.Main.newInstance({
  ace: window['ace'],
  routeFactoryServiceCtor: window['routeFactoryServiceCtor'] || null
});

function updateTheme() {
  var theme = gs.ui.Theme.newInstance(
      gs.ui.DefaultPalettes.get(base),
      gs.ui.DefaultPalettes.get(accent),
      contrast);
  main.setTheme(theme);
}

function updateCells() {
  // Update the base cells.
  var cells = document.querySelectorAll('.base .colorPickerCell');
  for (var i = 0; i < cells.length; i++) {
    var cellEl = cells.item(i);
    cellEl.setAttribute('data-selected', cellEl.getAttribute('data-name') === base);
  }

  // Update the accent cells.
  var cells = document.querySelectorAll('.accent .colorPickerCell');
  for (var i = 0; i < cells.length; i++) {
    var cellEl = cells.item(i);
    cellEl.setAttribute('data-selected', cellEl.getAttribute('data-name') === accent);
  }
}

function onClickBase(name) {
  base = name;
  updateCells();
  updateTheme();
}

function onClickAccent(name) {
  accent = name;
  updateCells();
  updateTheme();
}

function setupPalettePicker() {
  var basePickerMenu = document.querySelector('.colorPickerMenu.base');
  var accentPickerMenu = document.querySelector('.colorPickerMenu.accent');

  // Create the base color picker.
  for (var r = 0; r < 5; r++) {
    var rowEl = document.createElement('div');
    basePickerMenu.appendChild(rowEl);
    for (var c = 0; c < 5; c++) {
      var i = r * 5 + c;
      var palette = palettes[i].palette;
      var name = palettes[i].name;

      var normal = palette;
      var cellEl = document.createElement('div');
      cellEl.style.backgroundColor =
          'rgb(' + [normal.getRed(), normal.getGreen(), normal.getBlue()].join(',') +')';
      cellEl.classList.add('colorPickerCell');
      cellEl.classList.add('base');
      cellEl.title = name;
      cellEl.setAttribute('data-name', name);
      cellEl.addEventListener('click', onClickBase.bind(null, name));

      var light = palette;
      var lightCell = document.createElement('div');
      lightCell.style.backgroundColor =
          'rgb(' + [light.getRed(), light.getGreen(), light.getBlue()].join(',') + ')';
      cellEl.appendChild(lightCell);

      var dark = palette;
      var darkCell = document.createElement('div');
      darkCell.style.backgroundColor =
          'rgb(' + [dark.getRed(), dark.getGreen(), dark.getBlue()].join(',') + ')';
      darkCell.classList.add('dark');
      cellEl.appendChild(darkCell);

      rowEl.appendChild(cellEl);
    }
  }

  // Create the accent color picker.
  for (var r = 0; r < 5; r++) {
    var rowEl = document.createElement('div');
    accentPickerMenu.appendChild(rowEl);
    for (var c = 0; c < 5; c++) {
      var i = r * 5 + c;
      var palette = palettes[i].palette;
      var name = palettes[i].name;

      var color = palette;
      var cellEl = document.createElement('div');
      cellEl.style.backgroundColor =
          'rgb(' + [color.getRed(), color.getGreen(), color.getBlue()].join(',') +')';
      cellEl.classList.add('colorPickerCell');
      cellEl.classList.add('base');
      cellEl.setAttribute('data-name', name);
      cellEl.title = name;
      cellEl.addEventListener('click', onClickAccent.bind(null, name));

      rowEl.appendChild(cellEl);
    }
  }

  // Add logic to the tab.
  var menuRoot = document.querySelector('.menuRoot');
  var tab = document.querySelector('.colorPicker gs-horizontal-tab');
  tab.addEventListener('gse-tab-change', function() {
    menuRoot.setAttribute('selected-tab', tab.getAttribute('gs-selected-tab'));
  });

  updateCells();
}

fetch('demo-palette-picker.html', {method: 'GET'})
    .then(function(response) {
      return response.text()
    })
    .then(function(textResponse) {
      document.body.innerHTML += textResponse;
      setupPalettePicker();
    });

// Set the templates.
var templateEl = document.querySelector('#template');
document.querySelectorAll('section.cell').forEach(function(el) {
  el.innerHTML = templateEl.innerHTML;
});

// Setup the contrast button.
var contrastButton = document.querySelector('#contrastButton');
var contrastDrawer = document.querySelector('#contrastDrawer');
contrastButton.addEventListener('click', function() {
  var value = contrastDrawer.getAttribute('gs-is-expanded') === 'true';
  contrastDrawer.setAttribute('gs-is-expanded', !value);
});

var contrastInput = document.querySelector('#contrastInput');
contrastInput.setAttribute('gs-value', contrast);
var mutationObserver = new MutationObserver(function(records) {
  records.forEach(function() {
    var newContrast = Number.parseFloat(contrastInput.getAttribute('gs-value'));
    if (!Number.isNaN(newContrast)) {
      contrast = newContrast;
      updateTheme();
    }
  });
});
mutationObserver.observe(contrastInput, {attributes: true, attributeFilter: ['gs-value']});


var theme = gs.ui.Theme.newInstance(
    gs.ui.DefaultPalettes.get(base),
    gs.ui.DefaultPalettes.get(accent),
    contrast);
main.bootstrap(theme);
main.applyTheme(document);

window['main'] = main;