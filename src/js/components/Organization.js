// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Article from 'grommet/components/Article';
import List from 'grommet/components/List';
import Header from 'grommet/components/Header';
import Rest from 'grommet/utils/Rest';
import PersonListItem from './PersonListItem';
import BusyListItem from './BusyListItem';
import config from '../config';

export default class Organization extends Component {

  constructor () {
    super();
    this._onTeamResponse = this._onTeamResponse.bind(this);
    this._onManagerResponse = this._onManagerResponse.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this.state = {team: [], managers: [], scope: config.scopes.people};
  }

  componentDidMount () {
    this._getRelatedDetails(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.person.dn !== this.props.person.dn) {
      this._getRelatedDetails(nextProps);
    }
  }

  _onManagerResponse (err, res) {
    if (err) {
      this.setState({staff: [], error: err});
    } else if (res.ok) {
      const result = res.body;
      const manager = result[0];
      // might not match if domain names are different
      if (manager) {
        const managers = this.state.managers;
        managers.unshift(manager);
        this.setState({managers: managers, error: null});
        // 20 limit is to guard against bugs in the code
        if (manager.manager && manager.manager !== manager.dn && managers.length <= 20) {
          this._getManager(manager.manager);
        } else {
          this.setState({busy: false});
        }
      } else {
        console.log('Unknown manager', res.req.url);
        this.setState({busy: false});
      }
    }
  }

  _getManager (managerDn) {
    const params = {
      url: encodeURIComponent(config.ldap_base_url),
      base: managerDn,
      scope: 'sub'
    };
    Rest.get('/ldap/', params).end(this._onManagerResponse);
  }

  _onTeamResponse (err, res) {
    if (err) {
      this.setState({staff: [], error: err});
    } else if (res.ok) {
      const result = res.body.sort(function (p1, p2) {
        const n1 = p1.cn.toLowerCase();
        const n2 = p2.cn.toLowerCase();
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }
        return 0;
      });
      this.setState({team: result, error: null});
    }
  }

  _getRelatedDetails (props) {
    this.setState({team: [], managers: []});
    if (props.person.dn) {
      this.setState({busy: true});

      const params = {
        url: encodeURIComponent(config.ldap_base_url),
        base: encodeURIComponent(`ou=${this.state.scope.ou},o=${config.organization}`),
        scope: 'sub',
        filter: encodeURIComponent(`(&(hpStatus=Active)(manager=${props.person.dn}))`),
        attributes: this.state.scope.attributes
      };
      Rest.get('/ldap/', params).end(this._onTeamResponse);

      this._getManager(props.person.manager);
    }
  }

  _onSelect (item) {
    this.props.onSelect(item);
  }

  render () {
    const person = this.props.person;
    let people;
    if (person.uid) {
      if (this.state.busy) {
        people = [<BusyListItem key="busy" />];
      } else {
        people = this.state.managers.map(item => (
          <PersonListItem key={item.uid} item={item}
            onClick={this._onSelect.bind(this, item)} />
        ));
      }
      people.push(<PersonListItem key={person.uid} item={person} />);
    }
    let team;
    if (this.state.team.length > 0) {
      const members = this.state.team.map((item, index) => (
        <PersonListItem key={item.uid} item={item} first={index === 0}
          onClick={this._onSelect.bind(this, item)} />
      ));
      team = [
        <Header key="label" pad="medium">
          <h4>{`${person.givenName}'s Team`}</h4>
        </Header>,
        <List key="team">{members}</List>
      ];
    }

    return (
      <Article>
        <List>
          {people}
        </List>
        {team}
      </Article>
    );
  }

};

Organization.propTypes = {
  onSelect: PropTypes.func.isRequired,
  person: PropTypes.object.isRequired
};
