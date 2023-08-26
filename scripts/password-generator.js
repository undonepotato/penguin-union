const passwordField = document.querySelector("#password");

const passwordCopyButton = document.querySelector("#copy-password");
const regenerateButton = document.querySelector("#regenerate");

const toggleUppercase = document.querySelector("#toggle-uppercase");
const toggleLowercase = document.querySelector("#toggle-lowercase");
const toggleNumbers = document.querySelector("#toggle-numbers");
const toggleSpecial = document.querySelector("#toggle-special");
const toggleAmbiguous = document.querySelector("#toggle-ambiguous");

const passwordLengthSelection = document.querySelector("#password-length");

const passwordLengthLabel = document.querySelector("#password-length-label");

const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseLetters = uppercaseLetters.toLowerCase();
const digits = "0123456789";
const specialCharacters = "!@#$%^&*!@#$%^&*";

const uppercaseNoAmbiguity = "ABCDEFGHJKLMNPQRTVWXYZ";
const lowercaseNoAmbiguity = uppercaseNoAmbiguity.toLowerCase();

let passwordLength = Number(passwordLengthSelection.value);

passwordLengthLabel.textContent = `Password Length (${passwordLengthSelection.value})`;

// Update password length variable and regenerate upon input
passwordLengthSelection.addEventListener("input", () => {
    passwordLength = Number(passwordLengthSelection.value);
    passwordLengthLabel.textContent = `Password Length (${passwordLengthSelection.value})`;
    updatePasswordField();
})

passwordCopyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(passwordField.value);
    passwordCopyButton.textContent = "Copied!";
    setTimeout(() => {
        passwordCopyButton.textContent = "Copy";
    }, 1000);
})
regenerateButton.addEventListener("click", updatePasswordField);

toggleUppercase.addEventListener("input", updatePasswordField);
toggleLowercase.addEventListener("input", updatePasswordField);
toggleNumbers.addEventListener("input", updatePasswordField);
toggleSpecial.addEventListener("input", updatePasswordField);
toggleAmbiguous.addEventListener("input", updatePasswordField);

updatePasswordField(); // Generate password on first load

function updatePasswordField () {
    passwordField.value = getPassword(
        toggleUppercase.checked,
        toggleLowercase.checked,
        toggleNumbers.checked,
        toggleSpecial.checked,
        toggleAmbiguous.checked,
        passwordLength
    );
}

function getAllowedCharacters (upper, lower, numbers, special, avoidAmbiguous, minLength) {
    let allowedCharacters = "";
    if (upper) {
        if (avoidAmbiguous) {
            allowedCharacters += uppercaseNoAmbiguity;
        }
        else {
            allowedCharacters += uppercaseLetters;
        }
    }

    if (lower) {
        if (avoidAmbiguous) {
            allowedCharacters += lowercaseNoAmbiguity;
        }
        else {
            allowedCharacters += lowercaseLetters;
        }
    }

    if (numbers) {
        allowedCharacters += digits;
    }
    if (special) {
        allowedCharacters += specialCharacters;
    }
    
    if (allowedCharacters == "") {
        throw new Error("At least one character set must be enabled!");
    }

    if (allowedCharacters.length < minLength) {
        allowedCopyBuffer = allowedCharacters.split("");

        for (let i = allowedCharacters.length; i < minLength; i += allowedCharacters.length) {
            allowedCopyBuffer = allowedCopyBuffer.concat(allowedCharacters.split(""));
        }
        
        return allowedCopyBuffer;
    }
    
    return allowedCharacters.split("");
}

function getSecureNumbers (length) {
    let secureValueBuffer = new Uint8Array(length);
    crypto.getRandomValues(secureValueBuffer);
    let secureNumberArray = [];
    for (const i of secureValueBuffer) {
        secureNumberArray.push(Number(i) % length);
    }

    return secureNumberArray;
}

function generatePassword (allowedChars, secureNumbers, length) {
    password = "";
    for (let i of secureNumbers) {
        password += allowedChars[i]
    }
    return password.slice(0, length);
}

function getPassword (upper, lower, numbers, special, avoidAmbiguous, length) {
    try {
        let allowedChars = getAllowedCharacters(upper, lower, numbers, special, avoidAmbiguous, length);
        let secureNumbers = getSecureNumbers(allowedChars.length);
        return generatePassword(allowedChars, secureNumbers, length);
    }
    catch {
        return "";
    }
}

