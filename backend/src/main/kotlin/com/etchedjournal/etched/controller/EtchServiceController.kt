package com.etchedjournal.etched.controller

import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.service.EtchService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/entries/entry/{entryId}/etches")
@RestController
class EtchServiceController {

    @Autowired
    private lateinit var etchService: EtchService

    @RequestMapping("", method = [RequestMethod.GET])
    fun getEtches(@PathVariable entryId: Long): List<Etch> {
        return etchService.getEtches(entryId)
    }

    @RequestMapping("/etch/{etchId}", method = [RequestMethod.GET])
    fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        return etchService.getEtch(entryId, etchId)
    }

    @RequestMapping("/etch", method = [RequestMethod.POST])
    fun create(@PathVariable entryId: Long, @RequestBody etch: Etch): Etch {
        return etchService.create(entryId, etch)
    }
}
