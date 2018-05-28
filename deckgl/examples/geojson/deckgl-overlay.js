import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [38.90, -77.03, 50,38.90, -77.03, 50],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [5.0, 5.0, 5.0, 5.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      latitude: 38.9072,
      longitude: -77.0369,
      zoom: 11,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
      altitude: 0
    };
  }
 
  render() {
    const {settings, viewport, data, colorScale} = this.props;
    
    if (!data) {
      return null;
    }
    var maxHeight = 0;
    var minHeight = Number.MAX_VALUE;
    function getHeight(f) {
      var curbRampCounts = f.properties.CurbRamp;
      var featureTypes = ["CurbRamp", "NoCurbRamp", "Obstacle", "SurfaceProblem", "Other", "Occlusion", "NoSidewalk"];
      var cr_wts = [];
      var ncr_wts = [];
      var obs_wts = [];
      var sfp_wts = [];
      var nsw_wts = [];
      var curbRampScaleFactor = settings["curbRampImportance"];
      var smoothSurfaceScaleFactor = settings["smoothSurfaceImportance"];
      var noObstructionScaleFactor = settings["noObstructionImportance"];
      var noSidewalkScaleFactor = 1;
      if (settings["vehicle"] == "electric") {
        curbRampScaleFactor *= 2;
        smoothSurfaceScaleFactor *= 2;
      } else if (settings["vehicle"] == "manual") {
        curbRampScaleFactor *= 1.5;
        smoothSurfaceScaleFactor *= 1.5;
      } else if (settings["vehicle"] == "cane") {
        curbRampScaleFactor *= 0.5;
        smoothSurfaceScaleFactor *= 0.5;
        noSidewalkScaleFactor *= 0.5;
        noObstructionScaleFactor *= 0.5;
      }

      for(var i = 1; i<=5; i++) {
        cr_wts.push(settings["CurbRamp"+i.toString()]*curbRampScaleFactor);
      }
      for(var i = 1; i<=5; i++) {
        ncr_wts.push(settings["NoCurbRamp"+i.toString()]*curbRampScaleFactor);
      }
      for(var i = 1; i<=5; i++) {
        obs_wts.push(settings["Obstacle"+i.toString()]*noObstructionScaleFactor);
      }
      for(var i = 1; i<=5; i++) {
        sfp_wts.push(settings["SurfaceProblem"+i.toString()]*smoothSurfaceScaleFactor);
      }
      for(var i = 1; i<=5; i++) {
        nsw_wts.push(settings["NoSidewalk"+i.toString()]*noSidewalkScaleFactor);
      }
      //console.log("settings are");
      //console.log(settings);
      //console.log(curbRampCounts);

      // -------------------

        var curr_score = 0;
        var cr = f.properties.CurbRamp;
        curr_score += cr[0]*cr_wts[0] + cr[1]*cr_wts[1] + cr[2]*cr_wts[2] + cr[3]*cr_wts[3] + cr[4]*cr_wts[4];
        var ncr = f.properties.NoCurbRamp;
        curr_score += ncr[0]*ncr_wts[0] + ncr[1]*ncr_wts[1] + ncr[2]*ncr_wts[2] + ncr[3]*ncr_wts[3] + ncr[4]*ncr_wts[4];
        var obs = f.properties.Obstacle;
        curr_score += obs[0]*obs_wts[0] + obs[1]*obs_wts[1] + obs[2]*obs_wts[2] + obs[3]*obs_wts[3] + obs[4]*obs_wts[4];
        var sfp = f.properties.SurfaceProblem;
        curr_score += sfp[0]*sfp_wts[0] + sfp[1]*sfp_wts[1] + sfp[2]*sfp_wts[2] + sfp[3]*sfp_wts[3] + sfp[4]*sfp_wts[4];
        var nsw = f.properties.NoSidewalk;
        curr_score += nsw[0]*nsw_wts[0] + nsw[1]*nsw_wts[1] + nsw[2]*nsw_wts[2] + nsw[3]*nsw_wts[3] + nsw[4]*nsw_wts[4];
        var raw_score = 0;
        if (f.properties.length_miles == 0) {
            raw_score = 0;
        }
        else if (curr_score == 0) {
          raw_score = 0;
        }
        else {
            raw_score = curr_score / f.properties.length_miles;
        }
      // -------------------
      var height = raw_score *200;
      if(height > maxHeight) {
        maxHeight = height;
      } else if (height < minHeight) {
        minHeight = height;
      }
      return height;
    }
    var elevationUpdateTriggers = [];
    var featureTypes = ["CurbRamp", "NoCurbRamp", "Obstacle", "SurfaceProblem", "Other", "Occlusion", "NoSidewalk"];
    for(var i = 1; i<=5; i++) {
      for(var featureNum = 0; featureNum < featureTypes.length; featureNum++){
        var featureType = featureTypes[featureNum];
        elevationUpdateTriggers.push(settings[featureType+i.toString()]);
      }
    }
    elevationUpdateTriggers.push(settings["vehicle"]);
    elevationUpdateTriggers.push(settings["curbRampImportance"]);
    elevationUpdateTriggers.push(settings["smoothSurfaceImportance"]);
    elevationUpdateTriggers.push(settings["noObstructionImportance"]);
    
    return <DeckGL {...viewport} layers={[new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 1,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,
      getElevation: f => 0,
      getFillColor: f => colorScale(getHeight(f), minHeight, maxHeight),
      getLineColor: f => [255, 255, 255],
      lightSettings: LIGHT_SETTINGS,
      pickable: Boolean(this.props.onHover),
      onHover: this.props.onHover,
      updateTriggers: {
        // not triggered
        //getElevation: settings.radiusScale,
        getElevation: elevationUpdateTriggers,
        
        
        // triggered
        getFillColor: elevationUpdateTriggers
      }
    })]} />;
  }
}
