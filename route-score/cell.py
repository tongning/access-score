from coord import Coord
from geojson import Polygon, Feature
from random import randint
class Cell:
    def __init__(self, top_left_coord, bottom_right_coord):
        self.left_bound_lon = top_left_coord.lon
        self.right_bound_lon = bottom_right_coord.lon
        self.top_bound_lat = top_left_coord.lat
        self.bottom_bound_lat = bottom_right_coord.lat
        self.center_coord = self.compute_center_coord()
        self.CurbRamp = []
        self.NoCurbRamp = []
        self.Obstacle = []
        self.SurfaceProblem = []
        self.Other = []
        self.Occlusion = []
        self.NoSidewalk = []
        self.raw_score = None
        self.scaled_score = None
        self.route_length_miles = None

    def compute_raw_score(self):
        curr_score = 0
        cr = self.CurbRamp
        curr_score += cr[0]*5 + cr[1]*4 + cr[2]*3 + cr[3]*2 + cr[4]
        ncr = self.NoCurbRamp
        curr_score += ncr[0]*(-1) + ncr[1]*(-2) + ncr[2]*(-3) + ncr[3]*(-4) + ncr[4]*(-5)
        obs = self.Obstacle
        curr_score += obs[0]*(-1) + obs[1]*(-2) + obs[2]*(-3) + obs[3]*(-4) + obs[4]*(-5)
        sfp = self.SurfaceProblem
        curr_score += sfp[0]*(-1) + sfp[1]*(-2) + sfp[2]*(-3) + sfp[3]*(-4) + sfp[4]*(-5)
        nsw = self.NoSidewalk
        curr_score += nsw[0]*(-1) + nsw[1]*(-2) + nsw[2]*(-3) + nsw[3]*(-4) + nsw[4]*(-5)
        if self.route_length_miles == None or self.route_length_miles == 0:
            self.raw_score = 0
        else:
            self.raw_score = curr_score / self.route_length_miles

    def compute_center_coord(self):
        center_lon = (self.left_bound_lon + self.right_bound_lon)/2.0
        center_lat = (self.top_bound_lat + self.bottom_bound_lat)/2.0
        return Coord(center_lat, center_lon)

    def generate_routes(self):
        center = self.compute_center_coord()
        destinations = center.get_destinations_from_coord()
        routes = center.get_routes_to_destinations(destinations)
        self.routes = routes
        return routes

    def generate_geojson_feature(self):
        return Feature(properties={"score": self.scaled_score, "CurbRamp" : self.CurbRamp, "NoCurbRamp": self.NoCurbRamp, "Obstacle": self.Obstacle, "SurfaceProblem": self.SurfaceProblem, "Other": self.Other, "Occlusion": self.Occlusion, "NoSidewalk": self.NoSidewalk, "length_miles": self.route_length_miles}, geometry=Polygon([[(self.left_bound_lon, self.top_bound_lat), (self.right_bound_lon, self.top_bound_lat), 
                (self.right_bound_lon, self.bottom_bound_lat), (self.left_bound_lon, self.bottom_bound_lat),(self.left_bound_lon, self.top_bound_lat)]]))
