@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@AccessControl.authorizationCheck: #MANDATORY
define view entity ZYM_C_SRC_RELATIONMOF
  as projection on ZYM_R_SRC_RELATIONMOF
  association [1..1] to ZYM_R_SRC_RELATIONMOF as _BaseEntity on $projection.UUID = _BaseEntity.UUID
{
  key UUID,
  ParentUUID,
  Fotype,
  Fobjid,
  Begda,
  Endda,
  RelationType,
  RelationID,
  Totype,
  Tobjid,
  _Src_details : redirected to parent ZYM_C_SRC_DETAILSMOF,
  _BaseEntity
}
