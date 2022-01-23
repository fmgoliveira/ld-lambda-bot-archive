const { Schema, model, SchemaTypes } = require("mongoose")

const guildSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    welcome: {
        active: {
            type: Boolean,
            default: false
        },
        channel: {
            type: String,
            default: null
        },
        message: {
            type: String,
            default: "*{user}*, welcome to **{guild}**! Have a great time here!"
        },
        dm: {
            type: Boolean,
            default: false
        },
        embed: {
            active: {
                type: Boolean,
                default: false
            },
            author: {
                type: String,
                default: null
            },
            authorAvatar: {
                type: String,
                default: null
            },
            authorUrl: {
                type: String,
                default: null
            },
            title: {
                type: String,
                default: "Welcome!"
            },
            titleUrl: {
                type: String,
                default: null
            },
            description: {
                type: String,
                default: "*{user}*, welcome to **{guild}**! Have a great time here!"
            },
            thumbnail: {
                type: String,
                default: null
            },
            image: {
                type: String,
                default: null
            },
            footerText: {
                type: String,
                default: null
            },
            footerIcon: {
                type: String,
                default: null
            },
            color: {
                type: String,
                default: "#000000"
            }
        }
    },

    leave: {
        active: {
            type: Boolean,
            default: false
        },
        channel: {
            type: String,
            default: null
        },
        message: {
            type: String,
            default: "*{user_tag}* just left **{guild}**."
        },
        dm: {
            type: Boolean,
            default: false
        },
        embed: {
            active: {
                type: Boolean,
                default: false
            },
            author: {
                type: String,
                default: null
            },
            authorAvatar: {
                type: String,
                default: null
            },
            authorUrl: {
                type: String,
                default: null
            },
            title: {
                type: String,
                default: "Welcome!"
            },
            titleUrl: {
                type: String,
                default: null
            },
            description: {
                type: String,
                default: "*{user_tag}* just left **{guild}**."
            },
            thumbnail: {
                type: String,
                default: null
            },
            image: {
                type: String,
                default: null
            },
            footerText: {
                type: String,
                default: null
            },
            footerIcon: {
                type: String,
                default: null
            },
            color: {
                type: String,
                default: "#000000"
            }
        }
    },

    autorole: {
        active: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: null
        }
    },

    moderation: {
        moderatorRole: {
            type: String,
            default: null
        },
        includeReason: {
            type: Boolean,
            default: true
        },
        dm: {
            ban: {
                type: Boolean,
                default: false
            },
            kick: {
                type: Boolean,
                default: false
            },
            warn: {
                type: Boolean,
                default: true
            },
            timeout: {
                type: Boolean,
                default: false
            },
        }
    },

    altDetector: {
        active: {
            type: Boolean,
            default: false
        },
        logChannel: {
            type: String,
            default: null
        },
        accountAge: {
            type: Number,
            default: 7
        },
        action: {
            type: String,
            default: "kick"
        },
        whitelistedIds: {
            type: Array,
            default: []
        }
    },

    logging: {
        channel: {
            moderation: {
                type: String,
                default: null
            },
            serverEvents: {
                type: String,
                default: null
            },
            memberEvents: {
                type: String,
                default: null
            },
            messageEvents: {
                type: String,
                default: null
            }
        },
        color: {
            moderation: {
                type: String,
                default: "#000000"
            },
            serverEvents: {
                type: String,
                default: "#000000"
            },
            memberEvents: {
                type: String,
                default: "#000000"
            },
            messageEvents: {
                type: String,
                default: "#000000"
            }
        },
        active: {
            moderation: {
                ban: {
                    type: Boolean,
                    default: false
                },
                kick: {
                    type: Boolean,
                    default: false
                },
                clear: {
                    type: Boolean,
                    default: false
                },
                warn: {
                    type: Boolean,
                    default: false
                },
                timeout: {
                    type: Boolean,
                    default: false
                },
                slowmode: {
                    type: Boolean,
                    default: false
                }
            },
            serverEvents: {
                channelCreate: {
                    type: Boolean,
                    default: false
                },
                channelUpdate: {
                    type: Boolean,
                    default: false
                },
                channelDelete: {
                    type: Boolean,
                    default: false
                },
                roleCreateDelete: {
                    type: Boolean,
                    default: false
                },
                roleUpdate: {
                    type: Boolean,
                    default: false
                },
                guildUpdate: {
                    type: Boolean,
                    default: false
                }
            },
            memberEvents: {
                memberJoin: {
                    type: Boolean,
                    default: false
                },
                memberLeave: {
                    type: Boolean,
                    default: false
                },
                rolesUpdate: {
                    type: Boolean,
                    default: false
                },
                nicknameUpdate: {
                    type: Boolean,
                    default: false
                }
            },
            messageEvents: {
                messageDelete: {
                    type: Boolean,
                    default: false
                },
                messageEdit: {
                    type: Boolean,
                    default: false
                }
            }
        }
    },

    tickets: {
        active: {
            type: Boolean,
            default: false
        },
        panelMessage: {
            id: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null,
            },
            message: {
                title: {
                    type: String,
                    default: "Open a Ticket"
                },
                description: {
                    type: String,
                    default: "Click the button below to open a support ticket between you and the Support Team of {guild}."
                },
                color: {
                    type: String,
                    default: "#000000"
                },
                timestamp: {
                    type: Boolean,
                    default: false
                }
            },
            channel: {
                type: String,
                default: null
            }
        },
        logChannel: {
            type: String,
            default: null
        },
        closedCategory: {
            type: String,
            default: null
        },
        ticketCount: {
            type: Number,
            default: 0
        }
    },

    leaves: {
        type: SchemaTypes.Array,
        default: []
    }
})

module.exports = model("guilds", guildSchema)