// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Title from 'grommet/components/Title';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Paragraph from 'grommet/components/Paragraph';
import Button from 'grommet/components/Button';
import Anchor from 'grommet/components/Anchor';
import SearchIcon from 'grommet/components/icons/base/Search';
import LocationsIcon from './icons/LocationsIcon';
import Map from './Map';
import config from '../config';

export default class LocationComponent extends Component {
  constructor() {
    super();
    this.state = { location: {}, scope: config.scopes.locations };
  }

  componentDidMount() {
    this.getLocation(this.props.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this.getLocation(nextProps.id);
    }
  }

  getLocation(id) {
    const params = {
      url: config.ldapBaseUrl,
      base: `ou=${this.state.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter: `(${config.scopes.locations.attributes.id}=${id})`,
    };
    const options = { method: 'GET', headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(result => this.setState({ location: result[0], error: undefined }))
      .catch(error => this.setState({ location: {}, error }));
  }

  render() {
    const appTitle = (
      <FormattedMessage
        id='Locations Finder'
        defaultMessage='Locations Finder'
      />
    );
    const loc = this.state.location;
    let address;
    const postalAddress = loc[config.scopes.locations.attributes.address];
    if (postalAddress) {
      address = postalAddress.split(/ \$ /).map(e => (<div key={e}>{e}</div>));
    }

    let map;
    if (loc[config.scopes.locations.attributes.country]) {
      map = (
        <Map
          title={
            loc[config.scopes.locations.attributes.category] ||
            loc[config.scopes.locations.attributes.name]
          }
          street={loc[config.scopes.locations.attributes.street]}
          city={loc[config.scopes.locations.attributes.city]}
          state={loc[config.scopes.locations.attributes.state]}
          postalCode={loc[config.scopes.locations.attributes.postalCode]}
          country={loc[config.scopes.locations.attributes.country]}
        />
      );
    }

    // NOTE: ED latitude and longitude aren't accurate.
    // Removed the following from Map use:
    // latitude={loc.latitude} longitude={loc.longitude}

    return (
      <Article>
        <Header
          size='large'
          pad={{ horizontal: 'medium' }}
          separator='bottom'
          justify='between'
        >
          <Title onClick={this.props.onClose} responsive={false}>
            <LocationsIcon />
            {appTitle}
          </Title>
          <Button icon={<SearchIcon />} onClick={this.props.onClose} />
        </Header>
        <Section pad='medium'>
          <Header justify='between'>
            <Heading tag='h1'>
              {loc[config.scopes.locations.attributes.name]}
            </Heading>
            <Heading tag='h1' className='secondary'>
              {loc[config.scopes.locations.attributes.id]}
            </Heading>
          </Header>
          <address>{address}</address>
          <Heading tag='h3'>
            <Anchor
              href={`tel:${loc[config.scopes.locations.attributes.telephoneNumber]}`}
            >
              {loc[config.scopes.locations.attributes.telephoneNumber]}
            </Anchor>
          </Heading>
          <Paragraph>
            {loc[config.scopes.locations.attributes.category]}
          </Paragraph>
        </Section>
        {map}
      </Article>
    );
  }
}

LocationComponent.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
