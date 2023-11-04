
var mysql = require('mysql');
var express = require('express');
var path = require('path');
const fs = require('fs');// for reading/writing
//const config = require('./config.json');//configuration file for connecting to DB
var app = express();

app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.listen(3000);// listen at port 3000
app.use(express.static(__dirname));

//create connection to my database
//create connection to my database
var cn = mysql.createConnection({
    host : 'cps-database.gonzaga.edu',
    user : 'cbozin',
    password : 'cbozin75122405',
    database : 'cbozin_DB'
});


//connect to database
cn.connect();

//render landing page using menu.html 
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/menu.html'));
});

//EMPLOYEE LOGIN
app.post('/login.html', function(request, response){

    //get username, password from user text input
    var user = request.body.username;
    var pass = request.body.password;
    var branch = request.body.branch_id

     //find the account associated with user and pass
     var q = 'SELECT emp_id, branch_id, first_name, last_name, email FROM Employee WHERE user_name = ? AND password = ? AND branch_id = ?';
     cn.query(q, [user, pass, branch], function(err, rows, fields) {
 
         if(err){
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Employee not found.</h2></html>')
         };
 
         //html string to output employee profile page
         var str = '<html>\n<body>\n<h1>Employee Profile Page</h1>\n';
         str += '<style>body {background-color: lightblue;}\n td {color: black;position: relative;font-family: verdana;}\n a {background-color: white;\ncolor: black;\n text-align: center;\ndisplay: inline-block;\npadding: 14px 25px;\ntext-decoration: none;}; </style>';
         
         //go through result set and add attributes to string
         for (const r of rows) {
             str += '<li>';
             str += 'Branch: <b>' + r['branch_id'] + '</b></li>\n<li>ID: <b>' + r['emp_id'] + '</b></li>\n<li>First name: <b>' + r['first_name'] + '</b></li>\n<li>Last Name: <b>' + r['last_name'] + '</b></li>\n<li>Email: <b>' + r['email'] + '</b></l>';
             str += '<p><a href="/check_out.html">Check Out </a> ';
             str += '<a href="/patron_profile.html"> View Patron Profile </a> ';
             str += '<a href="/search_catalog.html">Search Catalog </a> ';
             str += '<a href="/search_patrons.html">Search Patrons </a> ';
             str += '<a href="/add_patrons.html">Add Patrons </a> ';
             str += '<a href="/add_item.html">Add Item </a> ';
             str += '<a href="/remove_patron.html">Remove Patron </a> ';
             str += '<a href="/analytics.html">Analytics </a></p>';
        }   
         str += '</body>\n</html>\n';

         //render page
         response.send(str);
     });
});

//SEARCH RESULTS ITEMS
app.post('/search_results_items.html', function(request, response){
    //get
    var phrase = request.body.phrase;
    var facet = request.body.facet;
    var branch_id = request.body.branch_id

    var q = "SELECT * FROM Item JOIN Inventory USING(item_id) WHERE branch_id = ? AND " + facet + " = ?";
    
    cn.query(q, [branch_id, phrase], function(err, rows, fields){
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Item not found.</h2></html>')
        };

        //html string to output employee profile page
        var str = '<html>\n<body>\n<h1>Item Info</h1>\n';
        str += '<style>body {background-color: lightblue;}</style>';
            str += '<p><i>Item:</i></>\n';
            //go through result set and add attributes to string
            for (const r of rows) {
  
                str += '<li>ID:' + r['inventory_id'] + '</li><li>Name: <b>' + r['name'] + '</b></li>\n<li>Author: <b>' + r['author_name'] + '</b></li>\n<li>Genre: <b>' + r['genre'] + '</b></li>\n<li>Description: <b>' + r['description'];
                str += '</b></li>\n';
                str += '</body>\n</html>\n';
            }
       
        //render page
        response.send(str);
    });

});



