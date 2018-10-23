/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 * 
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/* 
 * File:   GM_Handler.h
 * Author: forest schwartz
 *
 * Created on January 7, 2018, 10:38 PM
 */

#include <string>
#include <vector>
#include <iostream>
#include "Service.h"
#include "Landfill.h"
#include "Depot.h"
#include <sstream>
#include <stdlib.h>
#include "curl/curl.h"
#include "Route_Statistics.h"
#include "Helper_Functions.h"

//namespace declarations
using std::string; using std::istringstream; using std::cout; using std::endl; 
using std::vector; using std::cin; using std::pair;

#ifndef GM_HANDLER_H
#define GM_HANDLER_H

class GM_Handler {
public:
    // constructors/destructors
    GM_Handler(vector<Service*>, vector<Landfill*>,vector<Depot*>); // certain functions require this constructor
    GM_Handler();
    GM_Handler(const GM_Handler& orig);
    virtual ~GM_Handler();
    // functions
    vector<vector<double>> get_coordinates(vector<string>);
    vector<vector<double>> get_coordinates_sid(vector<string>,string,vector<string>);
    string get_place_id(string);
    vector<double> get_lat_lng(string);
    void get_distance_ll(vector<double>,vector<double>);
    vector<double> get_distance_and_time(string,string);
    vector<double> get_distance_and_time(vector<double>,vector<double>);
    void set_api_key(string);
    void get_route_statistics(vector<string>, Route_Statistics&);  // In order to use this function the constructor with the vector<*> must be used
    void get_company();

private:
    // functions
    vector<double> get_lat_lng_sid(string,string,int);
    vector<double> get_symbols_lat_lng(string);
    // variables
    static map<string,string> place_id_map;
    static vector<string> place_id_list;
    string api_key;
    vector<Service*> services;
    vector<Landfill*> landfills;
    vector<Depot*> depots;

};

#endif /* GM_HANDLER_H */

