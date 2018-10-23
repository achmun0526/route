/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 * 
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/* 
 * File:   GM_Handler.cpp
 * Author: forest schwartz
 * 
 * Created on January 7, 2018, 10:38 PM
 */

#include "GM_Handler.h"
#include "Route_Finder.h"

//Global Varibales     
string data; //will hold the url's contents
// function prototypes
void get_json(string,string);
void get_json_company();
void get_json_distance_ll(vector<double>,vector<double>, string);
void get_json_distance_id(string,string,string);
size_t writeCallback(char*, size_t, size_t, void*);
int to_int(string);
vector<string> sub_vector(vector<string>&);
int index_of_largest_element(double*, int);

// initiating static variables
vector<string> GM_Handler::place_id_list;
map<string,string> GM_Handler::place_id_map;


/////////////////////////////////////////////////
/////////// Constructors/Destructors ////////////
/////////////////////////////////////////////////

GM_Handler::GM_Handler(vector<Service*> services, vector<Landfill*> landfills, vector<Depot*> depots) {
    this->services = services;
    this->landfills = landfills;
    this->depots = depots;
}

GM_Handler::GM_Handler(){
}

GM_Handler::GM_Handler(const GM_Handler& orig) {
}

GM_Handler::~GM_Handler() {
}

/////////////////////////////////////////////////
/////////// Function Definitions ////////////
/////////////////////////////////////////////////

vector<vector<double>> GM_Handler::get_coordinates(vector<string> address_list){
    string address;
    vector<double> coord;
    vector<vector<double>> coord_list;
    for(int i=0;i<address_list.size();i++){
        address = address_list.at(i);
        coord = get_lat_lng(address);
        coord_list.push_back(coord);
    }
    
    
    return coord_list;

}
// gets the coordinates of an address and stores its id
vector<vector<double>> GM_Handler::get_coordinates_sid(vector<string> address_list, string type, vector<string> quantity_list){
    string address;
    int quantity;
    vector<double> coord;
    vector<vector<double>> coord_list;
    for(int i=0;i<address_list.size();i++){
        address = address_list.at(i);
        quantity=to_int(quantity_list.at(i));
        coord = get_lat_lng_sid(address, type, quantity);
        coord_list.push_back(coord);
    }
    
    
    return coord_list;

}

// Returns the google map place id for a given address
string GM_Handler::get_place_id(string address_){
    data.erase(data.begin(),data.end());
    get_json(address_ ,api_key);
    istringstream iss(data);
    string line;
    int count(0);
    int count2(0);
    string lat;
    string lng;
    int check(0);
    int check2(0);
    vector<double> coord;
    double lat_d;
    double lng_d;
    vector<string> lister;
    string place_id;

    while (std::getline(iss, line)) {
        string word;
        istringstream is(line);
            
        while(is >> word) {
            if(!word.compare("\"location\"")){
                check = 1;
            }
            if(check){
                count++;
                if(count==6){
                    lat = word;
                }else if(count==9){
                    lng=word;
                }
            }
            if(!word.compare("\"place_id\"")){
                check2=1;
            }
            if(check2){
                count2++;
                if(count2==3){
                    place_id = word;
                }
            }
        }

    }    

    
   
    if(place_id.empty()){
        cout << "Google maps cannot find address:  "+ address_ << endl;
        cout << "Please correct this address in your csv file and verify that google maps can find it." << endl;
        exit(EXIT_FAILURE);
    }


    return place_id;

}

