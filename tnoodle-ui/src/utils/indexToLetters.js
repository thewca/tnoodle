export default function indexToLetters(index) {
    let letters = "";
    while(index >= 0) {
        let nthLetterOfTheAlphabet = index % 26;
        index = Math.floor(index / 26) - 1;
        letters = String.fromCharCode('A'.charCodeAt(0) + nthLetterOfTheAlphabet) + letters;
    }
    return letters;
}
