/*
 * This file is generated by jOOQ.
 */
package com.etchedjournal.etched.models.jooq.generated.tables;


import com.etchedjournal.etched.models.OwnerType;
import com.etchedjournal.etched.models.jooq.converter.IdConverter;
import com.etchedjournal.etched.models.jooq.converter.InstantConverter;
import com.etchedjournal.etched.models.jooq.converter.OwnerTypeConverter;
import com.etchedjournal.etched.models.jooq.generated.Indexes;
import com.etchedjournal.etched.models.jooq.generated.Keys;
import com.etchedjournal.etched.models.jooq.generated.Public;
import com.etchedjournal.etched.models.jooq.generated.tables.records.KeyPairRecord;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Index;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Schema;
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
public class KeyPair extends TableImpl<KeyPairRecord> {

    private static final long serialVersionUID = 695988488;

    /**
     * The reference instance of <code>public.key_pair</code>
     */
    public static final KeyPair KEY_PAIR = new KeyPair();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<KeyPairRecord> getRecordType() {
        return KeyPairRecord.class;
    }

    /**
     * The column <code>public.key_pair.id</code>.
     */
    public final TableField<KeyPairRecord, String> ID = createField("id", org.jooq.impl.SQLDataType.BIGINT.nullable(false), this, "", new IdConverter());

    /**
     * The column <code>public.key_pair.created</code>.
     */
    public final TableField<KeyPairRecord, Instant> CREATED = createField("created", org.jooq.impl.SQLDataType.TIMESTAMP.nullable(false), this, "", new InstantConverter());

    /**
     * The column <code>public.key_pair.public_key</code>.
     */
    public final TableField<KeyPairRecord, byte[]> PUBLIC_KEY = createField("public_key", org.jooq.impl.SQLDataType.BLOB.nullable(false), this, "");

    /**
     * The column <code>public.key_pair.private_key</code>.
     */
    public final TableField<KeyPairRecord, byte[]> PRIVATE_KEY = createField("private_key", org.jooq.impl.SQLDataType.BLOB.nullable(false), this, "");

    /**
     * The column <code>public.key_pair.owner</code>.
     */
    public final TableField<KeyPairRecord, String> OWNER = createField("owner", org.jooq.impl.SQLDataType.VARCHAR(60).nullable(false), this, "");

    /**
     * The column <code>public.key_pair.owner_type</code>.
     */
    public final TableField<KeyPairRecord, OwnerType> OWNER_TYPE = createField("owner_type", org.jooq.impl.SQLDataType.CHAR(1).nullable(false), this, "", new OwnerTypeConverter());

    /**
     * The column <code>public.key_pair.salt</code>.
     */
    public final TableField<KeyPairRecord, String> SALT = createField("salt", org.jooq.impl.SQLDataType.VARCHAR(22).nullable(false), this, "");

    /**
     * The column <code>public.key_pair.iterations</code>.
     */
    public final TableField<KeyPairRecord, Integer> ITERATIONS = createField("iterations", org.jooq.impl.SQLDataType.INTEGER.nullable(false), this, "");

    /**
     * The column <code>public.key_pair.version</code>.
     */
    public final TableField<KeyPairRecord, Integer> VERSION = createField("version", org.jooq.impl.SQLDataType.INTEGER.nullable(false), this, "");

    /**
     * Create a <code>public.key_pair</code> table reference
     */
    public KeyPair() {
        this(DSL.name("key_pair"), null);
    }

    /**
     * Create an aliased <code>public.key_pair</code> table reference
     */
    public KeyPair(String alias) {
        this(DSL.name(alias), KEY_PAIR);
    }

    /**
     * Create an aliased <code>public.key_pair</code> table reference
     */
    public KeyPair(Name alias) {
        this(alias, KEY_PAIR);
    }

    private KeyPair(Name alias, Table<KeyPairRecord> aliased) {
        this(alias, aliased, null);
    }

    private KeyPair(Name alias, Table<KeyPairRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, DSL.comment(""));
    }

    public <O extends Record> KeyPair(Table<O> child, ForeignKey<O, KeyPairRecord> key) {
        super(child, key, KEY_PAIR);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Schema getSchema() {
        return Public.PUBLIC;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Index> getIndexes() {
        return Arrays.<Index>asList(Indexes.KEY_PAIR_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<KeyPairRecord> getPrimaryKey() {
        return Keys.KEY_PAIR_PKEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<KeyPairRecord>> getKeys() {
        return Arrays.<UniqueKey<KeyPairRecord>>asList(Keys.KEY_PAIR_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public TableField<KeyPairRecord, Integer> getRecordVersion() {
        return VERSION;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPair as(String alias) {
        return new KeyPair(DSL.name(alias), this);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPair as(Name alias) {
        return new KeyPair(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public KeyPair rename(String name) {
        return new KeyPair(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public KeyPair rename(Name name) {
        return new KeyPair(name, null);
    }
}
