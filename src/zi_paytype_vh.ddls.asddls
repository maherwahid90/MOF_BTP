@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Payment Type - Value Help'
@ObjectModel.resultSet.sizeCategory: #XS
define view entity ZI_PayType_VH as select from zsrc_pt_t {
  key pt_code as PayType,
      pt_name as PayTypeName
}
