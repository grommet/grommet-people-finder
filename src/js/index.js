// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

require("../scss/index.scss");
require("leaflet/dist/leaflet.css");

var React = require('react');
var ReactDOM = require('react-dom');
var IntlProvider = require('react-intl').IntlProvider;
var addLocaleData = require('react-intl').addLocaleData;

var Locale = require('grommet/utils/Locale');
var PeopleFinder = require('./components/PeopleFinder');

var locale = Locale.getCurrentLocale();
addLocaleData(require('react-intl/lib/locale-data/en'));
addLocaleData(require('react-intl/lib/locale-data/pt'));
addLocaleData(require('react-intl/lib/locale-data/ja'));
addLocaleData(require('react-intl/lib/locale-data/zh'));

var messages;
try {
  messages = require('../messages/' + locale);
} catch (e) {
  messages = require('../messages/en-US');
}

var element = document.getElementById('content');

var localeData = Locale.getLocaleData(messages, locale);


var peopleFinderBody = (
  <IntlProvider locale={localeData.locale} messages={localeData.messages}>
    <PeopleFinder />
  </IntlProvider>
);

ReactDOM.render(peopleFinderBody, element);

document.body.classList.remove('loading');
