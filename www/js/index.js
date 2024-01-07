let db = null;
let isDbReady = false;

const SQL_CREATE_BOOKS_TABLE =
    'CREATE TABLE IF NOT EXISTS `book` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT, `title` TEXT, `year` INTEGER, `price` REAL, `timestamp` NUMERIC );';

const SQL_INSERT_BOOK =
    'INSERT INTO `book` (`title`, `year`, `price`, `timestamp`) VALUES (?, ?, ?, ?);';

const SQL_SELECT_BOOK =
    'SELECT `title`, `year`, `price`, `timestamp` FROM `book` ORDER BY `title` ASC;';

function onSaveClick() {
    if (!isDbReady) {
        showError('Database is not ready. Please try again later.');
        return;
    }
    let title = $.trim($('#bookTitle').val());
    let year = $.trim($('#bookYear').val());
    let price = $('#bookPrice').val();
    let timestamp = new Date().getMilliseconds();

    if (title.length === 0 || year === 0 || price === 0) {
        showError('All fields are required.');
        return;
    }

    db.transaction(function (tx) {
        tx.executeSql(
            SQL_INSERT_BOOK,
            [title, year, price, timestamp],
            function (tx, result) {
                // success callback
                console.log('Book added');
                $('#bookTitle').val('');
                $('#bookYear').val('');
                $('#bookPrice').val('');
            },
            function (tx, error) {
                showError('Book add failed'.error.message);
            }
        );
    });
}

function onDumpClick() {
    if (!isDbReady) {
        showError('Database is not ready. Please try again later.');
        return;
    }

    db.transaction(function (tx) {
        tx.executeSql(
            SQL_SELECT_BOOK,
            [],
            function (tx, result) {
                // success callback
                let html = '';
                for (let i = 0; i < result.rows.length; i++) {
                    let title = result.rows.item(i).title;
                    let year = result.rows.item(i).year;
                    let price = parseFloat(result.rows.item(i).price).toFixed(
                        2
                    );
                    html += `<li>${title} (${year}) - RM${price}</li>`;
                }
                console.log(html);
                // $('#bookList').html(html);
            },
            function (tx, error) {
                showError('Book dump failed'.error.message);
            }
        );
    });
}

function showError(message) {
    navigator.vibrate(1000);
    navigator.notification.beep(1);
    navigator.notification.alert(message, null, 'Error', 'OK');
}

document.addEventListener(
    'deviceready',
    function () {
        Zepto(function ($) {
            $('#btnAddBook').on('click', onSaveClick);
            $('#btnDump').on('click', onDumpClick);

            db = window.sqlitePlugin.openDatabase(
                {
                    name: 'books.db',
                    location: 'default',
                },
                function (database) {
                    // success callback
                    const db = database;
                    db.transaction(
                        function (tx) {
                            tx.executeSql(
                                SQL_CREATE_BOOKS_TABLE,
                                [],
                                function (tx, result) {
                                    // success callback
                                    isDbReady = true;
                                    console.log('Table created');
                                },
                                function (tx, error) {
                                    // error callback
                                    isDbReady = false;
                                    console.log(
                                        'Table creation failed',
                                        error.message
                                    );
                                }
                            );
                        },
                        function (error) {
                            isDbReady = false;
                        }, // error callback
                        function () {} // success callback
                    );
                },
                function (error) {}
            );
        });
    },
    false
);
