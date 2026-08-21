using PRTrackerService as service from '../../srv/service';
annotate service.PurchaseRequisitions with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'createdBy',
                Value : createdBy,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PRNumber',
                Value : PRNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PRItem',
                Value : PRItem,
            },
            {
                $Type : 'UI.DataField',
                Label : 'material',
                Value : material,
            },
            {
                $Type : 'UI.DataField',
                Label : 'description',
                Value : description,
            },
            {
                $Type : 'UI.DataField',
                Label : 'quantity',
                Value : quantity,
            },
            {
                $Type : 'UI.DataField',
                Label : 'unit',
                Value : unit,
            },
            {
                $Type : 'UI.DataField',
                Label : 'departmentCode',
                Value : departmentCode,
            },
            {
                $Type : 'UI.DataField',
                Label : 'plant',
                Value : plant,
            },
            {
                $Type : 'UI.DataField',
                Label : 'purchasingGroup',
                Value : purchasingGroup,
            },
            {
                $Type : 'UI.DataField',
                Label : 'createdDate',
                Value : createdDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'approvalDate',
                Value : approvalDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'status',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Label : 'approvalStatus',
                Value : approvalStatus,
            },
            {
                $Type : 'UI.DataField',
                Label : 'slaDays',
                Value : slaDays,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PR_Age_Days',
                Value : PR_Age_Days,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Approval_Cycle_Days',
                Value : Approval_Cycle_Days,
            },
            {
                $Type : 'UI.DataField',
                Label : 'SLA_Status',
                Value : SLA_Status,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Risk_Level',
                Value : Risk_Level,
            },
            {
                $Type : 'UI.DataField',
                Label : 'SLA_Breach_Probability',
                Value : SLA_Breach_Probability,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'PRItem',
            Value : PRItem,
        },
        {
            $Type : 'UI.DataField',
            Label : 'PRNumber',
            Value : PRNumber,
        },
        {
            $Type : 'UI.DataField',
            Label : 'createdBy',
            Value : createdBy,
        },
        {
            $Type : 'UI.DataField',
            Label : 'material',
            Value : material,
        },
        {
            $Type : 'UI.DataField',
            Label : 'description',
            Value : description,
        },
    ],
);

