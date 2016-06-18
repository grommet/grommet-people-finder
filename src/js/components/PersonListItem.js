// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import Image from 'grommet/components/Image';
import UserIcon from 'grommet/components/icons/base/User';
import config from '../config';

const PersonListItem = (props) => {
  const { item, first } = props;
  let thumbnail;
  if (item[config.scopes.people.attributes.thumbnail]) {
    thumbnail = (
      <Image size="thumb" mask={true}
        src={item[config.scopes.people.attributes.thumbnail]} />
    );
  } else {
    thumbnail = <UserIcon size="large" />;
  }
  return (
    <ListItem justify="between" onClick={props.onClick}
      pad={{horizontal: 'medium', vertical: 'small', between: 'medium'}}
      separator={first ? 'horizontal' : 'bottom'}
      colorIndex={props.colorIndex}>
      <Box pad={{between: 'small'}} direction="row" align="center"
        responsive={false} className="flex">
        {thumbnail}
        <span>{item[config.scopes.people.attributes.name]}</span>
      </Box>
      <span className="secondary">
        {item[config.scopes.people.attributes.workName]}
      </span>
    </ListItem>
  );
};

PersonListItem.propTypes = {
  colorIndex: PropTypes.string,
  first: PropTypes.bool,
  item: PropTypes.object,
  onClick: PropTypes.func
};

export default PersonListItem;
