/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Destination.h
 * Author: forest
 *
 * Created on December 15, 2017, 6:45 PM
 */
#include <cstdlib>
#include <string>

// namespace declarations
using std::string;

#ifndef DESTINATION_H
#define DESTINATION_H

class Destination {
    
protected:
   double lat;
   double lng;
   string id;
   string gm_id;
   string place_id;
public:

    Destination();
    Destination(const Destination& orig);
    virtual ~Destination();
    
    void set_member_variables(double,double,string);
    double get_lat(void);
    double get_lng(void);
    string get_id(void);
private:

};

#endif /* DESTINATION_H */

