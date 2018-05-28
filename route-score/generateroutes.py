

from cellgrid import CellGrid
from cell import Cell
from coord import Coord 
from configreader import ConfigReader
import route
import json
import datetime
config = ConfigReader("settings.conf")
api_key = config.apikey


#start_loc = Coord(38.9975396, -76.9546925)
#end_loc = Coord(40.7143528, -74.0059731)
#routefinder = Routefinder(api_key)

#route = routefinder.find_route(start_loc, end_loc)
#for coord in route.coord_list:
#    print(coord.lat, coord.lon)
#print(route.length_miles)

# ----------- Route and Javascript generation -------------------

grid = CellGrid(Coord(39.0095, -77.16796), Coord(38.8044, -76.89331), grid_width=5, grid_height=5)
#print(grid.to_geojson())

grid_routes = grid.get_routes_for_all_cells()


routes_by_cell = [] # A list where each element is a list of routes for one cell
all_routes = [] # A list of all routes for every cell

# Populate routes_by_cell and all_routes
for currentcellroutes in grid_routes:
    routes_by_cell.append(route.route_list_to_geojson(currentcellroutes))
    for rte in currentcellroutes:
        all_routes.append(rte)

# Generate javascript code that creates an array with each element containing the
# geojson representation of the routes for a single cell
jscode = ""
idx = 0
for cellroutecollection in routes_by_cell:
    jscode = jscode + "streets["+str(idx)+"] = " + routes_by_cell[idx]
    jscode = jscode + ";\n"
    idx += 1
print(jscode)

jscode_filename = 'route_jscode-{date:%Y-%m-%d %H:%M:%S}.js'.format( date=datetime.datetime.now() )
with open(jscode_filename, "w") as text_file:
    text_file.write(jscode)

# Generate geojson representation of all routes for all cells
geojson_filename = 'route_geojson-{date:%Y-%m-%d %H:%M:%S}.geojson'.format( date=datetime.datetime.now() )
geojson_code = route.route_list_to_geojson(all_routes)
with open(geojson_filename, "w") as text_file:
    text_file.write(geojson_code)



