# grommet-people-finder

[![Build Status](https://travis-ci.org/grommet/grommet-people-finder.svg?branch=master)](https://travis-ci.org/grommet/grommet-people-finder)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/grommet/grommet-people-finder/tree/heroku)

Connects with a LDAP server to display and search for People, Locations, and Groups of a given organization.

The LDAP attributes are configurable so that you can use this app with your existing LDAP rather easily.

If your existing LDAP structure is close to ours, it is possible you would only need to replace few environment variables here and there and use this app without much changes. If your application needs more features or the structure is different, we believe you are better off forking this app and applying the changes separately. 

If you don't have a LDAP server yet, you can refer to [grommet-ldap-server](https://github.com/grommet/grommet-ldap-server) for an example server that is in fact the one being used in this app.

## Demo

[Live demo](http://peoplefinder.grommet.io) of the Grommet PeopleFinder application.  Try searching for "Alan", "Bryan", "Eric", "Chris", or "Tracy".

## Usage

To run this application, execute the following commands:

  1. Install people-finder
    ```
    $ npm install
    ```

  2. Start development server
    ```
    $ gulp dev
    ```

  3. Create the app distribution to be used by the back-end server

    ```
    $ gulp dist
    ```

## Configuration

All configuration resides inside [config.js](https://github.com/grommet/grommet-people-finder/blob/master/src/js/config.js) file, there are three scopes: People, Locations, and Groups. The base-level configuration is:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|ldapBaseUrl | required. ldap url. Defaults to "ldap://ldap.grommet.io" | process.env.LDAP_URL |
|organization | required. organization inside your ldap server. Defaults to "grommet.io" | process.env.LDAP_ORGANIZATION |

### People Configuration

The schema for people is as follows:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|label | required. label to be used as the display name for People pages. Defaults to "People" | process.env.LDAP_PEOPLE_LABEL |
|ou | required. organization unit inside your ldap for people. Defaults to "people" | process.env.LDAP_PEOPLE_OU |
|colorIndex | required. color to be used for People pages. Defaults to "neutral-1" | process.env.LDAP_PEOPLE_COLOR_INDEX |
|attributes | required. JSON string with all the people attributes. See [People Attributes](https://github.com/grommet/grommet-people-finder#people-attributes) | process.env.LDAP_PEOPLE_ATTRIBUTES |
|details | optional. JSON string with additional information about a given person. See [People Details](https://github.com/grommet/grommet-people-finder#people-details) | process.env.LDAP_PEOPLE_DETAILS |
|filterForSearch| required. function that returns the ldap search filter. See [config.js](https://github.com/grommet/grommet-people-finder/blob/master/src/js/config.js) | N/A |

#### People Attributes

As long as you keep the required keys, you can either replace the entire object as a json string (`process.env.LDAP_PEOPLE_ATTRIBUTES`) or replace each attribute separately. The people attributes are:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|id| required. ldap key for the person's id. Defaults to `uid`. | process.env.LDAP_PEOPLE_ATTRIBUTE_ID |
|name| required. ldap key for the person's name. Defaults to `name`. | process.env.LDAP_PEOPLE_ATTRIBUTE_NAME |
|firstName| required. ldap key for the person's first name. Defaults to `givenName`. | process.env.LDAP_PEOPLE_ATTRIBUTE_FIRST_NAME |
|lastName| required. ldap key for the person's last name. Defaults to `sn`. | process.env.LDAP_PEOPLE_ATTRIBUTE_LAST_NAME |
| assistant | optional. ldap key for the person's manager. Defaults to `assistant`. | process.env.LDAP_PEOPLE_ATTRIBUTE_ASSISTANT |
|thumbnail| optional. ldap key for the person's thumbnail image. Defaults to `pictureThumbnailURI`. | process.env.LDAP_PEOPLE_ATTRIBUTE_THUMBNAIL |
|picture| optional. ldap key for the person's regular-sized image. Defaults to `pictureURI`. | process.env.LDAP_PEOPLE_ATTRIBUTE_PICTURE |
|manager| optional. ldap key for the person's manage. Defaults to `manager`. | process.env.LDAP_PEOPLE_ATTRIBUTE_MANAGER |
|title| optional. ldap key for the person's role (e.g. "Software Engineer"). Defaults to `title`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_TITLE |
|telephoneNumber| optional. ldap key for the person's telephone number. Defaults to `telephoneNumber`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_TELEPHONE_NUMBER |
|workName| optional. ldap key for the person's work name. Defaults to `workName`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_NAME |
|workLocation| optional. ldap key for the person's work location. Defaults to `workLocation`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_LOCATION |
|workCity| optional. ldap key for the person's work city. Defaults to `workCity`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_CITY |
|workStreet| optional. ldap key for the person's work street. Defaults to `workStreet`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_STREET |
|workState| optional. ldap key for the person's work state. Defaults to `workState`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_STATE |
|workCountry| optional. ldap key for the person's work country. Defaults to `workCountry`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_COUNTRY |
|workState| optional. ldap key for the person's work state. Defaults to `workState`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_STATE |
|workPostalCode| optional. ldap key for the person's work postal code. Defaults to `workPostalCode`. | process.env.LDAP_PEOPLE_ATTRIBUTE_WORK_POSTAL_CODE |

#### People Details

The details key allows for a set of extra keys with additional information regarding the person. For example:

```javascript
'Employment': [
  {
    attributeDisplayName: 'Employee Number',
    attributeField: 'employeeNumber'
  },
  {
    attributeDisplayName: 'Status',
    attributeField: 'status'
  }
],
'Site': [
  {
    attributeDisplayName: 'Building',
    attributeField: 'workName'
  },
  {
    attributeDisplayName: 'Floor',
    attributeField: 'floor'
  }
]
```

The key of the object is the section name, and the value is an array of attributes with `attributeDisplayName` and `attributeField` as required entries.

### Groups Configuration

The schema for groups is as follows:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|label | required. label to be used as the display name for Groups pages. Defaults to "Groups" | process.env.LDAP_GROUPS_LABEL |
|ou | required. organization unit inside your ldap for groups. Defaults to "groups". | process.env.LDAP_GROUPS_OU |
|colorIndex | required. color to be used for Groups pages. Defaults to "neutral-2" | process.env.LDAP_GROUPS_COLOR_INDEX |
|attributes | required. JSON string with all the group attributes. See [Groups Attributes](https://github.com/grommet/grommet-people-finder#groups-attributes) | process.env.LDAP_GROUPS_ATTRIBUTES |
|filterForSearch| required. function that returns the ldap search filter. See [config.js](https://github.com/grommet/grommet-people-finder/blob/master/src/js/config.js) | N/A |

#### Groups Attributes

As long as you keep the required keys, you can either replace the entire object as a json string (`process.env.LDAP_GROUPS_ATTRIBUTES`) or replace each attribute separately. The groups attributes are:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|id| required. ldap key for the group id. Defaults to `cn`. | process.env.LDAP_GROUPS_ID |
|description| required. ldap key for the group description. Defaults to `description`. | process.env.LDAP_GROUPS_DESCRIPTION |
|owner| required. ldap key for the group owner. Defaults to `owner`. | process.env.LDAP_GROUPS_OWNER |
|mail| required. ldap key for the group email. Defaults to `email`. | process.env.LDAP_GROUPS_MAIL |
|objectClass| required. ldap key for the group's objectClass value. Defaults to `groupOfNames`. | process.env.LDAP_GROUPS_OBJECT_CLASS |

### Locations Configuration

The schema for locations is as follows:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|label | required. label to be used as the display name for Locations pages. Defaults to "Locations" | process.env.LDAP_LOCATIONS_LABEL |
|ou | required. organization unit inside your ldap for locations. Defaults to "locations" | process.env.LDAP_LOCATIONS_OU |
|colorIndex | required. color to be used for Locations pages. Defaults to "neutral-2" | process.env.LDAP_LOCATIONS_COLOR_INDEX |
|attributes | required. JSON string with all the locations attributes. See [Locations Attributes](https://github.com/grommet/grommet-people-finder#locations-attributes) | process.env.LDAP_LOCATIONS_ATTRIBUTES |
|filterForSearch| required. function that returns the ldap search filter. See [config.js](https://github.com/grommet/grommet-people-finder/blob/master/src/js/config.js) | N/A |

#### Locations Attributes

As long as you keep the required keys, you can either replace the entire object as a json string (`process.env.LDAP_LOCATIONS_ATTRIBUTES`) or replace each attribute separately. The locations attributes are:

| **Attribute** | **Description** | **Env Variable** |
|--------|--------|--------|
|id| required. ldap key for the location id. Defaults to `lid`. | process.env.LDAP_LOCATIONS_ID |
|name| required. ldap key for the location name. Defaults to `cn`. | process.env.LDAP_LOCATIONS_NAME |
|address| required. ldap key for the location address. Defaults to `postalAddress`. | process.env.LDAP_LOCATIONS_ADDRESS |
|postalCode| required. ldap key for the location postal code. Defaults to `postalCode`. | process.env.LDAP_LOCATIONS_POSTAL_CODE |
|street| required. ldap key for the location street. Defaults to `street`. | process.env.LDAP_LOCATIONS_STREET |
|city| required. ldap key for the location city. Defauts to `l`. | process.env.LDAP_LOCATIONS_CITY |
|state|  required. ldap key for the location state. Defaults to `st`. | process.env.LDAP_LOCATIONS_STATE |
|country| required. ldap key for the location country. Defaults to `c`. | process.env.LDAP_LOCATIONS_COUNTRY |
|latitude| required. ldap key for the location latitude. Defaults to `latitude`. | process.env.LDAP_LOCATIONS_LATITUDE |
|longitude| required. ldap key for the location longitude. Defaults to `longitude`. | process.env.LDAP_LOCATIONS_LONGITUDE |
|telephoneNumber| optional. ldap key for the location telephone number. | process.env.LDAP_LOCATIONS_TELEPHONE_NUMBER |
|category|: optional. ldap key for the location category. Defaults to `category`. | process.env.LDAP_LOCATIONS_CATEGORY |
