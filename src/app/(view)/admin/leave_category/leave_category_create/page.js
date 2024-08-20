"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LeaveCategoryCreate = () => {
  const created_by = localStorage.getItem("userId");

  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    created_by: created_by,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const user_create = (event) => {
    event.preventDefault();

    const schoolShift = {
      ...formData,
      created_by,
    };

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/leave_category/leave_category_create`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(schoolShift),
      }
    )
      .then((Response) => {
        Response.json();
        console.log(Response);
        if (Response.ok === true) {
          sessionStorage.setItem("message", "Data saved successfully!");
          router.push("/Admin/leave_category/leave_category_all");
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error(error));
  };

  //   const [status, setStatus] = useState([])

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/status/all_status`)
  //   .then(res => res.json())
  //   .then(data => setStatus(data))
  // }, [])

  return (
    <div class="container-fluid">
      <div class=" row ">
        <div className="col-12 p-4">
          <div className="card">
            <div className="card-default">
              <div className="card-header custom-card-header py-1  clearfix bg-gradient-primary text-white">
                <h5 className="card-title card-header-period font-weight-bold mb-0  float-left mt-1">
                  Create Leave Category{" "}
                </h5>
                <div className="card-title card-header-period font-weight-bold mb-0  float-right ">
                  <Link
                    href="/Admin/leave_category/leave_category_all"
                    className="btn btn-sm btn-info"
                  >
                    Back to Leave Category List
                  </Link>
                </div>
              </div>

              <div
                className="alert alert-warning mb-0 mx-4 mt-4 text-danger font-weight-bold"
                role="alert"
              >
                (
                <small>
                  <sup>
                    <i className="text-danger fas fa-star"></i>
                  </sup>
                </small>
                ) field required
              </div>
              <div className="card-body">
                <form
                  className="form-horizontal"
                  method="post"
                  autoComplete="off"
                  onSubmit={user_create}
                >
                  <div class="form-group row">
                    <label class="col-form-label font-weight-bold col-md-3">
                      Leave Category Name:
                      <small>
                        <sup>
                          <small>
                            <i class="text-danger fas fa-star"></i>
                          </small>
                        </sup>
                      </small>
                    </label>
                    <div class="col-md-6">
                      <input
                        required=""
                        onChange={handleChange}
                        class="form-control form-control-sm required"
                        id="title"
                        placeholder="Enter Leave Category Name"
                        type="text"
                        name="name"
                      />
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="offset-md-3 col-sm-6">
                      <input
                        type="submit"
                        name="create"
                        className="btn btn-success btn-sm"
                        value="Submit"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCategoryCreate;
