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
import javax.persistence.Table

/**
 * A new 'etch' in the Journal Entry
 *
 * @param id: id of the etch
 * @param timestamp: timestamp of the etch
 * @param position: used to order etches
 * @param content: the etch content (encrypted client side)
 * @param contentKey: the key used to encrypt the etch (encrypted by master key and initVector)
 * @param contentIv: the iv used to encrypt the etch (encrypted by master key and initVector)
 * @param initVector: the iv used to encrypt the contentKey and contentIv
 */
@Entity
@Table(name = "etches")
data class Etch(
        /**
         * This is only null when creating an entry. When retrieved by the database safe to
         * assume non-null
         */
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

        @Column(nullable = false, name = "content_key")
        val contentKey: String,

        @Column(nullable = false, name = "content_iv")
        val contentIv: String,

        @Column(nullable = false, name = "init_vector")
        val initVector: String,

        @ManyToOne
        @JoinColumn(name = "entry_id")
        @JsonIgnore
        var entry: Entry?
) {
    constructor(content: String, position: Int?, contentKey: String, contentIv: String,
                initVector: String, entry: Entry?) : this(null, LocalDateTime.now(), position,
            content, contentKey, contentIv, initVector, entry)

    // Setting these values to Empty to remove the val is None error. This is just for Hibernate.
    constructor() : this("", null, "", "", "", null)
}
