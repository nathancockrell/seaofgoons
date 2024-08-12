
// USE FOR SETTING INNER HTML DISPLAY
// RETURNS NUMBER AND UNIT

// import dparseNumber from "./dparseNumber.js";
// import dparseUnit from "./dparseUnit.js";

export default function dparse(number) {
    // let word = dparseUnit(number);
    // let num = dparseNumber(number);
    // return num + word;


    let word = "";
    if(number >1000000) {
        if(number <= 1000000000) {
            number = number/1000;
            word = "million";
        };
        if(number > 1000000000 && number <= 1000000000000) {
            number = number/1000000;
            word = "billion";
        };
        if(number > 1000000000000 && number <= 1000000000000000) {
            number = number/1000000000;
            word = "trillion";
        };
        if(number > 1000000000000000 && number <= 1000000000000000000) {
            number = number/1000000000000;
            word = "quadrillion";
        };
        if(number > 1000000000000000000 && number <= 1000000000000000000000) {
            number = number/1000000000000000;
            word = "quintillion";
        };
        if(number > 1000000000000000000000 && number <= 1000000000000000000000000) {
            number = number/1000000000000000000;
            word = "sextillion";
        };
        if(number > 1000000000000000000000000 && number <= 1000000000000000000000000000) {
            number = number/1000000000000000000000;
            word = "septillion";
        };
        if(number > 1000000000000000000000000000 && number <= 1000000000000000000000000000000) {
            number = number/1000000000000000000000000;
            word = "octillion";
        };
        if(number > 1000000000000000000000000000000 && number <= 1000000000000000000000000000000000) {
            number = number/1000000000000000000000000000;
            word = "nonillion";
        };
        // console.log(number);
        let diff;
        if (number <2000) {diff = number - 1000;}
        if (number > 2000 && number < 3000) {diff = number - 2000; }
        if (number > 3000 && number < 4000) {diff = number - 3000;}
        if (number > 4000 && number < 5000) {diff = number - 4000;}
        if (number > 5000 && number < 6000) {diff = number - 5000;}
        if (number > 6000 && number < 7000) {diff = number - 6000;}
        if (number > 7000 && number < 8000) {diff = number - 7000;}
        if (number > 8000 && number < 9000) {diff = number - 8000;}
        if(number > 9000) {diff = number - 9000}
        // console.log(diff);
        if(diff > 0) {
            number = number/1000;
            number = Number(number.toFixed(3));
        }
        else if (diff > 9) {
            number = number/1000;
            number = Number(number).toFixed(2)
        }
        else if (diff > 99) {
            number = number/1000;
            number = Number(number).toFixed(1)
        }
        else {
            number = number/1000;
            number = Number(number).toFixed(0)
        }
    }

    else{number = Math.trunc(number);}
    let displayNumber = number + word;
    return displayNumber;
}