// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React from 'react';
import PropTypes from 'prop-types';
import ListItem from 'grommet/components/ListItem';
import config from '../config';

const LocationListItem = (props) => {
  const { item } = props;
  return (
    <ListItem
      justify='between'
      align='center'
      pad='medium'
      onClick={props.onClick}
    >
      <strong>{item[config.scopes.locations.attributes.name]}</strong>
      <span className='secondary'>
        {item[config.scopes.locations.attributes.city]}
      </span>
    </ListItem>
  );
};

LocationListItem.defaultProps = {
  item: undefined,
  onClick: undefined,
};

LocationListItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
};

export default LocationListItem;
