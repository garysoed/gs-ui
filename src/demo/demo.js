'use strict';

var base = 'crimson';
var accent = 'harlequin';

var accentPickerMenu = document.querySelector('.colorPickerMenu.accent');
var basePickerMenu = document.querySelector('.colorPickerMenu.base');
var palettes = [];
for (var name in gs.ui.DefaultPalettes) {
  palettes.push({name: name, palette: gs.ui.DefaultPalettes[name]});
}
var main = gs.ui.Main.newInstance();

function updateTheme() {
  var theme = gs.ui.Theme.newInstance(
      gs.ui.DefaultPalettes[base],
      gs.ui.DefaultPalettes[accent]);
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

// Create the base color picker.
for (var r = 0; r < 5; r++) {
  var rowEl = document.createElement('div');
  basePickerMenu.appendChild(rowEl);
  for (var c = 0; c < 5; c++) {
    var i = r * 5 + c;
    var palette = palettes[i].palette;
    var name = palettes[i].name;

    var normal = palette.normal;
    var cellEl = document.createElement('div');
    cellEl.style.backgroundColor =
        'rgb(' + [normal.red, normal.green, normal.blue].join(',') +')';
    cellEl.classList.add('colorPickerCell');
    cellEl.classList.add('base');
    cellEl.setAttribute('data-name', name);
    cellEl.addEventListener('click', onClickBase.bind(null, name));

    var light = palette.light;
    var lightCell = document.createElement('div');
    lightCell.style.backgroundColor =
        'rgb(' + [light.red, light.green, light.blue].join(',') + ')';
    cellEl.appendChild(lightCell);

    var dark = palette.dark;
    var darkCell = document.createElement('div');
    darkCell.style.backgroundColor =
        'rgb(' + [dark.red, dark.green, dark.blue].join(',') + ')';
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

    var color = palette.accent;
    var cellEl = document.createElement('div');
    cellEl.style.backgroundColor =
        'rgb(' + [color.red, color.green, color.blue].join(',') +')';
    cellEl.classList.add('colorPickerCell');
    cellEl.classList.add('base');
    cellEl.setAttribute('data-name', name);
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

// Set the templates.
var templateEl = document.querySelector('#template');
document.querySelectorAll('section.cell').forEach(function(el) {
  el.innerHTML = templateEl.innerHTML;
});

var theme = gs.ui.Theme.newInstance(
    gs.ui.DefaultPalettes[base],
    gs.ui.DefaultPalettes[accent]);
main.bootstrap(theme);