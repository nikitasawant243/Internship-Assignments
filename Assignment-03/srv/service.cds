using { employee.management as db } from '../db/schema';

service EmployeeService {

    @odata.draft.enabled
    entity Employees as projection on db.Employees;

    entity Departments as projection on db.Departments;

}