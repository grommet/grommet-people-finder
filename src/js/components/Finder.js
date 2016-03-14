// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import Section from 'grommet/components/Section';
import Paragraph from 'grommet/components/Paragraph';
import Box from 'grommet/components/Box';
import Logo from './Logo';
import config from '../config';

export default class Finder extends Component {

  componentDidMount () {
    this.refs.search.focus();
  }

  componentDidUpdate () {
    this.refs.search.focus();
  }

  _onScope (scope) {
    this.props.onScope(scope);
  }

  render () {

    const titleLabel = `${this.props.scope.label} Finder`;
    const title = (
      <FormattedMessage id={titleLabel} defaultMessage={titleLabel} />
    );

    let texture;
    let colorIndex = this.props.scope.colorIndex;
    let footer;

    if (this.props.initial) {
      texture = "url(img/people-finder-background.jpg)";
      colorIndex = "neutral-1-a";
      footer = (
        <Footer float={true} colorIndex="grey-3-a"
          pad={{vertical: "small", horizontal: "medium"}}>
          <img src="img/hpesm_pri_grn_rev_rgb.svg" alt="logo" className="logo" />
          <Box className="flex" align="end">
            <Paragraph size="small">© Copyright
              2015 Hewlett Packard Enterprise Development LP</Paragraph>
          </Box>
        </Footer>
      );
    }

    var scopeAnchors = Object.keys(config.scopes).map(key => {
      const scope = config.scopes[key];
      return (
        <Anchor key={key} onClick={this._onScope.bind(this, scope)}>
          <FormattedMessage id={scope.label} defaultMessage={scope.label} />
        </Anchor>
      );
    });

    return (
      <Section texture={texture} full={true} pad="none">
        <Header key="header" large={true}
          pad={{horizontal: "medium", between: "small"}}
          float={this.props.initial}
          colorIndex={colorIndex} splash={this.props.initial} responsive={false}>
          <Title>
            <Logo reverse={true} />
            {title}
          </Title>
          <Search ref="search" inline={true} className="flex"
            placeHolder="Search"
            defaultValue={this.props.searchText}
            onChange={this.props.onSearch} />
          <Menu inline={false} dropColorIndex={colorIndex} dropAlign={{right: "right"}}>
            {scopeAnchors}
          </Menu>
        </Header>
        {this.props.children}
        {footer}
      </Section>
    );
  }

};

Finder.propTypes = {
  initial: PropTypes.bool.isRequired,
  onScope: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  scope: PropTypes.object.isRequired,
  searchText: PropTypes.string.isRequired
};

Finder.contextTypes = {
  intl: PropTypes.object.isRequired
};
