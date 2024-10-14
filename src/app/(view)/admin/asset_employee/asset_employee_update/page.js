'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';



const AssetEmployeeUpdate = ({ id }) => {

    const [page_group, setPageGroup] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pageGroup') || '';
        }
        return '';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('pageGroup');
            setPageGroup(storedUserId);
        }
    }, []);


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


    const [assetInfo, setAssetInfo] = useState({
        employee_id: '', asset_id: '', note: '', handover_date: '', return_date: '', modified_by: created,
    });



    const { data: assetInfoSingle = [], } = useQuery({
        queryKey: ['assetInfoSingle'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/asset_employee/asset_employee_all/${id}`);
            const data = await res.json();
            // Filter out the brand with id 
            // const filteredBrands = data.filter(brand => brand.id !== parseInt(id));
            return data;
        }
    });


    useEffect(() => {
        setAssetInfo({


            employee_id: assetInfoSingle[0]?.employee_id || '',
            asset_id: assetInfoSingle[0]?.asset_id || '',
            handover_date: assetInfoSingle[0]?.handover_date || '',
            note: assetInfoSingle[0]?.note || '',
            return_date: assetInfoSingle[0]?.return_date || '',
            modified_by: created,

        });

    }, [assetInfoSingle, created]);



    const { data: employeeList = [], } = useQuery({
        queryKey: ['employeeList'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/employee/employee_all_list`);
            const data = await res.json();
            // Filter out the brand with id 
            // const filteredBrands = data.filter(brand => brand.id !== parseInt(id));
            return data;
        }
    });





    const [formattedDisplayDate, setFormattedDisplayDate] = useState('');
    const [fromDate, setFromDate] = useState('');

    const handleDateSelection = (event) => {
        const inputDate = event.target.value; // Directly get the value from the input

        const day = String(inputDate.split('-')[2]).padStart(2, '0'); // Extract day, month, and year from the date string
        const month = String(inputDate.split('-')[1]).padStart(2, '0');
        const year = String(inputDate.split('-')[0]);
        const formattedDate = `${day}-${month}-${year}`;
        const formattedDatabaseDate = `${year}-${month}-${day}`;
        setFromDate(formattedDate);
        setAssetInfo(prevData => ({
            ...prevData,
            handover_date: formattedDatabaseDate // Update the dob field in the state
        }));
    };



    useEffect(() => {
        const dob = assetInfo.handover_date;
        const formattedDate = dob?.split('T')[0];

        if (formattedDate?.includes('-')) {
            const [year, month, day] = formattedDate.split('-');
            setFormattedDisplayDate(`${day}-${month}-${year}`);
        } else {
            console.log("Date format is incorrect:", formattedDate);
        }
    }, [assetInfo]);


    const [formattedDisplayDates, setFormattedDisplayDates] = useState('');
    const [fromDates, setFromDates] = useState('');

    const handleDateSelections = (event) => {
        const inputDate = event.target.value; // Directly get the value from the input

        const day = String(inputDate.split('-')[2]).padStart(2, '0'); // Extract day, month, and year from the date string
        const month = String(inputDate.split('-')[1]).padStart(2, '0');
        const year = String(inputDate.split('-')[0]);
        const formattedDate = `${day}-${month}-${year}`;
        const formattedDatabaseDate = `${year}-${month}-${day}`;
        setFromDates(formattedDate);
        setAssetInfo(prevData => ({
            ...prevData,
            return_date: formattedDatabaseDate // Update the dob field in the state
        }));
    };



    useEffect(() => {
        const dob = assetInfo.return_date;
        const formattedDate = dob?.split('T')[0];

        if (formattedDate?.includes('-')) {
            const [year, month, day] = formattedDate.split('-');
            setFormattedDisplayDates(`${day}-${month}-${year}`);
        } else {
            console.log("Date format is incorrect:", formattedDate);
        }
    }, [assetInfo]);




    const { data: assetType = [], isLoading, refetch } = useQuery({
        queryKey: ['assetType'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/asset_info/asset_info_all`);
            const data = await res.json();
            // Filter out the brand with id 
            // const filteredBrands = data.filter(brand => brand.id !== parseInt(id));
            return data;
        }
    });




    const [brandName, setBrandName] = useState('')
    const [error, setError] = useState([]);

    const brand_input_change = (event) => {
        const name = event.target.name
        const value = event.target.value
        const attribute = { ...assetInfo }
        attribute[name] = value
        setAssetInfo(attribute)
        // setSameBrandName('')

        // const status = attribute['status'];
        // if (status) {
        //     setError(""); // Clear the error message
        // }
        // const brandName = attribute['asset_name']
        // if (!brandName || brandName === '') {
        //     setBrandName('Please enter a brand name.');
        // } else {
        //     setBrandName("");
        // }

    };

    const router = useRouter()

    const employee_asset_create = (e) => {
        e.preventDefault();
        const form = e.target; // Access the form

        // if (!assetInfo.asset_name) {
        //     setBrandName('Please enter a brand name.');
        //     return; // Prevent further execution
        // }

        // if (!assetInfo.status) {
        //     setError('Please select a status.');
        //     return; // Prevent further execution
        // }

        // Retrieve the form's image value

        // Make the fetch request
        fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/asset_employee/asset_employee_edit/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assetInfo)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data) {
                    sessionStorage.setItem("message", "Data Update successfully!");
                    router.push(`/Admin/asset_employee/asset_employee_all?page_group=${page_group}`);
                }
            })
            .catch(error => {
                console.error('Error updating brand:', error);
            });
    };

    console.log(assetInfo)
    return (
        // col-md-12
        // <div class=" body-content bg-light">
        <div class="container-fluid">
            <div class=" row ">

                <div className='col-12 p-4'>
                    <div className='card'>
                        <div class=" border-primary shadow-sm border-0">
                            <div class="card-header py-1  custom-card-header clearfix bg-gradient-primary text-white">
                                <h5 class="card-title font-weight-bold mb-0 card-header-color float-left mt-1">Create Assent Info</h5>
                                <div class="card-title font-weight-bold mb-0 card-header-color float-right">
                                    <Link href={`/Admin/asset_info/asset_info_all?page_group=${page_group}`} class="btn btn-sm btn-info">Back Assent Info List</Link></div>
                            </div>
                            <form action="" onSubmit={employee_asset_create}>
                                <div class="card-body">

                                    <div class="form-group row">
                                        <label class="col-form-label col-md-3"><strong>Employee Name<small><sup><small><i class="text-danger fas fa-star"></i></small></sup></small>:</strong></label>
                                        <div class="col-md-6">
                                            <select
                                                value={assetInfo.employee_id} onChange={brand_input_change}
                                                name='employee_id'

                                                class="form-control form-control-sm " placeholder="Enter Role Name">
                                                <option value=''>Select Asset Type Name</option>
                                                {
                                                    employeeList.map(sta =>
                                                        <>

                                                            <option value={sta.user_id}>{sta.full_name}</option>
                                                        </>

                                                    )
                                                }
                                            </select>
                                            {
                                                error && <p className='text-danger'>{error}</p>
                                            }
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-md-3"><strong>Asset Name<small><sup><small><i class="text-danger fas fa-star"></i></small></sup></small>:</strong></label>
                                        <div class="col-md-6">
                                            <select
                                                value={assetInfo.asset_id} onChange={brand_input_change}
                                                name='asset_id'

                                                class="form-control form-control-sm " placeholder="Enter Role Name">
                                                <option value=''>Select Asset Type Name</option>
                                                {
                                                    assetType.map(sta =>
                                                        <>

                                                            <option value={sta.id}>{sta.asset_name}</option>
                                                        </>

                                                    )
                                                }
                                            </select>
                                            {
                                                error && <p className='text-danger'>{error}</p>
                                            }
                                        </div>
                                    </div>

                                    <div className="form-group row student">
                                        <label className="col-form-label col-md-3 font-weight-bold">Handover Date:</label>
                                        <div className="col-md-6">

                                            <input
                                                type="text"
                                                readOnly

                                                defaultValue={formattedDisplayDate}
                                                onClick={() => document.getElementById(`dateInput-nt`).showPicker()}
                                                placeholder="dd-mm-yyyy"
                                                className="form-control form-control-sm mb-2"
                                                style={{ display: 'inline-block', }}
                                            />
                                            <input
                                                name='handover_date'
                                                type="date"
                                                id={`dateInput-nt`}
                                                onChange={(e) => handleDateSelection(e)}
                                                style={{ position: 'absolute', bottom: '40px', left: '10px', visibility: 'hidden' }}

                                            />
                                        </div>


                                    </div>



                                    <div className="form-group row student">
                                        <label className="col-form-label col-md-3 font-weight-bold">Return Date:</label>
                                        <div className="col-md-6">

                                            <input
                                                type="text"
                                                readOnly

                                                defaultValue={formattedDisplayDates}
                                                onClick={() => document.getElementById(`dateInput-nt1`).showPicker()}
                                                placeholder="dd-mm-yyyy"
                                                className="form-control form-control-sm mb-2"
                                                style={{ display: 'inline-block', }}
                                            />
                                            <input
                                                name='return_date'
                                                type="date"
                                                id={`dateInput-nt1`}
                                                onChange={(e) => handleDateSelections(e)}
                                                style={{ position: 'absolute', bottom: '40px', left: '10px', visibility: 'hidden' }}

                                            />
                                        </div>


                                    </div>




                                    <div class="form-group row">
                                        <label class="col-form-label col-md-3"><strong>Description:</strong></label>
                                        <div className='form-group col-md-6'>

                                            <textarea
                                                value={assetInfo.note} onChange={brand_input_change}
                                                name="note"
                                                className="form-control form-control-sm"
                                                placeholder="Enter note"
                                                rows={5}
                                                cols={73}
                                                // style={{ width: '550px', height: '100px' }}
                                                maxLength={500}
                                            ></textarea>
                                            <small className="text-muted">{assetInfo.note.length} / 500</small>
                                        </div>
                                    </div>

                                    <div className="form-group row">
                                        <div className="offset-md-3 col-sm-6">

                                            <input type="submit" name="create" className="btn btn-success btn-sm" value="Submit" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetEmployeeUpdate;
