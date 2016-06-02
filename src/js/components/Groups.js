// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import DirectoryList from './DirectoryList';

export default class Groups extends Component {

  constructor (props) {
    super(props);
    this.state = {
      filter: this._filterForSearch(props.searchText)
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.searchText !== this.props.searchText) {
      const filter = this._filterForSearch(nextProps.searchText);
      this.setState({filter: filter});
    }
  }

  _filterForSearch (searchText) {
    let filter;
    if (searchText) {
      if (searchText[0] === '(') {
        // assume this is already a formal LDAP filter
        filter = searchText;
      } else {
        filter = `(cn=*${searchText}*)`;
      }
    }
    return filter;
  }

  render () {
    return (
      <DirectoryList
        filter={this.state.filter} onSelect={this.props.onSelect} />
    );
  }

};

Groups.propTypes = {
  searchText: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};
