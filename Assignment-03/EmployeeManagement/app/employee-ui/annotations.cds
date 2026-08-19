using EmployeeService as service from '../../srv/service';

annotate service.Employees with @(

    UI.HeaderInfo : {

        TypeName       : 'Employee',

        TypeNamePlural : 'Employees',

        Title : {
            $Type : 'UI.DataField',
            Value : employeeName
        },

        Description : {
            $Type : 'UI.DataField',
            Value : designation
        }

    },

/*************************************************************
 List Report
*************************************************************/

    UI.LineItem : [

        {
            $Type                   : 'UI.DataField',
            Value                   : employeeCode,
            Label                   : 'Employee Code',
            ![@UI.Importance]       : #High,
            ![@HTML5.CssDefaults]   : { width : '12rem' }
        },

        {
            $Type                   : 'UI.DataField',
            Value                   : employeeName,
            Label                   : 'Employee Name',
            ![@UI.Importance]       : #High,
            ![@HTML5.CssDefaults]   : { width : '16rem' }
        },

        {
            $Type              : 'UI.DataField',
            Value              : designation,
            Label              : 'Designation',
            ![@UI.Importance]  : #High
        },

        {
            $Type              : 'UI.DataField',
            Value              : department.departmentName,
            Label              : 'Department',
            ![@UI.Importance]  : #High
        },

        {
            $Type : 'UI.DataField',
            Value : managerName,
            Label : 'Manager'
        },

        {
            $Type : 'UI.DataField',
            Value : employmentType,
            Label : 'Employment Type'
        },

        {
            $Type : 'UI.DataField',
            Value : salary,
            Label : 'Salary'
        },

        {
            $Type : 'UI.DataField',
            Value : rating,
            Label : 'Rating'
        },

        {
            $Type : 'UI.DataField',
            Value : status,
            Label : 'Status'
        }

    ],

/*************************************************************
 Filter Bar
*************************************************************/

    UI.SelectionFields : [

        employeeCode,
        employeeName,
        department_ID,
        designation,
        managerName,
        employmentType,
        status,
        joiningDate

    ],

/*************************************************************
 Object Page Identification
*************************************************************/

    UI.Identification : [

        {
            $Type : 'UI.DataField',
            Value : employeeCode,
            Label : 'Employee Code'
        },

        {
            $Type : 'UI.DataField',
            Value : employeeName,
            Label : 'Employee Name'
        },

        {
            $Type : 'UI.DataField',
            Value : designation,
            Label : 'Designation'
        },

        {
            $Type : 'UI.DataField',
            Value : department.departmentName,
            Label : 'Department'
        },

        {
            $Type : 'UI.DataField',
            Value : managerName,
            Label : 'Reporting Manager'
        }

    ],

/*************************************************************
 Field Groups
*************************************************************/

    UI.FieldGroup #General : {

        $Type : 'UI.FieldGroupType',

        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Employee Code',
                Value : employeeCode
            },

            {
                $Type : 'UI.DataField',
                Label : 'Employee Name',
                Value : employeeName
            },

            {
                $Type : 'UI.DataField',
                Label : 'Designation',
                Value : designation
            },

            {
                $Type : 'UI.DataField',
                Label : 'Department',
                Value : department.departmentName
            },

            {
                $Type : 'UI.DataField',
                Label : 'Manager',
                Value : managerName
            }

        ]

    },

    UI.FieldGroup #Contact : {

        $Type : 'UI.FieldGroupType',

        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Email',
                Value : email
            },

            {
                $Type : 'UI.DataField',
                Label : 'Phone',
                Value : phone
            },

            {
                $Type : 'UI.DataField',
                Label : 'Address',
                Value : address
            },

            {
                $Type : 'UI.DataField',
                Label : 'City',
                Value : city
            },

            {
                $Type : 'UI.DataField',
                Label : 'State',
                Value : state
            },

            {
                $Type : 'UI.DataField',
                Label : 'Country',
                Value : country
            }

        ]

    },

    UI.FieldGroup #Employment : {

        $Type : 'UI.FieldGroupType',

        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Joining Date',
                Value : joiningDate
            },

            {
                $Type : 'UI.DataField',
                Label : 'Experience',
                Value : experience
            },

            {
                $Type : 'UI.DataField',
                Label : 'Employment Type',
                Value : employmentType
            },

            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status
            }

        ]

    },

    UI.FieldGroup #Salary : {

        $Type : 'UI.FieldGroupType',

        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Salary',
                Value : salary
            },

            {
                $Type : 'UI.DataField',
                Label : 'Bonus',
                Value : bonus
            },

            {
                $Type : 'UI.DataField',
                Label : 'Currency',
                Value : currency
            }

        ]

    },

