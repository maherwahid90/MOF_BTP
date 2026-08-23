CLASS lhc_SrcNode DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.

    METHODS get_instance_features FOR INSTANCE FEATURES
      keys REQUEST requested_features FOR SrcNode RESULT result.

    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      keys REQUEST requested_authorizations FOR SrcNode RESULT result.

    METHODS approve FOR MODIFY
       keys FOR ACTION SrcNode~approve RESULT result.

    METHODS reject FOR MODIFY
       keys FOR ACTION SrcNode~reject RESULT result.

    METHODS submitForApproval FOR MODIFY
       keys FOR ACTION SrcNode~submitForApproval RESULT result.

    METHODS setInitialLevel FOR DETERMINE ON MODIFY
       keys FOR SrcNode~setInitialLevel.

    METHODS setInitialStatus FOR DETERMINE ON MODIFY
       keys FOR SrcNode~setInitialStatus.

    METHODS validateDates FOR VALIDATE ON SAVE
       keys FOR SrcNode~validateDates.

    METHODS validateNode FOR VALIDATE ON SAVE
       keys FOR SrcNode~validateNode.

    METHODS validateParent FOR VALIDATE ON SAVE
       keys FOR SrcNode~validateParent.

ENDCLASS.

CLASS lhc_SrcNode IMPLEMENTATION.

  METHOD get_instance_features.
  ENDMETHOD.

  METHOD get_instance_authorizations.
  ENDMETHOD.

  METHOD approve.
  ENDMETHOD.

  METHOD reject.
  ENDMETHOD.

  METHOD submitForApproval.
  ENDMETHOD.

  METHOD setInitialLevel.
  ENDMETHOD.

  METHOD setInitialStatus.
  ENDMETHOD.

  METHOD validateDates.
  ENDMETHOD.

  METHOD validateNode.
  ENDMETHOD.

  METHOD validateParent.
  ENDMETHOD.

ENDCLASS.
