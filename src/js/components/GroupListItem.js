// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import ListItem from 'grommet/components/ListItem';
import config from '../config';

const GroupListItem = (props) => {
  const { item, first } = props;
  return (
    <ListItem justify="between" pad="medium"
      align={'column' === props.direction ? 'start' : 'center'}
      direction={props.direction}
      onClick={props.onClick} separator={first ? 'horizontal' : 'bottom'}>
      <strong>{item[config.scopes.groups.attributes.id]}</strong>
      <span className="secondary">
        {item[config.scopes.groups.attributes.description]}
      </span>
    </ListItem>
  );
};

GroupListItem.propTypes = {
  direction: PropTypes.oneOf(['column', 'row']),
  first: PropTypes.bool,
  item: PropTypes.object,
  onClick: PropTypes.func
};

export default GroupListItem;
