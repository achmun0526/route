/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   LatLng.h
 * Author: forest
 *
 * Created on December 23, 2017, 5:32 PM
 */

#ifndef LATLNG_H
#define LATLNG_H

class LatLng {
public:
    LatLng(double, double);
    LatLng();
    LatLng(const LatLng& orig);
    virtual ~LatLng();
    double lat;
    double lng;
private:
    
};

#endif /* LATLNG_H */

