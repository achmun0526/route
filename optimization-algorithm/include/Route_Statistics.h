/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Route_Statistics.h
 * Author: forest
 *
 * Created on January 21, 2018, 8:45 PM
 */


#include <vector>
#include <string>
#include "Helper_Functions.h"


using std::string; using std::vector;

#ifndef ROUTE_STATISTICS_H
#define ROUTE_STATISTICS_H

class Route_Statistics {
public:
    Route_Statistics();
    Route_Statistics(const Route_Statistics& orig);
    virtual ~Route_Statistics();
    
    void insert_route_statistic(vector<string> route, vector<double> ind_distance,vector<double> ind_time, double total_distance, double total_time);
    void print_statistics(int);
    vector<string> get_route_at(int);
    vector<double> get_btw_distances_at(int);
    vector<double> get_btw_durations_at(int);
    double get_total_distance_at(int);
    double get_total_duration_at(int);
    int num_of_route_stats = 0;
private:

    vector<vector<string>> routes;
    vector<double> total_distances;
    vector<double> total_times;
    vector<vector<double>> dist_btw_routes;
    vector<vector<double>> time_btw_routes;
};

#endif /* ROUTE_STATISTICS_H */

