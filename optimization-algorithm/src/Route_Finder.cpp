/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 * 
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/* 
 * File:   Route_Finder.cpp
 * Author: forest schwartz
 * 
 * Created on December 13, 2017, 6:55 PM
 */

//#define DEBUG

#include "Route_Finder.h"


// Helper Function Prototypes
//Not needed in c++11 because it includes to_string() 
//string to_string(int);
int to_int(string);
vector<string> sub_vector(vector<string>&);
int index_of_largest_element(double*, int);
vector<string> vint_to_str(vector<int>&);
vector<int> vstr_to_int(vector<string>&);
vector<vector<int>> vvstr_to_int(vector<vector<string>>&);
void print_vvi(vector<vector<int>>);

// Constructors and functions

Route_Finder::Route_Finder(vector<Service*> services, vector<Landfill*> landfills, vector<Depot*> depots, int num_of_trucks)
:services(services), landfills(landfills), depots(depots), num_of_trucks(num_of_trucks){

    
}

Route_Finder::Route_Finder(const Route_Finder& orig) {
}

Route_Finder::~Route_Finder() {
}

void Route_Finder::set_truck_home_depot(string home_depot){
    truck_specified_depot = home_depot;
}
// returns the best routes for each of the bags automatically forms combinations based on the size of the truck
vector<vector<string>> Route_Finder::brute_force(vector<vector<int>> bags){
    
    vector<vector<string>> return_routes;
    vector<vector<string>> best_sequences;
 
    vector<Route> test;
    vector<int> bag_10;
    vector<int> bag_11;
    vector<int> bag_12;
    vector<int> bag_15;
    vector<int> bag_18;
    vector<int> bag_20;
    vector<int> bag_30;
    vector<int> bag_40;
    vector<int> bag_50;
    vector<vector<int>> potential_set1;
    vector<vector<int>> potential_set2;
    vector<vector<int>> potential_set3;
    vector<vector<int>> potential_set4;
    vector<vector<int>> potential_set5;
    vector<vector<int>> potential_set6;
    vector<vector<int>> potential_set7;
    vector<vector<int>> potential_set8;
    vector<vector<int>> potential_set9;
    
    vector<vector<int>> potential_sets;
    vector<vector<string>> route_combos;
    vector<vector<string>>  new_route_combos;
    vector<double> distances;
    for(int k =0;k<num_of_trucks;k++){
        vector<int> bag = bags.at(k);

        for(int i=0;i<bag.size();i++){
            int service_id = bag.at(i);
            Service* ser = services[service_id];


    // Creating arrays that contain services separated by the size of the container
            if(ser->size==10){
                bag_10.push_back(service_id);
            }
            else if(ser->size==11){
                bag_11.push_back(service_id);
            }else if(ser->size==12){
                bag_12.push_back(service_id);
            }
            else if(ser->size==15){
                bag_15.push_back(service_id);
            }else if(ser->size==18){
                bag_18.push_back(service_id);
            }
            else if(ser->size== 20){
                bag_20.push_back(service_id);
            }else if(ser->size==30){
                bag_30.push_back(service_id);
            }else if(ser->size==40){
                bag_40.push_back(service_id);
            }else if(ser->size==50){
                bag_50.push_back(service_id);
            }

        }  
        
        // generating possible permutations
        potential_set1 = generate_combination(bag_10);   // PICK UP HERE **************************
        potential_set2 = generate_combination(bag_11);
        potential_set3 = generate_combination(bag_12);
        potential_set4 = generate_combination(bag_15);
        potential_set5 = generate_combination(bag_18);
        potential_set6 = generate_combination(bag_20);
        potential_set7 = generate_combination(bag_30);
        potential_set8 = generate_combination(bag_40);
        potential_set9 = generate_combination(bag_50);
        
         vector<vector<int>> sets [9] = {potential_set1, potential_set2, potential_set3, potential_set4, potential_set5, potential_set6, potential_set7, potential_set8, potential_set9};
        
         // Combine all the sets for the different size dumpsters
        potential_sets = combine_sets(potential_set1, potential_set2, potential_set3, potential_set4,
                potential_set5, potential_set6, potential_set7,potential_set8,potential_set9);

        route_combos = add_land_fills(potential_sets); // first add in generic landfills
       new_route_combos = optimize_land_fills(route_combos); // replace landfill with optimized landfills

        // Analyze Euclidean distances
        
        distances = analyze_distance(new_route_combos);

       // Find best routes from euclidean distances
        Route route_check = find_best_routes(distances, new_route_combos);
        vector<string> best_sequence = route_check.get_best_route_sequence();
        best_sequences.push_back(best_sequence);
        
        bag_10.clear();
        bag_11.clear();
        bag_12.clear();
        bag_15.clear();
        bag_18.clear();
        bag_20.clear();
        bag_30.clear();
        bag_40.clear();
        bag_50.clear();
        
    }

    return best_sequences;

}

// Not actually doing anything right now... will need to improve upon this later
vector<string> Route_Finder::filter_possibilities(vector<string>& potential_set){
    
    if(potential_set.size()>2){
        // Defining a good set
        vector<string> good_set;
        string order;

        // looping through everything in the set
        for(int i=0;i<potential_set.size();i++){
            order = potential_set.at(i);
            int id_of_service;

            // Defining constraints i.e. two pickups cannot be in a row,
            int num_of_containers=0;
            bool remove = false;

            for(int idx = 0; idx < order.size(); idx++)
            {
             id_of_service = order.at(idx) - '0';
             string type = Service::type_reference.at(id_of_service);
                if(type=="delivery"){
                    num_of_containers=0;
                }else if(type=="pick up"){
                    num_of_containers=num_of_containers+1;
                }else if(type=="swap"){
                    num_of_containers = num_of_containers;
                }
             if(num_of_containers>=2){
                 remove = true;
             }
            }
            if(remove){
                cout << "just erased: " << potential_set.at(i) <<":" << i<<"\n";

            }else{
                good_set.push_back(order);
            }
        }
    return good_set;
    }else{
        return potential_set;
    }
}

// Adding landfills and Depot locations where needed
vector<vector<string>> Route_Finder::add_land_fills(vector<vector<int>> &combined_set){
    
       
    // Defining needed variables
    vector<vector<string>> updated_set;
    string landfill_location;
    vector<int> order;
    vector<string> new_order;
    string id_of_service_str;
    string id_of_next_service_str;
    string next_delivery;
    string current_delivery;
    int current_size;
    int next_size;
    int id_of_service;
    int id_of_next_service;
    int set_size = combined_set.size();
    int order_size;

    // looping through every possible route in a set
    for(int i=0;i<set_size;i++){
        order = combined_set.at(i);
        order_size = combined_set.at(i).size();
        new_order.erase(new_order.begin(),new_order.end());
        // Looping through each symbol in a route i.e. 1L45LH...
        for(int idx = 0; idx < order_size; idx++)
        {

            if(idx==order_size-1){
                id_of_service = order.at(idx);
                id_of_service_str = to_string(id_of_service);
                string type = Service::type_reference.at(id_of_service);
                
                if(type=="s"|| type=="p"){
                new_order.push_back(id_of_service_str);
                new_order.push_back("L");
                new_order.push_back("H");
                }else{
                new_order.push_back(id_of_service_str);
                new_order.push_back("H");}
            }else{
                id_of_service = order.at(idx);
                id_of_next_service = order.at(idx+1);
                
                id_of_service_str = to_string(id_of_service);
                id_of_next_service_str = to_string(id_of_next_service);
                

        // adding the service to our new list
                new_order.push_back(id_of_service_str);

                // Setting type of current and next destination type
                string type = Service::type_reference.at(id_of_service);
                string next_type =Service::type_reference.at(id_of_next_service);
                


                // updating sizes    
                current_size = services[id_of_service]->size;
                next_size = services[id_of_next_service]->size;

               if(current_size==next_size){

                   if(type=="d"&&next_type=="d"){
                       new_order.push_back("H");
                   }else if(type=="d"&&next_type=="s"){
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="d"){
                       new_order.push_back("L");
                   }else if(type=="p"&&next_type=="s"){
                       new_order.push_back("L");
                   }else if(type=="p"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="d"){
                       new_order.push_back("L");
                   }else if(type=="s"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="s"){
                       new_order.push_back("L");
                   }

               }else if(current_size!=next_size){

                   if(type=="d"&&next_type=="d"){
                       new_order.push_back("H");
                   }else if(type=="d"&&next_type=="s"){
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="d"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="s"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="d"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="s"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }

                }
            }
        }

        updated_set.push_back(new_order);
    }
   
 
return updated_set;
}

