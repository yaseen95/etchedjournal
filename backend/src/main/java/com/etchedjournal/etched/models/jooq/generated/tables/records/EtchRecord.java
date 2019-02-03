/*
 * This file is generated by jOOQ.
 */
package com.etchedjournal.etched.models.jooq.generated.tables.records;


import com.etchedjournal.etched.models.OwnerType;
import com.etchedjournal.etched.models.jooq.generated.tables.Etch;

import java.time.Instant;

import javax.annotation.Generated;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record8;
import org.jooq.Row8;
import org.jooq.impl.UpdatableRecordImpl;


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
public class EtchRecord extends UpdatableRecordImpl<EtchRecord> implements Record8<String, Instant, byte[], String, OwnerType, String, String, Integer> {

    private static final long serialVersionUID = 1669805269;

    /**
     * Setter for <code>public.etch.id</code>.
     */
    public EtchRecord setId(String value) {
        set(0, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.id</code>.
     */
    @NotNull
    public String getId() {
        return (String) get(0);
    }

    /**
     * Setter for <code>public.etch.timestamp</code>.
     */
    public EtchRecord setTimestamp(Instant value) {
        set(1, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.timestamp</code>.
     */
    @NotNull
    public Instant getTimestamp() {
        return (Instant) get(1);
    }

    /**
     * Setter for <code>public.etch.content</code>.
     */
    public EtchRecord setContent(byte... value) {
        set(2, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.content</code>.
     */
    @NotNull
    public byte[] getContent() {
        return (byte[]) get(2);
    }

    /**
     * Setter for <code>public.etch.owner</code>.
     */
    public EtchRecord setOwner(String value) {
        set(3, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.owner</code>.
     */
    @NotNull
    @Size(max = 60)
    public String getOwner() {
        return (String) get(3);
    }

    /**
     * Setter for <code>public.etch.owner_type</code>.
     */
    public EtchRecord setOwnerType(OwnerType value) {
        set(4, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.owner_type</code>.
     */
    @NotNull
    public OwnerType getOwnerType() {
        return (OwnerType) get(4);
    }

    /**
     * Setter for <code>public.etch.entry_id</code>.
     */
    public EtchRecord setEntryId(String value) {
        set(5, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.entry_id</code>.
     */
    @NotNull
    public String getEntryId() {
        return (String) get(5);
    }

    /**
     * Setter for <code>public.etch.key_pair_id</code>.
     */
    public EtchRecord setKeyPairId(String value) {
        set(6, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.key_pair_id</code>.
     */
    @NotNull
    public String getKeyPairId() {
        return (String) get(6);
    }

    /**
     * Setter for <code>public.etch.version</code>.
     */
    public EtchRecord setVersion(Integer value) {
        set(7, value);
        return this;
    }

    /**
     * Getter for <code>public.etch.version</code>.
     */
    @NotNull
    public Integer getVersion() {
        return (Integer) get(7);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Record1<String> key() {
        return (Record1) super.key();
    }

    // -------------------------------------------------------------------------
    // Record8 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row8<String, Instant, byte[], String, OwnerType, String, String, Integer> fieldsRow() {
        return (Row8) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row8<String, Instant, byte[], String, OwnerType, String, String, Integer> valuesRow() {
        return (Row8) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return Etch.ETCH.ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Instant> field2() {
        return Etch.ETCH.TIMESTAMP;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<byte[]> field3() {
        return Etch.ETCH.CONTENT;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field4() {
        return Etch.ETCH.OWNER;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<OwnerType> field5() {
        return Etch.ETCH.OWNER_TYPE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field6() {
        return Etch.ETCH.ENTRY_ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field7() {
        return Etch.ETCH.KEY_PAIR_ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field8() {
        return Etch.ETCH.VERSION;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component1() {
        return getId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Instant component2() {
        return getTimestamp();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public byte[] component3() {
        return getContent();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component4() {
        return getOwner();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public OwnerType component5() {
        return getOwnerType();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component6() {
        return getEntryId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component7() {
        return getKeyPairId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer component8() {
        return getVersion();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value1() {
        return getId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Instant value2() {
        return getTimestamp();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public byte[] value3() {
        return getContent();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value4() {
        return getOwner();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public OwnerType value5() {
        return getOwnerType();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value6() {
        return getEntryId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value7() {
        return getKeyPairId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value8() {
        return getVersion();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value1(String value) {
        setId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value2(Instant value) {
        setTimestamp(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value3(byte... value) {
        setContent(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value4(String value) {
        setOwner(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value5(OwnerType value) {
        setOwnerType(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value6(String value) {
        setEntryId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value7(String value) {
        setKeyPairId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord value8(Integer value) {
        setVersion(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public EtchRecord values(String value1, Instant value2, byte[] value3, String value4, OwnerType value5, String value6, String value7, Integer value8) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        value6(value6);
        value7(value7);
        value8(value8);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached EtchRecord
     */
    public EtchRecord() {
        super(Etch.ETCH);
    }

    /**
     * Create a detached, initialised EtchRecord
     */
    public EtchRecord(String id, Instant timestamp, byte[] content, String owner, OwnerType ownerType, String entryId, String keyPairId, Integer version) {
        super(Etch.ETCH);

        set(0, id);
        set(1, timestamp);
        set(2, content);
        set(3, owner);
        set(4, ownerType);
        set(5, entryId);
        set(6, keyPairId);
        set(7, version);
    }
}
