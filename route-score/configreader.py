import configparser
class ConfigReader:
    def __init__(self, filename):
        self.Config = configparser.ConfigParser()
        self.Config.read(filename)
        self.apikey = self.ConfigSectionMap("api")['key']

    def ConfigSectionMap(self, section):
        dict1 = {}
        options = self.Config.options(section)
        for option in options:
            try:
                dict1[option] = self.Config.get(section, option)
                if dict1[option] == -1:
                    print("Error reading config")
            except:
                print("exception on %s!" % option)
                dict1[option] = None
        return dict1