/*********************************************************************
 Performance Field Group
*********************************************************************/

    UI.FieldGroup #Performance : {

        $Type : 'UI.FieldGroupType',

        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Rating',
                Value : rating
            },

            {
                $Type : 'UI.DataField',
                Label : 'Performance',
                Value : performance
            },

            {
                $Type : 'UI.DataField',
                Label : 'Biography',
                Value : biography
            },

            {
                $Type : 'UI.DataField',
                Label : 'Skills',
                Value : skills
            },

            {
                $Type : 'UI.DataField',
                Label : 'Remarks',
                Value : remarks
            }

        ]

    },

/*********************************************************************
 Object Page Facets
*********************************************************************/

    UI.Facets : [

        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'GeneralInfoSection',
            Label  : 'General Information',

            Facets : [

                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'GeneralFacet',
                    Label  : 'General',
                    Target : '@UI.FieldGroup#General'
                },

                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'ContactFacet',
                    Label  : 'Contact',
                    Target : '@UI.FieldGroup#Contact'
                }

            ]

        },

        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'EmploymentSection',
            Label  : 'Employment',

            Facets : [

                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'EmploymentFacet',
                    Label  : 'Employment Details',
                    Target : '@UI.FieldGroup#Employment'
                },

                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'SalaryFacet',
                    Label  : 'Salary Details',
                    Target : '@UI.FieldGroup#Salary'
                }

            ]

        },

        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'PerformanceSection',
            Label  : 'Performance',

            Facets : [

                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'PerformanceFacet',
                    Label  : 'Performance Details',
                    Target : '@UI.FieldGroup#Performance'
                }

            ]

        }

    ]

);


/*********************************************************************
 Employee Field Labels
*********************************************************************/

annotate service.Employees with {

    employeeCode   @Common.Label : 'Employee Code';
    employeeName   @Common.Label : 'Employee Name';
    designation    @Common.Label : 'Designation';
    email          @Common.Label : 'Email';
    phone          @Common.Label : 'Phone';
    address        @Common.Label : 'Address';
    city           @Common.Label : 'City';
    state          @Common.Label : 'State';
    country        @Common.Label : 'Country';
    managerName    @Common.Label : 'Reporting Manager';
    employmentType @Common.Label : 'Employment Type';
    joiningDate    @Common.Label : 'Joining Date';
    salary         @Common.Label : 'Salary';
    bonus          @Common.Label : 'Bonus';
    rating         @Common.Label : 'Rating';
    performance    @Common.Label : 'Performance';
    biography      @Common.Label : 'Biography';
    skills         @Common.Label : 'Skills';
    remarks        @Common.Label : 'Remarks';

};


/*********************************************************************
 Currency Measures
*********************************************************************/

annotate service.Employees with {

    salary @Measures.ISOCurrency : currency;

    bonus  @Measures.ISOCurrency : currency;

};


/*********************************************************************
 Semantic Key
*********************************************************************/

annotate service.Employees with @Common.SemanticKey : [ employeeCode ];


/*********************************************************************
 Multi-line Text Fields
*********************************************************************/

annotate service.Employees with {

    biography @UI.MultiLineText;
    skills    @UI.MultiLineText;
    remarks   @UI.MultiLineText;

};


/*********************************************************************
 Hidden Fields
*********************************************************************/

annotate service.Employees with {

    remarks @UI.Hidden;

};


/*********************************************************************
 Department Value Help
*********************************************************************/

annotate service.Employees with {

    department @Common.ValueList : {

        $Type          : 'Common.ValueListType',
        CollectionPath : 'Departments',

        Parameters : [

            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : department_ID,
                ValueListProperty : 'ID'
            },

            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'departmentName'
            },

            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'location'
            }

        ]

    };

};


/*********************************************************************
 Departments Annotations
*********************************************************************/

annotate service.Departments with @(

    UI.HeaderInfo : {

        TypeName       : 'Department',
        TypeNamePlural : 'Departments',

        Title : {
            $Type : 'UI.DataField',
            Value : departmentName
        },

        Description : {
            $Type : 'UI.DataField',
            Value : location
        }

    },

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Value : departmentName,
            Label : 'Department'
        },

        {
            $Type : 'UI.DataField',
            Value : location,
            Label : 'Location'
        }

    ],

    UI.Identification : [

        {
            $Type : 'UI.DataField',
            Value : departmentName,
            Label : 'Department Name'
        },

        {
            $Type : 'UI.DataField',
            Value : location,
            Label : 'Location'
        }

    ]

);


annotate service.Departments with {

    departmentName @Common.Label : 'Department Name';

    location       @Common.Label : 'Location';

};

