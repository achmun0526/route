import json

class ListsInstance:

    @staticmethod
    def get_by_name(name): 

        response = None           
        list = []
        
        if name == "service_order_state":
            from models import ServiceOrderState                
            for e in ServiceOrderState:
                list.append({"id": int(e), "name": str(e)})
            response = json.loads(json.dumps(list))  

        elif name == "purpose_of_service":
            from models import PurposeOfService            
            for e in PurposeOfService:
                list.append({"id": int(e), "name": str(e)})
            response = json.loads(json.dumps(list))      

        elif name == "asset_type":
            from models import AssetType            
            for e in AssetType:
                list.append({"id": int(e), "name": str(e)})
            response = json.loads(json.dumps(list))

        elif name == "route_status":
            from models import RouteStatus
            for e in RouteStatus:
                list.append({"id": int(e), "name": str(e)})
            response = json.loads(json.dumps(list))

        elif name == "route_incident_status":
            from models import RouteIncidentStatus
            for e in RouteIncidentStatus:
                list.append({"id": int(e), "name": str(e)})
            response = json.loads(json.dumps(list))
        
        elif name == "service_order_problem_state":
            list.append({"id": 1, "name": "Active"})
            list.append({"id": 2, "name": "Resolved"})
            list.append({"id": 3, "name": "Not Resolved"})    
            list.append({"id": 4, "name": "Failed"})    
            response = json.loads(json.dumps(list))     

        elif name == "route_incident_types":
            list.append({"id": 1, "name": "Police Incident"})
            list.append({"id": 2, "name": "Mechanical Failure"})
            list.append({"id": 3, "name": "Fuel Empty"})
            list.append({"id": 4, "name": "Minor Accident"})
            list.append({"id": 5, "name": "Major Accident"})
            list.append({"id": 6, "name": "Illness Injury"})         
                
            response = json.loads(json.dumps(list))

        elif name == "asset_size":
            list.append({"id": 1, "name": "10 Yard"})
            list.append({"id": 2, "name": "11 Yard"})
            list.append({"id": 3, "name": "12 Yard"})
            list.append({"id": 4, "name": "15 Yard"})
            list.append({"id": 5, "name": "18 Yard"})
            list.append({"id": 6, "name": "20 Yard"})
            list.append({"id": 7, "name": "30 Yard"})
            list.append({"id": 8, "name": "40 Yard"})
            list.append({"id": 9, "name": "50 Yard"})              
                
            response = json.loads(json.dumps(list))

        elif name == "service_order_failure_reason": 
            list.append({"id": 1, "name": "Bad Info From Customer"})
            list.append({"id": 2, "name": "Blocked Container"})
            list.append({"id": 3, "name": "Container Overweight"})
            list.append({"id": 4, "name": "Container Overloaded"})
            list.append({"id": 5, "name": "Site Contact Unavailable"})
            list.append({"id": 6, "name": "Bad Conditions"})
            list.append({"id": 7, "name": "Mechanical Failure"})                   
                
            response = json.loads(json.dumps(list))
        
        else:
            raise ValueError("List was not found")

        return response