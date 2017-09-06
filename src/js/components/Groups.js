// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DirectoryList from './DirectoryList';
import config from '../config';

function filterForSearch(searchText) {
  let filter;
  if (searchText) {
    if (searchText[0] === '(') {
      // assume this is already a formal LDAP filter
      filter = searchText;
    } else {
      filter = `(${config.scopes.groups.attributes.id}=*${searchText}*)`;
    }
  }
  return filter;
}

export default class Groups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: filterForSearch(props.searchText),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchText !== this.props.searchText) {
      const filter = filterForSearch(nextProps.searchText);
      this.setState({ filter });
    }
  }

  render() {
    return (
      <DirectoryList filter={this.state.filter} onSelect={this.props.onSelect} />
    );
  }
}

Groups.defaultProps = {
  searchText: undefined,
};

Groups.propTypes = {
  searchText: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
