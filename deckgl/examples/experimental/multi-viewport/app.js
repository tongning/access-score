/* global window, document, fetch */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {
  COORDINATE_SYSTEM,
  DeckGL,
  WebMercatorViewport,
  PolygonLayer,
  PointCloudLayer,
  experimental
} from 'deck.gl';

import TripsLayer from '../../trips/trips-layer';

// deck.gl React components
const {
  FirstPersonState,
  // Viewport classes provides various views on the state
  FirstPersonViewport,
  ThirdPersonViewport,
  // Unified controller, together with state that determines interaction model
  ViewportController
} = experimental;

import {StaticMap} from 'react-map-gl';

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const LIGHT_SETTINGS = {
  lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
  ambientRatio: 0.05,
  diffuseRatio: 0.6,
  specularRatio: 0.8,
  lightsStrength: [3.0, 0.0, 0.5, 0.0],
  numberOfLights: 2
};

const DEFAULT_VIEWPORT_PROPS = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  maxZoom: 16,
  pitch: 60,
  bearing: 270,

  // view matrix arguments
  position: [0, 0, 2], // Defines eye position
  // direction: [-0.9, 0.5, 0], // Which direction is camera looking at, default origin
  up: [0, 0, 1] // Defines up direction, default positive y axis
};

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fov: 50,

      viewportProps: {
        ...DEFAULT_VIEWPORT_PROPS,
        width: 500,
        height: 500
      },
      buildings: null,
      trips: null,
      time: 0,
      trailLength: 50
    };

    fetch(DATA_URL.BUILDINGS)
      .then(response => response.json())
      .then(data => this.setState({buildings: data}));

    fetch(DATA_URL.TRIPS)
      .then(response => response.json())
      .then(data => this.setState({trips: data}));

    this._onViewportChange = this._onViewportChange.bind(this);
    this._onFovChange = this._onFovChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize.bind(this));
    this._onResize();
    this._onAnimate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _onAnimate() {
    const timestamp = Date.now();
    const loopLength = 1800;
    const loopTime = 20000;

    this.setState({
      time: (timestamp % loopTime) / loopTime * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._onAnimate.bind(this));
  }

  _onResize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewportProps, viewport) {
    this.setState({
      viewportProps: {...this.state.viewportProps, ...viewportProps},
      viewport
    });
  }

  _onFovChange() {
    this.setState({fov: this.state.fov === 60 ? 35 : 60});
  }

  _renderOptionsPanel() {
    return (
      <div style={{position: 'absolute', top: '8px', right: '8px'}}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <button key="fov" onClick={this._onFovChange}>
            {`FOV : ${this.state.fov}`}
          </button>
          <div style={{color: 'white'}}>
            {Object.keys(this.state.viewportProps).map(key => (
              <div key={key}>
                {key}:{String(this.state.viewportProps[key])}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  _renderLayers() {
    const {longitude, latitude} = DEFAULT_VIEWPORT_PROPS;
    const {viewportProps} = this.state;
    const {position} = viewportProps;

    const {buildings, trips} = this.state;
    const {trailLength, time} = this.state;
    if (!buildings || !trips) {
      return [];
    }

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.segments,
        getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
        opacity: 0.3,
        strokeWidth: 2,
        trailLength,
        currentTime: time
      }),
      new PolygonLayer({
        id: 'buildings',
        data: buildings,
        extruded: true,
        wireframe: false,
        fp64: true,
        opacity: 0.5,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: f => [74, 80, 87],
        lightSettings: LIGHT_SETTINGS
      }),
      new PointCloudLayer({
        id: 'player',
        data: [
          {
            position,
            color: [0, 255, 255, 255],
            normal: [1, 0, 0]
          }
        ],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [longitude, latitude],
        opacity: 1,
        radiusPixels: 20
      }),
      new PointCloudLayer({
        id: 'ref-point',
        data: [
          {
            position: [-1, 0, 2],
            color: [255, 0, 0, 255],
            normal: [1, 0, 0]
          }
        ],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [longitude, latitude],
        opacity: 1,
        radiusPixels: 20
      })
    ];
  }

  _renderViewports() {
    const {viewportProps, fov} = this.state;

    return [
      new FirstPersonViewport({
        id: '1st-person',
        ...viewportProps,
        height: viewportProps.height / 3,
        fovy: fov
      }),
      new ThirdPersonViewport({
        id: '3rd-person',
        ...viewportProps,
        y: viewportProps.height / 3,
        height: viewportProps.height / 3
      }),
      new WebMercatorViewport({
        id: 'basemap',
        ...viewportProps,
        y: viewportProps.height / 3 * 2,
        height: viewportProps.height / 3
      })
    ];
  }

  render() {
    const viewports = this._renderViewports();

    const {viewportProps} = this.state;

    return (
      <div style={{backgroundColor: '#000'}}>
        <ViewportController
          viewportState={FirstPersonState}
          {...viewportProps}
          width={viewportProps.width}
          height={viewportProps.height}
          onViewportChange={this._onViewportChange}
        >
          <DeckGL
            id="first-person"
            width={viewportProps.width}
            height={viewportProps.height}
            viewports={viewports}
            layers={this._renderLayers()}
          >
            <StaticMap
              viewportId="3rd-person"
              {...viewportProps}
              mapStyle="mapbox://styles/mapbox/light-v9"
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
            <StaticMap
              viewportId="basemap"
              {...viewportProps}
              mapStyle="mapbox://styles/mapbox/dark-v9"
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
          </DeckGL>

          {this._renderOptionsPanel()}
        </ViewportController>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
