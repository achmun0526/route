/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Route.cpp
 * Author: forest
 * 
 * Created on December 19, 2017, 1:18 PM
 */


#include "Route.h"

int to_int(string);
vector<string> sub_vector(vector<string>&);
int index_of_largest_element(double, int);

int Route::current_route = 0;

Route::Route(vector<vector<string>> potential_routes, vector<double> distances){
    this->distances=distances;
    this->potential_routes = potential_routes;
    num_of_routes = potential_routes.size();

}

Route::Route(){

}

Route::Route(const Route& orig) {
}

Route::~Route() {
}

vector<string> Route::get_best_route_sequence(){
    vector<string> current_route_str = potential_routes[0];
    return current_route_str;
}

vector<string> Route::get_next_route_sequence(){
    ++current_route;
    vector<string> current_route_str = potential_routes[current_route];
    return current_route_str;
}

double Route::get_route_distance(){
    double current_route_distance = distances[current_route];
    return current_route_distance;
}

vector<vector<string>> Route::get_top_ten_routes(){
    vector<vector<string>> top_routes;
    for(int i=0;i<10;i++){

        top_routes.push_back(potential_routes[i]);
    }

    return top_routes;
}



vector<vector<string>> Route::get_X_routes(int num_of_routes_to_get){
    vector<vector<string>> route_list;
    for(int i=0;i<num_of_routes_to_get;i++){
        vector<string> route = potential_routes[i];
        route_list.push_back(route);
    }
    return route_list;
}

double Route::sum_distances(){
    double sum(0);
    for(int i=0;i<num_of_routes;i++){
        sum+=distances[i];
    }
    return sum;
}

void Route::display_all_routes(){
    
    for(int i=0;i<num_of_routes;i++){
        cout << "Route: " << endl;
        cout << distances[i] << endl;
        print_vector(potential_routes[i]);
    }

}