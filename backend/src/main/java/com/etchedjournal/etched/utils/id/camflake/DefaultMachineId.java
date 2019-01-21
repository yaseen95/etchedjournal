package com.etchedjournal.etched.utils.id.camflake;

// Copy pasted from
// https://github.com/cam-inc/camflake/blob/develop/camflake/src/main/java/com/camobile/camflake/DefaultMachineId.java
// Has been slightly modified

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Generates Machine ID from latter 16-bits of the host's IP address.
 */
class DefaultMachineId implements MachineId {

    /**
     * Logger.
     */
    private static Logger log = LoggerFactory.getLogger(MachineId.class);

    @Override
    public int getId() {
        try {
            // Uses last two octets to identify worker id
            byte[] a = InetAddress.getLocalHost().getAddress();
            log.info("localhost IP address: {}", InetAddress.getLocalHost().getHostAddress());

            int machineId = (Byte.toUnsignedInt(a[2]))<<8 | Byte.toUnsignedInt(a[3]);
            log.info("calculated machineID: {}", machineId);
            return machineId;

        } catch (UnknownHostException e) {
            String message = "Failed to process machine id.";
            log.error(message, e);
            throw new CamflakeException(message, e);
        }
    }
}
