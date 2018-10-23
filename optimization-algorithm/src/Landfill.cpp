/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Landfill.cpp
 * Author: forest
 * 
 * Created on December 15, 2017, 6:09 PM
 */

#include "Landfill.h"
#include <string>

using namespace std;


int Landfill::num_of_landfills = 0;

Landfill::Landfill(double lat, double lng):lat(lat), lng(lng){
    ++num_of_landfills;
}

Landfill::Landfill(const Landfill& orig):Destination(orig) {
}

Landfill::~Landfill() {
}

void Landfill::reset_static_variables(){
    
    num_of_landfills=0;
}