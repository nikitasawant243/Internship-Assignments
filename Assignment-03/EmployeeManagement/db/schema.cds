namespace employee.management;

using {
    cuid,
    managed,
    sap.common.CodeList
} from '@sap/cds/common';

/******************************
 Department
*******************************/

entity Departments : cuid, managed {

    departmentName : String(100) @mandatory;

    location       : String(100) @mandatory;

    employees      : Composition of many Employees
                        on employees.department = $self;
}

/******************************
 Employee
*******************************/

entity Employees : cuid, managed {

    // Basic Information
    employeeName     : String(100) @mandatory @title:'Employee Name';

    designation      : String(80) @mandatory @title:'Designation';

    employeeCode     : String(20) @mandatory @title:'Employee Code';

    gender           : String(10);

    age              : Integer;

    dob              : Date;

    joiningDate      : Date @mandatory;

    experience       : Integer @title:'Experience (Years)';

    // Contact Information
    email            : String(100) @mandatory;

    phone            : String(20);

    address          : String(250);

    city             : String(50);

    state            : String(50);

    country          : String(50);

    // Employment
    department       : Association to Departments @mandatory;

    managerName      : String(100);

    employmentType   : String(20) @mandatory;

    // Salary
    salary           : Decimal(15,2);

    bonus            : Decimal(15,2);

    currency         : String(3) default 'INR';

    // Performance
    rating           : Decimal(3,1);

    performance      : String(20);

    status           : String(20);

    // Additional Information
    biography        : LargeString;

    skills           : LargeString;

    remarks          : LargeString;

    

}