// Instance-Specific Algorithm Composition encryption, or ISAC
// Copyright Linus Lee 2015-2016

// The JavaScript execution ignores the BCB (blockchain) and 64-byte unit requirements!

var exports = module.exports = {};

String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this)
}

function rset(n) {
    rxe = new RegExp(".{1," + n.toString() + "}","g");
    return rxe;
}

exports.encode = function(words) {
    // encodes string to binary ASCII string
    words = words.replace(/[^\x20-\x7E]+/g, ''); // take out non-ASCII characters. They cause trouble.
    wordsList = words.split("");
    bits = "";

    wordsList.forEach(function(letter) {
        mlk = "0" + parseInt(letter.charCodeAt()).toString(2);
        bits += "00000000".substr(0, 8 - mlk.length) + mlk;
    });
    
    return bits;
}

exports.decode = function(bits) {
    // decodes binary ASCII to string
    words = "";

    bitsList = bits.match(rset(8));
    bitsList.forEach(function(code) {
        words += String.fromCharCode(parseInt(code, 2));
    });

    return words;
}

// G elements
exports.adder = function(n) { // formerly "inverse", when applied only to 1-bit string objects
    result = "";

    for (k = 0; k < processing.length; k ++) {

        if (k % n || n == 1) {
            bits = processing[k];

            e = (parseInt(bits, 2) + 1).toString(2);
            if (e.length < 8) {
                e = "00000000".substr(0, 8 - e.length) + e
            }

            if (e.length == 9) {
                e = "00000000";
            }
            
            result += e;
        } else {
            result += processing[k];
        }

    };

    processing = result.match(rset(8));
}
exports.rAdder = function(n) { // inverse function of adder()
    result = "";

    for (k = 0; k < processing.length; k ++) {
        
        if (k % n || n == 1) {
            bits = processing[k];
            
            if (bits == "00000000") {
                e = "11111111";
            } else {
                e = (parseInt(bits, 2) - 1).toString(2);
                if (e.length < 8) {
                    e = "00000000".substr(0, 8 - e.length) + e;
                }
            }

            result += e;
        } else {
            result += processing[k];
        }
    }

    processing = result.match(rset(8));
}
exports.cycle = function(n) {
    result = "";

    for (k = 0; k < processing.length; k++) {

        if (k % n || n == 1) {
            bits = processing[k];

            e = bits.substr(1, 7) + bits[0];
            result += e;
        } else {
            result += processing[k];
        }
    }

    processing = result.match(rset(8));
}

exports.rCycle = function(n) {   
    result = "";

    for (k = 0; k < processing.length; k++) {

        if (k % n || n == 1) {
            bits = processing[k];

            e = bits.substr(1, 7) + bits[0];
            e = bits[7] + bits.substr(0, 7);
            result += e;
        } else {
            result += processing[k];
        }
    }

    processing = result.match(rset(8));
}
    
exports.reverse = function(n) {    
    result = "";

    for (k = 0; k < processing.length; k++) {

        if (k % n || n == 1) {
            bits = processing[k];

            result += bits.split("").reverse().join("");
        } else {
            result += processing[k];
        }
    }

    processing = result.match(rset(8));
}

exports.rReverse = exports.reverse;

exports.split = function(n) {
    result = "";
 
    for (k = 0; k < processing.length; k++) {
 
        if (k % n || n == 1) {
            bits = processing[k].split("");
            result += bits[0] + bits[4] + bits[1] + bits[5] + bits[2] + bits[6] + bits[3] + bits[7];
        } else {
            result += processing[k];
        }
    }
            
    processing = result.match(rset(8));
}
exports.rSplit = function(n) {
    result = "";
 
    for (k = 0; k < processing.length; k++) {
 
        if (k % n || n == 1) {
            bits = processing[k].split("");
            result += bits[0] + bits[2] + bits[4] + bits[6] + bits[1] + bits[3] + bits[5] + bits[7];
        } else {
            result += processing[k];
        }
    }
            
    processing = result.match(rset(8));
}

// Other Modules:

exports.rs_w = function(keyword) {
    // random key generator
    encodedK = exports.encode(keyword);
    if (keyword.length * 8 != encodedK.length) {
        console.warn("Invalid encryption key!");
        return rs_g(30, 50);
    }
    encodedK = encodedK.match(rset(8));
    random_seed = "";

    encodedK.forEach(function(letter) {
        random_seed += parseInt(letter.substr(3,2), 2).toString() + Math.pow(2, Math.floor(parseInt(letter.substr(5), 2) / 8 * 5)).toString() + " ";
    });

    return random_seed.replace(/0 /g, "1 ").toString().trim();
}

exports.rs_g = function(lower, upper) {
    // random key generator
    if (lower == undefined) {lower = 76}
    if (upper == undefined) {upper = 150}
    random_seed = "";

    digits = Math.floor((Math.random() * parseInt(upper / 2)) + parseInt(lower / 2)) * 2; // digit # from 100 to 200
    for(i=0; i < digits; i++) {
        if(i % 2 == 0) {
            random_seed += Math.floor((Math.random() * 4)).toString();
        }else{
            random_seed += Math.pow(2, Math.floor(Math.random() * 4)).toString();
            random_seed += " ";
        }
    }

    return random_seed.toString().trim();
}

