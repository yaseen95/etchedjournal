package com.etchedjournal.etched.repository

import com.etchedjournal.etched.entity.Etch
import org.springframework.data.repository.CrudRepository

interface EtchRepository : CrudRepository<Etch, Long>
