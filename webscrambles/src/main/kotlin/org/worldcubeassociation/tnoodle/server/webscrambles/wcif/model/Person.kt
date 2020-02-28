package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

data class Person(val registrantId: Int, val name: String, val wcaUserId: Int, val wcaId: String?, val countryIso2: CountryCode, val gender: Gender, val avatar: Avatar?, val roles: List<Role>, val registration: Registration?, val assignments: List<Assignment>, val personalBests: List<PersonalBest>)
