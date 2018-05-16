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
import javax.validation.constraints.NotNull

/**
 * A new 'etch' in the Journal Entry
 *
 * @param id: id of the etch
 * @param timestamp: timestamp of the etch
 * @param position: used to order etches
 * @param content: the etch content (encrypted client side)
 * @param contentKey: the key used to encrypt the etch (this is itself encrypted by master key and keyIv)
 * @param contentIv: the iv used to encrypt the etch (this is itself encrypted by master key and ivIv)
 * @param keyIv: the iv used to encrypt the contentKey
 * @param ivIv: the iv used to encrypt the contentIv
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

        // Have to set this to var, because Jackson can't read the default value.
        // TODO: File a bug report possibly?
        @Column(nullable = false)
        var timestamp: Instant = Instant.now(),

        // TODO: Do we need to store a position???
        @Column(nullable = false)
        @field:NotNull
        val position: Int?,

        @Column(nullable = false)
        @field:NotNull
        val content: String,

        @Column(nullable = false, name = "content_key")
        @field:NotNull
        val contentKey: String,

        @Column(nullable = false, name = "content_iv")
        @field:NotNull
        val contentIv: String,

        @Column(nullable = false, name = "key_iv")
        @field:NotNull
        val keyIv: String,

        @Column(nullable = false, name = "iv_iv")
        @field:NotNull
        val ivIv: String,

        // TODO: Store HMAC

        // TODO: Should we store encryption details?
        // Would we ever want custom encryption options e.g. different AES modes, key sizes, etc.

        @ManyToOne
        @JoinColumn(name = "entry_id")
        @JsonIgnore
        var entry: Entry?
)
