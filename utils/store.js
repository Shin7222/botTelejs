// Penyimpanan data sederhana di memori (in-memory store)
// Untuk production, ganti dengan database seperti Prisma + SQLite/PostgreSQL

const userNotes = {};

const store = {
    getNotes(chatId) {
        return userNotes[chatId] || [];
    },

    addNote(chatId, note) {
        if (!userNotes[chatId]) {
            userNotes[chatId] = [];
        }
        userNotes[chatId].push(note);
    },

    clearNotes(chatId) {
        delete userNotes[chatId];
    },
};

module.exports = store;
