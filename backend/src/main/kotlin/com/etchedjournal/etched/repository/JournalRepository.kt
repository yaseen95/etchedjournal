package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import org.springframework.stereotype.Repository

@Repository
class JournalRepository {

    fun findById(txn: Transaction, id: String): JournalRecord? {
        return txn.dslCtx.selectFrom(Tables.JOURNAL)
            .where(Tables.JOURNAL.ID.eq(id))
            .fetchOne()
    }

    fun create(txn: Transaction, journal: Journal): JournalRecord {
        val record: JournalRecord = txn.dslCtx.newRecord(Tables.JOURNAL)
        record.from(journal)
        record.insert()
        return record
    }

    fun fetchByOwner(txn: Transaction, owner: String): List<JournalRecord> {
        return txn.dslCtx.selectFrom(Tables.JOURNAL)
            .where(Tables.JOURNAL.OWNER.eq(owner))
            // Specifying the order to get deterministic results
            // If not, postgres will return the rows that it can produce the fastest
            // https://www.postgresql.org/docs/10/sql-select.html
            .orderBy(Tables.JOURNAL.ID.asc())
            .fetch()
    }

    fun update(txn: Transaction, journal: JournalRecord): JournalRecord {
        val oldVersion = journal.version
        journal.store()
        assert(oldVersion + 1 == journal.version)
        return journal
    }
}
