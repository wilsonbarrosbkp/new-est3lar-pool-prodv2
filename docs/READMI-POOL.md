# CKPOOL + CKPROXY + libckpool

**Por Con Kolivas**

Ultra low overhead massively scalable multi-process, multi-threaded modular bitcoin mining pool, proxy, passthrough, and library in C for Linux.

CKPOOL is code provided free of charge under the GPLv3 license but its development is mostly paid for by commissioned funding, and the pool by default contributes 0.5% of solved blocks in pool mode to the development team. Please consider leaving this contribution in the code if you are running it on a pool or contributing to the authors listed in AUTHORS if you use this code to aid funding further development.

---

## LICENSE

GNU Public License V3. See included COPYING for details.

---

## BITCOIND & SOLO MINING - QUICKSTART

```bash
wget https://bitbucket.org/ckolivas/ckpool/raw/master/scripts/install-ckpool-solo.sh
chmod +x install-ckpool-solo.sh
sudo ./install-ckpool-solo.sh
```

---

## DESIGN

### Architecture

- Low level hand coded architecture relying on minimal outside libraries beyond basic glibc functions for maximum flexibility and minimal overhead
- Can be built and deployed on any Linux installation
- Multiprocess + multithreaded design to scale to massive deployments
- Capitalises on modern multicore/multithread CPU designs
- Minimal memory overhead
- Utilises ultra reliable unix sockets for communication with dependent processes
- Modular code design to streamline further development
- Standalone library code that can be utilised independently of ckpool
- Same code can be deployed in many different modes designed to talk to each other on the same machine, local LAN or remote internet locations

### Modes of Deployment

| Mode | Description |
|------|-------------|
| **Simple Pool** | Basic mining pool |
| **Pool + Solo Mining** | Simple pool with per-user solo mining |
| **Proxy** | Simple proxy without hashrate limitations when talking to ckpool |
| **Passthrough** | Node(s) that combine connections to a single socket for scaling to millions of clients |
| **Library** | For use by other software |

### Features

- Bitcoind communication to unmodified bitcoind with multiple failover to local or remote locations
- Local pool instance worker limited only by operating system resources
- Virtually limitless scaling through use of multiple downstream passthrough nodes
- Proxy and passthrough modes can set up multiple failover upstream pools
- Optional share logging
- Virtually seamless restarts for upgrades through socket handover
- Configurable custom coinbase signature
- Configurable instant starting and minimum difficulty
- Rapid vardiff adjustment with stable unlimited maximum difficulty handling
- New work generation on block changes incorporates full bitcoind transaction set without delay
- Event driven communication based on communication readiness
- Stratum messaging system to running clients
- Accurate pool and per client statistics
- Multiple named instances can be run concurrently on the same machine

---

## BUILDING

Building ckpool requires no dependencies outside of the basic build tools and yasm on any Linux installation.

### Build with ZMQ (Recommended)

```bash
sudo apt-get install build-essential yasm libzmq3-dev
./configure
make
```

### Basic Build

```bash
sudo apt-get install build-essential yasm
./configure
make
```

### Building from Git

```bash
sudo apt-get install build-essential yasm autoconf automake libtool libzmq3-dev pkgconf
./autogen.sh
./configure
make
```

### Generated Binaries

Binaries will be built in the `src/` subdirectory:

| Binary | Description |
|--------|-------------|
| `ckpool` | The main pool back end |
| `ckproxy` | A link to ckpool that automatically starts it in proxy mode |
| `ckpmsg` | Application for passing messages in libckpool format to ckpool |
| `notifier` | Application designed to be run with bitcoind's `-blocknotify` |

> **Note:** Installation is NOT required. Ckpool can be run directly from the build directory, but can be installed with: `sudo make install`

---

## RUNNING

### Command Line Options

