'use client'
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const AttendanceCreates = () => {
    const [searchQuery, setSearchQuery] = useState([]);
    const [itemName, setItemName] = useState('');
    const [employee, setEmployee] = useState([]);
    const [filteredDesignations, setFilteredDesignations] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const { data: branchAll = [], isLoading, refetch } = useQuery({
        queryKey: ['branchAll'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/branch/branch_all`);
            const data = await res.json();
            return data;
        }
    });

    const { data: designations = [] } = useQuery({
        queryKey: ['designations'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/designation/designation_all`);
            const data = await res.json();
            return data;
        }
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/employee/employee_all_list`);
            const data = await res.json();
            return data;
        }
    });

    const handleBranchChange = (branchId) => {
        setItemName(branchId);
        setSearchQuery('');
        const filteredDesignations = designations.filter(designation =>
            employees.some(employee =>
                employee.branch_id === parseFloat(branchId) && employee.designation_id === designation.id
            )
        );
        setFilteredDesignations(filteredDesignations);

        const filteredEmployees = employees.filter(employee => employee.branch_id === parseFloat(branchId));
        setFilteredEmployees(filteredEmployees);
    };

    const handleDesignationChange = (designationId) => {
        setSearchQuery(designationId);

        const filteredEmployees = employees.filter(employee =>
            employee.branch_id === parseFloat(itemName) && employee.designation_id === parseFloat(designationId)
        );
        setFilteredEmployees(filteredEmployees);
    };


    console.log(filteredDesignations)
    console.log(filteredEmployees)



    const [searchResults, setSearchResults] = useState([])
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false)


    const news_search = () => {
        setLoading(true);
        if (itemName === '') {
            alert('select a branch')
            // setLoading(false);
            return
        }
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_search`, {
            searchQuery, itemName, employee
        })
            .then(response => {
                setSearchResults(response.data);
                setCheckedItems('')
                setIsCheckedAll('')
                setLateDatetime('')
                setStartDatetime('')
                setWithAbsent('')
                setWithPresent('')
                setError(null);
                setLoading(false);
                if (response.data.results == '') {
                    alert('Nothing found!');
                }

            })
            .catch(error => {
                setError("An error occurred during search.", error);
                setSearchResults([]);
            });
    };




    console.log('Search Results:', searchResults);



    const [startDatetime, setStartDatetime] = useState('');
    const [lateDatetime, setLateDatetime] = useState('');

    const handleTimeChange = (event, setDatetime) => {
        const timeValue = event.target.value;

        // Get the current date
        const currentDate = new Date();
        const [hours, minutes] = timeValue.split(':');
        const formattedDateTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hours,
            minutes
        );

        // Convert to 12-hour time with AM/PM for display
        const displayHours = formattedDateTime.getHours() % 12 || 12;
        const displayMinutes = formattedDateTime.getMinutes().toString().padStart(2, '0');
        const ampm = formattedDateTime.getHours() >= 12 ? 'PM' : 'AM';
        const formattedTime = `${displayHours}:${displayMinutes} ${ampm}`;

        setDatetime({ datetime: formattedDateTime.toISOString(), displayTime: formattedTime });
    };
    console.log(startDatetime)
    console.log(lateDatetime)


    const [userId, setUserId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userId') || '';
        }
        return '';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('userId');
            setUserId(storedUserId);
        }
    }, []);


    const [formData, setFormData] = useState([
        {
            user_id: '',
            created_by: userId,
            attendance_date: '',
            device_id: 'Online',
            checktime: '',
            unique_id: ''

        }
    ])


    const [checkedItems, setCheckedItems] = useState({});
    const [isCheckedAll, setIsCheckedAll] = useState(false);
    const [checkedItemsData, setCheckedItemsData] = useState([]);
    const [unCheckedItemsData, setUnCheckedItemsData] = useState([]);

    const handleCheckChange = (uniqueId) => {
        const updatedCheckedItems = {
            ...checkedItems,
            [uniqueId]: !checkedItems[uniqueId]
        };

        setCheckedItems(updatedCheckedItems);

        // Update the selected and unselected data arrays
        const selectedData = searchResults.filter(item => updatedCheckedItems[item.user_id]);
        const unselectedData = searchResults.filter(item => !updatedCheckedItems[item.user_id]);

        setCheckedItemsData(selectedData);
        setUnCheckedItemsData(unselectedData);
    };

    const handleCheckAllChange = () => {
        const newCheckedStatus = !isCheckedAll;
        const newCheckedItems = {};
        const newCheckedItemsData = [];
        const newUnCheckedItemsData = [];

        if (newCheckedStatus) {
            searchResults.forEach((attendance) => {
                newCheckedItems[attendance.user_id] = true;
                newCheckedItemsData.push(attendance);
            });
        } else {
            searchResults.forEach((attendance) => {
                newUnCheckedItemsData.push(attendance);
            });
        }

        setCheckedItems(newCheckedItems);
        setCheckedItemsData(newCheckedItemsData);
        setUnCheckedItemsData(newUnCheckedItemsData);
        setIsCheckedAll(newCheckedStatus);
    };

    console.log('checkedItems', checkedItems);
    console.log('checkedItemsData', checkedItemsData);
    console.log('unCheckedItemsData', unCheckedItemsData);

    // const [checkedItems, setCheckedItems] = useState({});
    // const [isCheckedAll, setIsCheckedAll] = useState(false);
    // const [checkedItemsData, setCheckedItemsData] = useState([]);


    // const handleCheckChange = (uniqueId) => {
    //     const updatedCheckedItems = {
    //         ...checkedItems,
    //         [uniqueId]: !checkedItems[uniqueId]
    //     };

    //     setCheckedItems(updatedCheckedItems);

    //     // Update the selected data array
    //     const selectedData = searchResults.filter(item => updatedCheckedItems[item.user_id]);
    //     setCheckedItemsData(selectedData);
    // };
    // const handleCheckAllChange = () => {
    //     const newCheckedStatus = !isCheckedAll;
    //     const newCheckedItems = {};
    //     const newCheckedItemsData = [];

    //     if (newCheckedStatus) {
    //         searchResults.forEach((attendance) => {
    //             newCheckedItems[attendance.user_id] = true;
    //             newCheckedItemsData.push(attendance);
    //         });
    //     }

    //     setCheckedItems(newCheckedItems);
    //     setCheckedItemsData(newCheckedItemsData);
    //     setIsCheckedAll(newCheckedStatus);
    // };



    // console.log('checkedItems', checkedItems)
    // console.log('checkedItemsData', checkedItemsData)

    const router = useRouter()
    const user_create = (event) => {
        event.preventDefault();
        const dataToSend = checkedItemsData.flatMap((item) => {
            return [
                {
                    user_id: item.user_id,
                    created_by: userId,
                    attendance_date: fromDate,
                    device_id: 'Online',
                    checktime: startDatetime.datetime,  // Entry Time
                    unique_id: item.unique_id
                },
                {
                    user_id: item.user_id,
                    created_by: userId,
                    attendance_date: fromDate,
                    device_id: 'Online',
                    checktime: lateDatetime.datetime,  // Exit Time
                    unique_id: item.unique_id
                }
            ];
        });

        console.log(dataToSend)

        fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_create`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
            .then((Response) => {
                refetch()
                Response.json();
                console.log(Response);
                if (Response.ok === true) {
                    // caregory_list()
                    if (typeof window !== '') {

                        sessionStorage.setItem("message", "Data saved successfully!");
                    }
                    router.push('/Admin/attendance/attendance_all');
                }
            })
            .then((data) => {
                console.log(data);
                refetch()
            })
            .catch((error) => console.error(error));
    };



    const [fromDate, setFromDate] = useState('');
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return `${day}-${month}-${year}`;
    };
    const handleTextInputClick = () => {
        document.getElementById('dateInputFrom').showPicker();
    };

    const handleDateChangeFrom = (event) => {
        const selectedDate = new Date(event.target.value);
        setFromDate(selectedDate);
    };
    useEffect(() => {
        const currentDate = new Date();
        setFromDate(currentDate);

    }, []);

    const generateOTP = () => {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString();
    };


    const quickApi = '7ae89887eac6055a2b9adc494ca3b902';

    const [withPresent, setWithPresent] = useState(false);
    const [withAbsent, setWithAbsent] = useState(false);


    const sendOtpToAllEmployees = () => {
        if (!withPresent && !withAbsent) {
            console.log('No OTPs will be sent.');
            return;
        }

        checkedItemsData.forEach((employee) => {
            if (withPresent && checkedItems[employee.user_id]) {
                // Send OTP to checked employees if 'With Present' is checked
                const otp = generateOTP();
                axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_otp`, {
                    quick_api: quickApi,
                    mobile: employee.mobile,
                    msg: `You Are Present`,
                })
                    .then(response => {
                        console.log(`OTP sent to ${employee.full_name} (${employee.mobile}):`, response.data);
                    })
                    .catch(error => {
                        console.error(`Failed to send OTP to ${employee.full_name} (${employee.mobile}):`, error);
                    });
            }


        });

        unCheckedItemsData.forEach((employee) => {
            if (withAbsent && !checkedItems[employee.user_id]) {
                // Send OTP to checked employees if 'With Present' is checked
                const otp = generateOTP();
                axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_otp`, {
                    quick_api: quickApi,
                    mobile: employee.mobile,
                    msg: `You Are Absent`,
                })
                    .then(response => {
                        console.log(`OTP sent to ${employee.full_name} (${employee.mobile}):`, response.data);
                    })
                    .catch(error => {
                        console.error(`Failed to send OTP to ${employee.full_name} (${employee.mobile}):`, error);
                    });
            }

        });
    };



    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 p-4">
                    <div className='card mb-4'>
                        <div className="body-content bg-light">
                            <div className="border-primary shadow-sm border-0">
                                <div className="card-header py-1 custom-card-header clearfix bg-gradient-primary text-white">
                                    <h5 className="card-title font-weight-bold mb-0 card-header-color float-left mt-1">Online Attendance</h5>
                                    <div className="card-title font-weight-bold mb-0 card-header-color float-right">
                                        <Link href={`/Admin/attendance/attendance_all?page_group=`} className="btn btn-sm btn-info">Back To Attendance List</Link>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <div className="col-md-10 offset-md-1">
                                            <div className="form-group row student">
                                                <label className="col-form-label col-md-2 font-weight-bold">Branch Name:</label>
                                                <div className="col-md-4">
                                                    <select required="" value={itemName} onChange={(e) => handleBranchChange(e.target.value)} name="branch_id" className="form-control form-control-sm mb-2" id="branch_id">
                                                        <option value=''>Select Branch</option>
                                                        {branchAll.map((branch) => (
                                                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <label className="col-form-label col-md-2 font-weight-bold">Designation Name:</label>
                                                <div className="col-md-4">
                                                    <select required="" value={searchQuery} onChange={(e) => handleDesignationChange(e.target.value)} name="designation_id" className="form-control form-control-sm mb-2" id="designation_id">
                                                        <option value=''>Select Designation</option>
                                                        {filteredDesignations.map((designation) => (
                                                            <option key={designation.id} value={designation.id}>{designation.designation_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group row student">
                                                <label className="col-form-label col-md-2 font-weight-bold">Employee:</label>
                                                <div className="col-md-4">
                                                    <select required="" value={employee} onChange={(e) => setEmployee(e.target.value)} name="employee_id" className="form-control form-control-sm mb-2" id="employee_id">
                                                        <option value=''>Select Employee</option>
                                                        {filteredEmployees.map((employee) => (
                                                            <option key={employee.id} value={employee.user_id}>{employee.full_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="offset-md-2 col-md-6 float-left">
                                                    <input
                                                        onClick={news_search}
                                                        type="button" name="search" className="btn btn-sm btn-info search_btn mr-2" value="Search" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div className="col-md-12 clearfix loading_div text-center" style={{ overflow: 'hidden', display: 'none' }}>
                                        <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                    </div>
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
                    </div>


                        :

                        searchResults?.length > 0 ? (
                            <div className='card'>
                                <div className="body-content bg-light">
                                    <div className="border-primary shadow-sm border-0">
                                        <div className="card-header py-1 custom-card-header clearfix bg-gradient-primary text-white">
                                            <h5 className="card-title font-weight-bold mb-0 card-header-color float-left mt-1">Online Employee Attendance</h5>

                                        </div>

                                        <div class="card-body" >

                                            <form onSubmit={user_create}>
                                                <div className="col-md-10 offset-md-1">
                                                    <div className="form-group row student">
                                                        <label className="col-form-label col-md-2 font-weight-bold">Present Date:</label>
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


                                                        <label className="col-form-label col-md-2 font-weight-bold">Entry Time:</label>
                                                        <div className="col-md-4">
                                                            <input
                                                                type="text"
                                                                readOnly
                                                                value={startDatetime.displayTime}
                                                                name='start_time'
                                                                onClick={() => document.getElementById('dateInput-n1').showPicker()}
                                                                placeholder="HH:MM"
                                                                className="form-control form-control-sm mb-2"
                                                                style={{ display: 'inline-block' }}
                                                            />
                                                            <input
                                                                type="time"
                                                                id="dateInput-n1"
                                                                onChange={(e) => handleTimeChange(e, (datetime) => setStartDatetime(datetime))}
                                                                style={{ position: 'absolute', bottom: '40px', left: '10px', visibility: 'hidden' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group row student">
                                                        <label className="col-form-label col-md-2 font-weight-bold">Exit Time:</label>
                                                        <div className="col-md-4">
                                                            <input
                                                                type="text"
                                                                readOnly
                                                                value={lateDatetime.displayTime}
                                                                name='late_time'
                                                                onClick={() => document.getElementById('dateInput-n2').showPicker()}
                                                                placeholder="HH:MM"
                                                                className="form-control form-control-sm mb-2"
                                                                style={{ display: 'inline-block' }}
                                                            />
                                                            <input
                                                                type="time"
                                                                id="dateInput-n2"
                                                                onChange={(e) => handleTimeChange(e, (datetime) => setLateDatetime(datetime))}
                                                                style={{ position: 'absolute', bottom: '40px', left: '10px', visibility: 'hidden' }}
                                                            />
                                                        </div>


                                                        <div className="form-group grid">
                                                            <div className='d-flex'>
                                                                <label className="col-form-label font-weight-bold col-md-9">With Present Sms:</label>
                                                                <div className="col-md-4 mt-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="withPresentYes"
                                                                        id="withPresentYes"
                                                                        checked={withPresent}
                                                                        onChange={(e) => setWithPresent(e.target.checked)}
                                                                    />
                                                                    <span>Yes</span>
                                                                </div>
                                                            </div>
                                                            <div className='d-flex m-0'>
                                                                <label className="col-form-label font-weight-bold col-md-9">With Absent Sms:</label>
                                                                <div className="col-md-4 mt-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="withFutureYes"
                                                                        id="withFutureYes"
                                                                        checked={withAbsent}
                                                                        onChange={(e) => setWithAbsent(e.target.checked)}
                                                                    />
                                                                    <span>Yes</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="form-group row">

                                                        <div className="offset-md-2 col-md-6 float-left">

                                                            <button onClick={sendOtpToAllEmployees} className="btn btn-sm btn-success">
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="table-responsive">
                                                    <table id='mytable' className="table table-bordered table-hover table-striped table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isCheckedAll}
                                                                        onChange={handleCheckAllChange}
                                                                    />
                                                                </th>
                                                                <th >Employee ID</th>
                                                                <th > ID</th>
                                                                <th >Name</th>
                                                                <th >Designation</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {searchResults.map((attendances, i) => (
                                                                <tr key={i}>
                                                                    <td>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checkedItems[attendances.user_id] || false}
                                                                            onChange={() => handleCheckChange(attendances.user_id)}
                                                                        />
                                                                    </td>
                                                                    <td>{attendances.unique_id}</td>
                                                                    <td>{attendances.user_id}</td>
                                                                    <td>{attendances.full_name}</td>
                                                                    <td>{attendances.designation_name}</td>
                                                                </tr>
                                                            ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ) :
                            <>
                            </>
                    }
                </div>
            </div>
        </div>
    );
};

export default AttendanceCreates;
