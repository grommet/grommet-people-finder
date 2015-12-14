// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var React = require('react');
var ReactIntl = require('react-intl');
var FormattedMessage = ReactIntl.FormattedMessage;
var Header = require('grommet/components/Header');
var Menu = require('grommet/components/Menu');
var Anchor = require('grommet/components/Anchor');
var Footer = require('grommet/components/Footer');
var Title = require('grommet/components/Title');
var Search = require('grommet/components/Search');
var Section = require('grommet/components/Section');
var Paragraph = require('grommet/components/Paragraph');
var Box = require('grommet/components/Box');
var Logo = require('./Logo');
var config = require('../config');

var Finder = React.createClass({

  propTypes: {
    initial: React.PropTypes.bool.isRequired,
    onScope: React.PropTypes.func.isRequired,
    onSearch: React.PropTypes.func.isRequired,
    scope: React.PropTypes.object.isRequired,
    searchText: React.PropTypes.string.isRequired
  },

  contextTypes: {
    intl: React.PropTypes.object.isRequired
  },

  componentDidMount: function () {
    this.refs.search.focus();
  },

  componentDidUpdate: function () {
    this.refs.search.focus();
  },

  _onScope: function (scope) {
    this.props.onScope(scope);
  },

  render: function() {

    var titleLabel = this.props.scope.label + " Finder";
    var title = (
      <FormattedMessage id={titleLabel} defaultMessage={titleLabel} />
    );

    var texture;
    var colorIndex = this.props.scope.colorIndex;
    var footer;

    if (this.props.initial) {
      texture = "url(img/people-finder-background.jpg)";
      colorIndex = "neutral-1-a";
      footer = (
        <Footer float={true} colorIndex="grey-3-a"
          pad={{vertical: "small", horizontal: "medium"}}>
          <img src="img/hpesm_pri_grn_rev_rgb.svg" alt="logo" className="logo" />
          <Box className="flex" align="end">
            <Paragraph size="small">© Copyright 2015 Hewlett Packard Enterprise Development LP</Paragraph>
          </Box>
        </Footer>
      );
    }

    var scopeAnchors = Object.keys(config.scopes).map(function (key) {
      var scope = config.scopes[key];
      return (
        <Anchor key={key} onClick={this._onScope.bind(this, scope)}>
          <FormattedMessage id={scope.label} defaultMessage={scope.label} />
        </Anchor>
      );
    }.bind(this));

    return (
      <Section texture={texture} full={true} pad="none">
        <Header key="header" large={true} pad={{horizontal: "medium"}}
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

});

module.exports = Finder;
