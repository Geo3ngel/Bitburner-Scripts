/** @param {NS} ns */
export async function main(ns) {
    var contract = ns.args[0];
    var host = ns.args[1];
    var version = ns.args[2];
    var data = ns.codingcontract.getData(contract, host)
    // var answer = await solveV2(ns, data)
    var answer = null;
    switch (version) {
        case 1:
            ns.print("Case 1")
            var answer = await solveCaesarCipher(ns, data)
            ns.print(`Answer: ${answer}`)
            var result = ns.codingcontract.attempt(answer, contract, host)
            ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
            if (!result) {
                await ns.sleep(10000)
            }
            break;
        case 2: //solveVigenereCipher
            ns.print("Case 2")
            var answer = await solveVigenereCipher(ns, data)
            ns.print(`Answer: ${answer}`)
            // TODO: Confirm this works!
            // var result = ns.codingcontract.attempt(answer, contract, host)
            // ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
            // if (!result) {
            // 	await ns.sleep(10000)
            // }
            break;
        case 3:
            ns.print("Case 3")
            break;
        default:
            ns.print(`Not found: ${contract} V:${version}`)
    }
}

async function solveCaesarCipher(ns, data) {
    // Pull out origional string & shift value:
    let unencryptedMsg = data[0];
    ns.print(`Unencrypted value: ${unencryptedMsg}`);
    let shiftValue = data[1];
    let encryptedMsg = "";
    // Shift the value to the LEFT
    for (let i = 0; i < unencryptedMsg.length; i++) {
        let char = unencryptedMsg[i];
        if (char === ' ') {
            encryptedMsg += ' '
            continue;
        }
        const charCode = char.charCodeAt(0);
        // Shift the value left!
        let shiftedCharValue = charCode - 65 - shiftValue// % 26) + 65;
        if (shiftedCharValue < 0) {
            shiftedCharValue += 26; // Wrap it back around to the end!
        }
        let shiftedCharCode = shiftedCharValue + 65;
        const shiftedChar = String.fromCharCode(shiftedCharCode);
        encryptedMsg += shiftedChar;
    }

    return encryptedMsg;
}

async function solveVigenereCipher(ns, data) {
    let plaintext = data[0].toUpperCase();
    let keyword = data[1].toUpperCase();
    let cipherText = "";
    // Expand out keyword to be length fo plaintext?
    // Or just go over it in a loop?
    for (let i = 0; i < plaintext.length; i++) {
        let plaintextChar = plaintext[i];
        let keywordChar = keyword[i % keyword.length];

        if (plaintextChar == ' ') {
            cipherText += ' '
            continue;
        }
        const plaintextCharCode = plaintextChar.charCodeAt(0) - 65;
        const keywordCharCode = keywordChar.charCodeAt(0) - 65;

        const encryptedCharCode = (plaintextCharCode + keywordCharCode) % 26 + 65;
        const encryptedChar = String.fromCharCode(encryptedCharCode);

        cipherText += encryptedChar;
    }
    return cipherText;
}