vector<vector<string>> Route_Finder::add_land_fills(vector<vector<string>> &combined_set){
    
       
    // Defining needed variables
    vector<vector<string>> updated_set;
    string landfill_location;
    vector<string> order;
    vector<string> new_order;
    string id_of_service_str;
    string id_of_next_service_str;
    string next_delivery;
    string current_delivery;
    int current_size;
    int next_size;
    int id_of_service;
    int id_of_next_service;
    int set_size = combined_set.size();
    int order_size = combined_set.at(0).size();   

    // looping through every possible route in a set
    for(int i=0;i<set_size;i++){
        order = combined_set.at(i);
        new_order.erase(new_order.begin(),new_order.end());
        // Looping through each symbol in a route i.e. 1L45LH...
        for(int idx = 0; idx < order_size; idx++)
        {

            if(idx==order_size-1){
                id_of_service = to_int(order.at(idx));
                id_of_service_str = id_of_service;
                string type = Service::type_reference.at(id_of_service);
                
                if(type=="s"|| type=="p"){
                new_order.push_back(id_of_service_str);
                new_order.push_back("L");
                new_order.push_back("H");
                }else{
                new_order.push_back(id_of_service_str);
                new_order.push_back("H");}
            }else{
                id_of_service = to_int(order.at(idx));
                id_of_next_service = to_int(order.at(idx+1));
                
                id_of_service_str = id_of_service;
                id_of_next_service_str = id_of_next_service;
                

        // adding the service to our new list
                new_order.push_back(id_of_service_str);

                // Setting type of current and next destination type
                string type = Service::type_reference.at(id_of_service);
                string next_type =Service::type_reference.at(id_of_next_service);
                


                // updating sizes    
                current_size = services[id_of_service]->size;
                next_size = services[id_of_next_service]->size;

               if(current_size==next_size){

                   if(type=="d"&&next_type=="d"){
                       new_order.push_back("H");
                   }else if(type=="d"&&next_type=="s"){
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="d"){
                       new_order.push_back("L");
                   }else if(type=="p"&&next_type=="s"){
                       new_order.push_back("L");
                   }else if(type=="p"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="d"){
                       new_order.push_back("L");
                   }else if(type=="s"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="s"){
                       new_order.push_back("L");
                   }

               }else if(current_size!=next_size){

                   if(type=="d"&&next_type=="d"){
                       new_order.push_back("H");
                   }else if(type=="d"&&next_type=="s"){
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="d"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="s"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="p"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="d"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="p"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }else if(type=="s"&&next_type=="s"){
                       new_order.push_back("L");
                       new_order.push_back("H");
                   }

                }
            }
        }

        updated_set.push_back(new_order);
    }
   
 
return updated_set;
}

