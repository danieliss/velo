export function generateOrderCode() {
    const prefix = 'VLO-';

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let randomLetters = '';
    let randomNumbers = '';

    // Gera 3 letras
    for (let i = 0; i < 3; i++) {
        randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Gera 3 números
    for (let i = 0; i < 3; i++) {
        randomNumbers += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return prefix + randomLetters + randomNumbers;
}
