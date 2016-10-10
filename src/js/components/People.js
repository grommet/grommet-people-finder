// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import DirectoryList from './DirectoryList';
import config from '../config';

export default class People extends Component {

  constructor (props) {
    super(props);
    this.state = {
      filter: this._filterForSearch(props.searchText)
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.searchText !== this.props.searchText) {
      var filter = this._filterForSearch(nextProps.searchText);
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
        // handle "Last, First" syntax
        if (searchText.indexOf(',') !== -1) {
          searchText = searchText.replace(/(.+),\s*(.+)/, "$2 $1");
        }
        filter = `(&(|(${config.scopes.people.attributes.name}` +
          `=*${searchText}*)(${config.scopes.people.attributes.id}` +
          `=*${searchText}*)))`;
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

People.propTypes = {
  searchText: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};