vector<vector<int>> Route_Finder::combine_sets(vector<vector<int>>& filltered_set1, vector<vector<int>>& filltered_set2, vector<vector<int>>& filltered_set3,
        vector<vector<int>>& filltered_set4, vector<vector<int>>& filltered_set5,vector<vector<int>>& filltered_set6,vector<vector<int>>& filltered_set7,
        vector<vector<int>>& filltered_set8, vector<vector<int>>& filltered_set9){
    
    vector<int> part1; vector<int> part2; vector<int> part3; 
    vector<int> part4; vector<int> part5; vector<int> part6;
    vector<int> part7; vector<int> part8; vector<int> part9;
    
    vector<int> combined;
    vector<vector<int>> combined_sets;;
    
    for(int a=0;a<filltered_set1.size();a++){
        part1 = filltered_set1.at(a);
        for(int b=0;b<filltered_set2.size();b++){
            part2 = filltered_set2.at(b);
            for(int c=0;c<filltered_set3.size();c++){
                part3 = filltered_set3.at(c);
                for(int d=0;d<filltered_set4.size();d++){
                    part4 = filltered_set4.at(d);
                    for(int e=0;e<filltered_set5.size();e++){
                        part5 = filltered_set5.at(e);
                        for(int f=0;f<filltered_set6.size();f++){
                            part6 = filltered_set6.at(f);
                            for(int g=0;g<filltered_set7.size();g++){
                                part7 = filltered_set7.at(g);
                                for(int h=0;h<filltered_set8.size();h++){
                                    part8 = filltered_set8.at(h);
                                    for(int i=0;i<filltered_set9.size();i++){
                                        part9 = filltered_set9.at(i);
                                        
                                        combined.insert(combined.end(),part1.begin(),part1.end());
                                        combined.insert(combined.end(),part2.begin(),part2.end());
                                        combined.insert(combined.end(),part3.begin(),part3.end());
                                        combined.insert(combined.end(),part4.begin(),part4.end());
                                        combined.insert(combined.end(),part5.begin(),part5.end());
                                        combined.insert(combined.end(),part6.begin(),part6.end());
                                        combined.insert(combined.end(),part7.begin(),part7.end());
                                        combined.insert(combined.end(),part8.begin(),part8.end());
                                        combined.insert(combined.end(),part9.begin(),part9.end());

                                        combined_sets.push_back(combined);
                                        combined.erase(combined.begin(),combined.end());                   
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
      
    return combined_sets;

}



// Analyze route distances
vector<double> Route_Finder::analyze_distance(vector<vector<string>>& routes){
    double current_lat; double current_lng; double next_lat; double next_lng;
    vector<double> distance_vector;
    double total_distance;
    // Defining the depots and landfills
    Landfill* l;
    Depot* de = depots[0];
    int num_of_routes = routes.size();
    std::string::size_type sz;   // alias of size_t
    string symbol;
    string next_symbol;
    string check;
    string next_check;
    string position_str;
    int position_int;
    int symbol_end_pos;
    int next_symbol_end_pos;
     
    for(int i=0;i<num_of_routes;i++){
        vector<string> route = routes.at(i);
        int num_of_destinations = route.size();
        total_distance=0;
        for(int j=0;j<num_of_destinations-1;j++){
            
            symbol = route.at(j);
            next_symbol = route.at(j+1);
            symbol_end_pos = symbol.size()-1;
            next_symbol_end_pos = next_symbol.size()-1;
            check = symbol.substr(0,1);
            next_check = next_symbol.substr(0,1);
            if(check=="L"){
                position_str = symbol.substr(1,symbol_end_pos);
                position_int = to_int(position_str);
                l = landfills[position_int];
                current_lat = l->lat;
                current_lng = l->lng;
            }else if(check=="H"){
                position_str = symbol.substr(1,symbol_end_pos);
                position_int = to_int(position_str);
                de = depots[position_int];
                current_lat = de->lat;
                current_lng = de->lng;
            }else{        
                int place = to_int(symbol);
                Service* current_destination= services[place];
                current_lat = current_destination->lat;
                current_lng = current_destination->lng;
            }
              if(next_check=="L"){
                position_str = next_symbol.substr(1,next_symbol_end_pos);
                position_int = to_int(position_str);
                l = landfills[position_int];
                next_lat = l->lat;
                next_lng = l->lng;
            }else if(next_check=="H"){
                position_str = next_symbol.substr(1,next_symbol_end_pos);
                position_int = to_int(position_str);
                de = depots[position_int];
                next_lat = de->lat;
                next_lng = de->lng;
            }else{              
                int next_place = to_int(next_symbol);
                Service* next_destination = services[next_place];
                next_lat = next_destination->lat;
                next_lng = next_destination->lng;
            }
            
            total_distance += fabs(next_lat-current_lat)+fabs(next_lng-current_lng);

            
        }
        distance_vector.push_back(total_distance);
    }
     return distance_vector;
}


// This may only work using compiler C++11 because of issue with iota
Route Route_Finder::find_best_routes(vector<double> &distances, vector<vector<string>> &route_combos){

    vector<vector<string>> best_routes;
    vector<double> best_distances;
    for (auto i: sort_indexes(distances)) {
        best_routes.push_back(route_combos[i]);
        best_distances.push_back(distances[i]);
    }
    Route sorted_routes = Route(best_routes, best_distances);
    return sorted_routes;
}


// Looping through a sequence, separating by dumpster sizes and testing all permutations of the orders based on dumpster sizes
vector<vector<string>> Route_Finder::test_size_permutations(vector<vector<string>>& input_sequences){
    vector<vector<string>> return_sequences;
    for(int k=0;k<input_sequences.size();k++){
        vector<string> input_sequence = input_sequences.at(k);
        int current_size;
        int nxt_size;
        int id_of_service;
        int id_of_nxt_service;
        string id_of_service_str;
        vector<vector<int>> blocks;
        vector<int> block_segment;
        string check;
        string destination;
        string nxt_destination;
        int place=0;
        int number;
        int block_segment_id=0;
        string block_segment_id_str;
        string block_segment_id_bag;

        vector<string> sequence = eliminate_land_fills(input_sequence);
        int sequence_size = sequence.size();
        // finding start and stop of each size block because originally i 
        // have grouped the routes in blocks based off the size of the dumpster 
        if(sequence_size>=2){
            for(int i =0; i<sequence_size-1;i++){
                destination = sequence.at(i);
                nxt_destination = sequence.at(i+1);
                id_of_service = to_int(destination);
                id_of_nxt_service = to_int(nxt_destination);
                current_size = services[id_of_service]->size;
                nxt_size = services[id_of_nxt_service]->size;
                block_segment.push_back(to_int(destination));
                if(current_size!=nxt_size){
                    blocks.push_back(block_segment);
                    block_segment.erase(block_segment.begin(),block_segment.end());
                } 
            }
            // this could cause an error watch this later
            block_segment.push_back(to_int(nxt_destination));
        }else{
            block_segment.push_back(to_int(sequence[0]));
        }
        


        blocks.push_back(block_segment);

        // now rebuilding the system based off of mixed block ids
        vector<vector<vector<int>>> combos_set = generate_combination(blocks);
        vector<int> recombined_set;
        vector<vector<int>> updated_set;

        for(int i=0;i<combos_set.size();i++){
            vector<vector<int>> current_combo_set = combos_set.at(i);
            for(int j=0; j< current_combo_set.size();j++){
                vector<int> block = current_combo_set.at(j);
                recombined_set.insert(recombined_set.end(),block.begin(),block.end());
            }
            updated_set.push_back(recombined_set);
            recombined_set.erase(recombined_set.begin(),recombined_set.end());
        }


           vector<vector<string>> route_combos_t = add_land_fills(updated_set); // first add in generic landfills
           vector<vector<string>> new_route_combos_t = optimize_land_fills(route_combos_t); // replace landfill with optimized landfills
           vector<double> distances = analyze_distance(new_route_combos_t);
           Route new_routes = find_best_routes(distances, new_route_combos_t);
           vector<string> best_route = new_routes.get_best_route_sequence();
           return_sequences.push_back(best_route);

    }
    return return_sequences;
}


vector<vector<string>> Route_Finder::eliminate_land_fills(vector<vector<string>>& route_sequences){
    
    vector<string> route_sequence;
    string check;
    string destination;
    int check_int;
    string check_str;
    vector<string> rebuffered_route;
    vector<vector<string>> rebuffered_routes;
    
    for(int i=0;i<route_sequences.size();i++){
        route_sequence = route_sequences.at(i);
        for(int idx=0;idx<route_sequence.size();idx++){
            destination = route_sequence.at(idx);
            check = destination.substr(0,1);
            if(check!="L"&&check!="H"){
                rebuffered_route.push_back(destination);
            }
        }
    rebuffered_routes.push_back(rebuffered_route);
    rebuffered_route.erase(rebuffered_route.begin(),rebuffered_route.end());
    }
    return rebuffered_routes;
}

// Gets rid of all the landfills and depots in the vector<string>
vector<string> Route_Finder::eliminate_land_fills(vector<string>& route_sequence){
    

    string check;
    string destination;
    int check_int;
    string check_str;
    vector<string> rebuffered_route;

    
    for(int i=0;i<route_sequence.size();i++){
        destination = route_sequence.at(i);
        check = destination.substr(0,1);
        if(check!="L"&&check!="H"){
           rebuffered_route.push_back(destination);
        }

    }
    return rebuffered_route;
}

// 1st version
vector<vector<string>> Route_Finder::random_ruin_and_recreate(vector<vector<string>>& truck_routes){
    // eliminate landfills and depot locations
    vector<vector<string>> adjusted_routes = eliminate_land_fills(truck_routes);
    vector<vector<string>> hold_routes;
    vector<vector<string>> new_routes;
    vector<string> current_sequence;
    vector<string> shuffle_vect;
    
    
    // combining random sections from each route into a shuffle vector
#ifdef DEBUG
    cout << "test: " << endl;  
#endif

    for(int i = 0;i<adjusted_routes.size();i++){
        current_sequence = adjusted_routes.at(i);
        vector<string> temp_vect = sub_vector(current_sequence);
        hold_routes.push_back(current_sequence);
        shuffle_vect.insert(shuffle_vect.end(),temp_vect.begin(),temp_vect.end());
    }
#ifdef DEBUG
    cout << "shuffled response: " << endl;
#endif

    
    // Shuffling the shuffle vector
    std::random_shuffle(shuffle_vect.begin(), shuffle_vect.end());
    // putting parts of the shuffled vector back into the original truck routes
    vector<string>::iterator it1;
    vector<string>::iterator  it2;
    int repair_size = floor(shuffle_vect.size()/num_of_trucks);
    for(int i=0;i<num_of_trucks;i++){
        vector<string> repairing_sequence = hold_routes.at(i);
        if(i<=num_of_trucks-2){
            it1 =shuffle_vect.begin();
            it2 = shuffle_vect.begin()+repair_size;
            repairing_sequence.insert(repairing_sequence.begin(),it1,it2);
        }else{
            it1 =shuffle_vect.begin();
            it2 = shuffle_vect.end();
            repairing_sequence.insert(repairing_sequence.begin(),it1,it2);
        }
        new_routes.push_back(repairing_sequence);
        shuffle_vect.erase(it1,it2);
        
    }
    
    
    return new_routes;
}

// 2nd version
vector<vector<string>> Route_Finder::random_ruin_and_recreate2(vector<vector<string>>& truck_routes){
    vector<string> current_sequence;
    vector<string> shuffle_vector;
    // combining the sequences into one vector
    vector<vector<string>> adjusted_routes = eliminate_land_fills(truck_routes);
        for(int i = 0;i<adjusted_routes.size();i++){
            current_sequence = adjusted_routes.at(i);
            shuffle_vector.insert(shuffle_vector.end(),current_sequence.begin(),current_sequence.end()); 
        }

    
    // Shuffling the vector
    std::random_shuffle(shuffle_vector.begin(), shuffle_vector.end());
    
    // Splitting the vector up into individual truck vectors
    vector<vector<string>> new_truck_services = split_sequence_evenly(shuffle_vector);
    return new_truck_services;
}

// 4th version
vector<vector<int>> Route_Finder::random_ruin_and_recreate4(vector<vector<int>>& truck_routes){
    vector<int> current_sequence;
    vector<int> shuffle_vector;
    // combining the sequences into one vector
        for(int i = 0;i<truck_routes.size();i++){
            current_sequence = truck_routes.at(i);
            shuffle_vector.insert(shuffle_vector.end(),current_sequence.begin(),current_sequence.end()); 
        }

    
    // Shuffling the vector
    std::random_shuffle(shuffle_vector.begin(), shuffle_vector.end());
    
    // Splitting the vector up into individual truck vectors
    vector<vector<int>> new_truck_services;
    new_truck_services.push_back(shuffle_vector);
    return new_truck_services;
}

// 3rd version
vector<vector<string>> Route_Finder::random_ruin_and_recreate3(vector<vector<string>>& truck_routes){
    vector<string> current_sequence;
    vector<string> shuffle_vector;
    // combining the sequences into one vector

        for(int i = 0;i<truck_routes.size();i++){
            current_sequence = truck_routes.at(i);
            shuffle_vector.insert(shuffle_vector.end(),current_sequence.begin(),current_sequence.end()); 
        }

    
    // Shuffling the vector
    std::random_shuffle(shuffle_vector.begin(), shuffle_vector.end());
    
    // Splitting the vector up into individual truck vectors
    vector<vector<string>> new_truck_services = split_sequence_evenly(shuffle_vector);
    return new_truck_services;
}

vector<vector<int>> Route_Finder::radial_weighted_cluster_2(int max_discrepancy){
    // local function variables
    int num_of_services = Service::numberOfServices;
    vector<vector<int>> bag_t;;
    Service* service_t;
    Landfill* landfill1;
    Landfill* landfill2;
    int id_of_service;
    vector<double> dist_gs_to_ser[num_of_trucks]; // distance from gravitational spot to service
    double avg_num_of_services = num_of_services/num_of_trucks;

    vector<double*> bag_weight_vec; // Each service will have a weight according to which bag it should fit into
    double bag_weight[num_of_trucks];
    double cf_d_weight[num_of_trucks]; // creating the cost function density weights
    double cf_s_weight[num_of_trucks]; // creating the cost function size relation weights
    int bag_location;
    
    double summed_distance[num_of_trucks];
    
    //segment landfill line into parts located for each truck locations gravitational pull
    landfill1 = landfills[0];
    landfill2 = landfills[1];
    double lat_distance = landfill2->lat-landfill1->lat;
    double lng_distance = landfill2->lng-landfill1->lng;
        // finding number of segments and segment distances
    double num_of_segments = num_of_trucks-2;
    LatLng im_gs[num_of_trucks]; // imaginary gravitational spot
    double distance_to_next_lat = lat_distance/(num_of_segments+1);
    double distance_to_next_lng = lng_distance/(num_of_segments+1);
    
    
        // finding imaginary gravitational spots along landfill line
    for(int i=0;i<num_of_segments;i++){
        im_gs[i].lat=landfill1->lat+(i+1)*distance_to_next_lat;
        im_gs[i].lng=landfill1->lng+(i+1)*distance_to_next_lng;
    }
    im_gs[num_of_trucks-2].lat=landfill1->lat;
    im_gs[num_of_trucks-2].lng = landfill1->lng;
    im_gs[num_of_trucks-1].lat=landfill2->lat;
    im_gs[num_of_trucks-1].lng=landfill2->lng;
    
    cout << "l1: " << im_gs[0].lat << endl;
    cout << "l2: " << im_gs[1].lat << endl;
    cout << "l3: " << im_gs[2].lat << endl;
    cout << "l4: " << im_gs[3].lat << endl;
    cout << "l5: " << im_gs[4].lat << endl;
    // now lets calculated the distances between each service and each landfills/imaginary
    // gravitational spot for the cost function.
    
        for(int i =0;i<num_of_services;i++){
        service_t = services[i];
        id_of_service = service_t->id;  
            for(int j=0;j<num_of_trucks;j++){
              // calculated the distance to the imaginary gravitation spot per service
                double lat1 = im_gs[j].lat; double lat2 = service_t->lat;
                double lng1 = im_gs[j].lng; double lng2 = service_t->lng;

                double distance=fabs(lat1-lat2)+fabs(lng1-lng2);
               dist_gs_to_ser[j].push_back(distance); // distance from gravitational spot to service
            }

    }
    
    // Initializing useful variables to 0
    double service_distance;
    double w_d_tot[num_of_trucks];

    // Gains for Cluster Convergence 
    double w_distance = 0.1;  
    double alpha = 0.001;  // alphs is the weight convergence constant
    double w_size_clusters = 0.2;
    
    
    // This is my convergence loop
    for(int idx=0;idx<10000;idx++){
        
        // setting initial variables to 0 before another iteration
        for(int k =0; k<num_of_trucks;k++){
            bag_t.at(k).erase(bag_t.at(k).begin(),bag_t.at(k).end());
        }
         
        
        for(int i=0;i<num_of_services;i++){

           for(int j=0;j<num_of_trucks;j++){
                  // calculated the distance to the imaginary gravitation spot per service
               service_distance = dist_gs_to_ser[j].at(i);
               bag_weight[j]=(1/service_distance)*w_distance+w_d_tot[j];
            }
 

           bag_location = index_of_largest_element(bag_weight, num_of_trucks);
           bag_t.at(bag_location).push_back(i);

        }
        

        double service_discrepancy[num_of_trucks];
        double check_step;
        int discrepancy_check[num_of_trucks];
        //weight update equation for w_distance
        for(int c = 0;c<num_of_trucks;c++){
             service_discrepancy[c]=avg_num_of_services-bag_t[c].size();
             check_step = (service_discrepancy[c]/num_of_services)*alpha;
             w_d_tot[c]+=check_step;
             if(fabs(service_discrepancy[c])<= max_discrepancy){
                 discrepancy_check[c]=1;
             }else{
                 discrepancy_check[c]=0;
             }
             
        }
        
           
        // check whether number of service discrepancy between bags is within a desirable range
        int* check = std::min_element(discrepancy_check,discrepancy_check+num_of_trucks);
        
        if(*check==1){
            cout << "finished at this iteration : " << idx << endl;
            break;
        }
    }
    
    //display_truck_services(bag_t);
    return bag_t;

}

vector<vector<int>> Route_Finder::sequential_cluster(){
    vector<vector<int>> total_bag;
    vector<int> single_bag;
    int num_of_services = Service::numberOfServices;
    cout << "total num of serv: "<<num_of_services << endl;
    int num_of_services_per_truck = floor(num_of_services/num_of_trucks);
    cout <<"num of serv per truck: " << num_of_services_per_truck << endl;
    int check(0);
    int truck_count (1);
    for(int i=0;i<num_of_services;i++){

        if(truck_count<num_of_trucks){
            single_bag.push_back(i);
            ++check;
            if(check==num_of_services_per_truck){
                total_bag.push_back(single_bag);
                single_bag.erase(single_bag.begin(),single_bag.end());
                ++truck_count;
                check=0;
            }
        }else{
            single_bag.push_back(i);

        }
    }

    total_bag.push_back(single_bag);
    return total_bag;
}

vector<vector<int>> Route_Finder::initial_cluster(){
    vector<vector<int>> total_bag;
    vector<int> single_bag;
    int num_of_services = Service::numberOfServices;
    cout << "total num of serv: "<<num_of_services << endl;
    int num_of_services_per_truck = floor(num_of_services/num_of_trucks);
    cout <<"num of serv per truck: " << num_of_services_per_truck << endl;
    int check(0);
    int truck_count (1);
    for(int i=0;i<num_of_services;i++){

        if(truck_count<num_of_trucks){
            single_bag.push_back(i);
            ++check;
            if(check==num_of_services_per_truck){
                total_bag.push_back(single_bag);
                single_bag.erase(single_bag.begin(),single_bag.end());
                ++truck_count;
                check=0;
            }
        }else{
            single_bag.push_back(i);

        }
    }
    total_bag.push_back(single_bag);
    return total_bag;
}

vector<vector<int>> Route_Finder::initial_single_cluster(){
    vector<vector<int>> total_bag;
    vector<int> single_bag;
    int num_of_services = Service::numberOfServices;
    for(int i=0;i<num_of_services;i++){
        single_bag.push_back(i);
    }
    total_bag.push_back(single_bag);
    return total_bag;
}

vector<vector<string>> Route_Finder::split_sequence_evenly(vector<string> sequences){
    vector<vector<string>> truck_sequences;
    int split_location = floor(sequences.size()/num_of_trucks);
    int location1;
    int location2;
    int sequences_size = sequences.size();
    if(num_of_trucks>1){   // just for robustness of code
        for(int i=0;i<num_of_trucks-1;i++){

            location1 = i*split_location;
            location2 = (i+1)*split_location;
            vector<string> split_sequence(&sequences[location1],&sequences[location2]);
            truck_sequences.push_back(split_sequence);
        }
        location1=location2;
        location2 = sequences.size();
        vector<string> split_sequence(&sequences[location1],&sequences[location2]);
        truck_sequences.push_back(split_sequence);
    }else{
        truck_sequences.push_back(sequences);
    }
    return truck_sequences;
}



vector<vector<int>> Route_Finder::split_sequence_evenly2(vector<int> sequences){
    vector<vector<int>> truck_sequences;
    int split_location = floor(sequences.size()/num_of_trucks);
    int location1;
    int location2;
    int sequences_size = sequences.size();
    if(num_of_trucks>1){   // just for robustness of code
        for(int i=0;i<num_of_trucks;i++){

            location1 = i*split_location;
            location2 = (i+1)*split_location;
            vector<int> split_sequence(&sequences[location1],&sequences[location2]);
            truck_sequences.push_back(split_sequence);
        }
        location1=location2;
        location2 = sequences.size();
        vector<int> split_sequence(&sequences[location1],&sequences[location2]);
        for(int i=0;i<split_sequence.size();i++){
            truck_sequences.at(i).push_back(split_sequence.at(i));
        }
    }else{
        truck_sequences.push_back(sequences);
    }
    return truck_sequences;
}

/////////////////////////////////////////////////////////////////////////////////////
//-----------------Independent solving algorithms----------------------------------//
/////////////////////////////////////////////////////////////////////////////////////

// uses bag randomization to find best routes where the initial bags are chosen using a sequential sort
string Route_Finder::random_sequential_sort(int total_num_iterations){

   // variables
    Route routes;
    vector<vector<string>> hold_routes;
    vector<vector<vector<string>>> holding_routes;
    double smallest_distance;
    vector<double> distances;
    double total_distance;
    vector<vector<string>>  new_truck_routes;
    vector<vector<string>>  opt_truck_routes;
    vector<Route_Statistics*> data_holder_list;
    string json_data;
 // finding the bags for each truck
   vector<vector<int>> bags0 = sequential_cluster();
// determining the optimum routes from each bag  without mixing size locations 
   vector<vector<string>> truck_routes = brute_force(bags0); 
   distances = analyze_distance(truck_routes);
   routes = find_best_routes(distances,truck_routes);
   total_distance = routes.sum_distances();
   smallest_distance=total_distance;
   cout << "initial smallest distance " << smallest_distance << endl;
   hold_routes = routes.get_X_routes(num_of_trucks);
   holding_routes.push_back(hold_routes);
   
   
   cout << "tni: " << total_num_iterations << endl;
   if(num_of_trucks>1){
    for(int i=0;i<total_num_iterations;i++){
         new_truck_routes= random_ruin_and_recreate2(truck_routes); // Mixing up the bag of services for each truck
         cout << "new_Truck_routes: " << endl;
         opt_truck_routes = test_size_permutations(new_truck_routes); // optimizing those routes
         distances = analyze_distance(opt_truck_routes); // getting the distances of those routes
         routes = find_best_routes(distances,opt_truck_routes); // picking the best routes
         total_distance = routes.sum_distances();
         if(total_distance<smallest_distance){ // if your summed distances are lower
             routes.display_all_routes();
             smallest_distance=total_distance; 
             hold_routes = routes.get_X_routes(num_of_trucks); // then you stash those routes in hold_routes
             holding_routes.push_back(hold_routes); // you push them back in holding_routes to access them later
         }
    }
   }

   cout << "At gm handler" << endl;
   GM_Handler gm_handle(services,landfills,depots);
   gm_handle.set_api_key("AIzaSyCLPxyggFNCgUi2-Vs4z_DMPinxi7bju0Q");
   
    cout << "finished sorting algorithm!" << endl;

    for(int p=0;p<holding_routes.size();p++){ // this loops through all the top route choices and stores the route_data_holder in data_holder_list for each routing option
        Route_Statistics* route_data_holder = new Route_Statistics();
        vector<vector<string>> current_route_list = holding_routes.at(p);
        for(int k=0;k<num_of_trucks;k++){  // This loops through the route for each truck and gains the statistic for a specifc routing sequenc and puts it in the route_data_holder
             vector<string> a_route = current_route_list.at(k);
             gm_handle.get_route_statistics(a_route, *route_data_holder);  
        }
        data_holder_list.push_back(route_data_holder);
   }

   // reverses the list to put the top route statistics at the top
    std::reverse(data_holder_list.begin(),data_holder_list.end());
    cout << "creating csv file" << endl;
   File_Handler file_handle;
   file_handle.create_csv(data_holder_list);
   cout << "converting data to json" << endl;
   json_data = data_to_json(data_holder_list);
   return json_data;
   
}

string Route_Finder::random_sequential_sort2(int total_num_iterations){
    // Standard Variables

    string json_data;
    vector<Route_Statistics*> data_holder_list;
    vector<vector<string>> route_combos;
    vector<vector<string>> route_combos_w_lf;
    vector<vector<string>> opt_route_combos;
    vector<vector<string>> best_route_combos;
    vector<vector<int>> mixed_route_combos;
    double smallest_distance;
    vector<double> distances;
    double total_distance;


    vector<vector<int>> bags0 = initial_cluster(); // creating initial bags
    route_combos_w_lf = add_land_fills(bags0); // add in generic landfills and depots where needed
    opt_route_combos = optimize_land_fills(route_combos_w_lf); // replace generic landfills and depots with optimized ones
    best_route_combos = opt_route_combos;
    distances = analyze_distance(opt_route_combos); // get a vector of euclidean distances for each 
    for (auto& n : distances)
        total_distance += n;
    smallest_distance = total_distance; // Getting the first baseline distance of the first route
    for(int i=0;i<total_num_iterations;i++){
        mixed_route_combos = random_ruin_and_recreate4(bags0);
        route_combos_w_lf= add_land_fills(mixed_route_combos); //adding landfills and depot place holders in between services
        opt_route_combos = optimize_land_fills(route_combos_w_lf); //optimizing landfills and depots
        distances = analyze_distance(opt_route_combos); // get a vector of euclidean distances for each 
        
        total_distance=0;
        for (auto& n : distances)
            total_distance += n;

        if(total_distance<smallest_distance){
            smallest_distance=total_distance;
            best_route_combos=opt_route_combos;
        }
    }
    
    
   GM_Handler gm_handle(services,landfills,depots);
   gm_handle.set_api_key("AIzaSyCLPxyggFNCgUi2-Vs4z_DMPinxi7bju0Q");
   
    cout << "finished sorting algorithm!" << endl;

        Route_Statistics* route_data_holder = new Route_Statistics();
        for(int k=0;k<num_of_trucks;k++){  // This loops through the route for each truck and gains the statistic for a specifc routing sequenc and puts it in the route_data_holder
             vector<string> a_route = best_route_combos.at(k);
             gm_handle.get_route_statistics(a_route, *route_data_holder);  
            
        }
        data_holder_list.push_back(route_data_holder);
        

        // reverses the list to put the top route statistics at the top
         std::reverse(data_holder_list.begin(),data_holder_list.end());
         cout << "creating csv file" << endl;
        json_data = data_to_json(data_holder_list);
        return json_data;
   }

// This algorithm does the optimization for a single truck and then splits it evenly among the trucks at the end
string Route_Finder::random_sequential_sort3(int total_num_iterations){
    // Standard Variables

    string json_data;
    vector<Route_Statistics*> data_holder_list;
    vector<Route_Statistics*> data_holder_list2;
    vector<vector<string>> route_combos;
    vector<vector<string>> route_combos_w_lf;
    vector<vector<string>> opt_route_combos;
    vector<vector<string>> best_route_combos;
    vector<vector<int>> mixed_route_combos;
    double smallest_distance;
    vector<double> distances;
    double total_distance;


    vector<vector<int>> bags0 = initial_single_cluster(); // creating initial bags
    route_combos_w_lf = add_land_fills(bags0); // add in generic landfills and depots where needed
    opt_route_combos = optimize_land_fills(route_combos_w_lf); // replace generic landfills and depots with optimized ones
    best_route_combos = opt_route_combos;
    distances = analyze_distance(opt_route_combos); // get a vector of euclidean distances for each 
    for (auto& n : distances)
        total_distance += n;
    smallest_distance = total_distance; // Getting the first baseline distance of the first route
    for(int i=0;i<total_num_iterations;i++){
        mixed_route_combos = random_ruin_and_recreate4(bags0);
        route_combos_w_lf= add_land_fills(mixed_route_combos); //adding landfills and depot place holders in between services
        opt_route_combos = optimize_land_fills(route_combos_w_lf); //optimizing landfills and depots
        distances = analyze_distance(opt_route_combos); // get a vector of euclidean distances for each 
        
        total_distance=0;
        for (auto& n : distances)
            total_distance += n;

        if(total_distance<smallest_distance){
            smallest_distance=total_distance;
            best_route_combos=opt_route_combos;
        }
    }
    
    
   GM_Handler gm_handle(services,landfills,depots);
   gm_handle.set_api_key("AIzaSyCLPxyggFNCgUi2-Vs4z_DMPinxi7bju0Q");
   
    cout << "finished sorting algorithm!" << endl;

        Route_Statistics* route_data_holder = new Route_Statistics();
        
        vector<string> a_route = best_route_combos.at(0);
        gm_handle.get_route_statistics(a_route, *route_data_holder);  
        data_holder_list.push_back(route_data_holder);
        cout << "entering split_single_route" << endl;
        vector<vector<string>> organized_routes = split_single_route(data_holder_list);
        
        vector<vector<int>> organized_routes_int = vvstr_to_int(organized_routes);
        
        route_combos_w_lf= add_land_fills(organized_routes_int); //adding landfills and depot place holders in between services
        cout << "printing rout_combos_w_lf " << endl;
        print_vector2(route_combos_w_lf);
        
        opt_route_combos = optimize_land_fills(route_combos_w_lf); //optimizing landfills and depots
        cout << "printing optimized route combos" << endl;
        print_vector2(opt_route_combos);
        
        Route_Statistics* route_data_holder_updated = new Route_Statistics();
        for(int k=0;k<num_of_trucks;k++){  // This loops through the route for each truck and gains the statistic for a specifc routing sequenc and puts it in the route_data_holder
             vector<string> a_route = opt_route_combos.at(k);
             gm_handle.get_route_statistics(a_route, *route_data_holder_updated);  
            
        }
        data_holder_list2.push_back(route_data_holder_updated);
        

        // reverses the list to put the top route statistics at the top
        std::reverse(data_holder_list2.begin(),data_holder_list2.end());
        cout << "creating csv file" << endl;
        json_data = data_to_json(data_holder_list2);
        return json_data;
   }


// uses bag randomization to find best routes where the initial bags are chosen using a radial weighting algorithm
void Route_Finder::radial_reduction_sort(int total_num_iterations){
    // variabls

    Route routes;
    double smallest_distance;
    vector<double> distances;
    double total_distance;
    vector<vector<string>>  new_truck_routes;
    vector<vector<string>>  opt_truck_routes;
 // finding the bags for each truck
   vector<vector<int>> bags0 = radial_weighted_cluster_2(0);
// determining the optimum routes from each bag  without mixing size locations 
   vector<vector<string>> truck_routes = brute_force(bags0); 
   distances = analyze_distance(truck_routes);
   routes = find_best_routes(distances,truck_routes);
   total_distance = routes.sum_distances();
   smallest_distance=total_distance;
   vector<Route*> route_list;
   Route* best_route = new Route();
   best_route = &routes;
   route_list.push_back(best_route);
   
   for(int i=0;i<total_num_iterations;i++){
        new_truck_routes= random_ruin_and_recreate(truck_routes);
        opt_truck_routes = test_size_permutations(new_truck_routes);
        distances = analyze_distance(opt_truck_routes);
        routes = find_best_routes(distances,opt_truck_routes);
        total_distance = routes.sum_distances();
        if(total_distance<smallest_distance){
            smallest_distance=total_distance;
            Route* best_route = new Route();
            best_route = &routes;
            route_list.push_back(best_route);
            best_route->display_all_routes();
        }
   }
   
   GM_Handler gm_handle;
   gm_handle.set_api_key("AIzaSyCLPxyggFNCgUi2-Vs4z_DMPinxi7bju0Q");
   
    cout << "finished sorting algorithm!" << endl;
    vector<Route_Statistics*> data_holder_list;
    for(int p=0;p<route_list.size();p++){
        Route_Statistics* route_data_holder = new Route_Statistics();
        Route* current_route = route_list.at(p);
        vector<vector<string>> route_list = current_route->get_X_routes(num_of_trucks);
        for(int k=0;k<num_of_trucks;k++){
             vector<string> a_route = route_list.at(k);
             gm_handle.get_route_statistics(a_route, *route_data_holder);
        }
        data_holder_list.push_back(route_data_holder);
   }
    cout << "creating csv file" << endl;
   File_Handler file_handle;
   file_handle.create_csv(data_holder_list);
   cout << "converting data to json" << endl;
   

}
// systematically checks every possible bag combination where initial bags are chosen using a sequential sort
void Route_Finder::systematic_sort(int routes_to_list){
   int service_size = services.size();
   vector<vector<vector<string>>> top_routes; // each index consists of a set of routes for each truck 
   vector<vector<string>> top_ind_truck_routes;
   vector<string> current_route;
   vector<int> original_services;
   vector<int> available_services;
   vector<string> original_services_str;
   vector<vector<string>> services_left_list;
   vector<string> services_left;
   vector<vector<string>> taken_services;
   vector<int> service_number_holder;
   int num_test_routes=routes_to_list;
   double smallest_distance;
   vector<double> distances;
   double total_distance;
   Route routes;
   vector<vector<string>> opt_truck_routes;
   
   
   // initiation service_number_holder : Taking the number of services and the number of trucks and deciding how many services each truck should get
   service_number_holder=divide_services_evenly();
   // Generating service vector
   for(int i=0; i<service_size;i++){
        original_services.push_back(i); 
   } 
   top_ind_truck_routes = systematic_sequence_finder(service_number_holder[0], original_services,num_test_routes); // list of top routes a truck will use
   top_routes.push_back(top_ind_truck_routes);
   taken_services = eliminate_land_fills(top_ind_truck_routes);  // taking these routes and parsing out the services used
   top_ind_truck_routes.erase(top_ind_truck_routes.begin(),top_ind_truck_routes.end());
   // Initiating services_left
   original_services_str = vint_to_str(original_services);
   for(int i=0;i<num_test_routes;i++){
       services_left_list.push_back(original_services_str);
   }
   
   // Generating list of services left by taking out the used services
   services_left_list = eliminate_used_services(taken_services,services_left_list);
   for(int p=1;p<num_of_trucks;p++){
        for(int u =0;u<num_test_routes;u++){
            available_services = vstr_to_int(services_left_list.at(u));
            int num_stt = service_number_holder[p];
            current_route = systematic_sequence_finder1(num_stt, available_services);
            top_ind_truck_routes.push_back(current_route); 
        }

        top_routes.push_back(top_ind_truck_routes);
        taken_services = eliminate_land_fills(top_ind_truck_routes);  // taking these routes and parsing out the services used
        vector<vector<string>> temp_services_left_list = services_left_list;
        if(p<num_of_trucks-1){
        services_left_list = eliminate_used_services(taken_services,temp_services_left_list);
        }
        top_ind_truck_routes.erase(top_ind_truck_routes.begin(),top_ind_truck_routes.end());
   }
   
   double check = top_ind_truck_routes.size();
   
   
   
   
   // Now using the google map handler to actually determine the best routes.
   GM_Handler gm_handle;
   gm_handle.set_api_key("AIzaSyCLPxyggFNCgUi2-Vs4z_DMPinxi7bju0Q");
   // Creating a Route_Statistics Holder to hold the important data for each route

   // Finding out the important data for the first route
   vector<Route_Statistics*> data_holder_list;
    for(int p=0;p<num_test_routes;p++){
        Route_Statistics* route_data_holder = new Route_Statistics();
        for(int k=0;k<num_of_trucks;k++){
             vector<string> a_route = top_routes.at(k).at(p);
             gm_handle.get_route_statistics(a_route, *route_data_holder);
        }
        data_holder_list.push_back(route_data_holder);
   }
   
   std::reverse(data_holder_list.begin(),data_holder_list.end());
   File_Handler file_handle;
   file_handle.create_csv(data_holder_list);
   
}
/////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------//
/////////////////////////////////////////////////////////////////////////////////////

// I put in landfill locations when needed during add land fills but i didn't specify which landfill
// this function goes through and replaces the land fills with the landfill that optimized the route bases off
// the location of the previous location and the next location.
vector<vector<string>> Route_Finder::optimize_land_fills(vector<vector<string>>& current_sets){
    int set_size = current_sets.size();
    vector<vector<string>> new_set;
    vector<string> current_route;
    vector<string> new_route;
    string current_location;
    string prev_location;
    int prev_location_int;
    string nxt_location;
    int nxt_location_int;
    int nxt_nxt_location_int;
    double r1_distance;
    double r2_distance;
    Landfill* L;
    Depot* H;
    Service* prev_ser;
    Service* nxt_ser;
    Service* nxt_nxt_ser;
    int current_route_size;
    int num_of_landfills = Landfill::num_of_landfills;
    int num_of_depots = Depot::num_of_depots;
    vector<double> diff_lf_distances;
    string index_str;
    int index_int;
    string proper_landfill;
    string proper_depot;
    

#ifdef DEBUG
          cout << "num of depots: " << num_of_depots << endl;
#endif
          
    for(int i=0;i<set_size;i++){
        new_route.push_back(truck_specified_depot);
        current_route = current_sets.at(i);
#ifdef DEBUG
        print_vector(current_route);
#endif
        current_route_size = current_route.size();
        string initial_spot = current_route.at(0);
        new_route.push_back(initial_spot);
        for(int j=1;j<current_route_size-1;j++){
            // error coming from line below
         current_location = current_route.at(j);
          prev_location = current_route.at(j-1);
          prev_location_int = to_int(prev_location);
          nxt_location = current_route.at(j+1);
          nxt_location_int = to_int(nxt_location);
          if(j<(current_route_size-2)){
              nxt_nxt_location_int = to_int(current_route.at(j+2));
          }

         if(current_location=="L" and nxt_location =="H"){
            if(j<(current_route_size-2)){
                 prev_ser = services[prev_location_int];
                 nxt_nxt_ser = services[nxt_nxt_location_int];
                for(int k=0;k<num_of_landfills;k++){
                    L = landfills[k];
                    for(int m=0;m<num_of_depots;m++){
                        H = depots[m];
                        double distance = fabs(prev_ser->lat-L->lat)+fabs(prev_ser->lng-L->lng)
                        +fabs(L->lat-H->lat)+fabs(L->lng-H->lng)+fabs(H->lat-nxt_nxt_ser->lng)+fabs(H->lat-nxt_nxt_ser->lat);
                        diff_lf_distances.push_back(distance); 
                    }
               }                 
            index_int = index_of_smallest_element(diff_lf_distances,diff_lf_distances.size());
            int lf_position = floor(index_int/num_of_depots);
            int dp_position = index_int % num_of_depots;
            string lf_position_str = to_string(lf_position);
            string dp_position_str = to_string(dp_position);
            proper_landfill = "L";
            proper_landfill.append(lf_position_str);
            new_route.push_back(proper_landfill);
            proper_depot = "H";
            proper_depot.append(dp_position_str);
            new_route.push_back(proper_depot);
            ++j;
            diff_lf_distances.erase(diff_lf_distances.begin(),diff_lf_distances.end());
            }else{
                prev_ser = services[prev_location_int];
                for(int k=0;k<num_of_landfills;k++){
                    L = landfills[k];
                    for(int m=0;m<num_of_depots;m++){
                        H = depots[m];
                        double distance = fabs(prev_ser->lat-L->lat)+fabs(prev_ser->lng-L->lng)
                        +fabs(L->lat-H->lat)+fabs(L->lng-H->lng);
                        diff_lf_distances.push_back(distance); 
                    }
               }
                             
            index_int = index_of_smallest_element(diff_lf_distances,diff_lf_distances.size());
            int lf_position = floor(index_int/num_of_depots);
            int dp_position = index_int % num_of_depots;
            string lf_position_str = to_string(lf_position);
            string dp_position_str = to_string(dp_position);
            proper_landfill = "L";
            proper_landfill.append(lf_position_str);
            new_route.push_back(proper_landfill);
            proper_depot = "H";
            proper_depot.append(dp_position_str);
            new_route.push_back(truck_specified_depot); //// Changing this to be the starting depot
            ++j;
            diff_lf_distances.erase(diff_lf_distances.begin(),diff_lf_distances.end());
            
            }
         }else if(current_location=="H"){
               prev_ser = services[prev_location_int];
               nxt_ser = services[nxt_location_int];
               for(int k=0;k<num_of_depots;k++){
                   H = depots[k];
               diff_lf_distances.push_back(fabs(prev_ser->lat-H->lat)+fabs(prev_ser->lng-H->lng)+fabs(H->lat-nxt_ser->lat)+fabs(H->lng-nxt_ser->lng));    
               }
               index_int = index_of_smallest_element(diff_lf_distances,diff_lf_distances.size());
               index_str = to_string(index_int);
               proper_depot = "H";
               proper_depot.append(index_str);
               new_route.push_back(proper_depot);
               diff_lf_distances.erase(diff_lf_distances.begin(),diff_lf_distances.end());
         
         }else  if(current_location =="L"){
               prev_ser = services[prev_location_int];
               nxt_ser = services[nxt_location_int];
               for(int k=0;k<num_of_landfills;k++){
                   L = landfills[k];
               diff_lf_distances.push_back(fabs(prev_ser->lat-L->lat)+fabs(prev_ser->lng-L->lng)+fabs(L->lat-nxt_ser->lat)+fabs(L->lng-nxt_ser->lng));    
               }
               index_int = index_of_smallest_element(diff_lf_distances,diff_lf_distances.size());
               index_str = to_string(index_int);
               proper_landfill = "L";
               proper_landfill.append(index_str);
               new_route.push_back(proper_landfill);
               diff_lf_distances.erase(diff_lf_distances.begin(),diff_lf_distances.end());
            }else{
                new_route.push_back(current_location);
                if(j==current_route_size-2){
                    string final_spot =truck_specified_depot;
                    new_route.push_back(final_spot);
                }
            }
                    
        }


#ifdef DEBUG
        print_vector(new_route);
#endif

        new_set.push_back(new_route);  
        new_route.erase(new_route.begin(),new_route.end());
    }
    
    return new_set;
    

}
/* will need function if not using c++11 compiler
string to_string(int a){

    stringstream ss;
    ss << a;
    string str = ss.str();
    return str;
}
*/

// returns the top X# of best routes for a given truck with k services in its route out of n total services. 
vector<vector<string>> Route_Finder::systematic_sequence_finder(int num_of_services_per_truck, vector<int> service_combo, int num_of_seq_to_return){
   vector<int> combo;
   vector<vector<int>> potential_sets;
   vector<vector<int>> combinations;
   vector<vector<string>> route_combos;
   vector<vector<string>> new_route_combos;
   vector<vector<string>> test_sequences;
   vector<vector<string>> top_sequences;
   vector<double> distances;
   vector<string> best_sequence;
   vector<string> sequence;
   Route route_check;
   
   // Generating all combinations of nCk n = number of available services k = number of services for this truck
   do
   {
       for(int j=0;j<num_of_services_per_truck;j++){
           combo.push_back(service_combo.at(j));
       }
       combinations.push_back(combo);
       combo.erase(combo.begin(),combo.end());
   }
   while(next_combination(service_combo.begin(),service_combo.begin() + num_of_services_per_truck,service_combo.end()));
   // Looping through all the combinations and testing all the permutations
   for(int i=0;i<combinations.size();i++){
        combo = combinations.at(i);
        potential_sets = generate_combination(combo);
        route_combos = add_land_fills(potential_sets);
        new_route_combos = optimize_land_fills(route_combos);
        
        // This is storing the best permutation for each combination
        distances = analyze_distance(new_route_combos);
        route_check = find_best_routes(distances, new_route_combos);
        best_sequence = route_check.get_best_route_sequence();  
        test_sequences.push_back(best_sequence);
   }
   // this is sorting the best permutation for each combination and returning the top 10 options
    distances = analyze_distance(test_sequences);
    route_check = find_best_routes(distances, test_sequences);
    for(int i=0;i<num_of_seq_to_return;i++){
        sequence = route_check.get_next_route_sequence();
        top_sequences.push_back(sequence);
    }
    
    return top_sequences;
}

// returns the top X# of best routes for a given truck with k services in its route out of n total services. 
vector<string> Route_Finder::systematic_sequence_finder1(int num_of_services_per_truck, vector<int> service_combo){
   vector<int> combo;
   vector<vector<int>> potential_sets;
   vector<vector<int>> combinations;
   vector<vector<string>> route_combos;
   vector<vector<string>> new_route_combos;
   vector<vector<string>> test_sequences;
   vector<vector<string>> top_sequences;
   vector<double> distances;
   vector<string> best_sequence;
   vector<string> sequence;
   Route route_check;
   
   // Generating all combinations of nCk n = number of available services k = number of services for this truck
   do
   {
       for(int j=0;j<num_of_services_per_truck;j++){
           combo.push_back(service_combo.at(j));
       }
       combinations.push_back(combo);
       combo.erase(combo.begin(),combo.end());
   }
   while(next_combination(service_combo.begin(),service_combo.begin() + num_of_services_per_truck,service_combo.end()));
   // Looping through all the combinations and testing all the permutations
   for(int i=0;i<combinations.size();i++){
        combo = combinations.at(i);
        potential_sets = generate_combination(combo);
        route_combos = add_land_fills(potential_sets);
        new_route_combos = optimize_land_fills(route_combos);
        
        // This is storing the best permutation for each combination
        distances = analyze_distance(new_route_combos);
        route_check = find_best_routes(distances, new_route_combos);
        best_sequence = route_check.get_best_route_sequence();  
        test_sequences.push_back(best_sequence);
   }
   // this is sorting the best permutation for each combination and returning the top 10 options
    distances = analyze_distance(test_sequences);
    route_check = find_best_routes(distances, test_sequences);
    vector<string> top_sequence = route_check.get_best_route_sequence();
    
    return top_sequence;
}

vector<vector<string>> Route_Finder::eliminate_used_services(vector<vector<string>>& taken_services,vector<vector<string>>& services_left_list){
   vector<string> services_left;
   vector<string> taken_service;
   string compare_destination;
   vector<string>::iterator iter;
 

   // taking out used services
   for(int i=0;i<taken_services.size();i++){
       taken_service = taken_services.at(i);
       services_left = services_left_list.at(i);
       for(int j=0;j<taken_service.size();j++){
           compare_destination = taken_service.at(j);
               iter = find(services_left.begin(), services_left.end(), compare_destination);
               services_left.erase(iter);
       }
       services_left_list.at(i)=services_left;
   }
   
   return services_left_list;
}
void Route_Finder::display_truck_services(vector<int>* bags ){

    for(int i = 0;i<num_of_trucks;i++){
        vector<int> this_bag = bags[i];
        int size_of_bag = this_bag.size();
        for(int idx=0;idx<size_of_bag;idx++){
            int service_number = this_bag.at(idx);
            Service* ser =services[service_number];
            double lat = ser->lat;
            double lng = ser->lng;
        }

    } 
}

vector<int> Route_Finder::divide_services_evenly(){
    int num_of_services = services.size();
    int num_left = num_of_services;
    int even_destribution_num = floor(num_of_services/num_of_trucks);
    vector<int> service_number_holder;
    for(int i=0;i<num_of_trucks;i++){
        if(i==(num_of_trucks-1)){
            service_number_holder.push_back(num_left);
        }else{
            service_number_holder.push_back(even_destribution_num);
            num_left-=even_destribution_num;
        }
    }
    
    std::reverse(service_number_holder.begin(),service_number_holder.end());
    return service_number_holder;
    
}

string Route_Finder::data_to_json(vector<Route_Statistics*> data_holder_list){
    // variables
    string json_data;
    Route_Statistics* route_data_holder = data_holder_list.at(0); // this gives us the best route statistics for each truck. at 1 would give use the second best.
        // Each Route_Statistics* will contain statistics on each route for each truck. 
    // main segment
    json_data.append("{ \"routes\": [");
    
    
    for(int i=0;i<num_of_trucks;i++){

        route_data_holder->print_statistics(i);

        vector<string> route_symbols = route_data_holder->get_route_at(i);
        vector<double> btw_distances = route_data_holder->get_btw_distances_at(i);
        vector<double> btw_durations = route_data_holder->get_btw_durations_at(i);
        double total_distance = route_data_holder->get_total_distance_at(i);
        double total_duration = route_data_holder->get_total_duration_at(i);
        if(i==0){
            json_data.append("{\"symbols\": [");
        }else{
            json_data.append(",{\"symbols\": [");
        }
        int num_of_symbols = route_symbols.size();
        for(int j=0;j<num_of_symbols;j++){
            string symbol = route_symbols.at(j);
            if(j<num_of_symbols-1){
            json_data.append("\""+symbol+"\" , ");
            }else{
            json_data.append("\""+symbol+"\"");
            }
        }
        json_data.append("],");  
        
        json_data.append("\"btw_distances\": [ ");
        int num_of_btw_distances= btw_distances.size();
        for(int j=0;j<num_of_btw_distances;j++){
            string btw_distance = to_string(btw_distances.at(j)/1609.3);
            if(j<num_of_btw_distances-1){
            json_data.append(btw_distance+" , ");
            }else{
            json_data.append(btw_distance);
            }
        }
        json_data.append("],");   
        
        json_data.append("\"btw_durations\": [ ");
        int num_of_btw_durations= btw_durations.size();
        for(int j=0;j<num_of_btw_durations;j++){
            string btw_duration= to_string(btw_durations.at(j)/3600);
            if(j<num_of_btw_durations-1){
            json_data.append(btw_duration+" , ");
            }else{
            json_data.append(btw_duration);
            }
        }

        json_data.append("], \"total_distance\": "+to_string(total_distance/1609.3)+", ");
        json_data.append("\"total_duration\": "+ to_string(total_duration/3600)+"}");
        
    }
    
    json_data.append("]}");
    
    cout << json_data << endl;
    return json_data;

}

vector<vector<string>> Route_Finder::split_single_route(vector<Route_Statistics*> data_holder_list){
 
    Route_Statistics* route_data_holder = data_holder_list.at(0); // this gives us the best route statistics for each truck. at 1 would give use the second best.
    route_data_holder->print_statistics(0);

    double total_duration = route_data_holder->get_total_duration_at(0);
    double estimated_truck_duration = (total_duration/num_of_trucks)/3600;
    double error;
    double time_to_symbol=0;
    
    bool redundant_home_split_locations = false;
    bool not_enough_home_split_locations = false;
    
    vector<vector<string>> truck_routes;
    
    vector<string> route_symbols = route_data_holder->get_route_at(0);
    vector<double> btw_distances = route_data_holder->get_btw_distances_at(0);
    vector<double> btw_durations = route_data_holder->get_btw_durations_at(0);
    vector<double> truck_timing_array;
    vector<double> home_time_array; // this will hold the duration to each Yard with dumpsters
    vector<double> timing_error_array;
    vector<double> symbol_time_array;
    
    vector<int> home_location_array;
    vector<int> best_truck_split_locations;
    
    string symbol;
    string symbol_indicator;
    
    for(int i=0;i<btw_durations.size();i++){
        time_to_symbol=time_to_symbol+btw_durations.at(i)/3600;
        symbol=route_symbols.at(i+1);
        symbol_indicator = symbol.substr(0,1);
        if(symbol_indicator=="H"){
            home_time_array.push_back(time_to_symbol);
            home_location_array.push_back(i+1);
        }
        symbol_time_array.push_back(time_to_symbol);
    }
    cout <<"printing home_time_array" << endl;
    print_vector(home_time_array);
    cout << "printing home_location_array" << endl;
    print_vector(home_location_array);
    
    
    cout << endl;
    cout << "The estimated truck duration per truck is: " << estimated_truck_duration << endl;
    
    
    for(int i=0;i<num_of_trucks;i++){
        truck_timing_array.push_back((i+1)*estimated_truck_duration);
    }
    
    cout << "The truck timing array: " << endl;
    print_vector(truck_timing_array);
    if(home_time_array.size()>=num_of_trucks){
        for(int i=0;i<num_of_trucks;i++){
            double minimum_error;
            double truck_time = truck_timing_array[i];
            int best_truck_location=0;   //THIS MAY CAUSE ISSUES LATER
            for(int j=0;j<home_time_array.size();j++){
                double home_time = home_time_array[j];
                error = abs(truck_time-home_time);
                if(j==0){
                    minimum_error=error;
                }else{
                    if(error<minimum_error){
                        minimum_error=error;
                        best_truck_location = home_location_array.at(j);
                    }
                }
                timing_error_array.push_back(error);
            }
            
            best_truck_split_locations.push_back(best_truck_location);
        }        
    }else{
        not_enough_home_split_locations=true;
    }
    
    cout << "best truck split locations: " << endl;
    print_vector(best_truck_split_locations);
    // This is checking to see if we repeat a location in our best_truck_split_locations.
    for(int l=0;l<best_truck_split_locations.size();l++){
        int check_location = best_truck_split_locations.at(l);
        int num_of_instances = 0;
        for(int k=0;k<best_truck_split_locations.size();k++){
            int item = best_truck_split_locations.at(k);
            if(check_location==item){
                num_of_instances=num_of_instances+1;
            }  
        }
        if(num_of_instances>1){
            cout << "you have redundant split locations: " << check_location<< endl;
            redundant_home_split_locations=true;
        }        
    }
    
    if(redundant_home_split_locations || not_enough_home_split_locations){
            for(int i=0;i<num_of_trucks;i++){
            double minimum_error;
            double truck_time = truck_timing_array[i];
            int best_truck_location=0;   //THIS MAY CAUSE ISSUES LATER
            for(int j=0;j<symbol_time_array.size();j++){
                double symbol_time = symbol_time_array[j];
                error = abs(truck_time-symbol_time);
                if(j==0){
                    minimum_error=error;
                }else{
                    if(error<minimum_error){
                        minimum_error=error;
                        best_truck_location = j+1;
                    }
                }
                timing_error_array.push_back(error);
            }
            
            best_truck_split_locations.push_back(best_truck_location);
        }   
            cout << "best truck split locations: " << endl;
            print_vector(best_truck_split_locations);
    }
    
    
    int truck_start_location=0;
    int truck_end_location;
    cout << "entering route splitter" << endl;
    for(int i=0;i<num_of_trucks;i++){
        truck_end_location = best_truck_split_locations.at(i);
        vector<string> current_route_symbols(route_symbols.begin()+truck_start_location,route_symbols.begin()+truck_end_location);
        cout << "split truck route: " << i << endl;
        print_vector(current_route_symbols);
        truck_start_location=truck_end_location;
        truck_routes.push_back(eliminate_land_fills(current_route_symbols));
    }
    
    cout << "printing the truck routes now" << endl;
    print_vector2(truck_routes);
    
    return truck_routes;
}