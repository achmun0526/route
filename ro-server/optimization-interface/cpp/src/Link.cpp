// <!-- * Copyright (c) [2018], Forest Schwartz. All rights reserved
// *
// * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author. -->

#include <iostream>
#include "Link.h"
#include <Service.h>





string link(vector<service_order> node_service_orders, vector<landfill> node_landfill,vector<depot> node_depot, int num_of_trucks,int num_of_iterations){
  order_results order_result;
  vector<Service*> services;
  vector<Landfill*> landfills;
  vector<Depot*> depots;
  for(int i=0;i<node_service_orders.size();i++){
   service_order current_service_order = node_service_orders[i];
   string type = current_service_order.type;
   if(type=="1"){
     type = "d";
   }else if(type=="2"){
     type="p";
   }else if(type=="3"){
    type= "s";
   }
   Service* s = new Service(current_service_order.latitude,current_service_order.longitude,type,current_service_order.size);
   services.push_back(s);
  }
  for(int i=0;i<node_landfill.size();i++){
   landfill current_landfill = node_landfill[i];
   Landfill* l = new Landfill(current_landfill.latitude,current_landfill.longitude);
   landfills.push_back(l);
  }

  for(int i=0;i<node_depot.size();i++){
   depot current_depot = node_depot[i];
   Depot* d = new Depot(current_depot.latitude,current_depot.longitude);
   depots.push_back(d);
  }



     // Testing Brute Force Route Finder
     Route_Finder routeFinder = Route_Finder(services, landfills, depots, num_of_trucks);
     routeFinder.set_truck_home_depot("H0");
     cout << "about to start the algorithm "  << endl;
     string json_data = routeFinder.random_sequential_sort3(num_of_iterations);

  return json_data;
}
