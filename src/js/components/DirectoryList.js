// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import List from 'grommet/components/List';
import Footer from 'grommet/components/Footer';
import PersonListItem from './PersonListItem';
import GroupListItem from './GroupListItem';
import LocationListItem from './LocationListItem';
import SummaryListItem from './SummaryListItem';
import BusyListItem from './BusyListItem';
import config from '../config';

const SCOPE_LIST_ITEMS = {
  people: PersonListItem,
  groups: GroupListItem,
  locations: LocationListItem
};

export default class DirectoryList extends Component {

  constructor () {
    super();
    this._onSelect = this._onSelect.bind(this);
    this._search = this._search.bind(this);
    this._onSearchResponse = this._onSearchResponse.bind(this);
    this.state = {
      busy: false,
      results: [],
      summaries: {}
    };
  }

  componentDidMount () {
    this._queueSearch(this.props.searchText);
  }

  componentWillReceiveProps (newProps) {
    if (newProps.scope !== this.props.scope ||
      newProps.searchText !== this.props.searchText) {
      this._queueSearch(newProps.searchText);
    }
  }

  componentWillUnmount () {
    clearTimeout(this._searchTimer);
  }

  _onSearchResponse (scope, response) {
    // don't keep result if we don't have search text anymore
    if (this.props.searchText) {
      let state = {error: null, busy: false, summaries: this.state.summaries};
      if (scope.ou === this.props.scope.ou) {
        state.results = response;
      } else if (response.length > 0) {
        state.summaries[scope.ou] = {
          scope: scope,
          searchText: this.props.searchText
        };
      }
      this.setState(state);
    }
  }

  _search () {
    const searchText = this.props.searchText;
    let filter;
    if (searchText[0] === '(') {
      // assume this is already a formal LDAP filter
      filter = searchText;
    } else {
      filter = this.props.scope.filterForSearch(searchText);
    }

    let params = {
      url: config.ldap_base_url,
      base: `ou=${this.props.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter: filter,
      attributes: this.props.scope.attributes
    };
    const options = { method: 'GET', headers: headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
    .then(processStatus)
    .then(response => response.json())
    .then(response => this._onSearchResponse(this.props.scope, response))
    .catch(error => this.setState({results: [], error: error, busy: false}));

    // get other scopes lazily
    this._searchTimer = setTimeout(function () {
      Object.keys(config.scopes).map(function (key) {
        var scope = config.scopes[key];
        if (scope.ou !== this.props.scope.ou) {
          params.base = `ou=${scope.ou},o=${config.organization}`;
          params.filter = scope.filterForSearch(searchText);
          params.attributes = scope.attributes;
          const query = buildQuery(params);
          fetch(`/ldap/${query}`, options)
          .then(processStatus)
          .then(response => response.json())
          .then(response => this._onSearchResponse(scope, response))
          .catch(error => this.setState({error: error, busy: false}));
        }
      }.bind(this));
    }.bind(this), 200);
  }

  _queueSearch (searchText) {
    clearTimeout(this._searchTimer);
    if (! searchText) {
      this.setState({results: [], summaries: {}, busy: false});
    } else {
      this.setState({summaries: {}, busy: true});
      // debounce
      this._searchTimer = setTimeout(this._search, 500);
    }
  }

  _onSelect (item) {
    this.props.onSelect(item);
  }

  _onSelectScope (scope) {
    this.props.onScope(scope);
  }

  render () {
    const { searchText, scope } = this.props;
    const { results, busy } = this.state;
    let items, empty, first, error = false;

    if (this.state.error) {
      error = <div>{this.state.error}</div>;
    }

    if (busy) {
      items = <BusyListItem />;
    } else if (searchText && results.length === 0) {
      const noMatchingLabel = `No matching ${scope.label.toLowerCase()}`;
      empty = (
        <FormattedMessage id={noMatchingLabel} defaultMessage={noMatchingLabel} />
      );
      first = true;
    } else {
      const ListItem = SCOPE_LIST_ITEMS[scope.ou];
      items = results.map(item => (
        <ListItem key={item.dn} item={item}
          onClick={this._onSelect.bind(this, item)} />
      ));
    }

    const summaryItems = Object.keys(this.state.summaries).map(key => {
      const summary = this.state.summaries[key];
      const item = (
        <SummaryListItem key={key} scope={summary.scope} first={first}
          searchText={summary.searchText}
          onClick={this._onSelectScope.bind(this, summary.scope)} />
      );
      first = false;
      return item;
    });

    let more;
    if (results.length >= 20 && ! busy) {
      const moreLabel = 'Refine search to find more';
      more = (
        <Footer pad="medium">
          <FormattedMessage id={moreLabel} defaultMessage={moreLabel} />
        </Footer>
      );
    }

    return (
      <div>
        {error}
        <List key="results" emptyIndicator={empty}>
          {items}
          {summaryItems}
        </List>
        {more}
      </div>
    );
  }

};

DirectoryList.propTypes = {
  scope: PropTypes.object.isRequired,
  searchText: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onScope: PropTypes.func.isRequired
};
