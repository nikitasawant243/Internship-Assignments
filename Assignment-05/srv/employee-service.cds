using { assignment05 as db } from '../db/schema';

@path: '/employee'
service EmployeeService {

    entity Employees   as projection on db.Employees;
    entity Departments as projection on db.Departments;
    entity Managers    as projection on db.Managers;
    entity UploadErrors as projection on db.UploadErrors;

    action uploadEmployees(
        fileName    : String,
        fileContent : LargeBinary
    ) returns UploadResponse;

}

type UploadResponse {
    success        : Boolean;
    message        : String;
    totalRecords   : Integer;
    successRecords : Integer;
    failedRecords  : Integer;
    errors         : array of ErrorDetail;
}

type ErrorDetail {
    rowNo        : Integer;
    employeeId   : String;
    errorMessage : String;
}
