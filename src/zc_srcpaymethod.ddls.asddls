@Metadata.allowExtensions: true
@EndUserText.label: 'SRC Payment Method - Projection'
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZC_SrcPayMethod
  as projection on ZI_SrcPayMethod
{
  key PayMethodUUID,
      NodeUUID,

      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_PayType_VH', element: 'PayType' } }]
      @ObjectModel.text.element: [ 'PayTypeName' ]
      PayType,
      _PayTypeMaster.PayTypeName as PayTypeName,

      PayName,
      BeginDate,
      EndDate,
      CreatedBy, CreatedAt, LastChangedBy, LocalLastChangedAt,
      _Node : redirected to parent ZC_SrcNode,
      _PayTypeMaster
}
