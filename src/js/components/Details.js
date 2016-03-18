// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Rest from 'grommet/utils/Rest';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Heading from 'grommet/components/Heading';
import Attribute from 'grommet/components/Attribute';
import config from '../config';

export default class Details extends Component {

  constructor () {
    super();
    this._onAssistantResponse = this._onAssistantResponse.bind(this);
    this._getAssistant = this._getAssistant.bind(this);
    this.state = {assistant: {}};
  }

  componentDidMount () {
    const assistant = this.props.person.hpAdmin;
    if (assistant) {
      this._getAssistant(assistant);
    }
  }

  _renderAttribute (label, value, valueCode) {
    let result;

    if (value) {
      if (valueCode) {
        value += ` (${valueCode})`;
      }
    } else {
      value = 'N/A';
    }

    result = <Attribute label={label}>{value}</Attribute>;

    return result;
  }

  _onAssistantResponse (err, res) {
    if (err) {
      this.setState({assistant: {}, error: err});
    } else if (res.ok) {
      const result = res.body;
      this.setState({assistant: result[0], error: null});
    }
  }

  _getAssistant (assistantDn) {
    const params = {
      url: encodeURIComponent(config.ldap_base_url),
      base: assistantDn,
      scope: 'sub'
    };
    Rest.get('/ldap/', params).end(this._onAssistantResponse);
  }

  render () {
    const { person } = this.props;
    let assistant;

    if (this.state.assistant) {
      assistant = this.state.assistant.cn;
    }

    return (
      <Article pad={{horizontal: 'medium'}}>
        <Section>
          <Heading strong={true} tag="h3">Employment</Heading>
          {this._renderAttribute("Employee Number", person.employeeNumber)}
          {this._renderAttribute("Status", person.hpStatus)}
          {this._renderAttribute("Job Function", person.hpJobFunction, person.hpJobFunctionCode)}
          {this._renderAttribute("Job Family", person.hpJobFamily, person.hpJobFamilyCode)}
          {this._renderAttribute("Employee Type", person.employeeType, person.hpSplitCompany)}
          {this._renderAttribute("Start Date", person.hpStartDate)}
          {this._renderAttribute("Payroll Country Code", person.hpPayrollCountryCode)}
          {this._renderAttribute("NT User ID", person.ntUserDomainId)}
          {this._renderAttribute("Radius ID", person.hpRadiusID)}
          {this._renderAttribute("Routing Address", person.mailRoutingAddress)}
        </Section>
        <Section>
          <Heading strong={true} tag="h3" separator="top">Site</Heading>
          {this._renderAttribute("Building", person.buildingName)}
          {this._renderAttribute("Floor", person.hpFloor)}
          {this._renderAttribute("Post", person.hpPost)}
          {this._renderAttribute("Mailstop", person.mailStop)}
        </Section>
        <Section>
          <Heading strong={true} tag="h3" separator="top">Administration</Heading>
          {this._renderAttribute("Assistant", assistant)}
          {this._renderAttribute("Location Code", person.hpLocationCode)}
          {this._renderAttribute("Lighthouse Cost Center", person.hpLHCostCenter)}
          {this._renderAttribute("Business Region", person.hpBusinessRegion, person.hpBusinessRegionAcronym)}
          {this._renderAttribute("Business Group", person.hpBusinessGroup, person.hpBusinessGroupAcronym)}
          {this._renderAttribute("Business Unit", person.hpBusinessUnit, person.hpBusinessUnitAcronym)}
          {this._renderAttribute("Organization Chart", person.hpOrganizationChart, person.hpOrganizationChartAcronym)}
          {this._renderAttribute("MRU", person.ou, person.hpMRUCode)}
          {this._renderAttribute("Global ID", person.hpGlobalID)}
        </Section>
      </Article>
    );
  }

};

Details.propTypes = {
  person: PropTypes.object.isRequired
};
