namespace mof.src;

using {
  cuid,
  managed,
  Currency
} from '@sap/cds/common';

/** Approval status of an SRC node (PROCESSING_STATUS in the ABAP model). */
type Status : String(2) enum {
  New       = '01';
  Submitted = '02';
  Approved  = '03';
  Rejected  = '04';
}

// ---------------------------------------------------------------------------
// Master data (ZSRC_*_T tables / ZZM_* apps)
// ---------------------------------------------------------------------------

entity SrcTypes : managed {
  key code : String(10);
      name : String(120) @mandatory;
}

entity SrcMethods : managed {
  key code : String(10);
      name : String(120) @mandatory;
}

entity SrcNatures : managed {
  key code : String(10);
      name : String(120) @mandatory;
}

entity PaymentTypes : managed {
  key code     : String(10);
      name     : String(120) @mandatory;
      isActive : Boolean default true;
}

entity GovEntities : managed {
  key code     : String(20);
      name     : String(120) @mandatory;
      region   : String(60);
      iban     : String(34);
      isActive : Boolean default true;
}

// ---------------------------------------------------------------------------
// SRC hierarchy (ZSRC_NODE / ZSRC_PAYM / ZSRC_GOV)
// ---------------------------------------------------------------------------

@assert.unique: {code: [code]}
entity SrcNodes : cuid, managed {
  parent          : Association to SrcNodes;
  children        : Association to many SrcNodes
                      on children.parent = $self;
  level           : Integer default 1;

  code            : String(20)  @mandatory;
  name            : String(120) @mandatory;
  type            : Association to SrcTypes @mandatory;
  description     : String(250);
  gfsCode         : String(20);
  naturalAccount  : String(20);
  isRefundable    : Boolean default false;
  method          : Association to SrcMethods;
  nature          : Association to SrcNatures;
  naturePct       : Decimal(5, 2);
  ownerGovEntity  : Association to GovEntities;

  // service beneficiaries
  g2c             : Boolean default false;
  g2b             : Boolean default false;
  g2g             : Boolean default false;

  // financial data
  startDate       : Date;
  endDate         : Date;
  price           : Decimal(15, 2);
  discount        : Decimal(15, 2);
  currency        : Currency;

  // workflow
  status          : Status default '01';
  isActive        : Boolean default false;
  submittedBy     : String(255);
  submittedAt     : Timestamp;
  decidedBy       : String(255);
  decidedAt       : Timestamp;
  rejectionReason : String(255);

  payMethods      : Composition of many SrcPayMethods
                      on payMethods.node = $self;
  govEntities     : Composition of many SrcGovEntities
                      on govEntities.node = $self;
}

entity SrcPayMethods : cuid, managed {
  node      : Association to SrcNodes;
  payType   : Association to PaymentTypes @mandatory;
  payName   : String(120);
  beginDate : Date;
  endDate   : Date;
}

entity SrcGovEntities : cuid, managed {
  node          : Association to SrcNodes;
  govEntity     : Association to GovEntities @mandatory;
  collectionPct : Decimal(5, 2);
  beginDate     : Date;
  endDate       : Date;
}

// ---------------------------------------------------------------------------
// SRC details (ZYM_* apps): time-dependent objects with dated sub-records
// ---------------------------------------------------------------------------

entity ObjectTypes : managed {
  key code   : String(10);
      nameAr : String(120);
      nameEn : String(120);
}

entity RelationTypes : managed {
  key code     : String(10);
      relation : String(10);
      nameAr   : String(120);
      nameEn   : String(120);
}

entity SrcDetails : cuid, managed {
  objectType      : Association to ObjectTypes @mandatory;
  objectId        : String(10) @mandatory;
  begda           : Date;
  endda           : Date;
  shortText       : String(100);
  longText        : String(200);
  classifications : Composition of many SrcClassifications
                      on classifications.details = $self;
  prices          : Composition of many SrcPrices
                      on prices.details = $self;
  discounts       : Composition of many SrcDiscounts
                      on discounts.details = $self;
  relations       : Composition of many SrcRelations
                      on relations.details = $self;
}

aspect DatedRecord : cuid {
  begda : Date;
  endda : Date;
}

entity SrcClassifications : DatedRecord {
  details        : Association to SrcDetails;
  gfs            : String(20);
  naturalAccount : String(20);
}

entity SrcPrices : DatedRecord {
  details  : Association to SrcDetails;
  price    : Decimal(15, 2);
  currency : Currency;
}

entity SrcDiscounts : DatedRecord {
  details  : Association to SrcDetails;
  discount : Decimal(15, 2);
  currency : Currency;
}

entity SrcRelations : DatedRecord {
  details      : Association to SrcDetails;
  fromType     : Association to ObjectTypes;
  fromId       : String(10);
  relationType : Association to RelationTypes;
  relationId   : String(10);
  toType       : Association to ObjectTypes;
  toId         : String(10);
}
