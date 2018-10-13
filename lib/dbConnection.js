const Url = require('url');
const pg = require('pg');


/**
 * Single class that provides DB utilities and connection pooling
 */
class DBConnection {

    constructor() {
        pg.defaults.poolSize = 20;

        const config = DBConnection.getConnectionConfig();

        console.log('creating db pool');
        this._pool = new pg.Pool(config);

        this._pool.on('error', function (err, client) {
            console.log(err);
        });
    }

    /**
     * Perform a select query operation
     * @param sql Statement to perform
     * @param parameters Parameters for the query
     * @param done Function to call on success
     * @param error Function to call on error
     */
    query(sql, parameters, done, error) {
        this._pool.query(sql, parameters, (err, res) => {
            if (err) {
                error(err);
                return;
            }

            done(res.rows);
        });
    };

    /**
     * Perform an insert operation on the database
     * @param sql Statement to perform
     * @param parameters Parameters for the query
     * @param done Function to call on exit
     * @param error Error function to call on error
     */
    insert(sql, parameters, done, error) {
        this._pool.query(sql, parameters, (err, result) => {
            if (err) {
                error(err);
                return;
            }

            done(result);
        });
    };

    /**
     * Wrapper around delete function to delete by a set of ids
     * @param tableName
     * @param ids array of IDS to delete
     * @param done function to call on completion
     */
    deleteByIds(tableName, ids, done) {

        let params = [];
        for (let i = 1; i <= ids.length; i++) {
            params.push('$' + i);
        }

        let sql = "DELETE FROM " + tableName + " WHERE id IN (" + params.join(',') + "  )";

        this.query(sql, ids,
            (result) => {
                done(true);
            },
            (error) => {
                console.log(error);
                done(false, error);
            });

    };

    getAllFromTable(tableName, done, order) {
        let sql = "SELECT * FROM " + tableName;
        let params = [];

        if (order != null) {
            sql = sql + " ORDER BY $1";
            params.push(order);
        }

        this.query(sql, params,
            (results) => {
                done(results);
            },
            (error) => {
                console.log(error);
                done(null);
            });
    };

    /**
     * Environments like Heroku provide a connection string, I have found this can cause problems
     * when trying to enforce SSL.  So I decode it if it exists and create a manual configuration
     * object otherwise assume that the individual environment variables are defined.
     *
     * Note : A DATABASE_URL will override individual env variables
     */
    static getConnectionConfig() {
        let connectionStr = process.env.DATABASE_URL;

        if (undefined === connectionStr) {
            let config = {
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                database: process.env.PGDATABASE,
                sslmode: 'require'
            };

            return config;
        } else {
            let params = Url.parse(connectionStr);
            let auth = params.auth.split(':');
            let config = {
                user: auth[ 0 ],
                password: auth[ 1 ],
                host: params.hostname,
                port: params.port,
                database: params.pathname.split('/')[ 1 ],
                sslmode: 'require'
            };

            return config;
        }
    }

    static isInt(value) {
        return !isNaN(value) &&
            parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
    };
}

const instance = new DBConnection();
Object.freeze(instance);

module.exports = instance;