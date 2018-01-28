package com.etchedjournal.etched.entity

import java.time.LocalDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

/**
 * A new 'etch' in the Journal Entry
 *
 * @param id: id of the etch
 * @param timestamp: timestamp of the etch
 * @param position: used to order etches
 * @param content: the etch content (encrypted client side)
 */
@Entity
@Table(name = "etches")
data class Etch(
        @Id
        @Column(nullable = false, name = "etch_id")
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long?,

        @Column(nullable = false)
        val timestamp: LocalDateTime,

        // TODO: Do we need to store a position???
        @Column(nullable = false)
        val position: Int?,

        @Column(nullable = false)
        val content: String,

        @ManyToOne
        @JoinColumn(name = "entry_id")
        val entry: Entry?
) {
    constructor(content: String, position: Int?, entry: Entry?) : this(null, LocalDateTime.now(),
            position, content, entry)

    constructor(): this("", null, null)
}
