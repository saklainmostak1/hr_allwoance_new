

const connection = require('../../../../connection/config/database')


const AssetInfoModel = {

    asset_info_create: async (req, res) => {
        try {
            const { asset_name, asset_type_id, asset_cost, note, depreciation, date, status, img, created_by
            } = req.body;
            if (!asset_name || !status) {
                return res.status(400).json({ message: 'brand name and status ID are required' });
            }


            const insertQuery = 'INSERT INTO asset_info (asset_name,	asset_type_id,	asset_cost,	note,	depreciation,	date,	status,	img	,created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const result = await connection.query(insertQuery, [asset_name, asset_type_id, asset_cost, note, depreciation, date, status, img, created_by]);

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


    asset_info_list: async (req, res) => {
        try {
            const data = "select * from  asset_info";

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

    asset_info_single: async (req, res) => {
        try {
            const query = 'SELECT * FROM asset_info WHERE id = ?';
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


    asset_info_update: async (req, res) => {
        try {

            const { asset_name, asset_type_id, asset_cost, note, depreciation, date, status, img, modified_by
            } = req.body;

            const query = `UPDATE asset_info SET   asset_name = ?, asset_type_id = ?, asset_cost = ?, note = ?, depreciation = ?, date = ?, status = ?, img = ?,  modified_by = ? WHERE id = ?`;
            connection.query(query, [asset_name, asset_type_id, asset_cost, note, depreciation, date, status, img, modified_by, req.params.id], (error, result) => {
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


    asset_info_delete: async (req, res) => {
        try {
            const shiftId = req.params.id;

            console.log(shiftId);

            // First, check if the shift_id is referenced in employee_joining
            const checkQuery =
                "SELECT COUNT(*) AS count FROM asset_employee WHERE asset_id = ?";
            connection.query(checkQuery, [shiftId], (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Database error" });
                }

                const isReferenced = results[0].count > 0;

                if (isReferenced) {
                    // If referenced, prevent deletion
                    return res
                        .status(400)
                        .json({ message: "Cannot delete: blood group in  use." });
                }

                // Proceed with deletion if not referenced
                const deleteQuery = "DELETE FROM asset_info WHERE id = ?";
                connection.query(
                    deleteQuery,
                    [shiftId],
                    (deleteError, deleteResult) => {
                        if (!deleteError && deleteResult.affectedRows > 0) {
                            console.log(deleteResult);
                            return res.send(deleteResult);
                        } else {
                            console.log(deleteError || "School shift not found");
                            return res
                                .status(404)
                                .json({ message: "School shift not found." });
                        }
                    }
                );
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Server error" });
        }
    },



    asset_info_list_paigination: async (req, res) => {
        const pageNo = Number(req.params.pageNo);
        const perPage = Number(req.params.perPage);
        try {
            const skipRows = (pageNo - 1) * perPage;
            let query = `
      SELECT asset_info.*, 
             users_created.full_name AS created_by,
             users_modified.full_name AS modified_by,
             asset_type.asset_type_name AS asset_type_name 
      FROM asset_info 
      LEFT JOIN users AS users_created ON asset_info.created_by = users_created.id 
      LEFT JOIN users AS users_modified ON asset_info.modified_by = users_modified.id 
      LEFT JOIN asset_type ON asset_info.asset_type_id = asset_type.id

      ORDER BY asset_info.id DESC
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

module.exports = AssetInfoModel