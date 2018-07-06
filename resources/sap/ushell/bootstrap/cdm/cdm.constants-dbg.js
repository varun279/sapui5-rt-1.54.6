sap.ui.define( [
    "../common/common.util"
], function ( oCommonBootUtil ) {
    "use strict";

    return oCommonBootUtil.deepFreeze( {
        // default ushell config object with all local adapters configured which
        // are not available for CDM, yet
        defaultConfig: {
            "defaultRenderer": "fiori2",
            "renderers": {
                "fiori2": {
                    "componentData": {
                        "config": {
                            "enableHideGroups": true,
                            "enablePersonalization": true,
                            "enableTagFiltering": false,
                            "enableSearch": false,
                            "enableTilesOpacity": false,
                            "enableSetTheme": true,
                            "enableAccessibility": true,
                            "enableHelp": false,
                            "enableUserDefaultParameters": true,
                            "preloadLibrariesForRootIntent": false,
                            "applications": {
                                "Shell-home": {
                                    "enableActionModeMenuButton": true,
                                    "enableActionModeFloatingButton": true,
                                    "enableEasyAccess": false,
                                    "enableTileActionsIcon": false,
                                    "enableHideGroups": false,
                                    "enableLockedGroupsCompactLayout": false,
                                    "enableTilesOpacity": false
                                }
                            },
                            "rootIntent": "Shell-home"
                        }
                    }
                }
            },
            "services": {
                "Container": {
                    "adapter": {
                        "config": {
                            "userProfile": {
                                "metadata": {
                                    "ranges": {
                                        "theme": {
                                            "sap_belize": {
                                                "displayName": "SAP Belize",
                                                "themeRoot": ""
                                            },
                                            "sap_belize_plus":  {
                                                "displayName": "SAP Belize Plus",
                                                "themeRoot": ""
                                            },
                                            "sap_belize_hcb": {
                                                "displayName": "SAP Belize HCB",
                                                "themeRoot": ""
                                            },
                                            "sap_belize_hcw": {
                                                "displayName": "SAP Belize HCW",
                                                "themeRoot": ""
                                            }
                                        }
                                    }
                                },
                                "defaults": {
                                    "theme": "sap_belize"
                                }
                            }
                        }
                    }
                },
                "Personalization": {
                    "adapter": {
                        "module": "sap.ushell.adapters.local.PersonalizationAdapter"
                    }
                },
                "AppState": {
                    "adapter": {
                        "module": "sap.ushell.adapters.local.AppStateAdapter"
                    },
                    "config": {
                        "transient": true
                    }
                },
                "NavTargetResolution": {
                    "config": {
                        "runStandaloneAppFolderWhitelist": { },
                        "allowTestUrlComponentConfig": false,
                        "enableClientSideTargetResolution": true
                    },
                    "adapter": {
                        "module": "sap.ushell.adapters.local.NavTargetResolutionAdapter"
                    }
                },
                "SupportTicket": {
                    "config": {
                        "enabled": false
                    },
                    "adapter": {
                        "module": "sap.ushell.adapters.local.SupportTicketAdapter"
                    }
                },
                "EndUserFeedback": {
                    "adapter": {
                        "config": {
                            "enabled": false
                        },
                        "module": "sap.ushell.adapters.local.EndUserFeedbackAdapter"
                    }
                },
                "UserInfo": {
                    "adapter": {
                        "module": "sap.ushell.adapters.local.UserInfoAdapter"
                    }
                },
                "UserDefaultParameterPersistence": {
                    "adapter": {
                        "module": "sap.ushell.adapters.local.UserDefaultParameterPersistenceAdapter"
                    }
                }
            },
            "ui5": {
                "libs": {
                    "sap.ui.core": true,
                    "sap.m": true,
                    "sap.ushell": true
                }
            }
        }
    } );
} );