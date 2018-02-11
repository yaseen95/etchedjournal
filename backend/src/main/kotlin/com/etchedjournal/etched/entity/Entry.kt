package com.etchedjournal.etched.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table

/**
 * A new Journal Entry
 *
 * @param id: the id of the content
 * @param title: the title of the content (encrypted client side)
 * @param created: date the content was created
 * @param finished: date the content was finished
 * @param etches: the etches that make up this content
 * @param state: the state of the content
 */
@Entity
@Table(name = "entries")
data class Entry(
        /**
         * This is only null when creating an entry. When retrieved by the database safe to
         * assume non-null
         */
        @Id
        @Column(nullable = false, name = "entry_id")
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long?,

        // TODO-HIGH: As much as possible should be encrypted
        // Title, and dates should be encrypted.
        // Maybe title, dates, tags, state, etc. is all encrypted client side and stored there
        @Column(nullable = false)
        val title: String,

        // Have to set this to var, because Jackson can't read the default value.
        // TODO: File a bug report possibly?
        @Column(nullable = false)
        var created: Instant = Instant.now(),

        @Column(nullable = true)
        var finished: Instant?,

        @OneToMany(mappedBy = "entry")
        val etches: MutableList<Etch>,

        @Column(nullable = false)
        var state: EntryState,

        @ManyToOne
        @JoinColumn(name = "user_id")
        @JsonIgnore
        val user: EtchedUser
) {
    constructor(title: String, user: EtchedUser) :
            this(null, title, Instant.now(), null, mutableListOf(), EntryState.CREATED,
                    user)
}
