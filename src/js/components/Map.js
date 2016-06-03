// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Leaflet from 'leaflet';
import Section from 'grommet/components/Section';
import Rest from 'grommet/utils/Rest';

export default class Map extends Component {

  constructor (props) {
    super(props);
    this.state = {
      busy: false,
      latitude: this.props.latitude,
      longitude: this.props.longitude
    };
  }

  componentDidMount () {
    if (! this.state.map) {
      const mapElement = this.refs.map;
      const options = {
        touchZoom: false,
        scrollWheelZoom: false,
        zoom: 5
      };
      const map = Leaflet.map(mapElement, options);

      // vertically centering map popup
      if (!this._onPopupOpen) {
        this._onPopupOpen = (event) => {
          let px = map.project(event.popup._latlng);
          px.y -= event.popup._container.clientHeight / 2;
          map.panTo(map.unproject(px), {animate: true});
        };
        map.on('popupopen', this._onPopupOpen);
      }

      this.setState({map: map});
    }

    if (! this.state.latitude || ! this.state.longitude) {
      this._getGeocode(this.props);
    } else {
      this._setMap();
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      latitude: nextProps.latitude,
      longitude: nextProps.longitude
    }, () => {
      if (! this.state.latitude || ! this.state.longitude) {
        this._getGeocode(nextProps);
      } else {
        this._setMap();
      }
    });
  }

  componentWillUnmount () {
    const map = this.state.map;
    if (map && this._onPopupOpen) {
      map.off('popupopen', this._onPopupOpen);
    }
  }

  _setMap (mapSize) {
    const map = this.state.map;
    map.setView([this.state.latitude, this.state.longitude], 5); //mapSize || 14);
    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy;OpenStreetMap, &copy;CartoDB'
    }).addTo(map);
    const circle = Leaflet.circleMarker([this.state.latitude, this.state.longitude], {
      color: '#FF8D6D',
      opacity: 0.8,
      fillOpacity: 0.8
    }).addTo(map);

    const directionsLink = `<br/><a href="http://maps.google.com/maps?saddr=${this.state.latitude},${this.state.longitude}" target="_blank"><span>(Directions)</span></a>`;
    const address = `<h5><strong>${this.props.title}</strong></h5>
      ${this._renderAddress().join('<br/>')}
      ${directionsLink}`;
    circle.bindPopup(address).openPopup();
  }

  _getGeocode (props, attempts) {
    if (props.country) {
      let params = {
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
      const mapSize = {
        1: 14,
        2: 10,
        3: 10,
        4: 5
      };

      Rest
        .get("http://nominatim.openstreetmap.org/search", params)
        .end(function (err, res) {
          if (! err && res.ok && res.body && res.body[0]) {
            const place = res.body[0];
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
  }

  _renderAddress () {
    let addressArray = [this.props.city, this.props.state,
      this.props.postalCode, this.props.country];

    // parse street addresses with '$' into separate lines
    if (this.props.street) {
      const parsedStreet = this.props.street.split('$')
        .map((addressLine) => addressLine.trim());
      addressArray = parsedStreet.concat(addressArray);
    }

    return addressArray;
  }

  render () {
    let address;
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
      <div ref="map" id="map" className={this.props.className}>
        {address}
      </div>
    );
  }

};

Map.propTypes = {
  city: PropTypes.string,
  country: PropTypes.string,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  postalCode: PropTypes.string,
  state: PropTypes.string,
  street: PropTypes.string,
  title: PropTypes.string
};
