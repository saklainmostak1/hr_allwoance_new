'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Swal from "sweetalert2";
import { FaTrash } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';



const CreateExpense = () => {

    const [supplierId, setSupplierId] = useState('');

    const supplier_id = (id) => {
        setSupplierId(id);
        console.log("Selected supplier id:", id);
    };



    // Dynamically generate API endpoint based on selected supplierId
    const api = supplierId ? `/Admin/supplier/due_amount/${supplierId}` : '';

    const { data: supplierLastDue } = useQuery({
        queryKey: ['supplierLastDue', api], // Include api in queryKey to trigger refetch when api changes
        queryFn: async () => {
            if (api) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002${api}`);
                const data = await res.json();
                return data;
            }
        },
        enabled: !!api, // Enable the query only if api is truthy (supplierId is selected)
    });


    console.log(supplierLastDue?.payable_amount)

    const prev_due = supplierLastDue?.payable_amount - supplierLastDue?.paid_amount;

    const [numToAdd, setNumToAdd] = useState(1);
    const [fields, setFields] = useState([{ expense_category: '', item_name: '', amount: '', quantity: '', total_amount: '' }]);




    const handleChange = (index, event) => {
        const newFields = [...fields];

        if (event.target.type === 'file') {
            newFields[index][event.target.name] = event.target.files[0];
        } else {
            newFields[index][event.target.name] = event.target.value;

            if (event.target.name === 'quantity') {
                if (parseFloat(event.target.value) < 1) {
                    // ('Error', 'Quantity cannot be less than 1', 'error');
                    newFields[index][event.target.name] = '1';
                }
            }

            if (event.target.name === 'amount') {
                if (parseFloat(event.target.value) < 0) {
                    // Swal.fire('Error', 'Amount cannot be less than 0', 'error');
                    newFields[index][event.target.name] = '0';
                }
            }

            if (event.target.name === 'quantity' || event.target.name === 'amount') {
                const quantity = parseFloat(newFields[index].quantity || 0);
                const amount = parseFloat(newFields[index].amount || 0);

                newFields[index].total_amount = (quantity * amount).toFixed(3);
            }
        }
        setFields(newFields);
    };




    const handleAddMore = () => {
        const numToAddInt = parseInt(numToAdd);
        if (!isNaN(numToAddInt) && numToAddInt > 0) {
            const newInputValues = [...fields];
            for (let i = 0; i < numToAddInt; i++) {
                newInputValues.push({
                    expense_category: '', item_name: '', amount: '', quantity: '', total_amount: ''
                });
            }
            setFields(newInputValues);
            setNumToAdd(1);
        }
    };

    const handleRemoveField = (index) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const [created, setCreated] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userId') || '';
        }
        return '';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('userId');
            setCreated(storedUserId);
        }
    }, []);


    // Inside your component function
    const [discountAmount, setDiscountAmount] = useState(0);
    const [dueAmount, setDueAmount] = useState(0);

    // Other state variables and useEffect remain the same

    const calculateTotals = () => {
        let totalAmount = 0;
        let totalDiscount = parseFloat(discountAmount);
        let totalDueAmount = parseFloat(dueAmount);
        let totalPaidAmount = 0;
        let preDueAmount = prev_due;
        let totalPayAbleAmount = 0;
        let totalPayAbleAmounts = 0;

        fields.forEach((field) => {
            totalAmount += parseFloat(field.total_amount || 0);
        });

        totalPayAbleAmount = totalAmount - totalDiscount;
        totalPayAbleAmounts = totalAmount

        // Calculate totalPaidAmount
        totalPaidAmount = totalPayAbleAmount - totalDueAmount;

        return {
            netAmount: totalAmount + preDueAmount,
            totalAmount,
            totalDiscount,
            totalPaidAmount,
            totalDueAmount,
            totalPayAbleAmount,
            totalPayAbleAmounts
        };
    };

    // Other functions remain the same

    // const handleInputChange = (event) => {

    //     if (event.target.name === 'discountAmount') {
    //         setDiscountAmount(parseFloat(event.target.value));
    //     } else if (event.target.name === 'dueAmount') {
    //         setDueAmount(parseFloat(event.target.value));
    //     }
    // };
// const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     const parsedValue = parseFloat(value);
//     if (name === 'discountAmount') {
//         setDiscountAmount(parsedValue >= 0 ? parsedValue : 0);
//     } else if (name === 'dueAmount') {
//         setDueAmount(parsedValue >= 0 ? parsedValue : 0);
//     }
// };



    const {
        totalAmount,
        totalPayAbleAmounts,
        totalPaidAmount,
        preDueAmount = prev_due,

        netAmount,
        totalPayAbleAmount
    } = calculateTotals();


    const data = (totalPaidAmount + preDueAmount) ? (totalPaidAmount + preDueAmount) : 0
const [paidAmount, setPaidAmount] = useState(data);

useEffect(() => {
    setPaidAmount(data)
}, [data])
// Other functions remain the same
const handleInputChange = (event) => {
    const { name, value } = event.target;
    const parsedValue = parseFloat(value);
    if (name === 'discountAmount') {
        setDiscountAmount(parsedValue >= 0 ? parsedValue : 0);
    } else if (name === 'dueAmount') {
        setDueAmount(parsedValue >= 0 ? parsedValue : 0);
    }
   
    setPaidAmount(value >= 0 ? value : 0); 
};

    const router = useRouter()
    const expense_create = (event) => {
        event.preventDefault();

        const form = event.target;



        for (let index = 0; index < fields.length; index++) {

            const item_name = form.item_name.value || form?.item_name[index]?.value
            const expense_category = form.expense_category.value || form?.expense_category[index]?.value
            const amount = form.amount.value || form?.amount[index]?.value
            // const voucher_id = form.voucher_id.value || form?.voucher_id[index]?.value
            const payment = form.payment.value || form?.payment[index]?.value
            const expense_date = form.expense_date.value || form?.expense_date[index]?.value
            const discount = form.discountAmount.value || form?.discountAmount[index]?.value
            const short_note = form.short_note.value || form?.short_note[index]?.value
            const quantity = form.quantity.value || form?.quantity[index]?.value
            const supplier_id = form.supplier_id.value || '';
            const previous_due = form.previous_due.value || '';

            const payable_amount = form.payable_amount.value || '';
            const due_amount = form.dueAmount.value || '';
            const paid_amount = form.paid_amount.value || '';
            const sub_total = form.sub_total.value || '';
            let bank_check_no = '';
            if (selectedEntryType === '2') {
                bank_check_no = form.bank_check_no.value || '';
            }


            const productData = {
                expense_category, amount, payment_type: payment, expense_date, discount, short_note,
                created_by: created, bank_check_no, supplier_id, sub_total, previous_due,
                payable_amount,
                due_amount,
                paid_amount,
                quantity,
                item_name
            }


            console.log(productData, '=====================')

            // /Admin/expense/expense_create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/expense/expense_create`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(productData),
            })
                .then((Response) => {
                    Response.json()
                    console.log(Response)
                    if (Response.ok === true) {
                        sessionStorage.setItem("message", "Data saved successfully!");
                        router.push('/Admin/expense/expense_all')
                    }
                })
                .then((data) => {
                    console.log(data)

                    // if (data.affectedRows > 0) {
                    //     sessionStorage.setItem("message", "Data saved successfully!");
                    //     router.push('/Admin/expense/expense_all')

                    // }
                })
                .catch((error) => console.error(error));
        }
    }


    const [page_group, setPage_group] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pageGroup') || '';
        }
        return '';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('pageGroup');
            setPage_group(storedUserId);
        }
    }, []);



    const [selectedEntryType, setSelectedEntryType] = useState('');

    const handleEntryTypeChange = (event) => {
        setSelectedEntryType(event.target.value);
    };


    const [currentDates, setCurrentDates] = useState('');
    const [formattedDates, setFormattedDates] = useState('');
    // useEffect to update the current date when the component mounts
    useEffect(() => {
        const getCurrentDate = () => {
            // Get the current date
            const now = new Date();
            // Format the date to YYYY-MM-DD (required format for type="date" input)
            const formattedDate = now.toISOString().split('T')[0];
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const formatted = new Intl.DateTimeFormat('en-US', options).format(now);
            setFormattedDates(formatted);
            // Set the state with the current date
            setCurrentDates(formattedDate);
        };

        // Call the function to get the current date
        getCurrentDate();
    }, []);

    const [expenseDate, setExpenseDate] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [error, setError] = useState('');

    const handleDateChange = (event) => {
        const selectedDate = event.target.value; // Directly get the value from the input

        const day = String(selectedDate.split('-')[2]).padStart(2, '0'); // Extract day, month, and year from the date string
        const month = String(selectedDate.split('-')[1]).padStart(2, '0');
        const year = String(selectedDate.split('-')[0]);
        const formattedDate = `${day}-${month}-${year}`;
        const formattedDatabaseDate = `${year}-${month}-${day}`;

        // Check if the selected date is in the future
        const today = new Date();
        const selected = new Date(selectedDate);

        if (selected > today) {
            setError('Expense date cannot be in the future.');
            setCurrentDate('');
            setExpenseDate('');
        } else {
            setError('');
            setCurrentDate(formattedDate);
            setExpenseDate(formattedDatabaseDate);
        }
    };

    useEffect(() => {
        if (expenseDate.includes('-')) {
            const [year, month, day] = expenseDate.split('-');
            setFormattedDate(`${day}-${month}-${year}`);
        } else {
            console.log("Date format is incorrect:", expenseDate);
        }
    }, [expenseDate]);



    const { data: expenseCategories = [], isLoading, refetch
    } = useQuery({
        queryKey: ['expenseCategories'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/expence_category/expence_category_all`)

            const data = await res.json()
            return data
        }
    })


    const { data: supplierList = []
    } = useQuery({
        queryKey: ['supplierList'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/supplier/supplier_list`)

            const data = await res.json()
            return data
        }
    })

    const { data: module_settings = []
    } = useQuery({
        queryKey: ['module_settings'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/module_settings/module_settings_all`)

            const data = await res.json()
            return data
        }
    })

    const module_setting = module_settings.filter(moduleI => moduleI.table_name === 'expense');

    console.log(module_setting[0]?.decimal_digit, '-------------------------------------');

    const decimal_digit = module_setting[0]?.decimal_digit;




    const handlePrint = () => {

        // Open a new window for printing
        const printWindow = window.open('', '_blank');

        // Start building the HTML content for printing
        let htmlContent = `
        <html>
            <head>
                <title>Pathshala School & College Expense Form</title>
                <style>
                   
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                    thead {
                        background-color: gray; /* Set background color for table header */
                    }
                 
                    body {
                        text-align: center; /* Center align text within the body */
                    }
                </style>
            </head>
            <body>
            <h2 style="margin: 0; padding: 0;">Pathshala School & College Expense Form</h2>
            <h3 style="margin: 0; padding: 0;">GA-75/A, Middle Badda, Dhaka-1212</h3>
            <p style="margin: 0; padding: 0;">Phone: 01977379479, Mobile: 01977379479</p>
            <p style="margin: 0; padding: 0; margin-bottom: 10px">Email: pathshala@urbanitsolution.com</p>


            <h3 style="margin-bottom: 10px; padding: 0; text-decoration: underline;">Expense expense Copy</h3>
            <div style="display: flex; justify-content: space-between;">
            <p style="margin: 0; padding: 0;">Receipt No: 829</p>
            <p style="margin: 0; padding: 0;">Collected By: পাঠশালা স্কুল এন্ড কলেজ</p>
            <p style="margin: 0; padding: 0;">Date: ${currentDate}</p>
        </div>
                <table>
                    <thead>
                        <tr>
                           
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Amount</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
    `;


        // Collect data from form fields and construct the rows for printing
        const form = document.querySelector('.form-horizontal');
        const formData = new FormData(form);

        // Initialize total amount variable
        let totalAmount = 0;

        // Get the number of rows (assuming item names determine the number of rows)
        const rowCount = formData.getAll('item_name').length;

        // Iterate over each row and print the corresponding data
        for (let i = 0; i < rowCount; i++) {
            // Get the data for the current row
            const itemName = formData.getAll('item_name')[i];
            const quantity = formData.getAll('quantity')[i];
            const amount = formData.getAll('amount')[i];
            const currentTotalAmount = formData.getAll('total_amount')[i];

            // Add a table row with the data
            htmlContent += `
                <tr>
                    <td>${itemName}</td>
                    <td>${quantity}</td>
                    <td>${amount}</td>
                    <td>${currentTotalAmount}</td>
                </tr>
            `;

            // Accumulate total amount
            totalAmount += parseFloat(currentTotalAmount);
        }

        // Finish building HTML content
        htmlContent += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3">Paid Amount:</td>
                                <td>${(totalPaidAmount + preDueAmount).toFixed(3)}</td>
                            </tr>
                            <tr>
                                <td colspan="3">Due Amount:</td>
                                <td>${dueAmount}</td>
                            </tr>
                            
                            </tfoot>
                            </table>
                            <footer>
                            <p>a</p>
                            
                            </footer>
                </body>
            </html>
        `;

        // Write HTML content to the print window and print it
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    };






    // Modified formatString function to capitalize each word
    const formatString = () => {
        handlePrint()
        expense_create()
    };


    const [text, setText] = useState('');
    const maxLength = 500;

    const handleChangeTextarea = (event) => {
        const inputText = event.target.value;
        if (inputText.length <= maxLength) {
            setText(inputText);
        }
    };

    const handlePaste = (event) => {
        const pastedText = event.clipboardData.getData('text/plain');
        const newText = text + pastedText;
        if (newText.length > maxLength) {
            event.preventDefault();
        } else {
            setText(newText);
        }
    };
    console.log(paidAmount)


    return (
        <div class="container-fluid">
            <div class=" row ">

                <div className='col-12 p-4'>
                    <div className='card'>

                        <div className="card-default">


                            <div className="card-header custom-card-header py-1  clearfix bg-gradient-primary text-white">
                                <h5 className="card-title card-header-color font-weight-bold mb-0  float-left mt-1">Create Expense</h5>
                                <div className="card-title card-header-color font-weight-bold mb-0  float-right ">
                                    <Link href={`/Admin/expense/expense_all?page_group=${page_group}`} className="btn btn-sm btn-info">Back to Expense List</Link>
                                </div>
                            </div>
                            <>
                                <form className="form-horizontal" method="post" autoComplete="off" onSubmit={expense_create}>

                                    <div class="d-lg-flex md:d-md-flex justify-content-between px-3 mt-3">

                                        <div class=" ">
                                            <div className='col-md-12'>

                                                <h5>From,</h5>
                                                <div>
                                                    <select required="" onChange={(e) => supplier_id(e.target.value)} name="supplier_id" className="form-control form-control-sm mb-2" id="supplier_id">
                                                        <option value=''>Select Supplier</option>
                                                        {
                                                            supplierList.map((supplier) => (
                                                                <>
                                                                    <option value={supplier.id}>{supplier.name}</option>

                                                                </>

                                                            ))
                                                        }

                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <label className='font-weight-bold'>Expense Purches Date:</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={formattedDate}
                                                    onClick={() => document.getElementById(`dateInput-n`).showPicker()}
                                                    placeholder="dd-mm-yyyy"
                                                    className="form-control form-control-sm mb-2"
                                                    style={{ display: 'inline-block' }}
                                                />
                                                <input
                                                    name='dob'
                                                    type="date"
                                                    id={`dateInput-n`}
                                                    onChange={(e) => handleDateChange(e)}
                                                    style={{ position: 'absolute', bottom: '40px', left: '10px', visibility: 'hidden' }}
                                                />
                                                {error && <div className="text-danger">{error}</div>}
                                            </div>
                                            {/* <div >
                                                <label className='font-weight-bold'>Expense Purches Date:</label>

                                                <input type="date" required="" name="expense_date" className="form-control form-control-sm mb-2" id="purchase_invoice" placeholder="Enter Purchase Invoice" defaultValue={currentDate} />
                                            </div> */}
                                        </div>
                                        <div class="">

                                            <span >{formattedDates}</span>
                                        </div>
                                    </div>



                                    <div className="alert alert-warning mb-0 mx-4 mt-4 text-danger font-weight-bold" role="alert">
                                        (<small><sup><i className="text-danger fas fa-star"></i></sup></small>) field required
                                    </div>



                                    <div className="card-body">
                                        <div>
                                            <div className="card-header custom-card-header py-1 clearfix  bg-gradient-primary text-white">

                                                <div className="card-title card-header-color font-weight-bold mb-0 float-left mt-1">
                                                    <strong>Expense</strong>
                                                </div>

                                                <div className="card-title card-header-color font-weight-bold mb-0 float-right">
                                                    <div className="input-group printable">
                                                        <input
                                                            style={{ width: '80px' }}
                                                            type="number"
                                                            min="1"
                                                            className="form-control "
                                                            placeholder="Enter number of forms to add"
                                                            value={numToAdd}
                                                            onChange={(event) => setNumToAdd(event.target.value)}
                                                        />
                                                        <div className="input-group-append">
                                                            <button
                                                                type="button"
                                                                className="btn btn-info btn-sm py-1 add_more "
                                                                onClick={handleAddMore}
                                                            >
                                                                Add More
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="form-group row px-3 ">
                                                    <table className="table table-bordered  table-hover table-striped table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>
                                                                    Expense Category
                                                                </th>
                                                                <th>
                                                                    Item Name
                                                                </th>
                                                                <th>
                                                                    Quantity
                                                                </th>
                                                                <th>
                                                                    Amount
                                                                </th>
                                                                <th>
                                                                    Total Amount
                                                                </th>

                                                                <th>
                                                                    Action
                                                                </th>
                                                            </tr>

                                                        </thead>

                                                        <tbody>

                                                            {isLoading ? <div className='text-center'>
                                                                <div className='  text-center text-dark'>

                                                                    <FontAwesomeIcon style={{
                                                                        height: '33px',
                                                                        width: '33px',
                                                                    }} icon={faSpinner} spin />

                                                                </div>
                                                            </div>

                                                                :


                                                                <>

                                                                    {
                                                                        fields.map((field, index) => (
                                                                            <>

                                                                                <tr >
                                                                                    <td>
                                                                                        <select
                                                                                            required=""
                                                                                            name="expense_category"
                                                                                            className="form-control form-control-sm mb-2"
                                                                                            value={field.expense_category}
                                                                                            onChange={(e) => handleChange(index, e)}>

                                                                                            <option value="1">Select One</option>
                                                                                            {
                                                                                                expenseCategories.map((expense) => (
                                                                                                    <>
                                                                                                        <option value={expense.id}>{expense.expense_category_name}</option>
                                                                                                    </>
                                                                                                ))
                                                                                            }

                                                                                        </select>
                                                                                    </td>

                                                                                    <td>
                                                                                        <input
                                                                                            type="text"
                                                                                            required
                                                                                            name="item_name"
                                                                                            className="form-control form-control-sm mb-2"
                                                                                            placeholder="Expense Title"
                                                                                            value={field.item_name}
                                                                                            onChange={(e) => handleChange(index, e)}
                                                                                        />

                                                                                    </td>

                                                                                    <td>
                                                                                        <input
                                                                                            type="number"
                                                                                            required
                                                                                            name="quantity"
                                                                                            className="form-control form-control-sm mb-2"
                                                                                            placeholder="Enter Quantity "
                                                                                            value={field.quantity}
                                                                                            onChange={(e) => handleChange(index, e)}
                                                                                        />
                                                                                    </td>

                                                                                    <td>
                                                                                        <input
                                                                                            type="number"
                                                                                            required
                                                                                            name="amount"
                                                                                            className="form-control form-control-sm mb-2"
                                                                                            placeholder="Enter Amount "
                                                                                            value={field.amount}
                                                                                            onChange={(e) => handleChange(index, e)}
                                                                                        />
                                                                                    </td>

                                                                                    <td>
                                                                                        <input
                                                                                            type="text"
                                                                                            required
                                                                                            readOnly
                                                                                            className="form-control form-control-sm mb-2"
                                                                                            placeholder="total amount"
                                                                                            value={Number(field.total_amount).toFixed(decimal_digit)}
                                                                                        />
                                                                                        <input
                                                                                            type="text"
                                                                                            required
                                                                                            readOnly
                                                                                            hidden
                                                                                            name="total_amount"
                                                                                            className="form-control form-control-sm mb-2"
                                                                                            placeholder="total amount"
                                                                                            value={Number(field.total_amount).toFixed(3)}
                                                                                        />
                                                                                    </td>
                                                                                    <td> <button type="button" onClick={() => handleRemoveField(index)} className="btn btn-danger btn-sm float-lg-right float-md-right" ><FaTrash></FaTrash></button></td>

                                                                                </tr>
                                                                            </>
                                                                        ))
                                                                    }
                                                                </>
                                                            }
                                                        </tbody>

                                                    </table>


                                                    <div className='col-lg-12 border'>
                                                        <label className='font-weight-bold'>Short Note:</label>
                                                        <textarea
                                                            rows={2}
                                                            value={text}
                                                            onChange={handleChangeTextarea}
                                                            onPaste={handlePaste}
                                                            className={`form-control form-control-sm ${text.length > maxLength ? 'is-invalid' : ''}`}
                                                            placeholder="Enter Short Note"
                                                            name='short_note'
                                                        ></textarea>
                                                        <div className='text-right'>{text.length}/{maxLength}</div>
                                                        {text.length > maxLength && (
                                                            <div className="invalid-feedback">Exceeded character limit</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>



                                    <div className="container mx-auto ">


                                      






                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Sub Total:</strong>
                                            </label>

                                            <div class="col-md-3">
                                                <p className='text-right'>
                                                    <strong>
                                                    {totalAmount.toFixed(decimal_digit)}

                                                   <span className=''> TK</span>
                                                    </strong>
                                                </p>
                                                {/* <input
                                                    type="text"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="totalAmount"
                                                    placeholder="Enter Total Amount"
                                                    value={totalAmount.toFixed(decimal_digit)}
                                                /> */}
                                                <input
                                                    type="text"
                                                    hidden
                                                    name="sub_total"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="totalAmount"
                                                    placeholder="Enter Total Amount"
                                                    value={totalAmount.toFixed(3)}
                                                />
                                            </div>
                                        </div>

                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Previous Due:</strong>
                                            </label>
                                            <div class="col-md-3">
                                                <p className='text-right'>
                                                    <strong>
                                                    {preDueAmount ? preDueAmount.toFixed(decimal_digit) : 0}
                                                    <span className=''> TK</span>
                                                    </strong>
                                                </p>
                                                {/* <input
                                                    type="text"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="totalAmount"
                                                    placeholder="Enter Total Amount"
                                                    value={preDueAmount ? preDueAmount.toFixed(decimal_digit) : 0}
                                                /> */}

                                                <input
                                                    type="text"
                                                    hidden
                                                    name="previous_due"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="totalAmount"
                                                    placeholder="Enter Total Amount"
                                                    value={preDueAmount.toFixed(3)}
                                                />
                                            </div>
                                        </div>

                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Net Amount:</strong>
                                            </label>
                                            <div class="col-md-3">
                                                <p className='text-right'>
                                                    <strong>
                                                    {netAmount ? netAmount.toFixed(decimal_digit) : 0}
                                                    <span className=''> TK</span>
                                                    </strong>
                                                </p>
                                                {/* <input
                                                    type="text"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="netAmount"
                                                    placeholder="Enter Net Amount"
                                                    value={netAmount ? netAmount.toFixed(decimal_digit) : 0}
                                                /> */}
                                                <input
                                                    type="text"
                                                    hidden
                                                    name="net_amount"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="netAmount"
                                                    placeholder="Enter Net Amount"
                                                    value={netAmount.toFixed(3)}
                                                />
                                            </div>
                                        </div>

                                       
                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Payable Amount:</strong>
                                            </label>
                                            <div class="col-md-3">
                                                <p className='text-right'>
                                                    <strong>
                                                    {(totalPayAbleAmounts + preDueAmount) ? (totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit) : 0}
                                                    <span className=''> TK</span>
                                                    </strong>
                                                </p>
                                                {/* <input
                                                    type="text"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="paidAmount"
                                                    placeholder="Enter Paid Amount"
                                                    value={(totalPayAbleAmounts + preDueAmount) ? (totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit) : 0}
                                                /> */}
                                                <input
                                                    type="text"
                                                    hidden
                                                    name="payable_amount"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="paidAmount"
                                                    placeholder="Enter Paid Amount"
                                                    value={(totalPayAbleAmount + preDueAmount).toFixed(3)}
                                                />
                                            </div>
                                        </div>


                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Discount:</strong>
                                            </label>
                                            <div class="col-md-3">

                                                <input
                                                    type="text"
                                                    name="discountAmount"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="discountAmount"
                                                    placeholder="Enter Discount Amount"
                                                    value={discountAmount}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                        </div>

                                        <div class="form-group row student d-flex justify-content-end m-0 ">
                                            <label class="col-form-label col-md-2">
                                                <strong>Paid Amount:</strong>
                                            </label>
                                            <div class="col-md-3">
                                                <input
                                                    type="text"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="paidAmount"
                                                    placeholder="Enter Paid Amount"
                                                    value={paidAmount}
                                                    onChange={handleInputChange} 
                                                />
                                                <input
                                                    type="text"
                                                    hidden
                                                    name="paid_amount"
                                                    class="form-control form-control-sm  alpha_space student_id"
                                                    id="paidAmount"
                                                    placeholder="Enter Paid Amount"
                                                    value={paidAmount}
                                                />
                                            </div>
                                        </div>

                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Paid by:</strong>
                                            </label>


                                            <div class="col-md-3">
                                                <select
                                                    required=""
                                                    name="payment"
                                                    className="form-control form-control-sm mb-2"

                                                    value={selectedEntryType}
                                                    onChange={handleEntryTypeChange}
                                                >
                                                    <option value="">Select Type Of Payment</option>
                                                    <option value="1">Cash</option>

                                                    <option value="2">Check</option>

                                                </select>
                                            </div>

                                        </div>

                                        <div class="">

                                            {selectedEntryType === '2' ?

                                                <div class="form-group row student d-flex justify-content-end m-0">
                                                    <label class="col-form-label col-md-2">
                                                        <strong>Bank Check No:</strong>
                                                    </label>

                                                    <div class="col-md-3">
                                                        <input
                                                            type="text"
                                                            required
                                                            name="bank_check_no"
                                                            className="form-control form-control-sm mb-2"
                                                            placeholder="Enter Bank Check No"
                                                        />
                                                    </div>
                                                </div>

                                                :

                                                <div className={`brand-item d-lg-flex d-md-flex col-lg-12  justify-content-between`}></div>
                                            }

                                        </div>

                                        <div class="form-group row student d-flex justify-content-end m-0">
                                            <label class="col-form-label col-md-2">
                                                <strong>Due Amount:</strong>
                                            </label>
                                            <div class="col-md-3">
                                                {/* <input
                                                disabled
                                                    type="text"
                                                    name="dueAmount" // Make sure the name matches the state variable name
                                                    className="form-control form-control-sm alpha_space student_id" // Use className instead of class
                                                    id="dueAmount"
                                                    placeholder="Enter Due Amount"
                                                    // value={dueAmount} 
                                                    value={((((totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit)) - discountAmount) - paidAmount ) ? ((((totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit)) - discountAmount) - paidAmount ) : 0}
                                                    // Use value attribute to bind the state variable
                                                    onChange={handleInputChange} // Call handleInputChange function on change
                                                /> */}
                                                <p className='text-right'  onChange={handleInputChange}>
                                                    <strong>
                                                    {((((totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit)) - discountAmount) - paidAmount ) ? ((((totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit)) - discountAmount) - paidAmount ) : 0}
                                                    <span className=''> TK</span>
                                                    </strong>
                                                   </p>
                                                <input
                                                disabled
                                                    type="text"
                                                    hidden
                                                    name="dueAmount" // Make sure the name matches the state variable name
                                                    className="form-control form-control-sm alpha_space student_id" // Use className instead of class
                                                    id="dueAmount"
                                                    placeholder="Enter Due Amount"
                                                    // value={dueAmount} 
                                                    value={((((totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit)) - discountAmount) - paidAmount ) ? ((((totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit)) - discountAmount) - paidAmount ) : 0}
                                                    // Use value attribute to bind the state variable
                                                    onChange={handleInputChange} // Call handleInputChange function on change
                                                />
                                            </div>
                                        </div>

                                        <div class="form-group row d-flex justify-content-end">
                                            <div class="offset-md-2  ">
                                                <input type='submit' onClick={handlePrint} name="search" class="btn btn-sm btn-info search_btn mr-2" value="Print" />
                                                <input type="submit" name="Print" class="btn btn-sm btn-success print_btn mr-2" value="Save" />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </>


                        </div>
                    </div>
                </div>
            </div>
        </div>



    );
};

export default CreateExpense;

// const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     const parsedValue = parseFloat(value);
//     if (name === 'discountAmount') {
//         setDiscountAmount(parsedValue >= 0 ? parsedValue : 0);
//     } else if (name === 'dueAmount') {
//         setDueAmount(parsedValue >= 0 ? parsedValue : 0);
//     }
// };


// 'use client'
// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import Swal from "sweetalert2";
// import { FaTrash } from 'react-icons/fa';
// import { useQuery } from '@tanstack/react-query';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSpinner } from '@fortawesome/free-solid-svg-icons';
// import { useRouter } from 'next/navigation';



// const CreateExpense = () => {

//     const [supplierId, setSupplierId] = useState('');

//     const supplier_id = (id) => {
//         setSupplierId(id);
//         console.log("Selected supplier id:", id);
//     };
  


//     // Dynamically generate API endpoint based on selected supplierId
//     const api = supplierId ? `/Admin/supplier/due_amount/${supplierId}` : '';

//     const { data: supplierLastDue } = useQuery({
//         queryKey: ['supplierLastDue', api], // Include api in queryKey to trigger refetch when api changes
//         queryFn: async () => {
//             if (api) {
//                 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002${api}`);
//                 const data = await res.json();
//                 return data;
//             }
//         },
//         enabled: !!api, // Enable the query only if api is truthy (supplierId is selected)
//     });


//     console.log(supplierLastDue?.payable_amount)

//     const prev_due = supplierLastDue?.payable_amount - supplierLastDue?.paid_amount;

//     const [numToAdd, setNumToAdd] = useState(1);
//     const [fields, setFields] = useState([{ expense_category: '', item_name: '', amount: '', quantity: '', total_amount: '' }]);







//     const [created, setCreated] = useState(() => {
//         if (typeof window !== 'undefined') {
//             return localStorage.getItem('userId') || '';
//         }
//         return '';
//     });

//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             const storedUserId = localStorage.getItem('userId');
//             setCreated(storedUserId);
//         }
//     }, []);


//     // Inside your component function
//     const [discountAmount, setDiscountAmount] = useState(0);
//     const [dueAmount, setDueAmount] = useState(0);

//     // Other state variables and useEffect remain the same

//     const calculateTotals = () => {
//         let totalAmount = 0;
//         let totalDiscount = parseFloat(discountAmount);
//         let totalDueAmount = parseFloat(dueAmount);
//         let totalPaidAmount = 0;
//         let preDueAmount = prev_due;
//         let totalPayAbleAmount = 0;
//         let totalPayAbleAmounts = 0;

//         fields.forEach((field) => {
//             totalAmount += parseFloat(field.total_amount || 0);
//         });

//         totalPayAbleAmount = totalAmount - totalDiscount;
//         totalPayAbleAmounts = totalAmount

//         // Calculate totalPaidAmount
//         totalPaidAmount = totalPayAbleAmount - totalDueAmount;

//         return {
//             netAmount: totalAmount + preDueAmount,
//             totalAmount,
//             totalDiscount,
//             totalPaidAmount,
//             totalDueAmount,
//             totalPayAbleAmount,
//             totalPayAbleAmounts
//         };
//     };



//     const {
//         totalAmount,
//         totalPayAbleAmounts,
//         totalPaidAmount,
//         preDueAmount = prev_due,

//         netAmount,
//         totalPayAbleAmount
//     } = calculateTotals();

//     const router = useRouter()
 
//     const data = (totalPaidAmount + preDueAmount) ? (totalPaidAmount + preDueAmount) : 0
//     const [paidAmount, setPaidAmount] = useState(data);

//     useEffect(() => {
//         setPaidAmount(data)
//     }, [data])
//     // Other functions remain the same
//   const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         const parsedValue = parseFloat(value);
//         if (name === 'discountAmount') {
//             setDiscountAmount(parsedValue >= 0 ? parsedValue : 0);
//         } else if (name === 'dueAmount') {
//             setDueAmount(parsedValue >= 0 ? parsedValue : 0);
//         }
       
//         setPaidAmount(value >= 0 ? value : 0); 
//     };

//     const [page_group, setPage_group] = useState(() => {
//         if (typeof window !== 'undefined') {
//             return localStorage.getItem('pageGroup') || '';
//         }
//         return '';
//     });

//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             const storedUserId = localStorage.getItem('pageGroup');
//             setPage_group(storedUserId);
//         }
//     }, []);



//     const [selectedEntryType, setSelectedEntryType] = useState('');

//     const handleEntryTypeChange = (event) => {
//         setSelectedEntryType(event.target.value);
//     };


//     const [expenseDate, setExpenseDate] = useState('');
//     const [formattedDate, setFormattedDate] = useState('');
//     const [currentDate, setCurrentDate] = useState('');
//     const [error, setError] = useState('');

  




   


//     const { data: supplierList = []
//     } = useQuery({
//         queryKey: ['supplierList'],
//         queryFn: async () => {
//             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/supplier/supplier_list`)

//             const data = await res.json()
//             return data
//         }
//     })

//     const { data: module_settings = []
//     } = useQuery({
//         queryKey: ['module_settings'],
//         queryFn: async () => {
//             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/module_settings/module_settings_all`)

//             const data = await res.json()
//             return data
//         }
//     })

//     const module_setting = module_settings.filter(moduleI => moduleI.table_name === 'expense');

//     console.log(module_setting[0]?.decimal_digit, '-------------------------------------');

//     const decimal_digit = module_setting[0]?.decimal_digit;












//     const [text, setText] = useState('');
//     const maxLength = 500;




//     return (
//         <div class="container-fluid">
//             <div class=" row ">

//                 <div className='col-12 p-4'>
//                     <div className='card'>

//                         <div className="card-default">


//                             <div className="card-header custom-card-header py-1  clearfix bg-gradient-primary text-white">
//                                 <h5 className="card-title card-header-color font-weight-bold mb-0  float-left mt-1">Create Expense</h5>
//                                 <div className="card-title card-header-color font-weight-bold mb-0  float-right ">
//                                     <Link href={`/Admin/expense/expense_all?page_group`} className="btn btn-sm btn-info">Back to Expense List</Link>
//                                 </div>
//                             </div>
//                             <>
//                                 <form className="form-horizontal" method="post" autoComplete="off" >

//                                     <div class="d-lg-flex md:d-md-flex justify-content-between px-3 mt-3">

//                                         <div class=" ">
//                                             <div className='col-md-12'>

//                                                 <h5>From,</h5>
//                                                 <div>
//                                                     <select required="" onChange={(e) => supplier_id(e.target.value)} name="supplier_id" className="form-control form-control-sm mb-2" id="supplier_id">
//                                                         <option value=''>Select Supplier</option>
//                                                         {
//                                                             supplierList.map((supplier) => (
//                                                                 <>
//                                                                     <option value={supplier.id}>{supplier.name}</option>

//                                                                 </>

//                                                             ))
//                                                         }

//                                                     </select>
//                                                 </div>
//                                             </div>

                                         
//                                         </div>
                                        
//                                     </div>

//                                     <div className="container mx-auto ">

//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Payment Type:</strong>
//                                             </label>


//                                             <div class="col-md-3">
//                                                 <select
//                                                     required=""
//                                                     name="payment"
//                                                     className="form-control form-control-sm mb-2"

//                                                     value={selectedEntryType}
//                                                     onChange={handleEntryTypeChange}
//                                                 >
//                                                     <option value="">Select Type Of Payment</option>
//                                                     <option value="1">Cash</option>

//                                                     <option value="2">Check</option>

//                                                 </select>
//                                             </div>

//                                         </div>

//                                         <div class="">

//                                             {selectedEntryType === '2' ?

//                                                 <div class="form-group row student d-flex justify-content-end ">
//                                                     <label class="col-form-label col-md-2">
//                                                         <strong>Bank Check No:</strong>
//                                                     </label>

//                                                     <div class="col-md-3">
//                                                         <input
//                                                             type="text"
//                                                             required
//                                                             name="bank_check_no"
//                                                             className="form-control form-control-sm mb-2"
//                                                             placeholder="Enter Bank Check No"
//                                                         />
//                                                     </div>
//                                                 </div>

//                                                 :

//                                                 <div className={`brand-item d-lg-flex d-md-flex col-lg-12  justify-content-between`}></div>
//                                             }

//                                         </div>






//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Sub Total:</strong>
//                                             </label>

//                                             <div class="col-md-3">
//                                                 <input
//                                                     type="text"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="totalAmount"
//                                                     placeholder="Enter Total Amount"
//                                                     value={totalAmount.toFixed(decimal_digit)}
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     hidden
//                                                     name="sub_total"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="totalAmount"
//                                                     placeholder="Enter Total Amount"
//                                                     value={totalAmount.toFixed(3)}
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Previous Due:</strong>
//                                             </label>
//                                             <div class="col-md-3">
//                                                 <input
//                                                     type="text"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="totalAmount"
//                                                     placeholder="Enter Total Amount"
//                                                     value={preDueAmount ? preDueAmount.toFixed(decimal_digit) : 0}
//                                                 />

//                                                 <input
//                                                     type="text"
//                                                     hidden
//                                                     name="previous_due"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="totalAmount"
//                                                     placeholder="Enter Total Amount"
//                                                     value={preDueAmount.toFixed(3)}
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Net Amount:</strong>
//                                             </label>
//                                             <div class="col-md-3">
//                                                 <input
//                                                     type="text"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="netAmount"
//                                                     placeholder="Enter Net Amount"
//                                                     value={netAmount ? netAmount.toFixed(decimal_digit) : 0}
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     hidden
//                                                     name="net_amount"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="netAmount"
//                                                     placeholder="Enter Net Amount"
//                                                     value={netAmount.toFixed(3)}
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Discount:</strong>
//                                             </label>
//                                             <div class="col-md-3">

//                                                 <input
//                                                     type="text"
//                                                     name="discountAmount"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="discountAmount"
//                                                     placeholder="Enter Discount Amount"
//                                                     value={discountAmount}
//                                                     onChange={handleInputChange}
//                                                 />
//                                             </div>

//                                         </div>
//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Payable Amount:</strong>
//                                             </label>
//                                             <div class="col-md-3">
//                                                 <input
//                                                     type="text"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="paidAmount"
//                                                     placeholder="Enter Paid Amount"
//                                                     value={(totalPayAbleAmounts + preDueAmount) ? (totalPayAbleAmounts + preDueAmount).toFixed(decimal_digit) : 0}
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     hidden
//                                                     name="payable_amount"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="paidAmount"
//                                                     placeholder="Enter Paid Amount"
//                                                     value={(totalPayAbleAmount + preDueAmount).toFixed(3)}
//                                                 />
//                                             </div>
//                                         </div>




//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Paid Amount:</strong>
//                                             </label>
//                                             <div class="col-md-3">
//                                                 <input
//                                           onChange={handleInputChange} 
//                                                     type="text"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="paidAmount"
//                                                     placeholder="Enter Paid Amount"
//                                                     // value={(totalPaidAmount + preDueAmount) ? (totalPaidAmount + preDueAmount).toFixed(decimal_digit) : 0}
//                                                     value={paidAmount}
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     hidden
//                                                     name="paid_amount"
//                                                     class="form-control form-control-sm  alpha_space student_id"
//                                                     id="paidAmount"
//                                                     placeholder="Enter Paid Amount"
//                                                     value={(totalPaidAmount + preDueAmount).toFixed(3)}
//                                                 />
//                                             </div>
//                                         </div>


//                                         <div class="form-group row student d-flex justify-content-end ">
//                                             <label class="col-form-label col-md-2">
//                                                 <strong>Due Amount:</strong>
//                                             </label>
//                                             <div class="col-md-3">
//                                                 <input
//                                                     type="text"
//                                                     name="dueAmount" // Make sure the name matches the state variable name
//                                                     className="form-control form-control-sm alpha_space student_id" // Use className instead of class
//                                                     id="dueAmount"
//                                                     placeholder="Enter Due Amount"
//                                                     value={dueAmount} // Use value attribute to bind the state variable
//                                                     onChange={handleInputChange} // Call handleInputChange function on change
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div class="form-group row d-flex justify-content-end">
//                                             <div class="offset-md-2  ">
                                                
//                                                 <input type="submit" name="Print" class="btn btn-sm btn-success print_btn mr-2" value="Save" />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </form>
//                             </>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>



//     );
// };

// export default CreateExpense;
// 'use client'
// import Link from 'next/link';
// import React, { useEffect, useState } from 'react';

// // ... other imports

// const CreateExpense = () => {
//     // ... existing state variables
// const data = 1000
//     const [paidAmount, setPaidAmount] = useState(data); // State for paid amount

//     // ... other code

//     const handlePaidAmountChange = (event) => {
//         const value = parseFloat(event.target.value);
//         setPaidAmount(value >= 0 ? value : 0); // Update the state
//     };

//     // ... existing calculation logic

//     return (
//         <div className="container-fluid">
//             <div className="row">
//                 <div className='col-12 p-4'>
//                     <div className='card'>
//                         <div className="card-default">
//                             <div className="card-header custom-card-header py-1 clearfix bg-gradient-primary text-white">
//                                 <h5 className="card-title card-header-color font-weight-bold mb-0 float-left mt-1">Create Expense</h5>
//                                 <div className="card-title card-header-color font-weight-bold mb-0 float-right ">
//                                     <Link href={`/Admin/expense/expense_all?page_group`} className="btn btn-sm btn-info">Back to Expense List</Link>
//                                 </div>
//                             </div>
//                             <>
//                                 <form className="form-horizontal" method="post" autoComplete="off">
//                                     {/* Other form fields */}
                                    
//                                     <div className="form-group row student d-flex justify-content-end ">
//                                         <label className="col-form-label col-md-2">
//                                             <strong>Paid Amount:</strong>
//                                         </label>
//                                         <div className="col-md-3">
//                                             <input
//                                                 type="text"
//                                                 className="form-control form-control-sm alpha_space student_id"
//                                                 id="paidAmount"
//                                                 placeholder="Enter Paid Amount"
//                                                 value={paidAmount} // Use the state variable here
//                                                 onChange={handlePaidAmountChange} // Handle input change
//                                             />
//                                             <input
//                                                 type="text"
//                                                 hidden
//                                                 name="paid_amount"
//                                                 className="form-control form-control-sm alpha_space student_id"
//                                                 id="paidAmountHidden"
//                                                 placeholder="Enter Paid Amount"
//                                                 value={paidAmount.toFixed(3)} // Hidden input reflects the same value
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Other form fields */}
//                                 </form>
//                             </>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateExpense;







