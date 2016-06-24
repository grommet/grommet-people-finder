// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';

export default class GroupsIcon extends Component {

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
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g stroke={stroke} strokeWidth="4">
            <g transform="translate(14.000000, 22.000000)">
              <circle cx="50" cy="30" r="17"></circle>
              <path d="M66.9702681,32.4830353 L66.9702681,32.4830353 C69.1127229,33.4573248 71.4929871,34 74,34 C83.3888407,34 91,26.3888407 91,17 C91,7.61115925 83.3888407,0 74,0 C65.4350667,0 58.3495073,6.33395304 57.1718927,14.5732883"></path>
              <path d="M41.88165,14.9834841 C40.8843741,6.54511797 33.7065341,0 25,0 C15.6111593,0 8,7.61115925 8,17 C8,26.3888407 15.6111593,34 25,34 L25,34 C27.945553,34 30.7161359,33.2508642 33.1316163,31.9327252"></path>
              <path d="M25,84 L25,72 C25,58.1928813 36.1928813,47 50,47 C63.8071187,47 75,58.1928813 75,72 L75,84"></path>
              <path d="M75,34 C88.8071187,34 100,45.1928813 100,59 L100,71"></path>
              <path d="M0,71 L0,59 C0,45.1928813 11.1928813,34 25,34"></path>
              <path d="M63,84 L63,72"></path>
              <path d="M88,71 L88,59"></path>
              <path d="M14,71 L14,59"></path>
              <path d="M21,13 L21,1"></path>
              <path d="M31,13 L31,1"></path>
              <path d="M39,84 L39,72"></path>
              <path d="M2,13 L50,13"></path>
              <path d="M90.5,21 C90.5,21 82,19.4999997 78,13 C73.5,20.5 64.5,21 64.5,21"></path>
            </g>
          </g>
        </g>
      </svg>
    );
  }

};

GroupsIcon.propTypes = {
  reverse: PropTypes.bool
};
