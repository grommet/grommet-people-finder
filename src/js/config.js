// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

export default {

  ldap_base_url: "ldap://ldap.hp.com",
  organization: "hp.com",

  scopes: {
    people: {
      label: "People",
      ou: "people",
      colorIndex: "neutral-1",
      id: "uid",
      attributes: ["hpPictureThumbnailURI", "cn", "hpBusinessUnit", "uid"],
      filterForSearch: function (searchText) {
        // handle "Last, First" syntax
        if (searchText.indexOf(",") !== -1) {
          searchText = searchText.replace(/(.+),\s*(.+)/, "$2 $1");
        }

        // allow ldap query to search for first/given name and last/surname to account for
        // common names with middle initials
        let queryEnd = "*)))";
        const splitName = searchText.split(' ');
        if (splitName.length && splitName.length > 1) {
          const firstName = splitName[0];
          const lastName = splitName[splitName.length - 1];
          queryEnd = `*)(&|(givenName=${firstName}*)(sn=${lastName}*))))`;
        }

        // only return Active employees
        return `(&(hpStatus=Active)(|(cn=*${searchText}*)(uid=*${searchText}${queryEnd}`;
      }
    },

    groups: {
      label: "Groups",
      ou: "groups",
      colorIndex: "neutral-2",
      id: "cn",
      attributes: ["cn", "description"],
      filterForSearch: function (searchText) {
        return `(cn=*${searchText}*)`;
      }
    },

    locations: {
      label: "Locations",
      ou: "locations",
      colorIndex: "neutral-3",
      id: "hpRealEstateID",
      attributes: ["buildingName", "l", "hpRealEstateID"],
      filterForSearch: function (searchText) {
        searchText = searchText.replace(/\s+/g, "*");
        return `(|(buildingName=*${searchText}*)(l=*${searchText}*))`;
      }
    }
  }
};
