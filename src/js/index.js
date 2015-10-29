// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

require("../scss/index.scss");
require("leaflet/dist/leaflet.css");

var React = require('react');
var ReactDOM = require('react-dom');
var Locale = require('grommet/utils/Locale');
var PeopleFinder = require('./components/PeopleFinder');

var locale = Locale.getCurrentLocale();
var messages;
try {
  messages = require('../messages/' + locale);
} catch (e) {
  messages = require('../messages/en-US');
}

var element = document.getElementById('content');

var peopleFinderBody = (
  <PeopleFinder messages={messages} />
);

ReactDOM.render(peopleFinderBody, element);

document.body.classList.remove('loading');
