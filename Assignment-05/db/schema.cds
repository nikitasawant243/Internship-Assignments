namespace assignment05;

entity Employees {

    key employeeId  : String(20);

    employeeName    : String(100);

    email           : String(100);

    department      : String(50);

    managerId       : String(20);

    joiningDate     : Date;

    salary          : Decimal(15,2);

    location        : String(100);

}

entity Departments {

    key deptCode    : String(50);

    deptName        : String(100);

}

entity Managers {

    key managerId   : String(20);

    managerName     : String(100);

}

entity UploadErrors {

    key ID              : UUID;

    uploadSessionId     : UUID;

    rowNo               : Integer;

    employeeId          : String(20);

    errorMessage        : String(500);

    createdAt           : Timestamp;

}