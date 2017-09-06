// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import List from 'grommet/components/List';
import Box from 'grommet/components/Box';
import GroupListItem from './GroupListItem';
import BusyListItem from './BusyListItem';
import config, { attributesToArray } from '../config';

export default class PersonGroups extends Component {
  constructor() {
    super();
    this.onGroupsResponse = this.onGroupsResponse.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.state = { groups: [], scope: config.scopes.groups };
  }

  componentDidMount() {
    this.getGroups(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.person.dn !== this.props.person.dn) {
      this.getGroups(nextProps);
    }
  }

  onGroupsResponse(result) {
    this.setState({
      groups: result.sort((g1, g2) => {
        const n1 = g1.cn.toLowerCase();
        const n2 = g2.cn.toLowerCase();
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }
        return 0;
      }),
      error: undefined,
      busy: false,
    });
  }

  getGroups(props) {
    this.setState({ groups: [], busy: true });
    if (props.person.dn) {
      this.setState({ busy: true });
      const filter =
        `(&(objectClass=${config.scopes.groups.attributes.objectClass})` +
        `(member=${props.person.dn}))`;
      const params = {
        url: config.ldapBaseUrl,
        base: `ou=${this.state.scope.ou},o=${config.organization}`,
        scope: 'sub',
        filter,
        attributes: attributesToArray(this.state.scope.attributes),
      };
      const options = { method: 'GET', headers };
      const query = buildQuery(params);
      fetch(`/ldap/${query}`, options)
        .then(processStatus)
        .then(response => response.json())
        .then(this.onGroupsResponse)
        .catch(error => this.setState({ groups: [], error, busy: false }));
    }
  }

  onSelect(group) {
    this.props.onSelect(group, this.state.scope);
  }

  render() {
    const { groups, busy } = this.state;
    const { person } = this.props;
    let items;
    if (busy) {
      items = <BusyListItem />;
    } else if (!groups || groups.length === 0) {
      items = (
        <Box pad='medium'>
          {`${person[config.scopes.people.attributes.name]} is not assigned to any group.`}
        </Box>
      );
    } else {
      items = groups.map(item => (
        <GroupListItem
          key={item.dn}
          item={item}
          direction='column'
          onClick={() => this.onSelect(item)}
        />
      ));
    }

    return (
      <List>
        {items}
      </List>
    );
  }
}

PersonGroups.propTypes = {
  onSelect: PropTypes.func.isRequired,
  person: PropTypes.object.isRequired,
};
