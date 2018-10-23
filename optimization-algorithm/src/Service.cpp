/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   service.cpp
 * Author: forest schwartz
 * 
 * Created on December 13, 2017, 5:03 PM
 */

#include "Service.h"


//using namespace std;

int Service::numberOfServices = 0;
vector<string> Service::type_reference;

set<uint8_t> Service::size_bag;

Service::Service(double lat,double lng,string type,int size){


    this->type = type;
    this->size = size;
    this->lat = lat;
    this->lng = lng;
    this->gm_id = gm_id;

    
    static int id_number = 0;
    this->id = id_number;
    id_number++;
    size_bag.insert(size);
    numberOfServices++;
    type_reference.push_back(type);
    super::set_member_variables(lat,lng,to_string(id));
}

Service::Service(const Service& orig):Destination(orig) {
}

Service::~Service() {
}


void Service::addAddress(string address){

    this->address = address;
}

int Service::getNumberOfServices(){
    return numberOfServices;
}

void Service::reset_static_variables(){
    size_bag.clear();
    type_reference.clear();
    numberOfServices=0;
    
}

void Service::set_place_id(string place_id_){
    place_id=place_id_;
    super::place_id=place_id_;
}