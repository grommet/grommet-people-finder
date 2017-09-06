// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React from 'react';
import PropTypes from 'prop-types';
import ListItem from 'grommet/components/ListItem';
import config from '../config';

const GroupListItem = (props) => {
  const { item, first } = props;
  return (
    <ListItem
      justify='between'
      pad='medium'
      align={props.direction === 'column' ? 'start' : 'center'}
      direction={props.direction}
      onClick={props.onClick}
      separator={first ? 'horizontal' : 'bottom'}
    >
      <strong>{item[config.scopes.groups.attributes.id]}</strong>
      <span className='secondary'>
        {item[config.scopes.groups.attributes.description]}
      </span>
    </ListItem>
  );
};

GroupListItem.defaultProps = {
  direction: undefined,
  first: undefined,
  item: undefined,
  onClick: undefined,
};

GroupListItem.propTypes = {
  direction: PropTypes.oneOf(['column', 'row']),
  first: PropTypes.bool,
  item: PropTypes.object,
  onClick: PropTypes.func,
};

export default GroupListItem;
