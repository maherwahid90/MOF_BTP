@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@AccessControl.authorizationCheck: #MANDATORY
define view entity ZYM_C_SRC_CLASSIFICATIONMOF
  as projection on ZYM_R_SRC_CLASSIFICATIONMOF
  association [1..1] to ZYM_R_SRC_CLASSIFICATIONMOF as _BaseEntity on $projection.UUID = _BaseEntity.UUID
{
  key UUID,
  ParentUUID,
  ObjectType,
  ObjectID,
  Begda,
  Endda,
  Gfs,
  NaturalAccount,
  _Src_details : redirected to parent ZYM_C_SRC_DETAILSMOF,
  _BaseEntity
}
