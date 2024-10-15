

const connection = require('../../../../connection/config/database')


const LoanModel = {

    loan_create: async (req, res) => {
        try {
            const { loan_authority, account, loan_reason, reference, loan_type, amount, interest, payment_type, duration, per_month, payable_amount, loan_date, note, status, img, created_by
            } = req.body;
           
            const insertQuery = 'INSERT INTO loan (loan_authority, account, loan_reason, reference, loan_type, amount, interest, payment_type, duration, per_month, payable_amount , loan_date, note, status, img, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const result = await connection.query(insertQuery, [loan_authority, account, loan_reason, reference, loan_type, amount, interest, payment_type, duration, per_month, payable_amount, loan_date, note, status, img, created_by]);

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


    loan_list: async (req, res) => {
        try {
            const data = "select * from  loan";

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

    loan_single: async (req, res) => {
        try {
            const query = 'SELECT * FROM loan WHERE id = ?';
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


    loan_update: async (req, res) => {
        try {

            const { loan_authority, account, loan_reason, reference, loan_type, amount, interest, payment_type, duration, per_month, payable_amount, loan_date, note, status, img, modified_by
            } = req.body;

            const query = `UPDATE loan SET   loan_authority = ?, account = ?, loan_reason = ?, reference = ?, loan_type = ?, amount = ?, interest = ?, payment_type = ?, duration = ?, per_month = ?, payable_amount = ?, loan_date = ?, note = ?, status = ?, img = ?,  modified_by = ? WHERE id = ?`;
            connection.query(query, [loan_authority, account, loan_reason, reference, loan_type, amount, interest, payment_type, duration, per_month, payable_amount, loan_date, note, status, img,  modified_by, req.params.id], (error, result) => {
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


    loan_delete: async (req, res) => {
        // try {
        //     const shiftId = req.params.id;

        //     console.log(shiftId);

        //     // First, check if the shift_id is referenced in employee_joining
        //     const checkQuery =
        //         "SELECT COUNT(*) AS count FROM loan_payment WHERE loan_id = ?";
        //     connection.query(checkQuery, [shiftId], (error, results) => {
        //         if (error) {
        //             console.log(error);
        //             return res.status(500).json({ message: "Database error" });
        //         }

        //         const isReferenced = results[0].count > 0;

        //         if (isReferenced) {
        //             // If referenced, prevent deletion
        //             return res
        //                 .status(400)
        //                 .json({ message: "Cannot delete: blood group in  use." });
        //         }

        //         // Proceed with deletion if not referenced
        //         const deleteQuery = "DELETE FROM loan WHERE id = ?";
        //         connection.query(
        //             deleteQuery,
        //             [shiftId],
        //             (deleteError, deleteResult) => {
        //                 if (!deleteError && deleteResult.affectedRows > 0) {
        //                     console.log(deleteResult);
        //                     return res.send(deleteResult);
        //                 } else {
        //                     console.log(deleteError || "School shift not found");
        //                     return res
        //                         .status(404)
        //                         .json({ message: "School shift not found." });
        //                 }
        //             }
        //         );
        //     });
        // } catch (error) {
        //     console.log(error);
        //     return res.status(500).json({ message: "Server error" });
        // }
    },



    loan_list_paigination: async (req, res) => {
        const pageNo = Number(req.params.pageNo);
        const perPage = Number(req.params.perPage);
        try {
            const skipRows = (pageNo - 1) * perPage;
            let query = `
      SELECT loan.*, 
             users_created.full_name AS created_by,
             users_modified.full_name AS modified_by,
             loan_authority.name AS loan_authority_name 
      FROM loan 
      LEFT JOIN users AS users_created ON loan.created_by = users_created.id 
      LEFT JOIN users AS users_modified ON loan.modified_by = users_modified.id 
      LEFT JOIN loan_authority ON loan.loan_authority = loan_authority.id

      ORDER BY loan.id DESC
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

module.exports = LoanModel