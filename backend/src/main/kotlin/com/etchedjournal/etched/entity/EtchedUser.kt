package com.etchedjournal.etched.entity

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "users")
class EtchedUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    val id: Long?,

    @Column(nullable = false)
    var username: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false)
    var email: String,

    @Column(nullable = false)
    var admin: Boolean = false,

    // These can be set after registration.
    // The fields below are all for deriving the Master Key.
    @Column(nullable = true)
    var algo: String? = null,

    @Column(nullable = true)
    var salt: String? = null,

    @Column(nullable = true)
    var keySize: Int? = null,

    @Column(nullable = true)
    var iterations: Long? = null


) {
    override fun toString(): String {
        return "EtchedUser(id=$id, username='$username', email='$email')"
    }
}
