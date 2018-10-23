/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Helper_Functions.h
 * Author: forest
 *
 * Created on January 18, 2018, 11:57 AM
 * 
 * 
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

#ifndef HELPER_FUNCTIONS_H
#define HELPER_FUNCTIONS_H
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Templates

template <typename T>
int index_of_smallest_element(T array, int size)
{
    int index = 0;
    for(int i = 1; i < size; i++)
    {
        if(array[i] < array[index])
            index = i;              
    }
    return index;
}


template <typename T>
void print_vector(vector<T>& v){
    for(int i=0;i<v.size();i++){
        cout << v.at(i) << " " ;
    }
    cout << endl;

}

template <typename T>
void print_vector2(vector<vector<T>>& v){
    vector<T> a;
    for(int i=0;i<v.size();i++){
        a = v.at(i);
        T symbol;
        for(int j=0;j<a.size();j++){
            symbol = a.at(j);
            cout << symbol << " ";
        }
        cout << endl;
    }
}

template <typename T>
vector<int> sort_indexes(const vector<T> &v) {

  // initialize original index locations
  vector<int> idx(v.size());
  iota(idx.begin(), idx.end(),0);

  // sort indexes based on comparing values in v
  sort(idx.begin(), idx.end(),
       [&v](int i1, int i2) {return v[i1] < v[i2];});

  return idx;
}

template <typename T>
vector<T> generate_combination(T& bag ){
    // Forming all possible permutations of the services
    vector<T> potential_set;
    sort(bag.begin(), bag.end());
    do {
        potential_set.push_back(bag);
    } while(next_permutation(bag.begin(), bag.end()));

    return potential_set;
}


template <typename Iterator>
inline bool next_combination(const Iterator first, Iterator k, const Iterator last)
{
   /* Credits: Thomas Draper */
   if ((first == last) || (first == k) || (last == k))
      return false;
   Iterator itr1 = first;
   Iterator itr2 = last;
   ++itr1;
   if (last == itr1)
      return false;
   itr1 = last;
   --itr1;
   itr1 = k;
   --itr2;
   while (first != itr1)
   {
      if (*--itr1 < *itr2)
      {
         Iterator j = k;
         while (!(*itr1 < *j)) ++j;
         std::iter_swap(itr1,j);
         ++itr1;
         ++j;
         itr2 = k;
         std::rotate(itr1,j,last);
         while (last != j)
         {
            ++j;
            ++itr2;
         }
         std::rotate(k,itr2,last);
         return true;
      }
   }
   std::rotate(first,k,last);
   return false;
}

#endif /* HELPER_FUNCTIONS_H */

