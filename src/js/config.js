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
        // only return Active employees
        return "(&(hpStatus=Active)(|(cn=*" + searchText + "*)(uid=*" + searchText + "*)))";
      }
    },

    groups: {
      label: "Groups",
      ou: "groups",
      colorIndex: "neutral-2",
      id: "cn",
      attributes: ["cn", "description"],
      filterForSearch: function (searchText) {
        return "(cn=*" + searchText + "*)";
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
        return "(|(buildingName=*" + searchText + "*)(l=*" + searchText + "*))";
      }
    }
  }
};
