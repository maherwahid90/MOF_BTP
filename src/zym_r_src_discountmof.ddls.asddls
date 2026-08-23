@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@EndUserText.label: '###GENERATED Core Data Service Entity'
define view entity ZYM_R_SRC_DISCOUNTMOF
  as select from ZYM_SRCDSCUNTMOF as SRC_discount
  association to parent ZYM_R_SRC_DETAILSMOF as _Src_details on $projection.ParentUuid = _Src_details.Uuid
{
  key uuid as UUID,
  parent_uuid as ParentUUID,
  object_type as ObjectType,
  object_id as ObjectID,
  begda as Begda,
  endda as Endda,
  discount as Discount,
  @Consumption.valueHelpDefinition: [ {
    entity.name: 'I_CurrencyStdVH', 
    entity.element: 'Currency', 
    useForValidation: true
  } ]
  currency as Currency,
  _Src_details
}
