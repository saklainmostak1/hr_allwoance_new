'use client'
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const TransactionReports = () => {

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [invoiceId, setInvoiceId] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('income'); // Track active tab
    const [subTotal, setSubTotal] = useState(0); // Track active tab
    const [subTotalIncome, setSubTotalIncome] = useState(0); // Track active tab
    const [subTotalSalary, setSubTotalSalary] = useState(0); // Track active tab
    const [error, setError] = useState(null);






    const { data: account_head = []
    } = useQuery({
        queryKey: ['account_head'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/account_head/account_head_list`)

            const data = await res.json()
            return data
        }
    })


    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
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

    // const [incomeSearch, setIncomeSearch] = useState([])
    //     const expense_search = () => {
    //         setLoading(true);
    //         axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/expense/expense_search`, {
    //             fromDate, toDate, invoiceId, paidBy

    //         })
    //         axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/income/income_search`, {
    //             invoiceId, paidBy,
    //             fromDate,
    //             toDate
    //         })
    //             .then(response => {
    //                 if (response.data.results == '') {
    //                     alert('Nothing found!');
    //                 }
    //                 const sortedResults = response.data.results
    //                 setSearchResults(sortedResults);

    //                 const sub_total = response.data.results.reduce((sum, result) => sum + result.sub_total, 0);
    //                 setSubTotal(sub_total)
    //                 setError(null);
    //                 setLoading(false);
    //             })
    //             .catch(error => {
    //                 setError("An error occurred during search.", error);
    //                 // setLoading(false);
    //                 setSearchResults([]);
    //             });
    //     };

    const [incomeSearch, setIncomeSearch] = useState([]);
    const [salarySearch, setSalarySearch] = useState([]);
    const expense_search = async () => {
        setLoading(true);
        setActiveTab('income')
        try {
            // Make the first request for expense search
            const expenseResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/account_report/account_report_expense`, {
                fromDate, toDate, invoiceId, paidBy
            });

            // Make the second request for income search
            const incomeResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/account_report/account_report_income`, {
                invoiceId, paidBy, fromDate, toDate
            });

            const salaryResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/account_report/account_report_salary`, {
                paidBy, fromDate, toDate
            });

            // Combine results from both searches
            const combinedResults = expenseResponse.data.results;
            const combinedResultsIncome = incomeResponse.data.results;
            const combinedResultsSalary = salaryResponse.data.results;

            if (combinedResults.length === 0) {
                alert('Nothing found!');
            } else {
                const sortedResults = combinedResults; // Sort if necessary
                const sortedResultsSalary = combinedResultsSalary; // Sort if necessary
                const sortedResultIncome = combinedResultsIncome; // Sort if necessary
                setSearchResults(sortedResults);
                setIncomeSearch(sortedResultIncome)
                setSalarySearch(sortedResultsSalary)

                const sub_total = combinedResults.reduce((sum, result) => sum + result.sub_total, 0);
                const sub_totalIncome = combinedResultsIncome.reduce((sum, result) => sum + result.sub_total, 0);
                const sub_totalSalary = sortedResultsSalary.reduce((sum, result) => sum + result.paid_amount, 0);
                setSubTotalSalary(sub_totalSalary)
                setSubTotalIncome(sub_totalIncome)
                setSubTotal(sub_total);


                setError(null);
            }
        } catch (error) {
            setError("An error occurred during search.");
            setSearchResults([]);
        } finally {
            setLoading(false); // Ensure loading is turned off
        }
    };

    const getMonthNames = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { month: 'long' });
    }


    return (
        <div className="container-fluid">
            <div className="row">
                <div className='col-12 p-4'>
                    <div className='card mb-4'>
                        <div className="body-content bg-light">
                            <div className="border-primary shadow-sm border-0">
                                <div className="card-header py-1 custom-card-header clearfix bg-gradient-primary text-white">
                                    <h5 className="card-title font-weight-bold mb-0 card-header-color float-left mt-1">Transaction Report</h5>
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
                                                <label class="col-form-label col-md-2"><strong>Voucher Id:</strong></label>
                                                <div className="col-md-4">
                                                    <input placeholder='Voucher Id' class="form-control form-control-sm  alpha_space item_name" type="text" value={invoiceId}
                                                        onChange={(e) => setInvoiceId(e.target.value)} />
                                                </div>
                                                <label class="col-form-label col-md-2"><strong>Paid By:
                                                </strong></label>
                                                <div className="col-md-4">
                                                    <select
                                                        value={paidBy}
                                                        onChange={(e) => setPaidBy(e.target.value)}
                                                        name="statusFilter"
                                                        className="form-control form-control-sm integer_no_zero lshift"

                                                    >
                                                        <option value="">Select Paid By </option>
                                                        {
                                                            account_head.map(account =>

                                                                <>
                                                                    <option value={account.id}>{account.account_head_name}</option>
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
                    {loading ? <div className='text-center'>
                        <div className='  text-center text-dark'
                        >
                            <FontAwesomeIcon style={{
                                height: '33px',
                                width: '33px',
                            }} icon={faSpinner} spin />
                        </div>
                    </div> : searchResults?.length > 0 ? (

                        <div class="card-body" >
                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                <button
                                    className={`nav-link w-20 ${activeTab === 'income' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('income')}
                                    type="button"
                                    role="tab"
                                >
                                    Income Details
                                </button>
                                <button
                                    className={`nav-link w-20 ${activeTab === 'expense' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('expense')}
                                    type="button"
                                    role="tab"
                                >
                                    Expense Details
                                </button>
                                <button
                                    className={`nav-link w-20 ${activeTab === 'salary' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('salary')}
                                    type="button"
                                    role="tab"
                                >
                                    Salary Details
                                </button>
                            </div>

                            {/* Conditional rendering based on the active tab */}
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover table-striped table-sm">
                                    <thead>
                                        {activeTab === 'income' && (
                                            <tr>
                                                <th>SL</th>
                                                <th>Name</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Voucher Id</th>
                                                <th>Paid By</th>
                                            </tr>
                                        )}
                                        {activeTab === 'expense' && (
                                            <tr>
                                                <th>SL</th>
                                                <th>Name</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Voucher Id</th>
                                                <th>Paid By</th>
                                            </tr>
                                        )}
                                        {activeTab === 'salary' && (
                                            <tr>
                                                <th>SL</th>
                                                <th>Date</th>
                                                <th>Name</th>
                                                <th>Invoice</th>
                                                <th>Month</th>
                                                <th>Amount</th>
                                                <th>Paid By</th>
                                            </tr>
                                        )}

                                    </thead>
                                    <tbody>
                                        {activeTab === 'income' && (
                                            <>

                                                {incomeSearch?.map((income, i) => (
                                                    <tr key={income.voucher_id}>
                                                        <td>{i + 1}</td>
                                                        <td>{income.income_name}</td>
                                                        <td>{income?.income_date?.slice(0, 10)}</td>
                                                        <td>{income.sub_total}</td>
                                                        <td>{income.voucher_id}</td>
                                                        <td>{income.account_head_name}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={3}><strong>Total Income:</strong></td>
                                                    <td>{subTotalIncome}</td>
                                                    <td colSpan={2}></td>
                                                </tr>
                                            </>
                                        )}

                                        {activeTab === 'expense' && (
                                            <>

                                                {searchResults?.map((expense, i) => (
                                                    <tr key={expense.voucher_id}>
                                                        <td>{i + 1}</td>
                                                        <td>{expense.expense_name}</td>
                                                        <td>{expense?.expense_date?.slice(0, 10)}</td>
                                                        <td>{expense.sub_total}</td>
                                                        <td>{expense.voucher_id}</td>
                                                        <td>{expense.account_head_name}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={3}><strong>Total Expense:</strong></td>
                                                    <td>{subTotal}</td>
                                                    <td colSpan={2}></td>
                                                </tr>
                                            </>
                                        )}

                                        {activeTab === 'salary' && (
                                            <>

                                                {salarySearch?.map((salary, i) => (
                                                    <tr key={salary.salary_month}>
                                                        <td>{i + 1}</td>
                                                        <td>{salary?.salary_date?.slice(0, 10)}</td>
                                                        <td>{salary.employee_name}</td>
                                                        <td></td>
                                                        <td>{getMonthNames(salary.salary_month)}</td>
                                                        <td>{salary.paid_amount}</td>
                                                        <td>{salary.account_head_name}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={5}><strong>Total Salary:</strong></td>
                                                    <td>{subTotalSalary}</td>
                                                    <td colSpan={4}></td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>

                                    {/* <tbody>
                                        {activeTab === 'income' && (
                                            incomeSearch?.map((income, i) => (
                                                <>
                                                    <tr>
                                                        <td>{i + 1}</td>
                                                        <td>{income.income_name}</td>
                                                        <td>{income?.income_date?.slice(0, 10)}</td>
                                                        <td>{income.amount}</td>
                                                        <td>{income.voucher_id}</td>
                                                        <td>{income.account_head_name}</td>

                                                    </tr>
                                                    
                                                </>
                                            ))

                                        )}
                                          <tr>
                                            <td colSpan={3}><strong>Subtotal:</strong></td>
                                            <td>{subTotalIncome}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                      
                                        {activeTab === 'expense' && (
                                            searchResults?.map((expense, i) => (
                                                <>
                                                    <tr>
                                                        <td>{i + 1}</td>
                                                        <td>{expense.expense_name}</td>
                                                        <td>{expense?.expense_date?.slice(0, 10)}</td>
                                                        <td>{expense.amount}</td>
                                                        <td>{expense.voucher_id}</td>
                                                        <td>{expense.account_head_name}</td>

                                                    </tr>

                                                </>
                                            ))

                                        )}
                                        <tr>
                                            <td colSpan={3}><strong>Subtotal:</strong></td>
                                            <td>{subTotal}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        {activeTab === 'salary' && (
                                            salarySearch?.map((salary, i) => (
                                                <>
                                                    <tr>
                                                        <td>{i + 1}</td>
                                                        <td>{salary?.salary_date?.slice(0, 10)}</td>
                                                        <td>{salary.employee_name}</td>
                                                        <td></td>
                                                        <td>{getMonthNames(salary.salary_month)}</td>
                                                        <td>{salary.paid_amount}</td>
                                                        <td>{salary.account_head_name}</td>

                                                    </tr>

                                                </>
                                            ))
                                        )}
                                        <tr>
                                            <td colSpan={3}><strong>Subtotal:</strong></td>
                                            <td>{subTotalSalary}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tbody> */}
                                </table>
                            </div>

                        </div>
                    ) :
                        <>
                            <p></p>
                        </>
                    }
                </div>
            </div>
        </div>

    );
};

export default TransactionReports;