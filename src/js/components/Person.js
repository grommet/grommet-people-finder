// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Responsive from 'grommet/utils/Responsive';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Menu from 'grommet/components/Menu';
import Paragraph from 'grommet/components/Paragraph';
import Section from 'grommet/components/Section';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';
import SearchIcon from 'grommet/components/icons/base/Search';
import UserIcon from 'grommet/components/icons/base/User';
import Details from './Details';
import Logo from './Logo';
import Map from './Map';
import Organization from './Organization';
import PersonGroups from './PersonGroups';
import config from '../config';

const GEONAMES_USERNAME = 'people_finder_app';

export default class Person extends Component {

  constructor () {
    super();
    this._onResponsive = this._onResponsive.bind(this);
    this._onPersonResponse = this._onPersonResponse.bind(this);
    this._onTimezoneResponse = this._onTimezoneResponse.bind(this);
    this._onDetails = this._onDetails.bind(this);
    this._onGroups = this._onGroups.bind(this);
    this._onOrganization = this._onOrganization.bind(this);
    this._onContact = this._onContact.bind(this);
    this.state = {
      view: 'organization',
      person: {},
      scope: config.scopes.people,
      responsive: false
    };
  }

  componentDidMount () {
    this._responsive = Responsive.start(this._onResponsive);
    this._getPerson(this.props.id);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._getPerson(nextProps.id);
    }
  }

  componentWillUnmount () {
    this._responsive.stop();
  }

  _onResponsive (responsive) {
    // check for view (sidebar) state, and make sure view is not
    // set to 'contact' on larger sizes
    let view = this.state.view;
    if (! responsive && ('contact' === view)) {
      view = 'organization';
    } else if (responsive) {
      view = 'contact';
    }
    this.setState({responsive: responsive, view: view});
  }

  _onPersonResponse (result) {
    const person = result[0];
    const view = this.state.responsive ? 'contact' : this.state.view;
    this._getLocation(person.hpWorkLocation);
    this.setState({person: person, error: null, view: view});
  }

  _getPerson (id) {
    const params = {
      url: config.ldap_base_url,
      base: 'ou=' + this.state.scope.ou + ',o=' + config.organization,
      scope: 'sub',
      filter: '(uid=' + id + ')'
    };
    const options = { method: 'GET', headers: headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(this._onPersonResponse)
      .catch(error => this.setState({person: {}, error: error}));
  }

  _getLocation (workLocation) {
    const params = {
      url: config.ldap_base_url,
      base: workLocation,
      scope: 'sub'
    };
    const options = { method: 'GET', headers: headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(result => this._getTimezone(result[0]))
      .catch(error => this.setState({error: error}));
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

  _onContact () {
    // allow sidebar content to be set to 'contact' view for mobile
    this.setState({view: 'contact'});
  }

  _formatHourInCity (hour, city, timezone) {
    const ampm = hour >= 12 ? 'pm' : 'am';
    let currentHour = hour % 12;
    // account for midnight
    currentHour = currentHour ? currentHour : 12;

    if (timezone) {
      return `It is ${currentHour}${ampm} in ${city} (${timezone} UTC).`;
    } else {
      return `It is ${currentHour}${ampm} in ${city}.`;
    }
  }

  _getHourFromLDAPTimezone (personTimezone) {
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

    return personDate.getHours();
  }

  _onTimezoneResponse (result) {
    const person = this.state.person;
    const time = result.time;
    const personHour = Number.parseInt(time.substr(11, 2));
    const currentPersonTime = this._formatHourInCity(personHour, person.l);
    this.setState({currentPersonTime: currentPersonTime, error: null});
  }

  _getTimezone (location) {
    const person = this.state.person;
    let currentPersonTime = 'No timezone information found.';

    if (location.latitude && location.longitude) {
      const params = {
        lat: location.latitude,
        lng: location.longitude,
        username: GEONAMES_USERNAME
      };
      const timeZoneHeader = { 'Accept': 'application/json' };
      const options = { method: 'GET', headers: timeZoneHeader, mode: 'cors' };
      const query = buildQuery(params);
      fetch(`http://api.geonames.org/timezoneJSON${query}`, options)
        .then(processStatus)
        .then((response) => response.json())
        .then(this._onTimezoneResponse)
        .catch(error => this.setState({ currentPersonTime: currentPersonTime, error: error }));
    } else {
      // could not find latitude + longitude, or timeZone
      // properties from LDAP location query
      if (location.timeZone) {
        // fallback to using timeZone data from LDAP server
        // (which might not be taking DST into account)
        const personTimezone = location.timeZone;
        const personHour = this._getHourFromLDAPTimezone(personTimezone);
        // formatting timezone from LDAP
        const formattedPersonTimezone = `${personTimezone.substr(0,3)}:${personTimezone.substr(3,2)}`;
        currentPersonTime = this._formatHourInCity(personHour, person.l, formattedPersonTimezone);
      }

      this.setState({currentPersonTime: currentPersonTime});
    }
  }

  render () {
    const appTitle = (
      <FormattedMessage id="People Finder" defaultMessage="People Finder" />
    );
    const person = this.state.person;

    let personTitle;
    if (person.title) {
      personTitle = person.title.replace(/&amp;/g, '&');
    }

    let header;
    if ('contact' !== this.state.view) {
      header = (
        <Header large={true} pad={{horizontal: "medium"}} separator="bottom"
          justify="between">
          <Title onClick={this.props.onClose} responsive={false}>
            <Logo />
            {appTitle}
          </Title>
          <Button icon={<SearchIcon />} onClick={this.props.onClose} />
        </Header>
      );
    }

    let contact;
    let boxDirection = "row";
    let contactPad = "none";
    let contactContentsPad = "medium";

    if (this.state.responsive) {
      boxDirection = "column";
      contactPad = { vertical: "medium", between: "medium" };
      contactContentsPad = { horizontal: "medium" };
    }

    let phone;
    if (! person.telephoneNumber || '+1' === person.telephoneNumber) {
      phone = <span className="secondary">Phone number not available.</span>;
    } else {
      phone = <Anchor href={"tel:" + person.telephoneNumber}>{person.telephoneNumber}</Anchor>;
    }

    let image;
    if (person.hpPictureURI) {
      image = (
        <img className="avatar" src={person.hpPictureURI || 'img/no-picture.png'}
          alt="picture" />
      );
    } else {
      image = <UserIcon size="large" />;
    }

    contact = (
      <Article>
        {header}
        <Box direction={boxDirection} pad={contactPad} align="start"
          flex={false}>
          <Box pad={contactContentsPad}>
            {image}
          </Box>
          <Section pad={contactContentsPad} className="flex">
            <Heading tag="h1">
              {person.cn}
            </Heading>
            <Paragraph margin="none">{personTitle}</Paragraph>
            <Paragraph size="large" margin="small">
              <Anchor href={"mailto:" + person.uid}>{person.uid}</Anchor>
            </Paragraph>
            <Paragraph size="large" margin="small">
              {phone}
            </Paragraph>
            <Paragraph size="large" margin="small">
              {this.state.currentPersonTime}
            </Paragraph>
          </Section>
        </Box>
        <Map title={person.o} className="flex"
          street={person.street} city={person.l} state={person.st}
          postalCode={person.postalCode} country={person.co} />
      </Article>
    );

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
    } else if ('contact' === this.state.view) {
      view = contact;
      viewLabel = "Contact";
    }

    let contactAnchor;
    let viewHeader = <Heading tag="h3">{viewLabel}</Heading>;
    if (this.state.responsive) {
      // on mobile, allow contact (main Person content) as a menu option
      // and show logo with bolded viewLabel
      contactAnchor = <Anchor className={this.state.view === 'contact' ? 'active' : undefined} onClick={this._onContact} label="Contact" />;
      viewHeader = (
        <Box direction="row" responsive={false} align="center" pad={{between: "small"}}>
          <Title onClick={this.props.onClose} responsive={false}>
            <Logo />
          </Title>
          <Heading tag="h3" strong={true}>{viewLabel}</Heading>
        </Box>
      );
    }

    return (
      <Split flex="both" separator={true}>
        {contact}
        <Sidebar>
          <Header large={true} pad={{horizontal: "medium"}} justify="between" separator="bottom">
            {viewHeader}
            <Menu label="Menu" dropAlign={{right: 'right'}}>
              {contactAnchor}
              <Anchor className={this.state.view === 'organization' ? 'active' : undefined} onClick={this._onOrganization}>
                <FormattedMessage id="Organization" defaultMessage="Organization" />
              </Anchor>
              <Anchor className={this.state.view === 'details' ? 'active' : undefined} onClick={this._onDetails}>
                <FormattedMessage id="Details" defaultMessage="Details" />
              </Anchor>
              <Anchor className={this.state.view === 'groups' ? 'active' : undefined} onClick={this._onGroups}>
                <FormattedMessage id="Groups" defaultMessage="Groups" />
              </Anchor>
              <Anchor href={"http://directoryworks.core.hp.com/protected/people/view/person/normal/?dn=" + person.dn} label="Edit in DirectoryWorks" />
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
