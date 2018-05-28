import coord
import googlemaps
from route import Route
class Routefinder:
    def __init__(self, api_key):
        self.api_key = api_key
        self.client = googlemaps.Client(key=api_key)
    
    def find_route(self, start_coord, end_coord):
        directions_result = self.client.directions(
            (start_coord.lat, start_coord.lon),
            (end_coord.lat, end_coord.lon), 
            mode="walking")

        if(len(directions_result) == 0):
            return None
        
        return Route(directions_result)
