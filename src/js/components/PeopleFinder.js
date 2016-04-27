// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
// import { FormattedMessage } from 'react-intl';
import App from 'grommet/components/App';
import Finder from './Finder';
import DirectoryList from './DirectoryList';
import Person from './Person';
import Group from './Group';
import LocationComponent from './Location';
import config from '../config';

/*
 * The PeopleFinder module controls the browser location and interacts with the
 * back end. It uses the People and Person modules to handle all visualizations.
 */

export default class PeopleFinder extends Component {

  constructor () {
    super();
    this._popState = this._popState.bind(this);
    this._onSearchText = this._onSearchText.bind(this);
    this._onScope = this._onScope.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onCloseItem = this._onCloseItem.bind(this);
    this.state = {
      initial: true,
      searchText: '',
      scope: config.scopes.people
    };
  }

  componentDidMount () {
    const params = this._paramsFromQuery(window.location.search);
    const searchText = params.search || '';
    const scope = config.scopes[params.scope || 'people'];
    const id = params.id || null;

    this.setState({
      id: id,
      initial: (! searchText),
      scope: scope,
      searchText: searchText,
      title: this._title(scope)
    });

    window.onpopstate = this._popState;
  }

  _title (scope, item) {
    let title = `${scope.label} Finder`;
    // title = <FormattedMessage id={title} defaultMessage={title} />;
    if (item) {
      title = `${item.cn} - ${title}`;
    }
    return title;
  }

  _paramsFromQuery (query) {
    let params = {};
    query.replace(/(^\?)/,'').split('&').forEach(function (p) {
      const parts = p.split('=');
      params[parts[0]] = decodeURIComponent(parts[1]);
    });
    return params;
  }

  _pushState () {
    let url = window.location.href.split('?')[0] + '?';
    url += `scope=${encodeURIComponent(this.state.scope.ou)}`;
    if (this.state.searchText) {
      url += `&search=${encodeURIComponent(this.state.searchText)}`;
    }
    if (this.state.id) {
      url += `&id=${encodeURIComponent(this.state.id)}`;
    }
    const state = {
      id: this.state.id,
      ou: this.state.scope.ou,
      searchText: this.state.searchText,
      title: this.state.title
    };
    window.history.pushState(state, this.state.title, url);
    document.title = this.state.title;
  }

  _popState (event) {
    if (event.state) {
      this.setState({
        id: event.state.id,
        scope: config.scopes[event.state.ou],
        searchText: event.state.searchText,
        title: event.state.title
      });
      document.title = event.state.title;
    }
  }

  _onSearchText (text) {
    this.setState({initial: (! text), searchText: text}, this._pushState);
  }

  _onScope (scope) {
    this.setState({
      scope: scope,
      title: this._title(scope)
    }, this._pushState);
  }

  _onSelect (item, scopeArg) {
    const scope = scopeArg || this.state.scope;
    this.setState({
      id: item[scope.id],
      scope: scope,
      title: this._title(scope, item)
    }, this._pushState);
  }

  _onCloseItem () {
    this.setState({
      id: null,
      title: this._title(this.state.scope)
    }, this._pushState);
  }

  render () {
    let contents;

    if (this.state.id) {

      if ('people' === this.state.scope.ou) {

        contents = (
          <Person id={this.state.id} onSelect={this._onSelect}
            onClose={this._onCloseItem} />
        );

      } else if ('groups' === this.state.scope.ou) {

        contents = (
          <Group id={this.state.id} onSelect={this._onSelect}
            onClose={this._onCloseItem} />
        );

      } else if ('locations' === this.state.scope.ou) {

        contents = (
          <LocationComponent id={this.state.id}
            onClose={this._onCloseItem} />
        );

      }

    } else {

      contents = (
        <Finder scope={this.state.scope} initial={this.state.initial}
          onScope={this._onScope}
          searchText={this.state.searchText} onSearch={this._onSearchText}>
          <DirectoryList scope={this.state.scope}
            searchText={this.state.searchText}
            onSelect={this._onSelect} onScope={this._onScope} />
        </Finder>
      );

    }

    return (
      <App centered={false}>
        {contents}
      </App>
    );
  }

};
