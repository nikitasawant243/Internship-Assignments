using { employee.management as db } from '../db/schema';

service EmployeeService {

    entity Employees as projection on db.Employees;

    entity Departments as projection on db.Departments;

}