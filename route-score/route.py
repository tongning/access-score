import polyline
import coord
import numpy as np
import pandas as pd
import pprint
from geojson import LineString, Feature, FeatureCollection

def route_list_to_geojson(route_list):
    features = []
    latlng_tuples = []
    for route in route_list:
        if route is None:
            continue
        for coord in route.coord_list:
            if coord is None:
                continue
            latlng_tuples.append((coord.lon, coord.lat))

        features.append(Feature(properties={"length": route.length_miles}, geometry=LineString(latlng_tuples)))
        latlng_tuples = []
    
    feature_collection = FeatureCollection(features)
    return str(feature_collection)

class Route():
    def __init__(self, gmaps_response_json):
        self.api_response = gmaps_response_json
        self.steps = self.get_steps_from_response()
        self.coord_list = self.get_coord_list_from_steps(self.steps)
        self.length_miles = self.get_length_miles()

    def get_steps_from_response(self):
        response_obj = self.api_response[0]
        steps = response_obj['legs'][0]['steps']
        return steps

    def get_coord_list_from_steps(self, steps):
        result_coord_list = []
        for step in steps:
            result_coord_list += self.get_coord_list_for_step(step)
        return result_coord_list

    def get_coord_list_for_step(self, step):
        step_path_encoded = step['polyline']['points']
        step_path_decoded = polyline.decode(step_path_encoded)
        step_coord_list = []
        for point in step_path_decoded:
            step_coord_list.append(coord.Coord(point[0], point[1]))
        
        return step_coord_list

    def get_length_miles(self):
        length_meters = 0.0
        for step in self.steps:
            step_length_meters = int(step['distance']['value'])
            length_meters += step_length_meters
        length_miles = length_meters * 0.000621371
        return length_miles

    







        