@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Hierarchy: Draft: Employee HierarchyNode'

define hierarchy zsrc_hierarchy as parent child hierarchy( source ZI_SrcNode 
child to parent association _Parent
    start where
      ParentUUID is initial
    siblings order by
      SrcCode ascending
  )
{
  key NodeUUID,
      ParentUUID
}
