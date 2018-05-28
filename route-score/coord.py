from configreader import ConfigReader
import routefinder

import googlemaps

class Coord:
    def __init__(self, lat, lon):
        self.lon = lon
        self.lat = lat
        self.config = ConfigReader("settings.conf")
        self.api_key = self.config.apikey
        self.client = googlemaps.Client(key=self.api_key)

    def get_destinations_from_coord(self, search_queries=["grocery", "restaurant", "school", "coffee", "park", "museum", "hospital"], num_to_find=1):
        destination_coords = []
        for query in search_queries:
            response = self.client.places(
                query, 
                location=(self.lat, self.lon),
                radius = 1609)
            if len(response['results']) == 0:
                continue
            
            # For each query, retrieve up to num_to_find_results
            for i in range(0, num_to_find):
                if len(response['results']) > i:
                    poi_location = response['results'][i]['geometry']['location']
                    destination_coords.append(Coord(poi_location['lat'], poi_location['lng']))
                else:
                    break
        return destination_coords

    def get_routes_to_destinations(self, destination_coord_list):
        routes = []
        routecalculator = routefinder.Routefinder(self.api_key)
        for coord in destination_coord_list:
            route = routecalculator.find_route(self, coord)
            if route is not None and route.length_miles < 1.5:
                routes.append(route)
        
        return routes


    
