package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import org.springframework.stereotype.Repository

@Repository
class EtchRepository {

    fun fetchByEntryId(txn: Transaction, entryId: String): List<Etch> {
        return txn.dslCtx.selectFrom(Tables.ETCH)
            .where(Tables.ETCH.ENTRY_ID.eq(entryId))
            .orderBy(Tables.ETCH.ID.asc())
            .fetch()
            .into(Etch::class.java)
    }

    fun findById(txn: Transaction, id: String): Etch? {
        return txn.dslCtx.selectFrom(Tables.ETCH)
            .where(Tables.ETCH.ID.eq(id))
            .fetchOne()
            ?.into(Etch::class.java)
    }

    fun createEtches(txn: Transaction, etches: List<Etch>): List<Etch> {
        return etches.map {
            // Can't use batchInsert due to version issues
            // https://github.com/jOOQ/jOOQ/issues/8283
            val r = txn.dslCtx.newRecord(Tables.ETCH)
            r.from(it)
            r.insert()
            r.into(Etch::class.java)
        }
    }
}
