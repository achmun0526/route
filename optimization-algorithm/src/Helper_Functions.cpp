/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
#include "Landfill.h"
#include <vector>
#include <iostream>
#include <numeric>
#include <stdio.h>
#include <algorithm>
#include <stdlib.h>
#include <sstream>
#include <vector>
#include <math.h>
#include "LatLng.h"
#include <array>
#include <string>
#include <iterator>
#include <map>

using std::string; using std::istringstream; using std::cout; using std::endl; 
using std::vector; using std::cin;


vector<string> sub_vector(vector<string>& v){

    int random_place1 = rand() % v.size(); 
    int random_place2= rand() % v.size();
    vector<string>::iterator first = v.begin() + random_place1;
    vector<string>::iterator last = v.begin() + random_place2;
    if(random_place2>random_place1){
       vector<string> new_T(first,last);
       v.erase(first,last);
       return new_T;
    }else{
      vector<string> new_T(last,first);
      v.erase(last,first);
      return new_T;
    }
}   

int index_of_largest_element(double array[], int size)
{
    int index = 0;
    for(int i = 1; i < size; i++)
    {
        if(array[i] > array[index])
            index = i;              
    }
    return index;
}

vector<string> vint_to_str(vector<int>& v){
    int v_size = v.size();
    vector<string> return_vector;
    string current_str;
    for(int z=0; z<v_size; z++){
        current_str = to_string(v.at(z));
        return_vector.push_back(current_str);
    }
    return return_vector;
}



int to_int(string str_dec){
 std::string::size_type sz;   // alias of size_t

  int i_dec = std::atoi (str_dec.c_str());
  return i_dec;

}

vector<int> vstr_to_int(vector<string>& v){
    int v_size = v.size();
    vector<int> return_vector;
    string current_str;
    for(int z=0; z<v_size; z++){
        current_str = v.at(z);
        return_vector.push_back(to_int(current_str));
    }
    return return_vector;
}

vector<vector<int>> vvstr_to_int(vector<vector<string>>& v){
    vector<vector<int>> return_vector;
    for(int i=0;i<v.size();i++){
        vector<int> vint = vstr_to_int(v.at(i));
        return_vector.push_back(vint);
    }
    return return_vector;
}


void print_vvi(vector<vector<int>> v){
    for(int i=0;i<v.size();i++){
        cout << "vect number: " << i << endl;
        vector<int> v2 = v.at(i);
        for(int j=0;j<v2.size();j++){
            cout << v2.at(j);
        }
    }
}