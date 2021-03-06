/*
 * This file is generated by jOOQ.
 */
package com.etchedjournal.etched.models.jooq.generated.tables;


import com.etchedjournal.etched.models.OwnerType;
import com.etchedjournal.etched.models.Schema;
import com.etchedjournal.etched.models.jooq.converter.IdConverter;
import com.etchedjournal.etched.models.jooq.converter.InstantConverter;
import com.etchedjournal.etched.models.jooq.converter.OwnerTypeConverter;
import com.etchedjournal.etched.models.jooq.converter.SchemaConverter;
import com.etchedjournal.etched.models.jooq.generated.Indexes;
import com.etchedjournal.etched.models.jooq.generated.Keys;
import com.etchedjournal.etched.models.jooq.generated.Public;
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Index;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.UniqueKey;
import org.jooq.impl.DSL;
import org.jooq.impl.TableImpl;


/**
 * This class is generated by jOOQ.
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.11.9"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Journal extends TableImpl<JournalRecord> {

    private static final long serialVersionUID = 1967544142;

    /**
     * The reference instance of <code>public.journal</code>
     */
    public static final Journal JOURNAL = new Journal();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<JournalRecord> getRecordType() {
        return JournalRecord.class;
    }

    /**
     * The column <code>public.journal.id</code>.
     */
    public final TableField<JournalRecord, String> ID = createField("id", org.jooq.impl.SQLDataType.BIGINT.nullable(false), this, "", new IdConverter());

    /**
     * The column <code>public.journal.created</code>.
     */
    public final TableField<JournalRecord, Instant> CREATED = createField("created", org.jooq.impl.SQLDataType.TIMESTAMP.nullable(false), this, "", new InstantConverter());

    /**
     * The column <code>public.journal.modified</code>.
     */
    public final TableField<JournalRecord, Instant> MODIFIED = createField("modified", org.jooq.impl.SQLDataType.TIMESTAMP.nullable(false), this, "", new InstantConverter());

    /**
     * The column <code>public.journal.content</code>.
     */
    public final TableField<JournalRecord, byte[]> CONTENT = createField("content", org.jooq.impl.SQLDataType.BLOB.nullable(false), this, "");

    /**
     * The column <code>public.journal.owner</code>.
     */
    public final TableField<JournalRecord, String> OWNER = createField("owner", org.jooq.impl.SQLDataType.VARCHAR(60).nullable(false), this, "");

    /**
     * The column <code>public.journal.owner_type</code>.
     */
    public final TableField<JournalRecord, OwnerType> OWNER_TYPE = createField("owner_type", org.jooq.impl.SQLDataType.CHAR(1).nullable(false), this, "", new OwnerTypeConverter());

    /**
     * The column <code>public.journal.key_pair_id</code>.
     */
    public final TableField<JournalRecord, String> KEY_PAIR_ID = createField("key_pair_id", org.jooq.impl.SQLDataType.BIGINT.nullable(false), this, "", new IdConverter());

    /**
     * The column <code>public.journal.version</code>.
     */
    public final TableField<JournalRecord, Integer> VERSION = createField("version", org.jooq.impl.SQLDataType.INTEGER.nullable(false), this, "");

    /**
     * The column <code>public.journal.schema</code>.
     */
    public final TableField<JournalRecord, Schema> SCHEMA = createField("schema", org.jooq.impl.SQLDataType.SMALLINT.nullable(false), this, "", new SchemaConverter());

    /**
     * Create a <code>public.journal</code> table reference
     */
    public Journal() {
        this(DSL.name("journal"), null);
    }

    /**
     * Create an aliased <code>public.journal</code> table reference
     */
    public Journal(String alias) {
        this(DSL.name(alias), JOURNAL);
    }

    /**
     * Create an aliased <code>public.journal</code> table reference
     */
    public Journal(Name alias) {
        this(alias, JOURNAL);
    }

    private Journal(Name alias, Table<JournalRecord> aliased) {
        this(alias, aliased, null);
    }

    private Journal(Name alias, Table<JournalRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, DSL.comment(""));
    }

    public <O extends Record> Journal(Table<O> child, ForeignKey<O, JournalRecord> key) {
        super(child, key, JOURNAL);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public org.jooq.Schema getSchema() {
        return Public.PUBLIC;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Index> getIndexes() {
        return Arrays.<Index>asList(Indexes.JOURNAL_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<JournalRecord> getPrimaryKey() {
        return Keys.JOURNAL_PKEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<JournalRecord>> getKeys() {
        return Arrays.<UniqueKey<JournalRecord>>asList(Keys.JOURNAL_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<ForeignKey<JournalRecord, ?>> getReferences() {
        return Arrays.<ForeignKey<JournalRecord, ?>>asList(Keys.JOURNAL__JOURNAL_KEY_PAIR_ID_FKEY);
    }

    public KeyPair keyPair() {
        return new KeyPair(this, Keys.JOURNAL__JOURNAL_KEY_PAIR_ID_FKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public TableField<JournalRecord, Integer> getRecordVersion() {
        return VERSION;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Journal as(String alias) {
        return new Journal(DSL.name(alias), this);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Journal as(Name alias) {
        return new Journal(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public Journal rename(String name) {
        return new Journal(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public Journal rename(Name name) {
        return new Journal(name, null);
    }
}
