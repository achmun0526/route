/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 * 
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/* 
 * File:   Route_Statistics.cpp
 * Author: forest
 * 
 * Created on January 21, 2018, 8:45 PM
 */

#include "Route_Statistics.h"

Route_Statistics::Route_Statistics() {
}

Route_Statistics::Route_Statistics(const Route_Statistics& orig) {
}

Route_Statistics::~Route_Statistics() {
}

void Route_Statistics::insert_route_statistic(vector<string> route, vector<double> ind_distance, vector<double> ind_time, double total_distance, double total_time){
    routes.push_back(route);
    dist_btw_routes.push_back(ind_distance);
    time_btw_routes.push_back(ind_time);
    total_distances.push_back(total_distance);
    total_times.push_back(total_time);
    num_of_route_stats++;
}

vector<string> Route_Statistics::get_route_at(int route_num){
    return routes.at(route_num);
}

vector<double> Route_Statistics::get_btw_distances_at(int route_num){
    return dist_btw_routes.at(route_num);
}

vector<double> Route_Statistics::get_btw_durations_at(int route_num){
    return time_btw_routes.at(route_num);
}

double Route_Statistics::get_total_distance_at(int route_num){
    return total_distances.at(route_num);
}

double Route_Statistics::get_total_duration_at(int route_num){
    return total_times.at(route_num);
}

void Route_Statistics::print_statistics(int route_number){
    vector<string> route = routes.at(route_number);
    vector<double> ind_distances = dist_btw_routes.at(route_number);
    vector<double> ind_time = time_btw_routes.at(route_number);
    double total_distance = total_distances.at(route_number)/1609.3;
    double total_time = total_times.at(route_number)/3600;
    
    cout << "Route: "; print_vector(route); cout << endl;
    cout << "Distance between destinations: "; print_vector(ind_distances); cout << endl;
    cout << "Time between destinations: "; print_vector(ind_time); cout << endl;
    cout << "Total Distance Traveled: " << total_distance << " miles" << endl;
    cout << "Total Time: " << total_time << " hours" << endl;
    
}