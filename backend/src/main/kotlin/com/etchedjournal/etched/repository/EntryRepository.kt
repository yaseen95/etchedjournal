package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import org.springframework.stereotype.Repository

@Repository
class EntryRepository {

    fun findById(txn: Transaction, id: String): EntryRecord? {
        return txn.dslCtx.selectFrom(Tables.ENTRY)
            .where(Tables.ENTRY.ID.eq(id))
            .fetchOne()
    }

    fun create(txn: Transaction, entry: Entry): EntryRecord {
        val record: EntryRecord = txn.dslCtx.newRecord(Tables.ENTRY)
        record.from(entry)
        record.insert()
        return record
    }

    fun fetchByJournal(txn: Transaction, journalId: String): List<EntryRecord> {
        return txn.dslCtx.selectFrom(Tables.ENTRY)
            .where(Tables.ENTRY.JOURNAL_ID.eq(journalId))
            .orderBy(Tables.ENTRY.ID.asc())
            .fetch()
    }

    fun update(txn: Transaction, entry: EntryRecord): EntryRecord {
        val oldVersion = entry.version
        entry.store()
        assert(oldVersion + 1 == entry.version)
        return entry
    }
}
