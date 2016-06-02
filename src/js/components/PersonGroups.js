// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Rest from 'grommet/utils/Rest';
import List from 'grommet/components/List';
import GroupListItem from './GroupListItem';
import BusyListItem from './BusyListItem';
import config from '../config';

export default class PersonGroups extends Component {

  constructor () {
    super();
    this._onGroupsResponse = this._onGroupsResponse.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this.state = {groups: [], scope: config.scopes.groups};
  }

  componentDidMount () {
    this._getGroups(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.person.dn !== this.props.person.dn) {
      this._getGroups(nextProps);
    }
  }

  _onGroupsResponse (err, res) {
    if (err) {
      this.setState({groups: [], error: err, busy: false});
    } else if (res.ok) {
      const result = res.body.sort(function (g1, g2) {
        const n1 = g1.cn.toLowerCase();
        const n2 = g2.cn.toLowerCase();
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }
        return 0;
      });
      this.setState({groups: result, error: null, busy: false});
    }
  }

  _getGroups (props) {
    this.setState({groups: [], busy: true});
    if (props.person.dn) {
      this.setState({busy: true});
      const filter = `(&(objectClass=groupOfNames)(member=${props.person.dn}))`;
      const params = {
        url: encodeURIComponent(config.ldap_base_url),
        base: encodeURIComponent(`ou=${this.state.scope.ou},o=${config.organization}`),
        scope: 'sub',
        filter: encodeURIComponent(filter),
        attributes: this.state.scope.attributes
      };
      Rest.get('/ldap/', params).end(this._onGroupsResponse);
    }
  }

  _onSelect (group) {
    this.props.onSelect(group, this.state.scope);
  }

  render () {
    const { groups, busy } = this.state;
    let items;
    if (busy) {
      items = <BusyListItem />;
    } else {
      items = groups.map((item, index) => (
        <GroupListItem key={index} item={item} direction="column"
          onClick={this._onSelect.bind(this, item)} />
      ));
    }

    return (
      <List>
        {items}
      </List>
    );
  }

};

PersonGroups.propTypes = {
  onSelect: PropTypes.func.isRequired,
  person: PropTypes.object.isRequired
};