//SEARCH RESULTS PATRONS
app.post('/search_results_patrons.html', function(request, response){
    //get
    var phrase = request.body.phrase;
    var facet = request.body.facet;

    if(facet == 'patron_id'){
        phrase = parseInt(phrase)
    }

    var q = "SELECT * FROM Patron WHERE " + facet + " = ?";
   
    cn.query(q, [phrase], function(err, rows, fields){
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Patrons not found.</h2></html>')
        };

        //html string to output search results
        var str = '<html>\n<body>\n<h1>Patron Info</h1>\n';
        str += '<style>body {background-color: lightblue;}</style>';
        str +=  '<form action="/patron_profile.html" method="GET">';  

            //go through result set and add attributes to string
            for (const r of rows) {
                str += '<li>';
                str += 'ID: <b>' + r['patron_id'] + '</b></li>\n<li>First name: <b>' + r['first_name'] + '</b></li>\n<li>Last Name: <b>' + r['last_name'] + '</b></l>';
                str += '</body>\n</html>\n';
            }
       
        //render page
        response.send(str);
    });

});


//PATRON PROFILE
app.post('/patron_profile_viewed.html', function(request, response){

    var patron_id = request.body.patron_id
    // query to get patrons
    var q = 'SELECT * FROM Patron WHERE patron_id = ?';

    cn.query(q, [patron_id] , function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Patron profile not shown successfully</h2></html>')
        };

         var str = '<html><body>';
         str += '<style>body {background-color: lightblue;}</style>';
        for(const r of rows){
            str += '<h2>Patron Profile</h2>'
            str += '<li>ID: <b>' + r['patron_id'] + '</b></li>\n<li>First name: <b>' + r['first_name'] + '</b></li>\n<li>Last Name: <b>' + r['last_name'] + '</b></li><li>Notes: ' + r['notes'] + '</b></li>';
        }

        str += '<h3>Items Checked Out</h3>'
        // query to get items checked out by patron
        var q = 'SELECT * FROM Patron JOIN CheckOut USING(patron_id) JOIN Inventory USING(inventory_id) JOIN Item USING(item_id) WHERE patron_id = ?';

            cn.query(q, [patron_id] , function(err, rows, fields){
                
                if(err) {
                    console.log(err)
                    response.send('<html><style>body {background-color: lightblue;}</style><h2>Patron profile not shown successfully</h2></html>')
                };
        
                    for(const r of rows){
                        str += '<li>Item ID: <b>' + r['inventory_id'] + '</b></li><li>Item Name: <b>' + r['name'] + '</b></li><li>Author Name: <b>' + r['author_name']; 
                    }
                    str += '</b></li></body>\n</html>\n';
                response.send(str);
        });
    });

   

        
 });


//INSERT PATRON
app.post('/patron_added.html', function(request, response){
    //get
    var f_name = request.body.first_name;
    var l_name = request.body.last_name;
    var email = request.body.email;
    var date = request.body.date_signed_up;

    var q = "INSERT INTO Patron (first_name, last_name, email, date_signed_up) VALUES (?, ?, ?, ?)";
    
    cn.query(q, [f_name, l_name, email, date], function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Patron not added successfully</h2></html>')
        };

        //html string 
        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}';
        str += '</style><h2>Patron Added</h2><body></html>';
    
        //render page
        response.send(str);
    });
});


//CHECK OUT ITEM TO PATRON
app.post('/check_out_done.html', function(request, response){
    //get 
    var date = request.body.check_out_date
    var patron_id = request.body.patron_id
    var inventory_id = request.body.inventory_id

    var q = "INSERT INTO CheckOut (check_out_date, patron_id, inventory_id, num_renewals) VALUES (?,?,?,0)";
    
    cn.query(q, [date, patron_id, inventory_id], function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Item not checked outsuccessfully</h2></html>')
        };

        //html string
        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        str += '<h2>Item checked out</h2></body></html>';
    
        //render page
        response.send(str);
 });

});


//RETURN ITEM
app.post('/return_done.html', function(request, response){

    var q = "UPDATE Checkout SET return_date = ? WHERE checkout_id = ?"

});


//INSERT ITEM INTO INVENTORY
app.post('/item_added.html', function(request, response){
    //get 
    var branch = request.body.branch_id;
    var item = request.body.item_id;
    var date_acquired = request.body.date_acquired;
    var max_loan_period = request.body.max_loan_period;
   
    var q = "INSERT INTO Inventory (branch_id, item_id, date_acquired, max_loan_period, is_available) VALUES (?, ?, ?, ?, true)";
    
    cn.query(q, [branch, item, date_acquired, max_loan_period], function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Item not added successfully</h2></html>')
        };

        //html string
        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        str += '<h2>Item added to inventory</h2></body></html>';
    
        //render page
        response.send(str);
    });
});

