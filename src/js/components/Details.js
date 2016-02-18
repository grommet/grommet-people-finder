// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Heading from 'grommet/components/Heading';
import Attribute from 'grommet/components/Attribute';

export default class Details extends Component {

  _renderAttribute (label, value) {
    let result;
    if (value) {
      result = <Attribute label={label}>{value}</Attribute>;
    }
    return result;
  }

  render () {
    const { person } = this.props;
    return (
      <Article pad={{horizontal: 'medium'}}>
        <Section>
          <Heading tag="h3">Employment</Heading>
          {this._renderAttribute("Status", person.hpStatus)}
          {this._renderAttribute("Job Function", person.hpJobFunction)}
          {this._renderAttribute("Job Family", person.hpJobFamily)}
          {this._renderAttribute("Employee Type", person.employeeType)}
          {this._renderAttribute("Payroll Country Code", person.hpPayrollCountryCode)}
          {this._renderAttribute("NT User ID", person.ntUserDomainId)}
        </Section>
        <Section>
          <Heading tag="h3" separator="top">Site</Heading>
          {this._renderAttribute("Building", person.buildingName)}
          {this._renderAttribute("Floor", person.hpFloor)}
          {this._renderAttribute("Post", person.hpPost)}
          {this._renderAttribute("Mailstop", person.mailStop)}
        </Section>
        <Section>
          <Heading tag="h3" separator="top">Administration</Heading>
          {this._renderAttribute("Location Code", person.hpLocationCode)}
          {this._renderAttribute("Lighthouse Cost Center", person.hpLHCostCenter)}
          {this._renderAttribute("MRU Code", person.hpMRUCode)}
          {this._renderAttribute("Global ID", person.hpGlobalID)}
        </Section>
      </Article>
    );
  }

};

Details.propTypes = {
  person: PropTypes.object.isRequired
};
