/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import { StickyContainer, Sticky } from 'react-sticky';
import {LayerControls, SCATTERPLOT_CONTROLS} from './layer-controls';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = ''; // eslint-disable-line

// Source data GeoJSON
// const DATA_URL =
//  'https://nyc3.digitaloceanspaces.com/antli/smallcellsgrid.geojson'; // eslint-disable-line
const DATA_URL =
  'https://antli.nyc3.digitaloceanspaces.com/threepoifilteredgrid_withcounts.geojson'; // eslint-disable-line

//const colorScale = r => [r * 255, 140, 200 * (1 - r)];
const colorScale = function(r, min, max) {
  
  if(r == 0) {
    return [0,0,0,0]
  }
  var range = max - min;
  var ratio = (r - min)/range;
  if(ratio > 1) {
    ratio = 1;
  } else if (ratio < 0) {
    ratio = 0;
  }
  //console.log("Ratio is");
  //console.log(ratio);
  var opac=200;
  /* if (ratio >= 0 && ratio < 0.1) {
    return [225,245,254,opac];
  } else if (ratio >= 0.1 && ratio < 0.2) {
    return [179,229,252,opac];
  } else if (ratio >= 0.2 && ratio < 0.3) {
    return [129,212,250,opac];
  } else if (ratio >= 0.3 && ratio < 0.4) {
    return [79,195,247,opac];
  } else if (ratio >= 0.4 && ratio < 0.5) {
    return [41,182,246,opac];
  } else if (ratio >= 0.5 && ratio < 0.6) {
    return [3, 169, 244,opac];;
    //return [255,0,0,255];
  } else if (ratio >= 0.6 && ratio < 0.7) {
    return [3,155,229,opac];
  } else if (ratio >= 0.7 && ratio < 0.8) {
    return [2,136,209,opac];
  } else if (ratio >= 0.8 && ratio < 0.9) {
    return [2,119,189,opac];
  } else if (ratio >= 0.9 && ratio <= 1.0) {
    return [1,87,155,opac];
  } */
  if (ratio >= 0 && ratio < 0.1) {
    return [1,87,155,opac];
  } else if (ratio >= 0.1 && ratio < 0.2) {
    return [2,119,189,opac];
  } else if (ratio >= 0.2 && ratio < 0.3) {
    return [2,136,209,opac];
  } else if (ratio >= 0.3 && ratio < 0.4) {
    return [3,155,229,opac];
  } else if (ratio >= 0.4 && ratio < 0.5) {
    return [3, 169, 244,opac];
  } else if (ratio >= 0.5 && ratio < 0.6) {
    return [41,182,246,opac];
    //return [255,0,0,255];
  } else if (ratio >= 0.6 && ratio < 0.7) {
    return [79,195,247,opac];
  } else if (ratio >= 0.7 && ratio < 0.8) {
    return [129,212,250,opac];
  } else if (ratio >= 0.8 && ratio < 0.9) {
    return [179,229,252,opac];
  } else if (ratio >= 0.9 && ratio <= 1.0) {
    return [225,245,254,opac];
  }
  return [0, 0, 0,0];
}

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      settings: Object.keys(SCATTERPLOT_CONTROLS).reduce((accu, key) => ({
        ...accu,
        [key]: SCATTERPLOT_CONTROLS[key].value
      }), {}),
      data: null,
      isOpen: false
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        this.setState({data: response});
      }
    });
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _updateLayerSettings(settings) {
    this.setState({settings});
    
  }

  render() {
    const {viewport, data} = this.state;
    const legendstyle = {
      position: 'absolute',
      bottom: 10,
      left: 10,
      width: 200,
      zIndex: 99
      
    }
    return (
      
      <div>
        <img style={legendstyle} src="legend.PNG" />
        <StickyContainer>
         <Navbar color="light" light expand="md">
          <NavbarBrand href="/">AccessScore <font size="3">by Project Sidewalk</font></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              
              <NavItem>
                <NavLink href="http://projectsidewalk.io">Project Sidewalk Home</NavLink>
              </NavItem>
             
            </Nav>
          </Collapse>
        </Navbar>
        
        
        
        
        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}/>
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <DeckGLOverlay settings={this.state.settings} viewport={viewport} data={data} colorScale={colorScale} />
        </MapGL>
        </StickyContainer>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
