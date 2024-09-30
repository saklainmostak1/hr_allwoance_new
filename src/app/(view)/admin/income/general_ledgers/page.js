'use client'
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const TrailBalances = () => {

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [incomeCategory, setIncomeCategory] = useState([]);
    const [expenseCategory, setExpenseCategory] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [incomeSearch, setIncomeSearch] = useState([]);
    const [subTotal, setSubTotal] = useState(0); // Track active tab
    const [subTotalIncome, setSubTotalIncome] = useState(0); // Track active tab

    const formatDate = (date) => {
        const day = String(date?.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return `${day}-${month}-${year}`;
    };

    const handleDateChangeFrom = (event) => {
        const selectedDate = new Date(event.target.value);
        const formattedDate = formatDate(selectedDate);
        setFromDate(selectedDate);
    };

    const handleDateChangeTo = (event) => {
        const selectedDate = new Date(event.target.value);
        const formattedDate = formatDate(selectedDate);
        setToDate(selectedDate);
    };

    const handleTextInputClick = () => {
        document.getElementById('dateInputFrom').showPicker();
    };

    const handleTextInputClicks = () => {
        document.getElementById('dateInputTo').showPicker();
    };

    useEffect(() => {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        setFromDate(firstDayOfMonth);
        setToDate(lastDayOfMonth);
    }, []);

    const { data: incomeCategorys = [], isLoading, refetch } = useQuery({
        queryKey: ['incomeCategorys'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/income_category/income_category_all`)

            const data = await res.json()
            return data
        }
    })

    const { data: expenseCategorys = [], } = useQuery({
        queryKey: ['expenseCategorys'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/expence_category/expence_category_all`)

            const data = await res.json()
            return data
        }
    })


    const [expenseCategorySubTotal, setExpenseCategorySubTotal] = useState([])
    const [incomeCategorySubTotal, setIncomeCategorySubTotal] = useState([])

    const expense_search = async () => {
        setLoading(true);

        try {
            // Make the first request for expense search
            const expenseResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/account_report/account_report_expense`, {
                fromDate, toDate, expenseCategory
            });

            // Make the second request for income search
            const incomeResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/account_report/account_report_income`, {
                fromDate, toDate, incomeCategory
            });

            // Combine results from both searches
            const combinedResults = expenseResponse.data.results;
            const combinedResultsIncome = incomeResponse.data.results;


            if (combinedResults.length === 0) {
                alert('Nothing found!');
            } else {
                const sortedResults = combinedResults; // Sort if necessary
                const sortedResultIncome = combinedResultsIncome; // Sort if necessary
                setSearchResults(sortedResults);
                setIncomeSearch(sortedResultIncome)


                const sub_total = combinedResults.reduce((sum, result) => sum + result.sub_total, 0);
                const sub_totalIncome = combinedResultsIncome.reduce((sum, result) => sum + result.sub_total, 0);

                setSubTotalIncome(sub_totalIncome)
                setSubTotal(sub_total);

                const expenseCategoryWiseSubTotal = combinedResults.reduce((acc, result) => {
                    const { expense_category_id, sub_total } = result;
                    acc[expense_category_id] = (acc[expense_category_id] || 0) + sub_total;
                    return acc;
                }, {});
                setExpenseCategorySubTotal(expenseCategoryWiseSubTotal)
                // Income Category-wise Subtotals
                const incomeCategoryWiseSubTotal = combinedResultsIncome.reduce((acc, result) => {
                    const { income_category_id, sub_total } = result;
                    acc[income_category_id] = (acc[income_category_id] || 0) + sub_total;
                    return acc;
                }, {});
                setIncomeCategorySubTotal(incomeCategoryWiseSubTotal)

                setError(null);
            }
        } catch (error) {
            setError("An error occurred during search.");
            setSearchResults([]);
        } finally {
            setLoading(false); // Ensure loading is turned off
        }
    };

    console.log(incomeCategorySubTotal)
    const totalIncome = Object.values(incomeCategorySubTotal).reduce((sum, value) => {
        return sum + (value || 0); // Ensure null or undefined values are treated as 0
    }, 0);
    console.log(expenseCategorySubTotal)
    const totalExpense = Object.values(expenseCategorySubTotal).reduce((sum, value) => {
        return sum + (value || 0); // Ensure null or undefined values are treated as 0
    }, 0);



    return (
        <div className="container-fluid">
            <div className="row">
                <div className='col-12 p-4'>
                    <div className='card mb-4'>
                        <div className="body-content bg-light">
                            <div className="border-primary shadow-sm border-0">
                                <div className="card-header py-1 custom-card-header clearfix bg-gradient-primary text-white">
                                    <h5 className="card-title font-weight-bold mb-0 card-header-color float-left mt-1">Search</h5>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <div className="col-md-10 offset-md-1">
                                            <div className="form-group row student">
                                                <label htmlFor="fromDate" className="col-form-label col-md-2"><strong>Start Date:</strong></label>
                                                <div className="col-md-4">
                                                    <input
                                                        className="form-control form-control-sm"
                                                        type="text"
                                                        id="fromDate"
                                                        value={fromDate ? formatDate(fromDate) : ''}
                                                        onClick={handleTextInputClick}
                                                        readOnly
                                                    />
                                                    <input
                                                        type="date"
                                                        id="dateInputFrom"
                                                        value={fromDate ? fromDate.toString().split('T')[0] : ''}
                                                        onChange={handleDateChangeFrom}
                                                        style={{ position: 'absolute', bottom: '-20px', left: '0', visibility: 'hidden' }}
                                                    />
                                                </div>

                                                <label htmlFor="toDate" className="col-form-label col-md-2"><strong>End Date:</strong></label>
                                                <div className="col-md-4">

                                                    <input
                                                        type="text"
                                                        id="toDate"
                                                        className="form-control form-control-sm"
                                                        value={toDate ? formatDate(toDate) : ''}
                                                        onClick={handleTextInputClicks}
                                                        readOnly
                                                    />
                                                    <input
                                                        type="date"
                                                        id="dateInputTo"
                                                        value={toDate ? toDate.toString().split('T')[0] : ''}
                                                        onChange={handleDateChangeTo}
                                                        style={{ position: 'absolute', bottom: '-20px', left: '0', visibility: 'hidden' }}
                                                    />
                                                </div>

                                            </div>
                                            <div class="form-group row student">




                                            </div>
                                            <div class="form-group row student">

                                                <label class="col-form-label col-md-2"><strong>Income Category:
                                                </strong></label>
                                                <div className="col-md-4">
                                                    <select
                                                        value={incomeCategory}
                                                        onChange={(e) => setIncomeCategory(e.target.value)}
                                                        name="statusFilter"
                                                        className="form-control form-control-sm integer_no_zero lshift"

                                                    >
                                                        <option value="">Select Income Category </option>
                                                        {
                                                            incomeCategorys.map(income_category =>

                                                                <>
                                                                    <option value={income_category.id}>{income_category.income_category_name}</option>
                                                                </>
                                                            )
                                                        }



                                                    </select>
                                                </div>
                                                <label class="col-form-label col-md-2"><strong>Expense Category:
                                                </strong></label>
                                                <div className="col-md-4">
                                                    <select
                                                        value={expenseCategory}
                                                        onChange={(e) => setExpenseCategory(e.target.value)}
                                                        name="statusFilter"
                                                        className="form-control form-control-sm integer_no_zero lshift"

                                                    >
                                                        <option value="">Select Expense Category </option>
                                                        {
                                                            expenseCategorys.map(expense_category =>

                                                                <>
                                                                    <option value={expense_category.id}>{expense_category.expense_category_name}</option>
                                                                </>
                                                            )
                                                        }



                                                    </select>
                                                </div>

                                            </div>
                                            <div className="form-group row">
                                                <div className="offset-md-2 col-md-10 float-left">
                                                    <input
                                                        type="button"
                                                        name="search"
                                                        className="btn btn-sm btn-info search_btn mr-2"
                                                        value="Search"
                                                        onClick={expense_search}

                                                    />
                                                    <input
                                                        type="button"
                                                        name="search"
                                                        class="btn btn-sm btn-success print_btn mr-2"
                                                        value="Print"

                                                    />
                                                    <input

                                                        type="button"

                                                        name="search"
                                                        className="btn btn-sm btn-secondary excel_btn mr-2"
                                                        value="Download PDF"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='card mb-4'>
                        <div className="body-content bg-light">
                            <div className="border-primary shadow-sm border-0">
                                <div className="card-header py-1 custom-card-header clearfix bg-gradient-primary text-white">
                                    <h5 className="card-title font-weight-bold mb-0 card-header-color float-left mt-1">
                                        General Ledger From {fromDate ? formatDate(fromDate) : ''} to {toDate ? formatDate(toDate) : ''}
                                    </h5>
                                </div>
                                <div class="card-body">
                                    {loading ? (
                                        <div className='text-center'>
                                            <FontAwesomeIcon style={{ height: '33px', width: '33px' }} icon={faSpinner} spin />
                                        </div>
                                    ) : (
                                        searchResults?.length > 0 || incomeSearch?.length > 0 ? (
                                            <div class="table-responsive">
                                                <table class="table table-bordered table-hover table-striped table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th class="text-center" rowspan="2">SL</th>
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
                                                        {/* Loop through expense subtotals first */}
                                                        {Object.keys(expenseCategorySubTotal).map((categoryId, index) => (
                                                            <tr key={categoryId}>
                                                                {/* Income Data */}
                                                                <td className="text-center">{index + 1}</td>
                                                                <td className="text-center">
                                                                    {
                                                                        incomeCategorys.find(
                                                                            (incomeCategory) => incomeCategory.id === parseInt(categoryId)
                                                                        )?.income_category_name || ''
                                                                    }
                                                                </td>
                                                                <td className="text-center">{incomeCategorySubTotal[categoryId] || ''}</td>

                                                                {/* Expense Data */}
                                                                <td className="text-center">
                                                                    {
                                                                        expenseCategorys.find(
                                                                            (expenseCategory) => expenseCategory.id === parseInt(categoryId)
                                                                        )?.expense_category_name || ''
                                                                    }
                                                                </td>
                                                                <td className="text-center" colSpan="2">
                                                                    {expenseCategorySubTotal[categoryId] || ''}
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        {/* Handling extra income categories not in expenses */}
                                                        {Object.keys(incomeCategorySubTotal).filter(categoryId => !expenseCategorySubTotal[categoryId]).map((categoryId, index) => (
                                                            <tr key={categoryId}>
                                                                {/* Income Data */}
                                                                <td className="text-center">{Object.keys(expenseCategorySubTotal).length + index + 1}</td>
                                                                <td className="text-center">
                                                                    {
                                                                        incomeCategorys.find(
                                                                            (incomeCategory) => incomeCategory.id === parseInt(categoryId)
                                                                        )?.income_category_name || ''
                                                                    }
                                                                </td>
                                                                <td className="text-center">{incomeCategorySubTotal[categoryId] || ''}</td>

                                                                {/* Expense Data (Empty for unmatched expense categories) */}
                                                                <td className="text-center"></td>
                                                                <td className="text-center" colSpan="2"></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>

                                                    <tfoot>
                                                        <tr>
                                                            <th class="text-center" colspan="1"></th>
                                                            <th class="text-center">Total</th>
                                                            <th class="text-center">{totalIncome}</th>
                                                            <th class="text-center">Total</th>
                                                            <th class="text-center" colspan="2">{totalExpense}</th>
                                                        </tr>
                                                        <tr>
                                                            <th class="text-center" colspan="4"></th>
                                                            <th class="text-center">Total Income</th>
                                                            <th class="text-center">{totalIncome}</th>
                                                        </tr>
                                                        <tr>
                                                            <th class="text-center" colspan="4"></th>
                                                            <th class="text-center">Total Expense</th>
                                                            <th class="text-center">{totalExpense}</th>
                                                        </tr>
                                                        <tr>
                                                            <th class="text-center" colspan="4"></th>
                                                            <th class="text-center">Total Balance</th>
                                                            <th class="text-center">{totalIncome - totalExpense}</th>
                                                        </tr>
                                                    </tfoot>

                                                </table>
                                            </div>
                                        ) : (
                                            <p>No data available for the selected period.</p>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );
};

export default TrailBalances;










// <tfoot>
//                                                     <tr>
//                                                         <th class="text-center" colspan="1"></th>
//                                                         <th class="text-center">Total</th>
//                                                         <th class="text-center">1752750</th>
//                                                         <th class="text-center">Total</th>
//                                                         <th class="text-center" colspan="2">9000</th>
//                                                     </tr>
//                                                     <tr>
//                                                         <th class="text-center" colspan="4"></th>
//                                                         <th class="text-center">Total Income</th>
//                                                         <th class="text-center">1752750</th>
//                                                     </tr>
//                                                     <tr>
//                                                         <th class="text-center" colspan="4"></th>
//                                                         <th class="text-center">Total Expense</th>
//                                                         <th class="text-center">9000</th>
//                                                     </tr>
//                                                     <tr>
//                                                         <th class="text-center" colspan="4"></th>
//                                                         <th class="text-center">Total Balance</th>
//                                                         <th class="text-center">1743750</th>
//                                                     </tr>
//                                                 </tfoot>