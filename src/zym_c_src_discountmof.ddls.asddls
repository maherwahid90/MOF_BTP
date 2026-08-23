@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@AccessControl.authorizationCheck: #MANDATORY
define view entity ZYM_C_SRC_DISCOUNTMOF
  as projection on ZYM_R_SRC_DISCOUNTMOF
  association [1..1] to ZYM_R_SRC_DISCOUNTMOF as _BaseEntity on $projection.UUID = _BaseEntity.UUID
{
  key UUID,
  ParentUUID,
  ObjectType,
  ObjectID,
  Begda,
  Endda,
  Discount,
  @Consumption: {
    Valuehelpdefinition: [ {
      Entity.Element: 'Currency', 
      Entity.Name: 'I_CurrencyStdVH', 
      Useforvalidation: true
    } ]
  }
  Currency,
  _Src_details : redirected to parent ZYM_C_SRC_DETAILSMOF,
  _BaseEntity
}
