

const connection = require('../../../../connection/config/database')


const AssetTypeModel = {

    asset_type_create: async (req, res) => {
        try {
            const { asset_type_name, status, note, created_by } = req.body;
            if (!asset_type_name || !status) {
                return res.status(400).json({ message: 'brand name and status ID are required' });
            }

            const processedbrandName = asset_type_name.replace(/\s+/g, ' ').trim();

            const selectQuery = 'SELECT * FROM asset_type WHERE TRIM(asset_type_name) = ?';
            const existingBrands = await new Promise((resolve, reject) => {
                connection.query(selectQuery, [processedbrandName], (error, results) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    resolve(results);
                });
            });
            if (existingBrands.length === 0) {
                const insertQuery = 'INSERT INTO asset_type (asset_type_name, status, note, created_by) VALUES (?, ?, ?, ?)';
                const result = await connection.query(insertQuery, [processedbrandName, status, note, created_by]);

                // Sending only the necessary data from the result object
                const { insertId, affectedRows } = result;

                // Sending response with relevant data
                res.status(200).json({ insertId, affectedRows });
            }
            // Using parameterized query to prevent SQL injection

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error processing the request' });
        }
    },


    asset_type_list: async (req, res) => {
        try {
            const data = "select * from  asset_type";

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

    asset_type_single: async (req, res) => {
        try {
            const query = 'SELECT * FROM asset_type WHERE id = ?';
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


    asset_type_update: async (req, res) => {
        try {

            const { asset_type_name, status, note, modified_by } = req.body;


            const query = `UPDATE asset_type SET   asset_type_name = ?, status = ?, note = ?, modified_by = ? WHERE id = ?`;
            connection.query(query, [asset_type_name, status, note, modified_by, req.params.id], (error, result) => {
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


    asset_type_delete: async (req, res) => {
        try {
            const shiftId = req.params.id;

            console.log(shiftId);

            // First, check if the shift_id is referenced in employee_joining
            const checkQuery =
                "SELECT COUNT(*) AS count FROM asset_info WHERE asset_type_id = ?";
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
                const deleteQuery = "DELETE FROM asset_type WHERE id = ?";
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


    // sub_category_list_paigination: async (req, res) => {
    //     const pageNo = Number(req.params.pageNo);
    //     const perPage = Number(req.params.perPage);
    //     try {
    //         const skipRows = (pageNo - 1) * perPage;
    //         let query = `
    //   SELECT sub_category.*, 
    //          users_created.full_name AS created_by,
    //          users_modified.full_name AS modified_by 
    //   FROM sub_category 
    //   LEFT JOIN users AS users_created ON sub_category.created_by = users_created.id 
    //   LEFT JOIN users AS users_modified ON sub_category.modified_by = users_modified.id 
    //   ORDER BY sub_category.id DESC
    //   LIMIT ?, ?
    // `;

    //         connection.query(query, [skipRows, perPage], (error, result) => {
    //             console.log(result)
    //             if (!error) {
    //                 res.send(result)
    //             }

    //             else {
    //                 console.log(error)
    //             }

    //         })
    //     }
    //     catch (error) {
    //         console.log(error)
    //     }
    // },
    asset_type_list_paigination: async (req, res) => {
        const pageNo = Number(req.params.pageNo);
        const perPage = Number(req.params.perPage);
        try {
            const skipRows = (pageNo - 1) * perPage;
            let query = `
      SELECT asset_type.*, 
             users_created.full_name AS created_by,
             users_modified.full_name AS modified_by 
      FROM asset_type 
      LEFT JOIN users AS users_created ON asset_type.created_by = users_created.id 
      LEFT JOIN users AS users_modified ON asset_type.modified_by = users_modified.id 
      ORDER BY asset_type.id DESC
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

module.exports = AssetTypeModel