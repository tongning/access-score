import createLayerDemoClass from './layer-demo-base';
import {DATA_URI} from '../../constants/defaults';

import {
  COORDINATE_SYSTEM,
  ScatterplotLayer,
  LineLayer,
  ArcLayer,
  PathLayer,
  IconLayer,
  ScreenGridLayer,
  GridLayer,
  HexagonLayer,
  PolygonLayer,
  GeoJsonLayer,
  PointCloudLayer
} from 'deck.gl';

import {colorToRGBArray} from '../../utils/format-utils';

export const ScatterplotLayerDemo = createLayerDemoClass({
  Layer: ScatterplotLayer,
  dataUrl: `${DATA_URI}/bart-stations.json`,
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    opacity: 0.8,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getColor: d => [255, 140, 0]
  }
});

export const ArcLayerDemo = createLayerDemoClass({
  Layer: ArcLayer,
  dataUrl: `${DATA_URI}/bart-segments.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    strokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: d => [Math.sqrt(d.outbound), 140, 0]
  }
});

export const LineLayerDemo = createLayerDemoClass({
  Layer: LineLayer,
  dataUrl: `${DATA_URI}/bart-segments.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    strokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0]
  }
});

export const PathLayerDemo = createLayerDemoClass({
  Layer: PathLayer,
  dataUrl: `${DATA_URI}/bart-lines.json`,
  formatTooltip: d => d.name,
  props: {
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: d => d.path,
    getColor: d => colorToRGBArray(d.color),
    getWidth: d => 5
  }
});

export const IconLayerDemo = createLayerDemoClass({
  Layer: IconLayer,
  dataUrl: `${DATA_URI}/bart-stations.json`,
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    iconAtlas: 'images/icon-atlas.png',
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: true
      }
    },
    sizeScale: 15,
    getPosition: d => d.coordinates,
    getIcon: d => 'marker',
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0]
  }
});

export const ScreenGridLayerDemo = createLayerDemoClass({
  Layer: ScreenGridLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => 'aggregated cell',
  props: {
    pickable: false,
    opacity: 0.8,
    cellSizePixels: 50,
    minColor: [0, 0, 0, 0],
    maxColor: [0, 180, 0, 255],
    getPosition: d => d.COORDINATES,
    getWeight: d => d.SPACES
  }
});

export const GridLayerDemo = createLayerDemoClass({
  Layer: GridLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `${d.position.join(', ')}\nCount: ${d.count}`,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const HexagonLayerDemo = createLayerDemoClass({
  Layer: HexagonLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `${d.centroid.join(', ')}\nCount: ${d.points.length}`,
  props: {
    pickable: true,
    extruded: true,
    radius: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const PolygonLayerDemo = createLayerDemoClass({
  Layer: PolygonLayer,
  dataUrl: `${DATA_URI}/sf-zipcodes.json`,
  formatTooltip: d => `${d.zipcode}\nPopulation: ${d.population}`,
  props: {
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: d => d.contour,
    getElevation: d => d.population / d.area / 10,
    getFillColor: d => [d.population / d.area / 60, 140, 0],
    getLineColor: d => [80, 80, 80],
    getLineWidth: d => 1
  }
});

export const GeoJsonLayerDemo = createLayerDemoClass({
  Layer: GeoJsonLayer,
  dataUrl: `${DATA_URI}/bart.geo.json`,
  formatTooltip: d => d.properties.name || d.properties.station,
  props: {
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: d => [160, 160, 180, 200],
    getLineColor: d => colorToRGBArray(d.properties.color),
    getRadius: d => 100,
    getLineWidth: d => 1,
    getElevation: d => 30
  }
});

export const PointCloudLayerDemo = createLayerDemoClass({
  Layer: PointCloudLayer,
  dataUrl: `${DATA_URI}/pointcloud.json`,
  formatTooltip: d => d.position.join(', '),
  props: {
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.4, 37.74],
    radiusPixels: 4,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color
  }
});
