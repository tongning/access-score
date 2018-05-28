from cellgrid import CellGrid
from cell import Cell
from coord import Coord 
from configreader import ConfigReader
import route
import json
import datetime
config = ConfigReader("settings.conf")
api_key = config.apikey
grid = CellGrid(Coord(39.0095, -77.16796), Coord(38.8044, -76.89331), grid_width=5, grid_height=5)
with open('gridfeaturecounts.json', 'r') as featurecounts_per_cell:
    javascript_analysis_results_json=featurecounts_per_cell.read().replace('\n', '')

grid.load_javascript_analysis_json(javascript_analysis_results_json)
grid.generate_scaled_scores_zero_to_one()
print(grid.to_geojson())
