@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@Objectmodel: {
  Sapobjectnodetype.Name: 'ZYM_Src_detailsMOF'
}
@AccessControl.authorizationCheck: #MANDATORY
define root view entity ZYM_C_SRC_DETAILSMOF
  provider contract TRANSACTIONAL_QUERY
  as projection on ZYM_R_SRC_DETAILSMOF
  association [1..1] to ZYM_R_SRC_DETAILSMOF as _BaseEntity on $projection.UUID = _BaseEntity.UUID
{
  key UUID,
  ObjectType,
  ObjectID,
  Begda,
  Endda,
  Stext,
  Ltext,
  @Semantics: {
    User.Createdby: true
  }
  LocalCreatedBy,
  @Semantics: {
    Systemdatetime.Createdat: true
  }
  LocalCreatedAt,
  @Semantics: {
    User.Localinstancelastchangedby: true
  }
  LocalLastChangedBy,
  @Semantics: {
    Systemdatetime.Localinstancelastchangedat: true
  }
  LocalLastChangedAt,
  @Semantics: {
    Systemdatetime.Lastchangedat: true
  }
  LastChangedAt,
  _SRC_classification : redirected to composition child ZYM_C_SRC_CLASSIFICATIONMOF,
  _SRC_Price : redirected to composition child ZYM_C_SRC_PRICEMOF,
  _SRC_discount : redirected to composition child ZYM_C_SRC_DISCOUNTMOF,
  _src_relation : redirected to composition child ZYM_C_SRC_RELATIONMOF,
  _BaseEntity
}
