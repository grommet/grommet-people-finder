// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';
import SearchIcon from 'grommet/components/icons/base/Search';
import UserIcon from 'grommet/components/icons/base/User';
import FormattedMessage from 'grommet/components/FormattedMessage';
import Details from './Details';
import PeopleIcon from './icons/PeopleIcon';
import Map from './Map';
import Organization from './Organization';
import PersonGroups from './PersonGroups';
import config from '../config';

const GEONAMES_USERNAME = 'people_finder_app';


function formatHourInCity(hour, city, timezone) {
  const ampm = hour >= 12 ? 'pm' : 'am';
  const currentHour = hour % 12;
  if (timezone) {
    return `It is ${currentHour}${ampm} in ${city} (${timezone} UTC).`;
  }
  return `It is ${currentHour}${ampm} in ${city}.`;
}

function getHourFromLDAPTimezone(personTimezone) {
  const currentDate = new Date();
  // converting minutes to milliseconds for localOffset
  const localOffset = currentDate.getTimezoneOffset() * 60000;
  const localTime = currentDate.getTime();
  const localUTC = localTime + localOffset;
  // expect personTimezone to look like '+0100'
  // take positive or negative sign, and convert to int
  const offsetSign = Number.parseInt(personTimezone.substr(0, 1), 10) + 1;
  // taking hours offset
  const personHoursOffset = Number.parseInt(personTimezone.substr(1, 2), 10);
  // taking last two 'digits' from string to convert to decimal
  const personMinutesOffset = Number.parseInt(personTimezone.substr(-2), 10) / 60;
  const personTimezoneOffset =
    (personHoursOffset + personMinutesOffset) * offsetSign;
  // converting personTimezoneOffset from hours to milliseconds
  const personDate = new Date(localUTC + (3600000 * personTimezoneOffset));

  return personDate.getHours();
}

export default class Person extends Component {
  constructor() {
    super();
    this.onResponsive = this.onResponsive.bind(this);
    this.onPersonResponse = this.onPersonResponse.bind(this);
    this.onTimezoneResponse = this.onTimezoneResponse.bind(this);
    this.onDetails = this.onDetails.bind(this);
    this.onGroups = this.onGroups.bind(this);
    this.onOrganization = this.onOrganization.bind(this);
    this.onContact = this.onContact.bind(this);
    this.state = {
      view: 'organization',
      person: {},
      scope: config.scopes.people,
      responsive: false,
    };
  }

  componentDidMount() {
    this.responsive = Responsive.start(this.onResponsive);
    this.getPerson(this.props.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this.getPerson(nextProps.id);
    }
  }

  componentWillUnmount() {
    this.responsive.stop();
  }

  onResponsive(responsive) {
    // check for view (sidebar) state, and make sure view is not
    // set to 'contact' on larger sizes
    let view = this.state.view;
    if (!responsive && view === 'contact') {
      view = 'organization';
    } else if (responsive) {
      view = 'contact';
    }
    this.setState({ responsive, view });
  }

  onPersonResponse(result) {
    const person = result[0];
    const view = this.state.responsive ? 'contact' : this.state.view;
    this.getLocation(person[config.scopes.people.attributes.workLocation]);
    this.setState({ person, error: undefined, view });
  }

  getPerson(id) {
    const params = {
      url: config.ldapBaseUrl,
      base: `ou=${this.state.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter: `(${config.scopes.people.attributes.id}=${id})`,
    };
    const options = { method: 'GET', headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(this.onPersonResponse)
      .catch(error => this.setState({ person: {}, error }));
  }

  getLocation(workLocation) {
    const params = {
      url: config.ldapBaseUrl,
      base: workLocation,
      scope: 'sub',
    };
    const options = { method: 'GET', headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(result => this.getTimezone(result[0]))
      .catch(error => this.setState({ error }));
  }

  onDetails() {
    this.setState({ view: 'details' });
  }

  onGroups() {
    this.setState({ view: 'groups' });
  }

  onOrganization() {
    this.setState({ view: 'organization' });
  }

  onContact() {
    // allow sidebar content to be set to 'contact' view for mobile
    this.setState({ view: 'contact' });
  }

  onTimezoneResponse(result) {
    const person = this.state.person;
    const time = result.time;
    const personHour = Number.parseInt(time.substr(11, 2), 10);
    const currentPersonTime =
      formatHourInCity(personHour,
        person[config.scopes.people.attributes.workCity]);
    this.setState({ currentPersonTime, error: undefined });
  }

  getTimezone(location) {
    const person = this.state.person;
    let currentPersonTime = 'No timezone information found.';

    if (location[config.scopes.people.attributes.latitude] &&
      location[config.scopes.people.attributes.longitude]) {
      const params = {
        lat: location[config.scopes.people.attributes.latitude],
        lng: location[config.scopes.people.attributes.longitude],
        username: GEONAMES_USERNAME,
      };
      const timeZoneHeader = { 'Accept': 'application/json' };
      const options = { method: 'GET', headers: timeZoneHeader, mode: 'cors' };
      const query = buildQuery(params);
      fetch(`http://api.geonames.org/timezoneJSON${query}`, options)
        .then(processStatus)
        .then(response => response.json())
        .then(this.onTimezoneResponse)
        .catch(error => this.setState({ currentPersonTime, error }));
    } else {
      // could not find latitude + longitude, or timeZone
      // properties from LDAP location query
      if (location.timeZone) {
        // fallback to using timeZone data from LDAP server
        // (which might not be taking DST into account)
        const personTimezone = location.timeZone;
        const personHour = getHourFromLDAPTimezone(personTimezone);
        // formatting timezone from LDAP
        const formattedPersonTimezone =
          `${personTimezone.substr(0, 3)}:${personTimezone.substr(3, 2)}`;
        currentPersonTime = formatHourInCity(personHour,
          person[config.scopes.people.attributes.workCity],
          formattedPersonTimezone);
      }

      this.setState({ currentPersonTime });
    }
  }