| Option | Long Form | Description |
|--------|-----------|-------------|
| `-B` | `--btcsolo` | Start in BTCSOLO mode for solo mining |
| `-c CONFIG` | `--config CONFIG` | Override default configuration filename |
| `-g GROUP` | `--group GROUP` | Start as the specified group ID |
| `-H` | `--handover` | Receive handover from running instance |
| `-h` | `--help` | Display help |
| `-k` | `--killold` | Shut down existing instance with same name |
| `-L` | `--log-shares` | Log per share information |
| `-l LEVEL` | `--loglevel LEVEL` | Change log level (default: 5, max: 7) |
| `-N` | `--node` | Start in passthrough node mode |
| `-n NAME` | `--name NAME` | Change process name |
| `-P` | `--passthrough` | Start in passthrough proxy mode |
| `-p` | `--proxy` | Start in proxy mode |
| `-R` | `--redirector` | Start in redirector mode |
| `-s SOCKDIR` | `--sockdir SOCKDIR` | Specify socket directory (default: /tmp) |
| `-u` | `--userproxy` | Start in userproxy mode |

### Mode Details

#### BTCSOLO Mode (`-B`)
Designed for solo mining. All usernames must be valid bitcoin addresses. 100% of block reward goes to the user solving the block (minus any donation).

#### Proxy Mode (`-p`)
Appears as a local pool handling clients as separate entities while presenting shares as a single user to the upstream pool. The upstream pool needs to be a ckpool for large hashrate scaling. Standalone mode is optional.

#### Passthrough Mode (`-P`)
Collates all incoming connections and streams all information on a single connection to an upstream pool. Downstream users retain their individual presence on the master pool. Standalone mode is implied.

#### Node Mode (`-N`)
Behaves like passthrough but requires a locally running bitcoind and can submit blocks itself. Also monitors hashrate and requires more resources than simple passthrough.

#### Redirector Mode (`-R`)
Variant of passthrough designed to filter out users that never contribute shares. Once an accepted share is detected, it redirects to one of the `redirecturl` entries.

#### Userproxy Mode (`-u`)
Proxy mode that additionally accepts username/passwords from stratum connects and opens additional connections with those credentials to the upstream pool.

---

## CONFIGURATION

Ckpool takes a JSON encoded configuration file:
- Default: `ckpool.conf`
- Proxy mode: `ckproxy.conf`
- Passthrough mode: `ckpassthrough.conf`
- Redirector mode: `ckredirector.conf`

> At least one bitcoind is mandatory in ckpool mode with minimum requirements: `server`, `rpcuser`, and `rpcpassword`.

### Configuration Options

#### Bitcoind Settings

| Option | Description |
|--------|-------------|
| `btcd` | Array of bitcoind(s) with `url`, `auth`, `pass`. Optional `notify` boolean. Default: localhost:8332, user "user", pass "pass" |
| `proxy` | Array in same format as btcd, used in proxy/passthrough mode for upstream pool (mandatory) |
| `btcaddress` | Bitcoin address for block generation (ignored in BTCSOLO mode) |
| `btcsig` | Optional signature for coinbase of mined blocks |
| `blockpoll` | Frequency in ms to check for new blocks (default: 100) |
| `zmqblock` | Interface for zmq blockhash notification (default: tcp://127.0.0.1:28332) |

#### Pool Settings

| Option | Description |
|--------|-------------|
| `serverurl` | IP(s) to bind to (default: all interfaces, port 3333 pool / 3334 proxy) |
| `nodeserver` | Additional IPs/ports for mining node communications |
| `redirecturl` | Array of URLs for redirector mode |
| `logdir` | Directory for logs (default: "logs") |
| `maxclients` | Optional upper limit on clients |

#### Difficulty Settings

| Option | Description |
|--------|-------------|
| `mindiff` | Minimum vardiff (default: 1) |
| `startdiff` | Starting diff for new clients (default: 42) |
| `maxdiff` | Maximum vardiff, 0 = no maximum |

#### Nonce Settings

| Option | Description |
|--------|-------------|
| `nonce1length` | Extranonce1 length, 2-8 (default: 4) |
| `nonce2length` | Extranonce2 length, 2-8 (default: 8) |

#### Other Settings

| Option | Description |
|--------|-------------|
| `update_interval` | Stratum update frequency in seconds (default: 30) |
| `version_mask` | Hex mask for version bits clients can alter (default: "1fffe000") |
| `dropidle` | Drop idle clients after seconds, 0 = disable (default: 3600) |
| `donation` | Optional % donation to ckpool developer (default: 0) |
