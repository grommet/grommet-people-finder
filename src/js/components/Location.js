// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Button from 'grommet/components/Button';
import SearchIcon from 'grommet/components/icons/base/Search';
import LocationsIcon from './LocationsIcon';
import Map from './Map';
import config from '../config';

export default class LocationComponent extends Component {

  constructor () {
    super();
    this.state = {location: {}, scope: config.scopes.locations};
  }

  componentDidMount () {
    this._getLocation(this.props.id);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._getLocation(nextProps.id);
    }
  }

  _getLocation (id) {
    const params = {
      url: config.ldapBaseUrl,
      base: `ou=${this.state.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter: `(${config.scopes.locations.attributes.id}=${id})`
    };
    const options = { method: 'GET', headers: headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
    .then(processStatus)
    .then(response => response.json())
    .then(result => this.setState({location: result[0], error: null}))
    .catch(error => this.setState({location: {}, error: error}));
  }

  render () {
    const appTitle = (
      <FormattedMessage id="Locations Finder" defaultMessage="Locations Finder" />
    );
    const loc = this.state.location;
    let address;
    const postalAddress = loc[config.scopes.locations.attributes.address];
    if (postalAddress) {
      address = postalAddress.split(/ \$ /).map((e, index) =>
        (<div key={index}>{e}</div>));
    }

    let map;
    if (loc[config.scopes.locations.attributes.country]) {
      map = (
        <Map title={loc[config.scopes.locations.attributes.category] || loc[config.scopes.locations.attributes.name]}
          street={loc[config.scopes.locations.attributes.street]}
          city={loc[config.scopes.locations.attributes.city]}
          state={loc[config.scopes.locations.attributes.state]}
          postalCode={loc[config.scopes.locations.attributes.postalCode]}
          country={loc[config.scopes.locations.attributes.country]} className="flex" />
      );
    }

    // NOTE: ED latitude and longitude aren't accurate. Removed the following from Map use:
    // latitude={loc.latitude} longitude={loc.longitude}

    return (
      <Article full={true}>
        <Header large={true} pad={{horizontal: "medium"}} separator="bottom"
          justify="between">
          <Title onClick={this.props.onClose} responsive={false}>
            <LocationsIcon />
            {appTitle}
          </Title>
          <Button icon={<SearchIcon />} onClick={this.props.onClose} />
        </Header>
        <Section pad="medium">
          <Header tag="h1" justify="between">
            <span>{loc[config.scopes.locations.attributes.name]}</span>
            <span className="secondary">
              {loc[config.scopes.locations.attributes.id]}
            </span>
          </Header>
          <address>{address}</address>
          <h3><a href={"tel:" + loc[config.scopes.locations.attributes.telephoneNumber]}>
            {loc[config.scopes.locations.attributes.telephoneNumber]}
          </a></h3>
          <p>{loc[config.scopes.locations.attributes.category]}</p>
        </Section>
        {map}
      </Article>
    );
  }

};

LocationComponent.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};
