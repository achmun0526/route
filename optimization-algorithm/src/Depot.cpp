/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Depot.cpp
 * Author: forest
 * 
 * Created on December 15, 2017, 6:12 PM
 */

#include "Depot.h"

int Depot::num_of_depots=0;

Depot::Depot(double lat, double lng):lat(lat),lng(lng){
    num_of_depots++;
}

Depot::Depot(const Depot& orig):Destination(orig) {
}

Depot::~Depot() {
}
void Depot::reset_static_variables(){
    num_of_depots=0;
}