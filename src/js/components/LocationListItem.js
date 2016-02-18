// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import ListItem from 'grommet/components/ListItem';

const LocationListItem = (props) => {
  const { item } = props;
  return (
    <ListItem justify="between" align="center" pad="medium"
      onClick={props.onClick}>
      <strong>{item.buildingName}</strong>
      <span className="secondary">{item.l}</span>
    </ListItem>
  );
};

LocationListItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func
};

export default LocationListItem;
