package com.etchedjournal.etched.repository

import com.etchedjournal.etched.service.exception.ClientException
import com.etchedjournal.etched.service.exception.ServerException
import org.jooq.SQLDialect
import org.jooq.conf.Settings
import org.jooq.impl.DSL
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.sql.Connection
import javax.sql.DataSource

@Component
class TxnHelper(
    private val dataSource: DataSource,
    private val settings: Settings,
    private val sqlDialect: SQLDialect
) {

    fun <R> execute(fn: (txn: Transaction) -> R): R {
        val txn = beginTxn()
        val result: R
        try {
            result = fn(txn)
        } catch (e: ClientException) {
            // TODO: Remove this log message
            logger.info("Rolling back current txn due to {}: {}", e::class.java.simpleName,
                e.logMessage)
            txn.rollback()
            throw e
        } catch (e: RuntimeException) {
            logger.error("Rolling back current txn due to {}: {}", e::class.java.simpleName, e)
            txn.rollback()
            throw e
        }
        // TODO: Should we capture `Exception`?

        try {
            logger.info("Committing txn")
            txn.commit()
        } catch (e: Exception) {
            logger.error("Failed to commit txn", e)
            throw ServerException(logMessage = e.message, cause = e)
        }
        return result
    }

    fun beginTxn(): Transaction {
        // Based off of https://github.com/aaberg/sql2o/blob/b5d5304313a9a78e284f3bfcde539c50347a62f8/core/src/main/java/org/sql2o/Sql2o.java#L284-L311
        val conn = dataSource.connection
        conn.autoCommit = false
        conn.transactionIsolation = Connection.TRANSACTION_SERIALIZABLE
        val ctx = DSL.using(conn, sqlDialect, settings)
        return Transaction(ctx, conn)
    }

    companion object {
        private val logger = LoggerFactory.getLogger(TxnHelper::class.java)
    }
}
