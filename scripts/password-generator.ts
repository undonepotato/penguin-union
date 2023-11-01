const passwordField = document.querySelector("#password") as HTMLInputElement;

const passwordCopyButton = document.querySelector(
  "#copy-password",
) as HTMLButtonElement;
const regenerateButton = document.querySelector(
  "#regenerate",
) as HTMLButtonElement;

const toggleUppercase = document.querySelector(
  "#toggle-uppercase",
) as HTMLInputElement;
const toggleLowercase = document.querySelector(
  "#toggle-lowercase",
) as HTMLInputElement;
const toggleNumbers = document.querySelector(
  "#toggle-numbers",
) as HTMLInputElement;
const toggleSpecial = document.querySelector(
  "#toggle-special",
) as HTMLInputElement;
const toggleAmbiguous = document.querySelector(
  "#toggle-ambiguous",
) as HTMLInputElement;

const passwordLengthSelection = document.querySelector(
  "#password-length",
) as HTMLInputElement;

const passwordLengthLabel = document.querySelector(
  "#password-length-label",
) as HTMLLabelElement;

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
});

passwordCopyButton.addEventListener("click", () => {
  navigator.clipboard.writeText(passwordField.value);
  passwordCopyButton.textContent = "Copied!";
  setTimeout(() => {
    passwordCopyButton.textContent = "Copy";
  }, 1000);
});
regenerateButton.addEventListener("click", updatePasswordField);

toggleUppercase.addEventListener("input", updatePasswordField);
toggleLowercase.addEventListener("input", updatePasswordField);
toggleNumbers.addEventListener("input", updatePasswordField);
toggleSpecial.addEventListener("input", updatePasswordField);
toggleAmbiguous.addEventListener("input", updatePasswordField);

updatePasswordField(); // Generate password on first load

function updatePasswordField(): void {
  passwordField.value = getPassword(
    toggleUppercase.checked,
    toggleLowercase.checked,
    toggleNumbers.checked,
    toggleSpecial.checked,
    toggleAmbiguous.checked,
    passwordLength,
  );
}

function getAllowedCharacters(
  upper: boolean,
  lower: boolean,
  numbers: boolean,
  special: boolean,
  avoidAmbiguous: boolean,
  minLength: number,
): string[] {
  let allowedCharacters = "";
  if (upper) {
    if (avoidAmbiguous) {
      allowedCharacters += uppercaseNoAmbiguity;
    } else {
      allowedCharacters += uppercaseLetters;
    }
  }

  if (lower) {
    if (avoidAmbiguous) {
      allowedCharacters += lowercaseNoAmbiguity;
    } else {
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
    let allowedCopyBuffer = allowedCharacters.split("");

    for (
      let i = allowedCharacters.length;
      i < minLength;
      i += allowedCharacters.length
    ) {
      allowedCopyBuffer = allowedCopyBuffer.concat(allowedCharacters.split(""));
    }

    return allowedCopyBuffer;
  }

  return allowedCharacters.split("");
}

function getSecureNumbers(length: number) {
  let secureValueBuffer = new Uint8Array(length);
  crypto.getRandomValues(secureValueBuffer);
  let secureNumberArray: number[] = [];
  for (const i of secureValueBuffer) {
    secureNumberArray.push(Number(i) % length);
  }

  return secureNumberArray;
}

function generatePassword(
  allowedChars: string,
  secureNumbers: number[],
  length: number,
) {
  let password = "";
  for (let i of secureNumbers) {
    password += allowedChars[i];
  }
  return password.slice(0, length);
}

function getPassword(
  upper: boolean,
  lower: boolean,
  numbers: boolean,
  special: boolean,
  avoidAmbiguous: boolean,
  length: number,
) {
  try {
    let allowedChars = getAllowedCharacters(
      upper,
      lower,
      numbers,
      special,
      avoidAmbiguous,
      length,
    ).join("");
    let secureNumbers = getSecureNumbers(allowedChars.length);
    return generatePassword(allowedChars, secureNumbers, length);
  } catch {
    return "";
  }
}
