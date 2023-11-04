/**********************************************************************
 * NAME: Carolyn Bozin
 * CLASS: CPSC_321_01
 * DATE: 11/21/22
 * HOMEWORK: Project Part 4
 * DESCRIPTION: Create Table statements for my Library Management System
 **********************************************************************/

 -- drop tables
 DROP TABLE IF EXISTS Request;
 DROP TABLE IF EXISTS Inventory;
 DROP TABLE IF EXISTS Employee;
 DROP TABLE IF EXISTS Fine;
 DROP TABLE IF EXISTS Item;
 DROP TABLE IF EXISTS Account;
 DROP TABLE IF EXISTS Branch;
 DROP TABLE IF EXISTS Patron;
 DROP TABLE IF EXISTS CheckOut;
 
 

-- patron table
--add date signed up
 CREATE TABLE Patron (
    patron_id INT AUTO_INCREMENT,
    first_name TINYTEXT NOT NULL,
    last_name TINYTEXT NOT NULL,
    email TINYTEXT NOT NULL,
    date_signed_up DATE NOT NULL,
    phone_number CHAR(20),
    notes CHAR(255),
    PRIMARY KEY(patron_id)
 );

--branch table
 CREATE TABLE Branch (
    branch_id INT AUTO_INCREMENT,
    branch_name CHAR(255),
    district TINYTEXT,
    address CHAR(255) NOT NULL,
    start_hr TIME NOT NULL,
    end_hr TIME NOT NULL,
    PRIMARY KEY(branch_id),
    CONSTRAINT CHECK (start_hr < end_hr)
 );

--employee table
 CREATE TABLE Employee (
    emp_id INT AUTO_INCREMENT,
    first_name TINYTEXT NOT NULL,
    last_name TINYTEXT NOT NULL,
    email TINYTEXT NOT NULL,
    phone_number CHAR(20),
    branch_id INT NOT NULL,
    user_name CHAR(255) NOT NULL,
    password CHAR(255) NOT NULL,
    PRIMARY KEY(emp_id),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
 );
 
--item table
--maybe genre should be item type? with optional genre
 CREATE TABLE Item (
    item_id INT AUTO_INCREMENT,
    name TINYTEXT NOT NULL,
    description CHAR(255) NOT NULL,
    author_name TINYTEXT NOT NULL,
    item_type TINYTEXT NOT NULL,
    genre TINYTEXT,
    PRIMARY KEY(item_id)
 );

--fine table
--weak entity
 CREATE TABLE Fine(
    fine_number INT AUTO_INCREMENT,
    fine_type TINYTEXT NOT NULL,
    amount FLOAT(5,2) NOT NULL,
    date_charged DATE NOT NULL,
    date_paid DATE,
    patron_id INT NOT NULL,
    PRIMARY KEY(fine_number),
    FOREIGN KEY (patron_id) REFERENCES Patron(patron_id) ON DELETE CASCADE
 );

--inventory table
 CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT,
    branch_id INT NOT NULL,
    item_id INT NOT NULL,
    item_condition CHAR(255),
    date_acquired DATE NOT NULL,
    max_loan_period INT NOT NULL,
    is_available BOOLEAN NOT NULL,
    PRIMARY KEY(inventory_id),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id),
    FOREIGN KEY (item_id) REFERENCES Item(item_id),
    CONSTRAINT CHECK (item_condition = "used" OR item_condition = "new" OR item_condition = "damaged")
 );

--checkout table
--add return date, also maybe have "inventory id" rather than user id
 CREATE TABLE CheckOut (
    check_out_id INT AUTO_INCREMENT,
    inventory_id INT,
    patron_id INT,
    check_out_date DATE NOT NULL,
    return_date DATE,
    num_renewals INT NOT NULL,
    PRIMARY KEY(check_out_id),
    UNIQUE(inventory_id, patron_id),
    CONSTRAINT CHECK(return_date > check_out_date OR return_date = check_out_date)
 );

--request table
--maybe boolean value saying if/when item was recieved
 CREATE TABLE Request (
    request_id INT AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    patron_id INT NOT NULL,
    request_date DATE NOT NULL,
    PRIMARY KEY(request_id),
    UNIQUE(inventory_id, patron_id, request_date)
 );

 