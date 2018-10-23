/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Route_Finder.h
 * Author: forest
 *
 * Created on December 13, 2017, 6:55 PM
 */

#include "Service.h"
#include "Landfill.h"
#include "Depot.h"
#include "Destination.h"
#include <vector>
#include "Route.h"
#include <iostream>
#include <numeric>
#include <stdio.h>
#include <algorithm>
#include <stdlib.h>
#include <cstdlib>
#include <sstream>
#include <vector>
#include <math.h>
#include "Route.h"
#include "LatLng.h"
#include <array>
#include <string>
#include <iterator>
#include "File_Handler.h"
#include <map>
#include "Helper_Functions.h"


#ifndef ROUTE_FINDER_H
#define ROUTE_FINDER_H

// namespace statements
using std::array; using std::size_t; using std::stoi; using std::string; using std::vector;

class Route_Finder {
public:
    Route_Finder(vector<Service*>, vector<Landfill*>, vector<Depot*>, int num_of_trucks);
    Route_Finder(const Route_Finder& orig);
    virtual ~Route_Finder();
    
    void radial_reduction_sort(int);
    void set_truck_home_depot(string);
    string random_sequential_sort(int);
    string random_sequential_sort2(int);
    string random_sequential_sort3(int);
    void systematic_sort(int);


private:
    map<string, Destination*> destination_map;
    vector<string> filter_possibilities(vector<string>&);
    vector<vector<string>> add_land_fills(vector<vector<int>>&);
    vector<vector<string>> add_land_fills(vector<vector<string>>&);
    vector<vector<int>> combine_sets(vector<vector<int>>&,vector<vector<int>>&, vector<vector<int>>&,
    vector<vector<int>>&,vector<vector<int>>&,vector<vector<int>>&, vector<vector<int>>&, vector<vector<int>>&,vector<vector<int>>&);
    vector<double> analyze_distance(vector<vector<string>>&);
    vector<vector<string>> eliminate_land_fills(vector<vector<string>>&);
    vector<string> eliminate_land_fills(vector<string>&);
    vector<vector<string>>  test_size_permutations(vector<vector<string>>&);
    vector<vector<string>> optimize_land_fills(vector<vector<string>>&);
    void display_truck_services(vector<int>*);
    vector<vector<string>> brute_force(vector<vector<int>>);
    Route  find_best_routes(vector<double>&, vector<vector<string>>&);
    vector<vector<string>>  random_ruin_and_recreate(vector<vector<string>>&);
    vector<vector<string>>  random_ruin_and_recreate2(vector<vector<string>>&);
    vector<vector<string>>  random_ruin_and_recreate3(vector<vector<string>>&);
    vector<vector<int>>  random_ruin_and_recreate4(vector<vector<int>>&);
    vector<vector<int>>  radial_weighted_cluster_2(int);
    vector<vector<int>> sequential_cluster();
    vector<vector<int>> initial_cluster();
    vector<vector<int>> initial_single_cluster();
    vector<vector<string>> systematic_sequence_finder(int, vector<int>,int);
    vector<string> systematic_sequence_finder1(int, vector<int>);
    vector<vector<string>> eliminate_used_services(vector<vector<string>>&,vector<vector<string>>&);
    vector<int> divide_services_evenly();
    vector<vector<string>> split_single_route(vector<Route_Statistics*>);
    string data_to_json(vector<Route_Statistics*>);
    vector<vector<string>> split_sequence_evenly(vector<string>);
    vector<vector<int>> split_sequence_evenly2(vector<int>);
    
    int num_of_trucks;
    string truck_specified_depot;
    vector<Service*> services;
    vector<Landfill*> landfills;
    vector<Depot*> depots;
};

#endif /* ROUTE_FINDER_H */

