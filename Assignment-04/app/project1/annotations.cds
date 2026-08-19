using ProcurementService from '../../srv/service';

annotate ProcurementService.PurchaseRequisition with @(
    UI.HeaderInfo: {
        TypeName: 'Purchase Requisition',
        TypeNamePlural: 'Purchase Requisitions',
        Title: {
            $Type: 'UI.DataField',
            Value: PRNumber
        },
        Description: {
            $Type: 'UI.DataField',
            Value: MaterialDescription
        }
    },

    UI.Identification: [
        {
            $Type: 'UI.DataField',
            Label: 'PR Number',
            Value: PRNumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'Department',
            Value: Department
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status',
            Value: Status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Priority',
            Value: Priority
        }
    ],

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'PR Number',
            Value: PRNumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'Department',
            Value: Department
        },
        {
            $Type: 'UI.DataField',
            Label: 'Created Date',
            Value: CreatedDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'SLA',
            Value: SLAInDays
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status',
            Value: Status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Priority',
            Value: Priority
        }
    ]
);


annotate ProcurementService.PurchaseOrder with @(
    UI.HeaderInfo: {
        TypeName: 'Purchase Order',
        TypeNamePlural: 'Purchase Orders',
        Title: {
            $Type: 'UI.DataField',
            Value: PONumber
        }
    },

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'PO Number',
            Value: PONumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'PR Number',
            Value: PRNumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'Vendor',
            Value: Vendor
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total Amount',
            Value: TotalAmount
        },
        {
            $Type: 'UI.DataField',
            Label: 'Created Date',
            Value: CreatedDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status',
            Value: Status
        }
    ]
);