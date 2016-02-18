// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import Image from 'grommet/components/Image';

const PersonListItem = (props) => {
  const { item, first } = props;
  return (
    <ListItem justify="between" onClick={props.onClick}
      pad={{horizontal: 'medium', vertical: 'small', between: 'medium'}}
      separator={first ? 'horizontal' : 'bottom'}>
      <Box pad={{between: 'small'}} direction="row" align="center"
        responsive={false} className="flex">
        <Image size="thumb"
          src={item.hpPictureThumbnailURI ||  "img/no-picture.png"} />
        {item.cn}
      </Box>
      <span className="secondary">{item.hpBusinessUnit}</span>
    </ListItem>
  );
};

PersonListItem.propTypes = {
  first: PropTypes.bool,
  item: PropTypes.object,
  onClick: PropTypes.func
};

export default PersonListItem;
