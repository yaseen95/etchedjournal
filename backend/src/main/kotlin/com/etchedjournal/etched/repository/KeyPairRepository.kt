package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.models.jooq.generated.tables.records.KeyPairRecord
import org.springframework.stereotype.Repository

@Repository
class KeyPairRepository {

    fun findById(txn: Transaction, id: String): KeyPair? {
        return txn.dslCtx.selectFrom(Tables.KEY_PAIR)
            .where(Tables.KEY_PAIR.ID.eq(id))
            .fetchOne()
            ?.into(KeyPair::class.java)
    }

    fun create(txn: Transaction, keyPair: KeyPair): KeyPair {
        val record: KeyPairRecord = txn.dslCtx.newRecord(Tables.KEY_PAIR)
        record.from(keyPair)
        record.insert()
        return record.into(KeyPair::class.java)
    }

    fun fetchByOwner(txn: Transaction, owner: String): List<KeyPair> {
        return txn.dslCtx.selectFrom(Tables.KEY_PAIR)
            .where(Tables.KEY_PAIR.OWNER.eq(owner))
            // Specifying the order to get deterministic results
            // If not, postgres will return the rows that it can produce the fastest
            // https://www.postgresql.org/docs/10/sql-select.html
            .orderBy(Tables.KEY_PAIR.ID.asc())
            .fetch()
            .into(KeyPair::class.java)
    }
}
