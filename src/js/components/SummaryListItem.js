// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import NextIcon from 'grommet/components/icons/base/LinkNext';

const SummaryListItem = (props) => {
  const { scope, searchText, first } = props;
  return (
    <ListItem pad={{horizontal: 'medium', vertical: 'small', between: 'small'}}
      separator={first ? 'horizontal' : 'bottom'} onClick={props.onClick}>
      <Box pad="small">
        <NextIcon />
      </Box>
      <FormattedMessage id={`${scope.label} matching`}
        defaultMessage={`${scope.label} matching`}
        values={{search: searchText}} />
    </ListItem>
  );
};

SummaryListItem.propTypes = {
  first: PropTypes.bool,
  scope: PropTypes.object,
  searchText: PropTypes.string,
  onClick: PropTypes.func
};

export default SummaryListItem;
