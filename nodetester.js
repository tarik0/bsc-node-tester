const ethers = require("ethers");
const readline = require('readline-sync');
const colors = require('colors');

/// Colored: Custom colored input generator.
const Colored = {
    timestamp: function() {
        return new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')     // delete the dot and everything after
    },
    ask: function (question) {
        return readline.question(
            `[${Colored.timestamp()}]`.magenta.bold + " " + "[?]".yellow.bold + " " + question.bold
        );
    },
    success: function(message) {
        return console.log(
            `[${Colored.timestamp()}]`.magenta.bold + " " + "[+]".green.bold + " "  + message.bold
        );
    },
    error: function(message) {
        return console.log(
            `[${Colored.timestamp()}]`.magenta.bold + " " + "[-]".red.bold + " "  + message.bold
        );
    },
    info: function(message) {
        return console.log(
            `[${Colored.timestamp()}]`.magenta.bold + " " + "[*]".blue.bold + " "  + message.bold
        );
    }
}

/**
 * Test the given node.
 * @param {String} nodeAddress BSC node address.
 */
function testAddress(nodeAddress) {
    return new Promise(async function(resolve, reject) {
        Colored.info(`Connecting to the node "`.bold + nodeAddress.reset + `"...`.bold)

        var connectionStartDate = Date.now();
        var isConnected = false;
    
        // Return if the provider is still not returned.
        var connectionTimeout = setTimeout(() => {
            if (isConnected) return;
            Colored.error("Connection timed out while connecting!");
            reject();
        }, 30 * 1000)
        
        var provider;
        try {
            provider = new ethers.providers.WebSocketProvider(nodeAddress);
        } catch (e) {
            Colored.error("Unable to connect to the node.")
            clearTimeout(connectionTimeout);
            reject(e);
        }
    
        provider._websocket.on("open", () => {
            isConnected = true;
            clearTimeout(connectionTimeout);
            
            var connectionEndDate = Date.now();
            Colored.success(`Connected to the node in ${(connectionEndDate - connectionStartDate).toString().reset + " ms"}` +  `!`.bold);

            console.log("");
            Colored.info(`Testing the node "`.bold + nodeAddress.reset + `" for 10 seconds...`.bold)

            var pendingCount = 0;
            var checkingStartDate = Date.now();
            provider.on("pending", async () => {
                pendingCount += 1;

                if (provider !== null && Date.now() - checkingStartDate > 10 * 1000) {
                    Colored.success(`This node received ${pendingCount.toString().reset} transaction hashes` + ` in 10 seconds.`.bold);
                    await provider.destroy();
                    provider = null;
                    resolve();
                }
            })
        })

        provider._websocket.on("error", (err) => {
            clearTimeout(connectionTimeout);
            Colored.error("Unable to connect to the node.")
            reject();
        });
    })
}

/// main: Main enty point.
async function main() {
    Colored.success("BSC COIN SNIPER TOOLS - NODE TESTERS V1.0");
    Colored.success("coded by cool guy. github.com/tarik0")
    console.log("");

    while (true) {
        // Get node address.
        let nodeAddress = Colored.ask("Websocket address: ");
        console.log("");

        try {
            await testAddress(nodeAddress);
        } catch (err) {
        }
        console.log("");
    }
}

main();