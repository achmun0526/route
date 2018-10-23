/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Depot.h
 * Author: forest
 *
 * Created on December 15, 2017, 6:12 PM
 */
#include "Destination.h"
#include <string>

//namespace

using std::string;

#ifndef DEPOT_H
#define DEPOT_H

class Depot : public Destination{
public:
    double lat;
    double lng;
    string id;
    string gm_id;
    static int num_of_depots;
    
    Depot(double,double);
    Depot(const Depot& orig);
    virtual ~Depot();
    
    static void reset_static_variables();
private:

};

#endif /* DEPOT_H */

