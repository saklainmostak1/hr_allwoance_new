'use client'
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, ImageRun, WidthType } from 'docx';

const AttendanceDetail = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [itemName, setItemName] = useState('');
    const [filteredDesignations, setFilteredDesignations] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [month, setMonth] = useState('');
    const [years, setYears] = useState([]);

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    console.log(month)
    console.log(searchQuery)
    const monthLabel = months.find(m => m.value === month)?.label;

    // Construct the final object
    const yearMonth = {
        label: `${monthLabel} ${searchQuery}`,
        value: `${searchQuery}-${month}`
    };

    console.log(yearMonth);


    useEffect(() => {
        const startYear = 2022;
        const currentYear = new Date().getFullYear();
        const yearOptions = [];

        for (let year = startYear; year <= currentYear; year++) {
            yearOptions.push(year);
        }

        setYears(yearOptions);
    }, []);

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

    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);

    const news_search = () => {
        setLoading(true);
        if (itemName === '') {
            alert('select a branch')
            return
        }
        if (searchQuery === '') {
            alert('select a Year')
            return
        }
        if (month === '') {
            alert('select a months')
            return
        }
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_summary_search`, {
            itemName
        })
            .then(response => {
                setSearchResults(response.data);
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

    const buttonStyles = {
        color: '#fff',
        backgroundColor: '#510bc4',
        backgroundImage: 'none',
        borderColor: '#4c0ab8',
    };

    const { data: holidays = [] } = useQuery({
        queryKey: ['holidays'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/yearly_holiday/yearly_holiday_all`)
            const data = await res.json()
            return data
        }
    });

    const { data: leavesDays = [] } = useQuery({
        queryKey: ['leavesDays'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/leave_application/leave_application_all`)
            const data = await res.json()
            return data
        }
    });

    const leaveApproveCount = leavesDays.filter(leave => leave.application_status === 2);

    const { data: leavesDaysApproved = [] } = useQuery({
        queryKey: ['leavesDaysApproved'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/leave_approved/leave_approved_all`)
            const data = await res.json()
            return data
        }
    });


    const { data: attendances = [] } = useQuery({
        queryKey: ['attendances'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_all_list`)
            const data = await res.json()
            return data
        }
    });


    console.log(attendances)

    const { data: leaveAllApproved = [] } = useQuery({
        queryKey: ['leaveAllApproved'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/attendance/attendance_details_list`)
            const data = await res.json()
            return data
        }
    });


    const matchLength = leaveApproveCount.map(emp => {
        const matchCount = leavesDaysApproved.filter(att => att.leave_application_id === emp.id);
        return { user_id: emp.whose_leave, match_length: matchCount };
    });


    console.log(matchLength)


    const [daysInMonth, setDaysInMonth] = useState([]);

    useEffect(() => {
        if (month && searchQuery) {
            const daysInSelectedMonth = new Date(searchQuery, month, 0).getDate();
            const daysArray = Array.from({ length: daysInSelectedMonth }, (_, i) => {
                const day = i + 1;
                return `${searchQuery}-${month}-${day.toString().padStart(2, '0')}`;
            });
            setDaysInMonth(daysArray);
        }
    }, [month, searchQuery]);

    console.log(daysInMonth)

    const filteredAttendances = holidays.filter(att => {
        const startDate = new Date(att.start_date);
        const startMonth = startDate.getMonth() + 1; // Months are zero-based
        const startYear = startDate.getFullYear();
        return startMonth === parseInt(month, 10) && startYear === parseInt(searchQuery, 10);
    });

    console.log(leaveAllApproved)

    const leaveMap = leaveAllApproved.reduce((acc, leave) => {
        if (!acc[leave.whose_leave]) {
            acc[leave.whose_leave] = new Set();
        }
        leave.leave_application_ids.forEach(leaveDate => {
            const dateKey = leaveDate.leave_date.slice(0, 10); // Extract date in YYYY-MM-DD format
            acc[leave.whose_leave].add(dateKey);
        });
        return acc;
    }, {});


    const attendanceLookup = attendances.reduce((acc, item) => {
        const date = item.first_checkin.slice(0, 10); // Format YYYY-MM-DD
        const key = `${item.user_id}-${date}`;
        acc[key] = true; // Mark presence
        return acc;
    }, {});

    console.log(attendanceLookup)



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
                                        <Link href={`/Admin/attendance/attendance_create?page_group=`} className="btn btn-sm btn-info">Back To Attendance Create</Link>
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
                                                <label className="col-form-label col-md-2 font-weight-bold">Year:</label>
                                                <div className="col-md-4">
                                                    <select
                                                        required
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        name="year"
                                                        className="form-control form-control-sm mb-2"
                                                        id="year"
                                                    >
                                                        <option value="">Select Year</option>
                                                        {years.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group row student">
                                                <label className="col-form-label col-md-2 font-weight-bold">Month:</label>
                                                <div className="col-md-4">
                                                    <select required="" value={month} onChange={(e) => setMonth(e.target.value)} name="month" className="form-control form-control-sm mb-2" id="month">
                                                        <option value=''>Select Month</option>
                                                        {months.map((month) => (
                                                            <option key={month.value} value={month.value}>{month.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <div className="offset-md-2 col-md-10 float-left">
                                                    <input
                                                        type="button" name="search" className="btn btn-sm btn-info search_btn mr-2" value="Search" onClick={news_search} />
                                                    <input
                                                        type="button" name="search"
                                                        className="btn btn-sm btn-secondary excel_btn mr-2"
                                                        value="Download Doc" />
                                                    <input
                                                        type='button'
                                                        name="search"
                                                        className="btn btn-sm btn-secondary excel_btn mr-2"
                                                        value="Download Excel" />
                                                    <input
                                                        type="button" name="search" className="btn btn-sm btn-indigo pdf_btn mr-2" style={buttonStyles} value="Download PDF" />
                                                    <input
                                                        type="button" name="search" className="btn btn-sm btn-success print_btn mr-2" value="Print" />
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

                    {loading ? (
                        <div className='text-center'>
                            <div className='text-center text-dark'>
                                <FontAwesomeIcon style={{ height: '33px', width: '33px' }} icon={faSpinner} spin />
                            </div>
                        </div>
                    ) : (
                        searchResults?.length > 0 ? (
                            <div className='card'>
                                <div className="body-content bg-light">
                                    <div className="border-primary shadow-sm border-0">
                                        <div className="card-header py-1 custom-card-header clearfix bg-gradient-primary text-white">
                                            <h5 className="card-title font-weight-bold mb-0 card-header-color float-left mt-1">Employee Attendance List</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table id='mytable' className="table table-bordered table-hover table-striped table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee ID</th>
                                                            <th>Name</th>
                                                            <th>Designation</th>
                                                            {daysInMonth.map((date) => (
                                                                <th key={date} value={date}>{date.slice(8, 10)}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {searchResults.map((attendances, i) => (
                                                            <tr key={i}>
                                                                <td>{attendances.unique_id}</td>
                                                                <td>{attendances.full_name}</td>
                                                                <td>{attendances.designation_name}</td>

                                                                {daysInMonth.map(date => {
                                                                    const day = date.slice(0, 10); // Extract date in YYYY-MM-DD format
                                                                    const isHoliday = filteredAttendances.some(holiday => {
                                                                        const holidayDate = new Date(holiday.start_date);
                                                                        return holidayDate.getDate() === parseInt(date.slice(8, 10), 10);
                                                                    });
                                                                    const hasLeave = leaveMap[attendances.user_id] && leaveMap[attendances.user_id].has(day);

                                                                    let cellContent = '';
                                                                    let cellClass = '';

                                                                    if (hasLeave) {
                                                                        cellContent = 'L';
                                                                        cellClass = 'text-success font-weight-bold'; // Green color for leave
                                                                    } else if (isHoliday) {
                                                                        cellContent = 'H';
                                                                        cellClass = 'text-primary font-weight-bold'; // Blue color for holiday
                                                                    }

                                                                    return (
                                                                        <td key={date} className={cellClass}>
                                                                            {cellContent}
                                                                        </td>
                                                                    );
                                                                })}
                                                                {/* {daysInMonth.map(date => {
                                                                    const day = date.slice(0, 10); // Extract date in YYYY-MM-DD format
                                                                    const isHoliday = filteredAttendances.some(holiday => {
                                                                        const holidayDate = new Date(holiday.start_date);
                                                                        return holidayDate.getDate() === parseInt(date.slice(8, 10), 10);
                                                                    });
                                                                    const hasLeave = leaveMap[attendances.user_id] && leaveMap[attendances.user_id].has(day);

                                                                    const key = `${attendances.user_id}-${day}`;
                                                                    const isPresent = attendanceLookup[key];

                                                                    let cellContent = '';
                                                                    let cellClass = '';

                                                                    if (isPresent) {
                                                                        cellContent = 'P';
                                                                        cellClass = ' font-weight-bold'; // Blue color for Present
                                                                    } else if (hasLeave) {
                                                                        cellContent = 'L';
                                                                        cellClass = 'text-success font-weight-bold'; // Green color for leave
                                                                    } else if (isHoliday) {
                                                                        cellContent = 'H';
                                                                        cellClass = 'text-primary font-weight-bold'; // Blue color for holiday
                                                                    }

                                                                    return (
                                                                        <td key={date} className={cellClass}>
                                                                            {cellContent}
                                                                        </td>
                                                                    );
                                                                })} */}
                                                                {/* {daysInMonth.map(date => {
                                                                    const day = date.slice(0, 10); // Extract date in YYYY-MM-DD format
                                                                    const isHoliday = filteredAttendances.some(holiday => {
                                                                        const holidayDate = new Date(holiday.start_date);
                                                                        return holidayDate.getDate() === parseInt(date.slice(8, 10), 10);
                                                                    });
                                                                    const hasLeave = leaveMap[attendances.user_id] && leaveMap[attendances.user_id].has(day);

                                                                    const key = `${attendances.user_id}-${day}`;
                                                                    const isPresent = attendanceLookup[key];

                                                                    let cellContent = '';
                                                                    let cellClass = '';

                                                                    if (isPresent) {
                                                                        cellContent = 'P';
                                                                        cellClass = 'font-weight-bold'; // Blue color for Present
                                                                    } else if (hasLeave) {
                                                                        cellContent = 'L';
                                                                        cellClass = 'text-success font-weight-bold'; // Green color for leave
                                                                    } else if (isHoliday) {
                                                                        cellContent = 'H';
                                                                        cellClass = 'text-primary font-weight-bold'; // Blue color for holiday
                                                                    } else {
                                                                        cellContent = 'A';
                                                                        cellClass = 'text-danger font-weight-bold'; // Grey color for absent
                                                                    }

                                                                    return (
                                                                        <td key={date} className={cellClass}>
                                                                            {cellContent}
                                                                        </td>
                                                                    );
                                                                })} */}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <></>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceDetail;



{/* {daysInMonth.map(date => {
                                                                    const day = date.slice(8, 10);
                                                                    const isHoliday = filteredAttendances.some(holiday => {
                                                                        const holidayDate = new Date(holiday.start_date);
                                                                        return holidayDate.getDate() === parseInt(day, 10);
                                                                    });
                                                                    return (
                                                                        <td key={date} className='text-primary'>
                                                                            {isHoliday ? 'H' : ''}
                                                                            
                                                                        </td>
                                                                    );
                                                                })} */}
{/* {daysInMonth.map(date => {
                                                                    const day = date.slice(0, 10); // Extract date in YYYY-MM-DD format
                                                                    const isHoliday = filteredAttendances.some(holiday => {
                                                                        const holidayDate = new Date(holiday.start_date);
                                                                        return holidayDate.getDate() === parseInt(date.slice(8, 10), 10);
                                                                    });
                                                                    const hasLeave = leaveMap[attendances.user_id] && leaveMap[attendances.user_id].has(day);
                                                                    return (
                                                                        <td key={date} className='text-danger'>
                                                                            {hasLeave ? 'L' : isHoliday ? 'H' : ''}
                                                                        </td>
                                                                    );
                                                                })} */}
