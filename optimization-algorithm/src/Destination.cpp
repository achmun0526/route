/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Destination.cpp
 * Author: forest
 * 
 * Created on December 15, 2017, 6:45 PM
 */

#include "Destination.h"



Destination::Destination(){
}

Destination::Destination(const Destination& orig) {
}

Destination::~Destination() {
}

void Destination::set_member_variables(double t_lat, double t_lng,string t_id){
    
    lat = t_lat;
    lng=t_lng;
    id=t_id;
}

double Destination::get_lat(){

    return lat;
}

double Destination::get_lng(){
    return lng;
}

string Destination::get_id(){
    return id;
}