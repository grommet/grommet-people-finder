// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { headers, buildQuery, processStatus } from 'grommet/utils/Rest';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import Label from 'grommet/components/Label';
import config from '../config';

const peopleScope = config.scopes.people;

const Attribute = ({ children, label }) => (
  <Box>
    <Label size='small'>{label}</Label>
    {children}
  </Box>
);

function renderAttribute(label, value, valueCode) {
  let content = 'N/A';
  if (value) {
    content = value;
    if (valueCode) {
      content += ` (${valueCode})`;
    }
  }
  return (
    <Attribute label={label}>
      {content}
    </Attribute>
  );
}

export default class Details extends Component {
  constructor() {
    super();
    this.getAssistant_getAssistant = this.getAssistant.bind(this);
    this.state = { assistant: {} };
  }

  componentDidMount() {
    if (peopleScope.attributes.assistant) {
      const assistant = this.props.person[peopleScope.attributes.assistant];
      if (assistant && assistant.length > 0) {
        this.getAssistant(assistant);
      }
    }
  }

  getAssistant(assistantDn) {
    const params = {
      url: config.ldapBaseUrl,
      base: assistantDn,
      scope: 'sub',
    };
    const options = { method: 'GET', headers };
    const query = buildQuery(params);
    fetch(`/ldap/${query}`, options)
      .then(processStatus)
      .then(response => response.json())
      .then(result => this.setState({ assistant: result[0], error: undefined }))
      .catch(error => this.setState({ assistant: {}, error }));
  }

  render() {
    const { person } = this.props;
    let assistant;

    if (this.state.assistant) {
      assistant = (
        <Section>
          <Heading strong={true} tag='h3' separator='top'>Assistant</Heading>
          {renderAttribute('', this.state.assistant[peopleScope.attributes.name])}
        </Section>
      );
    }

    let sections;
    if (config.scopes.people.details) {
      const details = config.scopes.people.details;
      sections = Object.keys(details).map((key) => {
        const attributes = details[key].map(attribute => renderAttribute(
          attribute.attributeDisplayName, person[attribute.attributeField]
        ), this);
        return (
          <Section key={`section_${key}`}>
            <Heading strong={true} tag='h3'>{key}</Heading>
            {attributes}
          </Section>
        );
      });
    }

    return (
      <Article pad={{ horizontal: 'medium' }}>
        {sections}
        {assistant}
      </Article>
    );
  }
}

Details.propTypes = {
  person: PropTypes.object.isRequired,
};
