import React, {Component} from 'react';
import {layerControl} from './style';
import {RadioGroup, Radio} from 'react-radio-group'


export const HEXAGON_CONTROLS = {
  showHexagon: {
    displayName: 'Show Hexagon',
    type: 'boolean',
    value: true
  },
  radius: {
    displayName: 'Hexagon Radius',
    type: 'range',
    value: 250,
    step: 50,
    min: 50,
    max: 1000
  },
  coverage: {
    displayName: 'Hexagon Coverage',
    type: 'range',
    value: 0.7,
    step: 0.1,
    min: 0,
    max: 1
  },
  upperPercentile: {
    displayName: 'Hexagon Upper Percentile',
    type: 'range',
    value: 100,
    step: 0.1,
    min: 80,
    max: 100
  },
  radiusScale: {
    displayName: 'Height Scale',
    type: 'range',
    value: 30,
    step: 2,
    min: 10,
    max: 20
  },
  curbramp1: {
    displayName: 'Curb Ramp 1',
    type: 'range',
    value: 30,
    step: 2,
    min: 10,
    max: 20
  }
};

var controls = {
  sub1: {
    type: 'noboldlabel',
    displayName: 'You can tailor the map to your specific accessibility needs by answering some questions.'
  },


  vehicle: {
    displayName: 'What mobility device do you use?',
    type: 'vehicleradio',
    value: 'none'
  },

  
  curbRampImportanceLabel: {
    type: 'label',
    displayName: 'How important are...'
  },
  curbRampImportance: {
    displayName: 'Curb ramps?',
    type: 'range',
    value: 3,
    step: 1,
    min: 1,
    max: 5
  },
  smoothSurfaceImportance: {
    displayName: 'Smooth sidewalks?',
    type: 'range',
    value: 3,
    step: 1,
    min: 1,
    max: 5
  },
  noObstructionImportance: {
    displayName: 'Unobstructed sidewalks?',
    type: 'range',
    value: 3,
    step: 1,
    min: 1,
    max: 5
  },
  
};

var featureTypes = ["CurbRamp", "NoCurbRamp", "Obstacle", "SurfaceProblem", "Other", "Occlusion", "NoSidewalk"];


for(var i = 0; i<featureTypes.length; i++) {
  var featureType = featureTypes[i];
  for(var severity = 1; severity <=5; severity++) {
    var isCurbRamp = featureType.startsWith("CurbRamp");
    controls[featureType+severity.toString()] = {
      displayName: "",
      type: 'noboldlabel',
      value: isCurbRamp ? (6-severity):(-severity),
      step: 0.1,
      min: -5,
      max: 5
    }
  }
}



export const SCATTERPLOT_CONTROLS = controls;

export class LayerControls extends Component {

  _onValueChange(settingName, newValue) {
    const {settings} = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {
        ...this.props.settings,
        [settingName]: newValue
      };

      this.props.onChange(newSettings);
    }
  }

  render() {
    const {title, settings, propTypes = {}} = this.props;
    const controlStyle = {
      fontFamily: "Open Sans",
      fontWeight: 400
    };
    return (
      <div className="layer-controls" style={layerControl}>

        <h3>Customize AccessScore</h3>
        {Object.keys(settings).map(key =>
          <div key={key}>
            {propTypes[key].type == 'range' || propTypes[key].type == 'noboldlabel' ? <label>{propTypes[key].displayName}</label>:<label><b>{propTypes[key].displayName}</b></label>}
            <div style={{display: 'inline-block', position:'relative',float: 'right', right: 50, fontSize: 15}}>
              {propTypes[key].type == 'range' ? settings[key]:""}</div>
            <Setting
              settingName={key}
              
              value={settings[key]}
              propType={propTypes[key]}
              onChange={this._onValueChange.bind(this)}/>
          </div>)}
      </div>
    );
  }
}

const Setting = props => {
  const {propType} = props;
  if (propType && propType.type) {
    switch (propType.type) {
    case 'range':
      return <Slider {...props} />;

    case 'boolean':
      return <Checkbox {...props}/>;

    case 'radio':
      return <DistRadioGroup {...props}/>;

    case 'vehicleradio':
      return <VehicleRadioGroup {...props}/>;

    case 'label':
      return <Label {...props}/>;

    case 'noboldlabel':
      return <Label {...props}/>;

    case 'buttonlabel':
      return <ButtonLabel {...props}/>;
    default:
      return <input {...props}/>;
    }
  }
};

const Checkbox = ({settingName, value, onChange}) => {
  return (
    <div key={settingName} >
      <div className="input-group" >
        <input
          type="checkbox"
          id={settingName}
          checked={value}
          onChange={ e => onChange(settingName, e.target.checked) }/>
      </div>
    </div>
  );
};

function handleChange(value)  {
  this.setState({selectedValue: value});
}

const DistRadioGroup = ({settingName}) => {
  return (
    <div>
      
      <RadioGroup name={settingName} onChange={this.handleChange}>
        <Radio value="0.25" /> &le;0.25 mi <br />
        <Radio value="0.50" /> 0.5 mi <br />
        <Radio value="1.0" /> 1.0 mi <br />
        <Radio value="2.0" /> &ge;2.0 mi
      </RadioGroup>
    </div>
  );
}

const VehicleRadioGroup = ({settingName,value, propType, onChange}) => {
  return (
    <div>
      
      <RadioGroup name={settingName} onChange={e => onChange("vehicle", e)}>
        <Radio value="electric" /> Electric wheelchair <br />
        <Radio value="manual" /> Manual wheelchair<br />
        <Radio value="cane" /> Cane/walker<br />
        <Radio value="none" defaultChecked /> None
      </RadioGroup>
    </div>
  );
}

const Label = ({displayName}) => {
  const noBold = {
    fontWeight:'normal'
  }
  return(
    <div><span style={noBold}></span></div>
  );
}

class ButtonLabel extends React.Component {
	constructor() {
		super();
		this.state = {
			shown: true,
		};
	}	
	
	toggle() {
		this.setState({
			shown: !this.state.shown
		});
	}
		
	render() {
		var shown = {
			display: this.state.shown ? "block" : "none"
		};
		
		var hidden = {
			display: this.state.shown ? "none" : "block"
		}
		
		return (
			<div>
				<button onClick={this.toggle.bind(this)}>Toggle</button>
			</div>
		)
	}
}

const Slider = ({settingName, value, propType, onChange}) => {

  const {max = 100} = propType;
  const {min = 0} = propType;

  return (
    <div key={settingName} >
      <div className="input-group" >
        <div>
          <input
            type="range"
            id={settingName}
            min={min} max={max} step={max / 100}
            value={value}
            onChange={ e => onChange(settingName, Number(e.target.value)) }/>
        </div>
      </div>
    </div>
  );
};