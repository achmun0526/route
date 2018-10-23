/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   File_Handler.cpp
 * Author: forest
 * 
 * Created on January 4, 2018, 12:02 AM
 */

#include "File_Handler.h"
// Function Prototypes
int to_int(string);
vector<string> sub_vector(vector<string>&);
int index_of_largest_element(double*, int);

int File_Handler::check1=0;
int File_Handler::check2=0;
int File_Handler::check3=0;
vector<Service*> File_Handler::services;
vector<Landfill*> File_Handler::landfills;
vector<Depot*> File_Handler::depots;

File_Handler::File_Handler()
{
    cout.precision(20);
    string api_key = "AIzaSyCLPxyggFNCgUi2-Vs4z_DMPinxi7bju0Q"; // tx dumpsters
    gm_handle.set_api_key(api_key);  
}

File_Handler::File_Handler(const File_Handler& orig) {
}

File_Handler::~File_Handler() {
}

// Creates data sheet for just one route statistic
void File_Handler::create_csv(Route_Statistics& route_data){

    int num_of_stats = route_data.num_of_route_stats;
    vector<string> route;
    vector<double> btw_route_dist;
    vector<double> btw_route_time;
    double total_distance;
    double total_time;
    string current_destination;
    // declaring output file
    std::ofstream data_file("route_data.csv");
    for(int i=0;i<num_of_stats; i++){
        data_file << "Truck: " << i  << endl;
        route = route_data.get_route_at(i);
        btw_route_dist = route_data.get_btw_distances_at(i);
        btw_route_time = route_data.get_btw_durations_at(i);
        total_distance = route_data.get_total_distance_at(i);
        total_time = route_data.get_total_duration_at(i);
        
    
        data_file << "Route";
        for(int j=0;j<route.size();j++){
            current_destination = route.at(j);
            data_file << " " << current_destination; 
        } 
        data_file << endl;
        data_file << "Distance between destinations: "; 
        for(int j=0;j<btw_route_dist.size();j++){
            data_file << " " << btw_route_dist.at(j)/1609.34;
        } data_file << endl;
        data_file << "Time between destinations: ";
        for(int j=0;j<btw_route_time.size();j++){
            data_file << " " << btw_route_time.at(j)/3600;
        } data_file << endl;
        
        data_file << "Total distance traveled by truck " << i << " :" << total_distance/1609 << " miles" << endl;
        data_file << "Total time traveled by truck " << i << " :"<< total_time/3600 << " hours" << endl<<endl<<endl;
    }
    
    data_file.close();
    cout << "finished writing to file." << endl;
}
   
// Creates a data sheet for a list of route statistics
void File_Handler::create_csv(vector<Route_Statistics*>& route_data_input){

    int num_of_stats;
    int num_of_truck_routes = route_data_input.size();
    Route_Statistics* route_data;
    vector<string> route;
    vector<double> btw_route_dist;
    vector<double> btw_route_time;
    double total_distance;
    double summed_distance;
    double summed_time;
    double total_time;
    string current_destination;
    // declaring output file
    std::ofstream data_file("route_data.csv");

    for(int t=0;t<num_of_truck_routes;t++){
        route_data = route_data_input.at(t);
        num_of_stats= route_data->num_of_route_stats;
        summed_distance =0;
        summed_time =0;
        data_file << "------------------------Route: " << t << "-----------------"<< endl;
        for(int i=0;i<num_of_stats; i++){
            data_file << "Truck: " << i  << endl;
            route = route_data->get_route_at(i);
            btw_route_dist = route_data->get_btw_distances_at(i);
            btw_route_time = route_data->get_btw_durations_at(i);
            total_distance = (route_data->get_total_distance_at(i)/1609.34);
            summed_distance+=total_distance;
            total_time = (route_data->get_total_duration_at(i)/3600);
            summed_time+=total_time;
            data_file << "Route";
            for(int j=0;j<route.size();j++){
                current_destination = route.at(j);
                data_file << " " << current_destination; 
            } 
            data_file << endl;
            data_file << "Distance between destinations: "; 
            for(int j=0;j<btw_route_dist.size();j++){
                data_file << " " << (btw_route_dist.at(j)/1609.34);
            } data_file << endl;
            data_file << "Time between destinations: ";
            for(int j=0;j<btw_route_time.size();j++){
                data_file << " " << (btw_route_time.at(j)/3600);
            } data_file << endl;

            data_file << "Total distance traveled by truck " << i << " :" << total_distance << " miles" << endl;
            data_file << "Total time traveled by truck " << i << " :"<< total_time << " hours" << endl;
        }
        data_file << "Summed Time: " << summed_time << endl;
        data_file << "Summed Distance: " << summed_distance << endl << endl << endl;
    }
    data_file.close();
    cout << "finished writing to file." << endl;
    //delete(&route_data_input);
}
// Creates a csv sheet to display routes
void File_Handler::create_csv(Route& this_route){

    if((check1==1)and (check2==1)and (check3==1)){
    
    vector<string> current_route;
    Landfill* landfill;
    Service* service;
    Depot* depot;
    string destination;
    string check;
    string size;
    int route_length;
    int dest_int;
    string dumpster_check;
    string landfill_num_str;
    int landfill_num_int;
    // declaring output file
    std::ofstream data_file("routes.csv");

    for(int i=0;i<this_route.num_of_routes; i++){
        current_route = this_route.get_next_route_sequence();
        route_length = current_route.size();
        data_file << "Truck: " << i  << endl;
        for(int j=0;j<route_length;j++){
           destination=current_route.at(j);
           dumpster_check = destination.substr(0,1);

           if(dumpster_check =="L"){
               landfill_num_str = destination.substr(1,1);
               landfill_num_int = to_int(landfill_num_str);
               landfill = landfills[landfill_num_int];
               data_file << "Landfill "<< landfill_num_str<< " : " << landfill->lat << " " << landfill->lng << endl;
           }else if(destination =="H"){
               depot = depots[0];
               data_file << "Depot: " << depot->lat << " " << depot->lng << endl;
           }else{
               dest_int = to_int(destination);
               service = services[dest_int];
               size = to_string(service->size);
               data_file << "Service " << service->id<< ":" << " " << service->lat<< " " << service->lng
                       << " " << service->type << " " << size<< endl;
           
           }
        }
    }
    
    data_file.close();
    cout << "finished writing to file." << endl;
    }else{
        cout << "You must generate services, landfills, and depots before this can be used." << endl;
    }
}

vector<vector<string>> File_Handler::read_csv(string file_location){
    string line;
    ifstream file_handle;
    try{
    
        file_handle.open(file_location);
    }catch(exception e){
        cout << "File cannot be read. check name or location" << endl;
    }
            

 // this does the checking!
  vector <vector <string> > data;
  while (file_handle)
    {
      if (!getline( file_handle, line )) break;

      istringstream ss( line );
      vector <string> record;
      while (ss)
      {
        string s;
        if (!getline( ss, s, '%' )) break;
        record.push_back( s );
      }

      data.push_back( record );
  }
  
  return data;
}




