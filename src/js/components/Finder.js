// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Footer from 'grommet/components/Footer';
import Search from 'grommet/components/Search';
import Section from 'grommet/components/Section';
import Label from 'grommet/components/Label';
import Box from 'grommet/components/Box';
import GrommetLogo from 'grommet/components/icons/Grommet';
import FavoriteLogo from 'grommet/components/icons/base/Favorite';
import PeopleIcon from './icons/PeopleIcon';
import GroupsIcon from './icons/GroupsIcon';
import LocationsIcon from './icons/LocationsIcon';
import config from '../config';

export default class Finder extends Component {
  constructor() {
    super();
    this.onScope = this.onScope.bind(this);
    this.onSearchDOMChange = this.onSearchDOMChange.bind(this);
  }

  componentDidMount() {
    findDOMNode(this.searchRef).focus();
  }

  componentDidUpdate() {
    findDOMNode(this.searchRef).focus();
  }

  onScope(scope) {
    this.props.onScope(scope);
  }

  onSearchDOMChange(event) {
    this.props.onSearch(event.target.value);
  }

  render() {
    let texture;
    let footer;
    let colorIndex = this.props.scope.colorIndex;
    const currentScope = this.props.scope.ou;
    let currentIcon;

    if (currentScope === 'groups') {
      currentIcon = <GroupsIcon reverse={true} />;
    } else if (currentScope === 'locations') {
      currentIcon = <LocationsIcon reverse={true} />;
    } else {
      currentIcon = <PeopleIcon reverse={true} />;
    }

    // use a random background image
    const imageIndex = ((new Date()).getTime() % 4) + 1;

    if (this.props.initial) {
      texture = `url(img/people-finder-background-${imageIndex}.jpg)`;
      colorIndex = 'neutral-1-a';
      footer = (
        <Footer
          float={true}
          colorIndex='grey-3-a'
          pad={{ vertical: 'small', horizontal: 'medium', between: 'medium' }}
          wrap={true}
          direction='row'
          justify='between'
          align='center'
        >
          <Box pad={{ vertical: 'small' }}>
            <GrommetLogo />
          </Box>
          <Box
            direction='row'
            align='center'
            responsive={false}
            pad={{ between: 'small' }}
          >
            <Label size='small' margin='none'>Made with</Label>
            <FavoriteLogo />
            <Label size='small' margin='none'>by the</Label>
            <Anchor href='http://grommet.io' target='_blank'>
              Grommet team</Anchor>
          </Box>
        </Footer>
      );
    }

    const scopeAnchors = Object.keys(config.scopes).map((key) => {
      const scope = config.scopes[key];
      return (
        <Anchor key={key} onClick={() => this.onScope(scope)}>
          <FormattedMessage id={scope.label} defaultMessage={scope.label} />
        </Anchor>
      );
    });

    return (
      <Section texture={texture} full={true} pad='none'>
        <Header
          key='header'
          size='large'
          pad={{ horizontal: 'medium', between: 'small' }}
          float={this.props.initial}
          colorIndex={colorIndex}
          splash={this.props.initial}
          responsive={false}
          justify='between'
        >
          <Menu
            inline={false}
            icon={currentIcon}
            dropColorIndex={colorIndex}
          >
            {scopeAnchors}
          </Menu>
          <Search
            ref={(ref) => {
              this.searchRef = ref;
            }}
            inline={true}
            responsive={false}
            fill={true}
            size='medium'
            placeHolder='Search'
            defaultValue={this.props.searchText}
            onDOMChange={this.onSearchDOMChange}
          />
        </Header>
        {this.props.children}
        {footer}
      </Section>
    );
  }
}

Finder.propTypes = {
  initial: PropTypes.bool.isRequired,
  onScope: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  scope: PropTypes.object.isRequired,
  searchText: PropTypes.string.isRequired,
};

Finder.contextTypes = {
  intl: PropTypes.object.isRequired,
};
