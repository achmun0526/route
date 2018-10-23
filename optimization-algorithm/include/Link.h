#include "Service.h"
#include "Landfill.h"
#include "Depot.h"
#include "Route_Finder.h"
#include "GM_Handler.h"
#include <vector>
#include <string>
using std::endl; using std::cout; using std::vector; using std::string;

class order_results {
  public:
    order_results(){}
    string results;

};

class service_order{
public:
  service_order(){}
  double latitude;
  double longitude;
  string customer_key;
  string quantity_value;
  string order_id;
  int size;
  string type;
};

class landfill{
public:
  landfill(){}
  double latitude;
  double longitude;
};

class depot{
public:
  depot(){}
  double latitude;
  double longitude;
};

// Function prototypes
string link(vector<service_order>, vector<landfill>, vector<depot>, int, int);
