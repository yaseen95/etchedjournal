package com.etchedjournal.etched.repository

import com.etchedjournal.etched.service.exception.ClientException
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.jooq.SQLDialect
import org.jooq.conf.Settings
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import java.sql.Connection
import javax.sql.DataSource

class TxnHelperTest {

    private lateinit var dataSource: DataSource
    private lateinit var sqlDialect: SQLDialect
    private lateinit var settings: Settings
    private lateinit var txnHelper: TxnHelper
    private lateinit var connectionMock: Connection

    @Before
    fun setup() {
        connectionMock = mock()
        dataSource = mock()
        whenever(dataSource.getConnection()).thenReturn(connectionMock)

        sqlDialect = SQLDialect.POSTGRES_10
        settings = Settings()
        txnHelper = TxnHelper(dataSource, settings, sqlDialect)
    }

    @Test
    fun `txns don't auto commit`() {
        txnHelper.execute { /* do nothing */ }
        verify(connectionMock, times(1)).setAutoCommit(false)
    }

    @Test
    fun `execute commits txn`() {
        txnHelper.execute { /*do nothing*/ }
        verify(connectionMock, times(1)).commit()
        verify(connectionMock, times(1)).close()
        verify(connectionMock, never()).rollback()
    }

    @Test
    fun `rolls back txn when exception is thrown`() {
        try {
            txnHelper.execute {
                throw RuntimeException("foobar")
            }
        } catch (expected: RuntimeException) {
        }
        verify(connectionMock, times(1)).rollback()
        verify(connectionMock, never()).commit()
    }

    @Test
    fun `rethrows client exceptions and rolls back`() {
        try {
            txnHelper.execute {
                throw ClientException(message = "client error")
            }
        } catch (e: ClientException) {
            assertEquals("client error", e.message)
        }
        verify(connectionMock, times(1)).rollback()
        verify(connectionMock, never()).commit()
    }
}
