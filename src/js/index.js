// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

require("../scss/index.scss");
require("leaflet/dist/leaflet.css");

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider, addLocaleData } from 'react-intl';
import { getCurrentLocale, getLocaleData } from 'grommet/utils/Locale';
import PeopleFinder from './components/PeopleFinder';

const locale = getCurrentLocale();
addLocaleData(require('react-intl/lib/locale-data/en'));
addLocaleData(require('react-intl/lib/locale-data/pt'));
addLocaleData(require('react-intl/lib/locale-data/ja'));
addLocaleData(require('react-intl/lib/locale-data/zh'));

// try {
//   import messages from `../messages/${locale}`;
// } catch (e) {
import messages from '../messages/en-US';
// }

const element = document.getElementById('content');

const localeData = getLocaleData(messages, locale);


const peopleFinderBody = (
  <IntlProvider locale={localeData.locale} messages={localeData.messages}>
    <PeopleFinder />
  </IntlProvider>
);

ReactDOM.render(peopleFinderBody, element);

document.body.classList.remove('loading');
