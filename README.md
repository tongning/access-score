# AccessScore Visualizations


This README describes how to generate interactive web-based visualizations of Project Sidewalk data.

### Step 1: Precomputation

To enable performant customization of the visualization, significant precomputations need to be performed. The results of the precomputation are embedded into the visualization webpage. 


Currently, the precomputation is done using a collection of Python and node.js scripts. In the future, this process can and should be automated to run in a single step. The manual procedure works as follows:

* `cd route-score`
* Install python3 dependencies in the Pipfile
* `cp settings.conf.example settings.conf`
* Edit `settings.conf` with a Google Maps API key
* Edit `generateroutes.py` with the correct coordinates and grid size on the `grid=` line. The grid is defined by its northwest and southeast coordinates.
* Run `generateroutes.py`.
* Copy the `.js` file generated to `../sidewalk-viz-node/streets.js`.

Next, some processing using node.js:
* `cd sidewalk-viz-node`
* If desired, update the `labels.js` file with newer data from the Project Sidewalk API
* Install npm dependencies. If there is an error installing, try: `sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
`
* Open the `streets.js` file. Add `var streets = [];` as the first line. At the end, append `module.exports = {streets : streets};`
* Run `node main.js > ../route-score/gridfeaturecounts.json`

And back to Python:
* `cd route-score`
* Update the `grid=` line of `generatecellscores.py` with the same value used in `generateroutes.py`.
* Run `python generatecellscores.py > preprocessed.json`
* Upload `preprocessed.json` to a public hosting location.

### Step 2: Visualization generation
* cd `deckgl/examples/geojson`
* Update the Mapbox API token
* Update the data URL to point to your `preprocessed.json`file
* Run `npm install`
* `npm start`

A browser window should now open with the visualization!


## Demo
You can try out AccessScore [here](https://tongning.github.io/deckgl/)!
