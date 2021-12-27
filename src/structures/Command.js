class Command {
    constructor (client, options) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.options = options.options,
        this.category = options.category,
        this.usage = options.usage,
        this.requireDatabase = options.requireDatabase
        this.permissions = options.permissions
    }
}

module.exports = Command