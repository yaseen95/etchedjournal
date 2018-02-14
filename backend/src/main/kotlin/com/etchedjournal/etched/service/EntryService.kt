package com.etchedjournal.etched.service

import com.etchedjournal.etched.entity.Entry

interface EntryService {

    fun getEntry(entryId: Long): Entry

    fun getEntries(): List<Entry>

    fun create(title: String): Entry
}
