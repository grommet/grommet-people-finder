// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Rest from 'grommet/utils/Rest';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Article from 'grommet/components/Article';
import Paragraph from 'grommet/components/Paragraph';
import Section from 'grommet/components/Section';
import Sidebar from 'grommet/components/Sidebar';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import SearchIcon from 'grommet/components/icons/base/Search';
import Logo from './Logo';
import Map from './Map';
import Details from './Details';
import PersonGroups from './PersonGroups';
import Organization from './Organization';
import config from '../config';

export default class Person extends Component {

  constructor () {
    super();
    this._onPersonResponse = this._onPersonResponse.bind(this);
    this._onDetails = this._onDetails.bind(this);
    this._onGroups = this._onGroups.bind(this);
    this._onOrganization = this._onOrganization.bind(this);
    this.state = {
      view: 'organization',
      person: {},
      scope: config.scopes.people
    };
  }

  componentDidMount () {
    this._getPerson(this.props.id);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._getPerson(nextProps.id);
    }
  }

  _onPersonResponse (err, res) {
    if (err) {
      this.setState({person: {}, error: err});
    } else if (res.ok) {
      var result = res.body;
      this.setState({person: result[0], error: null});
    }
  }

  _getPerson (id) {
    const params = {
      url: encodeURIComponent(config.ldap_base_url),
      base: encodeURIComponent('ou=' + this.state.scope.ou + ',o=' + config.organization),
      scope: 'sub',
      filter: '(uid=' + id + ')'
    };
    Rest.get('/ldap/', params).end(this._onPersonResponse);
  }

  _onDetails () {
    this.setState({view: 'details'});
  }

  _onGroups () {
    this.setState({view: 'groups'});
  }

  _onOrganization () {
    this.setState({view: 'organization'});
  }

  render () {
    const appTitle = (
      <FormattedMessage id="People Finder" defaultMessage="People Finder" />
    );
    const person = this.state.person;

    let view;
    let viewLabel;
    if ('details' === this.state.view) {
      view = <Details person={person}/>;
      viewLabel = <FormattedMessage id="Details" defaultMessage="Details" />;
    } else if ('groups' === this.state.view) {
      view = <PersonGroups person={person} onSelect={this.props.onSelect} />;
      viewLabel = <FormattedMessage id="Groups" defaultMessage="Groups" />;
    } else if ('organization' === this.state.view) {
      view = <Organization person={person} onSelect={this.props.onSelect} />;
      viewLabel = <FormattedMessage id="Organization" defaultMessage="Organization" />;
    }

    let personTitle;
    if (person.title) {
      personTitle = person.title.replace(/&amp;/g, '&');
    }

    return (
      <Split flex="left" separator={true}>
        <div>
          <Article>
            <Header large={true} pad={{horizontal: "medium"}} separator="bottom"
              justify="between">
              <Title onClick={this.props.onClose} responsive={false}>
                <Logo />
                {appTitle}
              </Title>
              <Button icon={<SearchIcon />} onClick={this.props.onClose} />
            </Header>
            <Box direction="row" pad="none" align="start">
              <Box pad="medium">
                <img src={person.hpPictureURI || 'img/no-picture.png'} alt="picture" />
              </Box>
              <Section pad="medium" className="flex">
                <Header tag="h1">
                  <span>{person.cn}</span>
                </Header>
                <Paragraph margin="none">{personTitle}</Paragraph>
                <Box pad={{vertical: "medium"}}>
                  <h2><a href={"mailto:" + person.uid}>{person.uid}</a></h2>
                  <h3><a href={"tel:" + person.telephoneNumber}>{person.telephoneNumber}</a></h3>
                </Box>
              </Section>
            </Box>
            <Map title={person.o}
              street={person.street} city={person.l} state={person.st}
              postalCode={person.postalCode} country={person.co} />
          </Article>
        </div>
        <Sidebar>
          <Header large={true} pad={{horizontal: "medium"}} justify="between" separator="bottom">
            <h3>{viewLabel}</h3>
            <Menu label="Menu" dropAlign={{right: 'right'}}>
              <Anchor className={this.state.view === 'organization' ? 'active' : undefined} onClick={this._onOrganization}>
                <FormattedMessage id="Organization" defaultMessage="Organization" />
              </Anchor>
              <Anchor className={this.state.view === 'details' ? 'active' : undefined} onClick={this._onDetails}>
                <FormattedMessage id="Details" defaultMessage="Details" />
              </Anchor>
              <Anchor className={this.state.view === 'groups' ? 'active' : undefined} onClick={this._onGroups}>
                <FormattedMessage id="Groups" defaultMessage="Groups" />
              </Anchor>
            </Menu>
          </Header>
          {view}
        </Sidebar>
      </Split>
    );
  }

};

Person.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
};
