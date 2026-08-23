@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SRC Method - Value Help'
@ObjectModel.resultSet.sizeCategory: #XS
define view entity ZI_SrcMethod_VH as select from zsrc_meth_t {
  key method_code as SrcMethod,
      method_name as SrcMethodName
}
