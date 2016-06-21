// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Heading from 'grommet/components/Heading';
import Attribute from 'grommet/components/Attribute';
import config from '../config';

const peopleScope = config.scopes.people;

export default class Details extends Component {

  constructor () {
    super();
    this._getAssistant = this._getAssistant.bind(this);
    this.state = {assistant: undefined};
  }

  componentDidMount () {
    if (peopleScope.attributes.assistant) {
      const assistant = this.props.person[peopleScope.attributes.assistant];
      if (assistant && assistant.length > 0) {
        this._getAssistant(assistant);
      }
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

    result = (
      <Attribute key={`${label}${value}`} label={label}>
        {value}
      </Attribute>
    );

    return result;
  }

  _getAssistant (assistantDn) {
    const params = {
      url: config.ldapBaseUrl,
      base: assistantDn,
      scope: 'sub'
    };
    const options = { method: 'GET', headers: headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
    .then(processStatus)
    .then(response => response.json())
    .then(result => this.setState({assistant: result[0], error: undefined}))
    .catch(error => this.setState({assistant: {}, error: error}));
  }

  render () {
    const { person } = this.props;
    let assistant;

    if (this.state.assistant) {
      assistant = (
        <Section>
          <Heading strong={true} tag="h3" separator="top">Assistant</Heading>
          {this._renderAttribute("", this.state.assistant[peopleScope.attributes.name])}
        </Section>
      );
    }

    let sections;
    if (config.scopes.people.details) {
      const details = config.scopes.people.details;
      sections = Object.keys(details).map((key, sIndex) => {
        const attributes = details[key].map((attribute) => {
          return (
            this._renderAttribute(
              attribute.attributeDisplayName, person[attribute.attributeField]
            )
          );
        }, this);
        return (
          <Section key={`section_${sIndex}`}>
            <Heading strong={true} tag="h3">{key}</Heading>
            {attributes}
          </Section>
        );
      });
    }

    return (
      <Article pad={{horizontal: 'medium'}}>
        {sections}
        {assistant}
      </Article>
    );
  }

};

Details.propTypes = {
  person: PropTypes.object.isRequired
};
