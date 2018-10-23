/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   LatLng.cpp
 * Author: forest
 * 
 * Created on December 23, 2017, 5:32 PM
 */

#include "LatLng.h"

LatLng::LatLng(double lat, double lng) {
    this->lat = lat;
    this->lng = lng;
}

LatLng::LatLng(){
}

LatLng::LatLng(const LatLng& orig) {
}

LatLng::~LatLng() {
}

