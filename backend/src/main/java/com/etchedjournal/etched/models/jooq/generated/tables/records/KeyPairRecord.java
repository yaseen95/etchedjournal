/*
 * This file is generated by jOOQ.
 */
package com.etchedjournal.etched.models.jooq.generated.tables.records;


import com.etchedjournal.etched.models.OwnerType;
import com.etchedjournal.etched.models.jooq.generated.tables.KeyPair;

import java.time.Instant;

import javax.annotation.Generated;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record9;
import org.jooq.Row9;
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
public class KeyPairRecord extends UpdatableRecordImpl<KeyPairRecord> implements Record9<String, Instant, byte[], byte[], String, OwnerType, String, Integer, Integer> {

    private static final long serialVersionUID = -1616303021;

    /**
     * Setter for <code>public.key_pair.id</code>.
     */
    public KeyPairRecord setId(String value) {
        set(0, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.id</code>.
     */
    @NotNull
    public String getId() {
        return (String) get(0);
    }

    /**
     * Setter for <code>public.key_pair.timestamp</code>.
     */
    public KeyPairRecord setTimestamp(Instant value) {
        set(1, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.timestamp</code>.
     */
    @NotNull
    public Instant getTimestamp() {
        return (Instant) get(1);
    }

    /**
     * Setter for <code>public.key_pair.public_key</code>.
     */
    public KeyPairRecord setPublicKey(byte... value) {
        set(2, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.public_key</code>.
     */
    @NotNull
    public byte[] getPublicKey() {
        return (byte[]) get(2);
    }

    /**
     * Setter for <code>public.key_pair.private_key</code>.
     */
    public KeyPairRecord setPrivateKey(byte... value) {
        set(3, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.private_key</code>.
     */
    @NotNull
    public byte[] getPrivateKey() {
        return (byte[]) get(3);
    }

    /**
     * Setter for <code>public.key_pair.owner</code>.
     */
    public KeyPairRecord setOwner(String value) {
        set(4, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.owner</code>.
     */
    @NotNull
    @Size(max = 60)
    public String getOwner() {
        return (String) get(4);
    }

    /**
     * Setter for <code>public.key_pair.owner_type</code>.
     */
    public KeyPairRecord setOwnerType(OwnerType value) {
        set(5, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.owner_type</code>.
     */
    @NotNull
    public OwnerType getOwnerType() {
        return (OwnerType) get(5);
    }

    /**
     * Setter for <code>public.key_pair.salt</code>.
     */
    public KeyPairRecord setSalt(String value) {
        set(6, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.salt</code>.
     */
    @NotNull
    @Size(max = 22)
    public String getSalt() {
        return (String) get(6);
    }

    /**
     * Setter for <code>public.key_pair.iterations</code>.
     */
    public KeyPairRecord setIterations(Integer value) {
        set(7, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.iterations</code>.
     */
    @NotNull
    public Integer getIterations() {
        return (Integer) get(7);
    }

    /**
     * Setter for <code>public.key_pair.version</code>.
     */
    public KeyPairRecord setVersion(Integer value) {
        set(8, value);
        return this;
    }

    /**
     * Getter for <code>public.key_pair.version</code>.
     */
    @NotNull
    public Integer getVersion() {
        return (Integer) get(8);
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
    // Record9 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row9<String, Instant, byte[], byte[], String, OwnerType, String, Integer, Integer> fieldsRow() {
        return (Row9) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row9<String, Instant, byte[], byte[], String, OwnerType, String, Integer, Integer> valuesRow() {
        return (Row9) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return KeyPair.KEY_PAIR.ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Instant> field2() {
        return KeyPair.KEY_PAIR.TIMESTAMP;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<byte[]> field3() {
        return KeyPair.KEY_PAIR.PUBLIC_KEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<byte[]> field4() {
        return KeyPair.KEY_PAIR.PRIVATE_KEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field5() {
        return KeyPair.KEY_PAIR.OWNER;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<OwnerType> field6() {
        return KeyPair.KEY_PAIR.OWNER_TYPE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field7() {
        return KeyPair.KEY_PAIR.SALT;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field8() {
        return KeyPair.KEY_PAIR.ITERATIONS;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field9() {
        return KeyPair.KEY_PAIR.VERSION;
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
        return getPublicKey();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public byte[] component4() {
        return getPrivateKey();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component5() {
        return getOwner();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public OwnerType component6() {
        return getOwnerType();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component7() {
        return getSalt();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer component8() {
        return getIterations();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer component9() {
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
        return getPublicKey();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public byte[] value4() {
        return getPrivateKey();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value5() {
        return getOwner();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public OwnerType value6() {
        return getOwnerType();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value7() {
        return getSalt();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value8() {
        return getIterations();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value9() {
        return getVersion();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value1(String value) {
        setId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value2(Instant value) {
        setTimestamp(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value3(byte... value) {
        setPublicKey(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value4(byte... value) {
        setPrivateKey(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value5(String value) {
        setOwner(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value6(OwnerType value) {
        setOwnerType(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value7(String value) {
        setSalt(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value8(Integer value) {
        setIterations(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord value9(Integer value) {
        setVersion(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyPairRecord values(String value1, Instant value2, byte[] value3, byte[] value4, String value5, OwnerType value6, String value7, Integer value8, Integer value9) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        value6(value6);
        value7(value7);
        value8(value8);
        value9(value9);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached KeyPairRecord
     */
    public KeyPairRecord() {
        super(KeyPair.KEY_PAIR);
    }

    /**
     * Create a detached, initialised KeyPairRecord
     */
    public KeyPairRecord(String id, Instant timestamp, byte[] publicKey, byte[] privateKey, String owner, OwnerType ownerType, String salt, Integer iterations, Integer version) {
        super(KeyPair.KEY_PAIR);

        set(0, id);
        set(1, timestamp);
        set(2, publicKey);
        set(3, privateKey);
        set(4, owner);
        set(5, ownerType);
        set(6, salt);
        set(7, iterations);
        set(8, version);
    }
}