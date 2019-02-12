package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import org.jooq.DSLContext
import org.springframework.stereotype.Repository

@Repository
class EntryRepository(private val dslContext: DSLContext) {

    fun findById(id: String): Entry? {
        return dslContext.selectFrom(Tables.ENTRY)
            .where(Tables.ENTRY.ID.eq(id))
            .fetchOne()
            ?.into(Entry::class.java)
    }

    fun create(entry: Entry): Entry {
        val record: EntryRecord = dslContext.newRecord(Tables.ENTRY)
        record.from(entry)
        record.insert()
        return record.into(Entry::class.java)
    }

    fun fetchByJournal(journalId: String): List<Entry> {
        return dslContext.selectFrom(Tables.ENTRY)
            .where(Tables.ENTRY.JOURNAL_ID.eq(journalId))
            .orderBy(Tables.ENTRY.ID.asc())
            .fetch()
            .into(Entry::class.java)
    }

}
