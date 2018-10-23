/*
 * This class is meant to spit out and parse files.
 */

/* 
 * File:   File_Handler.h
 * Author: forest
 *
 * Created on January 4, 2018, 12:02 AM
 */
#include <cstdlib>
#include "Route.h"
#include <map>
#include "Destination.h"
#include "Depot.h"
#include "Service.h"
#include "Landfill.h"
#include <sstream>
#include <fstream>
#include <string>
#include "GM_Handler.h"
#include "Route_Statistics.h"

// using namespaces
using std::endl; using std::string; using std::ifstream; using std::exception;

#ifndef FILE_HANDLER_H
#define FILE_HANDLER_H

class File_Handler {
public:
    File_Handler();
    File_Handler(const File_Handler& orig);
    virtual ~File_Handler();
    
    void create_csv(Route&);
    void create_csv(Route_Statistics&);
    void create_csv(vector<Route_Statistics*>&);
    vector<Service*> generate_services();
    vector<Landfill*> generate_landfills();
    vector<Depot*> generate_depots();
    
    vector<Destination*> destinations;
private:
    static vector<Service*> services;
    static vector<Landfill*> landfills;
    static vector<Depot*> depots;
    int num_of_trucks;
    GM_Handler gm_handle;
    vector<vector<string>> read_csv(string);
    vector<vector<string>> parse_services(void);
    static int check1;
    static int check2;
    static int check3;

};

#endif /* FILE_HANDLER_H */

