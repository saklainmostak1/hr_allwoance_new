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

const AccountReportModel = {


    // expense_search_account_report: async (req, res) => {
    //     try {
    //         console.log("Search button clicked.");

    //         // Extract necessary data from request
    //         const { fromDate, toDate, searchQuery, invoiceId, itemName, supplierId, multiSearch, paidBy, expenseCategory } = req.body;

    //         // Construct the base SQL query
    //         let sql = `
    //                 SELECT 
    //             expense.*, 
    //             expense_item.item_name AS expense_name, 
    //             expense_category.expense_category_name AS expense_category,
    //             expense_category.id AS expense_category_id, -- Add this line to include the category ID
    //              account_head.account_head_name AS account_head_name
    //         FROM 
    //             expense 
    //             LEFT JOIN expense_category ON expense.expense_category = expense_category.id 
    //             LEFT JOIN expense_item ON expense.id = expense_item.expense_id 
    //              LEFT JOIN account_head ON expense.paid_by = account_head.id
    //         WHERE 1
    //         `;


    //         if (fromDate && toDate) {
    //             sql += ` AND expense.created_date BETWEEN '${fromDate}' AND '${toDate}'`;
    //         }

    //         if (searchQuery) {
    //             sql += ` AND expense.expense_category = ${searchQuery}`;
    //         }

    //         if (supplierId) {
    //             sql += ` AND expense.supplier_id LIKE '%${supplierId}%'`;
    //         }
    //         if (expenseCategory) {
    //             sql += ` AND expense_category.id LIKE '%${expenseCategory}%'`;
    //         }
    //         if (paidBy) {
    //             sql += ` AND expense.paid_by LIKE '%${paidBy}%'`;
    //         }
    //         // Add invoice ID condition
    //         if (invoiceId && invoiceId !== '') {
    //             sql += ` AND expense.voucher_id LIKE '%${invoiceId}%'`;
    //         }

    //         if (itemName) {

    //             sql += ` AND LOWER(expense_item.item_name) LIKE '%${itemName}%'`;
    //         }
    //         if (multiSearch && multiSearch.length > 0) {
    //             sql += ` ORDER BY ${multiSearch}`; // Append convertedData to the ORDER BY clause
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


    expense_search_account_report: async (req, res) => {
        try {
            const {
                fromDate, toDate, searchQuery, invoiceId, itemName,
                supplierId, multiSearch, paidBy, expenseCategory
            } = req.body;

            // Expense SQL Query
            let sql = `
                SELECT 
                    expense.id, 
                    expense.created_date AS created_date, 
                    expense.sub_total AS sub_total, 
                    expense_item.item_name AS expense_name, 
                    expense_category.expense_category_name AS expense_category,
                    expense_category.id AS expense_category_id,
                    account_head.account_head_name AS account_head_name,
                    expense.paid_by AS paid_by
                FROM 
                    expense 
                    LEFT JOIN expense_category ON expense.expense_category = expense_category.id 
                    LEFT JOIN expense_item ON expense.id = expense_item.expense_id 
                    LEFT JOIN account_head ON expense.paid_by = account_head.id
                WHERE 1 = 1
            `;

            // Salary SQL Query
            let salarySql = `
                SELECT 
                    salary.id,
                    salary.salary_date AS created_date,
                    SUM(salary.paid_amount) AS sub_total,
                    'Employee Salary' AS expense_name,
                    'salary' AS expense_category,
                    'salary' AS expense_category_id,
                    '' AS account_head_name,
                    salary.paid_by AS paid_by
                FROM 
                    salary
                LEFT JOIN users ON users.id = salary.user_id
                WHERE 1 = 1
                
            `;

            let sqlParams = [];
            let salarySqlParams = [];

            // Add date filters
            if (fromDate && toDate) {
                sql += ` AND expense.created_date BETWEEN ? AND ?`;
                salarySql += ` AND salary.salary_date BETWEEN ? AND ?`;
                sqlParams.push(fromDate, toDate);
                salarySqlParams.push(fromDate, toDate);
            }

            // Add search filters
            if (searchQuery) {
                sql += ` AND expense.expense_category = ?`;
                sqlParams.push(searchQuery);
            }

            if (supplierId) {
                sql += ` AND expense.supplier_id LIKE ?`;
                sqlParams.push(`%${supplierId}%`);
            }

            if (expenseCategory) {
                sql += ` AND expense_category.id LIKE ?`;
                sqlParams.push(`%${expenseCategory}%`);
            }

            if (paidBy) {
                sql += ` AND expense.paid_by LIKE ?`;
                sqlParams.push(`%${paidBy}%`);
            }

            if (invoiceId && invoiceId !== '') {
                sql += ` AND expense.voucher_id LIKE ?`;
                sqlParams.push(`%${invoiceId}%`);
            }

            if (itemName) {
                sql += ` AND LOWER(expense_item.item_name) LIKE ?`;
                sqlParams.push(`%${itemName.toLowerCase()}%`);
            }

            // Combine both SQL queries using UNION ALL
            let combinedSql = `
                (${sql})
                UNION ALL
                (${salarySql})
            `;

            // Execute the combined query
            connection.query(combinedSql, [...sqlParams, ...salarySqlParams], (error, results) => {
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

    salary_search_account_report: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { designation, month, paidBy, fromDate, toDate } = req.body;

            // Construct the base SQL query
            let sql = `
            SELECT 
                salary.*, 
                emp_promotion.designation_id, 
                designation.designation_name, 
                creator.full_name AS created_by_name,
                employee.full_name AS employee_name,
                account_head.account_head_name AS account_head_name
            FROM 
                salary 
            LEFT JOIN 
                employee_promotion emp_promotion ON salary.user_id = emp_promotion.user_id 
            LEFT JOIN 
                designation ON emp_promotion.designation_id = designation.id
            LEFT JOIN 
                users creator ON salary.created_by = creator.id
            LEFT JOIN 
                users employee ON salary.user_id = employee.id 
            LEFT JOIN 
                account_head ON salary.paid_by = account_head.id
            WHERE 1=1`;

            const queryParams = [];

            if (designation) {
                sql += ` AND emp_promotion.designation_id = ?`;
                queryParams.push(designation);
            }

            if (fromDate && toDate) {
                sql += ` AND salary.salary_date BETWEEN ? AND ?`;
                queryParams.push(fromDate, toDate);
            }

            if (paidBy) {
                sql += ` AND salary.paid_by = ?`;
                queryParams.push(paidBy);
            }

            if (month) {
                sql += ` AND DATE_FORMAT(salary.salary_month, '%Y-%m') = ?`;
                queryParams.push(month);
            }

            console.log("Constructed SQL Query:", sql);
            console.log("Query Parameters:", queryParams);

            // Execute the constructed SQL query
            connection.query(sql, queryParams, (error, results, fields) => {
                if (error) {
                    console.error("Error occurred during search:", error);
                    res.status(500).json({ error: "An error occurred during search." });
                } else {
                    console.log("Search results:", results);
                    res.status(200).json({ results: results.length ? results : [] });
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "An error occurred." });
        }
    },

    income_search_account_report: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { fromDate, toDate, searchQuery, invoiceId, paidBy, incomeCategory } = req.body;

            // Construct the base SQL query
            let sql = `   SELECT 
                income.*, 
                income_item.item_name AS income_name, 
                income_category.income_category_name AS income_category,
                income_category.id AS income_category_id, -- Add this line to include the category ID
                 account_head.account_head_name AS account_head_name
            FROM 
                income 
                LEFT JOIN income_category ON income.income_category = income_category.id 
                LEFT JOIN income_item ON income.id = income_item.income_id 
                 LEFT JOIN account_head ON income.paid_by = account_head.id
            WHERE 1`;
            //     let sql = `  SELECT 
            //     income.*, 
            //     income_item.item_name AS income_name, 
            //     income_category.income_category_name AS income_category,
            //             account_head.account_head_name AS account_head_name 
            // FROM 
            //     income 
            //     LEFT JOIN income_category ON income.income_category = income_category.id 
            //     LEFT JOIN income_item ON income.id = income_item.income_id 
            //           LEFT JOIN account_head ON income.paid_by = account_head.id
            // WHERE 1`;

            // Add date range condition
            if (fromDate && toDate) {
                sql += ` AND income.created_date BETWEEN '${fromDate}' AND '${toDate}'`;
            }
            if (invoiceId) {
                sql += ` AND income.voucher_id LIKE '%${invoiceId}%'`;
            }
            if (incomeCategory) {
                sql += ` AND income_category.id LIKE '%${incomeCategory}%'`;
            }
            if (paidBy) {
                sql += ` AND income.paid_by LIKE '%${paidBy}%'`;
            }
            // Add income category ID condition
            if (searchQuery) {
                sql += ` AND income_category = ${searchQuery}`;
            }

            console.log("SQL Query:", sql);

            // Execute the constructed SQL query
            connection.query(sql, (error, results, fields) => {
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

    general_ledgers_print: async (req, res) => {
        try {
            // Destructure the necessary parameters from the request body
            const {
                expenseCategorySubTotal,
                incomeCategorys,
                incomeCategorySubTotal,
                expenseCategorys,
                totalIncome,
                totalExpense,
                orientation,
                selectedPrintSize,
                fontSize
            } = req.body;



            // Generate the financial table rows
            let financialTableRows = '';
            // Handle expense subtotals
            Object.keys(expenseCategorySubTotal).forEach((categoryId, index) => {
                financialTableRows += '<tr>';
                financialTableRows += `<td class="text-center">${index + 1}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorys.find(incomeCategory => incomeCategory.id === parseInt(categoryId))?.income_category_name || ''}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorySubTotal[categoryId] || ''}</td>`;
                financialTableRows += `<td class="text-center">${expenseCategorys.find(expenseCategory => expenseCategory.id === parseInt(categoryId))?.expense_category_name || 'Employee Salary'}</td>`;
                financialTableRows += `<td class="text-center">${expenseCategorySubTotal[categoryId] || ''}</td>`;
                financialTableRows += '</tr>';
            });

            // Handle unmatched income categories
            Object.keys(incomeCategorySubTotal).filter(categoryId => !expenseCategorySubTotal[categoryId]).forEach((categoryId, index) => {
                financialTableRows += '<tr>';
                financialTableRows += `<td class="text-center">${Object.keys(expenseCategorySubTotal).length + index + 1}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorys.find(incomeCategory => incomeCategory.id === parseInt(categoryId))?.income_category_name || ''}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorySubTotal[categoryId] || ''}</td>`;
                financialTableRows += '<td class="text-center"></td><td class="text-center"></td>';
                financialTableRows += '</tr>';
            });

            // HTML structure for the print view
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';
            const html = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Financial Report</title>
                    <style>
                        @page {
                            size: ${pageSize} ${pageOrientation};
                            margin: 20mm;
                        }
                        * {
                            font-family: 'Nikosh', sans-serif !important;
                            font-size: ${fontSize || '12px'};
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
                        <h2>Pathshala School & College Financial Overview</h2>
                        <h3>GA-75/A, Middle Badda, Dhaka-1212</h3>
                        <p>Phone: 01977379479, Mobile: 01977379479</p>
                        <p>Email: pathshala@urbanitsolution.com</p>
                      
                    </div>
                    <div class="container2">
                        <p>Receipt No: 829</p>
                        <p>Collected By:</p>
                        <p>Date: </p>
                    </div>
                   
    
                    <div class='container'>
                        <h3 style="text-decoration: underline;">Financial Overview</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th class="text-center">SL</th>
                                <th class="text-center" colspan="2">Income</th>
                                <th class="text-center" colspan="3">Expense</th>
                            </tr>
                            <tr>
                                <th class="text-center">Title</th>
                                <th class="text-center">Amount</th>
                                <th class="text-center">Title</th>
                                <th class="text-center" colspan="2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${financialTableRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="1"></th>
                                <th>Total</th>
                                <th>${totalIncome}</th>
                                <th>Total</th>
                                <th colspan="2">${totalExpense}</th>
                            </tr>
                            <tr>
                                <th colspan="4"></th>
                                <th>Total Income</th>
                                <th>${totalIncome}</th>
                            </tr>
                            <tr>
                                <th colspan="4"></th>
                                <th>Total Expense</th>
                                <th>${totalExpense}</th>
                            </tr>
                            <tr>
                                <th colspan="4"></th>
                                <th>Total Balance</th>
                                <th>${totalIncome - totalExpense}</th>
                            </tr>
                        </tfoot>
                    </table>
                </body>
                <script>
                    window.print();
                </script>
                </html>`;

            res.send(html); // Send the generated HTML as response
        } catch (error) {
            console.error('Error in attendance_log_print:', error);
            res.status(500).send('Error generating print view');
        }
    },

    // general_ledgers_pdf: async (req, res) => {
    //     try {
    //         const {
    //             expenseCategorySubTotal,
    //             incomeCategorys,
    //             incomeCategorySubTotal,
    //             expenseCategorys,
    //             totalIncome,
    //             totalExpense,
    //             orientation,
    //             selectedPrintSize,
    //             fontSize
    //         } = req.body;

    //         let financialTableRows = '';
    //         // Handle expense subtotals
    //         Object.keys(expenseCategorySubTotal).forEach((categoryId, index) => {
    //             financialTableRows += '<tr>';
    //             financialTableRows += `<td class="text-center">${index + 1}</td>`;
    //             financialTableRows += `<td class="text-center">${incomeCategorys.find(incomeCategory => incomeCategory.id === parseInt(categoryId))?.income_category_name || ''}</td>`;
    //             financialTableRows += `<td class="text-center">${incomeCategorySubTotal[categoryId] || ''}</td>`;
    //             financialTableRows += `<td class="text-center">${expenseCategorys.find(expenseCategory => expenseCategory.id === parseInt(categoryId))?.expense_category_name || 'Employee Salary'}</td>`;
    //             financialTableRows += `<td class="text-center">${expenseCategorySubTotal[categoryId] || ''}</td>`;
    //             financialTableRows += '</tr>';
    //         });

    //         // Handle unmatched income categories
    //         Object.keys(incomeCategorySubTotal).filter(categoryId => !expenseCategorySubTotal[categoryId]).forEach((categoryId, index) => {
    //             financialTableRows += '<tr>';
    //             financialTableRows += `<td class="text-center">${Object.keys(expenseCategorySubTotal).length + index + 1}</td>`;
    //             financialTableRows += `<td class="text-center">${incomeCategorys.find(incomeCategory => incomeCategory.id === parseInt(categoryId))?.income_category_name || ''}</td>`;
    //             financialTableRows += `<td class="text-center">${incomeCategorySubTotal[categoryId] || ''}</td>`;
    //             financialTableRows += '<td class="text-center"></td><td class="text-center"></td>';
    //             financialTableRows += '</tr>';
    //         });

    //         // HTML structure for the print view


    //         const html = `
    //         <html lang="en">
    //         <head>
    //             <meta charset="UTF-8">
    //             <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //             <title>Attendance and Financial Report</title>
    //             <style>
    //                 @page {
    //                     size: ${pageSize} ${pageOrientation};
    //                     margin: 20mm;
    //                 }
    //                 * {
    //                     font-family: 'Nikosh', sans-serif !important;
    //                     font-size: ${fontSize || '12px'};
    //                 }
    //                 table {
    //                     width: 100%;
    //                     border-collapse: collapse;
    //                 }
    //                 th, td {
    //                     padding: 8px;
    //                     text-align: left;
    //                     border: 1px solid #ddd;
    //                 }
    //                 th {
    //                     background-color: #f2f2f2;
    //                 }
    //                 img {
    //                     max-width: 100px;
    //                     max-height: 100px;
    //                 }
    //                 .container {
    //                     text-align: center;
    //                 }
    //                 .container2 {
    //                     display: flex;
    //                     justify-content: space-between;
    //                 }
    //             </style>
    //         </head>
    //         <body>
    //             <div class='container'>
    //                 <h2>Pathshala School & College Attendance List</h2>
    //                 <h3>GA-75/A, Middle Badda, Dhaka-1212</h3>
    //                 <p>Phone: 01977379479, Mobile: 01977379479</p>
    //                 <p>Email: pathshala@urbanitsolution.com</p>
    //                 <h3 style="text-decoration: underline;">Attendance List</h3>
    //             </div>
    //             <div class="container2">
    //                 <p>Receipt No: 829</p>
    //                 <p>Collected By:</p>
    //                 <p>Date: </p>
    //             </div>
               

    //             <div class='container'>
    //                 <h3 style="text-decoration: underline;">Financial Overview</h3>
    //             </div>
    //             <table>
    //                 <thead>
    //                     <tr>
    //                         <th class="text-center">SL</th>
    //                         <th class="text-center" colspan="2">Income</th>
    //                         <th class="text-center" colspan="3">Expense</th>
    //                     </tr>
    //                     <tr>
    //                         <th class="text-center">Title</th>
    //                         <th class="text-center">Amount</th>
    //                         <th class="text-center">Title</th>
    //                         <th class="text-center" colspan="2">Amount</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     ${financialTableRows}
    //                 </tbody>
    //                 <tfoot>
    //                     <tr>
    //                         <th colspan="1"></th>
    //                         <th>Total</th>
    //                         <th>${totalIncome}</th>
    //                         <th>Total</th>
    //                         <th colspan="2">${totalExpense}</th>
    //                     </tr>
    //                     <tr>
    //                         <th colspan="4"></th>
    //                         <th>Total Income</th>
    //                         <th>${totalIncome}</th>
    //                     </tr>
    //                     <tr>
    //                         <th colspan="4"></th>
    //                         <th>Total Expense</th>
    //                         <th>${totalExpense}</th>
    //                     </tr>
    //                     <tr>
    //                         <th colspan="4"></th>
    //                         <th>Total Balance</th>
    //                         <th>${totalIncome - totalExpense}</th>
    //                     </tr>
    //                 </tfoot>
    //             </table>
    //         </body>
           
    //         </html>`;
    //         const pageSize = selectedPrintSize || 'A4';
    //         const pageOrientation = orientation || 'portrait';

    //         wkhtmltopdf(html, { pageSize: pageSize, orientation: pageOrientation }, (err, stream) => {
    //             if (err) {
    //                 console.error('Error generating PDF:', err);
    //                 console.error('Error details:', err.stderr); // Log additional details from stderr
    //                 res.status(500).send('Error generating PDF');
    //                 return;
    //             }
    //             stream.pipe(res);
    //         });
    //     } catch (error) {
    //         console.error('Error in attendance_pdf:', error);
    //         res.status(500).send('Error generating PDF');
    //     }
    // },

    general_ledgers_pdf: async (req, res) => {
        try {
            const {
                expenseCategorySubTotal,
                incomeCategorys,
                incomeCategorySubTotal,
                expenseCategorys,
                totalIncome,
                totalExpense,
                orientation,
                selectedPrintSize,
                fontSize
            } = req.body;
    
            // Validate required fields
            if (!totalIncome || !totalExpense || !incomeCategorys || !expenseCategorys) {
                return res.status(400).send('Required data is missing');
            }
    
            let financialTableRows = '';
    
            // Handle expense subtotals
            Object.keys(expenseCategorySubTotal).forEach((categoryId, index) => {
                financialTableRows += '<tr>';
                financialTableRows += `<td class="text-center">${index + 1}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorys.find(incomeCategory => incomeCategory.id === parseInt(categoryId))?.income_category_name || ''}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorySubTotal[categoryId] || ''}</td>`;
                financialTableRows += `<td class="text-center">${expenseCategorys.find(expenseCategory => expenseCategory.id === parseInt(categoryId))?.expense_category_name || 'Employee Salary'}</td>`;
                financialTableRows += `<td class="text-center">${expenseCategorySubTotal[categoryId] || ''}</td>`;
                financialTableRows += '</tr>';
            });
    
            // Handle unmatched income categories
            Object.keys(incomeCategorySubTotal).filter(categoryId => !expenseCategorySubTotal[categoryId]).forEach((categoryId, index) => {
                financialTableRows += '<tr>';
                financialTableRows += `<td class="text-center">${Object.keys(expenseCategorySubTotal).length + index + 1}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorys.find(incomeCategory => incomeCategory.id === parseInt(categoryId))?.income_category_name || ''}</td>`;
                financialTableRows += `<td class="text-center">${incomeCategorySubTotal[categoryId] || ''}</td>`;
                financialTableRows += '<td class="text-center"></td><td class="text-center"></td>';
                financialTableRows += '</tr>';
            });
    
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';
    
            // HTML structure for the print view
            const html = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Financial Report</title>
                <style>
                    @page {
                        size: ${pageSize} ${pageOrientation};
                        margin: 20mm;
                    }
                    * {
                        font-family: 'Nikosh', sans-serif !important;
                        font-size: ${fontSize || '12px'};
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
                    <h2>Pathshala School & College Financial Overview</h2>
                    <h3>GA-75/A, Middle Badda, Dhaka-1212</h3>
                    <p>Phone: 01977379479, Mobile: 01977379479</p>
                    <p>Email: pathshala@urbanitsolution.com</p>
                  
                </div>
                <div class="container2">
                    <p>Receipt No: 829</p>
                    <p>Collected By:</p>
                    <p>Date: </p>
                </div>
                <div class='container'>
                    <h3 style="text-decoration: underline;">Financial Overview</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">SL</th>
                            <th class="text-center" colspan="2">Income</th>
                            <th class="text-center" colspan="3">Expense</th>
                        </tr>
                        <tr>
                            <th class="text-center">Title</th>
                            <th class="text-center">Amount</th>
                            <th class="text-center">Title</th>
                            <th class="text-center" colspan="2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${financialTableRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="1"></th>
                            <th>Total</th>
                            <th>${totalIncome}</th>
                            <th>Total</th>
                            <th colspan="2">${totalExpense}</th>
                        </tr>
                        <tr>
                            <th colspan="4"></th>
                            <th>Total Income</th>
                            <th>${totalIncome}</th>
                        </tr>
                        <tr>
                            <th colspan="4"></th>
                            <th>Total Expense</th>
                            <th>${totalExpense}</th>
                        </tr>
                        <tr>
                            <th colspan="4"></th>
                            <th>Total Balance</th>
                            <th>${totalIncome - totalExpense}</th>
                        </tr>
                    </tfoot>
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
            console.error('Error in general_ledgers_pdf:', error);
            res.status(500).send('Error generating PDF');
        }
    },



    balance_sheet_print: async (req, res) => {
        try {
            const {
                orientation, selectedPrintSize, fontSize, incomeSearch, searchResults, totals, account_head
            } = req.body;
    
            // Generate the financial table rows
            let financialTableRows = '';
    
            if (Object.keys(searchResults).length > 0 || Object.keys(incomeSearch).length > 0) {
                let totalAmountSum = 0;
    
                // Render asset rows
                financialTableRows += `
                    <thead>
                        <tr class="report-bg w-100">
                            <th>Accounts Title</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="report-bg">
                            <th>Asset</th>
                            <th></th>
                        </tr>`;
    
                // Render accounts
                account_head.forEach(account => {
                    const expenseAmount = searchResults[account.id] || 0;
                    const incomeAmount = incomeSearch[account.id] || 0;
                    // const totalAmount = expenseAmount + incomeAmount;
                    const totalAmount = incomeAmount - expenseAmount ;
    
                    totalAmountSum += totalAmount;
    
                    financialTableRows += `
                        <tr>
                            <th>${account.account_head_name}</th>
                            <th>${totalAmount.toLocaleString()}</th>
                        </tr>`;
                });
    
                financialTableRows += `
                        <tr class="report-bg">
                            <td>Subtotal</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                        <tr class="report-bg">
                            <th>Liability</th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Bank Loan</th>
                            <th>0</th>
                        </tr>
                        <tr class="report-bg">
                            <td>Subtotal</td>
                            <td>0</td>
                        </tr>
                        <tr class="report-bg">
                            <th>Owner's Equity</th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Capital</th>
                            <th>0</th>
                        </tr>
                        <tr>
                            <th>Withdraw</th>
                            <th>0</th>
                        </tr>
                        <tr class="report-bg">
                            <td>Subtotal</td>
                            <td>0</td>
                        </tr>
                        <tr class="report-bg">
                            <td>Net Profit/Loss</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                        <tr class="report-bg">
                            <td>Net Liability and Owner’s Equity</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                        <tr class="report-bg">
                            <td>Net Asset</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                    </tbody>`;
            } else {
                // If there are no search results or income search results, use totals
                const totalAmountSum = totals.totalAmountSum || 0;
    
                financialTableRows += `
                    <thead>
                        <tr class="report-bg w-100">
                            <th>Accounts Title</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="report-bg">
                            <th>Asset</th>
                            <th></th>
                        </tr>`;
    
                totals.accountRows.forEach(account => {
                    financialTableRows += `
                        <tr>
                            <th>${account.account_head_name}</th>
                            <th>${account.totalAmount.toLocaleString()}</th>
                        </tr>`;
                });
    
                financialTableRows += `
                        <tr class="report-bg">
                            <td>Subtotal</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                        <tr class="report-bg">
                            <th>Liability</th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Bank Loan</th>
                            <th>0</th>
                        </tr>
                        <tr class="report-bg">
                            <td>Subtotal</td>
                            <td>0</td>
                        </tr>
                        <tr class="report-bg">
                            <th>Owner's Equity</th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Capital</th>
                            <th>0</th>
                        </tr>
                        <tr>
                            <th>Withdraw</th>
                            <th>0</th>
                        </tr>
                        <tr class="report-bg">
                            <td>Subtotal</td>
                            <td>0</td>
                        </tr>
                        <tr class="report-bg">
                            <td>Net Profit/Loss</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                        <tr class="report-bg">
                            <td>Net Liability and Owner’s Equity</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                        <tr class="report-bg">
                            <td>Net Asset</td>
                            <td>${totalAmountSum.toLocaleString()}</td>
                        </tr>
                    </tbody>`;
            }
    
            // HTML structure for the print view
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';
            const html = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Financial Report</title>
                    <style>
                        @page {
                            size: ${pageSize} ${pageOrientation};
                            margin: 20mm;
                        }
                        * {
                            font-family: 'Nikosh', sans-serif !important;
                            font-size: ${fontSize || '12px'};
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
                        <h2>Pathshala School & College Financial Overview</h2>
                        <h3>GA-75/A, Middle Badda, Dhaka-1212</h3>
                        <p>Phone: 01977379479, Mobile: 01977379479</p>
                        <p>Email: pathshala@urbanitsolution.com</p>
                    </div>
                    <div class="container2">
                        <p>Receipt No: 829</p>
                        <p>Collected By:</p>
                        <p>Date: </p>
                    </div>
                    <div class='container'>
                        <h3 style="text-decoration: underline;">Financial Overview</h3>
                    </div>
                    <table>
                        ${financialTableRows}
                    </table>
                </body>
                <script>
                    window.print();
                </script>
                </html>`;
    
            res.send(html); // Send the generated HTML as response
        } catch (error) {
            console.error('Error in balance_sheet_print:', error);
            res.status(500).send('Error generating print view');
        }
    },
    
    balance_sheet_pdf: async (req, res) => {
        try {
            const {
                orientation, selectedPrintSize, fontSize, incomeSearch, searchResults, totals, account_head
            } = req.body;

            // Generate the financial table rows
            let financialTableRows = '';

            if (Object.keys(searchResults).length > 0 || Object.keys(incomeSearch).length > 0) {
                let totalAmountSum = 0;

                // Render asset rows
                financialTableRows += `
                          <thead>
                              <tr class="report-bg w-100">
                                  <th>Accounts Title</th>
                                  <th>Total</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr class="report-bg">
                                  <th>Asset</th>
                                  <th></th>
                              </tr>`;

                // Render accounts
                account_head.forEach(account => {
                    const expenseAmount = searchResults[account.id] || 0;
                    const incomeAmount = incomeSearch[account.id] || 0;
                    // const totalAmount = expenseAmount + incomeAmount;
                    const totalAmount = incomeAmount - expenseAmount ;

                    totalAmountSum += totalAmount;

                    financialTableRows += `
                              <tr>
                                  <th>${account.account_head_name}</th>
                                  <th>${totalAmount.toLocaleString()}</th>
                              </tr>`;
                });

                financialTableRows += `
                              <tr class="report-bg">
                                  <td>Subtotal</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                              <tr class="report-bg">
                                  <th>Liability</th>
                                  <th></th>
                              </tr>
                              <tr>
                                  <th>Bank Loan</th>
                                  <th>0</th>
                              </tr>
                              <tr class="report-bg">
                                  <td>Subtotal</td>
                                  <td>0</td>
                              </tr>
                              <tr class="report-bg">
                                  <th>Owner's Equity</th>
                                  <th></th>
                              </tr>
                              <tr>
                                  <th>Capital</th>
                                  <th>0</th>
                              </tr>
                              <tr>
                                  <th>Withdraw</th>
                                  <th>0</th>
                              </tr>
                              <tr class="report-bg">
                                  <td>Subtotal</td>
                                  <td>0</td>
                              </tr>
                              <tr class="report-bg">
                                  <td>Net Profit/Loss</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                              <tr class="report-bg">
                                  <td>Net Liability and Owner’s Equity</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                              <tr class="report-bg">
                                  <td>Net Asset</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                          </tbody>`;
            } else {
                // If there are no search results or income search results, use totals
                const totalAmountSum = totals.totalAmountSum || 0;

                financialTableRows += `
                          <thead>
                              <tr class="report-bg w-100">
                                  <th>Accounts Title</th>
                                  <th>Total</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr class="report-bg">
                                  <th>Asset</th>
                                  <th></th>
                              </tr>`;

                totals.accountRows.forEach(account => {
                    financialTableRows += `
                              <tr>
                                  <th>${account.account_head_name}</th>
                                  <th>${account.totalAmount.toLocaleString()}</th>
                              </tr>`;
                });

                financialTableRows += `
                              <tr class="report-bg">
                                  <td>Subtotal</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                              <tr class="report-bg">
                                  <th>Liability</th>
                                  <th></th>
                              </tr>
                              <tr>
                                  <th>Bank Loan</th>
                                  <th>0</th>
                              </tr>
                              <tr class="report-bg">
                                  <td>Subtotal</td>
                                  <td>0</td>
                              </tr>
                              <tr class="report-bg">
                                  <th>Owner's Equity</th>
                                  <th></th>
                              </tr>
                              <tr>
                                  <th>Capital</th>
                                  <th>0</th>
                              </tr>
                              <tr>
                                  <th>Withdraw</th>
                                  <th>0</th>
                              </tr>
                              <tr class="report-bg">
                                  <td>Subtotal</td>
                                  <td>0</td>
                              </tr>
                              <tr class="report-bg">
                                  <td>Net Profit/Loss</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                              <tr class="report-bg">
                                  <td>Net Liability and Owner’s Equity</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                              <tr class="report-bg">
                                  <td>Net Asset</td>
                                  <td>${totalAmountSum.toLocaleString()}</td>
                              </tr>
                          </tbody>`;
            }

            // HTML structure for the print view
            const pageSize = selectedPrintSize || 'A4';
            const pageOrientation = orientation || 'portrait';
            const html = `
                      <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>Financial Report</title>
                          <style>
                              @page {
                                  size: ${pageSize} ${pageOrientation};
                                  margin: 20mm;
                              }
                              * {
                                  font-family: 'Nikosh', sans-serif !important;
                                  font-size: ${fontSize || '12px'};
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
                              <h2>Pathshala School & College Financial Overview</h2>
                              <h3>GA-75/A, Middle Badda, Dhaka-1212</h3>
                              <p>Phone: 01977379479, Mobile: 01977379479</p>
                              <p>Email: pathshala@urbanitsolution.com</p>
                          </div>
                          <div class="container2">
                              <p>Receipt No: 829</p>
                              <p>Collected By:</p>
                              <p>Date: </p>
                          </div>
                          <div class='container'>
                              <h3 style="text-decoration: underline;">Financial Overview</h3>
                          </div>
                          <table>
                              ${financialTableRows}
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
            console.error('Error in balance_sheet_pdf:', error);
            res.status(500).send('Error generating PDF');
        }
    },





    // income_amount_account_report: async (req, res) => {
    //     try {
    //         console.log("Search button clicked.");

    //         // Extract necessary data from request
    //         const { yearName, type } = req.body;

    //         // Construct the base SQL query
    //         let sql = `
    //           SELECT 
    //                 income.id, 
    //                 income.income_date AS created_date, 
    //                 income.sub_total AS sub_total, 
    //                 income_item.item_name AS income_name, 
    //                 income_category.income_category_name AS income_category,
    //                 income_category.id AS income_category_id,
    //                 account_head.account_head_name AS account_head_name,
    //                 income.paid_by AS paid_by
    //             FROM 
    //                 income 
    //                 LEFT JOIN income_category ON income.income_category = income_category.id 
    //                 LEFT JOIN income_item ON income.id = income_item.income_id 
    //                 LEFT JOIN account_head ON income.paid_by = account_head.id
    //             WHERE 1
    //         `
            
    //         if (fromDate && toDate) {
    //             sql += ` AND income.income_date BETWEEN '${fromDate}' AND '${toDate}'`;
    //         }

            
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


    income_amount_account_report: async (req, res) => {
        try {
            console.log("Search button clicked.");
    
            // Extract necessary data from request
            const { yearName, type} = req.body;
    
            // Construct the base SQL query
            let sql = `
                SELECT 
                    income.id, 
                    income.income_date AS created_date, 
                    SUM(income.sub_total) AS sub_total_income, 
                    income_item.item_name AS income_name, 
                    income_category.income_category_name AS income_category,
                    income_category.id AS income_category_id,
                    account_head.account_head_name AS account_head_name,
                    income.paid_by AS paid_by
                FROM 
                    income 
                    LEFT JOIN income_category ON income.income_category = income_category.id 
                    LEFT JOIN income_item ON income.id = income_item.income_id 
                    LEFT JOIN account_head ON income.paid_by = account_head.id
                WHERE YEAR(income.income_date) = '${yearName}'
            `;
    
          
    
            // Modify the query based on the 'type' (daily or monthly)
            if (type === "daily") {
                sql += ` GROUP BY DATE(income.income_date)`; // Group by day for daily type
            } else if (type === "monthly") {
                sql += ` GROUP BY MONTH(income.income_date)`; // Group by month for monthly type
            }
    
            console.log("SQL Query:", sql);
    
            // Execute the constructed SQL query
            connection.query(sql, (error, results, fields) => {
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
    
    // expense_amount_account_report: async (req, res) => {
    //     try {
    //         const {
    //             yearName, type
    //         } = req.body;

    //         // Expense SQL Query
    //         let sql = `
    //             SELECT 
    //                 expense.id, 
    //                 expense.expense_date AS created_date, 
    //                 expense.sub_total AS sub_total, 
    //                 expense_item.item_name AS expense_name, 
    //                 expense_category.expense_category_name AS expense_category,
    //                 expense_category.id AS expense_category_id,
    //                 account_head.account_head_name AS account_head_name,
    //                 expense.paid_by AS paid_by
    //             FROM 
    //                 expense 
    //                 LEFT JOIN expense_category ON expense.expense_category = expense_category.id 
    //                 LEFT JOIN expense_item ON expense.id = expense_item.expense_id 
    //                 LEFT JOIN account_head ON expense.paid_by = account_head.id
    //             WHERE 1 = 1
    //         `;

    //         // Salary SQL Query
    //         let salarySql = `
    //             SELECT 
    //                 salary.id,
    //                 salary.salary_date AS created_date,
    //                 SUM(salary.paid_amount) AS sub_total,
    //                 'Employee Salary' AS expense_name,
    //                 'salary' AS expense_category,
    //                 'salary' AS expense_category_id,
    //                 '' AS account_head_name,
    //                 salary.paid_by AS paid_by
    //             FROM 
    //                 salary
    //             LEFT JOIN users ON users.id = salary.user_id
    //             WHERE 1 = 1
                
    //         `;

    //         let sqlParams = [];
    //         let salarySqlParams = [];

          

    //         // Add search filters
           

    //         // Combine both SQL queries using UNION ALL
    //         let combinedSql = `
    //             (${sql})
    //             UNION ALL
    //             (${salarySql})
    //         `;

    //         // Execute the combined query
    //         connection.query(combinedSql, [...sqlParams, ...salarySqlParams], (error, results) => {
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
    
    expense_amount_account_report: async (req, res) => {
        try {
            const { yearName, type} = req.body;
    
            // Expense SQL Query
            let expenseSql = `
                SELECT 
                    expense.id, 
                    expense.expense_date AS created_date, 
                    SUM(expense.sub_total) AS sub_total_expense, 
                    expense_item.item_name AS expense_name, 
                    expense_category.expense_category_name AS expense_category,
                    expense_category.id AS expense_category_id,
                    account_head.account_head_name AS account_head_name,
                    expense.paid_by AS paid_by
                FROM 
                    expense 
                    LEFT JOIN expense_category ON expense.expense_category = expense_category.id 
                    LEFT JOIN expense_item ON expense.id = expense_item.expense_id 
                    LEFT JOIN account_head ON expense.paid_by = account_head.id
                WHERE YEAR(expense.expense_date) = '${yearName}'
            `;
    
            // Salary SQL Query
            let salarySql = `
                SELECT 
                    salary.id,
                    salary.salary_date AS created_date,
                    SUM(salary.paid_amount) AS sub_total_salary,
                    'Employee Salary' AS expense_name,
                    'Salary' AS expense_category,
                    'Salary' AS expense_category_id,
                    '' AS account_head_name,
                    salary.paid_by AS paid_by
                FROM 
                    salary
                LEFT JOIN users ON users.id = salary.user_id
                WHERE YEAR(salary.salary_date) = '${yearName}'
            `;
    
            // Add date range filter if provided
         
            // Modify the query based on the 'type' (daily or monthly)
            if (type === "daily") {
                expenseSql += ` GROUP BY DATE(expense.expense_date)`; // Group by day for daily type
                salarySql += ` GROUP BY DATE(salary.salary_date)`;   // Group by day for daily type
            } else if (type === "monthly") {
                expenseSql += ` GROUP BY MONTH(expense.expense_date)`; // Group by month for monthly type
                salarySql += ` GROUP BY MONTH(salary.salary_date)`;   // Group by month for monthly type
            }
    
            // Combine both SQL queries using UNION ALL
            let combinedSql = `
                (${expenseSql})
                UNION ALL
                (${salarySql})
            `;
    
            console.log("Combined SQL Query:", combinedSql);
    
            // Execute the combined query
            connection.query(combinedSql, (error, results) => {
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
    
   
    
    

}
module.exports = AccountReportModel