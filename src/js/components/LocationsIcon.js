// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';

export default class LocationsIcon extends Component {

  render () {
    let className = 'logo-icon';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    let stroke = '#00B388';
    if (this.props.reverse) {
      stroke = '#ffffff';
    }

    return (
      <svg className={className} viewBox="0 0 130 108" version="1.1">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinejoin="round">
          <g stroke={stroke} strokeWidth="4">
            <path d="M40,65 L40,96 L16,107 L16,49 L16,49 L28.4679195,43.2855369 M75.6892892,43.6424091 L88,38 L88,96 L64,107 L64,64.5 L64,64.5 M64,64 L64,107 L40,96 L40,65 M89,38 L113,49 L113,107 L89,96 L89,38 Z M52,49 C56.971,49 61,44.971 61,40 C61,35.029 56.971,31 52,31 C47.029,31 43,35.029 43,40 C43,44.971 47.029,49 52,49 L52,49 Z M52,76 C52,76 28,58 28,40 C28,25 40,16 52,16 C64,16 76,25 76,40 C76,58 52,76 52,76 Z"></path>
          </g>
        </g>
      </svg>
    );
  }

};

LocationsIcon.propTypes = {
  reverse: PropTypes.bool
};
