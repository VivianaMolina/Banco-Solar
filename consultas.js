const { Pool } = require("pg");

const config = {
    host: "localhost",
    port: 5432,
    database: "bancosolar",
    user: "postgres",
    password: "1234",
};
const pool = new Pool(config);

const insertar = async (datos) => {
    // nombre, balance
    const consulta = {
        text: 'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *',
        values: [datos.nombre, datos.balance],
    };
    const result = await pool.query(consulta);
    console.log(result);
    return result;
};

const consultar = async () => {

    const result = await pool.query("SELECT * FROM usuarios");
    return result.rows;
};

const editar = async (id, datos) => {
    //id
    //name, balance
    const consulta = {
        text: `UPDATE usuarios SET nombre = $1, balance =$2 WHERE id = '${id}'`,
        values: datos,
    }
    const result = await pool.query(consulta);
    return result;
};

const eliminar = async (id) => {
    const delTransf = await pool.query(`DELETE FROM transferencias WHERE emisor = '${id}' OR receptor = '${id}'`);
    const delUsuario = await pool.query(`DELETE FROM usuarios WHERE id = '${id}'`);
};

const nuevaTransferencia = async (datos) => {
    try {
        await pool.query("BEGIN");
        // emisor, receptor, monto,
        //values: [datos.emisor, datos.receptor, datos.monto],
        const descontar = {
            text: "UPDATE usuarios SET balance = balance - $2 WHERE nombre = $1 RETURNING id",
            values: [datos.emisor, datos.monto],
        };
        const descuento = await pool.query(descontar);

        const acreditar = {
            text: "UPDATE usuarios SET balance = balance + $2 WHERE nombre = $1 RETURNING id",
            values: [datos.receptor, datos.monto],
        };
        const acreditacion = await pool.query(acreditar);

        console.log("Descuento realizado con éxito: ", descuento.rows[0]);
        console.log("Acreditación realizada con éxito: ", acreditacion.rows[0]);

        const insert = {
            text: `INSERT INTO transferencias (emisor, receptor, monto, fecha ) values (${descuento.rows[0].id}, ${acreditacion.rows[0].id}, $1, now())`,
            values: [datos.monto],
        };

        const registro = await pool.query(insert);
        await pool.query("COMMIT");
        return registro;

    } catch (error) {
        await pool.query("ROLLBACK");
        // Capturar los posibles errores en todas las consultas e imprimirlos por consola.
        const { code } = error;
        console.log("Se ha producido un error al insertar el registro : Código del error = ", code, " - ", error.message);
    }
};


const consultaTransferencia = async () => {
    try {
        await pool.query("BEGIN");
        const consulta = {
            text: `SELECT A.fecha, b.nombre as emisor, C.nombre as receptor, A.monto 
                                            FROM transferencias as A 
                                            JOIN usuarios as B ON (A.emisor = B.id)
                                            JOIN usuarios as C ON (A.receptor = C.id)`,
            rowMode: 'array'                                
        };
        const result = await pool.query(consulta);
        await pool.query("COMMIT");
        return result.rows;
    } catch (error) {
        await pool.query("ROLLBACK");
        // Capturar los posibles errores en todas las consultas e imprimirlos por consola.
        const { code } = error;
        console.log("Se ha producido un error al consultar el registro : Código del error = ", code, " - ", error.message);
    }
};

module.exports = { insertar, consultar, editar, eliminar, nuevaTransferencia, consultaTransferencia }