// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Box from 'grommet/components/Box';
import Label from 'grommet/components/Label';
import List from 'grommet/components/List';
import Heading from 'grommet/components/Heading';
import Image from 'grommet/components/Image';
import UserIcon from 'grommet/components/icons/base/User';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import PersonListItem from './PersonListItem';
import BusyListItem from './BusyListItem';
import config, { attributesToArray } from '../config';

export default class Organization extends Component {
  constructor() {
    super();
    this.onTeamResponse = this.onTeamResponse.bind(this);
    this.onManagerResponse = this.onManagerResponse.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.state = { team: [], managers: [], scope: config.scopes.people };
  }

  componentDidMount() {
    this.getRelatedDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.person.dn !== this.props.person.dn) {
      this.getRelatedDetails(nextProps);
    }
  }

  onManagerResponse(result) {
    const manager = result[0];
    // might not match if domain names are different
    if (manager) {
      const managers = this.state.managers;
      managers.unshift(manager);
      this.setState({ managers, error: undefined });
      // 20 limit is to guard against bugs in the code
      if (manager.manager && manager.manager !== manager.dn &&
        managers.length <= 20) {
        this.getManager(manager.manager);
      } else {
        this.setState({ busy: false });
      }
    } else {
      this.setState({ busy: false });
    }
  }

  getManager(managerDn) {
    const params = {
      url: config.ldapBaseUrl,
      base: managerDn,
      scope: 'sub',
    };
    const options = { method: 'GET', headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(this.onManagerResponse)
      .catch(error => this.setState({ staff: [], error }));
  }

  onTeamResponse(result) {
    // sort on common name
    this.setState({
      team: result.sort((p1, p2) => {
        const n1 = p1.cn.toLowerCase();
        const n2 = p2.cn.toLowerCase();
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }
        return 0;
      }),
      error: undefined,
    });
  }

  getRelatedDetails(props) {
    this.setState({ team: [], managers: [] });
    if (props.person.dn) {
      this.setState({ busy: true });

      const params = {
        url: config.ldapBaseUrl,
        base: `ou=${this.state.scope.ou},o=${config.organization}`,
        scope: 'sub',
        filter: `(&(${config.scopes.people.attributes.manager}` +
          `=${props.person.dn}))`,
        attributes: attributesToArray(this.state.scope.attributes),
      };
      const options = { method: 'GET', headers };
      const query = buildQuery(params);
      fetch(`/ldap/${query}`, options)
        .then(processStatus)
        .then(response => response.json())
        .then(this.onTeamResponse)
        .catch(error => this.setState({ staff: [], error }));

      this.getManager(props.person[config.scopes.people.attributes.manager]);
    }
  }

  onSelect(item) {
    this.props.onSelect(item);
  }

  render() {
    const person = this.props.person;
    let givenName = person[config.scopes.people.attributes.name];
    const middleInitialRegExp = new RegExp(/\s\w\.?$/);
    // check to see if givenName includes single letter (middle initial)
    // with or without period, and trim it.
    // assumes givenName does not include last name (as stored in LDAP server).
    if (givenName) {
      givenName = givenName.replace(middleInitialRegExp, '');
    }

    let managers;
    if (person[config.scopes.people.attributes.id]) {
      if (this.state.busy) {
        managers = [<BusyListItem key='busy' />];
      } else {
        managers = this.state.managers.map(item => (
          <PersonListItem
            key={item[config.scopes.people.attributes.id]}
            item={item}
            onClick={() => this.onSelect(item)}
          />
        ));
      }
    }

    let image;
    if (person[config.scopes.people.attributes.thumbnail]) {
      image = (
        <Image
          size='thumb'
          mask={true}
          src={person[config.scopes.people.attributes.thumbnail]}
        />
      );
    } else {
      image = <UserIcon size='large' />;
    }

    let label;
    let team;
    if (this.state.team.length > 0) {
      label = (
        <Heading tag='h4' margin='none'>
          <strong>{`${givenName}'s Team`}</strong>
        </Heading>
      );
      const members = this.state.team.map((item, index) => (
        <PersonListItem
          key={item[config.scopes.people.attributes.id]}
          item={item}
          first={index === 0}
          onClick={() => this.onSelect(item)}
        />
      ));
      team = <List key='team'>{members}</List>;
    } else if (!this.state.busy) {
      label = (
        <Label className='secondary' margin='none'>
          {`${givenName} has no direct reports.`}
        </Label>
      );
    }

    return (
      <div>
        <List>
          {managers}
        </List>
        <Box
          key='header'
          pad={{ vertical: 'medium', between: 'small' }}
          colorIndex='light-1'
          justify='center'
          align='center'
        >
          {image}
          {label}
        </Box>
        {team}
      </div>
    );
  }
}

Organization.propTypes = {
  onSelect: PropTypes.func.isRequired,
  person: PropTypes.object.isRequired,
};
