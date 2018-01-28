package com.etchedjournal.etched.repository

import com.etchedjournal.etched.entity.Entry
import org.springframework.data.repository.CrudRepository

interface EntryRepository: CrudRepository<Entry, Long>
