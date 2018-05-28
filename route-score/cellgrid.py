from __future__ import print_function
from cell import Cell
from coord import Coord
from geojson import Point, Feature, FeatureCollection
import sys
import json

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

class CellGrid:
    def __init__(self, top_left_coord, bottom_right_coord, grid_width=20, grid_height=20):
        self.left_bound_lon = top_left_coord.lon
        self.right_bound_lon = bottom_right_coord.lon
        self.top_bound_lat = top_left_coord.lat
        self.bottom_bound_lat = bottom_right_coord.lat
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.cells = self.generate_cells()

    def generate_cells(self):
        lon_delta = (self.right_bound_lon - self.left_bound_lon)/(self.grid_width)
        lat_delta = (self.bottom_bound_lat - self.top_bound_lat)/(self.grid_height)
        curr_lon = self.left_bound_lon
        curr_lat = self.top_bound_lat
        cell_list = []
        for i in range(0,self.grid_width):
            for j in range(0, self.grid_height):
                cell = self.generate_cell(curr_lat, curr_lon, lat_delta, lon_delta)
                cell_list.append(cell)
                curr_lon += lon_delta
            curr_lat += lat_delta
            curr_lon = self.left_bound_lon
        return cell_list

    def generate_cell(self, curr_lat, curr_lon, lat_delta, lon_delta):
        top_left = Coord(curr_lat, curr_lon)
        bottom_right = Coord(curr_lat+lat_delta, curr_lon+lon_delta)
        return Cell(top_left, bottom_right)

    def load_javascript_analysis_json(self, analysis_json):
        analysis = json.loads(analysis_json)
        cell_data_objects = analysis['data']
        idx = 0
        for cell in self.cells:
            cell_route_stats = cell_data_objects[idx]
            cell.CurbRamp = cell_route_stats['CurbRamp']
            cell.NoCurbRamp = cell_route_stats['NoCurbRamp']
            cell.Obstacle = cell_route_stats['Obstacle']
            cell.SurfaceProblem = cell_route_stats['SurfaceProblem']
            cell.Other = cell_route_stats['Other']
            cell.Occlusion = cell_route_stats['Occlusion']
            cell.NoSidewalk = cell_route_stats['NoSidewalk']
            cell.route_length_miles = cell_route_stats['length']
            idx += 1

    def to_geojson(self):
        cell_centers_list = []
        for cell in self.cells:
            cell_centers_list.append(cell.compute_center_coord())
        return self.coord_list_to_geojson(cell_centers_list)

    def coord_list_to_geojson(self, coord_list):
        features = []
        for coord in coord_list:
            features.append(Feature(geometry=Point((coord.lon, coord.lat))))
        for cell in self.cells:
            features.append(cell.generate_geojson_feature())

        feature_collection = FeatureCollection(features)
        return str(feature_collection)

    def generate_scaled_scores_zero_to_one(self):
        raw_scores = []
        for cell in self.cells:
            cell.compute_raw_score()
            raw_scores.append(cell.raw_score)
        max_val = max(raw_scores)
        min_val = min(raw_scores)
        for cell in self.cells:
            cell.scaled_score = (cell.raw_score - min_val)/(max_val - min_val)
            #print(cell.scaled_score)

    def get_routes_for_all_cells(self):
        all_routes = []
        current_cell_routes = []
        cell_num = 1
        total_cells = len(self.cells)
        for cell in self.cells:
            eprint("Generating routes for cell")
            cell.generate_routes()
            eprint("Finished generating routes")
            for route in cell.routes:
                current_cell_routes.append(route)
            eprint("Found routes for cell "+str(cell_num)+" of "+str(total_cells)+" cells")
            cell_num += 1
            all_routes.append(current_cell_routes)
            current_cell_routes = []
        
        return all_routes