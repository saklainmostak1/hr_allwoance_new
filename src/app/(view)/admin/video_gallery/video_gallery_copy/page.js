"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import RichTextEditor from "react-rte";

const CopyVideoGallery = ({ id }) => {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    status: "",
    video_category: "",
    description: "",

    created_by: localStorage.getItem("userId"),
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [value, setValue] = useState(RichTextEditor.createEmptyValue());
  const [videogallerySingle, setvideogallerySingle] = useState([]);
  const handlDes = (value) => {
    setValue(value);
    setFormData((prevData) => ({
      ...prevData,
      description: value.toString("html"),
    }));
  };

  useEffect(() => {
    setFormData({
      title: videogallerySingle[0]?.title || "",
      link: videogallerySingle[0]?.link || "",
      status: videogallerySingle[0]?.status || "",
      video_category: videogallerySingle[0]?.video_category || "",
      description: videogallerySingle[0]?.description || "",
    });
  }, [videogallerySingle]);

  const {
    data: videoSingle,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["videoSingle", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/video_gallery/video_gallery_all/${id}`
      );
      const data = await res.json();
      return data;
    },
  });

  useEffect(() => {
    if (videoSingle && videoSingle[0]) {
      const { title, link, status, description, video_category } =
        videoSingle[0];

      setFormData({
        title,
        link,
        status,
        description,
        video_category,
      });

      setValue(RichTextEditor.createValueFromString(description, "html"));
    }
  }, [videoSingle]);

  console.log(videoSingle);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    const attribute = { ...formData };
    attribute[name] = value;
    setFormData(attribute);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}:5002/Admin/video_gallery/video_gallery_create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      console.log(data); // Handle response data or success message
    } catch (error) {
      console.error("Error updating school shift:", error);
      // Handle error or show an error message to the user
    }
  };
  console.log(videoSingle);
  return (
    <div class="container-fluid">
      <div class=" row ">
        <div className="col-12 p-4">
          <div className="card">
            <div className="card-default">
              <div className="card-header custom-card-header py-1  clearfix bg-gradient-primary text-white">
                <h5 className="card-title card-header-period font-weight-bold mb-0  float-left mt-1">
                  Edit Video Gallery
                </h5>
                <div className="card-title card-header-period font-weight-bold mb-0  float-right ">
                  <Link
                    href="/Admin/video_gallery/video_gallery_all"
                    className="btn btn-sm btn-info"
                  >
                    Back to Video Gallery List
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
                  onSubmit={handleSubmit}
                >
                  <div class="form-group row">
                    <label class="col-form-label font-weight-bold col-md-3">
                      Title:
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
                        value={formData.title}
                        class="form-control form-control-sm required"
                        id="title"
                        placeholder="Enter Title"
                        type="text"
                        name="title"
                      />
                    </div>
                  </div>

                  <div className="form-group row">
                    <label className="col-form-label font-weight-bold col-md-3">
                      Video Category:
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
                        value={formData.video_category}
                        name="video_category"
                        id="video_category"
                        className="form-control form-control-sm required"
                        placeholder="Select Video Category"
                      >
                        <option value="">Select Video Category</option>
                        <option value="1">Academic Notice</option>
                        <option value="2">Administrative Notice</option>
                        <option value="3">All</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-form-label font-weight-bold col-md-3">
                      Link:
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
                        value={formData.link}
                        onChange={handleChange}
                        className="form-control form-control-sm required"
                        id="link"
                        placeholder="Enter Link"
                        type="text"
                        name="link"
                      />
                      {errorMessage && (
                        <p className="text-danger">{errorMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group row">
                    <label className="col-form-label font-weight-bold col-md-3">
                      Description:
                      <small>
                        <sup>
                          <small>
                            <i className="text-danger fas fa-star"></i>
                          </small>
                        </sup>
                      </small>
                    </label>
                    <div className="col-md-6">
                      <RichTextEditor
                        name="description"
                        value={value}
                        onChange={handlDes}
                        placeholder="Enter Video Description"
                        required
                      />
                    </div>
                  </div>

                  <div class="form-group row">
                    <label class="col-form-label font-weight-bold col-md-3">
                      Status:
                      <small>
                        <sup>
                          <small>
                            <i class="text-danger fas fa-star"></i>
                          </small>
                        </sup>
                      </small>
                    </label>
                    <div class="col-md-6">
                      <select
                        onChange={handleChange}
                        value={formData.status}
                        name="status"
                        id="status"
                        class="form-control form-control-sm required"
                        placeholder="Enter Status"
                      >
                        <option>Select Status</option>
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
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

export default CopyVideoGallery;
