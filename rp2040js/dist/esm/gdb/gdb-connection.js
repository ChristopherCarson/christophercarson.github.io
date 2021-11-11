import { STOP_REPLY_SIGINT, STOP_REPLY_TRAP } from './gdb-server';
import { gdbChecksum, gdbMessage } from './gdb-utils';
export class GDBConnection {
    constructor(server, onResponse) {
        this.server = server;
        this.onResponse = onResponse;
        this.rp2040 = this.server.rp2040;
        this.buf = '';
        server.addConnection(this);
        onResponse('+');
    }
    feedData(data) {
        const { onResponse } = this;
        if (data.charCodeAt(0) === 3) {
            this.server.info('BREAK');
            this.rp2040.stop();
            onResponse(gdbMessage(STOP_REPLY_SIGINT));
            data = data.slice(1);
        }
        this.buf += data;
        for (;;) {
            const dolla = this.buf.indexOf('$');
            const hash = this.buf.indexOf('#', dolla + 1);
            if (dolla < 0 || hash < 0 || hash + 2 > this.buf.length) {
                return;
            }
            const cmd = this.buf.substring(dolla + 1, hash);
            const cksum = this.buf.substr(hash + 1, 2);
            this.buf = this.buf.substr(hash + 2);
            if (gdbChecksum(cmd) !== cksum) {
                this.server.warn(`GDB checksum error in message: ${cmd}`);
                onResponse('-');
            }
            else {
                onResponse('+');
                this.server.debug(`>${cmd}`);
                const response = this.server.processGDBMessage(cmd);
                if (response) {
                    this.server.debug(`<${response}`);
                    onResponse(response);
                }
            }
        }
    }
    onBreakpoint() {
        try {
            this.onResponse(gdbMessage(STOP_REPLY_TRAP));
        }
        catch (e) {
            this.server.removeConnection(this);
        }
    }
}