// This gets latitude lng from string address but also stores the place_id of the access during create map
vector<double> GM_Handler::get_lat_lng_sid(string address_,string type, int quantity){
    data.erase(data.begin(),data.end());
    get_json(address_ ,api_key);
    istringstream iss(data);
    string line;
    int count(0);
    int count2(0);
    string lat;
    string lng;
    int check(0);
    int check2(0);
    vector<double> coord;
    double lat_d;
    double lng_d;
    vector<string> lister;
    
    while (std::getline(iss, line)) {
        string word;
        istringstream is(line);
            
        while(is >> word) {
            if(!word.compare("\"location\"")){
                check = 1;
            }
            if(check){
                count++;
                if(count==6){
                    lat = word;
                }else if(count==9){
                    lng=word;
                    break;
                }
            }           
            if(!word.compare("\"place_id\"")){
                check2=1;
            }
            if(check2){
                count2++;
                if(count2==3){
                    for(int p=0;p<quantity;p++){
                        place_id_list.push_back(word);
                    }
                }
            }
        }
    }    

    
    try{

        lat_d = stod(lat);
        lng_d = stod(lng);
    }catch(std::exception e){
        cout << "Google maps cannot find address:  "+ address_ << endl;
        cout << "Please correct this address in your csv file and verify that google maps can find it." << endl;
        exit(EXIT_FAILURE);
    }
    coord.push_back(lat_d);
    coord.push_back(lng_d);

    return coord;
}
// generic get lat_lng from string address
vector<double> GM_Handler::get_lat_lng(string address_){
    data.erase(data.begin(),data.end());
    get_json(address_ ,api_key);
    istringstream iss(data);
    string line;
    int count(0);
    int count2(0);
    string lat;
    string lng;
    int check(0);
    int check2(0);
    vector<double> coord;
    double lat_d;
    double lng_d;
    vector<string> lister;
    
    while (std::getline(iss, line)) {
        string word;
        istringstream is(line);
            
        while(is >> word) {
            if(!word.compare("\"location\"")){
                check = 1;
            }
            if(check){
                count++;
                if(count==6){
                    lat = word;
                }else if(count==9){
                    lng=word;
                    break;
                }
            }           
        }
    }    

    
    try{

        lat_d = stod(lat);
        lng_d = stod(lng);
    }catch(std::exception e){
        cout << "Google maps cannot find address:  "+ address_ << endl;
        cout << "Please correct this address in your csv file and verify that google maps can find it." << endl;
        exit(EXIT_FAILURE);
    }
    coord.push_back(lat_d);
    coord.push_back(lng_d);

    return coord;
}

// I will finish this one later
void GM_Handler::get_distance_ll(vector<double>origin,vector<double>destination){

}

// input the place id of the origin and destination and it will spit out the distance and time it takes to travel from the origin to the destination
vector<double> GM_Handler::get_distance_and_time(string origin, string destination){
    data.erase(data.begin(),data.end());
    get_json_distance_id(origin,destination,api_key); 
    istringstream iss(data);
    string line;
    int count(0);
    int count1(0);
    int check1(0);
    int check2(0);
    int check3(0);
    int check4(0);
    string distance;
    string duration;
    while (std::getline(iss, line)) {
        string word;
        istringstream is(line);
            
        while(is >> word) {
            if(!word.compare("\"distance\"")){
                check1 = 1;
            }
            if(check1){
                if(!word.compare("\"value\"")){
                    check2=1;
                }
                if(check2){
                    ++count;
                }
                if(count==3){
                    distance = word;
                    check1=0;
                }
            }
            
            if(!word.compare("\"duration\"")){
                check3 = 1;
            }
             if(check3){
                if(!word.compare("\"value\"")){
                    check4=1;
                }
                if(check4){
                    ++count1;
                }
                if(count1==3){
                    duration = word;
                    check3=0;
                }
             }
        }
    }
   
    double distance_d = stod(distance);
    double duration_d = stod(duration);
    vector<double> return_data;
    return_data.push_back(distance_d);
    return_data.push_back(duration_d);
    return return_data;
}


// input the vector<double> (lat,lng) of the origin and destination and it will spit out the distance and time it takes to travel from the origin to the destination
vector<double> GM_Handler::get_distance_and_time(vector<double> origin, vector<double> destination){
    data.erase(data.begin(),data.end());
    get_json_distance_ll(origin,destination,api_key); 
    istringstream iss(data);
    string line;
    int count(0);
    int count1(0);
    int check1(0);
    int check2(0);
    int check3(0);
    int check4(0);
    string distance;
    string duration;
    while (std::getline(iss, line)) {
        string word;
        istringstream is(line);
            
        while(is >> word) {
            if(!word.compare("\"distance\"")){
                check1 = 1;
            }
            if(check1){
                if(!word.compare("\"value\"")){
                    check2=1;
                }
                if(check2){
                    ++count;
                }
                if(count==3){
                    distance = word;
                    check1=0;
                }
            }
            
            if(!word.compare("\"duration\"")){
                check3 = 1;
            }
             if(check3){
                if(!word.compare("\"value\"")){
                    check4=1;
                }
                if(check4){
                    ++count1;
                }
                if(count1==3){
                    duration = word;
                    check3=0;
                }
             }
        }
    }
   
    double distance_d = stod(distance);
    double duration_d = stod(duration);
    vector<double> return_data;
    return_data.push_back(distance_d);
    return_data.push_back(duration_d);
    return return_data;
}


