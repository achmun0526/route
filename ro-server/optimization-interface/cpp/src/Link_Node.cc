// Copyright (c) [2018], Forest Schwartz. All rights reserved

#include <node.h>
#include <v8.h>
#include <uv.h>
#include "Link.h"
#include <string>
#include <iostream>
#include <vector>
#include <algorithm>
#include <chrono>
#include <thread>

using namespace v8;
using std::vector; using std::cout; using std::endl; using std::string;

vector<service_order> unpack_json(Isolate * , const Handle<Object> sample_obj);
service_order unpack_sample(Isolate * , const Handle<Object> );
void pack_rain_result(v8::Isolate* isolate, v8::Local<v8::Object> & target, order_results & result);


///////////////////////////////////////////////////////////////////
// Part 1 - Returning objects
///////////////////////////////////////////////////////////////////
        // void pack_rain_result(v8::Isolate* isolate, v8::Local<v8::Object> & target, order_results & result){
        //
        //   target->Set(String::NewFromUtf8(isolate, "results"), String::NewFromUtf8(isolate,result.results));
        // }


///////////////////////////////////////////////////////////////////
// Unpacking Service Orders
///////////////////////////////////////////////////////////////////

service_order unpack_service_order(Isolate * isolate, const Handle<Object> service_order_obj) {
  service_order s;
  Handle<Value> order_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "order_id"));
  Handle<Value> customer_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "customer_key"));
  Handle<Value> lat_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "latitude"));
  Handle<Value> lng_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "longitude"));
  Handle<Value> quantity_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "quantity"));
  Handle<Value> size_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "size"));
  Handle<Value> type_Value = service_order_obj->Get(String::NewFromUtf8(isolate, "type"));
  v8::String::Utf8Value customerValue(customer_Value);
  s.customer_key = std::string(*customerValue, customerValue.length());
  v8::String::Utf8Value orderValue(quantity_Value);
  s.order_id = std::string(*orderValue, orderValue.length());
  v8::String::Utf8Value typeValue(type_Value);
  s.type = std::string(*typeValue, typeValue.length());

  // Unpack the numeric rainfall amount directly from V8 value
  s.quantity_value = quantity_Value->NumberValue();
  s.latitude = lat_Value->NumberValue();
  s.longitude = lng_Value->NumberValue();
  s.size =size_Value->NumberValue();
  return s;
}


vector<service_order> unpack_service_orders(Isolate * isolate, const Handle<Object> json_obj) {
  vector<service_order> service_orders;
  Handle<Array> array = Handle<Array>::Cast(json_obj->Get(String::NewFromUtf8(isolate,"orders")));
  int sample_count = array->Length();
  for ( int i = 0; i < sample_count; i++ ) {
    service_order s = unpack_service_order(isolate, Handle<Object>::Cast(array->Get(i)));
    service_orders.push_back(s);
  }
  return service_orders;
}

///////////////////////////////////////////////////////////////////
// Unpacking Landfills
///////////////////////////////////////////////////////////////////
landfill unpack_landfill(Isolate * isolate, const Handle<Object> landfill_obj) {
  landfill l;

  Handle<Value> lat_Value = landfill_obj->Get(String::NewFromUtf8(isolate, "latitude"));
  Handle<Value> lng_Value = landfill_obj->Get(String::NewFromUtf8(isolate, "longitude"));
  l.latitude = lat_Value->NumberValue();
  l.longitude = lng_Value->NumberValue();
  return l;
}


