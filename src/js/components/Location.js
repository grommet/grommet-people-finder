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
import Logo from './Logo';
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
      url: config.ldap_base_url,
      base: `ou=${this.state.scope.ou},o=${config.organization}`,
      scope: 'sub',
      filter: `(hpRealEstateID=${id})`
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
    if (loc.postalAddress) {
      address = loc.postalAddress.split(/ \$ /).map((e, index) =>
        (<div key={index}>{e}</div>));
    }

    // NOTE: ED latitude and longitude aren't accurate. Removed the following from Map use:
    // latitude={loc.latitude} longitude={loc.longitude}

    return (
      <Article>
        <Header large={true} pad={{horizontal: "medium"}} separator="bottom"
          justify="between">
          <Title onClick={this.props.onClose} responsive={false}>
            <Logo />
            {appTitle}
          </Title>
          <Button icon={<SearchIcon />} onClick={this.props.onClose} />
        </Header>
        <Section pad="medium">
          <Header tag="h1" justify="between">
            <span>{loc.buildingName}</span>
            <span className="secondary">{loc.hpRealEstateID}</span>
          </Header>
          <address>{address}</address>
          <h3><a href={"tel:" + loc.telephoneNumber}>{loc.telephoneNumber}</a></h3>
          <p>{loc.businessCategory}</p>
        </Section>
        <Map title={loc.businessCategory || loc.buildingName}
          street={loc.street} city={loc.l} state={loc.st} country={loc.c} />
      </Article>
    );
  }

};

LocationComponent.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};
