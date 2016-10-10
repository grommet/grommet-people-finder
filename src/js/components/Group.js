// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Title from 'grommet/components/Title';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Paragraph from 'grommet/components/Paragraph';
import List from 'grommet/components/List';
import Button from 'grommet/components/Button';
import Anchor from 'grommet/components/Anchor';
import SearchIcon from 'grommet/components/icons/base/Search';
import PersonListItem from './PersonListItem';
import BusyListItem from './BusyListItem';
import GroupsIcon from './icons/GroupsIcon';
import config, { attributesToArray } from '../config';

export default class Group extends Component {

  constructor () {
    super();
    this._onGroupResponse = this._onGroupResponse.bind(this);
    this._onSelectOwner = this._onSelectOwner.bind(this);
    this.state = {
      group: {},
      owners: [],
      scope: config.scopes.groups,
      peopleScope: config.scopes.people
    };
  }

  componentDidMount () {
    this._getGroup(this.props.id);
  }

  componentWillReceiveProps (newProps) {
    if (newProps.id !== this.props.id) {
      this._getGroup(newProps.id);
    }
  }

  _onGroupResponse (result) {
    const group = result[0];
    this.setState({group: group, owners: [], error: null});

    if (config.scopes.groups.attributes.owner) {
      const owner = group[config.scopes.groups.attributes.owner];
      if (owner) {
        this.setState({busy: true});
        const owners = Array.isArray(owner) ? owner : [owner];
        const filter =
          `(|${owners.map(o => (`(${o.split(',')[0]})`)).join('')})`;
        const params = {
          url: config.ldapBaseUrl,
          base: `ou=${this.state.peopleScope.ou},o=${config.organization}`,
          scope: 'sub',
          filter: filter,
          attributes: attributesToArray(this.state.peopleScope.attributes)
        };
        const options = { method: 'GET', headers: headers };
        const query = buildQuery(params);
        fetch(`/ldap/${query}`, options)
        .then(processStatus)
        .then(response => response.json())
        .then(result => this.setState({
          owners: result, error: null, busy: false}))
        .catch(error => this.setState({owners: [], error: error, busy: false}));
      }
    }
  }

  _getGroup (id) {
    const params = {
      url: config.ldapBaseUrl,
      base: `ou=${this.state.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter: `(${config.scopes.groups.attributes.id}=${id})`
    };
    const options = { method: 'GET', headers: headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
    .then(processStatus)
    .then(response => response.json())
    .then(this._onGroupResponse)
    .catch(error => this.setState({group: {}, error: error}));
  }

  _onSelectOwner (owner) {
    this.props.onSelect(owner, this.state.peopleScope);
  }

  render () {
    const { group, busy, owners } = this.state;
    const appTitle = (
      <FormattedMessage id="Groups Finder" defaultMessage="Groups Finder" />
    );

    let mails;
    if (config.scopes.groups.attributes.mail) {
      const groupMail = group[config.scopes.groups.attributes.mail];
      if (groupMail) {
        mails = Array.isArray(groupMail) ? groupMail : [groupMail];
        mails = mails.map(mail => (
          <Heading tag="h2" key={mail}>
            <Anchor href={"mailto:" + mail}>{mail}</Anchor>
          </Heading>
        ));
      }
    }

    let ownerItems;
    if (busy) {
      ownerItems = <BusyListItem />;
    } else {
      ownerItems = owners.map((item, index) => (
        <PersonListItem key={item[config.scopes.people.attributes.id]}
          item={item} first={index === 0}
          onClick={this._onSelectOwner.bind(this, item)} />
      ));
    }

    return (
      <Article>
        <Header size="large" pad={{horizontal: "medium"}} separator="bottom"
          justify="between">
          <Title onClick={this.props.onClose} responsive={false}>
            <GroupsIcon />
            {appTitle}
          </Title>
          <Button icon={<SearchIcon />} onClick={this.props.onClose} />
        </Header>
        <Section pad="medium">
          <Heading tag="h1">
            {group[config.scopes.groups.attributes.id]}
          </Heading>
          <Paragraph>
            {group[config.scopes.groups.attributes.description]}
          </Paragraph>
          {mails}
        </Section>
        <Header pad="medium">
          <Heading tag="h3" margin="none">
            <FormattedMessage id="Owners" defaultMessage="Owners"
              count={owners.length} />
          </Heading>
        </Header>
        <List>
          {ownerItems}
        </List>
      </Article>
    );
  }

};

Group.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
};
