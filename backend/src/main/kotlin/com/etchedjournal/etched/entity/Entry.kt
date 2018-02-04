package com.etchedjournal.etched.entity

import java.time.LocalDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
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
open class Entry(
        /**
         * This is only null when creating an entry. When retrieved by the database safe to
         * assume non-null
         */
        @Id
        @Column(nullable = false, name = "entry_id")
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long?,

        @Column(nullable = false)
        val title: String,

        @Column(nullable = false)
        val created: LocalDateTime,

        @Column(nullable = true)
        var finished: LocalDateTime?,

        @OneToMany(mappedBy = "entry")
        val etches: MutableList<Etch>,

        @Column(nullable = false)
        var state: EntryState
) {
    constructor(title: String) :
            this(null, title, LocalDateTime.now(), null, mutableListOf(), EntryState.CREATED)

    /**
     * Default no-arg constructor is required by hibernate. Values are set to null/empty and are
     * replaced by Hibernate with the actual database values later.
     */
    constructor() : this("")
}
