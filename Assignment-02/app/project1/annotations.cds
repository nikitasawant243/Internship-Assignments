using CostCenterService as service from '../../srv/service';

// ════════════════════════════════════════════════════════════════════════════
//  COST CENTER MANAGEMENT
//  Enterprise-grade SAP Fiori Elements Annotations
//  List Report  +  Object Page  +  Header → Child-table drill-down
//  ~65 annotations covering UI, Common, and Capabilities vocabularies
// ════════════════════════════════════════════════════════════════════════════


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION A  ·  CostCenters – Field-level Common annotations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// [A-1]  Common.Label — human-readable column / form labels
// [A-2]  Common.TextArrangement — show code + description together
// ─────────────────────────────────────────────────────────────────────────
annotate service.CostCenters with {

    // [A-1] Labels
    KOKRS @(Common.Label: 'Controlling Area');
    KOSTL @(Common.Label: 'Cost Center');
    DATBI @(Common.Label: 'Valid To');
    DATAB @(Common.Label: 'Valid From');
    BUKRS @(Common.Label: 'Company Code');
    GSBER @(Common.Label: 'Business Area');
    KHINR @(Common.Label: 'Cost Center Hierarchy');
    PRCTR @(Common.Label: 'Profit Center');
    WAERS @(Common.Label: 'Currency');
    VERAK @(Common.Label: 'Person Responsible');

    // [A-2] Text arrangement – show "IT Department (CC001)" style
    KOSTL @(
        Common.Text           : texts.KTEXT,
        Common.TextArrangement: #TextFirst
    );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION B  ·  CostCenterTexts – Field-level Common annotations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
annotate service.CostCenterTexts with {

    KOKRS  @(Common.Label: 'Controlling Area');
    KOSTL  @(Common.Label: 'Cost Center');
    SPRAS  @(Common.Label: 'Language');
    DATAB  @(Common.Label: 'Valid From');
    DATBI  @(Common.Label: 'Valid To');
    KTEXT  @(Common.Label: 'Short Text');
    LTEXT  @(Common.Label: 'Long Text');
    MCTXT  @(Common.Label: 'Search Term');
    LOGSYS @(Common.Label: 'Logical System');
    MANDT  @(Common.Label: 'Client');
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION C  ·  CostCenters – List Report
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
annotate service.CostCenters with @(

    // ── [C-1] HeaderInfo ─────────────────────────────────────────────────
    // Drives the Object Page title bar and the browser tab title.
    UI.HeaderInfo: {
        TypeName         : 'Cost Center',
        TypeNamePlural   : 'Cost Centers',
        TypeImageUrl     : 'sap-icon://cost-center',
        Title            : {
            $Type: 'UI.DataField',
            Value: KOSTL
        },
        Description      : {
            $Type: 'UI.DataField',
            Value: KOKRS
        }
    },

    // ── [C-2] SelectionFields – Filter Bar fields ─────────────────────────
    // These render as individual filter chips in the List Report filter bar.
    UI.SelectionFields: [
        KOKRS,
        KOSTL,
        BUKRS,
        GSBER,
        PRCTR,
        WAERS,
        DATAB,
        DATBI,
        VERAK
    ],

    // ── [C-3] PresentationVariant – default sort + grouping ──────────────
    // Defines how records are sorted and presented by default.
    UI.PresentationVariant: {
        $Type         : 'UI.PresentationVariantType',
        Text          : 'Default',
        SortOrder     : [{
            $Type     : 'Common.SortOrderType',
            Property  : KOKRS,
            Descending: false
        },{
            $Type     : 'Common.SortOrderType',
            Property  : KOSTL,
            Descending: false
        }],
        Visualizations: ['@UI.LineItem']
    },

    // ── [C-4] SelectionPresentationVariant – ties filter + presentation ───
    UI.SelectionPresentationVariant: {
        $Type               : 'UI.SelectionPresentationVariantType',
        Text                : 'Default',
        SelectionVariant    : {
            $Type           : 'UI.SelectionVariantType',
            Text            : 'Default',
            SelectOptions   : []
        },
        PresentationVariant : {
            $Type         : 'UI.PresentationVariantType',
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : KOKRS,
                Descending: false
            }],
            Visualizations: ['@UI.LineItem']
        }
    },

    // ── [C-5] LineItem – List Report table columns ────────────────────────
    // ![@UI.Importance] controls which columns survive responsive hide/show.
    // High   = always visible
    // Medium = visible at medium/large screen
    // Low    = hidden at small screen
    UI.LineItem: [
        {
            $Type             : 'UI.DataField',
            Value             : KOSTL,
            Label             : 'Cost Center',
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : KOKRS,
            Label             : 'Controlling Area',
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : BUKRS,
            Label             : 'Company Code',
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : GSBER,
            Label             : 'Business Area',
            ![@UI.Importance] : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : PRCTR,
            Label             : 'Profit Center',
            ![@UI.Importance] : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : WAERS,
            Label             : 'Currency',
            ![@UI.Importance] : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : DATAB,
            Label             : 'Valid From',
            ![@UI.Importance] : #Low
        },
        {
            $Type             : 'UI.DataField',
            Value             : DATBI,
            Label             : 'Valid To',
            ![@UI.Importance] : #Low
        },
        {
            $Type             : 'UI.DataField',
            Value             : VERAK,
            Label             : 'Person Responsible',
            ![@UI.Importance] : #Medium
        }
    ],

    // ── [C-6] Identification – used in OP quick-info and compact header ───
    UI.Identification: [
        {
            $Type: 'UI.DataField',
            Value: KOSTL,
            Label: 'Cost Center'
        },
        {
            $Type: 'UI.DataField',
            Value: KOKRS,
            Label: 'Controlling Area'
        },
        {
            $Type: 'UI.DataField',
            Value: VERAK,
            Label: 'Person Responsible'
        }
    ]
);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION D  ·  CostCenters – Object Page Header
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
annotate service.CostCenters with @(

    // ── [D-1] DataPoints – KPI tiles rendered in the Object Page header ───
    // Criticality drives the semantic colour band:
    //   1 = Negative (red)  2 = Critical (orange)  3 = Positive (green)
    UI.DataPoint #CostCenter: {
        $Type      : 'UI.DataPointType',
        Value      : KOSTL,
        Title      : 'Cost Center',
        Description: 'Unique Identifier'
    },

    UI.DataPoint #ControllingArea: {
        $Type: 'UI.DataPointType',
        Value: KOKRS,
        Title: 'Controlling Area'
    },

    UI.DataPoint #CompanyCode: {
        $Type: 'UI.DataPointType',
        Value: BUKRS,
        Title: 'Company Code'
    },

    UI.DataPoint #ValidFrom: {
        $Type      : 'UI.DataPointType',
        Value      : DATAB,
        Title      : 'Valid From',
        Criticality: #Positive
    },

    UI.DataPoint #Currency: {
        $Type: 'UI.DataPointType',
        Value: WAERS,
        Title: 'Currency'
    },

    // ── [D-2] HeaderFacets – DataPoint tiles + Identification strip ───────
    UI.HeaderFacets: [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'CostCenterDP',
            Target: '@UI.DataPoint#CostCenter',
            Label : 'Cost Center'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ControllingAreaDP',
            Target: '@UI.DataPoint#ControllingArea',
            Label : 'Controlling Area'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'CompanyCodeDP',
            Target: '@UI.DataPoint#CompanyCode',
            Label : 'Company Code'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ValidFromDP',
            Target: '@UI.DataPoint#ValidFrom',
            Label : 'Valid From'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'CurrencyDP',
            Target: '@UI.DataPoint#Currency',
            Label : 'Currency'
        }
    ]
);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION E  ·  CostCenters – Object Page Body (5 sections + child table)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
annotate service.CostCenters with @(

    // ── [E-1] FieldGroups – one per Object Page section ───────────────────

    UI.FieldGroup #GeneralInformation: {
        $Type: 'UI.FieldGroupType',
        Label: 'General Information',
        Data : [
            { $Type: 'UI.DataField', Value: KOSTL, Label: 'Cost Center'      },
            { $Type: 'UI.DataField', Value: KOKRS, Label: 'Controlling Area' }
        ]
    },

    UI.FieldGroup #OrganizationDetails: {
        $Type: 'UI.FieldGroupType',
        Label: 'Organization Details',
        Data : [
            { $Type: 'UI.DataField', Value: BUKRS, Label: 'Company Code'          },
            { $Type: 'UI.DataField', Value: GSBER, Label: 'Business Area'         },
            { $Type: 'UI.DataField', Value: KHINR, Label: 'Cost Center Hierarchy' },
            { $Type: 'UI.DataField', Value: PRCTR, Label: 'Profit Center'         }
        ]
    },

    UI.FieldGroup #Validity: {
        $Type: 'UI.FieldGroupType',
        Label: 'Validity',
        Data : [
            { $Type: 'UI.DataField', Value: DATAB, Label: 'Valid From' },
            { $Type: 'UI.DataField', Value: DATBI, Label: 'Valid To'   }
        ]
    },

    UI.FieldGroup #FinancialInformation: {
        $Type: 'UI.FieldGroupType',
        Label: 'Financial Information',
        Data : [
            { $Type: 'UI.DataField', Value: WAERS, Label: 'Currency Key' }
        ]
    },

    UI.FieldGroup #Responsibility: {
        $Type: 'UI.FieldGroupType',
        Label: 'Responsibility',
        Data : [
            { $Type: 'UI.DataField', Value: VERAK, Label: 'Person Responsible' }
        ]
    },

    // ── [E-2] Facets – Object Page section tabs ───────────────────────────
    UI.Facets: [

        // Section 1 – General Information (CollectionFacet with 2 columns)
        {
            $Type : 'UI.CollectionFacet',
            ID    : 'GeneralInfoSection',
            Label : 'General Information',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'GeneralInfoFG',
                    Target: '@UI.FieldGroup#GeneralInformation',
                    Label : 'Cost Center Identification'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'ValidityFG',
                    Target: '@UI.FieldGroup#Validity',
                    Label : 'Validity Period'
                }
            ]
        },

        // Section 2 – Organization Details
        {
            $Type : 'UI.CollectionFacet',
            ID    : 'OrgDetailsSection',
            Label : 'Organization Details',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'OrgDetailsFG',
                    Target: '@UI.FieldGroup#OrganizationDetails',
                    Label : 'Organizational Assignment'
                }
            ]
        },

        // Section 3 – Financial Information
        {
            $Type : 'UI.CollectionFacet',
            ID    : 'FinancialSection',
            Label : 'Financial Information',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'FinancialFG',
                    Target: '@UI.FieldGroup#FinancialInformation',
                    Label : 'Currency Settings'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'ResponsibilityFG',
                    Target: '@UI.FieldGroup#Responsibility',
                    Label : 'Responsibility'
                }
            ]
        },

        // Section 4 – Cost Center Texts (child table, Header → Line Item)
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'CostCenterTextsSection',
            Label : 'Cost Center Texts',
            Target: 'texts/@UI.LineItem'
        }
    ]
);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION F  ·  CostCenterTexts – Child Table (inside Object Page facet)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
annotate service.CostCenterTexts with @(

    // ── [F-1] HeaderInfo – used if texts sub-page is navigated directly ───
    UI.HeaderInfo: {
        TypeName      : 'Cost Center Text',
        TypeNamePlural: 'Cost Center Texts',
        Title         : {
            $Type: 'UI.DataField',
            Value: KTEXT
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: SPRAS
        }
    },

    // ── [F-2] LineItem – rendered as the responsive table in the OP facet ─
    // Language and Short Text are High importance (always visible).
    // Long Text, Search Term are Medium (hidden at small screens).
    // Logical System, Client are Low.
    UI.LineItem: [
        {
            $Type             : 'UI.DataField',
            Value             : SPRAS,
            Label             : 'Language',
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : KTEXT,
            Label             : 'Short Text',
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : LTEXT,
            Label             : 'Long Text',
            ![@UI.Importance] : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : MCTXT,
            Label             : 'Search Term',
            ![@UI.Importance] : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : LOGSYS,
            Label             : 'Logical System',
            ![@UI.Importance] : #Low
        },
        {
            $Type             : 'UI.DataField',
            Value             : MANDT,
            Label             : 'Client',
            ![@UI.Importance] : #Low
        }
    ],

    // ── [F-3] FieldGroup – for an inline edit form on the text sub-page ──
    UI.FieldGroup #TextDetails: {
        $Type: 'UI.FieldGroupType',
        Label: 'Text Details',
        Data : [
            { $Type: 'UI.DataField', Value: SPRAS,  Label: 'Language'       },
            { $Type: 'UI.DataField', Value: KTEXT,  Label: 'Short Text'     },
            { $Type: 'UI.DataField', Value: LTEXT,  Label: 'Long Text'      },
            { $Type: 'UI.DataField', Value: MCTXT,  Label: 'Search Term'    },
            { $Type: 'UI.DataField', Value: LOGSYS, Label: 'Logical System' },
            { $Type: 'UI.DataField', Value: MANDT,  Label: 'Client'         },
            { $Type: 'UI.DataField', Value: DATAB,  Label: 'Valid From'     },
            { $Type: 'UI.DataField', Value: DATBI,  Label: 'Valid To'       }
        ]
    },

    // ── [F-4] Facets – sub-Object Page sections for text records ─────────
    UI.Facets: [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'TextDetailsFacet',
            Label : 'Text Details',
            Target: '@UI.FieldGroup#TextDetails'
        }
    ],

    // ── [F-5] Identification ─────────────────────────────────────────────
    UI.Identification: [
        { $Type: 'UI.DataField', Value: KOSTL },
        { $Type: 'UI.DataField', Value: SPRAS }
    ]
);
