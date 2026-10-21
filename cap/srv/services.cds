using mof.src as db from '../db/schema';
using {sap.common.Currencies as CommonCurrencies} from '@sap/cds/common';

/**
 * SRC hierarchy with the approval workflow.
 * Roles: SrcViewer (read), SrcEditor (maintain, submit), SrcApprover (approve / reject).
 */
@impl    : 'srv/src-service.js'
@path    : '/odata/v4/src'
@requires: 'authenticated-user'
service SrcService {

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE', 'submitForApproval'], to: 'SrcEditor' },
    { grant: ['approve', 'rejectNode'], to: 'SrcApprover' }
  ]
  entity SrcNodes as projection on db.SrcNodes actions {
    action submitForApproval() returns SrcNodes;
    action approve()           returns SrcNodes;
    action rejectNode(reason : String(255)) returns SrcNodes;
  };

  annotate SrcNodes with {
    level           @readonly;
    status          @readonly;
    isActive        @readonly;
    submittedBy     @readonly;
    submittedAt     @readonly;
    decidedBy       @readonly;
    decidedAt       @readonly;
    rejectionReason @readonly;
  };

  // SrcPayMethods and SrcGovEntities are auto-exposed as composition children of SrcNodes
  // and are only written through deep create / update on the node.

  // value helps
  @readonly entity SrcTypes     as projection on db.SrcTypes;
  @readonly entity SrcMethods   as projection on db.SrcMethods;
  @readonly entity SrcNatures   as projection on db.SrcNatures;
  @readonly entity PaymentTypes as projection on db.PaymentTypes;
  @readonly entity GovEntities  as projection on db.GovEntities;
  @readonly entity Currencies   as projection on CommonCurrencies;

  /** Current user and roles, used by the UI to show or hide actions. */
  function userInfo() returns {
    id    : String;
    roles : array of String;
  };
}

/** SRC details: time-dependent objects with classification, price, discount and relation records. */
@impl    : 'srv/details-service.js'
@path    : '/odata/v4/details'
@requires: 'authenticated-user'
service DetailsService {

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover'] },
    { grant: '*', to: 'SrcEditor' }
  ]
  entity SrcDetails as projection on db.SrcDetails;

  // classification, price, discount and relation records are auto-exposed composition children

  @readonly entity ObjectTypes   as projection on db.ObjectTypes;
  @readonly entity RelationTypes as projection on db.RelationTypes;
  @readonly entity Currencies    as projection on CommonCurrencies;
}

/** Master data maintenance (the ZZM_* and catalog apps). */
@impl    : 'srv/admin-service.js'
@path    : '/odata/v4/admin'
@requires: 'authenticated-user'
service AdminService {
  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity SrcTypes      as projection on db.SrcTypes;

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity SrcMethods    as projection on db.SrcMethods;

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity SrcNatures    as projection on db.SrcNatures;

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity PaymentTypes  as projection on db.PaymentTypes;

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity GovEntities   as projection on db.GovEntities;

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity ObjectTypes   as projection on db.ObjectTypes;

  @restrict: [
    { grant: 'READ', to: ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin'] },
    { grant: '*', to: 'SrcAdmin' }
  ]
  entity RelationTypes as projection on db.RelationTypes;
}
