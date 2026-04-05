/**
 * Global Error Handler (Dev + Prod)
 */

const AppError = require('../utils/appError.js');
const { map } = require('../utils/errorjson.js');

// ---------------- HELPERS ----------------

function _flatten(obj, prefix = '') {
    const out = {};
    for (const [k, v] of Object.entries(obj || {})) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.assign(out, _flatten(v, key));
        } else {
            out[key] = v;
        }
    }
    return out;
}

function _safeJsonParse(str) {
    if (typeof str !== 'string') return null;
    const s = str.trim();

    if (
        !(
            (s.startsWith('{') && s.endsWith('}')) ||
            (s.startsWith('[') && s.endsWith(']'))
        )
    )
        return null;

    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}

function _extractBadVal(msg) {
    const lower = msg.toLowerCase();
    const marker = 'invalid input syntax for type';
    const i = lower.indexOf(marker);
    if (i < 0) return null;

    const tail = msg.slice(i);
    const colon = tail.indexOf(':');
    if (colon < 0) return null;

    let val = tail.slice(colon + 1).trim();

    const q = val[0];
    if ((q === `"` || q === `'`) && val.includes(q)) {
        const last = val.lastIndexOf(q);
        if (last > 0) val = val.slice(1, last);
    }

    return val;
}

function _inferTableAndColumnFromSql(msg) {
    const sql = msg.includes(' - ') ? msg.split(' - ')[0] : msg;

    let table = null;
    let column = null;

    const fromMatch =
        sql.match(/from\s+"[^"]+"\."([^"]+)"/i) || sql.match(/from\s+"([^"]+)"/i);
    if (fromMatch) table = fromMatch[1];

    const whereMatch = sql.match(/where\s+"[^"]+"\."([^"]+)"\s*=\s*\$\d+/i);
    if (whereMatch) column = whereMatch[1];

    if (!column) {
        const setMatch = sql.match(/set\s+"([^"]+)"\s*=\s*\$\d+/i);
        if (setMatch) column = setMatch[1];
    }

    return { table, column };
}

// ---------------- UMAMI TRACKING (PROD ONLY) ----------------


// ---------------- DB HUMANIZER ----------------

function humanify22P02(err, reqPayload = {}) {
    const msg = String(
        err?.nativeError?.message || err?.message || err?.detail || ''
    );

    const type = (
        msg.match(/invalid input syntax for type\s+("?)([\w\s]+)\1/i)?.[2] || ''
    )
        .toLowerCase()
        .trim();

    const badVal = _extractBadVal(msg);
    const { table, column } = _inferTableAndColumnFromSql(msg);

    let inferredColumn = column;

    if (!inferredColumn && badVal && reqPayload) {
        const flat = _flatten(reqPayload);
        const hit = Object.entries(flat).find(
            ([_, v]) => String(v) === String(badVal)
        );
        if (hit) inferredColumn = hit[0];
    }

    const field =
        table && inferredColumn
            ? `${table}.${inferredColumn}`
            : inferredColumn || 'field';

    if (badVal && type) {
        return `Invalid ${field}. Expected ${type}, got "${badVal}".`;
    }

    return `Invalid ${field}. Invalid input format.`;
}

// ---------------- DB ERROR HANDLER ----------------

function handleDbErrors(err, req) {
    const code = err.code || err?.nativeError?.code;
    const detail = err.detail || err?.nativeError?.detail || err.message;

    if (code === '22P02') {
        const ctx = {
            ...(req?.params || {}),
            ...(req?.query || {}),
            ...(req?.body || {}),
        };
        return new AppError(1021, humanify22P02(err, ctx));
    }

    if (code === '23502') {
        return new AppError(1022, `Missing required field`);
    }

    if (code === '23503') {
        return new AppError(1023, `Foreign key violation`);
    }

    if (code === '23505') {
        return new AppError(1024, 'Duplicate value error.');
    }

    return err;
}

// ---------------- MESSAGE RESOLVER ----------------

function resolveMessage(err) {
    return (
        err?.customMessage ||
        map?.[err?.statusCode] ||
        err?.message ||
        'Something went wrong!'
    );
}

// ---------------- RESPONSES ----------------

function sendErrorDev(err, res) {
    console.error(err);

    res.status(200).json({
        status: err.status ?? false,
        code: err.statusCode ?? 10000,
        message: resolveMessage(err),
        stack: err.stack, // ✅ full stack
        data: err.data,
    });
}

async  function sendErrorProd(err, res,req,originalError) {
    if (err.isOperational) {
        return res.status(200).json({
            status: err.status ?? false,
            code: err.statusCode ?? 10000,
            message: resolveMessage(err),
        });
    }
    return res.status(200).json({
        status: false,
        code: 10000,
        message: 'Something went wrong!',
    });
}

// ---------------- GLOBAL HANDLER ----------------

const globalErrorHandler = async (err, req, res, next) => {
    const isDev =
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev' ||
        !process.env.NODE_ENV;

    const originalError = err;
    let error = err;

    if (isDev) {
        console.log("inside the dev ")
        error = handleDbErrors(error, req);
        return sendErrorDev(error, res);
    }

    // PROD
    if (!(error instanceof AppError)) {
        error = new AppError(10000, 'Something went wrong!');
        error.isOperational = false;
    }

    error = handleDbErrors(error, req);

    // ✅ track ONLY in prod with ORIGINAL error

    return sendErrorProd(error, res,req,originalError);
};

module.exports = globalErrorHandler;
module.exports.AppError = AppError;