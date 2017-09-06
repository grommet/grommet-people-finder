// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import List from 'grommet/components/List';
import Footer from 'grommet/components/Footer';
import PersonListItem from './PersonListItem';
import GroupListItem from './GroupListItem';
import LocationListItem from './LocationListItem';
import SummaryListItem from './SummaryListItem';
import BusyListItem from './BusyListItem';
import config, { attributesToArray } from '../config';

const SCOPE_LIST_ITEMS = {};
SCOPE_LIST_ITEMS[config.scopes.people.ou] = PersonListItem;
SCOPE_LIST_ITEMS[config.scopes.groups.ou] = GroupListItem;
SCOPE_LIST_ITEMS[config.scopes.locations.ou] = LocationListItem;

export default class DirectoryList extends Component {
  constructor() {
    super();
    this.onSelect = this.onSelect.bind(this);
    this.search = this.search.bind(this);
    this.onSearchResponse = this.onSearchResponse.bind(this);
    this.state = {
      busy: false,
      results: [],
      summaries: {},
    };
  }

  componentDidMount() {
    this.queueSearch(this.props.searchText);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.scope !== this.props.scope ||
      newProps.searchText !== this.props.searchText) {
      this.queueSearch(newProps.searchText);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.searchTimer);
  }

  onSearchResponse(scope, response) {
    // don't keep result if we don't have search text anymore
    if (this.props.searchText) {
      const state = { error: undefined, busy: false, summaries: this.state.summaries };
      if (scope.ou === this.props.scope.ou) {
        state.results = response;
      } else if (response.length > 0) {
        state.summaries[scope.ou] = {
          scope,
          searchText: this.props.searchText,
        };
      }
      this.setState(state);
    }
  }

  search() {
    const searchText = this.props.searchText;
    let filter;
    if (searchText[0] === '(') {
      // assume this is already a formal LDAP filter
      filter = searchText;
    } else {
      filter = this.props.scope.filterForSearch(searchText);
    }

    const params = {
      url: config.ldapBaseUrl,
      base: `ou=${this.props.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter,
      attributes: attributesToArray(this.props.scope.attributes),
    };
    const options = { method: 'GET', headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(response => this.onSearchResponse(this.props.scope, response))
      .catch(error => this.setState({ results: [], error, busy: false }));

    // get other scopes lazily
    this.searchTimer = setTimeout(() => {
      Object.keys(config.scopes).forEach((key) => {
        const scope = config.scopes[key];
        if (scope.ou !== this.props.scope.ou) {
          params.base = `ou=${scope.ou},o=${config.organization}`;
          params.filter = scope.filterForSearch(searchText);
          params.attributes = attributesToArray(scope.attributes);
          const q = buildQuery(params);
          fetch(`/ldap/${q}`, options)
            .then(processStatus)
            .then(response => response.json())
            .then(response => this.onSearchResponse(scope, response))
            .catch(error => this.setState({ error, busy: false }));
        }
      });
    }, 200);
  }

  queueSearch(searchText) {
    clearTimeout(this.searchTimer);
    if (!searchText) {
      this.setState({ results: [], summaries: {}, busy: false });
    } else {
      this.setState({ summaries: {}, busy: true });
      // debounce
      this.searchTimer = setTimeout(this.search, 500);
    }
  }

  onSelect(item) {
    this.props.onSelect(item);
  }

  onSelectScope(scope) {
    this.props.onScope(scope);
  }

  render() {
    const { searchText, scope } = this.props;
    const { results, busy } = this.state;
    let items;
    let empty;
    let first;
    let error = false;

    if (this.state.error) {
      error = <div>{this.state.error}</div>;
    }

    if (busy) {
      items = <BusyListItem />;
    } else if (searchText && results.length === 0) {
      const noMatchingLabel = `No matching ${scope.label.toLowerCase()}`;
      empty = (
        <FormattedMessage
          id={noMatchingLabel}
          defaultMessage={noMatchingLabel}
        />
      );
      first = true;
    } else {
      const ListItem = SCOPE_LIST_ITEMS[scope.ou];
      items = results.map(item => (
        <ListItem
          key={item.dn}
          item={item}
          onClick={() => this.onSelect(item)}
        />
      ));
    }

    const summaryItems = Object.keys(this.state.summaries).map((key) => {
      const summary = this.state.summaries[key];
      const item = (
        <SummaryListItem
          key={key}
          scope={summary.scope}
          first={first}
          searchText={summary.searchText}
          onClick={() => this.onSelectScope(summary.scope)}
        />
      );
      first = false;
      return item;
    });

    let more;
    if (results.length >= 20 && !busy) {
      const moreLabel = 'Refine search to find more';
      more = (
        <Footer pad='medium'>
          <FormattedMessage id={moreLabel} defaultMessage={moreLabel} />
        </Footer>
      );
    }

    return (
      <div>
        {error}
        <List key='results' emptyIndicator={empty}>
          {items}
          {summaryItems}
        </List>
        {more}
      </div>
    );
  }
}

DirectoryList.defaultProps = {
  searchText: undefined,
};

DirectoryList.propTypes = {
  scope: PropTypes.object.isRequired,
  searchText: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onScope: PropTypes.func.isRequired,
};
