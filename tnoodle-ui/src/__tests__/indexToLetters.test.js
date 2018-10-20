import indexToLetters from '../utils/indexToLetters';

it('generates A', () => {
    expect(indexToLetters(0)).toEqual("A");
});

it('generates B', () => {
    expect(indexToLetters(1)).toEqual("B");
});

it('generates AA', () => {
    expect(indexToLetters(26)).toEqual("AA");
});

it('generates AB', () => {
    expect(indexToLetters(27)).toEqual("AB");
});

it('generates ZZ', () => {
    expect(indexToLetters(27*26 - 1)).toEqual("ZZ");
});

it('generates AAA', () => {
    expect(indexToLetters(27*26)).toEqual("AAA");
});