// Input a vector<string> that contains a route and returns the route statistics. 
void GM_Handler::get_route_statistics(vector<string> route, Route_Statistics& route_data_holder){
    vector<double> dt_data;
    vector<double> ind_duration_data; // individual duration data between each destination
    vector<double> ind_distance_data;
    double total_time(0);
    double total_distance(0);
    double ind_distance;
    double ind_time;
    map<string,string>::iterator it;
    string current_symbol;
    string next_symbol;
    vector<double> origin;
    vector<double> destination;
    Route_Statistics route_statistic;
    
    for(int k=0;k<route.size()-1;k++){
        current_symbol = route.at(k);
        next_symbol = route.at(k+1);
        
        // Getting the map ids of the origin and destination
        origin =get_symbols_lat_lng(current_symbol);
        destination = get_symbols_lat_lng(next_symbol);
        dt_data = get_distance_and_time(origin,destination);
        ind_distance = dt_data[0];
        total_distance +=ind_distance;
        ind_time = dt_data[1];
        total_time += ind_time;
        ind_distance_data.push_back(ind_distance);
        ind_duration_data.push_back(ind_time);
    }

   route_data_holder.insert_route_statistic(route, ind_distance_data, ind_duration_data, total_distance, total_time);
}

vector<double> GM_Handler::get_symbols_lat_lng(string symbol){
    string symbol_type = symbol.substr(0,1);
    double lat;
    double lng;
    vector<double> coord;
    
    if(symbol_type=="H"){
        int symbol_position = to_int(symbol.substr(1));
        lat = depots[symbol_position]->lat;
        lng = depots[symbol_position]->lng;
    }else if(symbol_type=="L"){
        int symbol_position = to_int(symbol.substr(1));
        lat = landfills[symbol_position]->lat;
        lng = landfills[symbol_position]->lng;
    }else{
      int symbol_position = to_int(symbol.substr(0));
        lat =services[symbol_position]->lat;
        lng =services[symbol_position]->lng;
    }
    
    coord.push_back(lat);
    coord.push_back(lng);
    return coord;
}

void GM_Handler::set_api_key(string api_key_){
    api_key=api_key_;
}



void GM_Handler::get_company(){
    get_json_company(); 
   
}

size_t writeCallback(char* buf, size_t size, size_t nmemb, void* up)
{ //callback must have this declaration
    //buf is a pointer to the data that curl has for us
    //size*nmemb is the size of the buffer

    for (int c = 0; c<size*nmemb; c++)
    {
        data.push_back(buf[c]);
    }
    return size*nmemb; //tell curl how many bytes we handled
}


void get_json(string input_address, string api_key){
    

string address;
string segment = "/json?address=";
address = "https://maps.googleapis.com/maps/api/";
address.append("geocode");
address.append(segment);
    istringstream iss(input_address); 
    string word;
    while(iss >> word) {
        address.append(word+"+");
    }
    address.append("&key=");
    address.append(api_key);
    
CURL* curl; //our curl object
curl_global_init(CURL_GLOBAL_ALL); 
curl = curl_easy_init();

curl_easy_setopt(curl, CURLOPT_URL, address.c_str());
curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
//curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L); //tell curl to output its progress


curl_easy_perform(curl);

curl_easy_cleanup(curl);
curl_global_cleanup();
}

void get_json_distance_ll(vector<double> origin, vector<double> destination,string api_key){
    

    string origin_lat = to_string(origin.at(0)); string origin_lng = to_string(origin.at(1));
    string destination_lat = to_string(destination.at(0)); string destination_lng = to_string(destination.at(1));


   string address = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=";
   address.append(origin_lat+",");
   address.append(origin_lng+"&destinations=");
   address.append(destination_lat+",");
   address.append(destination_lng+"&mode=driving"+"&key="+api_key);

   

    CURL* curl; //our curl object
    curl_global_init(CURL_GLOBAL_ALL); //pretty obvious
    curl = curl_easy_init();

    curl_easy_setopt(curl, CURLOPT_URL, address.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
    //curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L); //tell curl to output its progress

    curl_easy_perform(curl);

    curl_easy_cleanup(curl);
    curl_global_cleanup();
    
}

void get_json_distance_id(string origin,string destination,string api_key){
    
   string address = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:";
   address.append(origin);
   address.append("&destinations=place_id:");
   address.append(destination+""+"&key="+api_key);

    CURL* curl; //our curl object
    curl_global_init(CURL_GLOBAL_ALL); //pretty obvious
    curl = curl_easy_init();

    curl_easy_setopt(curl, CURLOPT_URL, address.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
    //curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L); //tell curl to output its progress

    curl_easy_perform(curl);

    curl_easy_cleanup(curl);
    curl_global_cleanup();
    
}

void get_json_company(){
    
        
string address = "https://datastore.googleapis.com/v1/projects/texas-dumpsters-development:beginTransaction";
    
CURL* curl; //our curl object
curl_global_init(CURL_GLOBAL_ALL); //pretty obvious
curl = curl_easy_init();

curl_easy_setopt(curl, CURLOPT_URL, address.c_str());
curl_easy_setopt(curl, CURLOPT_POST, 1);
//curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L); //tell curl to output its progress


curl_easy_perform(curl);

curl_easy_cleanup(curl);
curl_global_cleanup();

}