// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Rest from 'grommet/utils/Rest';
import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Paragraph from 'grommet/components/Paragraph';
import Section from 'grommet/components/Section';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';
import Status from 'grommet/components/icons/Status';
import SearchIcon from 'grommet/components/icons/base/Search';
import Details from './Details';
import Logo from './Logo';
import Map from './Map';
import Organization from './Organization';
import PersonGroups from './PersonGroups';
import config from '../config';

export default class Person extends Component {

  constructor () {
    super();
    this._onPersonResponse = this._onPersonResponse.bind(this);
    this._onDetails = this._onDetails.bind(this);
    this._onGroups = this._onGroups.bind(this);
    this._onOrganization = this._onOrganization.bind(this);
    this._onLocationResponse = this._onLocationResponse.bind(this);
    this._renderTimezoneOffset = this._renderTimezoneOffset.bind(this);
    this._checkDayOrNight = this._checkDayOrNight.bind(this);
    this.state = {
      view: 'organization',
      person: {},
      location: {},
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
      const result = res.body;
      const person = result[0];

      this.setState({person: person, error: null}, () => {
        if (person.hpWorkLocation) {
          this._getLocation(person.hpWorkLocation);
        }
      });
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

  _onLocationResponse (err, res) {
    if (err) {
      this.setState({location: {}, error: err});
    } else if (res.ok) {
      const result = res.body;
      this.setState({location: result[0], error: null}, () => {
        this._renderTimezoneOffset();
      });
    }
  }

  _getLocation (workLocation) {
    const params = {
      url: encodeURIComponent(config.ldap_base_url),
      base: workLocation,
      scope: 'sub'
    };
    Rest.get('/ldap/', params).end(this._onLocationResponse);
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

  _checkDayOrNight (date) {
    let value = "warning";
    // check if hours is between 7am and 6pm
    if (date.getHours() >= 7 && date.getHours() <= 18) {
      value = "ok";
    }

    return <Status value={value} />;
  }

  _renderTimezoneOffset () {
    const person = this.state.person;
    const personTimezone = this.state.location.timeZone;

    if (! personTimezone) {
      return;
    }

    const currentDate = new Date();
    // converting minutes to milliseconds for localOffset
    const localOffset = currentDate.getTimezoneOffset() * 60000;
    const localTime = currentDate.getTime();
    const localUTC = localTime + localOffset;
    // expect personTimezone to look like "+0100"
    // take positive or negative sign, and convert to int
    const offsetSign = Number.parseInt(personTimezone.substr(0, 1) + '1');
    // taking hours offset
    const personHoursOffset = Number.parseInt(personTimezone.substr(1, 2));
    // taking last two "digits" from string to convert to decimal
    const personMinutesOffset = Number.parseInt(personTimezone.substr(-2)) / 60;
    const personTimezoneOffset = (personHoursOffset + personMinutesOffset) * offsetSign;
    // converting personTimezoneOffset from hours to milliseconds
    const personDate = new Date(localUTC + (3600000 * personTimezoneOffset));
    const statusIcon = this._checkDayOrNight(personDate);
    // negate offset since getTimezoneOffset returns positive minutes 
    // if the local timezone is behind UTC, and convert into hours
    const currentUTCOffset = (currentDate.getTimezoneOffset() / 60) * -1;
    const offset = currentUTCOffset - personTimezoneOffset;
    let timezoneString;
    // formatting timezone from LDAP
    const formattedPersonTimezone = `${personTimezone.substr(0,3)}:${personTimezone.substr(3,2)}`;

    if (offset < 0) {
      timezoneString = `Your current browser location is ${Math.abs(offset)} hours behind ${person.givenName}'s location (UTC ${formattedPersonTimezone}).`;
    } else {
      timezoneString = `Your current browser location is ${offset} hours ahead of ${person.givenName}'s location (UTC ${formattedPersonTimezone}).`;
    }

    if (timezoneString) {
      return (
        <Box direction="row" align="center">
          {timezoneString}
          <Box pad={{horizontal: 'medium'}}>
            {statusIcon}
          </Box>
        </Box>
      );
    }
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
      <Split flex="both" separator={true}>
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
              <img className="avatar" src={person.hpPictureURI || 'img/no-picture.png'} alt="picture" />
            </Box>
            <Section pad="medium" className="flex">
              <Header tag="h1">
                <span>{person.cn}</span>
              </Header>
              <Paragraph margin="none">{personTitle}</Paragraph>
              <Box pad={{vertical: "medium"}}>
                <h2><a href={"mailto:" + person.uid}>{person.uid}</a></h2>
                <h3><a href={"tel:" + person.telephoneNumber}>{person.telephoneNumber}</a></h3>
                <h3>{this._renderTimezoneOffset()}</h3>
              </Box>
            </Section>
          </Box>
          <Map title={person.o}
            street={person.street} city={person.l} state={person.st}
            postalCode={person.postalCode} country={person.co} />
        </Article>
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