vector<landfill> unpack_landfills(Isolate * isolate, const Handle<Object> json_obj) {
  vector<landfill> node_landfills;
// Get rid of this line
  Handle<Array> array = Handle<Array>::Cast(json_obj->Get(String::NewFromUtf8(isolate,"landfills")));
  int sample_count = array->Length();
  for ( int i = 0; i < sample_count; i++ ) {
    landfill l = unpack_landfill(isolate, Handle<Object>::Cast(array->Get(i)));
    node_landfills.push_back(l);
  }
  return node_landfills;
}

  ///////////////////////////////////////////////////////////////////
  // Unpacking Depots
  ///////////////////////////////////////////////////////////////////
  depot unpack_depot(Isolate * isolate, const Handle<Object> depot_obj) {
    depot d;

    Handle<Value> lat_Value = depot_obj->Get(String::NewFromUtf8(isolate, "latitude"));
    Handle<Value> lng_Value = depot_obj->Get(String::NewFromUtf8(isolate, "longitude"));
    d.latitude = lat_Value->NumberValue();
    d.longitude = lng_Value->NumberValue();
    return d;
  }

  vector<depot> unpack_depots(Isolate * isolate, const Handle<Object> json_obj) {
    vector<depot> node_depots;
  // Get rid of this line
    Handle<Array> array = Handle<Array>::Cast(json_obj->Get(String::NewFromUtf8(isolate,"depots")));
    int sample_count = array->Length();
    for ( int i = 0; i < sample_count; i++ ) {
      depot d = unpack_depot(isolate, Handle<Object>::Cast(array->Get(i)));
      node_depots.push_back(d);
    }
    return node_depots;
  }

  ///////////////////////////////////////////////////////////////////
  // Unpacking Number of Trucks
  ///////////////////////////////////////////////////////////////////
  int unpack_truck(Isolate * isolate, const Handle<Object> truck_obj) {
cout << "inside unpack_truck" << endl;
    int num_of_trucks;
    Handle<Value> truck_num_Value = truck_obj->Get(String::NewFromUtf8(isolate, "truck_num"));
    num_of_trucks = truck_num_Value->NumberValue();
    return num_of_trucks;
  }

  int unpack_trucks(Isolate * isolate, const Handle<Object> json_obj) {
	cout <<"inside unpack_trucks" << endl;
// Get rid of this line
    int num_of_trucks;
    Handle<Array> array = Handle<Array>::Cast(json_obj->Get(String::NewFromUtf8(isolate,"num_of_trucks")));
    int sample_count = array->Length();
    for ( int i = 0; i < sample_count; i++ ) {
      num_of_trucks = unpack_truck(isolate, Handle<Object>::Cast(array->Get(i)));
    }
    return num_of_trucks;
  }


  ///////////////////////////////////////////////////////////////////
  // Unpacking Number of Iterations
  ///////////////////////////////////////////////////////////////////
  int unpack_iteration(Isolate * isolate, const Handle<Object> iteration_obj) {
cout << "inside unpack_iteration" << endl;
    int num_of_iterations;
    Handle<Value> iteration_num_Value = iteration_obj->Get(String::NewFromUtf8(isolate, "iteration_num"));
    num_of_iterations = iteration_num_Value->NumberValue();
    return num_of_iterations;
  }

  int unpack_iterations(Isolate * isolate, const Handle<Object> json_obj) {
  cout <<"inside unpack_iterations" << endl;
// Get rid of this line
    int num_of_iterations;
    Handle<Array> array = Handle<Array>::Cast(json_obj->Get(String::NewFromUtf8(isolate,"num_of_iterations")));
    int sample_count = array->Length();
    for ( int i = 0; i < sample_count; i++ ) {
      num_of_iterations = unpack_iteration(isolate, Handle<Object>::Cast(array->Get(i)));
    }
    return num_of_iterations;
  }

  ///////////////////////////////////////////////////////////////////
  // Initializing Compute sequence
  ///////////////////////////////////////////////////////////////////

  void computeOrders(const v8::FunctionCallbackInfo<v8::Value>& args) {
    cout << "inside link node" << endl;
    Isolate* isolate = args.GetIsolate();
    vector<service_order> node_service_orders = unpack_service_orders(isolate, Handle<Object>::Cast(args[0]));
    vector<landfill> node_landfills = unpack_landfills(isolate,Handle<Object>::Cast(args[0]));
    vector<depot> node_depots = unpack_depots(isolate,Handle<Object>::Cast(args[0]));
    int num_of_trucks = unpack_trucks(isolate,Handle<Object>::Cast(args[0]));
    int num_of_iterations = unpack_iterations(isolate,Handle<Object>::Cast(args[0]));
    string json_data = link(node_service_orders, node_landfills, node_depots, num_of_trucks, num_of_iterations);
    Local<String>  retval = String::NewFromUtf8(isolate, json_data.c_str());
    Service::reset_static_variables();
    Depot::reset_static_variables();
    Landfill::reset_static_variables();
    args.GetReturnValue().Set(retval);
  }


void init(Handle <Object> exports, Handle<Object> module) {
  NODE_SET_METHOD(exports, "compute_link", computeOrders);
}

NODE_MODULE(Link, init)
