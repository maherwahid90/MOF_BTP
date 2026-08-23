@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@Objectmodel: {
  Sapobjectnodetype.Name: 'ZZM_SRC_TYPE_TMOF'
}
@AccessControl.authorizationCheck: #MANDATORY
define root view entity ZZM_C_SRC_TYPE_TMOF
  provider contract TRANSACTIONAL_QUERY
  as projection on ZZM_R_SRC_TYPE_TMOF
  association [1..1] to ZZM_R_SRC_TYPE_TMOF as _BaseEntity on $projection.TYPECODE = _BaseEntity.TYPECODE
{
  key TypeCode,
  TypeName,
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
  _BaseEntity
}
