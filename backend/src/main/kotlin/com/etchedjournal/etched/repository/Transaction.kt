package com.etchedjournal.etched.repository

import org.jooq.DSLContext
import java.sql.Connection

open class Transaction(val dslCtx: DSLContext, private val conn: Connection) {
    open fun commit() {
        conn.commit()
        conn.close()
    }

    open fun rollback() {
        conn.rollback()
        conn.close()
    }
}
