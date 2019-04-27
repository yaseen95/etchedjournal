package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import org.springframework.stereotype.Repository

@Repository
class JournalRepository {

    fun findById(txn: Transaction, id: String): Journal? {
        return txn.dslCtx.selectFrom(Tables.JOURNAL)
            .where(Tables.JOURNAL.ID.eq(id))
            .fetchOne()
            ?.into(Journal::class.java)
    }

    fun create(txn: Transaction, journal: Journal): Journal {
        val record: JournalRecord = txn.dslCtx.newRecord(Tables.JOURNAL)
        record.from(journal)
        record.insert()
        return record.into(Journal::class.java)
    }

    fun fetchByOwner(txn: Transaction, owner: String): List<Journal> {
        return txn.dslCtx.selectFrom(Tables.JOURNAL)
            .where(Tables.JOURNAL.OWNER.eq(owner))
            // Specifying the order to get deterministic results
            // If not, postgres will return the rows that it can produce the fastest
            // https://www.postgresql.org/docs/10/sql-select.html
            .orderBy(Tables.JOURNAL.ID.asc())
            .fetch()
            .into(Journal::class.java)
    }
}
