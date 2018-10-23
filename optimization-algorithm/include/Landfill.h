/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Landfill.h
 * Author: forest
 *
 * Created on December 15, 2017, 6:09 PM
 */

#ifndef LANDFILL_H
#define LANDFILL_H

#include "Destination.h"
#include <string>

using namespace std;

class Landfill : public Destination{
public:
    static int num_of_landfills;
    string id;
    string gm_id;
    double lat;
    double lng;
    
    Landfill(double,double);
    Landfill(const Landfill& orig);
    virtual ~Landfill();
    
    static void reset_static_variables();
private:

};

#endif /* LANDFILL_H */

