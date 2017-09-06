// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP
/* eslint-disable max-len, react/self-closing-comp */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SVGIcon from 'grommet/components/SVGIcon';

export default class PeopleIcon extends Component {
  render() {
    const { className, reverse } = this.props;
    const stroke = reverse ? '#ffffff' : '#865CD6';

    return (
      <SVGIcon
        className={className}
        viewBox='0 0 128 128'
        version='1.1'
        type='logo'
        a11yTitle='People Icon'
      >
        <g stroke={stroke} strokeWidth='4' fill='none'>
          <rect x='14' y='40' width='100' height='66' rx='4' />
          <circle cx='64' cy='31' r='2' />
          <path d='M35.5,95 L35.5,91 M46.5,95 L46.5,91 M28,95 L28,90.7183099 C28,83.4374856 33.8202983,79 41,79 C48.1797017,79 54,83.4374856 54,90.7183099 L54,95 M41,79 C45.418278,79 49,75.418278 49,71 C49,66.581722 45.418278,63 41,63 C36.581722,63 33,66.581722 33,71 C33,75.418278 36.581722,79 41,79 Z' />
          <path d='M64,83 L79,83' />
          <path d='M64,74 L88,74' />
          <path d='M64,93 L93,93' />
          <path d='M64,63 L100,63' />
          <path d='M73,22 L73,46.0029953 C73,47.1059106 72.1073772,48 71.0049107,48 L56.9950893,48 C55.8932319,48 55,47.1050211 55,46.0029953 L55,22 L73,22 Z' />
        </g>
      </SVGIcon>
    );
  }
}

PeopleIcon.defaultProps = {
  reverse: undefined,
};

PeopleIcon.propTypes = {
  reverse: PropTypes.bool,
};