  render() {
    const appTitle = (
      <FormattedMessage id='People Finder' defaultMessage='People Finder' />
    );
    const person = this.state.person;

    let personTitle;
    if (person[config.scopes.people.attributes.title]) {
      personTitle =
        person[config.scopes.people.attributes.title].replace(/&amp;/g, '&');
    }

    let header;
    if (this.state.view !== 'contact') {
      header = (
        <Header size='large' pad={{ horizontal: 'medium' }} separator='bottom' justify='between'>
          <Title onClick={this.props.onClose} responsive={false}>
            <PeopleIcon />
            {appTitle}
          </Title>
          <Button icon={<SearchIcon />} onClick={this.props.onClose} />
        </Header>
      );
    }

    let boxDirection = 'row';
    let contactPad = 'none';
    let contactContentsPad = 'medium';

    if (this.state.responsive) {
      boxDirection = 'column';
      contactPad = { vertical: 'medium', between: 'medium' };
      contactContentsPad = { horizontal: 'medium' };
    }

    let phoneNode;
    const phone = person[config.scopes.people.attributes.telephoneNumber];
    if (!phone || phone === '+1') {
      phoneNode =
        <span className='secondary'>Phone number not available.</span>;
    } else {
      phoneNode = <Anchor href={`tel:${phone}`}>{phone}</Anchor>;
    }

    let image;
    if (person[config.scopes.people.attributes.picture]) {
      image = (
        <img
          className='avatar'
          src={person[config.scopes.people.attributes.picture] ||
            'img/no-picture.png'}
          alt='avatar'
        />
      );
    } else {
      image = <UserIcon size='large' />;
    }

    const contact = (
      <Article full='vertical'>
        {header}
        <Box direction={boxDirection} pad={contactPad} align='start' flex={false}>
          <Box pad={contactContentsPad}>
            {image}
          </Box>
          <Section pad={contactContentsPad}>
            <Heading tag='h1'>
              {person[config.scopes.people.attributes.name]}
            </Heading>
            <Paragraph margin='none'>{personTitle}</Paragraph>
            <Paragraph size='large' margin='small'>
              <Anchor
                href={`mailto:${person[config.scopes.people.attributes.id]}`}
              >
                {person[config.scopes.people.attributes.id]}
              </Anchor>
            </Paragraph>
            <Paragraph size='large' margin='small'>
              {phoneNode}
            </Paragraph>
            <Paragraph size='large' margin='small'>
              {this.state.currentPersonTime}
            </Paragraph>
          </Section>
        </Box>
        <Map
          title={person[config.scopes.people.attributes.workName]}
          street={person[config.scopes.people.attributes.workStreet]}
          city={person[config.scopes.people.attributes.workCity]}
          state={person[config.scopes.people.attributes.workState]}
          postalCode={person[config.scopes.people.attributes.workPostalCode]}
          country={person[config.scopes.people.attributes.workCountry]}
        />
      </Article>
    );

    let view;
    let viewLabel;
    if (this.state.view === 'details') {
      view = <Details person={person} />;
      viewLabel = <FormattedMessage id='Details' defaultMessage='Details' />;
    } else if (this.state.view === 'groups') {
      view = <PersonGroups person={person} onSelect={this.props.onSelect} />;
      viewLabel = <FormattedMessage id='Groups' defaultMessage='Groups' />;
    } else if (this.state.view === 'organization') {
      view = <Organization person={person} onSelect={this.props.onSelect} />;
      viewLabel = (
        <FormattedMessage id='Organization' defaultMessage='Organization' />
      );
    } else if (this.state.view === 'contact') {
      view = contact;
      viewLabel = 'Contact';
    }

    let contactAnchor;
    let viewHeader = <Heading tag='h3'>{viewLabel}</Heading>;
    if (this.state.responsive) {
      // on mobile, allow contact (main Person content) as a menu option
      // and show header with bolded viewLabel
      contactAnchor = (
        <Anchor
          className={this.state.view === 'contact' ? 'active' : undefined}
          onClick={this.onContact}
          label='Contact'
        />
      );
      viewHeader = (
        <Box
          direction='row'
          responsive={false}
          align='center'
          pad={{ between: 'small' }}
        >
          <Title onClick={this.props.onClose} responsive={false}>
            <PeopleIcon />
          </Title>
          <Heading tag='h3' strong={true}>{viewLabel}</Heading>
        </Box>
      );
    }

    return (
      <Split flex='both' separator={true}>
        {contact}
        <Box>
          <Header
            size='large'
            pad={{ horizontal: 'medium' }}
            justify='between'
            separator='bottom'
          >
            {viewHeader}
            <Menu label='Menu' dropAlign={{ right: 'right' }}>
              {contactAnchor}
              <Anchor
                className={this.state.view === 'organization' ? 'active' : undefined}
                onClick={this.onOrganization}
              >
                <FormattedMessage id='Organization' defaultMessage='Organization' />
              </Anchor>
              <Anchor
                className={this.state.view === 'details' ? 'active' : undefined}
                onClick={this.onDetails}
              >
                <FormattedMessage id='Details' defaultMessage='Details' />
              </Anchor>
              <Anchor
                className={this.state.view === 'groups' ? 'active' : undefined}
                onClick={this.onGroups}
              >
                <FormattedMessage id='Groups' defaultMessage='Groups' />
              </Anchor>
            </Menu>
          </Header>
          {view}
        </Box>
      </Split>
    );
  }
}

Person.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};
