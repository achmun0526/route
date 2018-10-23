export var MENU_OPTIONS=[
  {id:1,label:'Settings',url:'',icon:'settings',parent_id:0,dropdown:[],open:false},
  {id:2,label:'Management',url:'',icon:'person_pin',parent_id:0,dropdown:[],open:false},
  {id:3,label:'Reports',url:'',icon:'description',parent_id:0,dropdown:[],open:false},

  {id:101,label:'Users',url:'/settings/users',icon:'',parent_id:1,dropdown:[]},
  {id:102,label:'Companies',url:'/settings/companies',icon:'',parent_id:1,dropdown:[]},
  {id:103,label:'My Company',url:'/settings/companies/current',icon:'',parent_id:1,dropdown:[]},
  {id:104,label:'Drivers',url:'/settings/drivers',icon:'',parent_id:1,dropdown:[]},
  {id:105,label:'Facilities',url:'/settings/disposals',icon:'',parent_id:1,dropdown:[]},
  {id:106,label:'Yards',url:'/settings/yards',icon:'',parent_id:1,dropdown:[]},
  {id:201,label:'Customers',url:'/management/customers',icon:'',parent_id:2,dropdown:[]},
  {id:202,label:'Sites',url:'/management/sites',icon:'',parent_id:2,dropdown:[]},
  {id:203,label:'Orders',url:'/management/orders',icon:'',parent_id:2,dropdown:[]},
  {id:107,label:'Routes',url:'/management/routes',icon:'',parent_id:2,dropdown:[]},
  // {id:208,label:'Messages',url:'/management/messages',icon:'',parent_id:2,dropdown:[]},
  // {id:301,label:'Asset Inventory',url:'/reports/assets',icon:'',parent_id:3,dropdown:[]},
  {id:302,label:'Incidents',url:'/reports/incidents',icon:'',parent_id:3,dropdown:[]},
  // {id:303,label:'Problems',url:'/reports/problems',icon:'',parent_id:3,dropdown:[]},
  {id:304,label:'Compute',url:'/compute',icon:'',parent_id:3,dropdown:[]}
];
