package com.etchedjournal.etched.repository

import com.etchedjournal.etched.entity.EtchedUser
import org.springframework.data.repository.CrudRepository

interface EtchedUserRepository : CrudRepository<EtchedUser, Long> {

    fun findByUsername(username: String): EtchedUser?

    fun existsByUsername(username: String): Boolean

    fun existsByEmail(email: String): Boolean
}
