package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import org.springframework.stereotype.Repository

@Repository
class EntryRepository {

    fun findById(txn: Transaction, id: String): Entry? {
        return txn.dslCtx.selectFrom(Tables.ENTRY)
            .where(Tables.ENTRY.ID.eq(id))
            .fetchOne()
            ?.into(Entry::class.java)
    }

    fun create(txn: Transaction, entry: Entry): Entry {
        val record: EntryRecord = txn.dslCtx.newRecord(Tables.ENTRY)
        record.from(entry)
        record.insert()
        return record.into(Entry::class.java)
    }

    fun fetchByJournal(txn: Transaction, journalId: String): List<Entry> {
        return txn.dslCtx.selectFrom(Tables.ENTRY)
            .where(Tables.ENTRY.JOURNAL_ID.eq(journalId))
            .orderBy(Tables.ENTRY.ID.asc())
            .fetch()
            .into(Entry::class.java)
    }
}
