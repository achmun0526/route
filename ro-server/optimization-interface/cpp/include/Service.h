/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 * 
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/* 
 * File:   service.h
 * Author: forest
 * 
 * This Class service is a representation of a Delivery, Pickup, Swap, or Landfill
 * it contains latitude longitude coordinates and its type of service
 *
 * Created on December 13, 2017, 5:03 PM
 */
#include <string>
#include <stdint.h>
#include "Destination.h"
#include <vector>
#include <set>
#include <stdexcept>


#ifndef SERVICE_H
#define SERVICE_H

using namespace std;

class Service : public Destination {

public:
    static set<uint8_t> size_bag;
    static vector<string> type_reference;  // hold the type of service in vector for me to reference later
    int id;
    string gm_id;
    static int numberOfServices;
    string address;
    string type;
    double lat;
    double lng;
    uint8_t size;
    string place_id;
    
    Service(double, double, string, int);
    Service(const Service& orig);
    virtual ~Service();
    
    void addAddress(string);
    void set_place_id(string);
    static int getNumberOfServices();
    static void reset_static_variables();
private:
    typedef Destination super;




};

#endif /* SERVICE_H */

