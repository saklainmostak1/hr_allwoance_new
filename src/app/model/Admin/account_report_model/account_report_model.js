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


    expense_search_account_report: async (req, res) => {
        try {
            console.log("Search button clicked.");

            // Extract necessary data from request
            const { fromDate, toDate, searchQuery, invoiceId, itemName, supplierId, multiSearch, paidBy, expenseCategory } = req.body;

            // Construct the base SQL query
            let sql = `
                    SELECT 
                expense.*, 
                expense_item.item_name AS expense_name, 
                expense_category.expense_category_name AS expense_category,
                expense_category.id AS expense_category_id, -- Add this line to include the category ID
                 account_head.account_head_name AS account_head_name
            FROM 
                expense 
                LEFT JOIN expense_category ON expense.expense_category = expense_category.id 
                LEFT JOIN expense_item ON expense.id = expense_item.expense_id 
                 LEFT JOIN account_head ON expense.paid_by = account_head.id
            WHERE 1
            `;


            if (fromDate && toDate) {
                sql += ` AND expense.created_date BETWEEN '${fromDate}' AND '${toDate}'`;
            }

            if (searchQuery) {
                sql += ` AND expense.expense_category = ${searchQuery}`;
            }

            if (supplierId) {
                sql += ` AND expense.supplier_id LIKE '%${supplierId}%'`;
            }
            if (expenseCategory) {
                sql += ` AND expense_category.id LIKE '%${expenseCategory}%'`;
            }
            if (paidBy) {
                sql += ` AND expense.paid_by LIKE '%${paidBy}%'`;
            }
            // Add invoice ID condition
            if (invoiceId && invoiceId !== '') {
                sql += ` AND expense.voucher_id LIKE '%${invoiceId}%'`;
            }

            if (itemName) {

                sql += ` AND LOWER(expense_item.item_name) LIKE '%${itemName}%'`;
            }
            if (multiSearch && multiSearch.length > 0) {
                sql += ` ORDER BY ${multiSearch}`; // Append convertedData to the ORDER BY clause
            }

            // Add expense name (item_name) search condition



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



}
module.exports = AccountReportModel