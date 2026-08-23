@Metadata.allowExtensions: true
@EndUserText.label: 'SRC Node - Projection'
@AccessControl.authorizationCheck: #NOT_REQUIRED
@ObjectModel.semanticKey: [ 'SrcCode' ]

@OData.hierarchy.recursiveHierarchy:[{ entity.name: 'zsrc_hierarchy' }]
define root view entity ZC_SrcNode
  provider contract transactional_query
  as projection on ZI_SrcNode
{
  key NodeUUID,
      ParentUUID,
      NodeLevel,

      SrcCode,

      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_SrcType_VH', element: 'SrcType' } }]
      @ObjectModel.text.element: [ 'SrcTypeName' ]
      SrcType,
      _SrcType.SrcTypeName   as SrcTypeName,

      SrcName,
      SrcDesc,
      GfsCode,
      NaturalAccount,
      IsRefundable,

      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_SrcMethod_VH', element: 'SrcMethod' } }]
      @ObjectModel.text.element: [ 'SrcMethodName' ]
      SrcMethod,
      _SrcMethod.SrcMethodName as SrcMethodName,

      G2C,
      G2B,
      G2G,

      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_SrcNature_VH', element: 'SrcNature' } }]
      @ObjectModel.text.element: [ 'SrcNatureName' ]
      SrcNature,
      _SrcNature.SrcNatureName as SrcNatureName,

      SrcNaturePct,

      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_GovEntity_VH', element: 'GovEntityCode' } }]
      @ObjectModel.text.element: [ 'OwnerGEName' ]
      OwnerGECode,
      _OwnerGE.GovEntityName as OwnerGEName,

      StartDate,
      EndDate,

      @Semantics.amount.currencyCode: 'CurrencyCode'
      Price,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      Discount,
      @Consumption.valueHelpDefinition: [{ entity: { name: 'I_Currency', element: 'Currency' } }]
      @Semantics.currencyCode: true
      CurrencyCode,

      ProcessingStatus,
      IsActive,
      CreatedBy, CreatedAt, LastChangedBy, LastChangedAt, LocalLastChangedAt,

      _PayMethod : redirected to composition child ZC_SrcPayMethod,
      _GovEntity : redirected to composition child ZC_SrcGovEntity,
      _Parent    : redirected to ZC_SrcNode,
      _SrcType, _SrcMethod, _SrcNature, _OwnerGE
}
