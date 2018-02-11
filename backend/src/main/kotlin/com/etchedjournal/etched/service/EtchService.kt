package com.etchedjournal.etched.service

import com.etchedjournal.etched.entity.Etch

interface EtchService {
    fun getEtches(entryId: Long): List<Etch>

    fun getEtch(entryId: Long, etchId: Long): Etch

    fun create(entryId: Long, etch: Etch): Etch
}
