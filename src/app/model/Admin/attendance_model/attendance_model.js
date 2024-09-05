const { default: axios } = require('axios');
const connection = require('../../../../connection/config/database')
var wkhtmltopdf = require('wkhtmltopdf');
var fs = require("fs");

wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";

// wkhtmltopdf.command = "C:\\Users\\user\\Desktop\\Ecommerce\\node_modules\\wkhtmltopdf\\index.js";
const formatString = (str) => {
    const words = str?.split('_');

    const formattedWords = words?.map((word) => {
        const capitalizedWord = word?.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return capitalizedWord;
    });

    return formattedWords?.join(' ');
};




const AttendanceModel = {


    send_attendance_otp: async (req, res) => {
        try {
            const { quick_api, mobile, msg } = req.body;

            // Validate that required parameters are present
            if (!quick_api || !mobile || !msg) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            console.log('Sending SMS with Params:', { quick_api, mobile, msg });

            const response = await axios.get(
                'https://quicksmsapp.com/Api/sms/campaign_api',
                {
                    params: {
                        quick_api,
                        mobile,
                        msg,
                    },
                }
            );

            console.log('SMS API Response:', response.data);
            res.json(response.data);
        } catch (error) {
            if (error.response) {
                console.error('Error Response:', error.response.data);
                res.status(error.response.status).json({ error: error.response.data });
            } else {
                console.error('Request Error:', error.message);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    },


    // send_attendance_otp: async (req, res) => {
    //     try {
    //       const { quick_api, mobile, msg } = req.body;

    //       // Validate that required parameters are present
    //       if (!quick_api || !mobile || !msg) {
    //         return res.status(400).json({ error: 'Missing required parameters' });
    //       }

    //       const response = await axios.get(
    //         'https://quicksmsapp.com/Api/sms/campaign_api',
    //         {
    //           params: {
    //             quick_api,
    //             mobile,
    //             msg,
    //             // msg: `Your OTP is ${otp}`,
    //           },
    //         }
    //       );
    //       res.json(response.data);
    //     } catch (error) {
    //       console.error('Error:', error.message);
    //       res.status(500).json({ error: 'Internal Server Error' });
    //     }
    //   },

    attendance_create: async (req, res) => {
        try {
            const models = req.body;


            const results = [];

            console.log(models)

            for (const model of models) {
                const { user_id, checktime, created_by, attendance_date, device_id, unique_id } = model;

                // Check if all required fields are present
                const insertQuery = 'INSERT INTO attendance (user_id, checktime, created_by, attendance_date, device_id, unique_id) VALUES (?, ?, ?, ?, ?, ?)';
                const insertedModel = await new Promise((resolve, reject) => {
                    connection.query(insertQuery, [user_id, checktime, created_by, attendance_date, device_id, unique_id], (error, result) => {
                        if (error) {
                            console.log(error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });

                console.log(insertedModel);
                results.push(insertedModel);
            }

            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    absent_create: async (req, res) => {
        try {
            const models = req.body;


            const results = [];

            console.log(models)

            for (const model of models) {
                const { user_id, checktime, created_by, attendance_date, device_id, unique_id } = model;

                // Check if all required fields are present
                const insertQuery = 'INSERT INTO absent (user_id, checktime, created_by, absent_date, device_id, unique_id) VALUES (?, ?, ?, ?, ?, ?)';
                const insertedModel = await new Promise((resolve, reject) => {
                    connection.query(insertQuery, [user_id, checktime, created_by, attendance_date, device_id, unique_id], (error, result) => {
                        if (error) {
                            console.log(error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });

                console.log(insertedModel);
                results.push(insertedModel);
            }

            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // attendance_search: async (req, res) => {
    //     try {
    //         console.log("Search button clicked.");

    //         // Extract necessary data from request
    //         const { employee, itemName, searchQuery } = req.body;

    //         // Construct the base SQL query
    //         let sql = `
    //          SELECT 
    //             ei.*,
    //             eq.education,
    //             eq.institute,
    //             eq.result,
    //             eq.passing_year,
    //             la.division_id AS living_division_id,
    //             la.district_id AS living_district_id,
    //             la.upazila_id AS living_upazila_id,
    //             la.address AS living_address,
    //             pa.division_id AS permanent_division_id,
    //             pa.district_id AS permanent_district_id,
    //             pa.upazila_id AS permanent_upazila_id,
    //             pa.address AS permanent_address,
    //             ej.join_date AS join_date,
    //             ej.payroll_id AS payroll_id,
    //             ej.school_shift_id AS school_shift_id,
    //             ep.designation_id AS designation_id,
    //             ep.branch_id AS branch_id,
    //             d.designation_name,
    //             u.full_name,
    //             u.father_name,
    //             u.mother_name,
    //             u.dob,
    //             u.gender,
    //             u.religion,
    //             u.mobile,
    //             u.email,
    //             u.password,
    //             u.signature_image,
    //             u.photo,
    //             up.father_name AS e_father_name,
    //             up.mother_name AS e_mother_name,
    //             up.father_service AS father_service,
    //             up.mother_service AS mother_service,
    //             pc.father_phone AS father_phone,
    //             pc.mother_phone AS mother_phone
    //         FROM 
    //             employe_info ei
    //         LEFT JOIN 
    //             educational_qualification eq ON ei.user_id = eq.user_id
    //         LEFT JOIN 
    //             living_address la ON ei.user_id = la.user_id
    //         LEFT JOIN 
    //             parmanent_address pa ON ei.user_id = pa.user_id
    //         LEFT JOIN 
    //             employe_joining ej ON ei.user_id = ej.user_id
    //         LEFT JOIN 
    //             employee_promotion ep ON ei.user_id = ep.user_id
    //         LEFT JOIN 
    //             users u ON ei.user_id = u.id
    //         LEFT JOIN 
    //             designation d ON ep.designation_id = d.id
    //         LEFT JOIN 
    //             user_parent up ON ej.user_id = up.user_id
    //         LEFT JOIN 
    //             parent_contact pc ON ej.user_id = pc.user_id
    //         WHERE
    //             ei.user_id IN (SELECT DISTINCT user_id FROM employe_joining)
    //             WHERE 1
    //         `
    //             ;

    //         if (searchQuery) {
    //             sql += ` AND expense.expense_category = ${searchQuery}`;
    //         }

    //         if (supplierId) {
    //             sql += ` AND expense.supplier_id LIKE '%${supplierId}%'`;
    //         }

    //         if (itemName) {

    //             sql += ` AND LOWER(expense_item.item_name) LIKE '%${itemName}%'`;
    //         }

    //         // Add expense name (item_name) search condition



    //         console.log("SQL Query:", sql);

    //         // Execute the constructed SQL query
    //         connection.query(sql, (error, results, fields) => {
    //             if (error) {
    //                 console.error("Error occurred during search:", error);
    //                 res.status(500).json({ error: "An error occurred during search." });
    //             } else {
    //                 console.log("Search results:", results);
    //                 res.status(200).json({ results });
    //             }
    //         });
    //     } catch (error) {
    //         console.error("An error occurred:", error);
    //         res.status(500).json({ error: "An error occurred." });
    //     }
    // },




    attendance_search: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { employee, itemName, searchQuery } = req.body;

            // Construct the base SQL query
            let sql = `
                SELECT 
                    ei.*,
                    eq.education,
                    eq.institute,
                    eq.result,
                    eq.passing_year,
                    la.division_id AS living_division_id,
                    la.district_id AS living_district_id,
                    la.upazila_id AS living_upazila_id,
                    la.address AS living_address,
                    pa.division_id AS permanent_division_id,
                    pa.district_id AS permanent_district_id,
                    pa.upazila_id AS permanent_upazila_id,
                    pa.address AS permanent_address,
                    ej.join_date AS join_date,
                    ej.payroll_id AS payroll_id,
                    ej.school_shift_id AS school_shift_id,
                    ep.designation_id AS designation_id,
                    ep.branch_id AS branch_id,
                    d.designation_name,
                    u.full_name,
                    u.father_name,
                    u.mother_name,
                    u.dob,
                    u.gender,
                    u.religion,
                    u.mobile,
                    u.email,
                    u.password,
                    u.unique_id,
                    u.signature_image,
                    u.photo,
                    up.father_name AS e_father_name,
                    up.mother_name AS e_mother_name,
                    up.father_service AS father_service,
                    up.mother_service AS mother_service,
                    pc.father_phone AS father_phone,
                    pc.mother_phone AS mother_phone
                FROM 
                    employe_info ei
                LEFT JOIN 
                    educational_qualification eq ON ei.user_id = eq.user_id
                LEFT JOIN 
                    living_address la ON ei.user_id = la.user_id
                LEFT JOIN 
                    parmanent_address pa ON ei.user_id = pa.user_id
                LEFT JOIN 
                    employe_joining ej ON ei.user_id = ej.user_id
                LEFT JOIN 
                    employee_promotion ep ON ei.user_id = ep.user_id
                LEFT JOIN 
                    users u ON ei.user_id = u.id
                LEFT JOIN 
                    designation d ON ep.designation_id = d.id
                LEFT JOIN 
                    user_parent up ON ej.user_id = up.user_id
                LEFT JOIN 
                    parent_contact pc ON ej.user_id = pc.user_id
                WHERE
                    1=1
            `;

            // Add search conditions based on the provided parameters
            if (employee) {
                sql += ` AND ei.user_id LIKE '%${employee}%'`;
            }

            if (searchQuery) {
                sql += ` AND ep.designation_id LIKE '%${searchQuery}%'`;
            }

            if (itemName) {
                sql += ` AND ep.branch_id LIKE '%${itemName}%'`;
            }




            console.log("SQL Query:", sql);

            // Execute the constructed SQL query
            connection.query(sql, async (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to fetch employee data' });
                    return;
                }

                // Process results to aggregate educational qualifications
                const employees = {};
                results.forEach(row => {
                    const userId = row.user_id;
                    if (!employees[userId]) {
                        employees[userId] = {
                            ...row,
                            educational_qualifications: []
                        };
                    }
                    if (row.education) {
                        employees[userId].educational_qualifications.push({
                            education: row.education,
                            institute: row.institute,
                            result: row.result,
                            passing_year: row.passing_year
                        });
                    }
                });

                const processedResults = Object.values(employees);
                res.status(200).json(processedResults);
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "An error occurred." });
        }
    },

    // attendance_list: async (req, res) => {
    //     try {

    //         const query = `
    //             SELECT 
    //                 attendance.*, 
    //                 users.full_name, 
    //                 users.unique_id, 
    //                 users.photo, 
    //                 employee_promotion.designation_id,
    //                 employee_promotion.branch_id,
    //                 designation.designation_name
    //             FROM 
    //                 attendance
    //             JOIN 
    //                 users ON attendance.user_id = users.id
    //             LEFT JOIN 
    //                 employee_promotion ON attendance.user_id = employee_promotion.user_id
    //             LEFT JOIN 
    //                 designation ON employee_promotion.designation_id = designation.id

    //         `;

    //         connection.query(query, function (error, result) {
    //             if (!error) {
    //                 res.send(result);
    //             } else {
    //                 console.log(error);
    //                 res.status(500).send('Database query error');
    //             }
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send('Internal server error');
    //     }
    // },

    attendance_list: async (req, res) => {
        try {
            const query = `
                SELECT 
                attendance.*,
                    attendance.user_id,
                    users.full_name, 
                    users.unique_id, 
                    users.photo, 
                    employee_promotion.designation_id,
                    employee_promotion.branch_id,
                    designation.designation_name,
                    DATE(attendance.checktime) AS check_date,
                    MIN(attendance.checktime) AS entry_checktime,
                    MAX(attendance.checktime) AS exit_checktime
                FROM 
                    attendance
                JOIN 
                    users ON attendance.user_id = users.id
                LEFT JOIN 
                    employee_promotion ON attendance.user_id = employee_promotion.user_id
                LEFT JOIN 
                    designation ON employee_promotion.designation_id = designation.id
                GROUP BY 
                    attendance.user_id, check_date
            `;

            connection.query(query, function (error, result) {
                if (!error) {
                    res.send(result);
                } else {
                    console.log(error);
                    res.status(500).send('Database query error');
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    },


    attendance_list_all_data: async (req, res) => {
        try {
            const query = `
             SELECT 
                a.id,
                a.user_id,
                a.attendance_date,
                a.device_id,
                a.unique_id,
                a.created_date,
                MIN(a.checktime) as first_checkin,
                MAX(b.checktime) as last_checkout
            FROM 
                attendance a
            JOIN 
                attendance b 
            ON 
                a.user_id = b.user_id AND DATE(a.checktime) = DATE(b.checktime)
            WHERE 
                a.checktime = (
                    SELECT MIN(checktime)
                    FROM attendance
                    WHERE user_id = a.user_id AND DATE(checktime) = DATE(a.checktime)
                )
            AND 
                b.checktime = (
                    SELECT MAX(checktime)
                    FROM attendance
                    WHERE user_id = b.user_id AND DATE(checktime) = DATE(b.checktime)
                )
            GROUP BY 
                a.user_id, DATE(a.checktime)`;

            connection.query(query, function (error, result) {
                if (!error) {
                    res.send(result);
                } else {
                    console.log(error);
                    res.status(500).send('Database query error');
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    },


    absent_list: async (req, res) => {
        try {
           
           

            // Main query to join the subquery with other tables
            const query = `
                SELECT * from absent`;

            connection.query(query, function (error, result) {
                if (!error) {
                    res.send(result);
                } else {
                    console.error('Database query error:', error);
                    res.status(500).send('Database query error');
                }
            });
        } catch (error) {
            console.error('Internal server error:', error);
            res.status(500).send('Internal server error');
        }
    },


    // attendance_list: async (req, res) => {
    //     try {
    //         // Subquery to get the min and max checktime for each user_id
    //         const subquery = `
    //             SELECT 
    //                 user_id,
    //                 MIN(checktime) AS min_checktime,
    //                 MAX(checktime) AS max_checktime
    //             FROM 
    //                 attendance
    //             GROUP BY 
    //                 user_id
    //         `;

    //         // Main query to join the subquery with other tables and select one record per user_id
    //         const query = `
    //             SELECT 
    //                 fa.user_id,
    //                 fa.min_checktime,
    //                 fa.max_checktime,
    //                 MIN(att.id) AS attendance_id,
    //                 att.created_by,
    //                 att.created_date,
    //                 att.modified_by,
    //                 att.modified_date,
    //                 att.attendance_date,
    //                 att.device_id,
    //                 att.checktime,
    //                 users.unique_id,
    //                 users.full_name,
    //                 users.photo,
    //                 employee_promotion.designation_id,
    //                 employee_promotion.branch_id,
    //                 designation.designation_name
    //             FROM 
    //                 (${subquery}) AS fa
    //             JOIN 
    //                 attendance AS att ON fa.user_id = att.user_id AND (att.checktime = fa.min_checktime OR att.checktime = fa.max_checktime)
    //             JOIN 
    //                 users ON fa.user_id = users.id
    //             LEFT JOIN 
    //                 employee_promotion ON fa.user_id = employee_promotion.user_id
    //             LEFT JOIN 
    //                 designation ON employee_promotion.designation_id = designation.id
    //             GROUP BY 
    //                 fa.user_id, fa.min_checktime, fa.max_checktime, users.unique_id, users.full_name, users.photo, employee_promotion.designation_id, employee_promotion.branch_id, designation.designation_name
    //         `;

    //         connection.query(query, function (error, result) {
    //             if (!error) {
    //                 res.send(result);
    //             } else {
    //                 console.error('Database query error:', error);
    //                 res.status(500).send('Database query error');
    //             }
    //         });
    //     } catch (error) {
    //         console.error('Internal server error:', error);
    //         res.status(500).send('Internal server error');
    //     }
    // },




    // attendance_list_search: async (req, res) => {
    //     try {
    //         console.log("Search button clicked.");

    //         // Extract necessary data from request
    //         const {  searchQuery, itemName, employee, month, fromDate, toDate } = req.body;

    //         // Construct the base SQL query
    //         let sql = `
    //         SELECT 
    //             attendance.*,
    //                 attendance.user_id,
    //                 users.full_name, 
    //                 users.unique_id, 
    //                 users.photo, 
    //                 employee_promotion.designation_id,
    //                 employee_promotion.branch_id,
    //                 designation.designation_name,
    //                 DATE(attendance.checktime) AS check_date,
    //                 MIN(attendance.checktime) AS entry_checktime,
    //                 MAX(attendance.checktime) AS exit_checktime
    //             FROM 
    //                 attendance
    //             JOIN 
    //                 users ON attendance.user_id = users.id
    //             LEFT JOIN 
    //                 employee_promotion ON attendance.user_id = employee_promotion.user_id
    //             LEFT JOIN 
    //                 designation ON employee_promotion.designation_id = designation.id
    //             GROUP BY 
    //                 attendance.user_id, check_date 
    //         WHERE 1=1`;

    //         const queryParams = [];

    //         if (searchQuery) {
    //             sql += ` AND employee_promotion.designation_id = ?`;
    //             queryParams.push(searchQuery);
    //         }
    //         if (employee) {
    //             sql += ` AND attendance.user_id = ?`;
    //             queryParams.push(employee);
    //         }
    //         if (itemName) {
    //             sql += ` AND employee_promotion.branch_id = ?`;
    //             queryParams.push(itemName);
    //         }
    //         if (month) {
    //             sql += ` AND DATE_FORMAT(attendance.attendance_date, '%Y-%m') = ?`;
    //             queryParams.push(month);
    //         }
    //         if (fromDate && toDate) {
    //             sql += ` AND attendance.created_date BETWEEN '${fromDate}' AND '${toDate}'`;
    //         }

    //         console.log("Constructed SQL Query:", sql);
    //         console.log("Query Parameters:", queryParams);

    //         // Execute the constructed SQL query
    //         connection.query(sql, queryParams, (error, results, fields) => {
    //             if (error) {
    //                 console.error("Error occurred during search:", error);
    //                 res.status(500).json({ error: "An error occurred during search." });
    //             } else {
    //                 console.log("Search results:", results);
    //                 res.status(200).json({ results });
    //             }
    //         });
    //     } catch (error) {
    //         console.error("An error occurred:", error);
    //         res.status(500).json({ error: "An error occurred." });
    //     }
    // },

    attendance_list_search: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { searchQuery, itemName, employee, month, fromDate, toDate } = req.body;

            // Construct the base SQL query
            let sql = `
            SELECT 
                attendance.*,
                users.full_name, 
                users.unique_id, 
                users.photo, 
                employee_promotion.designation_id,
                employee_promotion.branch_id,
                designation.designation_name,
                DATE(attendance.checktime) AS check_date,
                MIN(attendance.checktime) AS entry_checktime,
                MAX(attendance.checktime) AS exit_checktime
            FROM 
                attendance
            JOIN 
                users ON attendance.user_id = users.id
            LEFT JOIN 
                employee_promotion ON attendance.user_id = employee_promotion.user_id
            LEFT JOIN 
                designation ON employee_promotion.designation_id = designation.id
            WHERE 1=1`;

            const queryParams = [];

            if (searchQuery) {
                sql += ` AND employee_promotion.designation_id = ?`;
                queryParams.push(searchQuery);
            }
            if (employee) {
                sql += ` AND attendance.user_id = ?`;
                queryParams.push(employee);
            }
            if (itemName) {
                sql += ` AND employee_promotion.branch_id = ?`;
                queryParams.push(itemName);
            }
            if (month) {
                sql += ` AND DATE_FORMAT(attendance.attendance_date, '%Y-%m') = ?`;
                queryParams.push(month);
            }
            if (fromDate && toDate) {
                sql += ` AND attendance.created_date BETWEEN ? AND ?`;
                queryParams.push(fromDate, toDate);
            }

            sql += ` GROUP BY attendance.user_id, check_date`;

            console.log("Constructed SQL Query:", sql);
            console.log("Query Parameters:", queryParams);

            // Execute the constructed SQL query
            connection.query(sql, queryParams, (error, results, fields) => {
                if (error) {
                    console.error("Error occurred during search:", error);
                    res.status(500).json({ error: "An error occurred during search." });
                } else {
                    console.log("Search results:", results);
                    res.status(200).json({ results });
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "An error occurred." });
        }
    },



    attendance_list_pdf: async (req, res) => {
        try {
            const { searchResults, monthName, orientation, selectedPrintSize, fontSize } = req.body;

            console.log(searchResults, 'here all the searchResults');

            let tableRows = '';
            searchResults?.forEach((result, index) => {
                console.log(`http://192.168.0.185:5003/${result.photo}`)
                let row = '<tr>';

                row += `<td>${index + 1}</td>`; // Serial column
                row += `<td>${result.unique_id}</td>`; // Person Name
                row += ` <td>${result.full_name}</td>`; // Person Name
                row += `<td></td>`; // Person Name
                //  row += `<td><img src="http://192.168.0.185:5003/${ result.photo ? result.photo : ''}" style="max-width: 100px;" alt="Image"/></td>`; // Person Name
                row += `  <td>${result.designation_name}</td>`; // Person Name
                row += ` <td>${monthName}</td>`; // Person Name
                row += ` <td></td>`; // Person Name
                row += `<td></td>`; // Person Name
                row += ` <td>${result.entry_checktime}</td>`; // Person Name
                row += `<td>${result.exit_checktime}</td>`; // Person Name


                row += '</tr>';
                tableRows += row;
            });
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';
            const html = `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                    * { 
                        sheet-size: A4;
                        font-family: 'Nikosh', sans-serif !important;
                       
                        font-size: ${fontSize || '12px'}; /* Apply dynamic font size */
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        max-height: 100px;
                    }
                    .container {
                        text-align: center;
                    }
                    .container2 {
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 style="margin: 0; padding: 0;">Pathshala School & College Attendance List</h2>
                    <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
                    <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>
                    <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Attendance List</h3>
                </div>
                <div class="container2">
                    <p style="margin: 0; padding: 0;">Receipt No: 829</p>
                    <p style="margin: 0; padding: 0;">Collected By:</p>
                    <p style="margin: 0; padding: 0;">Date: </p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL No.</th>
                             <th>Employee ID</th>
                                                            <th>Name</th>
                                                            <th>Photo</th>
                                                            <th>Designation</th>
                                                            <th>Month</th>
                                                            <th>Date</th>
                                                            <th>Day</th>
                                                            <th>Entry Time</th>
                                                            <th>Exit Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>`;

            wkhtmltopdf(html, { pageSize: pageSize, orientation: pageOrientation }, (err, stream) => {
                if (err) {
                    console.error('Error generating PDF:', err);
                    console.error('Error details:', err.stderr); // Log additional details from stderr
                    res.status(500).send('Error generating PDF');
                    return;
                }
                stream.pipe(res);
            });
        } catch (error) {
            console.error('Error in attendance_pdf:', error);
            res.status(500).send('Error generating PDF');
        }
    },


    attendance_list_print: async (req, res) => {
        try {
            const { searchResults, monthName, orientation, selectedPrintSize, fontSize } = req.body;

            console.log(searchResults, 'here all the searchResults');

            let tableRows = '';
            searchResults?.forEach((result, index) => {
                let row = '<tr>';

                // Static column setup
                row += `<td>${index + 1}</td>`; // Serial column
                row += `<td>${result.unique_id}</td>`; // Person Name
                row += ` <td>${result.full_name}</td>`; // Person Name
                row += `<td><img src="http://192.168.0.185:5003/${result.photo}" style="max-width: 100px;" alt="Image"/></td>`; // Person Name
                row += `  <td>${result.designation_name}</td>`; // Person Name
                row += ` <td>${monthName}</td>`; // Person Name
                row += ` <td></td>`; // Person Name
                row += `<td></td>`; // Person Name
                row += ` <td>${result.entry_checktime}</td>`; // Person Name
                row += `<td>${result.exit_checktime}</td>`; // Person Name



                row += '</tr>';
                tableRows += row;
            });

            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';

            const html = `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
               @page {
                        size: ${pageSize} ${pageOrientation}; /* This sets the page size to A4 and orientation to Portrait */
                        margin: 20mm; /* Adjust the margin as needed */
                    }
                    * { 
                        font-family: 'Nikosh', sans-serif !important;
                        font-size: ${fontSize || '12px'}; /* Apply dynamic font size */
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        max-height: 100px;
                    }
                    .container {
                        text-align: center;
                    }
                    .container2 {
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 style="margin: 0; padding: 0;">Pathshala School & College Attendance List</h2>
                    <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
                    <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>
                    <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Attendance List</h3>
                </div>
                <div class="container2">
                    <p style="margin: 0; padding: 0;">Receipt No: 829</p>
                    <p style="margin: 0; padding: 0;">Collected By:</p>
                    <p style="margin: 0; padding: 0;">Date: </p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL No.</th>
                             <th>Employee ID</th>
                                                            <th>Name</th>
                                                            <th>Photo</th>
                                                            <th>Designation</th>
                                                            <th>Month</th>
                                                            <th>Date</th>
                                                            <th>Day</th>
                                                            <th>Entry Time</th>
                                                            <th>Exit Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            <script>
                window.print();
            </script>
            </html>`;

            res.send(html); // Send the HTML directly to the client
        } catch (error) {
            console.error('Error in office_visit_person_print:', error);
            res.status(500).send('Error generating print view');
        }
    },



    attendance_log_search: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { itemName, searchQuery, employee, deviceName, fromDate } = req.body;

            // Construct the base SQL query
            let sql = `
            SELECT 
                     attendance.*, 
                     users.full_name, 
                     users.unique_id, 
                     users.photo, 
                     employee_promotion.designation_id,
                     employee_promotion.branch_id,
                     designation.designation_name
                 FROM 
                     attendance
                LEFT JOIN 
                     users ON attendance.user_id = users.id
                 LEFT JOIN 
                     employee_promotion ON attendance.user_id = employee_promotion.user_id
                 LEFT JOIN 
                     designation ON employee_promotion.designation_id = designation.id
            WHERE 1=1`;

            const queryParams = [];

            if (searchQuery) {
                sql += ` AND employee_promotion.designation_id = ?`;
                queryParams.push(searchQuery);
            }
            if (employee) {
                sql += ` AND attendance.user_id = ?`;
                queryParams.push(employee);
            }
            if (itemName) {
                sql += ` AND employee_promotion.branch_id = ?`;
                queryParams.push(itemName);
            }


            if (deviceName) {
                sql += ` AND LOWER(attendance.device_id) LIKE ?`;
                queryParams.push(`%${deviceName.toLowerCase()}%`);
            }

            if (fromDate && fromDate) {
                sql += ` AND attendance.attendance_date BETWEEN ? AND ?`;
                queryParams.push(fromDate, fromDate);
            }

            // sql += ` GROUP BY attendance.user_id`;

            console.log("Constructed SQL Query:", sql);
            console.log("Query Parameters:", queryParams);

            // Execute the constructed SQL query
            connection.query(sql, queryParams, (error, results, fields) => {
                if (error) {
                    console.error("Error occurred during search:", error);
                    res.status(500).json({ error: "An error occurred during search." });
                } else {
                    console.log("Search results:", results);
                    res.status(200).json({ results });
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "An error occurred." });
        }
    },

    attendance_log_print: async (req, res) => {
        try {
            const { searchResults, orientation, selectedPrintSize, fontSize } = req.body;

            console.log(searchResults, 'here all the searchResults');

            let tableRows = '';
            searchResults?.forEach((result, index) => {
                let row = '<tr>';

                // Static column setup
                row += `<td>${index + 1}</td>`; // Serial column
                row += `<td>${result.unique_id}</td>`; // Person Name
                row += ` <td>${result.full_name}</td>`; // Person Name
                row += `<td><img src="http://192.168.0.185:5003/${result.photo}" style="max-width: 100px;" alt="Image"/></td>`; // Person Name
                row += `  <td>${result.designation_name}</td>`; // Person Name

                row += ` <td>${result.attendance_date}</td>`; // Person Name

                row += ` <td>${result.checktime}</td>`; // Person Name




                row += '</tr>';
                tableRows += row;
            });

            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';

            const html = `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                @page {
                        size: ${pageSize} ${pageOrientation}; /* This sets the page size to A4 and orientation to Portrait */
                        margin: 20mm; /* Adjust the margin as needed */
                    }
                    * { 
                        font-family: 'Nikosh', sans-serif !important;
                        font-size: ${fontSize || '12px'}; /* Apply dynamic font size */
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        max-height: 100px;
                    }
                    .container {
                        text-align: center;
                    }
                    .container2 {
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 style="margin: 0; padding: 0;">Pathshala School & College Attendance List</h2>
                    <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
                    <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>
                    <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Attendance List</h3>
                </div>
                <div class="container2">
                    <p style="margin: 0; padding: 0;">Receipt No: 829</p>
                    <p style="margin: 0; padding: 0;">Collected By:</p>
                    <p style="margin: 0; padding: 0;">Date: </p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL No.</th>
                             <th>Employee ID</th>
                                                            <th>Name</th>
                                                            <th>Photo</th>
                                                            <th>Designation</th>
                                                           
                                                            <th>Date</th>
                                                            
                                                            <th>Time</th>
                                                           
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            <script>
                window.print();
            </script>
            </html>`;

            res.send(html); // Send the HTML directly to the client
        } catch (error) {
            console.error('Error in office_visit_person_print:', error);
            res.status(500).send('Error generating print view');
        }
    },

    attendance_log_pdf: async (req, res) => {
        try {
            const { searchResults, orientation, selectedPrintSize, fontSize } = req.body;

            console.log(searchResults, 'here all the searchResults');

            let tableRows = '';
            searchResults?.forEach((result, index) => {
                console.log(`http://192.168.0.185:5003/${result.photo}`)
                let row = '<tr>';

                row += `<td>${index + 1}</td>`; // Serial column
                row += `<td>${result.unique_id}</td>`; // Person Name
                row += ` <td>${result.full_name}</td>`; // Person Name
                row += `<td></td>`; // Person Name
                //  row += `<td><img src="http://192.168.0.185:5003/${ result.photo ? result.photo : ''}" style="max-width: 100px;" alt="Image"/></td>`; // Person Name
                row += `  <td>${result.designation_name}</td>`; // Person Name
                row += ` <td>${result.attendance_date}</td>`; // Person Name

                row += ` <td>${result.checktime}</td>`; // Person Name



                row += '</tr>';
                tableRows += row;
            });

            const html = `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                    * { 
                font-family: 'Nikosh', sans-serif !important;
                font-size: ${fontSize || '12px'}; /* Apply dynamic font size */
            }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        max-height: 100px;
                    }
                    .container {
                        text-align: center;
                    }
                    .container2 {
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 style="margin: 0; padding: 0;">Pathshala School & College Attendance List</h2>
                    <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
                    <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>
                    <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Attendance List</h3>
                </div>
                <div class="container2">
                    <p style="margin: 0; padding: 0;">Receipt No: 829</p>
                    <p style="margin: 0; padding: 0;">Collected By:</p>
                    <p style="margin: 0; padding: 0;">Date: </p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL No.</th>
                             <th>Employee ID</th>
                                                            <th>Name</th>
                                                            <th>Photo</th>
                                                            <th>Designation</th>
                                                            
                                                            <th>Date</th>
                                                          
                                                            <th> Time</th>
                                                           
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>`;
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';

            wkhtmltopdf(html, { pageSize: pageSize, orientation: pageOrientation }, (err, stream) => {
                if (err) {
                    console.error('Error generating PDF:', err);
                    console.error('Error details:', err.stderr); // Log additional details from stderr
                    res.status(500).send('Error generating PDF');
                    return;
                }
                stream.pipe(res);
            });
        } catch (error) {
            console.error('Error in attendance_pdf:', error);
            res.status(500).send('Error generating PDF');
        }
    },


    attendance_summary_search: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { itemName } = req.body;

            // Construct the base SQL query
            let sql = `
            SELECT 
                ei.*,
                eq.education,
                eq.institute,
                eq.result,
                eq.passing_year,
                la.division_id AS living_division_id,
                la.district_id AS living_district_id,
                la.upazila_id AS living_upazila_id,
                la.address AS living_address,
                pa.division_id AS permanent_division_id,
                pa.district_id AS permanent_district_id,
                pa.upazila_id AS permanent_upazila_id,
                pa.address AS permanent_address,
                ej.join_date AS join_date,
                ej.payroll_id AS payroll_id,
                ej.school_shift_id AS school_shift_id,
                ep.designation_id AS designation_id,
                ep.branch_id AS branch_id,
                d.designation_name,
                u.full_name,
                u.father_name,
                u.mother_name,
                u.dob,
                u.gender,
                u.religion,
                u.mobile,
                u.unique_id,
                u.email,
                u.password,
                u.signature_image,
                u.photo,
                up.father_name AS e_father_name,
                up.mother_name AS e_mother_name,
                up.father_service AS father_service,
                up.mother_service AS mother_service,
                pc.father_phone AS father_phone,
                pc.mother_phone AS mother_phone
            FROM 
                employe_info ei
            LEFT JOIN 
                educational_qualification eq ON ei.user_id = eq.user_id
            LEFT JOIN 
                living_address la ON ei.user_id = la.user_id
            LEFT JOIN 
                parmanent_address pa ON ei.user_id = pa.user_id
            LEFT JOIN 
                employe_joining ej ON ei.user_id = ej.user_id
            LEFT JOIN 
                employee_promotion ep ON ei.user_id = ep.user_id
            LEFT JOIN 
                users u ON ei.user_id = u.id
            LEFT JOIN 
                designation d ON ep.designation_id = d.id
            LEFT JOIN 
                user_parent up ON ej.user_id = up.user_id
            LEFT JOIN 
                parent_contact pc ON ej.user_id = pc.user_id
            WHERE
                ei.user_id IN (SELECT DISTINCT user_id FROM employe_joining)
            `;

            const queryParams = [];


            if (itemName) {
                sql += ` AND ep.branch_id = ?`;
                queryParams.push(itemName);
            }



            // if (transformedData && Array.isArray(transformedData) && transformedData.length > 0) {
            //     const values = transformedData.map(item => item.value);
            //     sql += ` AND DATE_FORMAT(attendance.attendance_date, '%Y-%m') IN (${values.map(() => '?').join(', ')})`;
            //     queryParams.push(...values);
            // }

            // sql += ` GROUP BY attendance.user_id`;

            console.log("Constructed SQL Query:", sql);
            console.log("Query Parameters:", queryParams);

            // Execute the constructed SQL query
            // connection.query(sql, queryParams, (error, results, fields) => {
            //     if (error) {
            //         console.error("Error occurred during search:", error);
            //         res.status(500).json({ error: "An error occurred during search." });
            //     } else {
            //         console.log("Search results:", results);
            //         res.status(200).json({ results });
            //     }
            // });
            connection.query(sql, queryParams, async (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to fetch employee data' });
                    return;
                }

                // Process results to aggregate educational qualifications
                const employees = {};
                results.forEach(row => {
                    const userId = row.user_id;
                    if (!employees[userId]) {
                        employees[userId] = {
                            ...row,
                            educational_qualifications: []
                        };
                    }
                    if (row.education) {
                        employees[userId].educational_qualifications.push({
                            education: row.education,
                            institute: row.institute,
                            result: row.result,
                            passing_year: row.passing_year
                        });
                    }
                });

                const processedResults = Object.values(employees);
                res.status(200).json(processedResults);
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "An error occurred." });
        }
    },




    attendance_summary_print: async (req, res) => {
        try {
            const { searchResults, transformedDatas, sumOfTotalDays, filteredAttendances, matchLength, result, orientation, selectedPrintSize, fontSize, extraColumnValue } = req.body;

            // Debugging logs
            console.log('searchResults:', searchResults);
            console.log('transformedDatas:', transformedDatas);
            console.log('sumOfTotalDays:', sumOfTotalDays);
            console.log('filteredAttendances:', filteredAttendances);
            console.log('matchLength:', matchLength);
            console.log('result:', result);

            let tableRows = '';
            let extraColumnHeaders = '';
            let extraColumnData = '';

            // Create table headers
            let header = '<tr>';
            header += `<th>Employee ID</th>`;
            header += `<th>Name</th>`;
            header += `<th>Designation</th>`;
            header += `<th>Total Working Day</th>`;
            header += `<th>Total Present</th>`;
            header += `<th>Total Absent</th>`;

            if (transformedDatas && transformedDatas.length > 0) {
                header += transformedDatas.map(month => `<th>${month.label}</th>`).join('');
            }

            // Create editable extra columns based on extraColumnValue
            if (extraColumnValue && extraColumnValue > 0) {
                for (let i = 1; i <= extraColumnValue; i++) {
                    extraColumnHeaders += `<th><input type="text" name="extraColumnHeader_${i}" value=" Column ${i}" /></th>`;
                }
            }

            header += extraColumnHeaders;
            header += '</tr>';

            // Create table rows
            if (searchResults && searchResults.length > 0) {
                tableRows = searchResults.map((attendances, i) => {
                    let row = '<tr>';
                    row += `<td>${attendances.unique_id}</td>`;
                    row += `<td>${attendances.full_name}</td>`;
                    row += `<td>${attendances.designation_name}</td>`;

                    const totalWorkingDay = parseFloat(sumOfTotalDays) - (parseFloat(filteredAttendances.length) + parseFloat(matchLength.find(item => item.user_id === attendances.user_id)?.match_length || 0));
                    const totalPresent = result.find(item => item.user_id === attendances.user_id)?.match_length_total || 0;
                    const totalAbsent = totalWorkingDay - totalPresent;

                    row += `<td>${totalWorkingDay}</td>`;
                    row += `<td>${totalPresent}</td>`;
                    row += `<td>${totalAbsent}</td>`;

                    if (transformedDatas && transformedDatas.length > 0) {
                        row += transformedDatas.map(month => {
                            const match = result.find(d =>
                                d.user_id === attendances.user_id &&
                                d.month === month.value
                            );
                            return `<td>${match ? match.count : 0}</td>`;
                        }).join('');
                    }

                    // Add editable cells for extra columns
                    if (extraColumnValue && extraColumnValue > 0) {
                        for (let i = 1; i <= extraColumnValue; i++) {
                            row += `<td><input type="text" name="extraColumnValue_${attendances.user_id}_${i}" value="Value" /></td>`;
                        }
                    }

                    row += '</tr>';
                    return row;
                }).join('');
            }

            // Determine the page size and orientation based on selectedPrintSize and orientation
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';

            // Generate HTML
            const html = `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                    @page {
                        size: ${pageSize} ${pageOrientation}; /* This sets the page size to A4 and orientation to Portrait */
                        margin: 20mm; /* Adjust the margin as needed */
                    }
                    * { 
                        font-family: 'Nikosh', sans-serif !important;
                        font-size: ${fontSize || '12px'}; /* Apply dynamic font size */
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        max-height: 100px;
                    }
                    .container {
                        text-align: center;
                    }
                    .container2 {
                        display: flex;
                        justify-content: space-between;
                    }
                    input[type="text"] {
                        border: none;
                        background-color: transparent;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 style="margin: 0; padding: 0;">Pathshala School & College Attendance List</h2>
                    <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
                    <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>
                    <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Attendance List</h3>
                </div>
                <div class="container2">
                    <p style="margin: 0; padding: 0;">Receipt No: 829</p>
                    <p style="margin: 0; padding: 0;">Collected By:</p>
                    <p style="margin: 0; padding: 0;">Date: </p>
                </div>
                <table>
                    <thead>
                        ${header}
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            <script>
                window.print();
            </script>
            </html>`;

            res.send(html); // Send the HTML directly to the client
        } catch (error) {
            console.error('Error in attendance_summary_print:', error);
            res.status(500).send('Error generating print view');
        }
    },




    attendance_summary_pdf: async (req, res) => {
        try {
            const { searchResults, transformedDatas, sumOfTotalDays, filteredAttendances, matchLength, result, orientation, selectedPrintSize, fontSize } = req.body;

            console.log(searchResults, 'here all the searchResults');

            let tableRows = '';
            searchResults?.forEach((attendances, i) => {

                let row = '<tr>';

                row += `<td>${attendances.unique_id}</td>`; // Employee ID
                row += `<td>${attendances.full_name}</td>`; // Name
                row += `<td>${attendances.designation_name}</td>`; // Designation

                const totalWorkingDays = parseFloat(sumOfTotalDays);
                const totalPresent = parseFloat(result.find(item => item.user_id === attendances.user_id)?.match_length_total || 0);
                const totalAbsent = totalWorkingDays - (parseFloat(filteredAttendances.length) + parseFloat(matchLength.find(item => item.user_id === attendances.user_id)?.match_length || 0)) - totalPresent;

                row += `<td>${totalWorkingDays - (parseFloat(filteredAttendances.length) + parseFloat(matchLength.find(item => item.user_id === attendances.user_id)?.match_length || 0))}</td>`; // Total Working Day
                row += `<td>${totalPresent}</td>`; // Total Present
                row += `<td>${totalAbsent}</td>`; // Total Absent

                transformedDatas.forEach(month => {
                    const match = result.find(d =>
                        d.user_id === attendances.user_id &&
                        d.month === month.value
                    );
                    row += `<td>${match ? match.count : 0}</td>`;
                });

                row += '</tr>';
                tableRows += row;
            });

            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';

            const html = `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Attendance Summary</title>
                <style>
                     @page {
                        size: ${pageSize} ${pageOrientation}; /* This sets the page size to A4 and orientation to Portrait */
                        margin: 20mm; /* Adjust the margin as needed */
                    }
                    * { 
                        font-family: 'Nikosh', sans-serif !important;
                        font-size: ${fontSize || '12px'}; /* Apply dynamic font size */
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        max-height: 100px;
                    }
                    .container {
                        text-align: center;
                    }
                    .container2 {
                        display: flex;
                        justify-content: space-between;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 style="margin: 0; padding: 0;">Pathshala School & College Attendance List</h2>
                    <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
                    <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>
                    <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Attendance List</h3>
                </div>
                <div class="container2">
                    <p style="margin: 0; padding: 0;">Receipt No: 829</p>
                    <p style="margin: 0; padding: 0;">Collected By:</p>
                    <p style="margin: 0; padding: 0;">Date: </p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Total Working Day</th>
                            <th>Total Present</th>
                            <th>Total Absent</th>
                            ${transformedDatas?.map(month => `<th>${month.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>`;

            wkhtmltopdf(html, { pageSize: pageSize, orientation: pageOrientation }, (err, stream) => {
                if (err) {
                    console.error('Error generating PDF:', err);
                    console.error('Error details:', err.stderr); // Log additional details from stderr
                    res.status(500).send('Error generating PDF');
                    return;
                }
                stream.pipe(res);
            });
        } catch (error) {
            console.error('Error in attendance_summary_pdf:', error);
            res.status(500).send('Error generating PDF');
        }
    },





    //  attendance Details

    attendance_details_list: async (req, res) => {
        try {
            // First query: get leave applications
            const leaveApplicationsQuery = `
                SELECT la.*
                FROM leave_application la
                WHERE la.application_status = 2
            `;
            
            // Query 1: Get leave applications
            connection.query(leaveApplicationsQuery, function (error, leaveApplications) {
                if (error) {
                    console.log(error);
                    return res.status(500).send('Database query error');
                }
    
                // Second query: get leave application dates
                const leaveApplicationDatesQuery = `
                    SELECT lad.id, lad.leave_application_id, lad.leave_date
                    FROM leave_application_date lad
                `;
                
                // Query 2: Get leave application dates
                connection.query(leaveApplicationDatesQuery, function (error, leaveApplicationDates) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send('Database query error');
                    }
    
                    // Create a map to group leave application dates by leave_application_id
                    const leaveDatesMap = leaveApplicationDates.reduce((acc, date) => {
                        if (!acc[date.leave_application_id]) {
                            acc[date.leave_application_id] = [];
                        }
                        acc[date.leave_application_id].push({
                            id: date.id,
                            leave_application_id: date.leave_application_id,
                            leave_date: date.leave_date
                        });
                        return acc;
                    }, {});
    
                    // Combine leave application details with their corresponding dates
                    const result = leaveApplications.map(application => ({
                        ...application,
                        leave_application_ids: leaveDatesMap[application.id] || []
                    }));
    
                    res.send(result);
                });
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    }
    
    
    



}

module.exports = AttendanceModel




