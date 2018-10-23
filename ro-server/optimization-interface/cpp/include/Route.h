/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Route.h
 * Author: forest
 *
 * Created on December 19, 2017, 1:18 PM
 */

#include <vector>
#include <string>
#include <iostream>
#include "Helper_Functions.h"

using namespace std;

#ifndef ROUTE_H
#define ROUTE_H

class Route {
public:
        
    Route(vector<vector<string>>, vector<double>);
    Route();
    Route(const Route& orig);
    virtual ~Route();
    
    vector<string> get_best_route_sequence();
    vector<string> get_next_route_sequence();
    vector<vector<string>> get_X_routes(int);
    double get_route_distance();
    vector<vector<string>> get_top_ten_routes();
    double sum_distances();
    void display_all_routes();
    int num_of_routes;  
private:
    static int current_route;
    vector<double> distances;
    vector<vector<string>> potential_routes;

};

#endif /* ROUTE_H */

