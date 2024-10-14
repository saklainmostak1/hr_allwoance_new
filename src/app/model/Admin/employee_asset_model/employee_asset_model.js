

const connection = require('../../../../connection/config/database')


const employeeAssetModel = {

    asset_employee_create: async (req, res) => {

        try {
            const { employee_id, asset_id, note, handover_date, return_date, created_by } = req.body;
            if (!employee_id || !asset_id) {
                return res.status(400).json({ message: 'brand name and status ID are required' });
            }

            const insertQuery = 'INSERT INTO asset_employee (employee_id, asset_id, note, handover_date, return_date, created_by) VALUES (?, ?, ?, ?, ?, ?)';
            const result = await connection.query(insertQuery, [employee_id, asset_id, note, handover_date, return_date, created_by]);

            // Sending only the necessary data from the result object
            const { insertId, affectedRows } = result;

            // Sending response with relevant data
            res.status(200).json({ insertId, affectedRows });

            // Using parameterized query to prevent SQL injection

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error processing the request' });
        }
    },


    asset_employee_list: async (req, res) => {
        try {
            const data = "select * from  asset_employee";

            connection.query(data, function (error, result) {
                console.log(result)
                if (!error) {
                    res.send(result)
                }

                else {
                    console.log(error)
                }

            })
        }
        catch (error) {
            console.log(error)
        }
    },

    asset_employee_single: async (req, res) => {
        try {
            const query = 'SELECT * FROM asset_employee WHERE id = ?';
            connection.query(query, [req.params.id], (error, result) => {
                if (!error && result.length > 0) {
                    console.log(result);
                    return res.send(result);
                } else {
                    console.log(error || 'Product not found');
                    return res.status(404).json({ message: 'Product not found.' });
                }
            });
        }
        catch (error) {
            console.log(error)
        }
    },


    asset_employee_update: async (req, res) => {
        try {

            const { employee_id, asset_id, note, handover_date, return_date, modified_by } = req.body;

            const query = `UPDATE asset_employee SET   employee_id = ?, asset_id = ?, note = ?, handover_date = ?, return_date = ?, modified_by = ? WHERE id = ?`;
            connection.query(query, [employee_id, asset_id, note, handover_date, return_date, modified_by, req.params.id], (error, result) => {
                if (!error && result.affectedRows > 0) {
                    console.log(result);
                    return res.send(result);
                } else {
                    console.log(error || 'Product not found');
                    return res.status(404).json({ message: 'Product not found.' });
                }
            });
        }
        catch (error) {
            console.log(error)
        }
    },


    asset_employee_delete: async (req, res) => {
        try {
            const query = "DELETE FROM asset_employee WHERE id = ?";
            connection.query(query, [req.params.id], (error, result) => {
                if (!error && result.affectedRows > 0) {
                    console.log(result);
                    return res.send(result);
                } else {
                    console.log(error || "Notice category not found");
                    return res
                        .status(404)
                        .json({ message: "Notice category not found." });
                }
            });
        } catch (error) {
            console.log(error);
        }
    },


    
    asset_employee_list_paigination: async (req, res) => {
        const pageNo = Number(req.params.pageNo);
        const perPage = Number(req.params.perPage);
        try {
            const skipRows = (pageNo - 1) * perPage;
            let query = `
        SELECT asset_employee.*, 
             users_created.full_name AS created_by,
             users_modified.full_name AS modified_by,
             asset_info.asset_name AS asset_name,
             users_employee.full_name AS full_name
            
      FROM asset_employee 
      LEFT JOIN users AS users_created ON asset_employee.created_by = users_created.id 
      LEFT JOIN users AS users_modified ON asset_employee.modified_by = users_modified.id 
      LEFT JOIN asset_info ON asset_employee.asset_id = asset_info.id
       LEFT JOIN users AS users_employee ON asset_employee.employee_id = users_employee.id -- Join to get the employee full_name
      ORDER BY asset_employee.id DESC
      LIMIT ?, ?
    `;

            connection.query(query, [skipRows, perPage], (error, result) => {
                console.log(result)
                if (!error) {
                    res.send(result)
                }

                else {
                    console.log(error)
                }

            })
        }
        catch (error) {
            console.log(error)
        }
    },


}

module.exports = employeeAssetModel