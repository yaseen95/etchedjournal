package com.etchedjournal.etched.api

import com.etchedjournal.etched.dto.EntryRequest
import com.etchedjournal.etched.entity.Entry

interface EntryService {

    fun getEntry(entryId: Long): Entry

    fun getEntries(): List<Entry>

    // TODO: Using an EntryRequest seems inelegant
    fun create(entry: EntryRequest): Entry
}
