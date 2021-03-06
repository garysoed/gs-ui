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
  var cells = document.querySelectorAll('#colorPickerBase .colorPickerCell');
  for (var i = 0; i < cells.length; i++) {
    var cellEl = cells.item(i);
    cellEl.setAttribute('data-selected', cellEl.getAttribute('data-name') === base);
  }

  // Update the accent cells.
  var cells = document.querySelectorAll('#colorPickerAccent .colorPickerCell');
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
  var colorPickerButton = document.querySelector('gs-basic-button.colorPicker');
  var basePickerMenu = document.querySelector('#colorPickerBase');
  var accentPickerMenu = document.querySelector('#colorPickerAccent');

  var colorPickerMenu = document.querySelector('#colorPickerMenu');
  colorPickerButton.addEventListener('gs-action', function() {
    colorPickerMenu.setAttribute('visible', 'true');
  });

  var colorPickerBaseTab = document.querySelector('#colorPickerBaseTab');
  var colorPickerAccentTab = document.querySelector('#colorPickerAccentTab');
  var colorPickerTab = document.querySelector('#colorPickerTab');

  colorPickerBaseTab.addEventListener('gs-action', function() {
    colorPickerTab.setAttribute('selected-tab', colorPickerBaseTab.getAttribute('tab-id'));
  });

  colorPickerAccentTab.addEventListener('gs-action', function() {
    colorPickerTab.setAttribute('selected-tab', colorPickerAccentTab.getAttribute('tab-id'));
  });

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
  var menuSwitch = document.querySelector('#menuSwitch');
  var tab = document.querySelector('.colorPicker gs-horizontal-tab');
  tab.addEventListener('gs-tab-change', function() {
    menuSwitch.setAttribute('value', tab.getAttribute('selected-tab'));
  });

  updateCells();
}

function setupContrastPicker() {
  var contrastButton = document.querySelector('#contrastButton');
  var contrastDrawer = document.querySelector('#contrastDrawer');
  contrastButton.addEventListener('gs-action', function() {
    var value = contrastDrawer.getAttribute('expanded') === 'true';
    contrastDrawer.setAttribute('expanded', !value);
  });

  var contrastInput = document.querySelector('#contrastInput');
  contrastInput.setAttribute('value', contrast);
  var mutationObserver = new MutationObserver(function(records) {
    records.forEach(function() {
      var newContrast = Number.parseFloat(contrastInput.getAttribute('value'));
      if (!Number.isNaN(newContrast)) {
        contrast = newContrast;
        updateTheme();
      }
    });
  });
  mutationObserver.observe(contrastInput, {attributes: true, attributeFilter: ['value']});
}

function setupSpacingPicker() {
  var spacingButton = document.querySelector('#spacingButton');
  var spacingDrawer = document.querySelector('#spacingDrawer');
  spacingButton.addEventListener('gs-action', function() {
    var value = spacingDrawer.getAttribute('expanded') === 'true';
    spacingDrawer.setAttribute('expanded', !value);
  });

  var spacingInput = document.querySelector('#spacingInput');
  var mutationObserver = new MutationObserver(function(records) {
    records.forEach(function() {
      var newSpacing = spacingInput.getAttribute('value');
      if (newSpacing) {
        document.body.setAttribute('gs-spacing', 'compact');
      } else {
        document.body.setAttribute('gs-spacing', '');
      }
    });
  });
  mutationObserver.observe(spacingInput, {attributes: true, attributeFilter: ['value']});
}

Promise
    .all([
      fetch('demo-palette-picker.html', {method: 'GET'}),
      fetch('demo-contrast-picker.html', {method: 'GET'}),
      fetch('demo-spacing-picker.html', {method: 'GET'}),
    ])
    .then(function(responses) {
      return Promise.all([
        responses[0].text(),
        responses[1].text(),
        responses[2].text(),
      ])
    })
    .then(function(textResponses) {
      document.body.innerHTML += textResponses[0] + textResponses[1] + textResponses[2];
      setupPalettePicker();
      setupContrastPicker();
      setupSpacingPicker();
    });

// Set the templates.
var templateEl = document.querySelector('#template');
document.querySelectorAll('section.cell').forEach(function(el) {
  el.innerHTML = templateEl.innerHTML;
});

var theme = gs.ui.Theme.newInstance(
    gs.ui.DefaultPalettes.get(base),
    gs.ui.DefaultPalettes.get(accent),
    contrast);
main.bootstrap(theme);
main.applyTheme(document);

window['main'] = main;