//REMOVE PATRON
app.post('/patron_removed.html', function(request, response){

    var patron_id = request.body.patron_id
    
    var q = "DELETE FROM Patron WHERE patron_id = ?";
    
    cn.query(q, [patron_id], function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Patron not removed successfully.</h2></html>')
        };

        //html string
        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        str += '<h2>Patron with ID#' + patron_id + ' removed.</h2></body></html>';
    
        //render page
        response.send(str);
    });

});


//UPDATE PATRON INFO
app.post('/patron_updated.html', function(request, response){

    var facet = request.body.facet
    var feature = request.body.feature
    var patron_id = request.body.patron_id

    var q = "UPDATE Patron SET " + facet + " ? WHERE patron_id = ?";
    
    cn.query(q, [feature, patron_id], function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Patron not updated successfully.</h2></html>')
        };

        //html string
        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        str += '<h2>Patron updated.</h2></body></html>';
    
        //render page
        response.send(str);
    });
});


//PATRON LIST
app.get('/see_all_patrons.html', function(request, response){


    var q = "SELECT patron_id, first_name, last_name, email FROM Patron";
    
    cn.query(q, function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>query unsuccessful.</h2></html>')
        };

        //html string
        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        for(const r of rows){
            
            str += '<p><li>ID: <b>' + r['patron_id'] + '</b></li><li>First name: <b>' + r['first_name'] + '</b></li><li>Last Name: <b>' + r['last_name'] + '</b></li><li>Email: <b>' + r['email'] + '</b></li></p>';
            

        }
         str += '</body></html>';
        //render page
        response.send(str);
    });

});

//PATRON FINE LIST
app.get('/see_lost_and_missing_fines.html', function(request, response){

    var q = "(SELECT * ";
    q += "FROM Patron p JOIN Fine f USING(patron_id) ";
    q += "WHERE f.fine_type = 'missing') ";
    q += "UNION";
    q += "(SELECT * ";
    q += "FROM Patron p JOIN Fine f USING(patron_id) ";
    q += "WHERE f.fine_type = 'overdue')";
    
    cn.query(q, function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Query unsuccessful.</h2></html>')
        };

        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        for(const r of rows){

            str += '<p><li>Patron ID: <b>' + r['patron_id'] + '</b></li><li>Fine ID: <b>' +  r['fine_number'] + '</b></li><li>Fine type: <b>' + r['fine_type'] + '</b></li></p>';
           
        }
         str += '</body></html>';
         //render page
         response.send(str);
    });

});


    
//FIND ITEMS THAT HAVE BEEN CHECKED OUT THE MOST
app.get('/popular_items.html', function(request, response){

    var q = "SELECT i.item_id, i.name, i.item_type, COUNT(*) AS count "
    q += "FROM Item i JOIN Inventory USING(item_id) "
    q += "JOIN CheckOut c USING(inventory_id) "
    q += "GROUP BY i.item_id "
    q += "HAVING COUNT(*) >= ALL (SELECT COUNT(*) FROM Item JOIN Inventory USING(item_id) JOIN CheckOut USING(inventory_id) GROUP BY item_id) "
    q += "ORDER BY COUNT(*) DESC"
    
    cn.query(q, function(err, rows, fields){
        
        if(err) {
            console.log(err)
            response.send('<html><style>body {background-color: lightblue;}</style><h2>Query unsuccessful.</h2></html>')
        };

        var str = '<html><body>';
        str += '<style>body {background-color: lightblue;}</style>';
        str += '<h1> Most Popular Books </h1>';
        for(const r of rows){

            str += '<li>ID: <b>' + r['item_id'] + '</b></li><li>Name: <b>' +  r['name'] + '</b></li><li>Num checkouts: <b>' + r['count'] + '</b></li><li>Item type: <b>' + r['item_type'] + '</b></li>';
           
        }
         str += '</body></html>';
         //render page
         response.send(str);
    });

});
