// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import App from 'grommet/components/App';
import Finder from './Finder';
import DirectoryList from './DirectoryList';
import Person from './Person';
import Group from './Group';
import LocationComponent from './Location';
import config from '../config';

function getTitle(scope, item) {
  let title = `${scope.label} Finder`;
  // title = <FormattedMessage id={title} defaultMessage={title} />;
  if (item) {
    title = `${item.cn} - ${title}`;
  }
  return title;
}

function paramsFromQuery(query) {
  const params = {};
  query.replace(/(^\?)/, '').split('&').forEach((p) => {
    const parts = p.split('=');
    params[parts[0]] = decodeURIComponent(parts[1]);
  });
  return params;
}

/*
 * The PeopleFinder module controls the browser location and interacts with the
 * back end. It uses the People and Person modules to handle all visualizations.
 */

export default class PeopleFinder extends Component {
  constructor() {
    super();
    this.popState = this.popState.bind(this);
    this.onSearchText = this.onSearchText.bind(this);
    this.onScope = this.onScope.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onCloseItem = this.onCloseItem.bind(this);
    this.state = {
      initial: true,
      searchText: '',
      scope: config.scopes.people,
    };
  }

  componentDidMount() {
    const params = paramsFromQuery(window.location.search);
    const searchText = params.search || '';
    const scope = config.scopes[params.scope || 'people'];
    const id = params.id;

    // TODO: revisit this logic
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({
      id,
      initial: (!searchText),
      scope,
      searchText,
      title: getTitle(scope),
    });
    /* eslint-enable react/no-did-mount-set-state */

    window.onpopstate = this.popState;
  }

  pushState() {
    let url = `${window.location.href.split('?')[0]}?`;
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
      title: this.state.title,
    };
    window.history.pushState(state, this.state.title, url);
    document.title = this.state.title;
  }

  popState(event) {
    if (event.state) {
      this.setState({
        id: event.state.id,
        scope: config.scopes[event.state.ou],
        searchText: event.state.searchText,
        title: event.state.title,
      });
      document.title = event.state.title;
    }
  }

  onSearchText(text) {
    this.setState({ initial: !text, searchText: text }, this.pushState);
  }

  onScope(scope) {
    this.setState({
      scope,
      title: getTitle(scope),
    }, this.pushState);
  }

  onSelect(item, scopeArg) {
    const scope = scopeArg || this.state.scope;
    this.setState({
      id: item[scope.attributes.id],
      scope,
      title: getTitle(scope, item),
    }, this.pushState);
  }

  onCloseItem() {
    this.setState({
      id: null,
      title: getTitle(this.state.scope),
    }, this.pushState);
  }

  render() {
    let contents;

    if (this.state.id) {
      if (config.scopes.people.ou === this.state.scope.ou) {
        contents = (
          <Person
            id={this.state.id}
            onSelect={this.onSelect}
            onClose={this.onCloseItem}
          />
        );
      } else if (config.scopes.groups.ou === this.state.scope.ou) {
        contents = (
          <Group
            id={this.state.id}
            onSelect={this.onSelect}
            onClose={this.onCloseItem}
          />
        );
      } else if (config.scopes.locations.ou === this.state.scope.ou) {
        contents = (
          <LocationComponent
            id={this.state.id}
            onClose={this.onCloseItem}
          />
        );
      }
    } else {
      contents = (
        <Finder
          scope={this.state.scope}
          initial={this.state.initial}
          onScope={this.onScope}
          searchText={this.state.searchText}
          onSearch={this.onSearchText}
        >
          <DirectoryList
            scope={this.state.scope}
            searchText={this.state.searchText}
            onSelect={this.onSelect}
            onScope={this.onScope}
          />
        </Finder>
      );
    }

    return (
      <App centered={false}>
        {contents}
      </App>
    );
  }
}
