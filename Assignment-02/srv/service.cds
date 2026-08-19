using { costcenter } from '../db/schema';

// ════════════════════════════════════════════════════════════════════════════
// CostCenterService – OData V4
// Path  : /odata/v4/cost-center
// CRUD  : Full Create / Read / Update / Delete on both entities
// ════════════════════════════════════════════════════════════════════════════
@path: '/odata/v4/cost-center'
service CostCenterService {

    // ── CostCenters – Header entity (CSKS projection) ────────────────────
    @odata.draft.enabled
    @(
        Capabilities.SearchRestrictions : {
            $Type     : 'Capabilities.SearchRestrictionsType',
            Searchable: true
        },
        Capabilities.SortRestrictions : {
            $Type        : 'Capabilities.SortRestrictionsType',
            NonSortableProperties: [ KHINR ]
        },
        Capabilities.FilterRestrictions : {
            $Type              : 'Capabilities.FilterRestrictionsType',
            FilterExpressionRestrictions: [{
                Property          : DATAB,
                AllowedExpressions: 'SingleRange'
            },{
                Property          : DATBI,
                AllowedExpressions: 'SingleRange'
            }]
        },
        Capabilities.InsertRestrictions : {
            $Type    : 'Capabilities.InsertRestrictionsType',
            Insertable: true
        },
        Capabilities.UpdateRestrictions : {
            $Type    : 'Capabilities.UpdateRestrictionsType',
            Updatable: true
        },
        Capabilities.DeleteRestrictions : {
            $Type    : 'Capabilities.DeleteRestrictionsType',
            Deletable: true
        },
        Capabilities.NavigationRestrictions: {
            $Type              : 'Capabilities.NavigationRestrictionsType',
            RestrictedProperties: [{
                NavigationProperty: texts,
                InsertRestrictions: { Insertable: true },
                UpdateRestrictions: { Updatable : true },
                DeleteRestrictions: { Deletable : true }
            }]
        }
    )
    entity CostCenters as projection on costcenter.CSKS {
        *,
        texts
    };

    // ── CostCenterTexts – Line-item entity (CSKT projection) ─────────────
    @(
        Capabilities.InsertRestrictions : {
            $Type    : 'Capabilities.InsertRestrictionsType',
            Insertable: true
        },
        Capabilities.UpdateRestrictions : {
            $Type    : 'Capabilities.UpdateRestrictionsType',
            Updatable: true
        },
        Capabilities.DeleteRestrictions : {
            $Type    : 'Capabilities.DeleteRestrictionsType',
            Deletable: true
        }
    )
    entity CostCenterTexts as projection on costcenter.CSKT {
        *,
        header
    };
}
