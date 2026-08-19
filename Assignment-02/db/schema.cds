namespace costcenter;

using { managed } from '@sap/cds/common';

// ════════════════════════════════════════════════════════════════════════════
// CSKS – Cost Center Master (Header)
// Mixes in `managed` to get createdAt / createdBy / modifiedAt / modifiedBy
// automatically — used by Fiori Elements for audit stamp display.
// ════════════════════════════════════════════════════════════════════════════
entity CSKS : managed {
    key KOKRS : String(4)   @title: 'Controlling Area'
                            @Common.Label: 'Controlling Area';
    key KOSTL : String(10)  @title: 'Cost Center'
                            @Common.Label: 'Cost Center';

    DATBI     : Date        @title: 'Valid To'
                            @Common.Label: 'Valid To';
    DATAB     : Date        @title: 'Valid From'
                            @Common.Label: 'Valid From';
    BUKRS     : String(4)   @title: 'Company Code'
                            @Common.Label: 'Company Code';
    GSBER     : String(4)   @title: 'Business Area'
                            @Common.Label: 'Business Area';
    KHINR     : String(12)  @title: 'Cost Center Hierarchy'
                            @Common.Label: 'Hierarchy Node';
    PRCTR     : String(10)  @title: 'Profit Center'
                            @Common.Label: 'Profit Center';
    WAERS     : String(5)   @title: 'Currency Key'
                            @Common.Label: 'Currency';
    VERAK     : String(20)  @title: 'Person Responsible'
                            @Common.Label: 'Person Responsible';

    // ── Composition to texts (one-to-many via KOKRS + KOSTL) ────────────
    texts     : Composition of many CSKT
                    on  texts.KOKRS = KOKRS
                    and texts.KOSTL = KOSTL;
}

// ════════════════════════════════════════════════════════════════════════════
// CSKT – Cost Center Texts  (Language-dependent line items)
// ════════════════════════════════════════════════════════════════════════════
entity CSKT {
    key KOKRS  : String(4)   @title: 'Controlling Area'
                             @Common.Label: 'Controlling Area';
    key KOSTL  : String(10)  @title: 'Cost Center'
                             @Common.Label: 'Cost Center';
    key SPRAS  : String(2)   @title: 'Language'
                             @Common.Label: 'Language';

    DATAB      : Date        @title: 'Valid From'
                             @Common.Label: 'Valid From';
    DATBI      : Date        @title: 'Valid To'
                             @Common.Label: 'Valid To';
    KTEXT      : String(20)  @title: 'Short Text'
                             @Common.Label: 'Short Text';
    LTEXT      : String(40)  @title: 'Long Text'
                             @Common.Label: 'Long Text';
    MCTXT      : String(20)  @title: 'Search Term'
                             @Common.Label: 'Search Term';
    LOGSYS     : String(10)  @title: 'Logical System'
                             @Common.Label: 'Logical System';
    MANDT      : String(3)   @title: 'Client'
                             @Common.Label: 'Client';

    // ── Back-association to header ───────────────────────────────────────
    header     : Association to CSKS
                    on  header.KOKRS = KOKRS
                    and header.KOSTL = KOSTL;
}
