// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var React = require('react');
var Leaflet = require('leaflet');
var Section = require('grommet/components/Section');
var Rest = require('grommet/utils/Rest');

var Map = React.createClass({

  propTypes: {
    city: React.PropTypes.string,
    country: React.PropTypes.string,
    latitude: React.PropTypes.string,
    longitude: React.PropTypes.string,
    postalCode: React.PropTypes.string,
    state: React.PropTypes.string,
    street: React.PropTypes.string,
    title: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      busy: false,
      latitude: this.props.latitude,
      longitude: this.props.longitude
    };
  },

  componentDidMount: function () {
    if (! this.state.map) {
      var mapElement = this.refs.map;
      var options = {
        touchZoom: false,
        scrollWheelZoom: false
      };
      var map = Leaflet.map(mapElement, options);
      this.setState({map: map});
    }

    if (! this.state.latitude || ! this.state.longitude) {
      this._getGeocode(this.props);
    } else {
      this._setMap();
    }
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({latitude: newProps.latitude, longitude: newProps.longitude}, function () {
      if (! this.state.latitude || ! this.state.longitude) {
        this._getGeocode(newProps);
      } else {
        this._setMap();
      }
    });
  },

  _setMap: function (mapSize) {
    var map = this.state.map;
    map.setView([this.state.latitude, this.state.longitude], mapSize || 14);
    Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var circle = Leaflet.circleMarker([this.state.latitude, this.state.longitude], {
      color: '#FF8D6D',
      opacity: 0.8,
      fillOpacity: 0.8
    }).addTo(map);
    var address = '<h5>' + this.props.title + '</h5>' + this._renderAddress().join('<br/>');
    circle.bindPopup(address).openPopup();
  },

  _getGeocode: function (props, attempts) {
    if (props.country) {
      var params = {
        state: props.state,
        country: props.country,
        format: 'json'
      };

      if (!attempts) {
        attempts = 1;
        this.setState({busy: true, place: null});

        if (props.street) {
          params.street = props.street.replace(/.+? \$ /g, '').replace('  BP1220', '');
        }

        if (props.postalCode) {
          params.postalcode = props.postalCode.split('-')[0];
        }
      } else if (attempts === 3) {
        params = {
          city: props.city,
          country: props.country,
          format: 'json'
        };
      } else if (attempts === 4) {
        params = {
          country: props.country,
          format: 'json'
        };
      }

      // need to change map zoom depending on the number of attempts
      var mapSize = {
        1: 14,
        2: 10,
        3: 10,
        4: 5
      };

      Rest
        .get("http://nominatim.openstreetmap.org/search", params)
        .end(function (err, res) {
          if (! err && res.ok && res.body && res.body[0]) {
            var place = res.body[0];
            this.setState(
              {latitude: place.lat, longitude: place.lon, busy: false},
              this._setMap.bind(this, mapSize[attempts])
            );
          } else if (attempts < 4) {
            this._getGeocode(props, ++attempts);
          } else {
            console.log('!!! geocode response error', err, res);
            if (this.state.map) {
              this.state.map.remove();
              this.refs.map.className = "";
            }
            this.setState({map: null, busy: false});
          }
        }.bind(this));
    }
  },

  _renderAddress: function () {
    return [this.props.street, this.props.city, this.props.state, this.props.postalCode, this.props.country];
  },

  render: function() {
    var address;
    if (! this.state.busy && ! this.state.latitude) {
      address = (
        <Section pad={{horizontal: "medium"}}>
          {this._renderAddress().map(function (e, i) {
            return <div key={i}>{e}</div>;
          })}
        </Section>
      );
    }
    return (
      <div ref="map" id="map">
        {address}
      </div>
    );
  }

});

module.exports = Map;
