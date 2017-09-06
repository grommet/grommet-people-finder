// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import 'leaflet/dist/leaflet.css';
import 'whatwg-fetch';
import { polyfill as promisePolyfill } from 'es6-promise';

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import pt from 'react-intl/locale-data/pt';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';

import { getCurrentLocale, getLocaleData } from 'grommet/utils/Locale';

import '../scss/index.scss';
import PeopleFinder from './components/PeopleFinder';

promisePolyfill();

const locale = getCurrentLocale();
addLocaleData(en);
addLocaleData(pt);
addLocaleData(ja);
addLocaleData(zh);

/* eslint-disable import/no-dynamic-require, global-require */
let messages;
try {
  messages = require(`../messages/${locale}`);
} catch (e) {
  messages = require('../messages/en-US');
}
/* eslint-enable import/no-dynamic-require, global-require */
const localeData = getLocaleData(messages, locale);
const peopleFinderBody = (
  <IntlProvider locale={localeData.locale} messages={localeData.messages}>
    <PeopleFinder />
  </IntlProvider>
);

const element = document.getElementById('content');

ReactDOM.render(peopleFinderBody, element);

document.body.classList.remove('loading');
