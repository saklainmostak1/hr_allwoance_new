'use client'
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React from 'react';

const SmsApiViews = ({ id }) => {


    const { data: allSmsApiList = [] } = useQuery({
        queryKey: ['allSmsApiList'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/sms_api/sms_api_all/${id}`);
            return res.json();
        }
    });

    console.log(allSmsApiList)

    return (
        <div className="container-fluid">
            <div className="row">
                <div class="col-md-12 body-content  bg-light p-4">
                    <div class="card border-primary shadow-sm border-0">
                        <div class="card border-primary shadow-sm border-0">
                            <div class="card-header custom-card-header  py-1 clearfix bg-gradient-primary text-white">
                                <h5 class="card-title card-header-color font-weight-bold mb-0  float-left mt-1">SMS Api Details </h5>
                                <div class="card-title card-header-color font-weight-bold mb-0  float-right">
                                    <Link href="/Admin/sms_api/sms_api_all" class="btn btn-sm btn-info">Back to Sms api List</Link>				</div>
                            </div>
                            <div class="card-body">
                                <div class="form-group row m-0">
                                    <label class="col-form-label col-md-3 font-weight-bold">Api Name:</label>
                                    <div className="col-md-9">
                                        <p>{allSmsApiList[0]?.api_name}</p>
                                    </div>
                                </div>
                                <div class="form-group row m-0">
                                    <label class="col-form-label col-md-3 font-weight-bold">URL:</label>
                                    <div className="col-md-9 m-0">
                                        <p>{allSmsApiList[0]?.main_url}</p>
                                    </div>
                                </div>
                                <div class="form-group row m-0">
                                    <label class="col-form-label col-md-3 font-weight-bold">Api URL:</label>
                                    <div className="col-md-9 m-0">
                                        <p>{allSmsApiList[0]?.api_url}</p>
                                    </div>
                                </div>
                                <div class="form-group row m-0">
                                    <label class="col-form-label col-md-3 font-weight-bold">Balance URL:</label>
                                    <div className="col-md-9">
                                        <p>{allSmsApiList[0]?.balance_url}</p>
                                    </div>
                                </div>
                              

                            </div>

                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Sms Rate</th>
                                                <th>Api Status</th>
                                                {/* <th></th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{allSmsApiList[0]?.balance_rate}</td>
                                                <td>{allSmsApiList[0]?.status}</td>
                                                {/* <td></td> */}
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Api Param Key</th>
                                                <th>Api Param Value</th>
                                                <th>Options</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allSmsApiList[0]?.sms_api_params?.map(param => (
                                                <tr key={param.id}>
                                                    <td>{param.sms_key}</td>
                                                    <td>{param.sms_value}</td>
                                                    <td>  {param.options === 1 ? 'Number' : param.options === 2 ? 'Message' : ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default SmsApiViews;