// "use client";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";

// const PhotoGalleryCategoryCreate = () => {
//   const created_by = localStorage.getItem("userId");

//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     name: "",
//     status: "",
//     created_by: created_by,
//   });

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const user_create = (event) => {
//     event.preventDefault();

//     const schoolShift = {
//       ...formData,
//       created_by,
//     };

//     fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/events_category/events_category_create`,
//       {
//         method: "POST",
//         headers: {
//           "content-type": "application/json",
//         },
//         body: JSON.stringify(schoolShift),
//       }
//     )
//       .then((Response) => {
//         Response.json();
//         console.log(Response);
//         if (Response.ok === true) {
//           sessionStorage.setItem("message", "Data saved successfully!");
//           router.push("/Admin/events_category/events_category_all");
//         }
//       })
//       .then((data) => {
//         console.log(data);
//       })
//       .catch((error) => console.error(error));
//   };

//   return (
//     <div class="container-fluid">
//       <div class=" row ">
//         <div className="col-12 p-4">
//           <div className="card">
//             <div className="card-default">
//               <div className="card-header custom-card-header py-1  clearfix bg-gradient-primary text-white">
//                 <h5 className="card-title card-header-period font-weight-bold mb-0  float-left mt-1">
//                   Create Events Category{" "}
//                 </h5>
//                 <div className="card-title card-header-period font-weight-bold mb-0  float-right ">
//                   <Link
//                     href="/Admin/events_category/events_category_all"
//                     className="btn btn-sm btn-info"
//                   >
//                     Back to Events Category List
//                   </Link>
//                 </div>
//               </div>

//               <div
//                 className="alert alert-warning mb-0 mx-4 mt-4 text-danger font-weight-bold"
//                 role="alert"
//               >
//                 (
//                 <small>
//                   <sup>
//                     <i className="text-danger fas fa-star"></i>
//                   </sup>
//                 </small>
//                 ) field required
//               </div>
//               <div className="card-body">
//                 <form
//                   className="form-horizontal"
//                   method="post"
//                   autoComplete="off"
//                   onSubmit={user_create}
//                 >
//                   <div class="form-group row">
//                     <label class="col-form-label font-weight-bold col-md-3">
//                       Name:
//                       <small>
//                         <sup>
//                           <small>
//                             <i class="text-danger fas fa-star"></i>
//                           </small>
//                         </sup>
//                       </small>
//                     </label>
//                     <div class="col-md-6">
//                       <input
//                         required=""
//                         onChange={handleChange}
//                         value={formData.name}
//                         class="form-control form-control-sm required"
//                         id="title"
//                         placeholder="Enter Name"
//                         type="text"
//                         name="name"
//                       />
//                     </div>
//                   </div>

//                   <div class="form-group row">
//                     <label class="col-form-label font-weight-bold col-md-3">
//                       Status:
//                       <small>
//                         <sup>
//                           <small>
//                             <i class="text-danger fas fa-star"></i>
//                           </small>
//                         </sup>
//                       </small>
//                     </label>
//                     <div class="col-md-6">
//                       <select
//                         onChange={handleChange}
//                         value={formData.status}
//                         name="status"
//                         id="status"
//                         class="form-control form-control-sm required"
//                         placeholder="Enter Status"
//                       >
//                         <option>Select Status</option>
//                         <option value="1">Active</option>
//                         <option value="2">Inactive</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="form-group row">
//                     <div className="offset-md-3 col-sm-6">
//                       <input
//                         type="submit"
//                         name="create"
//                         className="btn btn-success btn-sm"
//                         value="Submit"
//                       />
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PhotoGalleryCategoryCreate

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const PhotoGalleryCategoryCreate = () => {

  const [status, setStatus] = useState([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}:5002/status/all_status`)
    .then(res => res.json())
    .then(data => setStatus(data))
  }, [])

  console.log(status)


  const created_by = localStorage.getItem("userId");
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    status: "",
    created_by,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const { data: noticeCategoryAll = [] } = useQuery({
    queryKey: ["noticeCategoryAll"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/events_category/events_category_all`
      );
      const data = await res.json();
      return data;
    },
  });

  const user_create = async (e) => {
    e.preventDefault();

    // // Check for exact duplicate gender names
    // const duplicate = noticeCategoryAll.some(
    //   (existingGender) =>
    //     existingGender.name.trim().replace(/\s+/g, "").toLowerCase() ===
    //     formData.name.trim().replace(/\s+/g, "").toLowerCase()
    // );

    // if (duplicate) {
    //   setErrorMessage(
    //     "Notice category name already exists. Please choose a different name."
    //   );
    //   return;
    // }

    const normalizedInputName = formData.name
      .trim()

      .toLowerCase();

    const duplicate = noticeCategoryAll.some(
      (existingCategory) =>
        existingCategory.name.trim().toLowerCase() === normalizedInputName
    )
      ? "Events category name already exists. Please choose a different name."
      : "";

    if (duplicate) {
      setErrorMessage(duplicate);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/events_category/events_category_create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data) {
        sessionStorage.setItem("message", "Data saved successfully!");
        router.push("/Admin/events_category/events_category_all");
      } else {
        console.error("Error creating gender:", data);
      }
    } catch (error) {
      console.error("Error creating gender:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 p-4">
          <div className="card">
            <div className="card-default">
              <div className="card-header custom-card-header py-1 clearfix bg-gradient-primary text-white">
                <h5 className="card-title card-header-period font-weight-bold mb-0 float-left mt-1">
                  Events Category Create
                </h5>
                <div className="card-title card-header-period font-weight-bold mb-0 float-right">
                  <Link
                    href="/Admin/events_category/events_category_all"
                    className="btn btn-sm btn-info"
                  >
                    Back to Events Category List
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
                  <div className="form-group row">
                    <label className="col-form-label font-weight-bold col-md-3">
                      Name:
                      <small>
                        <sup>
                          <small>
                            <i className="text-danger fas fa-star"></i>
                          </small>
                        </sup>
                      </small>
                    </label>
                    <div className="col-md-6">
                      <input
                        required
                        onChange={handleChange}
                        className={`form-control form-control-sm required ${
                          errorMessage ? "is-invalid" : ""
                        }`}
                        id="name"
                        placeholder="Enter Events Category Name"
                        type="text"
                        name="name"
                        value={formData.name}
                      />
                      {errorMessage && (
                        <div className="invalid-feedback">{errorMessage}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group row">
                    <label className="col-form-label font-weight-bold col-md-3">
                      {" "}
                      Status:
                      <small>
                        <sup>
                          <small>
                            <i className="text-danger fas fa-star"></i>
                          </small>
                        </sup>
                      </small>
                    </label>
                    <div className="col-md-6">
                      <select
                        onChange={handleChange}
                        value={formData.status}
                        name="status"
                        id="status"
                        className="form-control form-control-sm required"
                        placeholder="Enter Status"
                      >
                        <option>Select Status</option>
                        {
                          status.map(sta =>

                            <>
                            <option value={sta.id}>{sta.status_name}</option>
                            </>
                          )
                        }
                      </select>
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

export default PhotoGalleryCategoryCreate;
