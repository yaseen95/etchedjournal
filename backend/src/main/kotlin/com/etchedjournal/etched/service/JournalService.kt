package com.etchedjournal.etched.service

import com.etchedjournal.etched.models.entity.JournalEntity

interface JournalService {

    fun getJournal(id: String): JournalEntity

    fun getJournals(): List<JournalEntity>

    fun create(content: ByteArray): JournalEntity

    fun exists(id: String): Boolean
}
