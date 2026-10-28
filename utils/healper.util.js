const CryptoJS = require("crypto-js");

class Helper {
    static isValidDate(dateString) {
        if (!dateString) {
            return false;
        }

        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (!regex.test(dateString)) {
            return false;
        }

        const [year, month, day] = dateString
            .split("-")
            .map(Number);

        if (month < 1 || month > 12) {
            return false;
        }

        if (day < 1 || day > 31) {
            return false;
        }

        const monthsWith30Days = [4, 6, 9, 11];

        if (monthsWith30Days.includes(month) && day > 30) {
            return false;
        }

        if (month === 2) {
            const isLeapYear =
                (year % 4 === 0 && year % 100 !== 0) ||
                year % 400 === 0;

            if (isLeapYear && day > 29) {
                return false;
            }

            if (!isLeapYear && day > 28) {
                return false;
            }
        }

        return true;
    }
}

const generateResetToken = () => {
    const wordArray = CryptoJS.lib.WordArray.random(32);

    return wordArray.toString(CryptoJS.enc.Hex);
};

module.exports = {
    Helper,
    generateResetToken
};