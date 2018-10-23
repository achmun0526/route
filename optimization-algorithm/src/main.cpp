/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 * 
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/*
 * File:   main.cpp
 * Author: forest schwartz
 *
 * Created on December 12, 2017, 7:09 PM
 */

//#define DEBUG



#include "Service.h"
#include "Landfill.h"
#include "Depot.h"
#include "Route_Finder.h"
#include "GM_Handler.h"
#include <iostream>





int main(int argc, char *argv[]) {
    
  vector<Service*> services;
  vector<Landfill*> landfills;
  vector<Depot*> depots;
  

//  
    Service* s0 = new Service(29.359462,-98.6342722,"s",11);
    Service* s1 = new Service(29.6235848,-98.064129,"d",15);
    Service* s2 = new Service(29.424122,-98.493629,"p",15);
    Service* s3 = new Service(29.372826,-98.296357,"s",15);
    Service* s4 = new Service(29.3711027,-98.2880998,"p",20);
    Service* s5 = new Service(29.411419,-98.16262599999999,"p",20);
    Service* s6 = new Service(29.39595199999999,-98.19334,"p",20);
    Service* s7 = new Service(29.533603,-98.27480299999999,"d",20);

    
    Landfill* l0 = new Landfill(29.359462,-98.6342722);
    Landfill* l1 = new Landfill(29.5531453,-98.2674141);
    
    Depot* d0 = new Depot(29.377103,-98.303581);
//    
//
    
    cout << "creating services, landfills, and depots objects" << endl;
    services.push_back(s0); services.push_back(s1); services.push_back(s2); services.push_back(s3);services.push_back(s4);
    services.push_back(s5); services.push_back(s6); services.push_back(s7);
    
    landfills.push_back(l0); landfills.push_back(l1); 
    depots.push_back(d0);
//    

//    // Testing Brute Force Route Finder
    cout<< "route finder" << endl;
    Route_Finder routeFinder = Route_Finder(services, landfills, depots,2);
    routeFinder.set_truck_home_depot("H0");
    routeFinder.random_sequential_sort3(1000);

}
