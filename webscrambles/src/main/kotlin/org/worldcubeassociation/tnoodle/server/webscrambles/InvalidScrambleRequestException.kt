package org.worldcubeassociation.tnoodle.server.webscrambles

class InvalidScrambleRequestException : Exception {
    constructor(string: String) : super(string)
    constructor(cause: Throwable) : super(cause)
}
