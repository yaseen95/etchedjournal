package com.etchedjournal.etched.models

enum class OwnerType(val dbRepresentation: String) {
    USER("u");

    companion object {
        fun fromDb(s: String): OwnerType {
            when (s) {
                OwnerType.USER.dbRepresentation -> return OwnerType.USER
                else -> throw IllegalArgumentException("Unexpected owner type $s")
            }
        }
    }
}