exports.key_norm = function(size, key) {
    key = parseInt(key.split(" ").join("")).toString(2);

    key_size = key.length;
    diff = size % key_size;
    return key.repeat(parseInt((size - diff) / key_size)) + key.substr(0, diff);
}

exports.bit_norm = function() {
    exports.adder(exports.nbit);
    exports.rAdder(exports.nbit);
}

exports.G = function(binary, random_seed) {
    split_seed = random_seed.split(" ");
    
    processing = binary.match(rset(8));
    
    if (!processing.length) {
        console.error('No data entered');
    }

    exports.bit_norm();
    split_seed.forEach(function(pair) {
        if      (pair[0] == "0") {exports.adder(parseInt(pair.substr(1)))}
        else if (pair[0] == "1") {exports.cycle(parseInt(pair.substr(1)))}
        else if (pair[0] == "2") {exports.reverse(parseInt(pair.substr(1)))}
        else if (pair[0] == "3") {exports.split(parseInt(pair.substr(1)))}
    });
    
    return processing.join("");
}

exports.r_G = function(binary, random_seed) {
    split_seed = random_seed.split("").reverse().join("").split(" ");
    
    for (i=0; i<split_seed.length; i++) {
        split_seed[i] = split_seed[i].split("").reverse().join("");
    }

    processing = binary.match(rset(8));

    if (!processing.length) {
        console.error('No data entered');
    }

    exports.bit_norm();
    split_seed.forEach(function(pair) {
        if      (pair[0] == "0") {exports.rAdder(parseInt(pair.substr(1)))}
        else if (pair[0] == "1") {exports.rCycle(parseInt(pair.substr(1)))}
        else if (pair[0] == "2") {exports.rReverse(parseInt(pair.substr(1)))}
        else if (pair[0] == "3") {exports.rSplit(parseInt(pair.substr(1)))}
    });
   
    return processing.join("");
}

exports.H = function(bits, key) {
    key = exports.key_norm(bits.length, key);
    
    result = "";
    vsum = 0;
    
    for (i=0; i<bits.length; i++) {
        if (bits[i] == key[i]) {result += "1"}
        else {result += "0"}
    }

    bit2 = result.match(rset(2));
    for (i=0; i<bit2.length; i++) {
        vsum += parseInt(bit2[i], 2);
    }

    vsum = (vsum * 72) % result.length;
    out = result.substr(vsum, result.length - vsum) + result.substr(0, vsum);

    return out;
}

exports.r_H = function(bits, key) {
    key = exports.key_norm(bits.length, key);
 
    vsum = 0;
    bit2 = bits.match(rset(2));

    for (i=0; i<bit2.length; i++) {
        vsum += parseInt(bit2[i], 2);
    }
    
    vsum = (vsum * 72) % bits.length;
    bits = bits.substr(bits.length - vsum, vsum) + bits.substr(0, bits.length - vsum);
   
    result = "";
    for (i=0; i<bits.length; i++) {
        if (bits[i] == key[i]) {result += "1"}
        else {result += "0"}
    }
 
    return result;
}

exports.encryptor = function(text, key, option) {
    if (key == undefined) {
        console.warn("Please specify an encryption key");
        return false;
    }
    
    reply = exports.H(exports.G(exports.encode(text), key), key).toString();
    if (option == 'hex') {
        hexply = '';
        reply = reply.match(rset(8));
        reply.forEach(function(octa) {
            addin = parseInt(octa, 2).toString(16);
            if (addin.length == 1) {
                hexply += '0';
            }
            hexply += addin;
        });
    
        return hexply
    } else {
        return reply;
    }
}

exports.decryptor = function(binary, key, option) {
    if (option == 'hex') {
        hexinary = binary.match(rset(2));
        binary = '';
        hexinary.forEach(function(octa) {
          addin = parseInt(octa, 16).toString(2);
          binary += '0'.repeat(8 - addin.length) + addin;
        });
    }
    return exports.decode(exports.r_G(exports.r_H(binary, key), key).toString()).split('\u0000').join("");
}

exports.encryptorx = function(words, key) {
    // returns binary buffer
    datastream = exports.encryptor(words, key).match(rset(8));
    var buf = new ArrayBuffer(datastream.length);
    var data = new DataView(buf, 0);

    for (i=0; i<datastream.length; i++) {
        data.setInt8(i, parseInt(datastream[i], 2));
    }

    return buf;
}

exports.decryptorx = function(data, key) {
    // takes binary data
    var buf = data;
    var view = new DataView(buf, 0);
    var str = "";

    for (i=0; i<buf.byteLength; i++) {
        bits = view[i].toString(2);
        str += "00000000".substr(0, 8 - bits.length) + bits;
    }

    return exports.decryptor(str, key);
}

