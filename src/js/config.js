// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP
export function attributesToArray(attributes) {
  return Object.keys(attributes).map(attribute => attributes[attribute]);
}

const peopleAttributes = process.env.LDAP_PEOPLE_ATTRIBUTES ?
  JSON.parse(process.env.LDAP_PEOPLE_ATTRIBUTES) : {
    id: process.env.LDAP_PEOPLE_ATTRIBUTE_ID || 'uid',
    assistant: process.env.LDAP_PEOPLE_ATTRIBUTE_ASSISTANT || 'assistant',
    thumbnail: process.env.LDAP_PEOPLE_ATTRIBUTE_THUMBNAIL ||
      'pictureThumbnailURI',
    picture: process.env.LDAP_PEOPLE_ATTRIBUTE_PICTURE || 'pictureURI',
    name: process.env.LDAP_PEOPLE_ATTRIBUTE_NAME || 'cn',
    firstName: process.env.LDAP_PEOPLE_ATTRIBUTE_FIRST_NAME ||
      'givenName',
    lastName: process.env.LDAP_PEOPLE_ATTRIBUTE_LAST_NAME || 'sn',
    manager: process.env.LDAP_PEOPLE_ATTRIBUTE_MANAGER || 'manager',
    title: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_TITLE || 'title',
    telephoneNumber:
      process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_TELEPHONE_NUMBER ||
      'telephoneNumber',
    workName: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_NAME || 'workName',
    workLocation: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_LOCATION ||
      'workLocation',
    workCity: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_CITY || 'workCity',
    workStreet: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_STREET ||
      'workStreet',
    workCountry: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_COUNTRY ||
      'workCountry',
    workState: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_STATE ||
      'workState',
    workPostalCode: process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_POSTAL_CODE ||
      'workPostalCode',
  };

const groupAttributes = process.env.LDAP_GROUPS_ATTRIBUTES ?
  JSON.parse(process.env.LDAP_GROUPS_ATTRIBUTES) : {
    id: process.env.LDAP_GROUPS_ID || 'cn',
    description: process.env.LDAP_GROUPS_DESCRIPTION || 'description',
    owner: process.env.LDAP_GROUPS_OWNER || 'owner',
    mail: process.env.LDAP_GROUPS_MAIL || 'email',
    objectClass: process.env.LDAP_GROUPS_OBJECT_CLASS || 'groupOfNames',
  };

const locationAttributes = process.env.LDAP_LOCATIONS_ATTRIBUTES ?
  JSON.parse(process.env.LDAP_LOCATIONS_ATTRIBUTES) : {
    id: process.env.LDAP_LOCATIONS_ID || 'lid',
    name: process.env.LDAP_LOCATIONS_NAME || 'cn',
    address: process.env.LDAP_LOCATIONS_ADDRESS || 'postalAddress',
    postalCode: process.env.LDAP_LOCATIONS_POSTAL_CODE || 'postalCode',
    telephoneNumber: process.env.LDAP_LOCATIONS_TELEPHONE_NUMBER ||
      'telephoneNumber',
    category: process.env.LDAP_LOCATIONS_CATEGORY || 'category',
    street: process.env.LDAP_LOCATIONS_STREET || 'street',
    city: process.env.LDAP_LOCATIONS_CITY || 'l',
    state: process.env.LDAP_LOCATIONS_STATE || 'st',
    country: process.env.LDAP_LOCATIONS_COUNTRY || 'c',
    latitude: process.env.LDAP_LOCATIONS_LATITUDE || 'latitude',
    longitude: process.env.LDAP_LOCATIONS_LONGITUDE || 'longitude',
  };

export default {
  ldapBaseUrl: process.env.LDAP_URL || 'ldap://ldap.grommet.io',
  organization: process.env.LDAP_ORGANIZATION || 'grommet.io',
  scopes: {
    people: {
      label: process.env.LDAP_PEOPLE_LABEL || 'People',
      ou: process.env.LDAP_PEOPLE_OU || 'people',
      colorIndex: process.env.LDAP_PEOPLE_COLOR_INDEX || 'neutral-1',
      attributes: peopleAttributes,
      details: process.env.LDAP_PEOPLE_DETAILS ?
        JSON.parse(process.env.LDAP_PEOPLE_DETAILS) : {
          'Employment': [
            {
              attributeDisplayName: 'Employee Number',
              attributeField: 'employeeNumber',
            },
            {
              attributeDisplayName: 'Status',
              attributeField: 'status',
            },
          ],
          'Site': [
            {
              attributeDisplayName: 'Building',
              attributeField: 'workName',
            },
            {
              attributeDisplayName: 'Floor',
              attributeField: 'floor',
            },
          ],
        },
      filterForSearch: (searchText) => {
        // handle 'Last, First' syntax
        let queryText = searchText;
        if (queryText.indexOf(',') !== -1) {
          queryText = queryText.replace(/(.+),\s*(.+)/, '$2 $1');
        }

        // allow ldap query to search for first/given name and last/surname
        // to account for common names with middle initials
        let queryEnd = '*)))';
        const splitName = queryText.split(' ');
        if (splitName.length && splitName.length > 1) {
          const firstName = splitName[0];
          const lastName = splitName[splitName.length - 1];
          queryEnd = `*)(&|(${peopleAttributes.firstName}=${firstName}*)` +
            `(${peopleAttributes.lastName}=${lastName}*))))`;
        }

        return `(&(|(${peopleAttributes.name}=*${queryText}*)` +
          `(uid=*${queryText}${queryEnd}`;
      },
    },

    groups: {
      label: process.env.LDAP_GROUPS_LABEL || 'Groups',
      ou: process.env.LDAP_GROUPS_OU || 'groups',
      colorIndex: process.env.LDAP_GROUPS_COLOR_INDEX || 'neutral-2',
      attributes: groupAttributes,
      filterForSearch: searchText => `(${groupAttributes.id}=*${searchText}*)`,
    },

    locations: {
      label: process.env.LDAP_LOCATIONS_LABEL || 'Locations',
      ou: process.env.LDAP_LOCATIONS_OU || 'locations',
      colorIndex: process.env.LDAP_LOCATIONS_COLOR_INDEX || 'neutral-3',
      attributes: locationAttributes,
      filterForSearch: (searchText) => {
        const queryText = searchText.replace(/\s+/g, '*');
        return `(|(${locationAttributes.name}=*${queryText}*)` +
          `(${locationAttributes.city}=*${queryText}*))`;
      },
    },
  },
};
